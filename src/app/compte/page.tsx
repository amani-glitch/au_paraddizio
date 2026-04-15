"use client";

import { useEffect, useState } from "react";
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

function mapApiOrderToOrder(apiOrder: Record<string, unknown>): Order {
  const items = (apiOrder.items as Record<string, unknown>[]) ?? [];
  return {
    id: (apiOrder.id as string) ?? "",
    orderNumber: (apiOrder.orderNumber as string) ?? "",
    status: (apiOrder.status as OrderStatus) ?? "PENDING",
    mode: (apiOrder.mode as Order["mode"]) ?? "TAKEAWAY",
    items: items.map((item, idx) => ({
      id: (item.id as string) ?? `oi-${idx}`,
      productName: (item.productName as string) ?? "",
      sizeName: (item.sizeName as string) ?? "",
      sizePrice: (item.sizePrice as number) ?? 0,
      quantity: (item.quantity as number) ?? 1,
      supplements: (item.supplements as { name: string; price: number }[]) ?? [],
      removedIngredients: (item.removedIngredients as string[]) ?? [],
      specialInstructions: (item.specialInstructions as string) ?? undefined,
      unitPrice: (item.unitPrice as number) ?? 0,
      totalPrice: (item.totalPrice as number) ?? 0,
    })),
    subtotal: (apiOrder.subtotal as number) ?? 0,
    deliveryFee: (apiOrder.deliveryFee as number) ?? 0,
    discount: (apiOrder.discount as number) ?? 0,
    total: (apiOrder.total as number) ?? 0,
    paymentMethod: (apiOrder.paymentMethod as string) ?? "",
    paymentStatus: (apiOrder.paymentStatus as string) ?? "pending",
    createdAt: (apiOrder.createdAt as string) ?? new Date().toISOString(),
  };
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse flex flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="h-5 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="h-3 w-48 rounded bg-gray-100" />
          </div>
          <div className="h-5 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.map(mapApiOrderToOrder)
          : [];
        setOrders(mapped);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 3);

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
            <p className="text-2xl font-bold text-wood">{formatPrice(totalSpent)}</p>
            <p className="text-sm text-gray-500">Total d&eacute;pens&eacute;</p>
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

        {ordersLoading ? (
          <OrdersSkeleton />
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              Aucune commande pour le moment
            </p>
          </div>
        ) : (
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
        )}
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
