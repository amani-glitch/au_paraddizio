"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

const allergensList = ["Gluten", "Lait", "Oeuf", "Poisson", "Crustacés", "Arachides", "Soja", "Fruits à coque", "Céleri", "Moutarde", "Sésame", "Sulfites", "Lupin", "Mollusques"];
const dietaryList = ["Végétarien", "Végan", "Halal", "Sans gluten"];

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [sizes, setSizes] = useState([
    { name: "29 cm", price: "" },
    { name: "33 cm", price: "" },
    { name: "40 cm", price: "" },
  ]);
  const [supplements, setSupplements] = useState<{ name: string; price: string; category: string }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [isPizzaOfMonth, setIsPizzaOfMonth] = useState(false);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const addSize = () => setSizes([...sizes, { name: "", price: "" }]);
  const removeSize = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: "name" | "price", val: string) => {
    setSizes(sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const addSupplement = () => setSupplements([...supplements, { name: "", price: "", category: "topping" }]);
  const removeSupplement = (i: number) => setSupplements(supplements.filter((_, idx) => idx !== i));
  const updateSupplement = (i: number, field: string, val: string) => {
    setSupplements(supplements.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const toggleAllergen = (a: string) => {
    setAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const toggleDietary = (d: string) => {
    setDietary(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !basePrice) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    toast.success("Produit créé avec succès !");
    router.push("/admin/produits");
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/produits" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Produits
        </Link>
        <span>/</span>
        <span className="text-gray-900">Nouveau produit</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Section: Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informations générales</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom du produit *</label>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ex: Margherita" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Description du produit..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie *</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                  <option value="">Sélectionner...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Prix de base (€) *</label>
                <input type="number" step="0.01" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" placeholder="8.50" />
              </div>
            </div>
          </div>

          {/* Section: Sizes */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tailles et prix</h2>
              <button type="button" onClick={addSize} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="text" value={s.name} onChange={(e) => updateSize(i, "name", e.target.value)} placeholder="Nom (ex: 33 cm)" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  <div className="relative">
                    <input type="number" step="0.01" min="0" value={s.price} onChange={(e) => updateSize(i, "price", e.target.value)} placeholder="Prix" className="w-28 rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm focus:border-primary focus:outline-none" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                  </div>
                  <button type="button" onClick={() => removeSize(i)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Supplements */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Suppléments</h2>
              <button type="button" onClick={addSupplement} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>
            {supplements.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun supplément. Cliquez sur &quot;Ajouter&quot; pour en créer.</p>
            ) : (
              <div className="space-y-3">
                {supplements.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="text" value={s.name} onChange={(e) => updateSupplement(i, "name", e.target.value)} placeholder="Nom" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    <input type="number" step="0.01" min="0" value={s.price} onChange={(e) => updateSupplement(i, "price", e.target.value)} placeholder="Prix" className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    <select value={s.category} onChange={(e) => updateSupplement(i, "category", e.target.value)} className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                      <option value="base">Base</option>
                      <option value="topping">Garniture</option>
                      <option value="sauce">Sauce</option>
                    </select>
                    <button type="button" onClick={() => removeSupplement(i)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Options & Badges */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Options et badges</h2>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Actif", value: isActive, set: setIsActive },
                { label: "Nouveau", value: isNew, set: setIsNew },
                { label: "Best-seller", value: isBestSeller, set: setIsBestSeller },
                { label: "En promotion", value: isPromo, set: setIsPromo },
                { label: "Pizza du mois", value: isPizzaOfMonth, set: setIsPizzaOfMonth },
              ].map((opt) => (
                <label key={opt.label} className="flex cursor-pointer items-center gap-2">
                  <div
                    onClick={() => opt.set(!opt.value)}
                    className={cn("relative h-6 w-11 rounded-full transition-colors", opt.value ? "bg-primary" : "bg-gray-300")}
                  >
                    <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", opt.value ? "left-[22px]" : "left-0.5")} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Allergens */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Allergènes</h2>
            <div className="flex flex-wrap gap-2">
              {allergensList.map((a) => (
                <button key={a} type="button" onClick={() => toggleAllergen(a)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", allergens.includes(a) ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  {a}
                </button>
              ))}
            </div>
            <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">Régimes alimentaires</h2>
            <div className="flex flex-wrap gap-2">
              {dietaryList.map((d) => (
                <button key={d} type="button" onClick={() => toggleDietary(d)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", dietary.includes(d) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-6 flex items-center justify-end gap-3 rounded-xl bg-white p-4 shadow-sm">
          <Link href="/admin/produits" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Annuler
          </Link>
          <button type="submit" className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
