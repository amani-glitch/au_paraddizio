"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Target,
  UserPlus,
  AlertTriangle,
  Bell,
  ArrowRight,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import {
  statusLabels,
  statusColors,
  modeLabels,
  modeColors,
  getNextStatus,
  getNextStatusLabel,
  timeAgo,
} from "@/lib/admin-data";
import toast from "react-hot-toast";

// ---- Types ----

interface StatsData {
  todayRevenue: number;
  todayOrders: number;
  avgBasket: number;
  totalOrders: number;
  totalRevenue: number;
  byMode: Record<string, number>;
  byStatus: Record<string, number>;
  weeklyRevenue: number[];
  weeklyLabels: string[];
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

interface RecentOrderItem {
  name: string;
  size?: string;
  qty: number;
  price: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  mode: string;
  total: number;
  customerName: string;
  items: RecentOrderItem[];
  createdAt: string;
}

interface DashboardData {
  stats: StatsData;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

// ---- Alerts (static) ----

const alerts = [
  {
    text: "3 produits bientot en rupture",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  {
    text: "Nouvelle commande il y a 2 min",
    icon: Bell,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    text: "Pic prevu entre 19h-20h",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

// ---- Skeleton component ----

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-gray-200", className)}
    />
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Erreur lors du chargement des statistiques");
      const json: DashboardData = await res.json();
      setData(json);
      setOrders(json.recentOrders ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de charger le tableau de bord"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );

  const handleAdvanceStatus = async (order: RecentOrder) => {
    const next = getNextStatus(order.status);
    if (!next) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: next } : o
      )
    );

    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise a jour du statut");
    } catch (err) {
      // Revert on failure
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: order.status } : o
        )
      );
      toast.error(
        err instanceof Error ? err.message : "Impossible de mettre a jour le statut"
      );
    }
  };

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Impossible de charger les donnees du tableau de bord.</p>
      </div>
    );
  }

  const { stats, topProducts } = data;

  // ---- KPI Cards ----
  const kpiCards = [
    {
      label: "CA du jour",
      value: formatPrice(stats.todayRevenue),
      change: `${stats.totalOrders} commandes au total`,
      positive: true,
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Commandes",
      value: String(stats.todayOrders),
      change: `${stats.totalOrders} au total`,
      positive: true,
      icon: ShoppingBag,
      iconBg: "bg-red-100",
      iconColor: "text-primary",
    },
    {
      label: "Panier moyen",
      value: formatPrice(stats.avgBasket),
      change: `CA total : ${formatPrice(stats.totalRevenue)}`,
      positive: true,
      icon: Target,
      iconBg: "bg-amber-100",
      iconColor: "text-accent",
    },
    {
      label: "CA total",
      value: formatPrice(stats.totalRevenue),
      change: "toutes periodes",
      positive: null,
      icon: UserPlus,
      iconBg: "bg-green-100",
      iconColor: "text-secondary",
    },
  ];

  // ---- Weekly chart ----
  const weeklyRevenue = stats.weeklyRevenue ?? [];
  const weeklyLabels = stats.weeklyLabels ?? [];
  const maxWeekly = Math.max(...weeklyRevenue, 1);

  // ---- Order modes ----
  const byMode = stats.byMode ?? {};
  const totalByMode =
    Object.values(byMode).reduce((s, v) => s + v, 0) || 1;
  const modeBreakdown = [
    {
      label: "Livraison",
      pct: Math.round(((byMode.DELIVERY ?? 0) / totalByMode) * 100),
      color: "bg-blue-500",
    },
    {
      label: "A emporter",
      pct: Math.round(((byMode.TAKEAWAY ?? 0) / totalByMode) * 100),
      color: "bg-orange-500",
    },
    {
      label: "Sur place",
      pct: Math.round(((byMode.DINE_IN ?? 0) / totalByMode) * 100),
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    kpi.iconBg
                  )}
                >
                  <Icon className={cn("h-5 w-5", kpi.iconColor)} />
                </div>
              </div>
              <p
                className={cn(
                  "text-sm mt-2",
                  kpi.positive === true
                    ? "text-green-600"
                    : kpi.positive === false
                    ? "text-red-600"
                    : "text-gray-500"
                )}
              >
                {kpi.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Sales Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Ventes de la semaine
          </h2>
          {weeklyRevenue.length > 0 ? (
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyRevenue.map((value, i) => {
                const heightPct = (value / maxWeekly) * 100;
                return (
                  <div
                    key={weeklyLabels[i] ?? i}
                    className="flex flex-col items-center flex-1 gap-1"
                  >
                    <span className="text-xs font-medium text-gray-600">
                      {value} €
                    </span>
                    <div className="w-full relative" style={{ height: "160px" }}>
                      <div
                        className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {weeklyLabels[i] ?? ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">Aucune donnee disponible</p>
          )}
        </div>

        {/* Order Modes Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Repartition des commandes
          </h2>
          <div className="space-y-5">
            {modeBreakdown.map((mode) => (
              <div key={mode.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {mode.label}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {mode.pct}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", mode.color)}
                    style={{ width: `${mode.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Commandes en cours
            </h2>
            <span className="h-6 min-w-[24px] px-2 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeOrders.length}
            </span>
          </div>
          <Link
            href="/admin/commandes"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {activeOrders.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400">
              Aucune commande en cours
            </p>
          )}
          {activeOrders.map((order) => {
            const nextLabel = getNextStatusLabel(order.status, order.mode);
            const itemsSummary = order.items
              .map((item) => `${item.qty}x ${item.name}`)
              .join(", ");

            return (
              <div
                key={order.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-3 gap-3"
              >
                {/* Left: order info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(order.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {order.customerName}
                    </p>
                  </div>
                </div>

                {/* Center: items + mode */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <p className="text-sm text-gray-500 truncate flex-1">
                    {itemsSummary}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
                      modeColors[order.mode] ?? "bg-gray-100 text-gray-800"
                    )}
                  >
                    {modeLabels[order.mode] ?? order.mode}
                  </span>
                </div>

                {/* Right: total + status + action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
                      statusColors[order.status] ?? "bg-gray-100 text-gray-800"
                    )}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  {nextLabel && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                    >
                      {nextLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Produits populaires
            </h2>
          </div>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Produit</th>
                    <th className="px-6 py-3 font-medium text-right">Vendus</th>
                    <th className="px-6 py-3 font-medium text-right">CA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((product, i) => (
                    <tr key={product.name} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold",
                            i === 0
                              ? "bg-accent text-white"
                              : i === 1
                              ? "bg-gray-200 text-gray-700"
                              : i === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 text-right">
                        {product.sold}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">
                        {formatPrice(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-gray-400">
              Aucun produit vendu
            </p>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Alertes</h2>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.text}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border",
                    alert.bg,
                    alert.border
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", alert.color)} />
                  <span className="text-sm font-medium text-gray-800">
                    {alert.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
