"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";
import type { Product, Category } from "@/types";

type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";
type DietaryFilter = "vegetarian" | "vegan" | "halal" | "sans-gluten" | "";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularité" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "newest", label: "Nouveautés" },
];

const dietaryOptions: { value: DietaryFilter; label: string }[] = [
  { value: "", label: "Tous les régimes" },
  { value: "vegetarian", label: "Végétarien" },
  { value: "vegan", label: "Végan" },
  { value: "halal", label: "Halal" },
  { value: "sans-gluten", label: "Sans gluten" },
];

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dietary, setDietary] = useState<DietaryFilter>("");
  const [sort, setSort] = useState<SortOption>("popularity");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
    }).finally(() => setLoading(false));
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Dietary filter
    if (dietary) {
      result = result.filter((p) => p.dietary.includes(dietary));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "popularity":
      default:
        result.sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
        break;
    }

    return result;
  }, [selectedCategory, dietary, sort, searchQuery, products]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mt-3 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-wood sm:text-4xl">
          Notre Carte
        </h1>
        <p className="mt-2 text-gray-500">
          Découvrez nos pizzas artisanales cuites au feu de bois et toutes nos spécialités
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-primary text-white"
                : "bg-white text-wood hover:bg-primary/10"
            )}
          >
            Tout
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-white text-wood hover:bg-primary/10"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / sort bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Dietary filter */}
          <div className="relative">
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value as DietaryFilter)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-wood focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
            >
              {dietaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-wood focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-wood placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-64"
          />
        </div>
      </div>

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SlidersHorizontal className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="font-heading text-xl font-semibold text-wood">
            Aucun produit trouvé
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setDietary("");
              setSort("popularity");
              setSearchQuery("");
            }}
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
