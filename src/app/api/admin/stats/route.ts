import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getOrdersStats, getTopProducts, listOrders } from "@/lib/db/orders";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const [stats, topProducts, recentOrders] = await Promise.all([
      getOrdersStats(),
      getTopProducts(5),
      listOrders({ limit: 10 }),
    ]);

    return NextResponse.json({
      stats,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
