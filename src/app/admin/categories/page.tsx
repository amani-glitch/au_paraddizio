"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category, Product } from "@/types";

const categoryEmojis: Record<string, string> = {
  "cat-pizzas": "🍕", "cat-entrees": "🥗", "cat-desserts": "🍰",
  "cat-boissons": "🥤", "cat-menus": "📦", "cat-extras": "➕",
};

interface CategoryForm { name: string; slug: string; description: string; order: number; isActive: boolean; }
const emptyForm: CategoryForm = { name: "", slug: "", description: "", order: 0, isActive: true };

export default function AdminCategoriesPage() {
  const [localCategories, setLocalCategories] = useState<(Category & { isActive: boolean })[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([cats, prods]) => {
      setLocalCategories((cats as Category[]).map(c => ({ ...c, isActive: true })));
      setAllProducts(prods);
    }).finally(() => setLoading(false));
  }, []);

  const productCount = (catId: string) => allProducts.filter(p => p.categoryId === catId).length;

  const startEdit = (cat: typeof localCategories[0]) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, order: cat.order, isActive: cat.isActive });
    setShowAdd(false);
  };

  const cancelEdit = () => { setEditingId(null); setShowAdd(false); setForm(emptyForm); };

  const saveEdit = () => {
    if (!form.name) { toast.error("Le nom est requis"); return; }
    if (editingId) {
      setLocalCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
      toast.success("Catégorie modifiée");
    } else {
      const newCat = { id: `cat-new-${Date.now()}`, ...form, image: "", parentId: undefined, children: undefined };
      setLocalCategories(prev => [...prev, newCat]);
      toast.success("Catégorie créée");
    }
    cancelEdit();
  };

  const deleteCategory = (id: string) => {
    const count = productCount(id);
    if (count > 0) { toast.error(`Impossible: ${count} produits dans cette catégorie`); return; }
    if (confirm("Supprimer cette catégorie ?")) {
      setLocalCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Catégorie supprimée");
    }
  };

  const toggleActive = (id: string) => {
    setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const slugify = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const FormSection = () => (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ordre d&apos;affichage</label>
          <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2">
            <div onClick={() => setForm({ ...form, isActive: !form.isActive })} className={cn("relative h-6 w-11 rounded-full transition-colors", form.isActive ? "bg-primary" : "bg-gray-300")}>
              <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", form.isActive ? "left-[22px]" : "left-0.5")} />
            </div>
            <span className="text-sm font-medium text-gray-700">Actif</span>
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={cancelEdit} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <X className="mr-1 inline h-4 w-4" />Annuler
        </button>
        <button onClick={saveEdit} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          <Save className="h-4 w-4" />Enregistrer
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
          <p className="text-sm text-gray-500">{localCategories.length} catégories</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {(showAdd || editingId) && <div className="mb-6"><FormSection /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        {localCategories.sort((a, b) => a.order - b.order).map((cat) => (
          <div key={cat.id} className={cn("rounded-xl bg-white p-5 shadow-sm transition-opacity", !cat.isActive && "opacity-60")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-2xl">
                  {categoryEmojis[cat.id] ?? "📁"}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="font-mono text-xs text-gray-400">/{cat.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(cat.id)} className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                  {cat.isActive ? "Actif" : "Inactif"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Grid3x3 className="h-3.5 w-3.5" /> Ordre: {cat.order}</span>
                <span>{productCount(cat.id)} produits</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(cat)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
