"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { getProductBySlug, products, categories } from "@/lib/data";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/ui/ProductCard";
import type { Product, ProductSupplement } from "@/types";

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

// Common pizza ingredients that can be removed
const removableIngredients: Record<string, string[]> = {
  "cat-pizzas": [
    "Sauce tomate",
    "Mozzarella",
    "Oignons",
    "Olives",
    "Champignons",
    "Poivrons",
    "Basilic",
  ],
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const product = getProductBySlug(slug);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedSupplements, setSelectedSupplements] = useState<
    ProductSupplement[]
  >([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [showRemovedIngredients, setShowRemovedIngredients] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [halfHalfEnabled, setHalfHalfEnabled] = useState(false);
  const [halfHalfProductId, setHalfHalfProductId] = useState<string>("");

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-bold text-wood">
          Produit introuvable
        </h1>
        <p className="mt-2 text-gray-500">
          Ce produit n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Retour au menu
        </Link>
      </div>
    );
  }

  const selectedSize = product.sizes[selectedSizeIndex];
  const isPizza = product.categoryId === "cat-pizzas";

  // Group supplements by category
  const supplementsByCategory = useMemo(() => {
    const grouped: Record<string, ProductSupplement[]> = {};
    product.supplements.forEach((sup) => {
      const cat = sup.category === "base" ? "Base" : "Garnitures";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(sup);
    });
    return grouped;
  }, [product.supplements]);

  // Available pizzas for half & half
  const halfHalfOptions = useMemo(
    () =>
      products.filter(
        (p) =>
          p.categoryId === "cat-pizzas" &&
          p.isActive &&
          p.id !== product.id
      ),
    [product.id]
  );

  const halfHalfProduct = halfHalfEnabled
    ? products.find((p) => p.id === halfHalfProductId)
    : undefined;

  // Calculate total
  const supplementsTotal = selectedSupplements.reduce(
    (sum, s) => sum + s.price,
    0
  );
  const unitPrice = selectedSize.price + supplementsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToggleSupplement = (supplement: ProductSupplement) => {
    setSelectedSupplements((prev) => {
      const exists = prev.find((s) => s.id === supplement.id);
      if (exists) {
        return prev.filter((s) => s.id !== supplement.id);
      }
      return [...prev, supplement];
    });
  };

  const handleToggleRemovedIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddToCart = () => {
    const halfHalf =
      halfHalfEnabled && halfHalfProduct
        ? {
            product: halfHalfProduct,
            size: halfHalfProduct.sizes[0],
            supplements: [],
          }
        : undefined;

    addItem({
      product,
      size: selectedSize,
      quantity,
      supplements: selectedSupplements,
      removedIngredients,
      halfHalf,
      specialInstructions,
    });

    router.push("/menu");
  };

  // Cross-sell: 3 random products from different categories
  const crossSellProducts = useMemo(() => {
    const otherProducts = products.filter(
      (p) => p.id !== product.id && p.isActive
    );
    const byCat: Record<string, Product[]> = {};
    otherProducts.forEach((p) => {
      if (!byCat[p.categoryId]) byCat[p.categoryId] = [];
      byCat[p.categoryId].push(p);
    });
    const picks: Product[] = [];
    const catKeys = Object.keys(byCat);
    for (const key of catKeys) {
      if (picks.length >= 3) break;
      const arr = byCat[key];
      const randomIndex = Math.floor(Math.random() * arr.length);
      picks.push(arr[randomIndex]);
    }
    // Fill up to 3 if needed
    while (picks.length < 3 && otherProducts.length > picks.length) {
      const candidate =
        otherProducts[Math.floor(Math.random() * otherProducts.length)];
      if (!picks.find((p) => p.id === candidate.id)) {
        picks.push(candidate);
      }
    }
    return picks.slice(0, 3);
  }, [product.id]);

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="transition-colors hover:text-primary">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/menu" className="transition-colors hover:text-primary">
          Menu
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-wood">{product.name}</span>
      </nav>

      {/* Main content: two columns on desktop */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column: image placeholder */}
        <div className="flex items-center justify-center rounded-2xl bg-cream p-8 lg:min-h-[500px]">
          <div className="text-center">
            <span className="text-9xl">{getCategoryEmoji(product.categoryId)}</span>
            {/* Badges */}
            <div className="mt-4 flex justify-center gap-2">
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
        </div>

        {/* Right column: details */}
        <div className="flex flex-col gap-6">
          {/* Name */}
          <h1 className="font-heading text-3xl font-bold text-wood sm:text-4xl">
            {product.name}
          </h1>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Allergens */}
          {product.allergens.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Info className="h-4 w-4" />
                Allerg&egrave;nes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {allergenLabels[allergen] || allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dietary tags */}
          {product.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.dietary.map((diet) => (
                <span
                  key={diet}
                  className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                >
                  {dietaryLabels[diet] || diet}
                </span>
              ))}
            </div>
          )}

          {/* Size selector */}
          <div>
            <h2 className="mb-3 font-heading text-sm font-semibold text-wood">
              Taille
            </h2>
            <div className="flex flex-col gap-2">
              {product.sizes.map((size, index) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSizeIndex(index)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    selectedSizeIndex === index
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 bg-white text-wood hover:border-primary/50"
                  )}
                >
                  <span>{size.name}</span>
                  <span className="font-semibold">{formatPrice(size.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Supplements */}
          {product.supplements.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-sm font-semibold text-wood">
                Suppl&eacute;ments
              </h2>
              {Object.entries(supplementsByCategory).map(([catName, sups]) => (
                <div key={catName} className="mb-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {catName}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {sups.map((sup) => {
                      const isSelected = selectedSupplements.some(
                        (s) => s.id === sup.id
                      );
                      return (
                        <label
                          key={sup.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors",
                            isSelected
                              ? "border-secondary bg-secondary/5"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSupplement(sup)}
                              className="h-4 w-4 rounded border-gray-300 text-secondary accent-secondary"
                            />
                            <span className="text-wood">{sup.name}</span>
                          </div>
                          {sup.price > 0 && (
                            <span className="text-xs font-medium text-gray-500">
                              +{formatPrice(sup.price)}
                            </span>
                          )}
                          {sup.price === 0 && (
                            <span className="text-xs text-gray-400">Gratuit</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Retirer des ingredients */}
          {isPizza && (
            <div>
              <button
                type="button"
                onClick={() => setShowRemovedIngredients(!showRemovedIngredients)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-wood transition-colors hover:border-gray-300"
              >
                <span>Retirer des ingr&eacute;dients</span>
                {showRemovedIngredients ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {showRemovedIngredients && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {(removableIngredients["cat-pizzas"] || []).map(
                    (ingredient) => {
                      const isRemoved = removedIngredients.includes(ingredient);
                      return (
                        <label
                          key={ingredient}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                            isRemoved
                              ? "border-primary/30 bg-primary/5"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isRemoved}
                            onChange={() =>
                              handleToggleRemovedIngredient(ingredient)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                          />
                          <span
                            className={cn(
                              "text-wood",
                              isRemoved && "line-through text-gray-400"
                            )}
                          >
                            Sans {ingredient.toLowerCase()}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* Half & half (pizza only) */}
          {isPizza && (
            <div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-wood transition-colors hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={halfHalfEnabled}
                  onChange={(e) => {
                    setHalfHalfEnabled(e.target.checked);
                    if (!e.target.checked) setHalfHalfProductId("");
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-accent accent-accent"
                />
                Moiti&eacute;-moiti&eacute; (deux pizzas en une)
              </label>
              {halfHalfEnabled && (
                <div className="relative mt-2">
                  <select
                    value={halfHalfProductId}
                    onChange={(e) => setHalfHalfProductId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-8 text-sm text-wood focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">
                      Choisir la deuxi&egrave;me pizza...
                    </option>
                    {halfHalfOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Special instructions */}
          <div>
            <h2 className="mb-2 font-heading text-sm font-semibold text-wood">
              Instructions sp&eacute;ciales
            </h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ex: bien cuite, couper en 8 parts..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-wood placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Quantity selector + total */}
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-wood transition-colors hover:border-primary hover:text-primary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-heading text-lg font-bold text-wood">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-wood transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-heading text-2xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark"
          >
            <ShoppingCart className="h-5 w-5" />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Cross-sell section */}
      {crossSellProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-wood">
            Compl&eacute;tez votre commande
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {crossSellProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
