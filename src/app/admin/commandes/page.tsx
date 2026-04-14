"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Search,
  Clock,
  Phone,
  MapPin,
  Copy,
  ChefHat,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  CircleDot,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { mockAdminOrders } from "@/lib/admin-data";
import { formatDistanceToNow, format, parseISO } from "date-fns";
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

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "ACCEPTED", label: "Acceptées" },
  { value: "PREPARING", label: "En préparation" },
  { value: "READY", label: "Prêtes" },
  { value: "DELIVERING", label: "En livraison" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELLED", label: "Annulées" },
];

const MODE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "DELIVERY", label: "Livraison" },
  { value: "TAKEAWAY", label: "À emporter" },
  { value: "DINE_IN", label: "Sur place" },
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

function getRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return "";
  }
}

function getCompactItems(items: OrderItem[]): string {
  return items.map((i) => `${i.qty}x ${i.name} ${i.size}`).join(", ");
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommandesPage() {
  // State
  const [orders, setOrders] = useState<Order[]>(
    () => [...mockAdminOrders] as Order[]
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(todayString());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Derived data
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
        if (modeFilter !== "ALL" && o.mode !== modeFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !o.orderNumber.toLowerCase().includes(q) &&
            !o.customerName.toLowerCase().includes(q)
          )
            return false;
        }
        if (dateFilter) {
          const orderDate = o.createdAt.slice(0, 10);
          if (orderDate !== dateFilter) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, statusFilter, modeFilter, searchQuery, dateFilter]);

  const stats = useMemo(() => {
    const todayOrders = orders.filter(
      (o) => o.createdAt.slice(0, 10) === todayString()
    );
    return {
      pending: todayOrders.filter((o) => o.status === "PENDING").length,
      preparing: todayOrders.filter(
        (o) => o.status === "ACCEPTED" || o.status === "PREPARING"
      ).length,
      ready: todayOrders.filter((o) => o.status === "READY").length,
      totalDay: todayOrders.reduce((sum, o) => {
        if (o.status !== "CANCELLED") return sum + o.total;
        return sum;
      }, 0),
    };
  }, [orders]);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  // Handlers
  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  function handleCancelOrder(orderId: string) {
    if (confirm("Voulez-vous vraiment annuler cette commande ?")) {
      handleStatusChange(orderId, "CANCELLED");
    }
  }

  function handleCopyAddress(address: string, orderId: string) {
    navigator.clipboard.writeText(address);
    setCopiedAddress(orderId);
    setTimeout(() => setCopiedAddress(null), 2000);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream">
      {/* Header bar */}
      <div className="sticky top-0 z-30 border-b border-wood/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl font-bold text-wood sm:text-2xl">
              Gestion des commandes
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Temps réel
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                {pendingCount} nouvelle{pendingCount > 1 ? "s" : ""} commande
                {pendingCount > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "rounded-lg p-2 transition-colors",
                soundEnabled
                  ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
              title={soundEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {soundEnabled ? (
                <Bell className="h-5 w-5" />
              ) : (
                <BellOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        {/* Filters bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-wood/10 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <label
              htmlFor="date-filter"
              className="text-xs font-medium text-gray-500"
            >
              Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {MODE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="h-6 w-px bg-gray-200" />

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher n° commande ou client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats summary */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border-l-4 border-l-yellow-400 bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-gray-500">En attente</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-l-orange-400 bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-gray-500">En préparation</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {stats.preparing}
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-l-green-400 bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Prêtes</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.ready}
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-l-primary bg-white p-3 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total du jour</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatPrice(stats.totalDay)}
            </p>
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {filteredOrders.length === 0 && (
            <div className="rounded-xl bg-white py-16 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">
                Aucune commande ne correspond aux filtres.
              </p>
            </div>
          )}

          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const statusCfg = STATUS_CONFIG[order.status];
            const modeCfg = MODE_CONFIG[order.mode];
            const ModeIcon = modeCfg.icon;
            const nextStatus = getNextStatus(order.status, order.mode);

            return (
              <div
                key={order.id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white shadow-sm transition-all",
                  order.status === "PENDING"
                    ? "border-yellow-300 ring-1 ring-yellow-200"
                    : "border-wood/10"
                )}
              >
                {/* Main row */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                  className="flex w-full cursor-pointer items-center gap-4 p-4 text-left hover:bg-cream/50 transition-colors"
                >
                  {/* Left: Order info */}
                  <div className="min-w-0 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-wood">
                        #{order.orderNumber}
                      </span>
                      {order.status === "PENDING" && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500" />
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {getRelativeTime(order.createdAt)}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-700 truncate max-w-[150px]">
                      {order.customerName}
                    </p>
                  </div>

                  {/* Center: Items + mode */}
                  <div className="hidden min-w-0 flex-1 sm:block">
                    <p className="truncate text-sm text-gray-600">
                      {getCompactItems(order.items)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
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
                      {order.mode === "DELIVERY" && order.address && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 truncate max-w-[200px]">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {order.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Total + status + actions */}
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-wood">
                        {formatPrice(order.total)}
                      </p>
                      <span
                        className={cn(
                          "mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          statusCfg.bg,
                          statusCfg.text
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Action buttons (always visible for quick access) */}
                {(order.status === "PENDING" || nextStatus) && (
                  <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2 bg-gray-50/50">
                    {order.status === "PENDING" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(order.id, "ACCEPTED");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-secondary-light"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accepter
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                          Refuser
                        </button>
                      </>
                    )}
                    {order.status === "ACCEPTED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, "PREPARING");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                      >
                        <ChefHat className="h-3.5 w-3.5" />
                        En préparation
                      </button>
                    )}
                    {order.status === "PREPARING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, "READY");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Prête
                      </button>
                    )}
                    {order.status === "READY" && order.mode === "DELIVERY" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, "DELIVERING");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple-600"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        En livraison
                      </button>
                    )}
                    {order.status === "READY" && order.mode !== "DELIVERY" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, "DELIVERED");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Récupérée
                      </button>
                    )}
                    {order.status === "DELIVERING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, "DELIVERED");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Livrée
                      </button>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 underline hover:text-primary"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="animate-fade-in border-t border-gray-100 bg-cream/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Items list */}
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-wood">
                          Articles commandés
                        </h3>
                        <div className="rounded-lg border border-gray-200 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                                <th className="px-3 py-2">Article</th>
                                <th className="px-3 py-2">Taille</th>
                                <th className="px-3 py-2 text-center">Qté</th>
                                <th className="px-3 py-2 text-right">Prix</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-50 last:border-0"
                                >
                                  <td className="px-3 py-2 font-medium">
                                    {item.name}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">
                                    {item.size}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {item.qty}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {formatPrice(item.price * item.qty)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 font-bold">
                                <td
                                  colSpan={3}
                                  className="px-3 py-2 text-right"
                                >
                                  Total
                                </td>
                                <td className="px-3 py-2 text-right text-primary">
                                  {formatPrice(order.total)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-wood">
                            Informations client
                          </h3>
                          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                            <p className="text-sm font-medium text-gray-800">
                              {order.customerName}
                            </p>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {order.customerPhone}
                            </a>
                            {order.mode === "DELIVERY" && order.address && (
                              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm text-blue-800">
                                    {order.address}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleCopyAddress(
                                        order.address!,
                                        order.id
                                      )
                                    }
                                    className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <Copy className="h-3 w-3" />
                                    {copiedAddress === order.id
                                      ? "Copié !"
                                      : "Copier l'adresse"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment info */}
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-wood">
                            Paiement
                          </h3>
                          <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Méthode</span>
                              <span className="font-medium">
                                Carte bancaire
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm">
                              <span className="text-gray-500">Statut</span>
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CircleDot className="h-3 w-3" />
                                Payé
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-wood">
                            Historique
                          </h3>
                          <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-gray-500">
                                  {format(
                                    parseISO(order.createdAt),
                                    "HH:mm",
                                    { locale: fr }
                                  )}
                                </span>
                                <span className="text-gray-700">
                                  Commande reçue
                                </span>
                              </div>
                              {order.status !== "PENDING" &&
                                order.status !== "CANCELLED" && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span className="text-gray-500">
                                      {format(
                                        parseISO(order.createdAt),
                                        "HH:mm",
                                        { locale: fr }
                                      )}
                                    </span>
                                    <span className="text-gray-700">
                                      Commande acceptée
                                    </span>
                                  </div>
                                )}
                              {(order.status === "PREPARING" ||
                                order.status === "READY" ||
                                order.status === "DELIVERING" ||
                                order.status === "DELIVERED") && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                                  <span className="text-gray-500">
                                    {format(
                                      parseISO(order.createdAt),
                                      "HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                  <span className="text-gray-700">
                                    Préparation lancée
                                  </span>
                                </div>
                              )}
                              {(order.status === "READY" ||
                                order.status === "DELIVERING" ||
                                order.status === "DELIVERED") && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  <span className="text-gray-500">
                                    {format(
                                      parseISO(order.createdAt),
                                      "HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                  <span className="text-gray-700">
                                    Commande prête
                                  </span>
                                </div>
                              )}
                              {order.status === "CANCELLED" && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="h-2 w-2 rounded-full bg-red-500" />
                                  <span className="text-gray-500">
                                    {format(
                                      parseISO(order.createdAt),
                                      "HH:mm",
                                      { locale: fr }
                                    )}
                                  </span>
                                  <span className="text-gray-700">
                                    Commande annulée
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes + actions row */}
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[250px]">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Notes internes
                        </label>
                        <textarea
                          rows={2}
                          value={notes[order.id] || ""}
                          onChange={(e) =>
                            setNotes((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          placeholder="Ajouter une note..."
                          className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          <Printer className="h-3.5 w-3.5" />
                          Imprimer
                        </button>
                        {order.status !== "CANCELLED" &&
                          order.status !== "DELIVERED" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              Annuler
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
