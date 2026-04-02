/**
 * Middleware de protection CSRF optionnel
 * 
 * NOTE: Pour une API REST utilisant JWT (comme cette application),
 * la protection CSRF n'est généralement PAS nécessaire car :
 * - Les tokens JWT sont stockés dans le localStorage (pas de cookies)
 * - Les requêtes utilisent l'en-tête Authorization (pas de cookies automatiques)
 * - Pas de risque de cross-site request forgery avec cette architecture
 * 
 * Ce middleware est fourni à titre optionnel si vous souhaitez ajouter
 * une couche de sécurité supplémentaire pour certaines routes sensibles.
 */

import { AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

/**
 * Middleware CSRF basique pour les requêtes POST/PUT/DELETE
 * Vérifie la présence d'un header X-Requested-With
 * 
 * Utilisation:
 * router.post('/sensitive-route', csrfProtection, handler)
 */
export const csrfProtection = (req, res, next) => {
  // Seulement pour les méthodes qui modifient les données
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const requestedWith = req.get('X-Requested-With')
    
    // Vérifier la présence du header (protection basique)
    if (!requestedWith) {
      logger.warn('Tentative de requête sans header X-Requested-With', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      })
      return next(new AppError('Requête non autorisée', 403))
    }
  }
  
  next()
}

/**
 * Middleware CSRF avec token personnalisé
 * Nécessite un token CSRF dans le header X-CSRF-Token
 * 
 * Pour utiliser ce middleware, vous devez :
 * 1. Générer un token CSRF côté serveur
 * 2. Le renvoyer au client (dans une réponse initiale)
 * 3. Le client doit l'inclure dans toutes les requêtes modifiantes
 */
export const csrfTokenProtection = (req, res, next) => {
  // Seulement pour les méthodes qui modifient les données
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.get('X-CSRF-Token')
    const sessionToken = req.session?.csrfToken // Si vous utilisez des sessions
    
    if (!csrfToken || csrfToken !== sessionToken) {
      logger.warn('Tentative de requête avec token CSRF invalide', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      })
      return next(new AppError('Token CSRF invalide', 403))
    }
  }
  
  next()
}

/**
 * Pour une API REST avec JWT, la protection CSRF n'est généralement pas nécessaire.
 * Cependant, si vous souhaitez l'implémenter, voici les options :
 * 
 * 1. Utiliser le middleware csrfProtection pour les routes sensibles
 * 2. Implémenter un système de tokens CSRF personnalisé
 * 3. Utiliser SameSite cookies si vous passez à une architecture avec cookies
 * 
 * Recommandation : Pour cette API REST avec JWT, la protection CSRF n'est pas nécessaire.
 */

