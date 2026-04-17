"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Copy,
  Check,
  Star,
  Pizza,
  Truck,
  Gift,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Promo-code copy widget                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function PromoCodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* fallback: silently ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2 bg-offwhite border-2 border-dashed border-accent/40 rounded-lg px-4 py-2.5 mt-3">
      <Tag className="w-4 h-4 text-accent" />
      <span className="font-mono font-bold text-primary text-lg tracking-wider">
        {code}
      </span>
      <button
        onClick={handleCopy}
        className={cn(
          "flex items-center gap-1 ml-2 px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200",
          copied
            ? "bg-secondary/10 text-secondary"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
        aria-label="Copier le code promo"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copié
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copier
          </>
        )}
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Newsletter form                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-20 bg-offwhite">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Gift className="w-10 h-10 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
          Ne ratez aucune offre
        </h2>
        <p className="text-wood-light text-lg mb-8">
          Inscrivez-vous à notre newsletter et recevez nos promotions exclusives
          directement dans votre boîte mail.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary font-semibold px-6 py-3 rounded-full">
            <Check className="w-5 h-5" />
            Merci pour votre inscription !
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 rounded-full border-2 border-wood/15 bg-white text-wood placeholder:text-wood/40 focus:outline-none focus:border-accent transition-colors duration-200"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              S&apos;inscrire
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Promotion cards data                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

interface Promotion {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  code?: string;
  price?: number;
  cta: { label: string; href: string };
  badge: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  badgeStyle: string;
  ctaStyle: string;
  expiry: string;
}

// No more static promotions - everything from Firestore

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loyalty steps                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const loyaltySteps = [
  { step: "1", label: "Commander" },
  { step: "2", label: "Cumuler des points" },
  { step: "3", label: "Profiter de récompenses" },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page component                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

interface ApiPromo {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  description?: string;
  expiresAt?: string | null;
}

function apiPromoToPromotion(p: ApiPromo, index: number): Promotion {
  const colors = [
    { iconBg: "bg-accent/10 text-accent", borderColor: "border-accent", badgeStyle: "bg-accent/10 text-accent", ctaStyle: "bg-accent hover:bg-accent/90 text-white" },
    { iconBg: "bg-primary/10 text-primary", borderColor: "border-primary", badgeStyle: "bg-primary/10 text-primary", ctaStyle: "bg-primary hover:bg-primary/90 text-white" },
    { iconBg: "bg-secondary/10 text-secondary", borderColor: "border-secondary", badgeStyle: "bg-secondary/10 text-secondary", ctaStyle: "bg-secondary hover:bg-secondary/90 text-white" },
  ];
  const c = colors[index % colors.length];
  const subtitle = p.type === "percentage" ? `${p.value}% de réduction`
    : p.type === "fixed" ? `${p.value}€ de réduction`
    : "Livraison gratuite";

  return {
    id: 100 + index,
    title: p.code,
    subtitle,
    description: p.description || subtitle,
    code: p.code,
    cta: { label: "Commander maintenant", href: "/menu" },
    badge: "Code promo",
    icon: <Tag className="w-7 h-7" />,
    ...c,
    expiry: p.expiresAt ? `Jusqu'au ${new Date(p.expiresAt).toLocaleDateString("fr-FR")}` : "Offre sans date limite",
  };
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.ok ? r.json() : [])
      .then((apiPromos: ApiPromo[]) => {
        const activePromos = (Array.isArray(apiPromos) ? apiPromos : []).filter((p) => p.isActive);
        setPromotions(activePromos.map(apiPromoToPromotion));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20">
        {/* Decorative background icons */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-6 left-[10%]">
            <Tag className="w-16 h-16 text-white rotate-12" />
          </div>
          <div className="absolute bottom-8 right-[15%]">
            <Gift className="w-20 h-20 text-white -rotate-6" />
          </div>
          <div className="absolute top-1/2 left-[60%]">
            <Star className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Tag className="w-4 h-4" />
            Offres spéciales
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Nos offres du moment
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Profitez de nos promotions exclusives et régalez-vous à petit prix !
          </p>
        </div>
      </section>

      {/* ── Promotions grid ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-16 text-center">
              <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="py-16 text-center">
              <Tag className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune promotion en cours pour le moment.</p>
              <p className="text-sm text-gray-400">Revenez bientôt pour découvrir nos offres !</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={cn(
                  "relative bg-white rounded-2xl border-2 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col",
                  promo.borderColor
                )}
              >
                <div className="flex flex-col h-full p-6 sm:p-8">
                  {/* Header: icon + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        promo.iconBg
                      )}
                    >
                      {promo.icon}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center text-xs font-bold px-3 py-1 rounded-full",
                        promo.badgeStyle
                      )}
                    >
                      {promo.badge}
                    </span>
                  </div>

                  {/* Title & subtitle */}
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-wood mb-1">
                    {promo.title}
                  </h2>
                  <p className="font-heading text-lg text-wood/70 font-semibold mb-3">
                    {promo.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-wood/60 text-sm leading-relaxed mb-4 flex-1">
                    {promo.description}
                  </p>

                  {/* Price (for pizza du mois) */}
                  {promo.price && (
                    <p className="text-primary font-heading font-bold text-2xl mb-4">
                      {formatPrice(promo.price)}
                    </p>
                  )}

                  {/* Promo code */}
                  {promo.code && <PromoCodeBox code={promo.code} />}

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-5 pt-5 border-t border-wood/10">
                    <Link
                      href={promo.cta.href}
                      className={cn(
                        "inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300",
                        promo.ctaStyle
                      )}
                    >
                      {promo.cta.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <span className="flex items-center gap-1.5 text-xs text-wood/50">
                      <Clock className="w-3.5 h-3.5" />
                      {promo.expiry}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ── Programme de fidélité ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary/5 via-white to-secondary/5 rounded-3xl border-2 border-secondary/20 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
              {/* Visual */}
              <div className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-secondary/10 flex flex-col items-center justify-center">
                <Gift className="w-12 h-12 text-secondary mb-2" />
                <span className="font-heading font-bold text-secondary text-sm">
                  Fidélité
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-3">
                  Programme de fidélité
                </h2>
                <p className="text-wood/70 leading-relaxed text-lg mb-2">
                  <strong className="text-wood">
                    10 pizzas achetées = 1 offerte !
                  </strong>
                </p>
                <p className="text-wood/70 leading-relaxed mb-6">
                  Créez votre compte et cumulez des points à chaque commande.
                  Suivez votre progression et profitez de récompenses exclusives.
                  C&apos;est simple, gratuit et automatique.
                </p>

                {/* Steps */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {loyaltySteps.map((s) => (
                    <div
                      key={s.step}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary text-white font-bold text-sm flex items-center justify-center mb-2">
                        {s.step}
                      </div>
                      <span className="text-xs text-wood/60 leading-snug">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link
                    href="/inscription"
                    className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Créer mon compte
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/connexion"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-offwhite text-secondary font-semibold px-6 py-3 rounded-full border border-secondary/20 hover:border-secondary/40 transition-all duration-300"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────────────── */}
      <NewsletterForm />

      {/* ── CTA finale ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Envie de se régaler ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Découvrez notre carte complète et passez commande en quelques clics.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 bg-white hover:bg-cream text-primary font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Voir la carte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
