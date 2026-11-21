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

// Envois de fichiers (jusqu'à 50 Mo pour une vidéo) : 60 par heure et par IP, de quoi illustrer
// plusieurs articles, mais pas de remplir le disque du serveur.
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Trop d’envois de fichiers. Réessayez dans une heure.', retryAfter: '1 heure' }),
})

// Créations de compte, réussies ou non : 10 par heure et par IP (authLimiter ne compte que les échecs,
// les inscriptions en masse n'étaient donc limitées que par la limite générale).
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Trop de comptes créés depuis cette connexion. Réessayez dans une heure.', retryAfter: '1 heure' }),
})

// Écritures publiques ou de membres (j'aime, newsletter, contributions, commentaires, proverbes) :
// 30 par quart d'heure et par IP, pour empêcher le gonflage des compteurs et le spam.
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Trop d’actions en peu de temps. Réessayez dans quelques minutes.', retryAfter: '15 minutes' }),
})

