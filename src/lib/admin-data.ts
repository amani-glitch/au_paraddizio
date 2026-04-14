// Mock data for admin dashboard

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  mode: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED" | "CANCELLED";
  items: { name: string; size: string; qty: number; price: number }[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  address?: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  notes?: string;
  createdAt: string;
}

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  avgBasket: number;
  firstOrder: string;
  lastOrder: string;
  segment: "VIP" | "regular" | "new" | "inactive";
  loyaltyPoints: number;
}

export const mockAdminOrders: AdminOrder[] = [
  {
    id: "ord-001",
    orderNumber: "PAR-20260414-A1B2",
    customerName: "Marie Dupont",
    customerPhone: "06 12 34 56 78",
    customerEmail: "marie@example.com",
    mode: "DELIVERY",
    status: "PENDING",
    items: [
      { name: "Margherita", size: "33 cm", qty: 2, price: 21 },
      { name: "Tiramisu", size: "Portion", qty: 1, price: 5.5 },
    ],
    total: 29.5,
    subtotal: 26.5,
    deliveryFee: 3,
    discount: 0,
    address: "15 Rue de la République, 84320 Entraigues",
    paymentMethod: "card",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "ord-002",
    orderNumber: "PAR-20260414-C3D4",
    customerName: "Jean Martin",
    customerPhone: "06 98 76 54 32",
    mode: "TAKEAWAY",
    status: "ACCEPTED",
    items: [
      { name: "4 Fromages", size: "40 cm", qty: 1, price: 16.5 },
      { name: "Coca-Cola", size: "33 cl", qty: 2, price: 5 },
    ],
    total: 21.5,
    subtotal: 21.5,
    deliveryFee: 0,
    discount: 0,
    paymentMethod: "cash",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "ord-003",
    orderNumber: "PAR-20260414-E5F6",
    customerName: "Sophie Bernard",
    customerPhone: "06 55 44 33 22",
    customerEmail: "sophie@example.com",
    mode: "DELIVERY",
    status: "PREPARING",
    items: [
      { name: "Corsica", size: "33 cm", qty: 1, price: 14 },
      { name: "Reine", size: "33 cm", qty: 1, price: 11.5 },
      { name: "Bière artisanale", size: "33 cl", qty: 2, price: 8 },
    ],
    total: 36.5,
    subtotal: 33.5,
    deliveryFee: 3,
    discount: 0,
    address: "8 Avenue Jean Moulin, 84320 Entraigues",
    paymentMethod: "card",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "ord-004",
    orderNumber: "PAR-20260414-G7H8",
    customerName: "Pierre Lambert",
    customerPhone: "06 11 22 33 44",
    mode: "DINE_IN",
    status: "PREPARING",
    items: [{ name: "Végétarienne", size: "29 cm", qty: 1, price: 10 }],
    total: 10,
    subtotal: 10,
    deliveryFee: 0,
    discount: 0,
    paymentMethod: "cash",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "ord-005",
    orderNumber: "PAR-20260414-I9J0",
    customerName: "Camille Petit",
    customerPhone: "06 77 88 99 00",
    mode: "TAKEAWAY",
    status: "READY",
    items: [
      { name: "Calzone", size: "33 cm", qty: 2, price: 26 },
      { name: "Panna Cotta", size: "Portion", qty: 2, price: 10 },
    ],
    total: 36,
    subtotal: 36,
    deliveryFee: 0,
    discount: 0,
    paymentMethod: "card",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "ord-006",
    orderNumber: "PAR-20260414-K1L2",
    customerName: "Lucas Moreau",
    customerPhone: "06 66 55 44 33",
    mode: "DELIVERY",
    status: "DELIVERING",
    items: [
      { name: "8 Fromages", size: "40 cm", qty: 1, price: 19 },
      { name: "Eau minérale", size: "1 L", qty: 1, price: 3.5 },
    ],
    total: 25.5,
    subtotal: 22.5,
    deliveryFee: 3,
    discount: 0,
    address: "22 Chemin des Oliviers, 84320 Entraigues",
    paymentMethod: "card",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "ord-007",
    orderNumber: "PAR-20260414-M3N4",
    customerName: "Emma Leroy",
    customerPhone: "06 33 22 11 00",
    mode: "TAKEAWAY",
    status: "DELIVERED",
    items: [
      { name: "Margherita", size: "29 cm", qty: 3, price: 25.5 },
      { name: "Tiramisu", size: "Portion", qty: 3, price: 16.5 },
    ],
    total: 42,
    subtotal: 42,
    deliveryFee: 0,
    discount: 0,
    paymentMethod: "card",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ord-008",
    orderNumber: "PAR-20260413-O5P6",
    customerName: "Thomas Durand",
    customerPhone: "06 99 88 77 66",
    mode: "DELIVERY",
    status: "CANCELLED",
    items: [{ name: "Reine", size: "33 cm", qty: 1, price: 11.5 }],
    total: 14.5,
    subtotal: 11.5,
    deliveryFee: 3,
    discount: 0,
    address: "5 Place du Marché, 84320 Entraigues",
    paymentMethod: "card",
    paymentStatus: "REFUNDED",
    notes: "Client a annulé - délai trop long",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockKPIs = {
  dailyRevenue: 847.5,
  dailyRevenueChange: 12,
  dailyOrders: 34,
  dailyOrdersChange: 5,
  avgBasket: 24.93,
  avgBasketChange: 2.3,
  newClients: 8,
  weeklyRevenue: [320, 450, 380, 520, 680, 890, 420],
  weekDays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  orderModes: { delivery: 45, takeaway: 40, dineIn: 15 },
  popularProducts: [
    { name: "Margherita", sold: 12, revenue: 126 },
    { name: "4 Fromages", sold: 9, revenue: 112.5 },
    { name: "Reine", sold: 8, revenue: 92 },
    { name: "Corsica", sold: 7, revenue: 98 },
    { name: "Calzone", sold: 6, revenue: 78 },
  ],
  hourlyOrders: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 3, 0, 0, 0, 4, 12, 18, 15, 8, 3, 0],
};

export const mockClients: AdminClient[] = [
  { id: "cl-1", name: "Marie Dupont", email: "marie@example.com", phone: "06 12 34 56 78", orders: 15, totalSpent: 387.5, avgBasket: 25.83, firstOrder: "2025-06-15", lastOrder: "2026-04-14", segment: "VIP", loyaltyPoints: 388 },
  { id: "cl-2", name: "Jean Martin", email: "jean@example.com", phone: "06 98 76 54 32", orders: 8, totalSpent: 192, avgBasket: 24, firstOrder: "2025-09-20", lastOrder: "2026-04-13", segment: "regular", loyaltyPoints: 192 },
  { id: "cl-3", name: "Sophie Bernard", email: "sophie@example.com", phone: "06 55 44 33 22", orders: 3, totalSpent: 78.5, avgBasket: 26.17, firstOrder: "2026-03-01", lastOrder: "2026-04-14", segment: "new", loyaltyPoints: 79 },
  { id: "cl-4", name: "Pierre Lambert", email: "pierre@example.com", phone: "06 11 22 33 44", orders: 22, totalSpent: 561, avgBasket: 25.5, firstOrder: "2025-03-10", lastOrder: "2026-04-12", segment: "VIP", loyaltyPoints: 561 },
  { id: "cl-5", name: "Camille Petit", email: "camille@example.com", phone: "06 77 88 99 00", orders: 1, totalSpent: 36, avgBasket: 36, firstOrder: "2026-04-14", lastOrder: "2026-04-14", segment: "new", loyaltyPoints: 36 },
  { id: "cl-6", name: "Lucas Moreau", email: "lucas@example.com", phone: "06 66 55 44 33", orders: 0, totalSpent: 0, avgBasket: 0, firstOrder: "", lastOrder: "", segment: "inactive", loyaltyPoints: 0 },
  { id: "cl-7", name: "Emma Leroy", email: "emma@example.com", phone: "06 33 22 11 00", orders: 12, totalSpent: 312, avgBasket: 26, firstOrder: "2025-07-01", lastOrder: "2026-04-14", segment: "VIP", loyaltyPoints: 312 },
  { id: "cl-8", name: "Thomas Durand", email: "thomas@example.com", phone: "06 99 88 77 66", orders: 5, totalSpent: 127.5, avgBasket: 25.5, firstOrder: "2025-12-01", lastOrder: "2026-04-13", segment: "regular", loyaltyPoints: 128 },
];

export const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERING: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-green-100 text-green-800",
  DELIVERING: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-800",
};

export const modeLabels: Record<string, string> = {
  DELIVERY: "Livraison",
  TAKEAWAY: "À emporter",
  DINE_IN: "Sur place",
};

export const modeColors: Record<string, string> = {
  DELIVERY: "bg-blue-100 text-blue-800",
  TAKEAWAY: "bg-orange-100 text-orange-800",
  DINE_IN: "bg-green-100 text-green-800",
};

export const segmentLabels: Record<string, string> = {
  VIP: "VIP",
  regular: "Régulier",
  new: "Nouveau",
  inactive: "Inactif",
};

export const segmentColors: Record<string, string> = {
  VIP: "bg-accent text-wood",
  regular: "bg-blue-100 text-blue-800",
  new: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
};

export function getNextStatus(current: string): string | null {
  const flow: Record<string, string> = {
    PENDING: "ACCEPTED",
    ACCEPTED: "PREPARING",
    PREPARING: "READY",
    READY: "DELIVERING",
    DELIVERING: "DELIVERED",
  };
  return flow[current] ?? null;
}

export function getNextStatusLabel(current: string, mode: string): string | null {
  const labels: Record<string, string> = {
    PENDING: "Accepter",
    ACCEPTED: "En préparation",
    PREPARING: "Prête",
    READY: mode === "DELIVERY" ? "En livraison" : "Récupérée",
    DELIVERING: "Livrée",
  };
  return labels[current] ?? null;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}
