"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu, X, Phone, Pizza } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { formatPrice, cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/promotions", label: "Promotions" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, subtotal } = useCartStore();
  const { toggleMobileMenu, toggleCart, toggleSearch } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const count = itemCount();
  const total = subtotal();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-offwhite transition-shadow duration-300",
        scrolled && "shadow-md"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Pizza className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-lg font-bold text-wood md:text-xl">
                Au Paradizzio
              </span>
              <span className="hidden text-xs text-wood-light sm:block">
                Pizzeria artisanale
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium text-wood transition-colors",
                  "hover:text-primary",
                  "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200",
                  "hover:after:scale-x-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Phone - desktop only */}
            <a
              href="tel:0490481860"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10 lg:flex"
            >
              <Phone className="h-4 w-4" />
              <span>04 90 48 18 60</span>
            </a>

            {/* Phone - tablet icon only */}
            <a
              href="tel:0490481860"
              className="hidden rounded-full p-2 text-secondary transition-colors hover:bg-secondary/10 md:flex lg:hidden"
              aria-label="Appeler"
            >
              <Phone className="h-5 w-5" />
            </a>

            {/* Search */}
            <button
              onClick={toggleSearch}
              className="rounded-full p-2 text-wood transition-colors hover:bg-wood/10 hover:text-primary"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User account */}
            <Link
              href="/compte"
              className="hidden rounded-full p-2 text-wood transition-colors hover:bg-wood/10 hover:text-primary sm:block"
              aria-label="Mon compte"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              aria-label={`Panier, ${count} articles`}
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <>
                  <span className="hidden sm:inline">{formatPrice(total)}</span>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-wood">
                    {count}
                  </span>
                </>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-full p-2 text-wood transition-colors hover:bg-wood/10 md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
