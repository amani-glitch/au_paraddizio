"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Award,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/compte/profil", label: "Mon profil", icon: User },
  { href: "/compte/commandes", label: "Mes commandes", icon: ShoppingBag },
  { href: "/compte/adresses", label: "Mes adresses", icon: MapPin },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart },
  { href: "/compte/fidelite", label: "Programme de fid\u00e9lit\u00e9", icon: Award },
];

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // proceed with local logout even if the API call fails
    }
    logout();
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile horizontal tabs */}
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/compte/profil" && pathname === "/compte");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-cream hover:text-wood"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl bg-white p-4 shadow-sm">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === "/compte/profil" && pathname === "/compte");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-cream hover:text-wood"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                D&eacute;connexion
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
