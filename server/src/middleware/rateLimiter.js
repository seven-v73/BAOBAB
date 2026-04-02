import rateLimit from 'express-rate-limit'
import env from '../config/env.js'

// Rate limiting général pour toutes les routes API
// Limite plus élevée en développement
const maxRequests = env.NODE_ENV === 'production' ? 100 : 1000

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests, // Limite variable selon l'environnement
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Retourne les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  handler: (req, res) => {
    res.status(429).json({
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    })
  },
  // En développement, ignorer les erreurs de connexion
  skip: (req) => {
    // En développement, ignorer le rate limiting pour certaines routes
    if (env.NODE_ENV === 'development') {
      // Ignorer pour les routes de santé et de statut
      return req.path === '/api/health' || req.path === '/api/status'
    }
    return false
  }
})

// Rate limiting strict pour l'authentification (protection contre brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite de 5 tentatives par IP
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      retryAfter: '15 minutes'
    })
  }
})

// Rate limiting pour les uploads (fichiers volumineux)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // Limite de 20 uploads par IP par heure
  message: {
    error: 'Trop d\'uploads. Veuillez réessayer plus tard.',
    retryAfter: '1 heure'
  }
})

