import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions | Au Paradizzio Pizzas",
  description:
    "Découvrez les offres et promotions d'Au Paradizzio Pizzas : codes promo, pizza du mois, formules et programme de fidélité.",
  openGraph: {
    title: "Promotions | Au Paradizzio Pizzas",
    description:
      "Profitez de nos offres exclusives sur les pizzas artisanales au feu de bois.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
