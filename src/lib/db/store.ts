import { col } from "@/lib/firestore";
import type { StoreInfo, DeliveryZone } from "@/types";

const SETTINGS_DOC_ID = "main";

export interface StoreSettings {
  storeInfo: StoreInfo;
  deliveryZones: DeliveryZone[];
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const doc = await col.storeSettings.doc(SETTINGS_DOC_ID).get();
  if (!doc.exists) return null;
  const data = doc.data() as StoreSettings;
  return data;
}

export async function updateStoreSettings(
  data: Partial<StoreSettings>
): Promise<void> {
  await col.storeSettings.doc(SETTINGS_DOC_ID).set(data, { merge: true });
}
