import dotenv from 'dotenv'

dotenv.config()

// Variables d'environnement requises
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET']

// Vérifier les variables requises
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Variable d'environnement manquante: ${varName}`)
    process.exit(1)
  }
})

// Avertissement si JWT_SECRET utilise la valeur par défaut
if (process.env.JWT_SECRET === 'your-secret-key-change-in-production' || 
    process.env.JWT_SECRET === 'your-secret-key-here') {
  console.warn('⚠️  ATTENTION: JWT_SECRET utilise une valeur par défaut non sécurisée!')
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Ne pas utiliser la valeur par défaut en production!')
    process.exit(1)
  }
}

// Validation de la force du JWT_SECRET en production
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET doit contenir au moins 32 caractères en production!')
    process.exit(1)
  }
}

// Configuration validée
export const env = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m', // Access token : 15 minutes
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', // Refresh token : 7 jours
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@baobab.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // 2FA
  TOTP_ISSUER: process.env.TOTP_ISSUER || 'MonBaobab',
  TOTP_WINDOW: parseInt(process.env.TOTP_WINDOW) || 2,
  // Monitoring
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
  SENTRY_DSN: process.env.SENTRY_DSN,
  // Détection d'anomalies
  MAX_FAILED_LOGIN_ATTEMPTS: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 5,
  ANOMALY_DETECTION_WINDOW: parseInt(process.env.ANOMALY_DETECTION_WINDOW) || 15,
  ENABLE_ANOMALY_ALERTS: process.env.ENABLE_ANOMALY_ALERTS === 'true',
  ANOMALY_ALERT_EMAIL: process.env.ANOMALY_ALERT_EMAIL,
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000),
  RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5,
  // Sécurité
  CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173'),
  FORCE_HTTPS: process.env.FORCE_HTTPS === 'true',
}

// Validation en production
if (env.NODE_ENV === 'production') {
  const productionRequired = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL']
  const missing = productionRequired.filter(key => !env[key])
  if (missing.length > 0) {
    console.error(`❌ Variables manquantes pour la production: ${missing.join(', ')}`)
    process.exit(1)
  }

  // Avertissements pour la production
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️  Configuration email manquante - les emails ne fonctionneront pas')
  }

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
    console.warn('⚠️  Configuration Cloudinary manquante - les uploads ne fonctionneront pas')
  }

  if (!env.FORCE_HTTPS) {
    console.warn('⚠️  FORCE_HTTPS n\'est pas activé - recommandé pour la production')
  }
}

export default env

