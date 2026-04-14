import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAR-${prefix}-${random}`;
}

export function isStoreOpen(openingHours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]): boolean {
  const now = new Date();
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5);
  const todayHours = openingHours.find(h => h.dayOfWeek === day);
  if (!todayHours || todayHours.isClosed) return false;
  return time >= todayHours.openTime && time <= todayHours.closeTime;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
