"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid3x3,
  Users,
  Tag,
  Settings,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
  Pizza,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "PRINCIPAL",
    links: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
    ],
  },
  {
    title: "CATALOGUE",
    links: [
      { href: "/admin/produits", label: "Produits", icon: Package },
      { href: "/admin/categories", label: "Catégories", icon: Grid3x3 },
    ],
  },
  {
    title: "CLIENTS",
    links: [{ href: "/admin/clients", label: "Clients", icon: Users }],
  },
  {
    title: "MARKETING",
    links: [{ href: "/admin/promotions", label: "Promotions", icon: Tag }],
  },
  {
    title: "SYSTÈME",
    links: [
      { href: "/admin/parametres", label: "Paramètres", icon: Settings },
      { href: "/admin/rapports", label: "Rapports", icon: BarChart3 },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/commandes": "Commandes",
  "/admin/produits": "Produits",
  "/admin/categories": "Catégories",
  "/admin/clients": "Clients",
  "/admin/promotions": "Promotions",
  "/admin/parametres": "Paramètres",
  "/admin/rapports": "Rapports",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUser({
        id: "admin-1",
        name: "Adrien Baldelli",
        email: "adrien@paradizzio.fr",
        role: "ADMIN",
        loyaltyPoints: 0,
        addresses: [],
        phone: "04 90 48 18 60",
      });
    }
  }, [user, setUser]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) =>
      pathname.startsWith(key) && key !== "/admin"
    )?.[1] ||
    "Administration";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AB";

  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <Pizza className="h-7 w-7 text-accent shrink-0" />
          <span className="text-lg font-bold text-white tracking-tight">
            Paradizzio Admin
          </span>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3 tracking-wider">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-white/10 text-white border-l-2 border-accent"
                          : "hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-800 px-3 py-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            Retour au site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 hover:text-white transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User avatar */}
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 p-6 min-h-screen">{children}</main>
    </div>
  );
}
