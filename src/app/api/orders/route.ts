import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db/orders";
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

    // Get optional session
    const session = await getSession();

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
      paymentMethod,
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
        sizeName: it.sizeName ?? it.size?.name,
        sizePrice: it.sizePrice ?? it.size?.price,
        quantity: it.quantity,
        supplements: it.supplements ?? [],
        removedIngredients: it.removedIngredients ?? [],
        specialInstructions: it.specialInstructions ?? "",
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
    });

    // Award loyalty points for authenticated users
    if (session?.userId) {
      const pointsEarned = Math.floor(total);
      await addLoyaltyPoints(session.userId, pointsEarned);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? undefined;
    const session = await getSession();

    // If not admin, only show own orders
    const isAdminUser = session?.role === "ADMIN" || session?.role === "MANAGER";
    if (!isAdminUser && !userId && !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orders = await listOrders({
      userId: isAdminUser ? userId : session?.userId,
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
