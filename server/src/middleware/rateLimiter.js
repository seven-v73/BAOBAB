import rateLimit from 'express-rate-limit'
import env from '../config/env.js'

// Rate limiting général pour toutes les routes API
// Limite plus élevée en développement
// 400 requêtes / 15 min par IP : une page des espaces membres déclenche 5 à 15 appels, et de nombreux
// utilisateurs partagent la même IP sur les réseaux mobiles (CGNAT). Les tentatives de connexion
// gardent leur propre limite stricte (authLimiter).
const maxRequests = env.NODE_ENV === 'production' ? 400 : 1000

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
// Ne s'applique qu'aux tentatives d'identification (connexion, inscription, code 2FA) ;
// les requêtes réussies ne sont pas comptées. 10 échecs : marge pour les IP partagées (réseaux mobiles).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 échecs par IP
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

// Renouvellement de session : appelé automatiquement par l'application, plafond large
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Trop de renouvellements de session. Réessayez dans quelques minutes.' }),
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

