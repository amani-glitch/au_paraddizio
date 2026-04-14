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
            Politique de Confidentialit&eacute;
          </h1>
          <p className="text-cream/70 text-sm">
            Derni&egrave;re mise &agrave; jour : 1er janvier 2025
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-wood/5 p-8 sm:p-12">
            <p className="text-wood-light leading-relaxed mb-8">
              La pr&eacute;sente Politique de Confidentialit&eacute; d&eacute;crit la mani&egrave;re dont
              la soci&eacute;t&eacute; SARL BALDO, exploitant{" "}
              <strong className="text-wood">Au Paradizzio Pizzas</strong>,
              collecte, utilise et prot&egrave;ge vos donn&eacute;es personnelles
              conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des
              Donn&eacute;es (RGPD) et &agrave; la loi Informatique et Libert&eacute;s.
            </p>

            <Section title="1. Responsable du traitement">
              <div className="bg-offwhite rounded-xl p-5 text-sm space-y-1">
                <p>
                  <strong className="text-wood">SARL BALDO</strong>
                </p>
                <p>
                  Si&egrave;ge social : 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </p>
                <p>SIREN : 935 005 637 &mdash; RCS Avignon</p>
                <p>G&eacute;rant : Adrien Baldelli</p>
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

            <Section title="2. Donn&eacute;es collect&eacute;es">
              <p>
                Dans le cadre de l&apos;utilisation du site et des services propos&eacute;s,
                nous pouvons &ecirc;tre amen&eacute;s &agrave; collecter les donn&eacute;es suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Donn&eacute;es d&apos;identification :</strong>{" "}
                  nom, pr&eacute;nom, adresse email, num&eacute;ro de t&eacute;l&eacute;phone
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de livraison :</strong>{" "}
                  adresse postale, instructions de livraison
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de commande :</strong>{" "}
                  historique des commandes, pr&eacute;f&eacute;rences alimentaires
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de connexion :</strong>{" "}
                  adresse IP, type de navigateur, pages visit&eacute;es
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de paiement :</strong>{" "}
                  trait&eacute;es directement par notre prestataire de paiement (Stripe),
                  sans stockage sur nos serveurs
                </li>
              </ul>
            </Section>

            <Section title="3. Finalit&eacute;s du traitement">
              <p>Vos donn&eacute;es personnelles sont collect&eacute;es pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>La gestion et le suivi de vos commandes</li>
                <li>La livraison de vos produits</li>
                <li>La gestion de votre compte client</li>
                <li>
                  Le programme de fid&eacute;lit&eacute; (suivi des points, offres
                  personnalis&eacute;es)
                </li>
                <li>
                  L&apos;envoi de communications marketing (newsletters, offres
                  promotionnelles) &mdash; uniquement avec votre consentement
                  pr&eacute;alable
                </li>
                <li>
                  L&apos;am&eacute;lioration de nos services et de l&apos;exp&eacute;rience utilisateur
                </li>
                <li>Le respect de nos obligations l&eacute;gales et r&eacute;glementaires</li>
              </ul>
            </Section>

            <Section title="4. Base l&eacute;gale du traitement">
              <p>
                Le traitement de vos donn&eacute;es repose sur les bases l&eacute;gales
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">
                    Ex&eacute;cution du contrat :
                  </strong>{" "}
                  traitement n&eacute;cessaire &agrave; la gestion de vos commandes et &agrave; la
                  fourniture de nos services
                </li>
                <li>
                  <strong className="text-wood">Consentement :</strong>{" "}
                  communications marketing, cookies non essentiels
                </li>
                <li>
                  <strong className="text-wood">Int&eacute;r&ecirc;t l&eacute;gitime :</strong>{" "}
                  am&eacute;lioration de nos services, pr&eacute;vention de la fraude,
                  statistiques de fr&eacute;quentation
                </li>
                <li>
                  <strong className="text-wood">Obligation l&eacute;gale :</strong>{" "}
                  conservation des donn&eacute;es de facturation
                </li>
              </ul>
            </Section>

            <Section title="5. Dur&eacute;e de conservation">
              <p>
                Vos donn&eacute;es personnelles sont conserv&eacute;es pendant les dur&eacute;es
                suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Donn&eacute;es de compte :</strong> 3 ans
                  apr&egrave;s la derni&egrave;re activit&eacute; sur le compte
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de commande :</strong> 3 ans
                  apr&egrave;s la derni&egrave;re commande, puis archivage 5 ans pour
                  obligations comptables
                </li>
                <li>
                  <strong className="text-wood">Donn&eacute;es de prospection :</strong> 3
                  ans &agrave; compter du dernier contact
                </li>
                <li>
                  <strong className="text-wood">Cookies :</strong> 13 mois
                  maximum
                </li>
              </ul>
              <p>
                Au-del&agrave; de ces dur&eacute;es, vos donn&eacute;es sont supprim&eacute;es ou
                anonymis&eacute;es.
              </p>
            </Section>

            <Section title="6. Droits des utilisateurs">
              <p>
                Conform&eacute;ment au RGPD, vous disposez des droits suivants
                concernant vos donn&eacute;es personnelles :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Droit d&apos;acc&egrave;s :</strong> obtenir
                  la confirmation du traitement de vos donn&eacute;es et en recevoir
                  une copie
                </li>
                <li>
                  <strong className="text-wood">
                    Droit de rectification :
                  </strong>{" "}
                  corriger des donn&eacute;es inexactes ou incompl&egrave;tes
                </li>
                <li>
                  <strong className="text-wood">
                    Droit &agrave; l&apos;effacement :
                  </strong>{" "}
                  demander la suppression de vos donn&eacute;es dans les conditions
                  pr&eacute;vues par la loi
                </li>
                <li>
                  <strong className="text-wood">
                    Droit &agrave; la portabilit&eacute; :
                  </strong>{" "}
                  recevoir vos donn&eacute;es dans un format structur&eacute; et lisible par
                  machine
                </li>
                <li>
                  <strong className="text-wood">
                    Droit d&apos;opposition :
                  </strong>{" "}
                  vous opposer au traitement de vos donn&eacute;es pour des motifs
                  l&eacute;gitimes
                </li>
                <li>
                  <strong className="text-wood">
                    Droit &agrave; la limitation :
                  </strong>{" "}
                  demander la limitation du traitement de vos donn&eacute;es
                </li>
              </ul>
              <p>
                Pour exercer vos droits, contactez-nous &agrave; l&apos;adresse :{" "}
                <a
                  href="mailto:contact@paradizzio.fr"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  contact@paradizzio.fr
                </a>
              </p>
              <p>
                Vous disposez &eacute;galement du droit d&apos;introduire une
                r&eacute;clamation aupr&egrave;s de la{" "}
                <strong className="text-wood">CNIL</strong> (Commission Nationale
                de l&apos;Informatique et des Libert&eacute;s) : www.cnil.fr.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                Le site paradizzio.fr utilise des cookies pour assurer son
                bon fonctionnement et am&eacute;liorer l&apos;exp&eacute;rience utilisateur.
              </p>
              <p>Les cookies utilis&eacute;s se r&eacute;partissent en :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-wood">Cookies essentiels :</strong>{" "}
                  n&eacute;cessaires au fonctionnement du site (panier, session,
                  authentification)
                </li>
                <li>
                  <strong className="text-wood">Cookies analytiques :</strong>{" "}
                  mesure d&apos;audience et statistiques de fr&eacute;quentation
                </li>
                <li>
                  <strong className="text-wood">Cookies marketing :</strong>{" "}
                  personnalisation des publicit&eacute;s et suivi des performances des
                  campagnes
                </li>
              </ul>
              <p>
                Lors de votre premi&egrave;re visite, un bandeau de consentement vous
                permet d&apos;accepter ou de refuser les cookies non essentiels. Vous
                pouvez modifier vos pr&eacute;f&eacute;rences &agrave; tout moment.
              </p>
            </Section>

            <Section title="8. Sous-traitants">
              <p>
                Pour le fonctionnement de nos services, nous faisons appel aux
                sous-traitants suivants, qui s&apos;engagent &agrave; respecter la
                r&eacute;glementation en mati&egrave;re de protection des donn&eacute;es :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-2">
                  <thead>
                    <tr className="border-b-2 border-wood/10">
                      <th className="text-left py-2 pr-4 font-semibold text-wood">
                        Sous-traitant
                      </th>
                      <th className="text-left py-2 pr-4 font-semibold text-wood">
                        Finalit&eacute;
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
                      <td className="py-2">&Eacute;tats-Unis / UE</td>
                    </tr>
                    <tr className="border-b border-wood/5">
                      <td className="py-2 pr-4">SendGrid</td>
                      <td className="py-2 pr-4">Envoi d&apos;emails transactionnels</td>
                      <td className="py-2">&Eacute;tats-Unis</td>
                    </tr>
                    <tr className="border-b border-wood/5">
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">H&eacute;bergement du site</td>
                      <td className="py-2">&Eacute;tats-Unis / UE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                Les transferts de donn&eacute;es en dehors de l&apos;Union Europ&eacute;enne sont
                encadr&eacute;s par des clauses contractuelles types ou des
                m&eacute;canismes de certification approuv&eacute;s.
              </p>
            </Section>

            <Section title="9. S&eacute;curit&eacute; des donn&eacute;es">
              <p>
                Nous mettons en &oelig;uvre les mesures techniques et
                organisationnelles appropri&eacute;es pour prot&eacute;ger vos donn&eacute;es
                personnelles contre tout acc&egrave;s non autoris&eacute;, modification,
                divulgation ou destruction. Ces mesures comprennent notamment :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Chiffrement des donn&eacute;es en transit (HTTPS/TLS)</li>
                <li>Acc&egrave;s restreint aux donn&eacute;es personnelles</li>
                <li>Sauvegardes r&eacute;guli&egrave;res</li>
                <li>Mise &agrave; jour r&eacute;guli&egrave;re des syst&egrave;mes</li>
              </ul>
            </Section>

            <Section title="10. Modification de la politique">
              <p>
                Nous nous r&eacute;servons le droit de modifier la pr&eacute;sente Politique
                de Confidentialit&eacute; &agrave; tout moment. Toute modification sera
                publi&eacute;e sur cette page avec la date de mise &agrave; jour. Nous vous
                encourageons &agrave; la consulter r&eacute;guli&egrave;rement.
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
                Pour toute question relative &agrave; la pr&eacute;sente politique ou pour
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
                  T&eacute;l&eacute;phone :{" "}
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
