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
            Mentions L&eacute;gales
          </h1>
          <p className="text-cream/70 text-sm">
            Conform&eacute;ment &agrave; la loi n&deg; 2004-575 du 21 juin 2004 pour la
            confiance dans l&apos;&eacute;conomie num&eacute;rique.
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-8 sm:p-12">
            <Section title="1. &Eacute;diteur du site">
              <p>
                Le site paradizzio.fr est &eacute;dit&eacute; par :
              </p>
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">SARL BALDO</strong>
                </p>
                <p>Capital social : 6 000 &euro;</p>
                <p>SIREN : 935 005 637</p>
                <p>RCS Avignon</p>
                <p>
                  Si&egrave;ge social : 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </p>
                <p>
                  T&eacute;l&eacute;phone :{" "}
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
                en sa qualit&eacute; de g&eacute;rant de la SARL BALDO.
              </p>
            </Section>

            <Section title="3. H&eacute;bergement">
              <p>Le site est h&eacute;berg&eacute; par :</p>
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">Vercel Inc.</strong>
                </p>
                <p>440 N Barranca Ave #4133</p>
                <p>Covina, CA 91723, &Eacute;tats-Unis</p>
                <p>Site : vercel.com</p>
              </div>
            </Section>

            <Section title="4. Propri&eacute;t&eacute; intellectuelle">
              <p>
                L&apos;ensemble des contenus pr&eacute;sents sur le site paradizzio.fr
                (textes, images, graphismes, logo, ic&ocirc;nes, vid&eacute;os, logiciels,
                base de donn&eacute;es) est prot&eacute;g&eacute; par les dispositions du Code de
                la propri&eacute;t&eacute; intellectuelle et appartient &agrave; la SARL BALDO ou
                fait l&apos;objet d&apos;une autorisation d&apos;utilisation.
              </p>
              <p>
                Toute reproduction, repr&eacute;sentation, modification, publication
                ou adaptation de tout ou partie des &eacute;l&eacute;ments du site, quel que
                soit le moyen ou le proc&eacute;d&eacute; utilis&eacute;, est interdite sans
                l&apos;autorisation &eacute;crite pr&eacute;alable de la SARL BALDO.
              </p>
              <p>
                Toute exploitation non autoris&eacute;e du site ou de ses contenus
                sera consid&eacute;r&eacute;e comme constitutive d&apos;une contrefa&ccedil;on et
                poursuivie conform&eacute;ment aux articles L.335-2 et suivants du
                Code de la propri&eacute;t&eacute; intellectuelle.
              </p>
            </Section>

            <Section title="5. Responsabilit&eacute;">
              <p>
                La SARL BALDO s&apos;efforce d&apos;assurer l&apos;exactitude et la mise &agrave;
                jour des informations diffus&eacute;es sur le site. Toutefois, elle
                ne peut garantir que les informations soient compl&egrave;tes,
                pr&eacute;cises, exactes ou non susceptibles d&apos;&ecirc;tre modifi&eacute;es par un
                tiers.
              </p>
              <p>
                La SARL BALDO ne pourra &ecirc;tre tenue responsable de tout
                dommage direct ou indirect r&eacute;sultant de l&apos;acc&egrave;s au site ou
                de l&apos;utilisation de celui-ci, y compris l&apos;inaccessibilit&eacute;, les
                pertes de donn&eacute;es, les d&eacute;t&eacute;riorations, les destructions ou les
                virus qui pourraient affecter l&apos;&eacute;quipement informatique de
                l&apos;utilisateur.
              </p>
              <p>
                Le site peut contenir des liens hypertextes vers d&apos;autres
                sites. La SARL BALDO ne dispose d&apos;aucun moyen de contr&ocirc;le du
                contenu de ces sites tiers et n&apos;assume aucune responsabilit&eacute;
                &agrave; cet &eacute;gard.
              </p>
            </Section>

            <Section title="6. Donn&eacute;es personnelles">
              <p>
                Les donn&eacute;es personnelles collect&eacute;es sur ce site sont trait&eacute;es
                conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des
                Donn&eacute;es (RGPD) et &agrave; la loi n&deg; 78-17 du 6 janvier 1978
                relative &agrave; l&apos;informatique, aux fichiers et aux libert&eacute;s.
              </p>
              <p>
                Pour en savoir plus sur le traitement de vos donn&eacute;es
                personnelles, veuillez consulter notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialit&eacute;
                </Link>
                .
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Le site paradizzio.fr utilise des cookies pour assurer son
                bon fonctionnement et am&eacute;liorer l&apos;exp&eacute;rience utilisateur. Lors
                de votre premi&egrave;re visite, un bandeau de consentement vous
                permet de g&eacute;rer vos pr&eacute;f&eacute;rences en mati&egrave;re de cookies.
              </p>
              <p>
                Pour en savoir plus, consultez notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialit&eacute;
                </Link>
                .
              </p>
            </Section>

            <Section title="8. Loi applicable">
              <p>
                Les pr&eacute;sentes mentions l&eacute;gales sont r&eacute;gies par le droit
                fran&ccedil;ais. En cas de litige, les tribunaux comp&eacute;tents du
                ressort du <strong className="text-wood">Tribunal d&apos;Avignon</strong>{" "}
                seront seuls comp&eacute;tents.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}
