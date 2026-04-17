# Scénario de Test Complet — Au Paradizzio

## Prérequis de Configuration

### Variables d'environnement (.env)
```env
GOOGLE_CLOUD_PROJECT="adp-413110"
FIRESTORE_DATABASE_ID="paradizzio"
JWT_SECRET="<générer-avec-openssl-rand-base64-48>"
NEXTAUTH_URL="https://votre-domaine.com"

# Google OAuth (optionnel pour Google Login)
GOOGLE_CLIENT_ID="<votre-client-id>.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<votre-client-id>.apps.googleusercontent.com"

# Google Gemini (bot IA)
GEMINI_API_KEY="<votre-clé-gemini>"

# Stripe (test mode)
STRIPE_SECRET_KEY="<votre-clé-stripe-secrète>"
STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_WEBHOOK_SECRET"
```

### Lancement
```bash
npm install
npm run dev        # Développement
npm run build      # Production
npm start          # Serveur production
npm test           # Tests unitaires
```

---

## PARTIE 1 : Test de la Plateforme Web

### 1.1 Navigation et affichage
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Ouvrir la page d'accueil `/` | Page complète avec hero, catégories, produits best-sellers, horaires |
| 2 | Vérifier les accents français | Tous les accents (é, è, ê, à, ç, etc.) s'affichent correctement partout |
| 3 | Naviguer vers `/menu` | Liste de toutes les pizzas avec filtres par catégorie |
| 4 | Cliquer sur une pizza | Page détail avec tailles, prix, suppléments |
| 5 | Naviguer vers `/a-propos`, `/contact`, `/faq` | Pages informatives sans erreur d'affichage |
| 6 | Tester le responsive (mobile/tablette) | Layout adaptatif, menu hamburger fonctionnel |

### 1.2 Inscription et connexion
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Aller sur `/inscription` | Formulaire d'inscription complet |
| 2 | Créer un compte avec : nom, email, téléphone, mot de passe | Inscription réussie, redirection vers `/compte` |
| 3 | Se déconnecter | Retour à l'accueil |
| 4 | Aller sur `/connexion` | Formulaire de connexion |
| 5 | Se connecter avec email + mot de passe | Connexion réussie, redirection vers `/compte` |
| 6 | Tester le bouton Google (si GOOGLE_CLIENT_ID configuré) | Popup Google, connexion OAuth, création de compte auto |
| 7 | Tester avec identifiants incorrects | Message d'erreur "Email ou mot de passe incorrect" |
| 8 | Tester inscription avec email existant | Erreur 409 "Un compte existe déjà" |

**Compte admin pour test :**
- Créer un utilisateur avec role "ADMIN" dans Firestore
- Ou utiliser le seed script : `npx tsx scripts/seed-firestore.ts`

### 1.3 Commande complète (parcours client)
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Ajouter une Margherita 33cm au panier | Sidebar panier s'ouvre, article visible |
| 2 | Ajouter une 4 Fromages 29cm | 2 articles dans le panier |
| 3 | Aller sur `/commander` | Page checkout en 5 étapes |
| 4 | Étape 1 : Choisir "Livraison" | Sélection du mode |
| 5 | Étape 2 : Remplir adresse (84320 Entraigues) | Validation du code postal dans la zone |
| 6 | Étape 3 : S'identifier (connexion/invité/inscription) | Identification réussie |
| 7 | Étape 4 : Choisir "Carte bancaire" | Formulaire de paiement |
| 8 | Confirmer la commande | Redirection vers Stripe Checkout |
| 9 | Sur Stripe : utiliser carte test `4242 4242 4242 4242` | Paiement réussi |
| 10 | Page de confirmation / suivi | Numéro de commande affiché |

**Cartes de test Stripe :**
- Succès : `4242 4242 4242 4242`
- Refusée : `4000 0000 0000 0002`
- Authentification 3D Secure : `4000 0025 0000 3155`
- Date : toute date future (ex: 12/28)
- CVC : 3 chiffres quelconques (ex: 123)

### 1.4 Paiement en espèces
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Parcours commande jusqu'à l'étape 4 | Page paiement |
| 2 | Choisir "Paiement sur place" ou "Espèces" | Pas de Stripe |
| 3 | Confirmer | Commande créée directement, page confirmation |

### 1.5 Suivi de commande
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Aller sur `/suivi/PAR-XXXXXXXX-XXXX` | Page de suivi avec statut en temps réel |
| 2 | Vérifier les étapes de statut | Timeline : En attente → Acceptée → En préparation → Prête → En livraison → Livrée |

### 1.6 Code promo
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Ajouter le code `BIENVENUE` | -10% sur le sous-total |
| 2 | Ajouter le code `PIZZA10` | -10€ sur la commande |
| 3 | Ajouter le code `LIVRAISON` | Livraison gratuite |
| 4 | Code invalide `FAUX` | Message d'erreur "Code invalide" |

### 1.7 Espace client `/compte`
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Page profil | Nom, email, téléphone affichés |
| 2 | Historique des commandes `/compte/commandes` | Liste des commandes passées |
| 3 | Points de fidélité `/compte/fidelite` | Solde de points (1€ = 1 point) |
| 4 | Favoris `/compte/favoris` | Liste des produits favoris |

---

## PARTIE 2 : Test du Bot IA

### 2.1 Widget flottant (toutes les pages)
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Vérifier le bouton rouge en bas à droite | Bulle de chat visible avec badge "IA" |
| 2 | Cliquer sur le bouton | Fenêtre de chat s'ouvre |
| 3 | Message de bienvenue | "Bonjour et bienvenue chez Au Paradizzio !" |
| 4 | Cliquer "X" | Fenêtre se ferme |
| 5 | Cliquer l'icône plein écran | Redirection vers `/bot` |

### 2.2 Conversation avec le bot (page `/bot`)
| # | Message à envoyer | Résultat attendu |
|---|-------------------|------------------|
| 1 | "Bonjour" | Réponse chaleureuse, proposition d'aide |
| 2 | "Montrez-moi le menu" | Liste des pizzas avec prix |
| 3 | "Quelles sont vos meilleures pizzas ?" | Recommandation des best-sellers |
| 4 | "Je voudrais une Margherita en 33cm" | Confirmation de l'ajout, proposition de compléments |
| 5 | "Ajoutez aussi une 4 Fromages en 29cm" | Ajout confirmé |
| 6 | "Et un tiramisu" | Ajout du dessert |
| 7 | "C'est tout, je confirme" | Bot demande nom et téléphone |
| 8 | "Jean Dupont, 06 12 34 56 78" | Bot demande le mode (livraison/emporter) |
| 9 | "En livraison à 5 rue de la Paix, 84320 Entraigues" | Bot récapitule la commande |
| 10 | "Oui je confirme" | Récapitulatif avec boutons "Payer par carte" / "Espèces" |

### 2.3 Commande via le bot
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Cliquer "Payer par carte" | Bouton "Payer maintenant" apparaît (lien Stripe) |
| 2 | Cliquer le lien Stripe | Page Stripe Checkout, payer avec carte test |
| 3 | Après paiement | Redirection vers page de suivi |
| 4 | Alternative : Cliquer "Espèces" | Commande confirmée, lien de suivi affiché |

### 2.4 Scénarios spéciaux du bot
| # | Message | Résultat attendu |
|---|---------|------------------|
| 1 | "Quels sont vos horaires ?" | Horaires affichés |
| 2 | "Vous livrez à Avignon ?" | Info sur les zones de livraison |
| 3 | "Avez-vous des pizzas végétariennes ?" | Recommandation de la Végétarienne |
| 4 | "Quels sont les allergènes ?" | Info sur les allergènes |

---

## PARTIE 3 : Test du Dashboard Admin

### 3.1 Accès admin
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Se connecter avec un compte ADMIN | Redirection vers `/admin` |
| 2 | Dashboard `/admin` | KPIs, graphiques, commandes récentes |

### 3.2 Gestion des commandes `/admin/commandes`
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Page commandes | Liste de toutes les commandes (y compris celles du bot) |
| 2 | Filtrer par statut "En attente" | Uniquement les commandes PENDING |
| 3 | Filtrer par mode "Livraison" | Uniquement les commandes DELIVERY |
| 4 | Rechercher par numéro de commande | Résultat filtré |
| 5 | Accepter une commande en attente | Statut → "Acceptée" |
| 6 | Passer en préparation | Statut → "En préparation" |
| 7 | Marquer comme prête | Statut → "Prête" |
| 8 | Marquer en livraison (si livraison) | Statut → "En livraison" |
| 9 | Marquer comme livrée | Statut → "Livrée" |
| 10 | Annuler une commande | Statut → "Annulée" |
| 11 | Vérifier l'auto-refresh (15s) | Nouvelles commandes apparaissent automatiquement |
| 12 | Déplier une commande | Détails : articles, infos client, historique |
| 13 | Copier une adresse de livraison | Adresse copiée dans le presse-papier |

### 3.3 Statistiques
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Dashboard `/admin` | CA du jour, nombre de commandes, panier moyen |
| 2 | Graphique hebdomadaire | Barres des 7 derniers jours |
| 3 | Top produits | Liste des 5 produits les plus vendus |

### 3.4 Gestion des clients `/admin/clients`
| # | Action | Résultat attendu |
|---|--------|------------------|
| 1 | Liste des clients | Tous les clients avec segments (VIP, régulier, nouveau) |
| 2 | Statistiques par client | Nombre de commandes, total dépensé, panier moyen |

---

## PARTIE 4 : Test Stripe Webhook (production)

### Configuration du webhook
```bash
# En développement avec Stripe CLI
stripe listen --forward-to localhost:3000/api/webhook/stripe

# En production
# Configurer le webhook dans Stripe Dashboard :
# URL: https://votre-domaine.com/api/webhook/stripe
# Événements: checkout.session.completed, checkout.session.expired
```

| # | Test | Résultat attendu |
|---|------|------------------|
| 1 | Paiement réussi | Webhook reçu, commande → paymentStatus: "PAID" |
| 2 | Session expirée | Webhook reçu, commande → status: "CANCELLED" |
| 3 | Points de fidélité | Points ajoutés au compte utilisateur |

---

## PARTIE 5 : Tests Automatisés

```bash
# Lancer tous les tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Vérification TypeScript
npx tsc --noEmit
```

### Tests couverts :
- **auth.test.ts** : hashPassword, verifyPassword, createToken, verifyToken, isAdmin
- **utils.test.ts** : formatPrice, generateOrderNumber, slugify, cn
- **cart-store.test.ts** : add/remove/update items, calculs totaux, clearCart
- **api.test.ts** : validation commandes, calcul totaux, promos, email, téléphone

---

## Checklist de Mise en Production

- [ ] Mettre une vraie clé JWT_SECRET (longue et aléatoire)
- [ ] Configurer les clés Stripe en mode live (`sk_live_...`, `pk_live_...`)
- [ ] Configurer le webhook Stripe en production
- [ ] Créer un Google Cloud OAuth Client ID pour le login Google
- [ ] Configurer NEXTAUTH_URL avec le vrai domaine
- [ ] Vérifier les credentials Google Cloud / Firestore
- [ ] Tester le paiement Stripe en mode test avant de passer en live
- [ ] Configurer un domaine personnalisé
- [ ] Activer HTTPS
- [ ] Créer un compte admin dans Firestore
- [ ] Tester le bot avec la clé Gemini
- [ ] Configurer les variables d'environnement sur l'hébergeur

---

## Résumé des URLs

| Page | URL |
|------|-----|
| Accueil | `/` |
| Menu | `/menu` |
| Connexion | `/connexion` |
| Inscription | `/inscription` |
| Mon compte | `/compte` |
| Commander | `/commander` |
| Bot IA (plein écran) | `/bot` |
| Suivi commande | `/suivi/{orderNumber}` |
| Admin Dashboard | `/admin` |
| Admin Commandes | `/admin/commandes` |
| Admin Clients | `/admin/clients` |
| Admin Produits | `/admin/produits` |
