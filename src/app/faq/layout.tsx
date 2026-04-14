import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Au Paradizzio Pizzas",
  description:
    "Questions fréquentes sur Au Paradizzio Pizzas : commandes en ligne, livraison, paiement, programme de fidélité, allergènes et plus encore.",
  openGraph: {
    title: "FAQ | Au Paradizzio Pizzas",
    description:
      "Trouvez les réponses à vos questions sur nos services de livraison de pizzas artisanales.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
