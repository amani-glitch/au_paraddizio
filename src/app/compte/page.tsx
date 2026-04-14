"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Award,
  TrendingUp,
  ChevronRight,
  Package,
  MapPin,
  Heart,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accept\u00e9e",
  PREPARING: "En pr\u00e9paration",
  READY: "Pr\u00eate",
  DELIVERING: "En livraison",
  DELIVERED: "Livr\u00e9e",
  CANCELLED: "Annul\u00e9e",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-accent/20 text-accent",
  READY: "bg-secondary/20 text-secondary",
  DELIVERING: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-secondary/20 text-secondary",
  CANCELLED: "bg-red-100 text-red-700",
};

const recentOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "PAR-20260410-A7F2",
    status: "DELIVERED",
    mode: "DELIVERY",
    items: [
      {
        id: "oi-1",
        productName: "Margherita",
        sizeName: "33 cm",
        sizePrice: 10.5,
        quantity: 2,
        supplements: [{ name: "Extra mozzarella", price: 1.5 }],
        removedIngredients: [],
        unitPrice: 12,
        totalPrice: 24,
      },
      {
        id: "oi-2",
        productName: "Tiramisu Maison",
        sizeName: "Portion",
        sizePrice: 5.5,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        unitPrice: 5.5,
        totalPrice: 5.5,
      },
    ],
    subtotal: 29.5,
    deliveryFee: 0,
    discount: 0,
    total: 29.5,
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "2026-04-10T19:30:00Z",
  },
  {
    id: "order-2",
    orderNumber: "PAR-20260407-K9D1",
    status: "PREPARING",
    mode: "TAKEAWAY",
    items: [
      {
        id: "oi-3",
        productName: "4 Fromages",
        sizeName: "40 cm",
        sizePrice: 16.5,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        unitPrice: 16.5,
        totalPrice: 16.5,
      },
    ],
    subtotal: 16.5,
    deliveryFee: 0,
    discount: 0,
    total: 16.5,
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "2026-04-07T18:45:00Z",
  },
  {
    id: "order-3",
    orderNumber: "PAR-20260401-B3E5",
    status: "DELIVERED",
    mode: "DELIVERY",
    items: [
      {
        id: "oi-4",
        productName: "Corsica",
        sizeName: "33 cm",
        sizePrice: 14,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        unitPrice: 14,
        totalPrice: 14,
      },
      {
        id: "oi-5",
        productName: "Coca-Cola",
        sizeName: "33 cl",
        sizePrice: 2.5,
        quantity: 2,
        supplements: [],
        removedIngredients: [],
        unitPrice: 2.5,
        totalPrice: 5,
      },
    ],
    subtotal: 19,
    deliveryFee: 0,
    discount: 0,
    total: 19,
    paymentMethod: "cash",
    paymentStatus: "paid",
    createdAt: "2026-04-01T20:00:00Z",
  },
];

export default function ComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalOrders = recentOrders.length;
  const avgOrder =
    totalOrders > 0
      ? recentOrders.reduce((sum, o) => sum + o.total, 0) / totalOrders
      : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-heading text-2xl font-bold text-wood">
          Bonjour, {user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue dans votre espace personnel Au Paradizzio.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-wood">{totalOrders}</p>
            <p className="text-sm text-gray-500">Commandes</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Award className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-wood">{user.loyaltyPoints}</p>
            <p className="text-sm text-gray-500">Points de fid&eacute;lit&eacute;</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-wood">{formatPrice(avgOrder)}</p>
            <p className="text-sm text-gray-500">Panier moyen</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-wood">
            Commandes r&eacute;centes
          </h2>
          <Link
            href="/compte/commandes"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-cream/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-wood">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  &mdash; {order.items.map((i) => i.productName).join(", ")}
                </p>
              </div>
              <p className="text-sm font-bold text-primary">
                {formatPrice(order.total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/compte/commandes"
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-cream/50"
        >
          <Package className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-wood">Mes commandes</span>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href="/compte/adresses"
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-cream/50"
        >
          <MapPin className="h-5 w-5 text-secondary" />
          <span className="text-sm font-medium text-wood">Mes adresses</span>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
        <Link
          href="/compte/favoris"
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-cream/50"
        >
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-wood">Mes favoris</span>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
