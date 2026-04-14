// Mock data for development - will be replaced by API calls to database

import { Product, Category, StoreInfo, DeliveryZone } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-pizzas",
    name: "Pizzas",
    slug: "pizzas",
    description: "Nos 60 recettes artisanales cuites au feu de bois",
    image: "/images/categories/pizzas.jpg",
    order: 1,
  },
  {
    id: "cat-entrees",
    name: "Entrées & Salades",
    slug: "entrees-salades",
    description: "Entrées fraîches et salades de saison",
    image: "/images/categories/entrees.jpg",
    order: 2,
  },
  {
    id: "cat-desserts",
    name: "Desserts",
    slug: "desserts",
    description: "Tiramisu, panna cotta et autres douceurs",
    image: "/images/categories/desserts.jpg",
    order: 3,
  },
  {
    id: "cat-boissons",
    name: "Boissons",
    slug: "boissons",
    description: "Sodas, bières, vins et cafés",
    image: "/images/categories/boissons.jpg",
    order: 4,
  },
  {
    id: "cat-menus",
    name: "Menus & Formules",
    slug: "menus-formules",
    description: "Pizza + Boisson + Dessert à prix réduit",
    image: "/images/categories/menus.jpg",
    order: 5,
  },
  {
    id: "cat-extras",
    name: "Extras & Suppléments",
    slug: "extras-supplements",
    description: "Sauces, suppléments et à-côtés",
    image: "/images/categories/extras.jpg",
    order: 6,
  },
];

export const products: Product[] = [
  // --- PIZZAS CLASSIQUES ---
  {
    id: "pizza-margherita",
    name: "Margherita",
    slug: "margherita",
    description: "Sauce tomate, mozzarella, basilic frais. La classique incontournable.",
    image: "/images/pizzas/margherita.jpg",
    images: ["/images/pizzas/margherita.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 8.5,
    isActive: true,
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: ["vegetarian"],
    sizes: [
      { id: "size-29-margherita", name: "29 cm", price: 8.5 },
      { id: "size-33-margherita", name: "33 cm", price: 10.5 },
      { id: "size-40-margherita", name: "40 cm", price: 14.5 },
    ],
    supplements: [
      { id: "sup-extra-mozza", name: "Extra mozzarella", price: 1.5, category: "topping" },
      { id: "sup-extra-basilic", name: "Basilic frais", price: 0.5, category: "topping" },
      { id: "sup-base-fine", name: "Pâte fine", price: 0, category: "base" },
      { id: "sup-base-epaisse", name: "Pâte épaisse", price: 0, category: "base" },
      { id: "sup-base-sansgluten", name: "Pâte sans gluten", price: 2, category: "base" },
    ],
  },
  {
    id: "pizza-reine",
    name: "Reine",
    slug: "reine",
    description: "Sauce tomate, mozzarella, jambon, champignons. Un classique indémodable.",
    image: "/images/pizzas/reine.jpg",
    images: ["/images/pizzas/reine.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 9.5,
    isActive: true,
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: [],
    sizes: [
      { id: "size-29-reine", name: "29 cm", price: 9.5 },
      { id: "size-33-reine", name: "33 cm", price: 11.5 },
      { id: "size-40-reine", name: "40 cm", price: 15.5 },
    ],
    supplements: [
      { id: "sup-extra-mozza-r", name: "Extra mozzarella", price: 1.5, category: "topping" },
      { id: "sup-extra-jambon", name: "Extra jambon", price: 2, category: "topping" },
      { id: "sup-extra-champi", name: "Extra champignons", price: 1, category: "topping" },
      { id: "sup-base-fine-r", name: "Pâte fine", price: 0, category: "base" },
      { id: "sup-base-epaisse-r", name: "Pâte épaisse", price: 0, category: "base" },
    ],
  },
  {
    id: "pizza-4fromages",
    name: "4 Fromages",
    slug: "4-fromages",
    description: "Sauce crème, mozzarella, gorgonzola, chèvre, parmesan. Pour les amateurs de fromage.",
    image: "/images/pizzas/4fromages.jpg",
    images: ["/images/pizzas/4fromages.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 10.5,
    isActive: true,
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: ["vegetarian"],
    sizes: [
      { id: "size-29-4f", name: "29 cm", price: 10.5 },
      { id: "size-33-4f", name: "33 cm", price: 12.5 },
      { id: "size-40-4f", name: "40 cm", price: 16.5 },
    ],
    supplements: [
      { id: "sup-extra-mozza-4f", name: "Extra mozzarella", price: 1.5, category: "topping" },
      { id: "sup-extra-gorgo", name: "Extra gorgonzola", price: 2, category: "topping" },
      { id: "sup-base-fine-4f", name: "Pâte fine", price: 0, category: "base" },
    ],
  },
  {
    id: "pizza-corsica",
    name: "Corsica",
    slug: "corsica",
    description: "Sauce tomate, mozzarella, coppa, figatellu, brocciu. La spécialité corse du chef.",
    image: "/images/pizzas/corsica.jpg",
    images: ["/images/pizzas/corsica.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 12,
    isActive: true,
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: [],
    sizes: [
      { id: "size-29-corsica", name: "29 cm", price: 12 },
      { id: "size-33-corsica", name: "33 cm", price: 14 },
      { id: "size-40-corsica", name: "40 cm", price: 18 },
    ],
    supplements: [
      { id: "sup-extra-coppa", name: "Extra coppa", price: 2.5, category: "topping" },
      { id: "sup-extra-figatellu", name: "Extra figatellu", price: 2.5, category: "topping" },
      { id: "sup-base-fine-c", name: "Pâte fine", price: 0, category: "base" },
    ],
  },
  {
    id: "pizza-8fromages",
    name: "8 Fromages",
    slug: "8-fromages",
    description: "Sauce crème, mozzarella, gorgonzola, chèvre, parmesan, emmental, reblochon, roquefort, comté. L'ultime pizza fromagère.",
    image: "/images/pizzas/8fromages.jpg",
    images: ["/images/pizzas/8fromages.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 13,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: ["vegetarian"],
    sizes: [
      { id: "size-29-8f", name: "29 cm", price: 13 },
      { id: "size-33-8f", name: "33 cm", price: 15 },
      { id: "size-40-8f", name: "40 cm", price: 19 },
    ],
    supplements: [
      { id: "sup-extra-mozza-8f", name: "Extra mozzarella", price: 1.5, category: "topping" },
      { id: "sup-base-fine-8f", name: "Pâte fine", price: 0, category: "base" },
    ],
  },
  {
    id: "pizza-calzone",
    name: "Calzone",
    slug: "calzone",
    description: "Pizza pliée : sauce tomate, mozzarella, jambon, champignons, oeuf. Dorée au four à bois.",
    image: "/images/pizzas/calzone.jpg",
    images: ["/images/pizzas/calzone.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 11,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait", "oeuf"],
    dietary: [],
    sizes: [
      { id: "size-29-calzone", name: "29 cm", price: 11 },
      { id: "size-33-calzone", name: "33 cm", price: 13 },
      { id: "size-40-calzone", name: "40 cm", price: 17 },
    ],
    supplements: [
      { id: "sup-extra-oeuf", name: "Extra oeuf", price: 1, category: "topping" },
      { id: "sup-extra-jambon-c", name: "Extra jambon", price: 2, category: "topping" },
    ],
  },
  {
    id: "pizza-vegetarienne",
    name: "Végétarienne",
    slug: "vegetarienne",
    description: "Sauce tomate, mozzarella, poivrons, oignons, champignons, olives, artichauts.",
    image: "/images/pizzas/vegetarienne.jpg",
    images: ["/images/pizzas/vegetarienne.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 10,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait"],
    dietary: ["vegetarian"],
    sizes: [
      { id: "size-29-veg", name: "29 cm", price: 10 },
      { id: "size-33-veg", name: "33 cm", price: 12 },
      { id: "size-40-veg", name: "40 cm", price: 16 },
    ],
    supplements: [
      { id: "sup-extra-mozza-v", name: "Extra mozzarella", price: 1.5, category: "topping" },
      { id: "sup-extra-legumes", name: "Extra légumes", price: 1.5, category: "topping" },
      { id: "sup-base-sansgluten-v", name: "Pâte sans gluten", price: 2, category: "base" },
    ],
  },
  {
    id: "pizza-du-mois",
    name: "Pizza du Mois - Printanière",
    slug: "pizza-du-mois-printaniere",
    description: "Sauce crème, mozzarella, asperges vertes, roquette, parmesan, jambon de Parme. Création saisonnière du chef.",
    image: "/images/pizzas/pizza-du-mois.jpg",
    images: ["/images/pizzas/pizza-du-mois.jpg"],
    categoryId: "cat-pizzas",
    basePrice: 13,
    isActive: true,
    isNew: true,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: true,
    allergens: ["gluten", "lait"],
    dietary: [],
    sizes: [
      { id: "size-29-pdm", name: "29 cm", price: 13 },
      { id: "size-33-pdm", name: "33 cm", price: 15 },
      { id: "size-40-pdm", name: "40 cm", price: 19 },
    ],
    supplements: [
      { id: "sup-extra-asperges", name: "Extra asperges", price: 2, category: "topping" },
      { id: "sup-extra-parme", name: "Extra jambon de Parme", price: 2.5, category: "topping" },
      { id: "sup-base-fine-pdm", name: "Pâte fine", price: 0, category: "base" },
    ],
  },
  // --- DESSERTS ---
  {
    id: "dessert-tiramisu",
    name: "Tiramisu Maison",
    slug: "tiramisu-maison",
    description: "Notre tiramisu fait maison, crémeux et savoureux. Recette traditionnelle italienne.",
    image: "/images/desserts/tiramisu.jpg",
    images: ["/images/desserts/tiramisu.jpg"],
    categoryId: "cat-desserts",
    basePrice: 5.5,
    isActive: true,
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten", "lait", "oeuf"],
    dietary: ["vegetarian"],
    sizes: [{ id: "size-tiramisu", name: "Portion", price: 5.5 }],
    supplements: [],
  },
  {
    id: "dessert-pannacotta",
    name: "Panna Cotta",
    slug: "panna-cotta",
    description: "Panna cotta onctueuse au coulis de fruits rouges.",
    image: "/images/desserts/pannacotta.jpg",
    images: ["/images/desserts/pannacotta.jpg"],
    categoryId: "cat-desserts",
    basePrice: 5,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["lait"],
    dietary: ["vegetarian"],
    sizes: [{ id: "size-pannacotta", name: "Portion", price: 5 }],
    supplements: [],
  },
  // --- BOISSONS ---
  {
    id: "boisson-coca",
    name: "Coca-Cola",
    slug: "coca-cola",
    description: "Coca-Cola 33cl",
    image: "/images/boissons/coca.jpg",
    images: ["/images/boissons/coca.jpg"],
    categoryId: "cat-boissons",
    basePrice: 2.5,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: [],
    dietary: ["vegetarian", "vegan"],
    sizes: [
      { id: "size-coca-33", name: "33 cl", price: 2.5 },
      { id: "size-coca-150", name: "1.5 L", price: 4.5 },
    ],
    supplements: [],
  },
  {
    id: "boisson-eau",
    name: "Eau minérale",
    slug: "eau-minerale",
    description: "Eau minérale plate ou gazeuse",
    image: "/images/boissons/eau.jpg",
    images: ["/images/boissons/eau.jpg"],
    categoryId: "cat-boissons",
    basePrice: 2,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: [],
    dietary: ["vegetarian", "vegan"],
    sizes: [
      { id: "size-eau-50", name: "50 cl", price: 2 },
      { id: "size-eau-100", name: "1 L", price: 3.5 },
    ],
    supplements: [],
  },
  {
    id: "boisson-biere",
    name: "Bière artisanale",
    slug: "biere-artisanale",
    description: "Bière blonde artisanale locale - 33cl",
    image: "/images/boissons/biere.jpg",
    images: ["/images/boissons/biere.jpg"],
    categoryId: "cat-boissons",
    basePrice: 4,
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isPromo: false,
    isPizzaOfMonth: false,
    allergens: ["gluten"],
    dietary: ["vegetarian", "vegan"],
    sizes: [{ id: "size-biere-33", name: "33 cl", price: 4 }],
    supplements: [],
  },
];

export const storeInfo: StoreInfo = {
  name: "Au Paradizzio Pizzas",
  address: "711 Route de Carpentras, 84320 Entraigues-sur-la-Sorgue",
  phone: "04 90 48 18 60",
  email: "contact@paradizzio.fr",
  isOpen: true,
  openingHours: [
    { dayOfWeek: 0, openTime: "17:30", closeTime: "21:30", isClosed: false }, // Dimanche
    { dayOfWeek: 1, openTime: "00:00", closeTime: "00:00", isClosed: true },  // Lundi - Fermé
    { dayOfWeek: 2, openTime: "17:30", closeTime: "21:30", isClosed: false }, // Mardi
    { dayOfWeek: 3, openTime: "17:30", closeTime: "21:30", isClosed: false }, // Mercredi
    { dayOfWeek: 4, openTime: "17:30", closeTime: "21:30", isClosed: false }, // Jeudi
    { dayOfWeek: 5, openTime: "17:30", closeTime: "22:00", isClosed: false }, // Vendredi
    { dayOfWeek: 6, openTime: "17:30", closeTime: "22:00", isClosed: false }, // Samedi
  ],
};

export const deliveryZones: DeliveryZone[] = [
  {
    id: "zone-entraigues",
    name: "Entraigues-sur-la-Sorgue",
    postalCodes: ["84320"],
    deliveryFee: 0,
    minOrderAmount: 15,
    estimatedMinutes: 20,
    freeDeliveryAbove: 15,
  },
  {
    id: "zone-proche",
    name: "Communes proches",
    postalCodes: ["84170", "84130", "84000"],
    deliveryFee: 3,
    minOrderAmount: 20,
    estimatedMinutes: 35,
    freeDeliveryAbove: 35,
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return products.filter((p) => p.categoryId === category.id && p.isActive);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.isBestSeller && p.isActive);
}

export function getPizzaOfMonth(): Product | undefined {
  return products.find((p) => p.isPizzaOfMonth && p.isActive);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.isActive);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.allergens.some((a) => a.toLowerCase().includes(lower)))
  );
}
