import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/layout/CartSidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import SearchOverlay from "@/components/layout/SearchOverlay";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Au Paradizzio Pizzas | Pizzeria artisanale à Entraigues-sur-la-Sorgue",
  description:
    "Plus de 60 recettes de pizzas artisanales cuites au feu de bois. Commandez en ligne en livraison ou \u00E0 emporter. Pizzeria Au Paradizzio \u00E0 Entraigues-sur-la-Sorgue.",
  keywords: [
    "pizza",
    "pizzeria",
    "feu de bois",
    "Entraigues-sur-la-Sorgue",
    "livraison pizza",
    "commande en ligne",
    "Au Paradizzio",
  ],
  openGraph: {
    title: "Au Paradizzio Pizzas | Pizzeria artisanale",
    description:
      "Plus de 60 recettes de pizzas artisanales cuites au feu de bois. Commandez en ligne !",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-cream">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSidebar />
          <MobileMenu />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
