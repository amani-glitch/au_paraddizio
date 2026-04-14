"use client";

import { useState } from "react";
import { Download, TrendingUp, ShoppingBag, Target, Users, BarChart3 } from "lucide-react";
import { mockKPIs } from "@/lib/admin-data";
import { formatPrice, cn } from "@/lib/utils";

const periods = ["Aujourd'hui", "Cette semaine", "Ce mois", "Personnalisé"] as const;

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<string>("Cette semaine");

  const maxWeekly = Math.max(...mockKPIs.weeklyRevenue);
  const maxHourly = Math.max(...mockKPIs.hourlyOrders);
  const totalPopularRevenue = mockKPIs.popularProducts.reduce((s, p) => s + p.revenue, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-sm text-gray-500">Vue d&apos;ensemble des performances</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg bg-white shadow-sm">
            {periods.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg", period === p ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50")}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> Exporter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "CA période", value: formatPrice(mockKPIs.dailyRevenue * 7), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50", change: `+${mockKPIs.dailyRevenueChange}%` },
          { label: "Commandes", value: (mockKPIs.dailyOrders * 7).toString(), icon: ShoppingBag, color: "text-primary bg-red-50", change: `+${mockKPIs.dailyOrdersChange * 7}` },
          { label: "Panier moyen", value: formatPrice(mockKPIs.avgBasket), icon: Target, color: "text-accent bg-amber-50", change: `+${formatPrice(mockKPIs.avgBasketChange)}` },
          { label: "Taux conversion", value: "4,2%", icon: Users, color: "text-secondary bg-green-50", change: "+0,3%" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">{kpi.change}</p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", kpi.color)}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Weekly Revenue */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Ventes de la semaine</h3>
          <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
            {mockKPIs.weeklyRevenue.map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{val}€</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-light transition-all"
                  style={{ height: `${(val / maxWeekly) * 160}px` }}
                />
                <span className="text-xs text-gray-500">{mockKPIs.weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Modes */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 font-semibold text-gray-900">Répartition des commandes</h3>
          <div className="space-y-5">
            {[
              { label: "Livraison", value: mockKPIs.orderModes.delivery, color: "bg-blue-500" },
              { label: "À emporter", value: mockKPIs.orderModes.takeaway, color: "bg-orange-500" },
              { label: "Sur place", value: mockKPIs.orderModes.dineIn, color: "bg-green-500" },
            ].map((mode) => (
              <div key={mode.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{mode.label}</span>
                  <span className="font-bold text-gray-900">{mode.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className={cn("h-full rounded-full transition-all", mode.color)} style={{ width: `${mode.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h4 className="mb-4 font-semibold text-gray-900">Clients</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-gray-600">Récurrents</span>
                  <span className="font-bold">65%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-secondary" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-gray-600">Nouveaux</span>
                  <span className="font-bold">35%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-accent" style={{ width: "35%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Orders */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Heures de pointe</h3>
        <div className="flex items-end gap-1" style={{ height: 140 }}>
          {mockKPIs.hourlyOrders.map((val, i) => {
            const isPeak = i >= 18 && i <= 21;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                {val > 0 && <span className="text-[10px] font-medium text-gray-500">{val}</span>}
                <div
                  className={cn("w-full rounded-t transition-all", isPeak ? "bg-primary" : "bg-gray-200", val === 0 && "bg-transparent")}
                  style={{ height: `${maxHourly > 0 ? (val / maxHourly) * 100 : 0}px`, minHeight: val > 0 ? 4 : 0 }}
                />
                {i % 3 === 0 && <span className="text-[10px] text-gray-400">{i}h</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">Les heures de pointe (18h-21h) sont en rouge</p>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Top produits</h3>
          <div className="space-y-3">
            {mockKPIs.popularProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white", i === 0 ? "bg-accent" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-gray-300")}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(p.revenue / totalPopularRevenue) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{p.sold} vendus</p>
                  <p className="text-xs text-gray-500">{formatPrice(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Exporter les données</h3>
          <p className="mb-6 text-sm text-gray-500">
            Téléchargez vos rapports dans le format de votre choix pour une analyse approfondie.
          </p>
          <div className="space-y-3">
            {[
              { label: "Rapport des ventes", desc: "Détail des ventes par jour et par produit", format: "CSV" },
              { label: "Rapport clients", desc: "Liste des clients avec historique", format: "CSV" },
              { label: "Rapport complet", desc: "Synthèse complète avec graphiques", format: "PDF" },
            ].map((report) => (
              <button key={report.label} className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.label}</p>
                  <p className="text-xs text-gray-500">{report.desc}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <Download className="h-3.5 w-3.5" /> {report.format}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
