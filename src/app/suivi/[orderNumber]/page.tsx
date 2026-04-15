"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  ChefHat,
  Package,
  Truck,
  MapPin,
  Phone,
  Home,
  ShoppingBag,
  Flame,
  CircleDot,
  AlertTriangle,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { storeInfo } from "@/lib/data";
import type { OrderStatus } from "@/types";

// ─── Order status types ─────────────────────────────────────────────────────────

type TrackingStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED";

interface StatusStep {
  key: TrackingStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  time?: string;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  mode: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  customerName?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress?: string | null;
  paymentMethod?: string;
  notes?: string | null;
  estimatedReadyAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: {
    productName: string;
    sizeName?: string;
    sizePrice?: number;
    quantity: number;
    supplements?: { name: string; price: number }[];
    unitPrice: number;
    totalPrice: number;
  }[];
}

// ─── Status steps definition ────────────────────────────────────────────────────

const STATUS_STEPS: StatusStep[] = [
  {
    key: "PENDING",
    label: "Re\u00e7ue",
    description: "Votre commande a \u00e9t\u00e9 re\u00e7ue",
    icon: <Package className="w-5 h-5" />,
  },
  {
    key: "ACCEPTED",
    label: "Accept\u00e9e",
    description: "Le restaurant a accept\u00e9 votre commande",
    icon: <Check className="w-5 h-5" />,
  },
  {
    key: "PREPARING",
    label: "En pr\u00e9paration",
    description: "Votre commande est en cours de pr\u00e9paration",
    icon: <Flame className="w-5 h-5" />,
  },
  {
    key: "READY",
    label: "Pr\u00eate",
    description: "Votre commande est pr\u00eate",
    icon: <ChefHat className="w-5 h-5" />,
  },
  {
    key: "DELIVERING",
    label: "En livraison",
    description: "Le livreur est en route vers vous",
    icon: <Truck className="w-5 h-5" />,
  },
  {
    key: "DELIVERED",
    label: "Livr\u00e9e",
    description: "Votre commande a \u00e9t\u00e9 livr\u00e9e",
    icon: <MapPin className="w-5 h-5" />,
  },
];

function getStatusIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseDeliveryAddress(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    const parts = [parsed.street, parsed.complement, parsed.postalCode, parsed.city].filter(Boolean);
    return parts.join(", ");
  } catch {
    return raw;
  }
}

const paymentLabels: Record<string, string> = {
  card: "Carte bancaire",
  meal_voucher: "Titres-restaurant",
  paypal: "PayPal",
  on_site: "Paiement sur place",
};

// ═════════════════════════════════════════════════════════════════════════════════
// ORDER TRACKING PAGE
// ═════════════════════════════════════════════════════════════════════════════════

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Commande introuvable");
          } else {
            setError("Erreur lors du chargement de la commande");
          }
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  // Auto-refresh every 30 seconds for live tracking
  useEffect(() => {
    if (error || !order) return;
    const terminal = ["DELIVERED", "CANCELLED"];
    if (terminal.includes(order.status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch {
        // Silently ignore refresh errors
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [order, error, orderNumber]);

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-white border-b border-wood/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-wood hover:text-primary transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
              <h1 className="font-heading text-xl font-bold text-wood">Suivi de commande</h1>
              <div className="w-16" />
            </div>
          </div>
        </div>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="bg-white border-b border-wood/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-wood hover:text-primary transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
              <h1 className="font-heading text-xl font-bold text-wood">Suivi de commande</h1>
              <div className="w-16" />
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="font-heading text-xl font-bold text-wood mb-2">
            {error ?? "Commande introuvable"}
          </h2>
          <p className="text-sm text-wood-light mb-6">
            V&eacute;rifiez le num&eacute;ro de commande et r&eacute;essayez.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full transition-all"
          >
            <Home className="w-4 h-4" />
            Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────────────────────

  const isCancelled = order.status === "CANCELLED";
  const currentStatusIndex = isCancelled ? -1 : getStatusIndex(order.status);

  // For non-delivery orders, filter out DELIVERING step
  const steps =
    order.mode === "DELIVERY"
      ? STATUS_STEPS
      : STATUS_STEPS.filter((s) => s.key !== "DELIVERING");

  const activeStepIndex = isCancelled
    ? -1
    : steps.findIndex((s) => s.key === order.status);

  const placedAt = formatTime(order.createdAt);
  const address = parseDeliveryAddress(order.deliveryAddress);

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-wood/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-wood hover:text-primary transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
            <h1 className="font-heading text-xl font-bold text-wood">Suivi de commande</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Order number + status badge ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-xs text-wood-light uppercase tracking-wide font-medium mb-1">
            Commande
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-3">
            {order.orderNumber}
          </h2>
          {isCancelled ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold text-sm">Annul&eacute;e</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
              <CircleDot className="w-4 h-4 animate-pulse" />
              <span className="font-semibold text-sm">
                {steps[activeStepIndex]?.label ?? order.status}
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Left column: Timeline (2 cols) ────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* Estimated time card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-wood-light">
                      {order.mode === "DELIVERY"
                        ? "Heure estim\u00e9e d\u2019arriv\u00e9e"
                        : "Heure estim\u00e9e"}
                    </p>
                    <p className="font-heading font-bold text-wood text-2xl">
                      {order.estimatedReadyAt
                        ? formatTime(order.estimatedReadyAt)
                        : "--:--"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-wood-light">Command&eacute; &agrave;</p>
                  <p className="font-semibold text-wood">{placedAt}</p>
                </div>
              </div>

              {/* Progress bar */}
              {!isCancelled && (
                <div className="mt-4 relative">
                  <div className="h-2 bg-wood/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((activeStepIndex + 1) / steps.length) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5"
            >
              <h3 className="font-heading font-semibold text-wood mb-6">
                Suivi en temps r&eacute;el
              </h3>

              <div className="relative">
                {steps.map((step, idx) => {
                  const isPast = !isCancelled && idx <= activeStepIndex;
                  const isCurrent = !isCancelled && idx === activeStepIndex;
                  const isFuture = isCancelled || idx > activeStepIndex;

                  return (
                    <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Vertical line */}
                      {idx < steps.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-[19px] top-10 w-0.5 h-[calc(100%-2.5rem)]",
                            isPast && !isCurrent ? "bg-secondary" : "bg-wood/10"
                          )}
                        />
                      )}

                      {/* Circle / icon */}
                      <div
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500",
                          isPast && !isCurrent
                            ? "bg-secondary text-white"
                            : isCurrent
                            ? "bg-primary text-white shadow-lg shadow-primary/25 ring-4 ring-primary/10"
                            : "bg-wood/10 text-wood/30"
                        )}
                      >
                        {isPast && !isCurrent ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={cn(
                              "font-semibold text-sm",
                              isPast ? "text-wood" : "text-wood/40"
                            )}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                              En cours
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm mt-0.5",
                            isPast ? "text-wood-light" : "text-wood/30"
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Contact section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-wood/5"
            >
              <h3 className="font-heading font-semibold text-wood mb-4">
                Besoin d&apos;aide ?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${storeInfo.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                >
                  <Phone className="w-4 h-4" />
                  Appeler le restaurant
                </a>
                <div className="flex items-center gap-2 text-sm text-wood-light px-4">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {storeInfo.address}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Right column: Order details (1 col) ───────────────────────────── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5 sticky top-24"
            >
              <h3 className="font-heading font-semibold text-wood mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                D&eacute;tail de la commande
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 pb-3 border-b border-wood/5 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-wood text-sm">
                        {item.quantity > 1 && (
                          <span className="text-primary font-bold mr-1">{item.quantity}x</span>
                        )}
                        {item.productName}
                      </p>
                      <p className="text-xs text-wood-light">{item.sizeName}</p>
                      {item.supplements && item.supplements.length > 0 && (
                        <p className="text-xs text-wood-light">
                          + {item.supplements.map((s) => s.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-wood whitespace-nowrap">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 pt-2 border-t border-wood/10">
                <div className="flex justify-between text-sm">
                  <span className="text-wood-light">Sous-total</span>
                  <span className="text-wood font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-wood-light">Livraison</span>
                    <span className="text-wood font-medium">
                      {formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">R&eacute;duction</span>
                    <span className="text-secondary font-medium">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-wood/10">
                  <span className="font-heading font-bold text-wood">Total</span>
                  <span className="font-heading font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* Delivery address */}
              {order.mode === "DELIVERY" && address && (
                <div className="mt-4 p-3 rounded-xl bg-cream/80 border border-wood/5">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-wood/40 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-wood-light">
                      <p className="font-semibold text-wood text-sm mb-0.5">Adresse de livraison</p>
                      {address}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div className="mt-3 p-3 rounded-xl bg-cream/80 border border-wood/5">
                <div className="flex items-center gap-2 text-xs text-wood-light">
                  <Package className="w-4 h-4 text-wood/40" />
                  <span>
                    Pay&eacute; par{" "}
                    <strong className="text-wood">
                      {paymentLabels[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "N/A"}
                    </strong>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Back to home */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-wood hover:text-primary font-semibold text-sm transition-colors"
              >
                <Home className="w-4 h-4" />
                Retour &agrave; l&apos;accueil
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
