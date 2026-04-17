import { col } from "@/lib/firestore";

export interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_delivery";
  value: number;
  isActive: boolean;
  expiresAt?: string | null;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const snap = await col.promoCodes.orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PromoCode));
}

export async function validatePromoCode(
  code: string
): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> {
  const snap = await col.promoCodes
    .where("code", "==", code.toUpperCase())
    .limit(1)
    .get();

  if (snap.empty) {
    return { valid: false, error: "Code promo introuvable" };
  }

  const doc = snap.docs[0];
  const promo = { id: doc.id, ...doc.data() } as PromoCode;

  if (!promo.isActive) {
    return { valid: false, error: "Ce code promo n'est plus actif" };
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, error: "Ce code promo a expiré" };
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "Ce code promo a atteint son nombre maximum d'utilisations" };
  }

  return { valid: true, promo };
}

export async function createPromoCode(
  data: Omit<PromoCode, "id">
): Promise<string> {
  const ref = await col.promoCodes.add(data);
  return ref.id;
}

export async function updatePromoCode(
  id: string,
  data: Partial<Omit<PromoCode, "id">>
): Promise<void> {
  await col.promoCodes.doc(id).set(data, { merge: true });
}

export async function deletePromoCode(id: string): Promise<void> {
  await col.promoCodes.doc(id).delete();
}
