"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Package,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERING: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-accent/20 text-amber-700",
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

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-wood">
              #{order.orderNumber}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusColors[order.status]
              )}
            >
              {statusLabels[order.status]}
            </span>
            <span className="text-xs text-gray-400">
              {order.mode === "DELIVERY"
                ? "Livraison"
                : order.mode === "TAKEAWAY"
                  ? "À emporter"
                  : "Sur place"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.total)}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {order.status !== "CANCELLED" && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Re-commander
            </button>
          )}
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 bg-cream/30 p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Produit</th>
                <th className="pb-2 font-medium">Taille</th>
                <th className="pb-2 text-center font-medium">Qté</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <p className="font-medium text-wood">{item.productName}</p>
                    {item.supplements.length > 0 && (
                      <p className="text-xs text-gray-400">
                        + {item.supplements.map((s) => s.name).join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="py-2 text-gray-600">{item.sizeName}</td>
                  <td className="py-2 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right font-medium text-wood">
                    {formatPrice(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-col items-end gap-1 border-t border-gray-200 pt-3 text-sm">
            <div className="flex gap-8">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex gap-8">
                <span className="text-gray-500">Livraison</span>
                <span className="font-medium">
                  {formatPrice(order.deliveryFee)}
                </span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex gap-8">
                <span className="text-gray-500">Réduction</span>
                <span className="font-medium text-secondary">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex gap-8 text-base">
              <span className="font-bold text-wood">Total</span>
              <span className="font-bold text-primary">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
              <div className="h-3 w-48 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 rounded bg-gray-200" />
              <div className="h-8 w-16 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-wood">
          Mes commandes
        </h1>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Package className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            Aucune commande pour le moment
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Vos commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
