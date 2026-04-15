import { col } from "@/lib/firestore";
import { FieldValue } from "@google-cloud/firestore";
import { generateOrderNumber } from "@/lib/utils";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED";

export type OrderMode = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export interface OrderItemDoc {
  productId: string;
  productName: string;
  sizeName?: string;
  sizePrice?: number;
  quantity: number;
  supplements?: { name: string; price: number }[];
  removedIngredients?: string[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDoc {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  status: OrderStatus;
  mode: OrderMode;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string | null;
  deliveryAddress?: string | null;
  scheduledAt?: string | null;
  notes?: string | null;
  paymentMethod?: string;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  items: OrderItemDoc[];
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  data: Omit<OrderDoc, "id" | "orderNumber" | "createdAt" | "updatedAt" | "status" | "paymentStatus"> & {
    status?: OrderStatus;
    paymentStatus?: OrderDoc["paymentStatus"];
  }
): Promise<OrderDoc> {
  const now = new Date().toISOString();
  const orderNumber = generateOrderNumber();
  const orderData = {
    orderNumber,
    status: (data.status ?? "PENDING") as OrderStatus,
    paymentStatus: data.paymentStatus ?? "PENDING",
    userId: data.userId ?? null,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail ?? null,
    mode: data.mode,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    discount: data.discount,
    total: data.total,
    promoCode: data.promoCode ?? null,
    deliveryAddress: data.deliveryAddress ?? null,
    scheduledAt: data.scheduledAt ?? null,
    notes: data.notes ?? null,
    paymentMethod: data.paymentMethod ?? null,
    items: data.items,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col.orders.add(orderData);
  return { id: ref.id, ...orderData } as OrderDoc;
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderDoc | null> {
  const snap = await col.orders.where("orderNumber", "==", orderNumber).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as OrderDoc;
}

export async function getOrderById(id: string): Promise<OrderDoc | null> {
  const doc = await col.orders.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as OrderDoc;
}

export async function listOrders(options?: {
  userId?: string;
  status?: OrderStatus;
  limit?: number;
}): Promise<OrderDoc[]> {
  let query = col.orders.orderBy("createdAt", "desc") as FirebaseFirestore.Query;
  if (options?.userId) query = query.where("userId", "==", options.userId);
  if (options?.status) query = query.where("status", "==", options.status);
  if (options?.limit) query = query.limit(options.limit);
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrderDoc));
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  await col.orders.doc(id).update({
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function countOrdersByStatus(status: OrderStatus): Promise<number> {
  const snap = await col.orders.where("status", "==", status).count().get();
  return snap.data().count;
}

export async function getOrdersStats(): Promise<{
  todayRevenue: number;
  todayOrders: number;
  avgBasket: number;
  totalOrders: number;
  totalRevenue: number;
  byMode: { DELIVERY: number; TAKEAWAY: number; DINE_IN: number };
  byStatus: Record<string, number>;
  weeklyRevenue: number[];
  weeklyLabels: string[];
}> {
  const allSnap = await col.orders.orderBy("createdAt", "desc").get();
  const allOrders = allSnap.docs.map((d) => d.data() as OrderDoc);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const todayOrders = allOrders.filter((o) => o.createdAt >= todayIso);
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total ?? 0), 0);

  const totalRevenue = allOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgBasket = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  const byMode = { DELIVERY: 0, TAKEAWAY: 0, DINE_IN: 0 };
  const byStatus: Record<string, number> = {};
  for (const o of allOrders) {
    byMode[o.mode] = (byMode[o.mode] ?? 0) + 1;
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  // Weekly revenue (last 7 days)
  const weeklyRevenue: number[] = [];
  const weeklyLabels: string[] = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const revenue = allOrders
      .filter((o) => o.createdAt >= start.toISOString() && o.createdAt < end.toISOString())
      .reduce((s, o) => s + (o.total ?? 0), 0);
    weeklyRevenue.push(Math.round(revenue * 100) / 100);
    weeklyLabels.push(dayNames[start.getDay()]);
  }

  return {
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    todayOrders: todayOrders.length,
    avgBasket: Math.round(avgBasket * 100) / 100,
    totalOrders: allOrders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    byMode,
    byStatus,
    weeklyRevenue,
    weeklyLabels,
  };
}

export async function getTopProducts(limit = 5): Promise<
  { name: string; sold: number; revenue: number }[]
> {
  const snap = await col.orders.get();
  const productStats: Record<string, { name: string; sold: number; revenue: number }> = {};
  for (const doc of snap.docs) {
    const order = doc.data() as OrderDoc;
    for (const item of order.items ?? []) {
      if (!productStats[item.productName]) {
        productStats[item.productName] = { name: item.productName, sold: 0, revenue: 0 };
      }
      productStats[item.productName].sold += item.quantity;
      productStats[item.productName].revenue += item.totalPrice;
    }
  }
  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({
      name: p.name,
      sold: p.sold,
      revenue: Math.round(p.revenue * 100) / 100,
    }));
}
