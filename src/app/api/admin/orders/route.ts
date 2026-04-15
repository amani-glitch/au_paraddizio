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
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
