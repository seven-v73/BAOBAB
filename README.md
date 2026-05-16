# BAOBAB / MonBaobab

BAOBAB est une plateforme web fullstack dédiée à la découverte, la valorisation et la transmission des cultures africaines. Le projet réunit un site vitrine, une bibliothèque de contenus culturels, des communautés, une boutique e-commerce, un espace utilisateur, un back-office d'administration et une API sécurisée.

Le dépôt contient deux applications principales :

- `src/` : frontend React + TypeScript construit avec Vite.
- `server/` : backend Node.js + Express connecté à MongoDB.

## Fonctionnalités principales

- Page d'accueil dynamique avec statistiques, contenus mis en avant et paramètres de plateforme.
- Exploration culturelle : pays africains, carte interactive, chronologie historique, figures historiques, collections, récits, proverbes et quiz.
- Blog avec articles, commentaires et interface d'administration.
- Boutique e-commerce : produits, catégories, produits similaires/tendances, panier persistant, checkout, commandes, coupons, avis et paiement Stripe.
- Authentification complète : inscription, connexion, JWT, refresh token, changement de mot de passe et routes protégées.
- Authentification à deux facteurs : TOTP, codes de secours, activation, désactivation et vérification à la connexion.
- Communautés : création, demandes de création, membres, rôles, invitations, posts, commentaires, likes, médias et modération.
- Dashboard utilisateur : profil, activité, commandes et suivi.
- Back-office admin : utilisateurs, produits, blog, statistiques, pays, collections, figures, timeline, quiz, paramètres et demandes de communautés.
- Recherche globale, suggestions, recommandations, favoris, progression utilisateur, notifications et newsletter.
- Uploads sécurisés : images, PDF, vidéos et documents, avec support Cloudinary pour les images.
- Sécurité backend : Helmet, CORS, rate limiting, validation, protection NoSQL injection, journalisation, monitoring et détection d'anomalies.
- Documentation API Swagger disponible via le backend.

## Stack technique

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand avec persistance localStorage
- Axios avec intercepteurs JWT/refresh token
- Stripe React SDK
- Leaflet / React Leaflet, D3 Geo et TopoJSON pour les cartes
- Lucide React pour les icônes
- CSS modulaire par page/composant et systèmes de styles globaux

### Backend

- Node.js avec modules ES
- Express
- MongoDB + Mongoose
- JWT + refresh tokens
- bcryptjs
- express-validator
- Helmet, CORS, express-rate-limit
- Multer, Sharp et Cloudinary
- Stripe
- Nodemailer
- Redis optionnel pour le cache
- Winston pour les logs
- Sentry optionnel
- Jest, Supertest et mongodb-memory-server pour les tests
- Swagger UI pour la documentation API

## Structure du projet

```txt
BAOBAB/
├── public/                 # Assets publics, robots.txt, sitemap
├── src/                    # Frontend React/Vite
│   ├── api/                # Ancienne couche API/mock
│   ├── assets/             # Assets frontend
│   ├── components/         # Composants UI et métier
│   ├── context/            # Contextes React
│   ├── data/               # Données statiques liées à l'Afrique et aux cartes
│   ├── hooks/              # Hooks personnalisés
│   ├── layouts/            # Header/Footer alternatifs
│   ├── pages/              # Pages publiques, protégées et admin
│   ├── services/           # Client API Axios et services métier
│   ├── store/              # Stores historiques
│   ├── stores/             # Stores Zustand principaux
│   ├── styles/             # Systèmes CSS globaux
│   ├── types/              # Types TypeScript
│   ├── utils/              # Utilitaires frontend
│   ├── App.tsx             # Déclaration des routes frontend
│   └── main.tsx            # Point d'entrée React
├── server/                 # Backend Express
│   ├── scripts/            # Scripts utilitaires de test
│   ├── src/
│   │   ├── config/         # Configuration env, MongoDB, Swagger
│   │   ├── controllers/    # Logique métier API
│   │   ├── middleware/     # Auth, sécurité, validation, upload
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes Express
│   │   ├── scripts/        # Seed/migration de données
│   │   ├── utils/          # Services techniques
│   │   └── index.js        # Point d'entrée serveur
│   ├── tests/              # Tests Jest/Supertest
│   ├── ENV_EXAMPLE.md      # Exemple complet de configuration backend
│   └── package.json
├── SECURITE_AVANCEE.md     # Guide sécurité, monitoring, 2FA et anomalies
├── package.json            # Scripts frontend
└── README.md               # Documentation projet
```

## Prérequis

- Node.js récent compatible avec Vite 7 et React 19.
- npm.
- MongoDB local ou distant.
- Docker optionnel pour lancer MongoDB rapidement.
- Comptes/services optionnels selon les fonctionnalités utilisées : Stripe, Cloudinary, SMTP, Redis, Sentry.

## Installation

Installez les dépendances frontend :

```bash
npm install
```

Installez les dépendances backend :

```bash
cd server
npm install
```

## Configuration

### Frontend

Le frontend utilise `VITE_API_URL` pour joindre l'API. Sans configuration, il appelle :

```txt
http://localhost:3000/api
```

Exemple de fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
```

### Backend

Le backend lit sa configuration depuis `server/.env`. Les variables minimales obligatoires sont :

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/baobab
JWT_SECRET=changez-moi-avec-un-secret-long-et-unique
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Un exemple complet est disponible dans `server/ENV_EXAMPLE.md`. En production, utilisez un `JWT_SECRET` fort, configurez `FRONTEND_URL`, `CORS_ORIGIN`, MongoDB, Stripe, Cloudinary, SMTP et activez HTTPS si nécessaire.

## Lancement en développement

Lancer MongoDB avec Docker si vous n'avez pas déjà une instance locale :

```bash
cd server
npm run mongo:docker
```

Pour les prochains démarrages du même conteneur :

```bash
cd server
npm run mongo:start
```

Lancer l'API :

```bash
cd server
npm run dev
```

Lancer le frontend dans un autre terminal :

```bash
npm run dev
```

URLs locales :

- Frontend : `http://localhost:5173`
- API : `http://localhost:3000`
- Santé API : `http://localhost:3000/api/health`
- Documentation Swagger : `http://localhost:3000/api-docs`

## Scripts disponibles

### Frontend

```bash
npm run dev       # Serveur de développement Vite
npm run build     # Vérification TypeScript + build production
npm run preview   # Prévisualisation de la build
npm run lint      # Analyse ESLint
```

### Backend

```bash
npm run dev              # API en mode watch
npm start                # API en mode production
npm run lint             # Vérification syntaxique des fichiers JS
npm test                 # Tests Jest avec couverture
npm run test:watch       # Tests en mode watch
npm run mongo:docker     # Création/lancement d'un MongoDB Docker local
npm run mongo:start      # Relance du conteneur MongoDB local
npm run seed:demo        # Données de démonstration commerce/blog
npm run test:email       # Test de configuration email
npm run test:2fa         # Test TOTP/2FA
npm run check:security   # Vérifications de sécurité
```

Scripts de données disponibles dans `server/src/scripts/` :

- `seedAll.js`
- `seedCollections.js`
- `seedDemoCommerceBlog.js`
- `seedFigures.js`
- `seedProverbs.js`
- `seedQuizzes.js`
- `seedRichKnowledge.js`
- `seedStories.js`
- `seedTimeline.js`
- `migrateCountries.js`

Ils peuvent être lancés depuis `server/` avec `node src/scripts/<script>.js`, après configuration de `server/.env`.

## Routes frontend importantes

- `/` : accueil.
- `/country/:id` : détail d'un pays.
- `/map` : carte interactive.
- `/timeline` et `/timeline/:id` : chronologie et détail.
- `/figures` et `/figures/:id` : figures historiques.
- `/collections` et `/collections/:id` : collections.
- `/stories` et `/stories/:id` : récits.
- `/quizzes` et `/quizzes/:id` : quiz.
- `/proverbs` : proverbes.
- `/blog` et `/blog/:id` : blog.
- `/shop` : boutique.
- `/cart` : panier.
- `/checkout` : paiement, protégé.
- `/login` et `/register` : authentification.
- `/dashboard` : espace utilisateur, protégé.
- `/orders/:id` : détail d'une commande, protégé.
- `/communities`, `/communities/create`, `/communities/:id` et `/community` : espaces communautaires, protégés.
- `/blog/admin` : administration blog, protégée.
- `/admin` : back-office admin, réservé aux administrateurs.
- `/search` : recherche globale.

## Domaines API

Le backend expose les groupes de routes suivants sous `/api` :

- `/auth` : inscription, connexion, session, refresh token, logout, mot de passe et 2FA.
- `/users` : profil, utilisateurs et gestion admin.
- `/products` : catalogue, catégories, tendances, similaires, création et administration.
- `/orders` : commandes utilisateur et administration des statuts.
- `/payments` : Stripe Payment Intent, refund et webhook.
- `/coupons` : validation et gestion des coupons.
- `/reviews` : avis produits.
- `/blog` et `/comments` : articles et commentaires.
- `/countries` : pays et données géographiques/culturelles.
- `/timeline`, `/figures`, `/collections`, `/stories`, `/quizzes`, `/proverbs`, `/sources` : contenus culturels et éducatifs.
- `/communities` et `/community` : communautés, membres, invitations, publications et commentaires.
- `/upload` : images, PDF, vidéos et documents.
- `/newsletter` : abonnements et administration newsletter.
- `/bookmarks` : favoris utilisateur.
- `/progress` : progression, activités et leaderboard.
- `/search` : recherche globale et suggestions.
- `/recommendations` : recommandations personnalisées.
- `/analytics` : statistiques générales et utilisateur.
- `/notifications` : notifications utilisateur.
- `/settings` : configuration de la plateforme.
- `/monitoring` : événements, alertes et statistiques de sécurité.
- `/stats/home`, `/content/featured`, `/content/trending`, `/content/recent` : données de la page d'accueil.

La route racine du backend (`GET /`) retourne aussi un résumé de l'API et la liste des principaux endpoints.

## Données et modèles

Les données principales sont stockées dans MongoDB via Mongoose. Les modèles couvrent notamment :

- Utilisateurs, refresh tokens et 2FA.
- Produits, commandes, coupons, avis.
- Blog, commentaires et newsletter.
- Pays, sources, événements de timeline, figures historiques, collections, récits, quiz et proverbes.
- Communautés, demandes, membres, invitations, posts et commentaires communautaires.
- Favoris, progression, notifications et paramètres de plateforme.

## Authentification et autorisation

Le frontend conserve l'état d'authentification dans un store Zustand persistant (`auth-storage`). Les requêtes Axios ajoutent automatiquement le token JWT dans l'en-tête `Authorization`.

En cas de réponse `401`, le client tente un refresh automatique avec le refresh token. Si le refresh échoue, la session locale est supprimée et l'utilisateur est redirigé vers `/login` avec un paramètre `redirect`.

Le backend protège les routes sensibles avec les middlewares `authenticate` et `authorize('admin')`. Les routes admin côté frontend utilisent aussi `AdminRoute`.

## Panier et paiement

Le panier frontend est géré par Zustand et persisté dans `localStorage` sous `cart-storage`. Le checkout est protégé et s'appuie sur Stripe :

- côté frontend : `VITE_STRIPE_PUBLISHABLE_KEY`;
- côté backend : `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.

Sans configuration Stripe, les écrans peuvent se charger mais le paiement réel ne sera pas opérationnel.

## Uploads et médias

Les routes d'upload demandent une session authentifiée. Les images passent par le pipeline Cloudinary lorsque la configuration est fournie. Les PDF, vidéos et documents sont servis depuis `server/uploads` via `/api/upload/uploads/<fichier>`.

Variables utiles :

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `API_BASE_URL` ou `BACKEND_URL` si les URLs publiques d'upload doivent être forcées

## Sécurité

Le backend inclut plusieurs protections :

- validation stricte des entrées avec `express-validator`;
- nettoyage des entrées;
- protection contre les injections NoSQL;
- validation des IDs MongoDB;
- rate limiting global et spécifique à l'authentification;
- Helmet et configuration CORS;
- tokens d'accès courts et refresh tokens;
- contrôle de rôle admin;
- 2FA TOTP;
- validation de force du `JWT_SECRET` en production;
- logs Winston;
- monitoring sécurité et détection d'anomalies;
- Sentry optionnel.

Le guide détaillé est dans `SECURITE_AVANCEE.md`.

## Tests et qualité

Frontend :

```bash
npm run lint
npm run build
```

Backend :

```bash
cd server
npm run lint
npm test
```

La couverture backend est générée dans `server/coverage/`.

## Build production

Build frontend :

```bash
npm run build
```

Le résultat est généré dans `dist/`.

Démarrage backend production :

```bash
cd server
NODE_ENV=production npm start
```

En production, vérifiez au minimum :

- `MONGODB_URI`
- `JWT_SECRET` fort
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `FORCE_HTTPS=true` derrière une configuration HTTPS adaptée
- Stripe si le paiement est activé
- SMTP si les emails/alertes sont activés
- Cloudinary si les uploads image sont activés
- Redis et Sentry si vous souhaitez cache et monitoring externe

## Notes de développement

- Le projet contient quelques dossiers ou fichiers historiques (`src/store`, `src/api`, certaines pages dupliquées dans des sous-dossiers). Les routes actives sont déclarées dans `src/App.tsx`.
- Les services frontend centralisés sont dans `src/services/api.ts`.
- Les routes backend actives sont montées dans `server/src/index.js`.
- Ne versionnez pas `server/.env`, les clés Stripe, les secrets JWT, les identifiants SMTP ou Cloudinary.

## Licence

MIT.
