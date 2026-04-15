import { col } from "@/lib/firestore";
import { FieldValue } from "@google-cloud/firestore";

export interface UserDoc {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN" | "MANAGER" | "STAFF";
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<UserDoc, "password">;

function toPublicUser(user: UserDoc): PublicUser {
  const { password, ...rest } = user;
  void password;
  return rest;
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const snap = await col.users.where("email", "==", email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as UserDoc;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const doc = await col.users.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as UserDoc;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserDoc["role"];
}): Promise<PublicUser> {
  const now = new Date().toISOString();
  const userData = {
    email: data.email.toLowerCase(),
    password: data.password,
    name: data.name,
    phone: data.phone ?? null,
    role: data.role ?? "CUSTOMER",
    loyaltyPoints: 0,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col.users.add(userData);
  return toPublicUser({ id: ref.id, ...userData } as UserDoc);
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserDoc, "id" | "createdAt">>
): Promise<void> {
  await col.users.doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function addLoyaltyPoints(userId: string, points: number): Promise<void> {
  await col.users.doc(userId).update({
    loyaltyPoints: FieldValue.increment(points),
    updatedAt: new Date().toISOString(),
  });
}

export async function listUsers(): Promise<PublicUser[]> {
  const snap = await col.users.orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toPublicUser({ id: d.id, ...d.data() } as UserDoc));
}

export { toPublicUser };
