"use client";

import Link from "next/link";
import { Pizza, MapPin, Phone, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/promotions", label: "Promotions" },
  { href: "/a-propos", label: "\u00C0 propos" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/cgv", label: "CGV" },
  { href: "/mentions-legales", label: "Mentions l\u00E9gales" },
  { href: "/politique-de-confidentialite", label: "Politique de confidentialit\u00E9" },
  { href: "/faq", label: "FAQ" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-wood text-cream">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Pizza className="h-8 w-8 text-accent" strokeWidth={1.5} />
              <span className="font-heading text-xl font-bold text-white">
                Au Paradizzio
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-cream/80">
              Pizzeria artisanale au feu de bois depuis 1995. Plus de 60
              recettes maison pr&eacute;par&eacute;es avec des ingr&eacute;dients frais et de qualit&eacute;.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-accent hover:text-wood"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/80 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Informations
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/80 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-white">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-cream/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  711 Route de Carpentras
                  <br />
                  84320 Entraigues-sur-la-Sorgue
                </span>
              </li>
              <li>
                <a
                  href="tel:0490481860"
                  className="flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent" />
                  04 90 48 18 60
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@paradizzio.fr"
                  className="flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent" />
                  contact@paradizzio.fr
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-cream/80">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  Mar - Jeu : 17h30 - 21h30
                  <br />
                  Ven - Sam : 17h30 - 22h00
                  <br />
                  Dim : 17h30 - 21h30
                  <br />
                  Lundi : Ferm&eacute;
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="mb-2 font-heading text-lg font-semibold text-white">
              Restez inform&eacute;
            </h3>
            <p className="mb-4 text-sm text-cream/70">
              Recevez nos offres sp&eacute;ciales et nouveaut&eacute;s directement dans votre
              bo&icirc;te mail.
            </p>
            {subscribed ? (
              <p className="text-sm font-medium text-accent">
                Merci pour votre inscription !
              </p>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-cream/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-wood transition-colors hover:bg-accent-light"
                >
                  S&apos;inscrire
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10 bg-wood/90">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-cream/60">
            &copy; 2024 Au Paradizzio Pizzas - SARL BALDO. Tous droits
            r&eacute;serv&eacute;s.
          </p>
        </div>
      </div>
    </footer>
  );
}
