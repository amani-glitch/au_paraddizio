import { Firestore } from "@google-cloud/firestore";
import bcrypt from "bcryptjs";

const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || "adp-413110",
  databaseId: process.env.FIRESTORE_DATABASE_ID || "paradizzio",
});

const col = {
  users: firestore.collection("users"),
  categories: firestore.collection("categories"),
  products: firestore.collection("products"),
  orders: firestore.collection("orders"),
};

async function wipeCollection(ref: FirebaseFirestore.CollectionReference) {
  const snap = await ref.get();
  const batch = firestore.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

async function main() {
  console.log("🌱 Seeding Firestore database 'paradizzio'...");

  console.log("  Cleaning collections...");
  await wipeCollection(col.users);
  await wipeCollection(col.categories);
  await wipeCollection(col.products);
  await wipeCollection(col.orders);

  // CATEGORIES
  const categoriesData = [
    { id: "cat-pizzas", name: "Pizzas", slug: "pizzas", description: "Nos 60 recettes artisanales cuites au feu de bois", emoji: "🍕", order: 1, isActive: true, image: "" },
    { id: "cat-entrees", name: "Entrées & Salades", slug: "entrees-salades", description: "Entrées fraîches et salades de saison", emoji: "🥗", order: 2, isActive: true, image: "" },
    { id: "cat-desserts", name: "Desserts", slug: "desserts", description: "Tiramisu, panna cotta et autres douceurs", emoji: "🍰", order: 3, isActive: true, image: "" },
    { id: "cat-boissons", name: "Boissons", slug: "boissons", description: "Sodas, bières, vins et cafés", emoji: "🥤", order: 4, isActive: true, image: "" },
    { id: "cat-menus", name: "Menus & Formules", slug: "menus-formules", description: "Pizza + Boisson + Dessert à prix réduit", emoji: "📦", order: 5, isActive: true, image: "" },
    { id: "cat-extras", name: "Extras & Suppléments", slug: "extras-supplements", description: "Sauces, suppléments et à-côtés", emoji: "➕", order: 6, isActive: true, image: "" },
  ];

  for (const cat of categoriesData) {
    const { id, ...data } = cat;
    await col.categories.doc(id).set(data);
  }
  console.log(`✓ ${categoriesData.length} catégories`);

  // PRODUCTS
  const productsData = [
    {
      id: "pizza-margherita", name: "Margherita", slug: "margherita",
      description: "Sauce tomate, mozzarella, basilic frais. La classique incontournable.",
      image: "/images/pizzas/margherita.jpg", images: ["/images/pizzas/margherita.jpg"],
      categoryId: "cat-pizzas", basePrice: 8.5, isActive: true, isNew: false, isBestSeller: true, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: ["vegetarian"], order: 1,
      sizes: [
        { id: "s1", name: "29 cm", price: 8.5 },
        { id: "s2", name: "33 cm", price: 10.5 },
        { id: "s3", name: "40 cm", price: 14.5 },
      ],
      supplements: [
        { id: "su1", name: "Extra mozzarella", price: 1.5, category: "topping" },
        { id: "su2", name: "Basilic frais", price: 0.5, category: "topping" },
        { id: "su3", name: "Pâte fine", price: 0, category: "base" },
        { id: "su4", name: "Pâte épaisse", price: 0, category: "base" },
        { id: "su5", name: "Pâte sans gluten", price: 2, category: "base" },
      ],
    },
    {
      id: "pizza-reine", name: "Reine", slug: "reine",
      description: "Sauce tomate, mozzarella, jambon, champignons. Un classique indémodable.",
      image: "/images/pizzas/reine.jpg", images: ["/images/pizzas/reine.jpg"],
      categoryId: "cat-pizzas", basePrice: 9.5, isActive: true, isNew: false, isBestSeller: true, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: [], order: 2,
      sizes: [
        { id: "s1", name: "29 cm", price: 9.5 },
        { id: "s2", name: "33 cm", price: 11.5 },
        { id: "s3", name: "40 cm", price: 15.5 },
      ],
      supplements: [
        { id: "su1", name: "Extra mozzarella", price: 1.5, category: "topping" },
        { id: "su2", name: "Extra jambon", price: 2, category: "topping" },
        { id: "su3", name: "Extra champignons", price: 1, category: "topping" },
      ],
    },
    {
      id: "pizza-4fromages", name: "4 Fromages", slug: "4-fromages",
      description: "Sauce crème, mozzarella, gorgonzola, chèvre, parmesan.",
      image: "/images/pizzas/4fromages.jpg", images: ["/images/pizzas/4fromages.jpg"],
      categoryId: "cat-pizzas", basePrice: 10.5, isActive: true, isNew: false, isBestSeller: true, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: ["vegetarian"], order: 3,
      sizes: [
        { id: "s1", name: "29 cm", price: 10.5 },
        { id: "s2", name: "33 cm", price: 12.5 },
        { id: "s3", name: "40 cm", price: 16.5 },
      ],
      supplements: [
        { id: "su1", name: "Extra mozzarella", price: 1.5, category: "topping" },
        { id: "su2", name: "Extra gorgonzola", price: 2, category: "topping" },
      ],
    },
    {
      id: "pizza-corsica", name: "Corsica", slug: "corsica",
      description: "Sauce tomate, mozzarella, coppa, figatellu, brocciu. La spécialité corse.",
      image: "/images/pizzas/corsica.jpg", images: ["/images/pizzas/corsica.jpg"],
      categoryId: "cat-pizzas", basePrice: 12, isActive: true, isNew: false, isBestSeller: true, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: [], order: 4,
      sizes: [
        { id: "s1", name: "29 cm", price: 12 },
        { id: "s2", name: "33 cm", price: 14 },
        { id: "s3", name: "40 cm", price: 18 },
      ],
      supplements: [
        { id: "su1", name: "Extra coppa", price: 2.5, category: "topping" },
        { id: "su2", name: "Extra figatellu", price: 2.5, category: "topping" },
      ],
    },
    {
      id: "pizza-8fromages", name: "8 Fromages", slug: "8-fromages",
      description: "Sauce crème, mozzarella, gorgonzola, chèvre, parmesan, emmental, reblochon, roquefort, comté.",
      image: "/images/pizzas/8fromages.jpg", images: ["/images/pizzas/8fromages.jpg"],
      categoryId: "cat-pizzas", basePrice: 13, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: ["vegetarian"], order: 5,
      sizes: [
        { id: "s1", name: "29 cm", price: 13 },
        { id: "s2", name: "33 cm", price: 15 },
        { id: "s3", name: "40 cm", price: 19 },
      ],
      supplements: [{ id: "su1", name: "Extra mozzarella", price: 1.5, category: "topping" }],
    },
    {
      id: "pizza-calzone", name: "Calzone", slug: "calzone",
      description: "Pizza pliée : sauce tomate, mozzarella, jambon, champignons, oeuf. Dorée au four à bois.",
      image: "/images/pizzas/calzone.jpg", images: ["/images/pizzas/calzone.jpg"],
      categoryId: "cat-pizzas", basePrice: 11, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait", "oeuf"], dietary: [], order: 6,
      sizes: [
        { id: "s1", name: "29 cm", price: 11 },
        { id: "s2", name: "33 cm", price: 13 },
        { id: "s3", name: "40 cm", price: 17 },
      ],
      supplements: [{ id: "su1", name: "Extra oeuf", price: 1, category: "topping" }],
    },
    {
      id: "pizza-vegetarienne", name: "Végétarienne", slug: "vegetarienne",
      description: "Sauce tomate, mozzarella, poivrons, oignons, champignons, olives, artichauts.",
      image: "/images/pizzas/vegetarienne.jpg", images: ["/images/pizzas/vegetarienne.jpg"],
      categoryId: "cat-pizzas", basePrice: 10, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait"], dietary: ["vegetarian"], order: 7,
      sizes: [
        { id: "s1", name: "29 cm", price: 10 },
        { id: "s2", name: "33 cm", price: 12 },
        { id: "s3", name: "40 cm", price: 16 },
      ],
      supplements: [{ id: "su1", name: "Extra légumes", price: 1.5, category: "topping" }],
    },
    {
      id: "pizza-du-mois", name: "Pizza du Mois - Printanière", slug: "pizza-du-mois-printaniere",
      description: "Sauce crème, mozzarella, asperges vertes, roquette, parmesan, jambon de Parme.",
      image: "/images/pizzas/pizza-du-mois.jpg", images: ["/images/pizzas/pizza-du-mois.jpg"],
      categoryId: "cat-pizzas", basePrice: 13, isActive: true, isNew: true, isBestSeller: false, isPromo: false, isPizzaOfMonth: true,
      allergens: ["gluten", "lait"], dietary: [], order: 8,
      sizes: [
        { id: "s1", name: "29 cm", price: 13 },
        { id: "s2", name: "33 cm", price: 15 },
        { id: "s3", name: "40 cm", price: 19 },
      ],
      supplements: [{ id: "su1", name: "Extra jambon de Parme", price: 2.5, category: "topping" }],
    },
    {
      id: "dessert-tiramisu", name: "Tiramisu Maison", slug: "tiramisu-maison",
      description: "Notre tiramisu fait maison, crémeux et savoureux.",
      image: "/images/desserts/tiramisu.jpg", images: ["/images/desserts/tiramisu.jpg"],
      categoryId: "cat-desserts", basePrice: 5.5, isActive: true, isNew: false, isBestSeller: true, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten", "lait", "oeuf"], dietary: ["vegetarian"], order: 1,
      sizes: [{ id: "s1", name: "Portion", price: 5.5 }], supplements: [],
    },
    {
      id: "dessert-pannacotta", name: "Panna Cotta", slug: "panna-cotta",
      description: "Panna cotta onctueuse au coulis de fruits rouges.",
      image: "/images/desserts/pannacotta.jpg", images: ["/images/desserts/pannacotta.jpg"],
      categoryId: "cat-desserts", basePrice: 5, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: ["lait"], dietary: ["vegetarian"], order: 2,
      sizes: [{ id: "s1", name: "Portion", price: 5 }], supplements: [],
    },
    {
      id: "boisson-coca", name: "Coca-Cola", slug: "coca-cola",
      description: "Coca-Cola",
      image: "/images/boissons/coca.jpg", images: ["/images/boissons/coca.jpg"],
      categoryId: "cat-boissons", basePrice: 2.5, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: [], dietary: ["vegetarian", "vegan"], order: 1,
      sizes: [
        { id: "s1", name: "33 cl", price: 2.5 },
        { id: "s2", name: "1.5 L", price: 4.5 },
      ],
      supplements: [],
    },
    {
      id: "boisson-eau", name: "Eau minérale", slug: "eau-minerale",
      description: "Eau minérale plate ou gazeuse",
      image: "/images/boissons/eau.jpg", images: ["/images/boissons/eau.jpg"],
      categoryId: "cat-boissons", basePrice: 2, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: [], dietary: ["vegetarian", "vegan"], order: 2,
      sizes: [
        { id: "s1", name: "50 cl", price: 2 },
        { id: "s2", name: "1 L", price: 3.5 },
      ],
      supplements: [],
    },
    {
      id: "boisson-biere", name: "Bière artisanale", slug: "biere-artisanale",
      description: "Bière blonde artisanale locale - 33cl",
      image: "/images/boissons/biere.jpg", images: ["/images/boissons/biere.jpg"],
      categoryId: "cat-boissons", basePrice: 4, isActive: true, isNew: false, isBestSeller: false, isPromo: false, isPizzaOfMonth: false,
      allergens: ["gluten"], dietary: ["vegetarian", "vegan"], order: 3,
      sizes: [{ id: "s1", name: "33 cl", price: 4 }], supplements: [],
    },
  ];

  for (const prod of productsData) {
    const { id, ...data } = prod;
    await col.products.doc(id).set(data);
  }
  console.log(`✓ ${productsData.length} produits`);

  // USERS
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("demo1234", 10);
  const now = new Date().toISOString();

  const adminRef = await col.users.add({
    email: "admin@paradizzio.fr",
    password: adminPassword,
    name: "Adrien Baldelli",
    phone: "04 90 48 18 60",
    role: "ADMIN",
    loyaltyPoints: 0,
    createdAt: now,
    updatedAt: now,
  });

  const demoCustomers = [
    { email: "marie@example.com", name: "Marie Dupont", phone: "06 12 34 56 78" },
    { email: "jean@example.com", name: "Jean Martin", phone: "06 98 76 54 32" },
    { email: "sophie@example.com", name: "Sophie Bernard", phone: "06 55 44 33 22" },
    { email: "pierre@example.com", name: "Pierre Lambert", phone: "06 11 22 33 44" },
    { email: "camille@example.com", name: "Camille Petit", phone: "06 77 88 99 00" },
  ];

  const customerRefs: { id: string; email: string; name: string; phone: string }[] = [];
  for (const c of demoCustomers) {
    const ref = await col.users.add({
      ...c,
      password: customerPassword,
      role: "CUSTOMER",
      loyaltyPoints: 0,
      createdAt: now,
      updatedAt: now,
    });
    customerRefs.push({ id: ref.id, ...c });
  }
  console.log(`✓ 1 admin + ${customerRefs.length} clients demo`);

  // ORDERS
  const ordersData = [
    {
      orderNumber: "PAR-20260415-A1B2",
      userId: customerRefs[0].id, customerName: customerRefs[0].name, customerPhone: customerRefs[0].phone, customerEmail: customerRefs[0].email,
      status: "PENDING", mode: "DELIVERY",
      subtotal: 26.5, deliveryFee: 3, discount: 0, total: 29.5,
      deliveryAddress: "15 Rue de la République, 84320 Entraigues",
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 120000).toISOString(),
      items: [
        { productId: "pizza-margherita", productName: "Margherita", sizeName: "33 cm", sizePrice: 10.5, quantity: 2, unitPrice: 10.5, totalPrice: 21, supplements: [], removedIngredients: [] },
        { productId: "dessert-tiramisu", productName: "Tiramisu Maison", sizeName: "Portion", sizePrice: 5.5, quantity: 1, unitPrice: 5.5, totalPrice: 5.5, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260415-C3D4",
      userId: customerRefs[1].id, customerName: customerRefs[1].name, customerPhone: customerRefs[1].phone, customerEmail: customerRefs[1].email,
      status: "ACCEPTED", mode: "TAKEAWAY",
      subtotal: 21.5, deliveryFee: 0, discount: 0, total: 21.5,
      paymentMethod: "cash", paymentStatus: "PENDING",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      items: [
        { productId: "pizza-4fromages", productName: "4 Fromages", sizeName: "40 cm", sizePrice: 16.5, quantity: 1, unitPrice: 16.5, totalPrice: 16.5, supplements: [], removedIngredients: [] },
        { productId: "boisson-coca", productName: "Coca-Cola", sizeName: "33 cl", sizePrice: 2.5, quantity: 2, unitPrice: 2.5, totalPrice: 5, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260415-E5F6",
      userId: customerRefs[2].id, customerName: customerRefs[2].name, customerPhone: customerRefs[2].phone, customerEmail: customerRefs[2].email,
      status: "PREPARING", mode: "DELIVERY",
      subtotal: 25.5, deliveryFee: 3, discount: 0, total: 28.5,
      deliveryAddress: "8 Avenue Jean Moulin, 84320 Entraigues",
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      items: [
        { productId: "pizza-corsica", productName: "Corsica", sizeName: "33 cm", sizePrice: 14, quantity: 1, unitPrice: 14, totalPrice: 14, supplements: [], removedIngredients: [] },
        { productId: "pizza-4fromages", productName: "4 Fromages", sizeName: "29 cm", sizePrice: 10.5, quantity: 1, unitPrice: 10.5, totalPrice: 10.5, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260415-G7H8",
      userId: customerRefs[3].id, customerName: customerRefs[3].name, customerPhone: customerRefs[3].phone, customerEmail: customerRefs[3].email,
      status: "READY", mode: "TAKEAWAY",
      subtotal: 31.5, deliveryFee: 0, discount: 0, total: 31.5,
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      items: [
        { productId: "pizza-margherita", productName: "Margherita", sizeName: "33 cm", sizePrice: 10.5, quantity: 3, unitPrice: 10.5, totalPrice: 31.5, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260414-I9J0",
      userId: customerRefs[0].id, customerName: customerRefs[0].name, customerPhone: customerRefs[0].phone, customerEmail: customerRefs[0].email,
      status: "DELIVERED", mode: "DELIVERY",
      subtotal: 40, deliveryFee: 3, discount: 0, total: 43,
      deliveryAddress: "15 Rue de la République, 84320 Entraigues",
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { productId: "pizza-margherita", productName: "Margherita", sizeName: "40 cm", sizePrice: 14.5, quantity: 2, unitPrice: 14.5, totalPrice: 29, supplements: [], removedIngredients: [] },
        { productId: "dessert-tiramisu", productName: "Tiramisu Maison", sizeName: "Portion", sizePrice: 5.5, quantity: 2, unitPrice: 5.5, totalPrice: 11, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260413-K1L2",
      userId: customerRefs[4].id, customerName: customerRefs[4].name, customerPhone: customerRefs[4].phone, customerEmail: customerRefs[4].email,
      status: "DELIVERED", mode: "TAKEAWAY",
      subtotal: 16.5, deliveryFee: 0, discount: 0, total: 16.5,
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      items: [
        { productId: "pizza-4fromages", productName: "4 Fromages", sizeName: "40 cm", sizePrice: 16.5, quantity: 1, unitPrice: 16.5, totalPrice: 16.5, supplements: [], removedIngredients: [] },
      ],
    },
    {
      orderNumber: "PAR-20260412-M3N4",
      userId: customerRefs[1].id, customerName: customerRefs[1].name, customerPhone: customerRefs[1].phone, customerEmail: customerRefs[1].email,
      status: "DELIVERED", mode: "DELIVERY",
      subtotal: 22, deliveryFee: 3, discount: 0, total: 25,
      deliveryAddress: "22 Chemin des Oliviers, 84320 Entraigues",
      paymentMethod: "card", paymentStatus: "PAID",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      items: [
        { productId: "pizza-reine", productName: "Reine", sizeName: "33 cm", sizePrice: 11.5, quantity: 2, unitPrice: 11.5, totalPrice: 23, supplements: [], removedIngredients: [] },
      ],
    },
  ];

  for (const o of ordersData) {
    await col.orders.add({ ...o, updatedAt: o.createdAt });
  }
  console.log(`✓ ${ordersData.length} commandes historiques`);

  console.log("\n✅ Seed Firestore terminé !");
  console.log("\n🔑 Comptes de test :");
  console.log("  Admin   → admin@paradizzio.fr / admin123");
  console.log("  Client  → marie@example.com   / demo1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
