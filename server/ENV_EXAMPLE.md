# Configuration des Variables d'Environnement

Copiez ce contenu dans un fichier `.env` à la racine du dossier `server/`.

```env
# ============================================
# BAOBAB - Configuration Environnement
# ============================================

# ============================================
# ENVIRONNEMENT
# ============================================
NODE_ENV=development
# Options: development, production, test

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
# ⚠️ CRITIQUE: Générer un secret fort et unique en production
# Utilisez: openssl rand -base64 32
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# SÉCURITÉ - 2FA
# ============================================
TOTP_ISSUER=BAOBAB
TOTP_WINDOW=2

# ============================================
# REDIS (Optionnel)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# CLOUDINARY
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@baobab.com

# ============================================
# MONITORING & LOGGING
# ============================================
LOG_LEVEL=info
SENTRY_DSN=

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
```

