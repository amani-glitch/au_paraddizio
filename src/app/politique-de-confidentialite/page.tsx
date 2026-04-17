import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Au Paradizzio Pizzas",
  description:
    "Politique de confidentialité d'Au Paradizzio Pizzas. Informations sur la collecte, le traitement et la protection de vos données personnelles conformément au RGPD.",
  openGraph: {
    title: "Politique de Confidentialité | Au Paradizzio Pizzas",
    description:
      "Découvrez comment Au Paradizzio Pizzas protège vos données personnelles.",
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

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood via-wood to-wood-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-cream/70 text-sm">
            Dernière mise à jour : 1er janvier 2025
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-8 sm:p-12">
            <p className="text-wood-light leading-relaxed mb-8">
              La présente Politique de Confidentialité décrit la manière dont
              la société SARL BALDO, exploitant{" "}
              <strong className="text-wood">Au Paradizzio Pizzas</strong>,
              collecte, utilise et protège vos données personnelles
              conformément au Règlement Général sur la Protection des
              Données (RGPD) et à la loi Informatique et Libertés.
            </p>

            <Section title="1. Responsable du traitement">
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">SARL BALDO</strong>
                </p>
                <p>
                  Siège social : 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </p>
                <p>SIREN : 935 005 637 — RCS Avignon</p>
                <p>Gérant : Adrien Baldelli</p>
                <p>
                  Contact DPO :{" "}
                  <a
                    href="mailto:contact@paradizzio.fr"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    contact@paradizzio.fr
                  </a>
                </p>
              </div>
            </Section>

            <Section title="2. Données collectées">
              <p>
                Dans le cadre de l&apos;utilisation du site et des services proposés,
                nous pouvons être amenés à collecter les données suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Données d&apos;identification :</strong>{" "}
                  nom, prénom, adresse email, numéro de téléphone
                </li>
                <li>
                  <strong className="text-wood">Données de livraison :</strong>{" "}
                  adresse postale, instructions de livraison
                </li>
                <li>
                  <strong className="text-wood">Données de commande :</strong>{" "}
                  historique des commandes, préférences alimentaires
                </li>
                <li>
                  <strong className="text-wood">Données de connexion :</strong>{" "}
                  adresse IP, type de navigateur, pages visitées
                </li>
                <li>
                  <strong className="text-wood">Données de paiement :</strong>{" "}
                  traitées directement par notre prestataire de paiement (Stripe),
                  sans stockage sur nos serveurs
                </li>
              </ul>
            </Section>

            <Section title="3. Finalités du traitement">
              <p>Vos données personnelles sont collectées pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>La gestion et le suivi de vos commandes</li>
                <li>La livraison de vos produits</li>
                <li>La gestion de votre compte client</li>
                <li>
                  Le programme de fidélité (suivi des points, offres
                  personnalisées)
                </li>
                <li>
                  L&apos;envoi de communications marketing (newsletters, offres
                  promotionnelles) — uniquement avec votre consentement
                  préalable
                </li>
                <li>
                  L&apos;amélioration de nos services et de l&apos;expérience utilisateur
                </li>
                <li>Le respect de nos obligations légales et réglementaires</li>
              </ul>
            </Section>

            <Section title="4. Base légale du traitement">
              <p>
                Le traitement de vos données repose sur les bases légales
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">
                    Exécution du contrat :
                  </strong>{" "}
                  traitement nécessaire à la gestion de vos commandes et à la
                  fourniture de nos services
                </li>
                <li>
                  <strong className="text-wood">Consentement :</strong>{" "}
                  communications marketing, cookies non essentiels
                </li>
                <li>
                  <strong className="text-wood">Intérêt légitime :</strong>{" "}
                  amélioration de nos services, prévention de la fraude,
                  statistiques de fréquentation
                </li>
                <li>
                  <strong className="text-wood">Obligation légale :</strong>{" "}
                  conservation des données de facturation
                </li>
              </ul>
            </Section>

            <Section title="5. Durée de conservation">
              <p>
                Vos données personnelles sont conservées pendant les durées
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Données de compte :</strong> 3 ans
                  après la dernière activité sur le compte
                </li>
                <li>
                  <strong className="text-wood">Données de commande :</strong> 3 ans
                  après la dernière commande, puis archivage 5 ans pour
                  obligations comptables
                </li>
                <li>
                  <strong className="text-wood">Données de prospection :</strong> 3
                  ans à compter du dernier contact
                </li>
                <li>
                  <strong className="text-wood">Cookies :</strong> 13 mois
                  maximum
                </li>
              </ul>
              <p>
                Au-delà de ces durées, vos données sont supprimées ou
                anonymisées.
              </p>
            </Section>

            <Section title="6. Droits des utilisateurs">
              <p>
                Conformément au RGPD, vous disposez des droits suivants
                concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Droit d&apos;accès :</strong> obtenir
                  la confirmation du traitement de vos données et en recevoir
                  une copie
                </li>
                <li>
                  <strong className="text-wood">
                    Droit de rectification :
                  </strong>{" "}
                  corriger des données inexactes ou incomplètes
                </li>
                <li>
                  <strong className="text-wood">
                    Droit à l&apos;effacement :
                  </strong>{" "}
                  demander la suppression de vos données dans les conditions
                  prévues par la loi
                </li>
                <li>
                  <strong className="text-wood">
                    Droit à la portabilité :
                  </strong>{" "}
                  recevoir vos données dans un format structuré et lisible par
                  machine
                </li>
                <li>
                  <strong className="text-wood">
                    Droit d&apos;opposition :
                  </strong>{" "}
                  vous opposer au traitement de vos données pour des motifs
                  légitimes
                </li>
                <li>
                  <strong className="text-wood">
                    Droit à la limitation :
                  </strong>{" "}
                  demander la limitation du traitement de vos données
                </li>
              </ul>
              <p>
                Pour exercer vos droits, contactez-nous à l&apos;adresse :{" "}
                <a
                  href="mailto:contact@paradizzio.fr"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  contact@paradizzio.fr
                </a>
              </p>
              <p>
                Vous disposez également du droit d&apos;introduire une
                réclamation auprès de la{" "}
                <strong className="text-wood">CNIL</strong> (Commission Nationale
                de l&apos;Informatique et des Libertés) : www.cnil.fr.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Le site paradizzio.fr utilise des cookies pour assurer son
                bon fonctionnement et améliorer l&apos;expérience utilisateur.
              </p>
              <p>Les cookies utilisés se répartissent en :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Cookies essentiels :</strong>{" "}
                  nécessaires au fonctionnement du site (panier, session,
                  authentification)
                </li>
                <li>
                  <strong className="text-wood">Cookies analytiques :</strong>{" "}
                  mesure d&apos;audience et statistiques de fréquentation
                </li>
                <li>
                  <strong className="text-wood">Cookies marketing :</strong>{" "}
                  personnalisation des publicités et suivi des performances des
                  campagnes
                </li>
              </ul>
              <p>
                Lors de votre première visite, un bandeau de consentement vous
                permet d&apos;accepter ou de refuser les cookies non essentiels. Vous
                pouvez modifier vos préférences à tout moment.
              </p>
            </Section>

            <Section title="8. Sous-traitants">
              <p>
                Pour le fonctionnement de nos services, nous faisons appel aux
                sous-traitants suivants, qui s&apos;engagent à respecter la
                réglementation en matière de protection des données :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-2">
                  <thead>
                    <tr className="border-b-2 border-wood/10">
                      <th className="text-left py-2 pr-4 font-semibold text-wood">
                        Sous-traitant
                      </th>
                      <th className="text-left py-2 pr-4 font-semibold text-wood">
                        Finalité
                      </th>
                      <th className="text-left py-2 font-semibold text-wood">
                        Localisation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-wood/5">
                      <td className="py-2 pr-4">Stripe</td>
                      <td className="py-2 pr-4">Traitement des paiements</td>
                      <td className="py-2">États-Unis / UE</td>
                    </tr>
                    <tr className="border-b border-wood/5">
                      <td className="py-2 pr-4">SendGrid</td>
                      <td className="py-2 pr-4">Envoi d&apos;emails transactionnels</td>
                      <td className="py-2">États-Unis</td>
                    </tr>
                    <tr className="border-b border-wood/5">
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">Hébergement du site</td>
                      <td className="py-2">États-Unis / UE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                Les transferts de données en dehors de l&apos;Union Européenne sont
                encadrés par des clauses contractuelles types ou des
                mécanismes de certification approuvés.
              </p>
            </Section>

            <Section title="9. Sécurité des données">
              <p>
                Nous mettons en &oelig;uvre les mesures techniques et
                organisationnelles appropriées pour protéger vos données
                personnelles contre tout accès non autorisé, modification,
                divulgation ou destruction. Ces mesures comprennent notamment :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Sauvegardes régulières</li>
                <li>Mise à jour régulière des systèmes</li>
              </ul>
            </Section>

            <Section title="10. Modification de la politique">
              <p>
                Nous nous réservons le droit de modifier la présente Politique
                de Confidentialité à tout moment. Toute modification sera
                publiée sur cette page avec la date de mise à jour. Nous vous
                encourageons à la consulter régulièrement.
              </p>
              <p>
                En cas de modification substantielle, nous vous en informerons
                par email ou par un avis visible sur le site.
              </p>
            </Section>

            {/* Contact */}
            <div className="mt-12 pt-8 border-t border-wood/10">
              <h3 className="font-heading text-lg font-bold text-wood mb-3">
                Contact
              </h3>
              <p className="text-sm text-wood-light">
                Pour toute question relative à la présente politique ou pour
                exercer vos droits, vous pouvez nous contacter :
              </p>
              <ul className="text-sm text-wood-light mt-2 space-y-1">
                <li>
                  Email :{" "}
                  <a
                    href="mailto:contact@paradizzio.fr"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    contact@paradizzio.fr
                  </a>
                </li>
                <li>
                  Courrier : SARL BALDO, 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </li>
                <li>
                  Téléphone :{" "}
                  <a
                    href="tel:0490481860"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    04 90 48 18 60
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
