import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createOrder } from "@/lib/db/orders";
import { getSession } from "@/lib/auth";
import { addLoyaltyPoints } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      mode,
      deliveryAddress,
      customerInfo,
      paymentMethod,
      promoCode,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Au moins un article requis" }, { status: 400 });
    }

    if (!mode || !["DELIVERY", "TAKEAWAY", "DINE_IN"].includes(mode)) {
      return NextResponse.json({ error: "Mode de commande invalide" }, { status: 400 });
    }

    if (!customerInfo?.name || !customerInfo?.phone) {
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 });
    }

    const session = await getSession();

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { totalPrice?: number; unitPrice?: number; quantity?: number }) =>
        sum + (item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1)),
      0
    );
    const deliveryFee = mode === "DELIVERY" ? 3 : 0;
    let discount = 0;
    if (promoCode) {
      const code = String(promoCode).toUpperCase();
      if (code === "BIENVENUE") discount = subtotal * 0.1;
      else if (code === "PIZZA10") discount = Math.min(10, subtotal);
      else if (code === "LIVRAISON") discount = deliveryFee;
    }
    const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;

    // Create the order in Firestore first (PENDING payment)
    const order = await createOrder({
      userId: session?.userId ?? null,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email ?? null,
      mode,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      discount: Math.round(discount * 100) / 100,
      total,
      promoCode: promoCode ?? null,
      deliveryAddress: deliveryAddress
        ? typeof deliveryAddress === "string"
          ? deliveryAddress
          : JSON.stringify(deliveryAddress)
        : null,
      paymentMethod: paymentMethod ?? "card",
      notes: notes ?? null,
      items: items.map((it: {
        productId?: string;
        product?: { id: string; name: string };
        productName?: string;
        size?: { name?: string; price?: number };
        sizeName?: string;
        sizePrice?: number;
        quantity: number;
        supplements?: { name: string; price: number }[];
        removedIngredients?: string[];
        specialInstructions?: string;
        unitPrice: number;
        totalPrice: number;
      }) => ({
        productId: it.productId ?? it.product?.id ?? "",
        productName: it.productName ?? it.product?.name ?? "",
        sizeName: it.sizeName ?? it.size?.name ?? "",
        sizePrice: it.sizePrice ?? it.size?.price ?? 0,
        quantity: it.quantity,
        supplements: it.supplements ?? [],
        removedIngredients: it.removedIngredients ?? [],
        specialInstructions: it.specialInstructions ?? "",
        unitPrice: it.unitPrice ?? 0,
        totalPrice: it.totalPrice ?? 0,
      })),
    });

    // For cash payments, on-site, or when Stripe is not configured
    const stripe = getStripe();
    if (paymentMethod === "cash" || paymentMethod === "on_site" || !stripe) {
      if (session?.userId) {
        const pointsEarned = Math.floor(total);
        await addLoyaltyPoints(session.userId, pointsEarned);
      }

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        paymentMethod,
        message: !stripe && paymentMethod === "card"
          ? "Commande confirmée. Le paiement par carte sera disponible prochainement."
          : paymentMethod === "cash"
            ? "Commande confirmée. Paiement en espèces à la réception."
            : "Commande confirmée. Paiement sur place.",
      });
    }

    // For card payments, create Stripe Checkout Session
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const lineItems = items.map(
      (item: { productName?: string; product?: { name: string }; sizeName?: string; quantity: number; totalPrice: number }) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.productName || item.product?.name || "Article"}${item.sizeName ? ` (${item.sizeName})` : ""}`,
          },
          unit_amount: Math.round((item.totalPrice / item.quantity) * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add delivery fee as a line item
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

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/suivi/${order.orderNumber}?payment=success`,
      cancel_url: `${origin}/commander?payment=cancelled`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session?.userId ?? "",
      },
      customer_email: customerInfo.email || undefined,
    };

    // Apply discount as a coupon
    if (discount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "eur",
        duration: "once",
        name: promoCode ? `Code promo: ${promoCode}` : "Réduction",
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du paiement" },
      { status: 500 }
    );
  }
}
