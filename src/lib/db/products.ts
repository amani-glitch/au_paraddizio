import { col } from "@/lib/firestore";
import type { Product, Category } from "@/types";

export async function listCategories(): Promise<Category[]> {
  const snap = await col.categories.orderBy("order", "asc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function listProducts(options?: {
  categorySlug?: string;
  search?: string;
  activeOnly?: boolean;
}): Promise<Product[]> {
  let query = col.products.orderBy("order", "asc") as FirebaseFirestore.Query;

  if (options?.activeOnly !== false) {
    query = query.where("isActive", "==", true);
  }

  const snap = await query.get();
  let products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));

  if (options?.categorySlug) {
    const catSnap = await col.categories.where("slug", "==", options.categorySlug).limit(1).get();
    if (!catSnap.empty) {
      const catId = catSnap.docs[0].id;
      products = products.filter((p) => p.categoryId === catId);
    } else {
      return [];
    }
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await col.products.where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await col.products.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Product;
}

export async function getBestSellers(): Promise<Product[]> {
  const snap = await col.products
    .where("isActive", "==", true)
    .where("isBestSeller", "==", true)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getPizzaOfMonth(): Promise<Product | null> {
  const snap = await col.products
    .where("isActive", "==", true)
    .where("isPizzaOfMonth", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Product;
}
