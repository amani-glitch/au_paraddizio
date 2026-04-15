import { col } from "@/lib/firestore";
import { listOrders } from "@/lib/db/orders";
import { listUsers } from "@/lib/db/users";

export interface ClientAggregate {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  avgBasket: number;
  firstOrder: string | null;
  lastOrder: string | null;
  segment: "VIP" | "regular" | "new" | "inactive";
  loyaltyPoints: number;
}

function classify(orders: number, totalSpent: number): ClientAggregate["segment"] {
  if (orders === 0) return "inactive";
  if (totalSpent >= 300 || orders >= 10) return "VIP";
  if (orders <= 2) return "new";
  return "regular";
}

export async function getClientsWithStats(): Promise<ClientAggregate[]> {
  const users = await listUsers();
  const customers = users.filter((u) => u.role === "CUSTOMER");

  const ordersSnap = await col.orders.get();
  const ordersByUser: Record<string, { total: number; count: number; first: string; last: string }> = {};

  for (const doc of ordersSnap.docs) {
    const o = doc.data();
    if (!o.userId) continue;
    if (!ordersByUser[o.userId]) {
      ordersByUser[o.userId] = { total: 0, count: 0, first: o.createdAt, last: o.createdAt };
    }
    ordersByUser[o.userId].total += o.total ?? 0;
    ordersByUser[o.userId].count += 1;
    if (o.createdAt < ordersByUser[o.userId].first) ordersByUser[o.userId].first = o.createdAt;
    if (o.createdAt > ordersByUser[o.userId].last) ordersByUser[o.userId].last = o.createdAt;
  }

  return customers.map((u) => {
    const stats = ordersByUser[u.id];
    const orders = stats?.count ?? 0;
    const totalSpent = Math.round((stats?.total ?? 0) * 100) / 100;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      orders,
      totalSpent,
      avgBasket: orders > 0 ? Math.round((totalSpent / orders) * 100) / 100 : 0,
      firstOrder: stats?.first ?? null,
      lastOrder: stats?.last ?? null,
      segment: classify(orders, totalSpent),
      loyaltyPoints: u.loyaltyPoints,
    };
  });
}
