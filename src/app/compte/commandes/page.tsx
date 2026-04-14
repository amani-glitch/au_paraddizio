"use client";

import { useState } from "react";
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
  PREPARING: "bg-accent/20 text-amber-700",
  READY: "bg-secondary/20 text-secondary",
  DELIVERING: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-secondary/20 text-secondary",
  CANCELLED: "bg-red-100 text-red-700",
};

const mockOrders: Order[] = [
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
      {
        id: "oi-4",
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
    subtotal: 21.5,
    deliveryFee: 0,
    discount: 0,
    total: 21.5,
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
        id: "oi-5",
        productName: "Corsica",
        sizeName: "33 cm",
        sizePrice: 14,
        quantity: 1,
        supplements: [{ name: "Extra coppa", price: 2.5 }],
        removedIngredients: [],
        unitPrice: 16.5,
        totalPrice: 16.5,
      },
    ],
    subtotal: 16.5,
    deliveryFee: 3,
    discount: 0,
    total: 19.5,
    paymentMethod: "cash",
    paymentStatus: "paid",
    createdAt: "2026-04-01T20:00:00Z",
  },
  {
    id: "order-4",
    orderNumber: "PAR-20260325-X1C8",
    status: "CANCELLED",
    mode: "DELIVERY",
    items: [
      {
        id: "oi-6",
        productName: "V\u00e9g\u00e9tarienne",
        sizeName: "29 cm",
        sizePrice: 10,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        unitPrice: 10,
        totalPrice: 10,
      },
    ],
    subtotal: 10,
    deliveryFee: 3,
    discount: 0,
    total: 13,
    paymentMethod: "card",
    paymentStatus: "refunded",
    createdAt: "2026-03-25T19:15:00Z",
  },
];

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
                  ? "\u00C0 emporter"
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
                <th className="pb-2 text-center font-medium">Qt&eacute;</th>
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
                <span className="text-gray-500">R&eacute;duction</span>
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

export default function CommandesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-wood">
          Mes commandes
        </h1>
      </div>

      {mockOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Package className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            Aucune commande pour le moment
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Vos commandes appara&icirc;tront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
