"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { categories, products } from "@/lib/data";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";

type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";
type DietaryFilter = "vegetarian" | "vegan" | "halal" | "sans-gluten" | "";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularit\u00e9" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix d\u00e9croissant" },
  { value: "newest", label: "Nouveaut\u00e9s" },
];

const dietaryOptions: { value: DietaryFilter; label: string }[] = [
  { value: "", label: "Tous les r\u00e9gimes" },
  { value: "vegetarian", label: "V\u00e9g\u00e9tarien" },
  { value: "vegan", label: "V\u00e9gan" },
  { value: "halal", label: "Halal" },
  { value: "sans-gluten", label: "Sans gluten" },
];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dietary, setDietary] = useState<DietaryFilter>("");
  const [sort, setSort] = useState<SortOption>("popularity");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    []
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
  }, [selectedCategory, dietary, sort, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-wood sm:text-4xl">
          Notre Carte
        </h1>
        <p className="mt-2 text-gray-500">
          D&eacute;couvrez nos pizzas artisanales cuites au feu de bois et toutes nos sp&eacute;cialit&eacute;s
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
            Aucun produit trouv&eacute;
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
            R&eacute;initialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
