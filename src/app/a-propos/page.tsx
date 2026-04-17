import type { Metadata } from "next";
import Link from "next/link";
import {
  Flame,
  ChefHat,
  Pizza,
  Leaf,
  Star,
  ArrowRight,
  Award,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notre Histoire | Au Paradizzio Pizzas",
  description:
    "Découvrez l'histoire d'Au Paradizzio Pizzas, pizzeria artisanale au feu de bois à Entraigues-sur-la-Sorgue. Adrien et Aldo Baldelli perpétuent la tradition de la vraie pizza italienne.",
  openGraph: {
    title: "Notre Histoire | Au Paradizzio Pizzas",
    description:
      "Découvrez l'histoire d'Au Paradizzio, pizzeria artisanale au feu de bois à Entraigues-sur-la-Sorgue.",
    locale: "fr_FR",
    type: "website",
  },
};

const values = [
  {
    icon: <Flame className="w-8 h-8" />,
    title: "Feu de bois",
    description:
      "Chaque pizza est cuite dans notre four à bois traditionnel, pour une pâte croustillante et un goût incomparable.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: <ChefHat className="w-8 h-8" />,
    title: "Pâte maison",
    description:
      "Notre pâte est préparée chaque jour sur place, avec des ingrédients sélectionnés et un savoir-faire artisanal.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: <Pizza className="w-8 h-8" />,
    title: "60+ recettes",
    description:
      "Des classiques incontournables aux créations originales, notre carte offre un voyage gustatif unique.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Ingrédients frais",
    description:
      "Nous sélectionnons des produits frais et de qualité pour garantir des saveurs authentiques à chaque bouchée.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const stats = [
  { value: "60+", label: "recettes", icon: <Pizza className="w-5 h-5 text-primary" /> },
  { value: "4.7/5", label: "Google", icon: <Star className="w-5 h-5 text-accent" /> },
  { value: "190+", label: "avis", icon: <Users className="w-5 h-5 text-secondary" /> },
  { value: "Depuis 2013", label: "tradition", icon: <Award className="w-5 h-5 text-wood" /> },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-wood via-wood to-wood-light">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-8 left-[15%] text-7xl rotate-12">
            <Flame className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-12 right-[10%] text-6xl -rotate-12">
            <Pizza className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Notre Histoire
          </h1>
          <p className="text-lg sm:text-xl text-cream/80 max-w-2xl mx-auto leading-relaxed">
            Une passion familiale pour la pizza authentique, transmise de
            génération en génération.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60L48 53.3C96 46.7 192 33.3 288 26.7C384 20 480 20 576 26.7C672 33.3 768 46.7 864 50C960 53.3 1056 46.7 1152 40C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="var(--color-cream)"
            />
          </svg>
        </div>
      </section>

      {/* ── Notre histoire ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-6">
                Une tradition italienne au c&oelig;ur du Vaucluse
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />

              <p className="text-wood-light leading-relaxed text-lg mb-5">
                L&apos;histoire d&apos;<strong className="text-wood">Au Paradizzio</strong>{" "}
                commence au 711 Route de Carpentras, à
                Entraigues-sur-la-Sorgue. Cette pizzeria est devenue au fil des
                années une véritable institution pour les amateurs de pizza
                authentique dans le Vaucluse.
              </p>

              <p className="text-wood-light leading-relaxed text-lg mb-5">
                En novembre 2024,{" "}
                <strong className="text-wood">Adrien Baldelli</strong> et son
                père <strong className="text-wood">Aldo</strong> reprennent
                l&apos;établissement avec une passion débordante pour la vraie pizza
                italienne. Ensemble, ils perpétuent la tradition du{" "}
                <strong className="text-wood">four à bois</strong> et de la{" "}
                <strong className="text-wood">pâte maison</strong>, pétrie et
                préparée chaque jour sur place.
              </p>

              <p className="text-wood-light leading-relaxed text-lg">
                Leur philosophie est simple : des ingrédients frais, un
                savoir-faire artisanal et l&apos;amour du métier. Chaque pizza qui
                sort du four raconte cette histoire de passion et de tradition.
              </p>
            </div>

            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-wood/10 to-primary/5 flex flex-col items-center justify-center border-2 border-dashed border-wood/15">
                <Flame className="w-16 h-16 text-primary/30 mb-4" />
                <span className="text-wood/40 font-heading text-lg">
                  Four à bois traditionnel
                </span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-wood/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-wood text-sm">Cuisson au feu</p>
                    <p className="text-xs text-wood-light">de bois</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              Nos valeurs
            </h2>
            <p className="text-wood-light text-lg max-w-2xl mx-auto">
              Ce qui fait la différence Au Paradizzio, c&apos;est notre
              engagement quotidien envers la qualité.
            </p>
            <div className="w-16 h-1 bg-secondary rounded-full mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-wood/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    value.bg,
                    value.color
                  )}
                >
                  {value.icon}
                </div>
                <h3 className="font-heading font-bold text-wood text-lg mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-wood-light leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── L'équipe ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              L&apos;équipe
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-wood/5 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
              {/* Photo placeholder */}
              <div className="flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br from-wood/10 to-primary/5 flex flex-col items-center justify-center border-2 border-dashed border-wood/15">
                <Users className="w-12 h-12 text-wood/30 mb-2" />
                <span className="text-wood/40 text-sm font-heading">
                  Photo à venir
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-3">
                  Adrien &amp; Aldo Baldelli
                </h3>
                <p className="text-wood-light leading-relaxed text-lg mb-4">
                  Père et fils, unis par la même passion. Aldo apporte son
                  expérience et son savoir-faire transmis de génération en
                  génération, tandis qu&apos;Adrien insuffle une énergie nouvelle et
                  une vision moderne à l&apos;établissement.
                </p>
                <p className="text-wood-light leading-relaxed">
                  Ensemble, ils partagent une conviction : la pizza est un art
                  qui se respecte. Du choix des ingrédients à la cuisson au feu
                  de bois, chaque étape est réalisée avec soin et passion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Label Tables et Auberges de France ───────────────────────────── */}
      <section className="py-16 sm:py-20 bg-offwhite">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary/5 via-white to-secondary/5 rounded-3xl border-2 border-secondary/20 shadow-sm p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Award className="w-12 h-12 text-secondary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-wood mb-3">
                  Tables et Auberges de France
                </h2>
                <p className="text-wood-light leading-relaxed text-lg">
                  Au Paradizzio est fier d&apos;être labellisé{" "}
                  <strong className="text-wood">
                    Tables et Auberges de France
                  </strong>
                  , un gage de qualité reconnu qui récompense les
                  établissements offrant une cuisine authentique, un accueil
                  chaleureux et un rapport qualité-prix exemplaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chiffres clés ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-wood mb-3">
              En quelques chiffres
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-wood/5"
              >
                <div className="mb-3">{stat.icon}</div>
                <span className="font-heading font-bold text-wood text-2xl sm:text-3xl">
                  {stat.value}
                </span>
                <span className="text-sm text-wood-light mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Envie de goûter ?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Découvrez nos 60 recettes artisanales et laissez-vous tenter.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 bg-white hover:bg-cream text-primary font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Découvrir notre carte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
