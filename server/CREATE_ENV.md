# Guide de création du fichier .env

Pour créer le fichier `.env` dans le dossier `server/`, exécutez la commande suivante dans votre terminal :

```bash
cd server
cat > .env << 'EOF'
# ============================================
# BAOBAB - Configuration Environnement
# ============================================

# ============================================
# ENVIRONNEMENT
# ============================================
NODE_ENV=development

# ============================================
# SERVEUR
# ============================================
PORT=3000
FRONTEND_URL=http://localhost:5173

# ============================================
# BASE DE DONNÉES
# ============================================
MONGODB_URI=mongodb://localhost:27017/baobab

# ============================================
# SÉCURITÉ - JWT
# ============================================
JWT_SECRET=NDWPdrw7/ff7TaMnpF5jM9AhwRobU8FjDo054OfuB40=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# SÉCURITÉ - 2FA
# ============================================
TOTP_ISSUER=BAOBAB
TOTP_WINDOW=2

# ============================================
# REDIS (Optionnel - commenté si non utilisé)
# ============================================
# REDIS_URL=redis://localhost:6379

# ============================================
# CLOUDINARY (Optionnel - commenté si non utilisé)
# ============================================
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# STRIPE (Optionnel - commenté si non utilisé)
# ============================================
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# EMAIL (SMTP) (Optionnel - commenté si non utilisé)
# ============================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM=noreply@baobab.com

# ============================================
# MONITORING & LOGGING
# ============================================
LOG_LEVEL=info
# SENTRY_DSN= (Optionnel - commenté si non utilisé)

# ============================================
# DÉTECTION D'ANOMALIES
# ============================================
MAX_FAILED_LOGIN_ATTEMPTS=5
ANOMALY_DETECTION_WINDOW=15
ENABLE_ANOMALY_ALERTS=true
ANOMALY_ALERT_EMAIL=admin@baobab.com

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_AUTH_MAX=5

# ============================================
# SÉCURITÉ SUPPLÉMENTAIRE
# ============================================
CORS_ORIGIN=http://localhost:5173
FORCE_HTTPS=false
EOF
```

Ou copiez simplement le contenu ci-dessus dans un nouveau fichier `.env` dans le dossier `server/`.

## Variables requises

Les variables suivantes sont **obligatoires** :
- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : Secret pour signer les tokens JWT (généré automatiquement)

## Variables optionnelles

Les variables suivantes sont **optionnelles** et peuvent être laissées commentées si vous n'utilisez pas ces services :
- `REDIS_URL` : Pour le cache Redis
- `CLOUDINARY_*` : Pour le stockage d'images dans le cloud
- `STRIPE_*` : Pour les paiements
- `SMTP_*` : Pour l'envoi d'emails
- `SENTRY_DSN` : Pour le monitoring d'erreurs

Si ces variables ne sont pas configurées, le système fonctionnera toujours mais avec des fonctionnalités limitées (stockage local au lieu de Cloudinary, pas d'emails, etc.).

