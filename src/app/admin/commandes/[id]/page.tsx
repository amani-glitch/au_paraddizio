"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Copy,
  Printer,
  ChefHat,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Check,
  X,
  Clock,
  CreditCard,
  CircleDot,
  Undo2,
  AlertTriangle,
  User,
  FileText,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { mockAdminOrders } from "@/lib/admin-data";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED";

type OrderMode = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

interface OrderItem {
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  mode: OrderMode;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  address?: string;
  createdAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "En attente", bg: "bg-yellow-100", text: "text-yellow-800" },
  ACCEPTED: { label: "Acceptée", bg: "bg-blue-100", text: "text-blue-800" },
  PREPARING: {
    label: "En préparation",
    bg: "bg-orange-100",
    text: "text-orange-800",
  },
  READY: { label: "Prête", bg: "bg-green-100", text: "text-green-800" },
  DELIVERING: {
    label: "En livraison",
    bg: "bg-purple-100",
    text: "text-purple-800",
  },
  DELIVERED: { label: "Livrée", bg: "bg-gray-100", text: "text-gray-800" },
  CANCELLED: { label: "Annulée", bg: "bg-red-100", text: "text-red-800" },
};

const MODE_CONFIG: Record<
  OrderMode,
  { label: string; bg: string; text: string; icon: typeof Truck }
> = {
  DELIVERY: {
    label: "Livraison",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Truck,
  },
  TAKEAWAY: {
    label: "À emporter",
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: ShoppingBag,
  },
  DINE_IN: {
    label: "Sur place",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: UtensilsCrossed,
  },
};

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "PENDING", label: "Reçue" },
  { key: "ACCEPTED", label: "Acceptée" },
  { key: "PREPARING", label: "Préparation" },
  { key: "READY", label: "Prête" },
  { key: "DELIVERING", label: "Livraison" },
  { key: "DELIVERED", label: "Livrée" },
];

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusStepIndex(status: OrderStatus): number {
  const idx = STATUS_FLOW.indexOf(status);
  return idx === -1 ? -1 : idx;
}

function getNextStatus(
  status: OrderStatus,
  mode: OrderMode
): OrderStatus | null {
  if (status === "DELIVERED" || status === "CANCELLED") return null;
  if (status === "READY" && mode !== "DELIVERY") return "DELIVERED";
  const idx = STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

function getNextActionLabel(status: OrderStatus, mode: OrderMode): string {
  switch (status) {
    case "PENDING":
      return "Accepter la commande";
    case "ACCEPTED":
      return "Lancer la préparation";
    case "PREPARING":
      return "Marquer comme prête";
    case "READY":
      return mode === "DELIVERY"
        ? "Envoyer en livraison"
        : "Marquer comme récupérée";
    case "DELIVERING":
      return "Confirmer la livraison";
    default:
      return "";
  }
}

function getNextActionColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-secondary hover:bg-secondary-light";
    case "ACCEPTED":
      return "bg-orange-500 hover:bg-orange-600";
    case "PREPARING":
      return "bg-green-500 hover:bg-green-600";
    case "READY":
      return "bg-purple-500 hover:bg-purple-600";
    case "DELIVERING":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-400";
  }
}

function getNextActionIcon(status: OrderStatus, mode: OrderMode) {
  switch (status) {
    case "PENDING":
      return Check;
    case "ACCEPTED":
      return ChefHat;
    case "PREPARING":
      return Check;
    case "READY":
      return mode === "DELIVERY" ? Truck : Check;
    case "DELIVERING":
      return Check;
    default:
      return Check;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const initialOrder = (mockAdminOrders as Order[]).find((o) => o.id === id);

  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [noteText, setNoteText] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-3 font-heading text-xl font-bold text-wood">
            Commande introuvable
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cette commande n&apos;existe pas ou a été supprimée.
          </p>
          <Link
            href="/admin/commandes"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];
  const modeCfg = MODE_CONFIG[order.mode];
  const ModeIcon = modeCfg.icon;
  const currentStepIdx = getStatusStepIndex(order.status);
  const nextStatus = getNextStatus(order.status, order.mode);
  const NextIcon = nextStatus
    ? getNextActionIcon(order.status, order.mode)
    : Check;

  // Determine which steps to show (skip DELIVERING for non-delivery)
  const visibleSteps =
    order.mode === "DELIVERY"
      ? STATUS_STEPS
      : STATUS_STEPS.filter((s) => s.key !== "DELIVERING");

  // Compute subtotal from items
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = order.mode === "DELIVERY" ? 2.5 : 0;
  const discount = subtotal + deliveryFee - order.total;

  function handleStatusChange(newStatus: OrderStatus) {
    setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
  }

  function handleCancel() {
    handleStatusChange("CANCELLED");
    setShowCancelConfirm(false);
  }

  function handleCopyAddress() {
    if (order?.address) {
      navigator.clipboard.writeText(order.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top navigation */}
      <div className="sticky top-0 z-30 border-b border-wood/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux commandes
          </Link>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Printer className="h-3.5 w-3.5" />
              Imprimer
            </button>
            {order.status === "DELIVERED" && (
              <button
                onClick={() => setShowRefundConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Rembourser
              </button>
            )}
            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Order header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-wood sm:text-3xl">
                Commande #{order.orderNumber}
              </h1>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  statusCfg.bg,
                  statusCfg.text
                )}
              >
                {statusCfg.label}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(parseISO(order.createdAt), "EEEE d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {formatDistanceToNow(parseISO(order.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
              <span className="text-gray-300">|</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  modeCfg.bg,
                  modeCfg.text
                )}
              >
                <ModeIcon className="h-3 w-3" />
                {modeCfg.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        {/* Status workflow stepper */}
        <div className="mb-8 overflow-x-auto rounded-xl border border-wood/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between min-w-[500px]">
            {visibleSteps.map((step, idx) => {
              const stepIdx = STATUS_FLOW.indexOf(step.key);
              const isCompleted = currentStepIdx > stepIdx;
              const isCurrent = currentStepIdx === stepIdx;
              const isCancelled = order.status === "CANCELLED";

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                        isCancelled
                          ? "bg-red-100 text-red-600"
                          : isCompleted
                            ? "bg-secondary text-white"
                            : isCurrent
                              ? "bg-primary text-white ring-4 ring-primary/20"
                              : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {isCancelled ? (
                        <X className="h-4 w-4" />
                      ) : isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-1.5 text-xs font-medium whitespace-nowrap",
                        isCancelled
                          ? "text-red-600"
                          : isCompleted
                            ? "text-secondary"
                            : isCurrent
                              ? "text-primary font-semibold"
                              : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < visibleSteps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1",
                        isCompleted ? "bg-secondary" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next action button (prominent) */}
        {nextStatus && order.status !== "CANCELLED" && (
          <div className="mb-6">
            {order.status === "PENDING" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("ACCEPTED")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl",
                    getNextActionColor(order.status)
                  )}
                >
                  <Check className="h-5 w-5" />
                  Accepter la commande
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl"
                >
                  <X className="h-5 w-5" />
                  Refuser
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleStatusChange(nextStatus)}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl",
                  getNextActionColor(order.status)
                )}
              >
                <NextIcon className="h-5 w-5" />
                {getNextActionLabel(order.status, order.mode)}
              </button>
            )}
          </div>
        )}

        {/* Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Items table */}
          <div className="space-y-4">
            <div className="rounded-xl border border-wood/10 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-wood">
                  <FileText className="h-5 w-5 text-primary" />
                  Détail de la commande
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Taille</th>
                      <th className="px-4 py-3 text-center">Qté</th>
                      <th className="px-4 py-3 text-right">P.U.</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.size}</td>
                        <td className="px-4 py-3 text-center">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(item.price * item.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Totals */}
              <div className="border-t border-gray-200 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {order.mode === "DELIVERY" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frais de livraison</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                {discount > 0.01 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                  <span className="text-wood">Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Customer, address, payment */}
          <div className="space-y-4">
            {/* Customer info card */}
            <div className="rounded-xl border border-wood/10 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-wood">
                  <User className="h-5 w-5 text-primary" />
                  Informations client
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Nom
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Téléphone
                  </p>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {order.customerPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery address card */}
            {order.mode === "DELIVERY" && order.address && (
              <div className="rounded-xl border border-wood/10 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-wood">
                    <MapPin className="h-5 w-5 text-primary" />
                    Adresse de livraison
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">{order.address}</p>
                    <button
                      onClick={handleCopyAddress}
                      className="flex-shrink-0 rounded-md bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Copier l'adresse"
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {copiedAddress && (
                    <p className="mt-1 text-xs text-green-600">
                      Adresse copiée !
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment info card */}
            <div className="rounded-xl border border-wood/10 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-wood">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paiement
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Méthode</span>
                  <span className="font-medium">Carte bancaire</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Statut</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
                    <CircleDot className="h-3.5 w-3.5" />
                    Payé
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="mt-6 rounded-xl border border-wood/10 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-heading text-lg font-bold text-wood">
              Notes internes
            </h2>
          </div>
          <div className="p-4">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajouter des notes internes sur cette commande..."
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                className="rounded-lg bg-wood px-4 py-1.5 text-sm font-medium text-white hover:bg-wood-light transition-colors"
                onClick={() => {
                  if (noteText.trim()) {
                    alert("Note enregistrée (simulation)");
                  }
                }}
              >
                Enregistrer la note
              </button>
            </div>
          </div>
        </div>

        {/* Action history / timeline */}
        <div className="mt-6 rounded-xl border border-wood/10 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-wood">
              <Clock className="h-5 w-5 text-primary" />
              Historique des actions
            </h2>
          </div>
          <div className="p-4">
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

              {/* Events - generated based on current status */}
              {(() => {
                const events: {
                  label: string;
                  color: string;
                  time: string;
                  active: boolean;
                }[] = [];
                const baseTime = parseISO(order.createdAt);
                const statusTimeline: {
                  status: OrderStatus;
                  label: string;
                  color: string;
                  minutesAfter: number;
                }[] = [
                  {
                    status: "PENDING",
                    label: "Commande reçue",
                    color: "bg-yellow-500",
                    minutesAfter: 0,
                  },
                  {
                    status: "ACCEPTED",
                    label: "Commande acceptée",
                    color: "bg-blue-500",
                    minutesAfter: 2,
                  },
                  {
                    status: "PREPARING",
                    label: "Préparation lancée",
                    color: "bg-orange-500",
                    minutesAfter: 3,
                  },
                  {
                    status: "READY",
                    label: "Commande prête",
                    color: "bg-green-500",
                    minutesAfter: 15,
                  },
                  {
                    status: "DELIVERING",
                    label: "Partie en livraison",
                    color: "bg-purple-500",
                    minutesAfter: 17,
                  },
                  {
                    status: "DELIVERED",
                    label: "Commande livrée",
                    color: "bg-gray-500",
                    minutesAfter: 35,
                  },
                ];

                const currentIdx = getStatusStepIndex(order.status);

                for (const entry of statusTimeline) {
                  const entryIdx = getStatusStepIndex(entry.status);
                  if (entryIdx <= currentIdx) {
                    const eventTime = new Date(
                      baseTime.getTime() + entry.minutesAfter * 60000
                    );
                    events.push({
                      label: entry.label,
                      color: entry.color,
                      time: format(eventTime, "HH:mm", { locale: fr }),
                      active: entryIdx === currentIdx,
                    });
                  }
                }

                // Delivery mode check: skip DELIVERING for non-delivery
                if (order.mode !== "DELIVERY") {
                  const filtered = events.filter(
                    (e) => e.label !== "Partie en livraison"
                  );
                  return filtered;
                }

                if (order.status === "CANCELLED") {
                  return [
                    {
                      label: "Commande reçue",
                      color: "bg-yellow-500",
                      time: format(baseTime, "HH:mm", { locale: fr }),
                      active: false,
                    },
                    {
                      label: "Commande annulée",
                      color: "bg-red-500",
                      time: format(
                        new Date(baseTime.getTime() + 5 * 60000),
                        "HH:mm",
                        { locale: fr }
                      ),
                      active: true,
                    },
                  ];
                }

                return events;
              })().map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  <div
                    className={cn(
                      "relative z-10 mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2 border-white",
                      event.color,
                      event.active && "ring-2 ring-offset-1 ring-primary/30"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        event.active ? "font-bold text-gray-800" : "text-gray-600"
                      )}
                    >
                      {event.label}
                    </p>
                    <p className="text-xs text-gray-400">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-800">
              Annuler cette commande ?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Cette action est irréversible. Le client sera notifié de
              l&apos;annulation de sa commande #{order.orderNumber}.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund confirmation modal */}
      {showRefundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Undo2 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-800">
              Rembourser cette commande ?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Un remboursement de{" "}
              <strong className="text-primary">
                {formatPrice(order.total)}
              </strong>{" "}
              sera initié pour la commande #{order.orderNumber}.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRefundConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowRefundConfirm(false);
                  alert("Remboursement initié (simulation)");
                }}
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Confirmer le remboursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
