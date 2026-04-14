import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Au Paradizzio Pizzas",
  description:
    "Contactez Au Paradizzio Pizzas à Entraigues-sur-la-Sorgue. Formulaire de contact, téléphone, adresse et horaires d'ouverture.",
  openGraph: {
    title: "Contact | Au Paradizzio Pizzas",
    description:
      "Contactez notre pizzeria artisanale au feu de bois à Entraigues-sur-la-Sorgue.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
