"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
}

function getCategoryEmoji(categoryId: string): string {
  switch (categoryId) {
    case "cat-pizzas":
      return "\uD83C\uDF55";
    case "cat-desserts":
      return "\uD83C\uDF70";
    case "cat-boissons":
      return "\uD83E\uDD64";
    case "cat-entrees":
      return "\uD83E\uDD57";
    case "cat-menus":
      return "\uD83C\uDF7D\uFE0F";
    case "cat-extras":
      return "\u2795";
    default:
      return "\uD83C\uDF55";
  }
}

const allergenLabels: Record<string, string> = {
  gluten: "Gluten",
  lait: "Lait",
  oeuf: "Oeuf",
  poisson: "Poisson",
  arachide: "Arachide",
  soja: "Soja",
  "fruits-a-coque": "Fruits \u00e0 coque",
  celeri: "C\u00e9leri",
  moutarde: "Moutarde",
  sesame: "S\u00e9same",
  sulfites: "Sulfites",
  lupin: "Lupin",
  mollusques: "Mollusques",
  crustaces: "Crustac\u00e9s",
};

const dietaryLabels: Record<string, string> = {
  vegetarian: "V\u00e9g\u00e9tarien",
  vegan: "V\u00e9gan",
  halal: "Halal",
  "sans-gluten": "Sans gluten",
};

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  const selectedSize = product.sizes[selectedSizeIndex];
  const lowestPrice = Math.min(...product.sizes.map((s) => s.price));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product,
      size: selectedSize,
      quantity: 1,
      supplements: [],
      removedIngredients: [],
      specialInstructions: "",
    });
  };

  return (
    <Link href={`/menu/${product.slug}`} className="block">
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        {/* Image placeholder */}
        <div className="relative flex h-48 items-center justify-center bg-cream">
          <span className="text-6xl">{getCategoryEmoji(product.categoryId)}</span>

          {/* Badges */}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {product.isPizzaOfMonth && (
              <Badge variant="pizzaOfMonth">Pizza du mois</Badge>
            )}
            {product.isNew && !product.isPizzaOfMonth && (
              <Badge variant="new">Nouveau</Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="bestseller">Best-seller</Badge>
            )}
            {product.isPromo && <Badge variant="promo">Promo</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* Name */}
          <h3 className="font-heading text-lg font-semibold text-wood">
            {product.name}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>

          {/* Allergens */}
          {product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                >
                  {allergenLabels[allergen] || allergen}
                </span>
              ))}
            </div>
          )}

          {/* Dietary tags */}
          {product.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.dietary.map((diet) => (
                <span
                  key={diet}
                  className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary"
                >
                  {dietaryLabels[diet] || diet}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <p className="mt-1 font-heading text-lg font-bold text-primary">
            {product.sizes.length > 1
              ? `\u00C0 partir de ${formatPrice(lowestPrice)}`
              : formatPrice(lowestPrice)}
          </p>

          {/* Size selector */}
          {product.sizes.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size, index) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSizeIndex(index);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedSizeIndex === index
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                  )}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}

          {/* Add to cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </Link>
  );
}
