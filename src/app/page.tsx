"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Star, Truck, ChefHat, Flame, ArrowRight } from "lucide-react";
import type { OrderMode, Product, Category, StoreInfo } from "@/types";
import { formatPrice, cn, isStoreOpen } from "@/lib/utils";
import { useCartStore } from "@/stores";
import { useState, useEffect } from "react";

// ─── Emoji map for categories ─────────────────────────────────────────────────
const categoryEmojis: Record<string, string> = {
  pizzas: "\uD83C\uDF55",
  "entrees-salades": "\uD83E\uDD57",
  desserts: "\uD83C\uDF70",
  boissons: "\uD83E\uDD64",
  "menus-formules": "\uD83D\uDCE6",
  "extras-supplements": "\u2795",
};

const categoryColors: Record<string, string> = {
  pizzas: "bg-primary/10",
  "entrees-salades": "bg-secondary/10",
  desserts: "bg-accent/10",
  boissons: "bg-blue-100",
  "menus-formules": "bg-wood/10",
  "extras-supplements": "bg-primary-light/10",
};

// ─── Day names in French ──────────────────────────────────────────────────────
const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// ─── Fake reviews ─────────────────────────────────────────────────────────────
const reviews = [
  {
    stars: 5,
    text: "Les meilleures pizzas de la région ! La pâte au feu de bois est incroyable, croustillante et légère. La Corsica est un régal. On revient chaque semaine !",
    name: "Sophie M.",
    date: "Il y a 2 semaines",
  },
  {
    stars: 5,
    text: "Service rapide et pizzas toujours chaudes à la livraison. Les enfants adorent la Margherita et nous la 4 Fromages. Rapport qualité-prix imbattable.",
    name: "Jean-Pierre L.",
    date: "Il y a 1 mois",
  },
  {
    stars: 4,
    text: "Très bonne pizzeria, les ingrédients sont frais et on sent le goût authentique. Le tiramisu maison est une tuerie. Je recommande vivement !",
    name: "Camille D.",
    date: "Il y a 3 semaines",
  },
];

// ─── Order mode labels ────────────────────────────────────────────────────────
const orderModes: { mode: OrderMode; label: string; icon: React.ReactNode }[] = [
  { mode: "DELIVERY", label: "Livraison", icon: <Truck className="w-4 h-4" /> },
  { mode: "TAKEAWAY", label: "À emporter", icon: <ChefHat className="w-4 h-4" /> },
  { mode: "DINE_IN", label: "Sur place", icon: <MapPin className="w-4 h-4" /> },
];

export default function HomePage() {
  const { setOrderMode, orderMode, addItem } = useCartStore();
  const [selectedMode, setSelectedMode] = useState<OrderMode>(orderMode);

  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [pizzaOfMonth, setPizzaOfMonth] = useState<Product | null>(null);
  const [storeData, setStoreData] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
      fetch("/api/store").then(r => r.json()),
    ]).then(([cats, prods, store]) => {
      setCategories(cats);
      const allProducts = prods as Product[];
      setBestSellers(allProducts.filter((p: Product) => p.isBestSeller).slice(0, 4));
      setPizzaOfMonth(allProducts.find((p: Product) => p.isPizzaOfMonth) ?? null);
      setStoreData(store);
    }).finally(() => setLoading(false));
  }, []);

  const open = storeData ? isStoreOpen(storeData.openingHours) : false;

  const handleModeChange = (mode: OrderMode) => {
    setSelectedMode(mode);
    setOrderMode(mode);
  };

  const handleAddBestSeller = (product: typeof bestSellers[0]) => {
    if (product.sizes.length === 0) return;
    addItem({
      product,
      size: product.sizes[0],
      quantity: 1,
      supplements: [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-wood-light text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-[#FFF0DB] to-[#FFE8C8]">
        {/* Decorative pizza emojis background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none" aria-hidden="true">
          <div className="absolute top-10 left-[10%] text-8xl rotate-12">{"\uD83C\uDF55"}</div>
          <div className="absolute top-32 right-[15%] text-6xl -rotate-12">{"\uD83C\uDF55"}</div>
          <div className="absolute bottom-20 left-[20%] text-7xl rotate-45">{"\uD83C\uDF55"}</div>
          <div className="absolute bottom-10 right-[10%] text-9xl -rotate-6">{"\uD83C\uDF55"}</div>
          <div className="absolute top-1/2 left-[50%] text-5xl rotate-90">{"\uD83E\uDD57"}</div>
          <div className="absolute top-16 left-[60%] text-6xl -rotate-30">{"\uD83C\uDF70"}</div>
          <div className="absolute bottom-40 right-[35%] text-7xl rotate-20">{"\uD83C\uDF55"}</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Open/Closed badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm",
                  open
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full animate-pulse",
                    open ? "bg-secondary" : "bg-primary"
                  )}
                />
                {open ? "Ouvert maintenant" : "Fermé actuellement"}
              </span>
            </div>

            {/* Hero heading */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-wood leading-tight mb-6">
              Pizzas artisanales{" "}
              <span className="text-primary">au feu de bois</span>
            </h1>

            <p className="text-lg sm:text-xl text-wood-light leading-relaxed mb-10 max-w-2xl mx-auto">
              Plus de 60 recettes maison, cuites au feu de bois avec des ingrédients frais.
              Livraison et à emporter à Entraigues-sur-la-Sorgue.
            </p>

            {/* Order Mode Selector */}
            <div className="flex flex-col items-center gap-6 mb-10">
              <div className="inline-flex rounded-xl bg-white/80 backdrop-blur-sm shadow-md p-1.5 border border-wood/10">
                {orderModes.map(({ mode, label, icon }) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                      selectedMode === mode
                        ? "bg-primary text-white shadow-md"
                        : "text-wood hover:bg-primary/5"
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Commander maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 53.3C96 46.7 192 33.3 288 26.7C384 20 480 20 576 26.7C672 33.3 768 46.7 864 50C960 53.3 1056 46.7 1152 40C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="var(--color-cream)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — CATEGORIES
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Notre carte
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.slug}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-wood/5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 transition-transform duration-300 group-hover:scale-110",
                    categoryColors[category.slug] || "bg-primary/10"
                  )}
                >
                  {categoryEmojis[category.slug] || "\uD83C\uDF55"}
                </div>
                <h3 className="font-heading font-semibold text-wood text-sm mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-wood-light leading-snug line-clamp-2">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — BEST SELLERS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Nos best-sellers
            </h2>
            <p className="text-wood-light text-lg">
              Les pizzas préférées de nos clients
            </p>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mt-4" />
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide snap-x snap-mandatory">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-auto snap-start bg-white rounded-2xl border border-wood/5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Placeholder image with emoji */}
                <div className="relative h-44 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {"\uD83C\uDF55"}
                  </span>
                  <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Best-seller
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-heading font-bold text-wood text-lg mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-wood-light line-clamp-2 mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-lg">
                      {product.sizes.length > 0
                        ? `Dès ${formatPrice(product.sizes[0].price)}`
                        : formatPrice(product.basePrice)}
                    </span>
                    <button
                      onClick={() => handleAddBestSeller(product)}
                      className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200 shadow-sm hover:shadow"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — PIZZA OF THE MONTH
          ═══════════════════════════════════════════════════════════════════════ */}
      {pizzaOfMonth && (
        <section className="py-16 sm:py-20 bg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-r from-accent/5 via-white to-accent/5 rounded-3xl border-2 border-accent/30 shadow-lg overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-accent rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-accent rounded-br-3xl" />

              <div className="flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                {/* Image placeholder */}
                <div className="flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                  <span className="text-8xl sm:text-9xl">{"\uD83C\uDF55"}</span>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 bg-accent/15 text-accent-light border border-accent/30 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    Pizza du mois
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-3">
                    {pizzaOfMonth.name}
                  </h3>
                  <p className="text-wood-light leading-relaxed mb-6">
                    {pizzaOfMonth.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-primary font-bold text-xl">
                      {pizzaOfMonth.sizes.length > 1
                        ? `${formatPrice(pizzaOfMonth.sizes[0].price)} – ${formatPrice(pizzaOfMonth.sizes[pizzaOfMonth.sizes.length - 1].price)}`
                        : formatPrice(pizzaOfMonth.basePrice)}
                    </span>
                    <Link
                      href={`/menu?category=pizzas`}
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Découvrir
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — ABOUT / NOTRE HISTOIRE
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Notre histoire
            </h2>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text column */}
            <div>
              <p className="text-wood-light leading-relaxed text-lg mb-4">
                Fondée par <strong className="text-wood">Adrien et Aldo Baldelli</strong>,
                la pizzeria <strong className="text-wood">Au Paradizzio</strong> est un véritable
                hommage à la tradition italienne. Chaque pizza est pétrie à la main avec une
                <strong className="text-wood"> pâte maison</strong> préparée chaque jour et cuite dans
                notre authentique <strong className="text-wood">four à bois</strong>.
              </p>
              <p className="text-wood-light leading-relaxed text-lg mb-4">
                Avec plus de <strong className="text-wood">60 recettes</strong> créées au fil des années,
                nous proposons un voyage gustatif unique allant des classiques incontournables aux
                créations originales du chef. Des ingrédients frais et sélectionnés avec
                soin font la différence.
              </p>
              <p className="text-wood-light leading-relaxed text-lg mb-8">
                Fiers d&apos;être labellisés{" "}
                <strong className="text-wood">Tables et Auberges de France</strong>, nous nous
                engageons chaque jour à offrir une expérience culinaire d&apos;exception à
                Entraigues-sur-la-Sorgue et ses environs.
              </p>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <ChefHat className="w-6 h-6 text-primary" />, label: "60+", sub: "recettes" },
                  { icon: <Star className="w-6 h-6 text-accent" />, label: "4.7/5", sub: "sur Google" },
                  { icon: <Flame className="w-6 h-6 text-primary" />, label: "Feu de", sub: "bois" },
                  { icon: <ChefHat className="w-6 h-6 text-secondary" />, label: "Pâte", sub: "maison" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-white shadow-sm border border-wood/5"
                  >
                    <div className="mb-2">{stat.icon}</div>
                    <span className="font-heading font-bold text-wood text-lg">{stat.label}</span>
                    <span className="text-xs text-wood-light">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image placeholder column */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-wood/10 to-primary/5 flex flex-col items-center justify-center border-2 border-dashed border-wood/15">
                <Flame className="w-16 h-16 text-primary/30 mb-4" />
                <span className="text-wood/40 font-heading text-lg">Four à bois traditionnel</span>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-wood/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-wood text-sm">Tables & Auberges</p>
                    <p className="text-xs text-wood-light">de France</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 — REVIEWS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Ce que disent nos clients
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-6" />

            {/* Google rating summary */}
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm border border-wood/10">
              <span className="text-accent text-xl tracking-wide">
                {"\u2605\u2605\u2605\u2605\u2605"}
              </span>
              <span className="font-bold text-wood text-lg">4.7/5</span>
              <span className="text-wood-light text-sm">sur Google</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5 hover:shadow-md transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="text-accent text-lg mb-3">
                  {Array.from({ length: review.stars }, (_, j) => (
                    <span key={j}>{"\u2605"}</span>
                  ))}
                  {Array.from({ length: 5 - review.stars }, (_, j) => (
                    <span key={j} className="text-gray-200">{"\u2605"}</span>
                  ))}
                </div>
                {/* Review text */}
                <p className="text-wood-light leading-relaxed mb-4 text-sm">
                  « {review.text} »
                </p>
                {/* Reviewer info */}
                <div className="flex items-center justify-between border-t border-wood/5 pt-3">
                  <span className="font-semibold text-wood text-sm">{review.name}</span>
                  <span className="text-xs text-wood-light">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 — LOCATION / NOUS TROUVER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Nous trouver
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Info column */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-wood/5">
              {/* Address */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wood mb-1">Adresse</h3>
                  <p className="text-wood-light">{storeData!.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wood mb-1">Téléphone</h3>
                  <a
                    href={`tel:${storeData!.phone.replace(/\s/g, "")}`}
                    className="text-primary hover:text-primary-dark font-semibold transition-colors"
                  >
                    {storeData!.phone}
                  </a>
                </div>
              </div>

              {/* Opening hours */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-wood mb-3">Horaires d&apos;ouverture</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {storeData!.openingHours.map((hours) => (
                        <tr key={hours.dayOfWeek} className="border-b border-wood/5 last:border-0">
                          <td className="py-1.5 font-medium text-wood">
                            {dayNames[hours.dayOfWeek]}
                          </td>
                          <td className="py-1.5 text-right text-wood-light">
                            {hours.isClosed ? (
                              <span className="text-primary font-medium">Fermé</span>
                            ) : (
                              `${hours.openTime} – ${hours.closeTime}`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery zone info */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                <Truck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary font-medium">
                  Livraison gratuite à Entraigues-sur-la-Sorgue, dès 15€
                </p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-wood/5 overflow-hidden min-h-[400px] flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 flex flex-col items-center justify-center p-8">
                <MapPin className="w-12 h-12 text-secondary/30 mb-4" />
                <p className="text-wood/40 font-heading text-lg mb-2">Google Maps</p>
                <p className="text-wood/30 text-sm text-center">
                  711 Route de Carpentras<br />
                  84320 Entraigues-sur-la-Sorgue
                </p>
                <div className="mt-6 w-full max-w-xs">
                  <div className="h-2 bg-secondary/10 rounded-full mb-3 w-full" />
                  <div className="h-2 bg-secondary/10 rounded-full mb-3 w-3/4" />
                  <div className="h-2 bg-secondary/10 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 8 — CTA BANNER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-accent to-accent-light py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à commander ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Choisissez parmi nos 60 recettes artisanales et régalez-vous !
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 bg-white hover:bg-cream text-accent font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Commander maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
