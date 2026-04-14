"use client";

import { useState } from "react";
import { Heart, HeartOff, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types";

// Mock: first 4 products as favorites
const initialFavorites = products.slice(0, 4);

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<Product[]>(initialFavorites);

  function removeFavorite(productId: string) {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="font-heading text-2xl font-bold text-wood">
          Mes favoris
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <HeartOff className="mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">
            Aucun favori pour le moment
          </p>
          <p className="mt-1 mb-6 text-sm text-gray-400">
            Parcourez notre menu et ajoutez vos produits pr&eacute;f&eacute;r&eacute;s.
          </p>
          <Link
            href="/menu"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            Voir le menu
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => removeFavorite(product.id)}
                className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-red-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50"
              >
                <Heart className="h-3.5 w-3.5 fill-red-500" />
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
