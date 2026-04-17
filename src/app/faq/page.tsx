"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ShoppingCart, Truck, CreditCard, User, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const categories = [
  { key: "all", label: "Toutes", icon: <Search className="w-4 h-4" /> },
  { key: "commandes", label: "Commandes", icon: <ShoppingCart className="w-4 h-4" /> },
  { key: "livraison", label: "Livraison", icon: <Truck className="w-4 h-4" /> },
  { key: "paiement", label: "Paiement", icon: <CreditCard className="w-4 h-4" /> },
  { key: "compte", label: "Compte", icon: <User className="w-4 h-4" /> },
  { key: "allergenes", label: "Allergènes", icon: <AlertTriangle className="w-4 h-4" /> },
];

const faqItems: FAQItem[] = [
  // Commandes
  {
    category: "commandes",
    question: "Comment commander en ligne ?",
    answer:
      "C'est très simple ! Parcourez notre menu, ajoutez les produits de votre choix au panier, choisissez votre mode de retrait (livraison, à emporter ou sur place), puis validez votre commande en procédant au paiement. Vous recevrez une confirmation par email avec le récapitulatif de votre commande.",
  },
  {
    category: "commandes",
    question: "Comment annuler ma commande ?",
    answer:
      "Vous pouvez annuler votre commande dans les 5 minutes suivant sa validation, à condition que la préparation n'ait pas encore débuté. Pour cela, contactez-nous immédiatement par téléphone au 04 90 48 18 60. Passé ce délai, la commande ne pourra plus être annulée.",
  },
  {
    category: "commandes",
    question: "Comment modifier ma commande ?",
    answer:
      "Une fois la commande validée et le paiement effectué, il n'est plus possible de la modifier en ligne. Contactez-nous rapidement par téléphone au 04 90 48 18 60 pour toute modification. Nous ferons notre possible pour répondre à votre demande si la préparation n'a pas encore commencé.",
  },
  {
    category: "commandes",
    question: "Peut-on commander à l'avance ?",
    answer:
      "Oui ! Vous pouvez passer votre commande à l'avance et choisir un créneau de retrait ou de livraison qui vous convient. Cette option est idéale pour les soirées chargées ou les événements. La commande à l'avance est disponible jusqu'à 7 jours avant la date souhaitée.",
  },
  {
    category: "commandes",
    question: "Y a-t-il un montant minimum de commande ?",
    answer:
      "Pour les commandes à emporter et sur place, il n'y a pas de montant minimum. Pour la livraison, un minimum de commande de 15 € est requis. La livraison est offerte à Entraigues-sur-la-Sorgue dès 25 € de commande.",
  },
  {
    category: "commandes",
    question: "Comment utiliser un code promo ?",
    answer:
      "Lors de la validation de votre panier, vous trouverez un champ « Code promo ». Saisissez votre code et cliquez sur « Appliquer ». La réduction sera automatiquement appliquée au montant de votre commande. Attention, les codes promo ne sont pas cumulables entre eux et sont soumis à des conditions de validité.",
  },

  // Livraison
  {
    category: "livraison",
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les délais de livraison sont généralement compris entre 30 et 50 minutes selon l'affluence et votre distance par rapport à notre pizzeria. Lors de la commande, un créneau estimé vous sera communiqué. En période de forte affluence (vendredi et samedi soir), les délais peuvent être légèrement allongés.",
  },
  {
    category: "livraison",
    question: "Quelle est la zone de livraison ?",
    answer:
      "Nous livrons à Entraigues-sur-la-Sorgue et dans les communes limitrophes : Althen-des-Paluds, Monteux, Sorgues, Bédarrides, Vedène et Le Pontet. La zone exacte est vérifiée lors de la saisie de votre adresse. Si votre commune n'est pas desservie, vous pouvez toujours commander à emporter.",
  },
  {
    category: "livraison",
    question: "La livraison est-elle gratuite ?",
    answer:
      "La livraison est gratuite à Entraigues-sur-la-Sorgue pour toute commande supérieure à 25 €. Pour les autres communes de notre zone de livraison, des frais de livraison peuvent s'appliquer et seront indiqués avant la validation de votre commande.",
  },

  // Paiement
  {
    category: "paiement",
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard, CB) via notre plateforme de paiement sécurisé Stripe, les espèces à la livraison ou sur place, ainsi que les titres-restaurant. Le paiement en ligne est 100 % sécurisé et nous ne stockons aucune donnée bancaire.",
  },
  {
    category: "paiement",
    question: "Puis-je payer en titres-restaurant ?",
    answer:
      "Oui, nous acceptons les titres-restaurant (Ticket Restaurant, Chèque Déjeuner, Edenred, Sodexo, etc.) pour le paiement sur place et à la livraison. Pour le paiement en ligne, seule la carte bancaire est acceptée. Le plafond quotidien des titres-restaurant s'applique conformément à la réglementation en vigueur.",
  },
  {
    category: "paiement",
    question: "Mon paiement est-il sécurisé ?",
    answer:
      "Absolument. Tous les paiements en ligne sont traités par Stripe, un prestataire certifié PCI-DSS (le plus haut niveau de sécurité pour les paiements par carte). Vos données bancaires sont chiffrées et ne transitent jamais par nos serveurs. Vous pouvez commander en toute confiance.",
  },

  // Compte
  {
    category: "compte",
    question: "Comment fonctionne le programme de fidélité ?",
    answer:
      "Notre programme de fidélité est simple : pour chaque pizza achetée, vous cumulez un point. Au bout de 10 pizzas achetées, la 11e est offerte ! Vos points sont automatiquement enregistrés sur votre compte. Vous pouvez suivre votre progression dans la rubrique « Mon compte > Fidélité ».",
  },
  {
    category: "compte",
    question: "Comment créer un compte ?",
    answer:
      "Pour créer un compte, cliquez sur « Inscription » en haut du site, puis renseignez vos informations (nom, email, mot de passe). La création de compte est gratuite et vous permet de suivre vos commandes, gérer vos adresses de livraison et profiter du programme de fidélité.",
  },
  {
    category: "compte",
    question: "Comment contacter le restaurant ?",
    answer:
      "Vous pouvez nous contacter de plusieurs façons : par téléphone au 04 90 48 18 60 pendant nos heures d'ouverture, par email à contact@paradizzio.fr, via notre formulaire de contact en ligne, ou directement sur notre page Facebook. Nous nous efforçons de répondre dans les plus brefs délais.",
  },
  {
    category: "compte",
    question: "Quels sont vos horaires ?",
    answer:
      "Nous sommes ouverts du mardi au samedi de 17h30 à 21h30 (jusqu'à 22h00 le vendredi et samedi), et le dimanche de 17h30 à 21h30. Nous sommes fermés le lundi. Les commandes en ligne peuvent être passées pendant les heures d'ouverture.",
  },

  // Allergènes
  {
    category: "allergenes",
    question: "Quels allergènes sont présents dans vos pizzas ?",
    answer:
      "Nos pizzas peuvent contenir les allergènes suivants : gluten (pâte à pizza), lait et produits laitiers (fromages), œufs, poissons (anchois), crustacés, fruits à coque, soja et céleri. La liste des allergènes est indiquée sur chaque fiche produit. En cas de doute, n'hésitez pas à nous contacter.",
  },
  {
    category: "allergenes",
    question: "Proposez-vous des options végétariennes, halal ou sans gluten ?",
    answer:
      "Nous proposons une sélection de pizzas végétariennes clairement identifiées sur notre carte. Concernant les options sans gluten, nous ne proposons pas de pâte sans gluten pour le moment, mais nous travaillons à en proposer prochainement. Pour les exigences halal, nous vous invitons à nous contacter directement pour connaître la composition de chaque produit.",
  },
  {
    category: "allergenes",
    question: "Comment signaler une allergie alimentaire ?",
    answer:
      "Vous pouvez signaler vos allergies directement dans les notes de votre commande ou en nous contactant par téléphone au 04 90 48 18 60. Notre équipe prendra toutes les précautions nécessaires. Veuillez noter que notre cuisine manipule de nombreux allergènes et qu'un risque de contamination croisée ne peut être totalement exclu.",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood via-wood to-wood-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Foire aux questions
          </h1>
          <p className="text-lg text-cream/80 max-w-2xl mx-auto mb-8">
            Retrouvez les réponses aux questions les plus fréquentes sur
            nos services, la livraison, le paiement et bien plus.
          </p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-light/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-white/20 bg-white text-wood text-sm placeholder:text-wood-light/50 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
                  activeCategory === cat.key
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-wood border-wood/10 hover:border-primary/30 hover:text-primary"
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-wood-light/30 mx-auto mb-4" />
              <p className="text-wood-light text-lg">
                Aucune question ne correspond à votre recherche.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 text-primary hover:text-primary-dark font-semibold text-sm"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const globalIndex = faqItems.indexOf(item);
                const isOpen = openItems.has(globalIndex);

                return (
                  <div
                    key={globalIndex}
                    className="bg-white rounded-xl border border-wood/5 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-offwhite transition-colors duration-200"
                      aria-expanded={isOpen}
                    >
                      <span className="font-heading font-semibold text-wood text-sm sm:text-base pr-2">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-wood-light flex-shrink-0 transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0">
                          <div className="border-t border-wood/5 pt-4">
                            <p className="text-wood-light text-sm leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 text-center bg-white rounded-2xl shadow-sm border border-wood/5 p-8">
            <h2 className="font-heading text-2xl font-bold text-wood mb-3">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-wood-light mb-6">
              Notre équipe est à votre disposition pour répondre à toutes
              vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                Nous contacter
              </Link>
              <a
                href="tel:0490481860"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-offwhite text-wood font-semibold px-6 py-3 rounded-full border border-wood/20 hover:border-primary/30 transition-all duration-300"
              >
                04 90 48 18 60
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
