"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  Users,
  Crown,
  UserPlus,
  ShoppingCart,
  X,
  Star,
  Gift,
  Calendar,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { segmentLabels, segmentColors, type AdminClient } from "@/lib/admin-data";
import toast from "react-hot-toast";

// ---- Types ----

type SegmentFilter = "all" | "VIP" | "regular" | "new" | "inactive";
type SortKey = "name" | "orders" | "totalSpent";
type SortDir = "asc" | "desc";

// ---- Skeleton ----

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-gray-200", className)} />
  );
}

// ---- Component ----

export default function ClientsPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("totalSpent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Erreur lors du chargement des clients");
      const data: AdminClient[] = await res.json();
      setClients(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de charger les clients"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ---- Derived data ----

  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    // Segment filter
    if (segmentFilter !== "all") {
      result = result.filter((c) => c.segment === segmentFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "orders") cmp = a.orders - b.orders;
      else if (sortKey === "totalSpent") cmp = a.totalSpent - b.totalSpent;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [clients, search, segmentFilter, sortKey, sortDir]);

  // ---- Stats ----

  const stats = useMemo(() => {
    const total = clients.length;
    const vip = clients.filter((c) => c.segment === "VIP").length;
    const newThisMonth = clients.filter((c) => c.segment === "new").length;
    const totalSpent = clients.reduce((s, c) => s + c.totalSpent, 0);
    const avgSpent = total > 0 ? totalSpent / total : 0;
    return { total, vip, newThisMonth, avgSpent };
  }, [clients]);

  // ---- Handlers ----

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ChevronDown className="h-3 w-3 text-gray-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  }

  function handleExportCSV() {
    const headers = ["Nom", "Email", "Telephone", "Commandes", "CA Total", "Panier Moyen", "Segment", "Derniere commande"];
    const rows = filteredClients.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.orders.toString(),
      c.totalSpent.toFixed(2),
      c.avgBasket.toFixed(2),
      segmentLabels[c.segment] ?? c.segment,
      c.lastOrder || "-",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Segment pills ----

  const segmentFilters: { value: SegmentFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "VIP", label: "VIP" },
    { value: "regular", label: "Reguliers" },
    { value: "new", label: "Nouveaux" },
    { value: "inactive", label: "Inactifs" },
  ];

  // ---- Loading ----

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="rounded-xl bg-white shadow-sm p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-wood">
          Gestion des clients
        </h1>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary-light"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total clients</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Clients VIP</p>
              <p className="mt-1 text-3xl font-bold text-accent">{stats.vip}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Crown className="h-6 w-6 text-accent" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Nouveaux ce mois</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{stats.newThisMonth}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">CA moyen/client</p>
              <p className="mt-1 text-3xl font-bold text-primary">{formatPrice(stats.avgSpent)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Segment pills */}
        <div className="flex flex-wrap gap-2">
          {segmentFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setSegmentFilter(s.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                segmentFilter === s.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    Client
                    <SortIcon column="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Telephone
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort("orders")}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    Commandes
                    <SortIcon column="orders" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("totalSpent")}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    CA total
                    <SortIcon column="totalSpent" />
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">
                  Panier moyen
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Segment
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 xl:table-cell">
                  Derniere commande
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2">Aucun client ne correspond aux filtres.</p>
                  </td>
                </tr>
              )}
              {filteredClients.map((client) => {
                const isExpanded = expandedId === client.id;
                return (
                  <ClientRow
                    key={client.id}
                    client={client}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedId(isExpanded ? null : client.id)
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""} affiche{filteredClients.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ---- Client row ----

function ClientRow({
  client,
  isExpanded,
  onToggle,
}: {
  client: AdminClient;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-gray-50 transition-colors hover:bg-cream/50 cursor-pointer",
          isExpanded && "bg-cream/30"
        )}
        onClick={onToggle}
      >
        {/* Client name + email */}
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-900">{client.name}</p>
            <p className="text-xs text-gray-500">{client.email}</p>
          </div>
        </td>

        {/* Phone */}
        <td className="px-4 py-3 text-gray-600">{client.phone}</td>

        {/* Orders */}
        <td className="px-4 py-3 text-center font-medium text-gray-900">
          {client.orders}
        </td>

        {/* Total spent */}
        <td className="px-4 py-3 text-right font-semibold text-gray-900">
          {formatPrice(client.totalSpent)}
        </td>

        {/* Avg basket */}
        <td className="hidden px-4 py-3 text-right text-gray-600 lg:table-cell">
          {formatPrice(client.avgBasket)}
        </td>

        {/* Segment badge */}
        <td className="px-4 py-3 text-center">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              segmentColors[client.segment] ?? "bg-gray-100 text-gray-600"
            )}
          >
            {segmentLabels[client.segment] ?? client.segment}
          </span>
        </td>

        {/* Last order */}
        <td className="hidden px-4 py-3 text-gray-600 xl:table-cell">
          {client.lastOrder || "-"}
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Voir
          </button>
        </td>
      </tr>

      {/* Expanded detail */}
      {isExpanded && (
        <tr className="bg-cream/20">
          <td colSpan={8} className="px-4 py-5">
            <div className="animate-fade-in grid gap-6 md:grid-cols-3">
              {/* Client details */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-wood">
                  <Users className="h-4 w-4" />
                  Informations client
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Premier achat :</span>
                    <span className="text-gray-700">{client.firstOrder || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Dernier achat :</span>
                    <span className="text-gray-700">{client.lastOrder || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Order history summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-wood">
                  <ShoppingCart className="h-4 w-4" />
                  Historique commandes
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Nombre total</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {client.orders} commande{client.orders > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">CA cumule</span>
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(client.totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Panier moyen</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(client.avgBasket)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Frequence</span>
                    <span className="text-sm font-medium text-gray-700">
                      {client.orders > 0 && client.firstOrder
                        ? (() => {
                            const months = Math.max(
                              1,
                              Math.ceil(
                                (new Date().getTime() -
                                  new Date(client.firstOrder).getTime()) /
                                  (1000 * 60 * 60 * 24 * 30)
                              )
                            );
                            return `~${(client.orders / months).toFixed(1)}/mois`;
                          })()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loyalty & notes */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-wood">
                  <Gift className="h-4 w-4" />
                  Fidelite
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Points fidelite</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <Star className="h-4 w-4" />
                      {client.loyaltyPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Segment</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        segmentColors[client.segment] ?? "bg-gray-100 text-gray-600"
                      )}
                    >
                      {segmentLabels[client.segment] ?? client.segment}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Notes internes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ajouter une note sur ce client..."
                      className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
