import { Firestore } from "@google-cloud/firestore";

const globalForFirestore = globalThis as unknown as { firestore: Firestore };

export const firestore =
  globalForFirestore.firestore ||
  new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "adp-413110",
    databaseId: process.env.FIRESTORE_DATABASE_ID || "paradizzio",
  });

if (process.env.NODE_ENV !== "production") {
  globalForFirestore.firestore = firestore;
}

// Collection references
export const col = {
  users: firestore.collection("users"),
  categories: firestore.collection("categories"),
  products: firestore.collection("products"),
  orders: firestore.collection("orders"),
  addresses: firestore.collection("addresses"),
  favorites: firestore.collection("favorites"),
  loyaltyTransactions: firestore.collection("loyaltyTransactions"),
  promoCodes: firestore.collection("promoCodes"),
  storeSettings: firestore.collection("storeSettings"),
};

export default firestore;
