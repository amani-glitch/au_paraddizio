"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import {
  mockKPIs,
  mockAdminOrders,
  statusLabels,
  statusColors,
  modeLabels,
  modeColors,
  getNextStatus,
  getNextStatusLabel,
  timeAgo,
  type AdminOrder,
} from "@/lib/admin-data";

// ---- KPI Cards ----

const kpiCards = [
  {
    label: "CA du jour",
    value: formatPrice(mockKPIs.dailyRevenue),
    change: `+${mockKPIs.dailyRevenueChange}% vs hier`,
    positive: true,
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Commandes",
    value: String(mockKPIs.dailyOrders),
    change: `+${mockKPIs.dailyOrdersChange} vs hier`,
    positive: true,
    icon: ShoppingBag,
    iconBg: "bg-red-100",
    iconColor: "text-primary",
  },
  {
    label: "Panier moyen",
    value: formatPrice(mockKPIs.avgBasket),
    change: `+${mockKPIs.avgBasketChange.toFixed(2)} \u20AC`,
    positive: true,
    icon: Target,
    iconBg: "bg-amber-100",
    iconColor: "text-accent",
  },
  {
    label: "Nouveaux clients",
    value: String(mockKPIs.newClients),
    change: "cette semaine",
    positive: null,
    icon: UserPlus,
    iconBg: "bg-green-100",
    iconColor: "text-secondary",
  },
];

// ---- Weekly chart data ----

const maxWeekly = Math.max(...mockKPIs.weeklyRevenue);

// ---- Alerts ----

const alerts = [
  {
    text: "3 produits bientôt en rupture",
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
    text: "Pic prévu entre 19h-20h",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([...mockAdminOrders]);

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );

  const handleAdvanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = getNextStatus(o.status);
        if (!next) return o;
        return { ...o, status: next as AdminOrder["status"] };
      })
    );
  };

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
          <div className="flex items-end justify-between gap-3 h-48">
            {mockKPIs.weeklyRevenue.map((value, i) => {
              const heightPct = (value / maxWeekly) * 100;
              return (
                <div
                  key={mockKPIs.weekDays[i]}
                  className="flex flex-col items-center flex-1 gap-1"
                >
                  <span className="text-xs font-medium text-gray-600">
                    {value} &euro;
                  </span>
                  <div className="w-full relative" style={{ height: "160px" }}>
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {mockKPIs.weekDays[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Modes Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Répartition des commandes
          </h2>
          <div className="space-y-5">
            {[
              {
                label: "Livraison",
                pct: mockKPIs.orderModes.delivery,
                color: "bg-blue-500",
              },
              {
                label: "À emporter",
                pct: mockKPIs.orderModes.takeaway,
                color: "bg-orange-500",
              },
              {
                label: "Sur place",
                pct: mockKPIs.orderModes.dineIn,
                color: "bg-green-500",
              },
            ].map((mode) => (
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
                      modeColors[order.mode]
                    )}
                  >
                    {modeLabels[order.mode]}
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
                      statusColors[order.status]
                    )}
                  >
                    {statusLabels[order.status]}
                  </span>
                  {nextLabel && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id)}
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
                {mockKPIs.popularProducts.map((product, i) => (
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
