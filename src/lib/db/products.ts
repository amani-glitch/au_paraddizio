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
  // Simple query without composite index requirement
  const snap = await col.products.get();
  let products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));

  // Filter active products in memory (avoids composite index)
  if (options?.activeOnly !== false) {
    products = products.filter((p) => p.isActive);
  }

  // Sort by order field
  products.sort((a, b) => ((a as unknown as Record<string, number>).order ?? 0) - ((b as unknown as Record<string, number>).order ?? 0));

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
  const snap = await col.products.get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .filter((p) => p.isActive && p.isBestSeller);
}

export async function getPizzaOfMonth(): Promise<Product | null> {
  const snap = await col.products.get();
  const product = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .find((p) => p.isActive && p.isPizzaOfMonth);
  return product ?? null;
}

// ── Category CRUD ────────────────────────────────────────────────

export async function createCategory(
  data: Omit<Category, "id">
): Promise<string> {
  const ref = await col.categories.add(data);
  return ref.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id">>
): Promise<void> {
  await col.categories.doc(id).set(data, { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  await col.categories.doc(id).delete();
}

// ── Product CRUD ─────────────────────────────────────────────────

export async function createProduct(
  data: Omit<Product, "id">
): Promise<string> {
  const ref = await col.products.add(data);
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<void> {
  await col.products.doc(id).set(data, { merge: true });
}

export async function deleteProduct(id: string): Promise<void> {
  await col.products.doc(id).delete();
}
