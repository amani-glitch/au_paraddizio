import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db/orders";
import { getStripe } from "@/lib/stripe";

interface BotOrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BotOrderRequest {
  items: BotOrderItem[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  mode: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  address?: string;
  total: number;
  paymentMethod: "card" | "cash";
}

export async function POST(request: NextRequest) {
  try {
    const body: BotOrderRequest = await request.json();
    const { items, customerName, customerPhone, customerEmail, mode, address, total, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Aucun article dans la commande" }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 });
    }

    const deliveryFee = mode === "DELIVERY" ? (total >= 25 ? 0 : 3) : 0;
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const orderTotal = Math.round((subtotal + deliveryFee) * 100) / 100;

    // Create order in Firestore
    const order = await createOrder({
      userId: null,
      customerName,
      customerPhone,
      customerEmail: customerEmail ?? null,
      mode,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      discount: 0,
      total: orderTotal,
      promoCode: null,
      deliveryAddress: address ?? null,
      paymentMethod,
      notes: "Commande passée via le bot IA",
      items: items.map((item) => ({
        productId: item.name.toLowerCase().replace(/\s/g, "-"),
        productName: item.name,
        sizeName: item.size,
        sizePrice: item.unitPrice,
        quantity: item.quantity,
        supplements: [],
        removedIngredients: [],
        specialInstructions: "",
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    });

    // For card payments, create Stripe payment link (if Stripe is configured)
    const stripe = getStripe();
    if (paymentMethod === "card" && stripe) {
      const origin = request.headers.get("origin") || "http://localhost:3000";

      const lineItems = items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.name}${item.size ? ` (${item.size})` : ""}`,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      }));

      if (deliveryFee > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Frais de livraison" },
            unit_amount: Math.round(deliveryFee * 100),
          },
          quantity: 1,
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        success_url: `${origin}/suivi/${order.orderNumber}?payment=success`,
        cancel_url: `${origin}/bot?payment=cancelled`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          source: "bot",
        },
        customer_email: customerEmail || undefined,
      });

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        checkoutUrl: checkoutSession.url,
        message: "Commande créée ! Cliquez sur le lien pour payer par carte.",
      });
    }

    // Cash payment or Stripe not configured
    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message: `Commande #${order.orderNumber} confirmée ! Paiement en espèces à la réception.`,
    });
  } catch (error) {
    console.error("Bot order error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}
