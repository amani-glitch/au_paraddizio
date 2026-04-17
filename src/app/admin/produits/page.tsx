"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ---- Types ----

interface ProductSize {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  sizes: ProductSize[];
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isPromo: boolean;
  isPizzaOfMonth: boolean;
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const categoryEmojis: Record<string, string> = {
  "cat-pizzas": "\uD83C\uDF55",
  "cat-entrees": "\uD83E\uDD57",
  "cat-desserts": "\uD83C\uDF70",
  "cat-boissons": "\uD83E\uDD64",
  "cat-menus": "\uD83D\uDCE6",
  "cat-extras": "\u2795",
};

// ---- Skeleton ----

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-gray-200", className)} />
  );
}

export default function AdminProductsPage() {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch products and categories in parallel
  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?all=true"),
        fetch("/api/categories"),
      ]);

      if (!productsRes.ok) throw new Error("Erreur lors du chargement des produits");
      if (!categoriesRes.ok) throw new Error("Erreur lors du chargement des categories");

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setLocalProducts(
        (Array.isArray(productsData) ? productsData : []).map((p: Product) => ({
          ...p,
          isActive: p.isActive ?? true,
          isNew: p.isNew ?? false,
          isBestSeller: p.isBestSeller ?? false,
          isPromo: p.isPromo ?? false,
          isPizzaOfMonth: p.isPizzaOfMonth ?? false,
          sizes: p.sizes ?? [],
        }))
      );
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Impossible de charger les donnees"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return localProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
      return true;
    });
  }, [localProducts, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: localProducts.length,
    active: localProducts.filter(p => p.isActive).length,
    bestSellers: localProducts.filter(p => p.isBestSeller).length,
    pizzaOfMonth: localProducts.filter(p => p.isPizzaOfMonth).length,
  }), [localProducts]);

  const toggleActive = async (id: string) => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    const newVal = !product.isActive;
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: newVal } : p));
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newVal }),
      });
      if (!res.ok) throw new Error();
      toast.success(newVal ? "Produit activé" : "Produit désactivé");
    } catch {
      setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !newVal } : p));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleBadge = async (id: string, badge: "isNew" | "isBestSeller" | "isPromo" | "isPizzaOfMonth") => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    const newVal = !product[badge];
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, [badge]: newVal } : p));
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [badge]: newVal }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, [badge]: !newVal } : p));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const backup = localProducts;
    setLocalProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produit supprimé");
    } catch {
      setLocalProducts(backup);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? "";

  // ---- Loading ----
  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <div className="rounded-xl bg-white shadow-sm p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
          <p className="text-sm text-gray-500">{stats.total} produits au total</p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-800" },
          { label: "Actifs", value: stats.active, color: "bg-green-100 text-green-800" },
          { label: "Best-sellers", value: stats.bestSellers, color: "bg-accent/20 text-wood" },
          { label: "Pizza du mois", value: stats.pizzaOfMonth, color: "bg-primary/10 text-primary" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg px-4 py-3 text-center", s.color)}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">Toutes categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Desktop table */}
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Tailles</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{categoryEmojis[p.categoryId] ?? "\uD83C\uDF7D\uFE0F"}</span>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="max-w-[200px] truncate text-xs text-gray-500">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(p.categoryId)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(p.sizes ?? []).map((s) => (
                        <span key={s.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{s.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                        p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}
                    >
                      {p.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(["isNew", "isBestSeller", "isPromo", "isPizzaOfMonth"] as const).map((badge) => {
                        const labels: Record<string, string> = { isNew: "New", isBestSeller: "Best", isPromo: "Promo", isPizzaOfMonth: "PdM" };
                        const colors: Record<string, string> = { isNew: "bg-secondary text-white", isBestSeller: "bg-accent text-wood", isPromo: "bg-primary text-white", isPizzaOfMonth: "bg-purple-500 text-white" };
                        return (
                          <button
                            key={badge}
                            onClick={() => toggleBadge(p.id, badge)}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold transition-opacity",
                              p[badge] ? colors[badge] : "bg-gray-100 text-gray-400 opacity-50"
                            )}
                          >
                            {labels[badge]}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-gray-100 lg:hidden">
          {filtered.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryEmojis[p.categoryId] ?? "\uD83C\uDF7D\uFE0F"}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{getCategoryName(p.categoryId)}</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{formatPrice(p.basePrice)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleActive(p.id)}
                    className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", p.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}
                  >
                    {p.isActive ? "Actif" : "Inactif"}
                  </button>
                  {p.isBestSeller && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-wood">Best</span>}
                </div>
                <div className="flex gap-1">
                  <Link href={`/admin/produits/${p.id}`} className="rounded-lg p-1.5 text-gray-400 hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Aucun produit trouve</p>
          </div>
        )}
      </div>
    </div>
  );
}
