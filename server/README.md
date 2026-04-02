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

## Routes API

- `GET /api/health` - Vérification de santé
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/blog` - Liste des articles
- `GET /api/blog/:id` - Détails d'un article
- `GET /api/users/profile` - Profil utilisateur

