import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Au Paradizzio Pizzas",
  description:
    "Consultez les Conditions Générales de Vente d'Au Paradizzio Pizzas. Informations sur les commandes, livraison, paiement et droit de rétractation.",
  openGraph: {
    title: "CGV | Au Paradizzio Pizzas",
    description:
      "Conditions Générales de Vente d'Au Paradizzio Pizzas à Entraigues-sur-la-Sorgue.",
    locale: "fr_FR",
    type: "website",
  },
};

interface ArticleProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function Article({ number, title, children }: ArticleProps) {
  return (
    <article className="mb-10">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-wood mb-4">
        Article {number} &mdash; {title}
      </h2>
      <div className="text-wood-light leading-relaxed space-y-3">{children}</div>
    </article>
  );
}

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood via-wood to-wood-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Conditions G&eacute;n&eacute;rales de Vente
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
              Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (ci-apr&egrave;s &laquo;
              CGV &raquo;) r&eacute;gissent l&apos;ensemble des ventes r&eacute;alis&eacute;es par la
              soci&eacute;t&eacute; SARL BALDO, exploitant l&apos;&eacute;tablissement{" "}
              <strong className="text-wood">Au Paradizzio Pizzas</strong>, via
              le site internet paradizzio.fr ainsi qu&apos;en &eacute;tablissement.
            </p>

            <Article number={1} title="Objet">
              <p>
                Les pr&eacute;sentes CGV ont pour objet de d&eacute;finir les droits et
                obligations des parties dans le cadre de la vente en ligne et
                sur place de produits alimentaires (pizzas, entr&eacute;es, desserts,
                boissons) propos&eacute;s par Au Paradizzio Pizzas.
              </p>
              <p>
                Toute commande pass&eacute;e sur le site implique l&apos;acceptation
                int&eacute;grale et sans r&eacute;serve des pr&eacute;sentes CGV par le client.
              </p>
            </Article>

            <Article number={2} title="Produits et prix">
              <p>
                Les produits propos&eacute;s &agrave; la vente sont d&eacute;crits avec la plus
                grande exactitude possible. Les photographies illustratives
                n&apos;ont pas de valeur contractuelle.
              </p>
              <p>
                Les prix sont indiqu&eacute;s en euros toutes taxes comprises (TTC).
                La TVA applicable est de 10 % pour les produits de restauration
                &agrave; emporter et en livraison, et de 10 % pour la consommation
                sur place, conform&eacute;ment &agrave; la r&eacute;glementation en vigueur.
              </p>
              <p>
                Au Paradizzio se r&eacute;serve le droit de modifier ses prix &agrave; tout
                moment. Les produits sont factur&eacute;s au tarif en vigueur au
                moment de la validation de la commande.
              </p>
            </Article>

            <Article number={3} title="Commandes">
              <p>
                Le processus de commande est le suivant :
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>S&eacute;lection des produits et ajout au panier</li>
                <li>V&eacute;rification du r&eacute;capitulatif de commande</li>
                <li>Choix du mode de retrait (livraison, &agrave; emporter, sur place)</li>
                <li>Saisie des informations de livraison le cas &eacute;ch&eacute;ant</li>
                <li>Validation du paiement</li>
                <li>Confirmation de la commande par email</li>
              </ol>
              <p>
                La commande est consid&eacute;r&eacute;e comme d&eacute;finitive apr&egrave;s
                validation du paiement. Un email de confirmation est envoy&eacute;
                au client.
              </p>
              <p>
                <strong className="text-wood">Annulation :</strong> toute
                commande peut &ecirc;tre annul&eacute;e dans un d&eacute;lai de 5 minutes apr&egrave;s
                sa validation, sous r&eacute;serve que la pr&eacute;paration n&apos;ait pas
                d&eacute;but&eacute;. Pass&eacute; ce d&eacute;lai, aucune annulation ne sera accept&eacute;e.
              </p>
            </Article>

            <Article number={4} title="Livraison">
              <p>
                Les livraisons sont effectu&eacute;es dans un rayon d&eacute;fini autour de
                l&apos;&eacute;tablissement, comprenant notamment Entraigues-sur-la-Sorgue
                et les communes limitrophes (Althen-des-Paluds, Monteux,
                Sorgues, B&eacute;darrides, Vedene, Le Pontet).
              </p>
              <p>
                Les d&eacute;lais de livraison sont estim&eacute;s entre 30 et 50 minutes
                selon l&apos;affluence et la distance. Ces d&eacute;lais sont indicatifs
                et ne constituent pas un engagement contractuel.
              </p>
              <p>
                <strong className="text-wood">Frais de livraison :</strong> la
                livraison est gratuite &agrave; Entraigues-sur-la-Sorgue pour toute
                commande sup&eacute;rieure &agrave; 25 &euro;. Des frais de livraison peuvent
                s&apos;appliquer pour les autres communes et seront indiqu&eacute;s avant
                validation de la commande.
              </p>
            </Article>

            <Article number={5} title="Paiement">
              <p>
                Les moyens de paiement accept&eacute;s sont :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Carte bancaire (Visa, Mastercard, CB) via Stripe</li>
                <li>Esp&egrave;ces (&agrave; la livraison ou sur place)</li>
                <li>Titres-restaurant (Ticket Restaurant, Ch&egrave;que D&eacute;jeuner, Edenred, etc.)</li>
              </ul>
              <p>
                Le paiement est s&eacute;curis&eacute; par notre prestataire Stripe,
                certifi&eacute; PCI-DSS. Aucune donn&eacute;e bancaire n&apos;est stock&eacute;e sur
                nos serveurs.
              </p>
            </Article>

            <Article number={6} title="Droit de r&eacute;tractation">
              <p>
                Conform&eacute;ment &agrave; l&apos;article L221-28 du Code de la consommation,
                le droit de r&eacute;tractation{" "}
                <strong className="text-wood">ne s&apos;applique pas</strong> aux
                contrats de fourniture de denr&eacute;es alimentaires p&eacute;rissables ou
                susceptibles de se d&eacute;t&eacute;riorer rapidement.
              </p>
              <p>
                Les produits propos&eacute;s par Au Paradizzio &eacute;tant des denr&eacute;es
                alimentaires pr&eacute;par&eacute;es &agrave; la commande, aucun droit de
                r&eacute;tractation n&apos;est applicable.
              </p>
            </Article>

            <Article number={7} title="R&eacute;clamations">
              <p>
                Pour toute r&eacute;clamation relative &agrave; une commande (produit non
                conforme, erreur de pr&eacute;paration, probl&egrave;me de livraison), le
                client peut contacter Au Paradizzio :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Par t&eacute;l&eacute;phone :{" "}
                  <a
                    href="tel:0490481860"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    04 90 48 18 60
                  </a>
                </li>
                <li>
                  Par email :{" "}
                  <a
                    href="mailto:contact@paradizzio.fr"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    contact@paradizzio.fr
                  </a>
                </li>
                <li>
                  Via le{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:text-primary-dark font-semibold"
                  >
                    formulaire de contact
                  </Link>
                </li>
              </ul>
              <p>
                Les r&eacute;clamations doivent &ecirc;tre effectu&eacute;es dans un d&eacute;lai de
                24 heures suivant la r&eacute;ception de la commande. Au Paradizzio
                s&apos;engage &agrave; traiter chaque r&eacute;clamation dans les meilleurs
                d&eacute;lais et &agrave; proposer une solution adapt&eacute;e (remboursement
                partiel ou total, avoir, nouvelle livraison).
              </p>
            </Article>

            <Article number={8} title="Protection des donn&eacute;es">
              <p>
                Les donn&eacute;es personnelles collect&eacute;es dans le cadre des
                commandes sont trait&eacute;es conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral
                sur la Protection des Donn&eacute;es (RGPD) et &agrave; la loi Informatique
                et Libert&eacute;s.
              </p>
              <p>
                Pour plus d&apos;informations sur le traitement de vos donn&eacute;es,
                veuillez consulter notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialit&eacute;
                </Link>
                .
              </p>
            </Article>

            <Article number={9} title="Loi applicable et litiges">
              <p>
                Les pr&eacute;sentes CGV sont soumises au droit fran&ccedil;ais.
              </p>
              <p>
                En cas de litige, les parties s&apos;efforceront de trouver une
                solution amiable. &Agrave; d&eacute;faut, le litige sera soumis aux
                tribunaux comp&eacute;tents du ressort du{" "}
                <strong className="text-wood">Tribunal d&apos;Avignon</strong>.
              </p>
              <p>
                Conform&eacute;ment aux dispositions du Code de la consommation, le
                client peut recourir &agrave; un m&eacute;diateur de la consommation en cas
                de litige non r&eacute;solu.
              </p>
            </Article>

            {/* Identité de l'entreprise */}
            <div className="mt-12 pt-8 border-t border-wood/10">
              <h3 className="font-heading text-lg font-bold text-wood mb-3">
                Identification du vendeur
              </h3>
              <div className="text-sm text-wood-light space-y-1">
                <p>
                  <strong className="text-wood">SARL BALDO</strong>
                </p>
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
                    className="text-primary hover:text-primary-dark"
                  >
                    04 90 48 18 60
                  </a>
                </p>
                <p>
                  Email :{" "}
                  <a
                    href="mailto:contact@paradizzio.fr"
                    className="text-primary hover:text-primary-dark"
                  >
                    contact@paradizzio.fr
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
