import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/db/orders";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const orders = await listOrders();

    // Transform to match admin dashboard format
    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      mode: o.mode,
      status: o.status,
      items: (o.items ?? []).map((item) => ({
        name: item.productName,
        size: item.sizeName ?? "",
        qty: item.quantity,
        price: item.unitPrice,
      })),
      total: o.total,
      address: o.deliveryAddress ?? undefined,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod ?? "card",
      paymentStatus: o.paymentStatus,
      notes: o.notes,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
