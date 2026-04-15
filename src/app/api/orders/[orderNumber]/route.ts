import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber, updateOrderStatus, type OrderStatus } from "@/lib/db/orders";
import { getSession, isAdmin } from "@/lib/auth";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[orderNumber] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { orderNumber } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    await updateOrderStatus(order.id, status);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("PATCH /api/orders/[orderNumber] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
