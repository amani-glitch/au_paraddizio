import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales | Au Paradizzio Pizzas",
  description:
    "Mentions légales du site Au Paradizzio Pizzas. Informations sur l'éditeur, l'hébergeur, la propriété intellectuelle et la protection des données.",
  openGraph: {
    title: "Mentions Légales | Au Paradizzio Pizzas",
    description:
      "Mentions légales du site Au Paradizzio Pizzas à Entraigues-sur-la-Sorgue.",
    locale: "fr_FR",
    type: "website",
  },
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-wood mb-4">
        {title}
      </h2>
      <div className="text-wood-light leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood via-wood to-wood-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Mentions Légales
          </h1>
          <p className="text-cream/70 text-sm">
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la
            confiance dans l&apos;économie numérique.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-8 sm:p-12">
            <Section title="1. Éditeur du site">
              <p>
                Le site paradizzio.fr est édité par :
              </p>
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">SARL BALDO</strong>
                </p>
                <p>Capital social : 6 000 €</p>
                <p>SIREN : 935 005 637</p>
                <p>RCS Avignon</p>
                <p>
                  Siège social : 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </p>
                <p>
                  Téléphone :{" "}
                  <a
                    href="tel:0490481860"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    04 90 48 18 60
                  </a>
                </p>
                <p>
                  Email :{" "}
                  <a
                    href="mailto:contact@paradizzio.fr"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    contact@paradizzio.fr
                  </a>
                </p>
              </div>
            </Section>

            <Section title="2. Directeur de la publication">
              <p>
                Le directeur de la publication est{" "}
                <strong className="text-wood">Monsieur Adrien Baldelli</strong>,
                en sa qualité de gérant de la SARL BALDO.
              </p>
            </Section>

            <Section title="3. Hébergement">
              <p>Le site est hébergé par :</p>
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">Vercel Inc.</strong>
                </p>
                <p>440 N Barranca Ave #4133</p>
                <p>Covina, CA 91723, États-Unis</p>
                <p>Site : vercel.com</p>
              </div>
            </Section>

            <Section title="4. Propriété intellectuelle">
              <p>
                L&apos;ensemble des contenus présents sur le site paradizzio.fr
                (textes, images, graphismes, logo, icônes, vidéos, logiciels,
                base de données) est protégé par les dispositions du Code de
                la propriété intellectuelle et appartient à la SARL BALDO ou
                fait l&apos;objet d&apos;une autorisation d&apos;utilisation.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication
                ou adaptation de tout ou partie des éléments du site, quel que
                soit le moyen ou le procédé utilisé, est interdite sans
                l&apos;autorisation écrite préalable de la SARL BALDO.
              </p>
              <p>
                Toute exploitation non autorisée du site ou de ses contenus
                sera considérée comme constitutive d&apos;une contrefaçon et
                poursuivie conformément aux articles L.335-2 et suivants du
                Code de la propriété intellectuelle.
              </p>
            </Section>

            <Section title="5. Responsabilité">
              <p>
                La SARL BALDO s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à
                jour des informations diffusées sur le site. Toutefois, elle
                ne peut garantir que les informations soient complètes,
                précises, exactes ou non susceptibles d&apos;être modifiées par un
                tiers.
              </p>
              <p>
                La SARL BALDO ne pourra être tenue responsable de tout
                dommage direct ou indirect résultant de l&apos;accès au site ou
                de l&apos;utilisation de celui-ci, y compris l&apos;inaccessibilité, les
                pertes de données, les détériorations, les destructions ou les
                virus qui pourraient affecter l&apos;équipement informatique de
                l&apos;utilisateur.
              </p>
              <p>
                Le site peut contenir des liens hypertextes vers d&apos;autres
                sites. La SARL BALDO ne dispose d&apos;aucun moyen de contrôle du
                contenu de ces sites tiers et n&apos;assume aucune responsabilité
                à cet égard.
              </p>
            </Section>

            <Section title="6. Données personnelles">
              <p>
                Les données personnelles collectées sur ce site sont traitées
                conformément au Règlement Général sur la Protection des
                Données (RGPD) et à la loi n° 78-17 du 6 janvier 1978
                relative à l&apos;informatique, aux fichiers et aux libertés.
              </p>
              <p>
                Pour en savoir plus sur le traitement de vos données
                personnelles, veuillez consulter notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Le site paradizzio.fr utilise des cookies pour assurer son
                bon fonctionnement et améliorer l&apos;expérience utilisateur. Lors
                de votre première visite, un bandeau de consentement vous
                permet de gérer vos préférences en matière de cookies.
              </p>
              <p>
                Pour en savoir plus, consultez notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </Section>

            <Section title="8. Loi applicable">
              <p>
                Les présentes mentions légales sont régies par le droit
                français. En cas de litige, les tribunaux compétents du
                ressort du <strong className="text-wood">Tribunal d&apos;Avignon</strong>{" "}
                seront seuls compétents.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}
