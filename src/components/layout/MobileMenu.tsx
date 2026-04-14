"use client";

import Link from "next/link";
import {
  X,
  Pizza,
  Phone,
  User,
  Heart,
  ClipboardList,
  MapPin,
  Tag,
  Info,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import type { OrderMode } from "@/types";

const navLinks = [
  { href: "/menu", label: "Menu", icon: Pizza },
  { href: "/promotions", label: "Promotions", icon: Tag },
  { href: "/a-propos", label: "À propos", icon: Info },
  { href: "/contact", label: "Contact", icon: MapPin },
];

const accountLinks = [
  { href: "/compte", label: "Mon compte", icon: User },
  { href: "/compte/commandes", label: "Mes commandes", icon: ClipboardList },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart },
];

const orderModes: { value: OrderMode; label: string }[] = [
  { value: "DELIVERY", label: "Livraison" },
  { value: "TAKEAWAY", label: "À emporter" },
  { value: "DINE_IN", label: "Sur place" },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { orderMode, setOrderMode } = useCartStore();

  const handleLinkClick = () => {
    toggleMobileMenu();
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
          onClick={toggleMobileMenu}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Pizza className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-heading text-lg font-bold text-wood">
              Au Paradizzio
            </span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order mode */}
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Mode de commande
          </p>
          <div className="flex gap-2">
            {orderModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setOrderMode(mode.value)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  orderMode === mode.value
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-wood transition-colors hover:bg-cream hover:text-primary"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-gray-100" />

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Mon compte
          </p>
          <div className="space-y-1">
            {accountLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-cream hover:text-primary"
                >
                  <Icon className="h-5 w-5 text-gray-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <a
            href="tel:0490481860"
            className="mb-3 flex items-center gap-2 text-sm font-medium text-secondary"
          >
            <Phone className="h-4 w-4" />
            04 90 48 18 60
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary hover:text-white"
              aria-label="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
