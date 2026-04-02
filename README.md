# 🌳 BAOBAB

Application web complète pour découvrir et promouvoir les valeurs, l'histoire et les produits de l'Afrique.

## 🎯 Fonctionnalités

- **Site Vitrine** - Découvrez les valeurs et qualités de l'Afrique
- **Blog** - Retracez l'histoire fascinante du continent africain
- **E-commerce** - Achetez des produits africains authentiques
- **Dashboard** - Gérez vos commandes et votre activité
- **Authentification** - Système complet de connexion/inscription
- **Panier** - Gestion du panier d'achat

## 🚀 Technologies

### Frontend
- **React 19** - Bibliothèque UI moderne
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **React Router** - Routage côté client
- **Zustand** - State management léger
- **Axios** - Client HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** (à configurer) - Base de données
- **JWT** - Authentification par tokens

## 📁 Structure du projet

```
BAOBAB/
├── server/              # Backend API
│   ├── src/
│   │   ├── routes/      # Routes API
│   │   ├── controllers/ # Contrôleurs
│   │   ├── models/      # Modèles de données
│   │   └── index.js     # Point d'entrée
│   └── package.json
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── Layout/
│   ├── pages/           # Pages de l'application
│   │   ├── Home.tsx     # Page d'accueil (vitrine)
│   │   ├── Blog.tsx     # Liste des articles
│   │   ├── Shop.tsx     # Boutique e-commerce
│   │   ├── Cart.tsx     # Panier
│   │   ├── Dashboard.tsx # Tableau de bord
│   │   ├── Login.tsx    # Connexion
│   │   └── Register.tsx # Inscription
│   ├── stores/          # Stores Zustand
│   │   ├── authStore.ts # État d'authentification
│   │   └── cartStore.ts # État du panier
│   ├── services/        # Services API
│   │   └── api.ts       # Configuration API
│   ├── hooks/           # Hooks personnalisés
│   ├── utils/           # Fonctions utilitaires
│   ├── types/           # Types TypeScript
│   └── App.tsx          # Composant principal avec routes
└── package.json
```

## 🛠️ Installation

### Frontend

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Backend

```bash
# Aller dans le dossier server
cd server

# Installer les dépendances
npm install

# Copier .env.example vers .env et configurer
cp .env.example .env

# Lancer le serveur
npm run dev
```

Le serveur API sera accessible sur `http://localhost:3000`

## 📦 Scripts disponibles

### Frontend
- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée une build de production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Vérifie le code avec ESLint

### Backend
- `npm run dev` - Lance le serveur en mode développement
- `npm start` - Lance le serveur en mode production

## 🗺️ Routes

### Frontend
- `/` - Page d'accueil (vitrine)
- `/blog` - Liste des articles de blog
- `/shop` - Boutique e-commerce
- `/cart` - Panier d'achat
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Tableau de bord (protégé)

### Backend API
- `GET /api/health` - Vérification de santé
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/blog` - Liste des articles
- `GET /api/blog/:id` - Détails d'un article
- `GET /api/users/profile` - Profil utilisateur

## 🔐 Authentification

L'authentification utilise JWT (JSON Web Tokens). Les tokens sont stockés dans le localStorage et automatiquement inclus dans les requêtes API.

## 🛒 Panier

Le panier utilise Zustand avec persistance dans le localStorage, permettant de conserver les articles même après fermeture du navigateur.

## 🎨 Personnalisation

- Modifiez les styles dans les fichiers CSS de chaque composant
- Ajoutez de nouveaux composants dans `src/components/`
- Créez de nouvelles pages dans `src/pages/`
- Configurez les routes dans `src/App.tsx`

## 📝 Prochaines étapes

1. Configurer MongoDB et connecter la base de données
2. Implémenter l'authentification complète avec JWT
3. Ajouter la gestion des images pour les produits et articles
4. Implémenter le système de paiement
5. Ajouter des tests unitaires et d'intégration
6. Configurer le déploiement (Vercel, Netlify, etc.)

## 🤝 Contribution

Ce projet est en développement actif. N'hésitez pas à contribuer !

## 📄 Licence

MIT
