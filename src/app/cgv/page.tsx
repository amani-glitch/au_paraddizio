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
        Article {number} — {title}
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
            Conditions Générales de Vente
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
              Les présentes Conditions Générales de Vente (ci-après «
              CGV ») régissent l&apos;ensemble des ventes réalisées par la
              société SARL BALDO, exploitant l&apos;établissement{" "}
              <strong className="text-wood">Au Paradizzio Pizzas</strong>, via
              le site internet paradizzio.fr ainsi qu&apos;en établissement.
            </p>

            <Article number={1} title="Objet">
              <p>
                Les présentes CGV ont pour objet de définir les droits et
                obligations des parties dans le cadre de la vente en ligne et
                sur place de produits alimentaires (pizzas, entrées, desserts,
                boissons) proposés par Au Paradizzio Pizzas.
              </p>
              <p>
                Toute commande passée sur le site implique l&apos;acceptation
                intégrale et sans réserve des présentes CGV par le client.
              </p>
            </Article>

            <Article number={2} title="Produits et prix">
              <p>
                Les produits proposés à la vente sont décrits avec la plus
                grande exactitude possible. Les photographies illustratives
                n&apos;ont pas de valeur contractuelle.
              </p>
              <p>
                Les prix sont indiqués en euros toutes taxes comprises (TTC).
                La TVA applicable est de 10 % pour les produits de restauration
                à emporter et en livraison, et de 10 % pour la consommation
                sur place, conformément à la réglementation en vigueur.
              </p>
              <p>
                Au Paradizzio se réserve le droit de modifier ses prix à tout
                moment. Les produits sont facturés au tarif en vigueur au
                moment de la validation de la commande.
              </p>
            </Article>

            <Article number={3} title="Commandes">
              <p>
                Le processus de commande est le suivant :
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Sélection des produits et ajout au panier</li>
                <li>Vérification du récapitulatif de commande</li>
                <li>Choix du mode de retrait (livraison, à emporter, sur place)</li>
                <li>Saisie des informations de livraison le cas échéant</li>
                <li>Validation du paiement</li>
                <li>Confirmation de la commande par email</li>
              </ol>
              <p>
                La commande est considérée comme définitive après
                validation du paiement. Un email de confirmation est envoyé
                au client.
              </p>
              <p>
                <strong className="text-wood">Annulation :</strong> toute
                commande peut être annulée dans un délai de 5 minutes après
                sa validation, sous réserve que la préparation n&apos;ait pas
                débuté. Passé ce délai, aucune annulation ne sera acceptée.
              </p>
            </Article>

            <Article number={4} title="Livraison">
              <p>
                Les livraisons sont effectuées dans un rayon défini autour de
                l&apos;établissement, comprenant notamment Entraigues-sur-la-Sorgue
                et les communes limitrophes (Althen-des-Paluds, Monteux,
                Sorgues, Bédarrides, Vedene, Le Pontet).
              </p>
              <p>
                Les délais de livraison sont estimés entre 30 et 50 minutes
                selon l&apos;affluence et la distance. Ces délais sont indicatifs
                et ne constituent pas un engagement contractuel.
              </p>
              <p>
                <strong className="text-wood">Frais de livraison :</strong> la
                livraison est gratuite à Entraigues-sur-la-Sorgue pour toute
                commande supérieure à 25 €. Des frais de livraison peuvent
                s&apos;appliquer pour les autres communes et seront indiqués avant
                validation de la commande.
              </p>
            </Article>

            <Article number={5} title="Paiement">
              <p>
                Les moyens de paiement acceptés sont :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Carte bancaire (Visa, Mastercard, CB) via Stripe</li>
                <li>Espèces (à la livraison ou sur place)</li>
                <li>Titres-restaurant (Ticket Restaurant, Chèque Déjeuner, Edenred, etc.)</li>
              </ul>
              <p>
                Le paiement est sécurisé par notre prestataire Stripe,
                certifié PCI-DSS. Aucune donnée bancaire n&apos;est stockée sur
                nos serveurs.
              </p>
            </Article>

            <Article number={6} title="Droit de rétractation">
              <p>
                Conformément à l&apos;article L221-28 du Code de la consommation,
                le droit de rétractation{" "}
                <strong className="text-wood">ne s&apos;applique pas</strong> aux
                contrats de fourniture de denrées alimentaires périssables ou
                susceptibles de se détériorer rapidement.
              </p>
              <p>
                Les produits proposés par Au Paradizzio étant des denrées
                alimentaires préparées à la commande, aucun droit de
                rétractation n&apos;est applicable.
              </p>
            </Article>

            <Article number={7} title="Réclamations">
              <p>
                Pour toute réclamation relative à une commande (produit non
                conforme, erreur de préparation, problème de livraison), le
                client peut contacter Au Paradizzio :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Par téléphone :{" "}
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
                Les réclamations doivent être effectuées dans un délai de
                24 heures suivant la réception de la commande. Au Paradizzio
                s&apos;engage à traiter chaque réclamation dans les meilleurs
                délais et à proposer une solution adaptée (remboursement
                partiel ou total, avoir, nouvelle livraison).
              </p>
            </Article>

            <Article number={8} title="Protection des données">
              <p>
                Les données personnelles collectées dans le cadre des
                commandes sont traitées conformément au Règlement Général
                sur la Protection des Données (RGPD) et à la loi Informatique
                et Libertés.
              </p>
              <p>
                Pour plus d&apos;informations sur le traitement de vos données,
                veuillez consulter notre{" "}
                <Link
                  href="/politique-de-confidentialite"
                  className="text-primary hover:text-primary-dark font-semibold"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </Article>

            <Article number={9} title="Loi applicable et litiges">
              <p>
                Les présentes CGV sont soumises au droit français.
              </p>
              <p>
                En cas de litige, les parties s&apos;efforceront de trouver une
                solution amiable. À défaut, le litige sera soumis aux
                tribunaux compétents du ressort du{" "}
                <strong className="text-wood">Tribunal d&apos;Avignon</strong>.
              </p>
              <p>
                Conformément aux dispositions du Code de la consommation, le
                client peut recourir à un médiateur de la consommation en cas
                de litige non résolu.
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
                  Siège social : 711 Route de Carpentras, 84320
                  Entraigues-sur-la-Sorgue
                </p>
                <p>
                  Téléphone :{" "}
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
