"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { searchProducts } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";
import type { Product } from "@/types";

export default function SearchOverlay() {
  const { isSearchOpen, toggleSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query));
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
        onClick={toggleSearch}
      />
      <div className="fixed inset-x-0 top-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-2xl px-4 pt-20">
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Search input */}
            <div className="flex items-center border-b border-gray-200 px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une pizza, un dessert..."
                className="flex-1 border-0 bg-transparent px-3 py-4 text-base text-wood outline-none placeholder:text-gray-400"
              />
              <button
                onClick={toggleSearch}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/menu/${product.slug}`}
                    onClick={toggleSearch}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-cream"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-lg">
                      {product.categoryId === "cat-pizzas"
                        ? "🍕"
                        : product.categoryId === "cat-desserts"
                        ? "🍰"
                        : product.categoryId === "cat-boissons"
                        ? "🥤"
                        : "🍽️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-wood">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {product.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {formatPrice(product.sizes[0]?.price ?? product.basePrice)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty state */}
            {query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">
                  Aucun résultat pour &quot;{query}&quot;
                </p>
              </div>
            )}

            {/* Quick links */}
            {query.length < 2 && (
              <div className="px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Recherches populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Margherita", "4 Fromages", "Calzone", "Végétarienne", "Tiramisu"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-wood transition-colors hover:bg-primary hover:text-white"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
