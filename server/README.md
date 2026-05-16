# BAOBAB Server

Backend API pour l'application BAOBAB.

## Installation

```bash
npm install
```

## Configuration

Copiez `.env.example` vers `.env` et configurez les variables d'environnement.

## Développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## MongoDB local

Le backend nécessite MongoDB avant de démarrer. Si MongoDB n'est pas déjà lancé sur `localhost:27017`, vous pouvez utiliser Docker:

```bash
npm run mongo:docker
npm run dev
```

Pour les démarrages suivants:

```bash
npm run mongo:start
npm run dev
```

Les warnings SMTP, Cloudinary, Stripe, Sentry et Redis indiquent seulement que ces services optionnels ne sont pas configurés en développement.

## Routes API

- `GET /api/health` - Vérification de santé
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/blog` - Liste des articles
- `GET /api/blog/:id` - Détails d'un article
- `GET /api/users/profile` - Profil utilisateur
