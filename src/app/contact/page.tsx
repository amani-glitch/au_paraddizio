"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

// export const metadata not possible with "use client", see generateMetadata below

const subjects = [
  { value: "", label: "Choisir un sujet" },
  { value: "question", label: "Question" },
  { value: "reservation", label: "Réservation" },
  { value: "reclamation", label: "Réclamation" },
  { value: "autre", label: "Autre" },
];

const openingHours = [
  { day: "Lundi", hours: "Fermé" },
  { day: "Mardi", hours: "17h30 - 21h30" },
  { day: "Mercredi", hours: "17h30 - 21h30" },
  { day: "Jeudi", hours: "17h30 - 21h30" },
  { day: "Vendredi", hours: "17h30 - 22h00" },
  { day: "Samedi", hours: "17h30 - 22h00" },
  { day: "Dimanche", hours: "17h30 - 21h30" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood via-wood to-wood-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-cream/80 max-w-2xl mx-auto">
            Une question, une réservation ou une suggestion ? N&apos;hésitez pas
            à nous écrire, nous vous répondrons dans les plus brefs
            délais.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* ── Contact Form (3 cols) ──────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-8">
                <h2 className="font-heading text-2xl font-bold text-wood mb-6">
                  Envoyez-nous un message
                </h2>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-secondary mb-4" />
                    <h3 className="font-heading text-xl font-bold text-wood mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-wood-light">
                      Merci pour votre message. Nous vous répondrons dans les
                      plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nom */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-wood mb-1.5"
                      >
                        Nom complet <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className="w-full rounded-lg border border-wood/20 bg-offwhite px-4 py-3 text-sm text-wood placeholder:text-wood-light/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-wood mb-1.5"
                      >
                        Adresse email <span className="text-primary">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.fr"
                        className="w-full rounded-lg border border-wood/20 bg-offwhite px-4 py-3 text-sm text-wood placeholder:text-wood-light/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-wood mb-1.5"
                      >
                        Téléphone{" "}
                        <span className="text-wood-light font-normal">
                          (optionnel)
                        </span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="06 12 34 56 78"
                        className="w-full rounded-lg border border-wood/20 bg-offwhite px-4 py-3 text-sm text-wood placeholder:text-wood-light/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-wood mb-1.5"
                      >
                        Sujet <span className="text-primary">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className={cn(
                          "w-full rounded-lg border border-wood/20 bg-offwhite px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
                          formData.subject
                            ? "text-wood"
                            : "text-wood-light/50"
                        )}
                      >
                        {subjects.map((s) => (
                          <option key={s.value} value={s.value} disabled={!s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-wood mb-1.5"
                      >
                        Message <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Votre message..."
                        className="w-full rounded-lg border border-wood/20 bg-offwhite px-4 py-3 text-sm text-wood placeholder:text-wood-light/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={sending}
                      className={cn(
                        "inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300",
                        sending && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {sending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── Info Column (2 cols) ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Coordonnées */}
              <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-6">
                <h2 className="font-heading text-xl font-bold text-wood mb-5">
                  Nos coordonnées
                </h2>

                {/* Address */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wood text-sm mb-0.5">
                      Adresse
                    </h3>
                    <p className="text-sm text-wood-light">
                      711 Route de Carpentras
                      <br />
                      84320 Entraigues-sur-la-Sorgue
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wood text-sm mb-0.5">
                      Téléphone
                    </h3>
                    <a
                      href="tel:0490481860"
                      className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
                    >
                      04 90 48 18 60
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wood text-sm mb-0.5">
                      Email
                    </h3>
                    <a
                      href="mailto:contact@paradizzio.fr"
                      className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
                    >
                      contact@paradizzio.fr
                    </a>
                  </div>
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-accent" />
                  <h2 className="font-heading text-xl font-bold text-wood">
                    Horaires d&apos;ouverture
                  </h2>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {openingHours.map((h) => (
                      <tr
                        key={h.day}
                        className="border-b border-wood/5 last:border-0"
                      >
                        <td className="py-2 font-medium text-wood">
                          {h.day}
                        </td>
                        <td className="py-2 text-right">
                          {h.hours === "Fermé" ? (
                            <span className="text-primary font-medium">
                              Fermé
                            </span>
                          ) : (
                            <span className="text-wood-light">{h.hours}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Google Maps placeholder */}
              <div className="bg-white rounded-2xl shadow-sm border border-wood/5 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 flex flex-col items-center justify-center p-6">
                  <Map className="w-10 h-10 text-secondary/30 mb-3" />
                  <p className="text-wood/40 font-heading text-sm mb-1">
                    Google Maps
                  </p>
                  <p className="text-wood/30 text-xs text-center">
                    711 Route de Carpentras, 84320 Entraigues-sur-la-Sorgue
                  </p>
                </div>
              </div>

              {/* Facebook */}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-wood/5 p-5 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-wood text-sm">
                    Suivez-nous sur Facebook
                  </p>
                  <p className="text-xs text-wood-light">
                    Au Paradizzio Pizzas
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
