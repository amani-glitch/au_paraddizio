"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Tag,
  Pencil,
  Trash2,
  X,
  Check,
  Copy,
  TrendingUp,
  Percent,
  DollarSign,
  Truck,
  Gift,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Hash,
  ShoppingCart,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Promotion {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_delivery" | "free_product";
  description: string;
  value: number;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  firstOrderOnly: boolean;
  isActive: boolean;
  revenueGenerated: number;
}

type PromoType = Promotion["type"];

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialPromos: Promotion[] = [
  {
    id: "promo-1",
    code: "BIENVENUE",
    type: "percentage",
    description: "10% sur la premiere commande",
    value: 10,
    minAmount: 0,
    maxUses: 100,
    usedCount: 45,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    firstOrderOnly: true,
    isActive: true,
    revenueGenerated: 1125,
  },
  {
    id: "promo-2",
    code: "PIZZA10",
    type: "fixed",
    description: "10 EUR de reduction des 15 EUR",
    value: 10,
    minAmount: 15,
    maxUses: 50,
    usedCount: 12,
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    firstOrderOnly: false,
    isActive: true,
    revenueGenerated: 420,
  },
  {
    id: "promo-3",
    code: "LIVRAISON",
    type: "free_delivery",
    description: "Livraison gratuite",
    value: 0,
    minAmount: 20,
    maxUses: 200,
    usedCount: 28,
    startDate: "2026-02-01",
    endDate: "2026-12-31",
    firstOrderOnly: false,
    isActive: true,
    revenueGenerated: 784,
  },
];

const typeLabels: Record<PromoType, string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
  free_delivery: "Livraison gratuite",
  free_product: "Produit offert",
};

const typeIcons: Record<PromoType, typeof Percent> = {
  percentage: Percent,
  fixed: DollarSign,
  free_delivery: Truck,
  free_product: Gift,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const emptyForm = {
    code: "",
    type: "percentage" as PromoType,
    value: 0,
    minAmount: 0,
    maxUses: 100,
    startDate: "",
    endDate: "",
    firstOrderOnly: false,
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  // ─── Fetch from API ────────────────────────────────────────────────────

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromos(Array.isArray(data) ? data.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          code: (p.code as string) ?? "",
          type: (p.type as PromoType) ?? "percentage",
          description: (p.description as string) ?? "",
          value: (p.value as number) ?? 0,
          minAmount: (p.minAmount as number) ?? 0,
          maxUses: (p.maxUses as number) ?? 0,
          usedCount: (p.usedCount as number) ?? 0,
          startDate: (p.startDate as string) ?? "",
          endDate: (p.endDate as string) ?? "",
          firstOrderOnly: (p.firstOrderOnly as boolean) ?? false,
          isActive: (p.isActive as boolean) ?? true,
          revenueGenerated: (p.revenueGenerated as number) ?? 0,
        })) : []);
      }
    } catch {
      toast.error("Erreur lors du chargement des promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  async function handleToggleActive(id: string) {
    const promo = promos.find(p => p.id === id);
    if (!promo) return;
    const newVal = !promo.isActive;
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: newVal } : p));
    try {
      await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newVal }),
      });
    } catch {
      setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !newVal } : p));
      toast.error("Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette promotion ?")) return;
    const backup = promos;
    setPromos(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Promotion supprimée");
    } catch {
      setPromos(backup);
      toast.error("Erreur lors de la suppression");
    }
  }

  function handleEdit(promo: Promotion) {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minAmount: promo.minAmount,
      maxUses: promo.maxUses,
      startDate: promo.startDate,
      endDate: promo.endDate,
      firstOrderOnly: promo.firstOrderOnly,
      isActive: promo.isActive,
    });
    setShowForm(true);
  }

  function handleCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleSave() {
    if (!form.code.trim()) return;

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      minAmount: form.minAmount,
      maxUses: form.maxUses,
      startDate: form.startDate,
      endDate: form.endDate,
      firstOrderOnly: form.firstOrderOnly,
      isActive: form.isActive,
      description: getDescription(form.type, form.value, form.minAmount),
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/promotions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Promotion mise à jour");
      } else {
        const res = await fetch("/api/admin/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("Promotion créée");
      }
      await fetchPromos();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }

    setShowForm(false);
    setEditingId(null);
  }

  function getDescription(type: PromoType, value: number, minAmount: number): string {
    switch (type) {
      case "percentage":
        return `${value}% de reduction${minAmount > 0 ? ` des ${formatPrice(minAmount)}` : ""}`;
      case "fixed":
        return `${formatPrice(value)} de reduction${minAmount > 0 ? ` des ${formatPrice(minAmount)}` : ""}`;
      case "free_delivery":
        return `Livraison gratuite${minAmount > 0 ? ` des ${formatPrice(minAmount)}` : ""}`;
      case "free_product":
        return "Produit offert";
      default:
        return "";
    }
  }

  function formatValue(promo: Promotion): string {
    switch (promo.type) {
      case "percentage":
        return `-${promo.value}%`;
      case "fixed":
        return `-${formatPrice(promo.value)}`;
      case "free_delivery":
        return "Gratuit";
      case "free_product":
        return "Offert";
      default:
        return "";
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-wood">
          Promotions & Codes promo
        </h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Creer un code
        </button>
      </div>

      {/* Active promotions */}
      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Promotions actives
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promos.map((promo) => {
            const TypeIcon = typeIcons[promo.type];
            return (
              <div
                key={promo.id}
                className={cn(
                  "rounded-xl border bg-white p-6 shadow-sm transition-all",
                  promo.isActive
                    ? "border-gray-200"
                    : "border-gray-100 opacity-60"
                )}
              >
                {/* Header: code + toggle */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-gray-900">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(promo.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copier le code"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{typeLabels[promo.type]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(promo.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title={promo.isActive ? "Desactiver" : "Activer"}
                  >
                    {promo.isActive ? (
                      <ToggleRight className="h-7 w-7 text-secondary" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-gray-300" />
                    )}
                  </button>
                </div>

                {/* Value display */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {formatValue(promo)}
                  </span>
                  {promo.minAmount > 0 && (
                    <span className="text-sm text-gray-500">
                      des {formatPrice(promo.minAmount)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600">{promo.description}</p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-2.5 text-center">
                    <p className="text-xs text-gray-500">Utilisations</p>
                    <p className="text-sm font-bold text-gray-900">
                      {promo.usedCount}/{promo.maxUses}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5 text-center">
                    <p className="text-xs text-gray-500">Statut</p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        promo.isActive ? "text-secondary" : "text-gray-400"
                      )}
                    >
                      {promo.isActive ? "Actif" : "Inactif"}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {promo.startDate} - {promo.endDate}
                  </span>
                </div>

                {promo.firstOrderOnly && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    <Tag className="h-3 w-3" />
                    Premiere commande uniquement
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-wood">
                {editingId ? "Modifier la promotion" : "Creer un code promo"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="EX: SUMMER2026"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm uppercase focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as PromoType })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                  <option value="free_delivery">Livraison gratuite</option>
                  <option value="free_product">Produit offert</option>
                </select>
              </div>

              {/* Value */}
              {(form.type === "percentage" || form.type === "fixed") && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Valeur {form.type === "percentage" ? "(%)" : "(EUR)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Min amount */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Montant minimum (EUR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Max uses */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre max d&apos;utilisations
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxUses: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date debut
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, firstOrderOnly: !form.firstOrderOnly })
                    }
                    className="text-gray-400"
                  >
                    {form.firstOrderOnly ? (
                      <ToggleRight className="h-6 w-6 text-secondary" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <span className="text-sm text-gray-700">Premiere commande uniquement</span>
                </label>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className="text-gray-400"
                  >
                    {form.isActive ? (
                      <ToggleRight className="h-6 w-6 text-secondary" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                <Check className="h-4 w-4" />
                {editingId ? "Enregistrer" : "Creer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance section */}
      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-gray-900">
          Performance des promotions
        </h2>
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Utilisations
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Taux utilisation
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  CA genere
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => {
                const usagePercent =
                  promo.maxUses > 0
                    ? Math.round((promo.usedCount / promo.maxUses) * 100)
                    : 0;
                return (
                  <tr
                    key={promo.id}
                    className="border-b border-gray-50 hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-gray-900">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {typeLabels[promo.type]}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900">
                      {promo.usedCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {usagePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-secondary">
                      {formatPrice(promo.revenueGenerated)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          promo.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {promo.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50/50 font-semibold">
                <td className="px-4 py-3 text-gray-700">Total</td>
                <td />
                <td className="px-4 py-3 text-center text-gray-900">
                  {promos.reduce((s, p) => s + p.usedCount, 0)}
                </td>
                <td />
                <td className="px-4 py-3 text-right text-secondary">
                  {formatPrice(
                    promos.reduce((s, p) => s + p.revenueGenerated, 0)
                  )}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
