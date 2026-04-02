import { AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

/**
 * Liste des opérateurs MongoDB dangereux à bloquer
 */
const DANGEROUS_OPERATORS = [
  '$where',
  '$regex',
  '$ne',
  '$gt',
  '$lt',
  '$gte',
  '$lte',
  '$in',
  '$nin',
  '$exists',
  '$type',
  '$mod',
  '$size',
  '$all',
  '$elemMatch',
  '$text',
  '$geoWithin',
  '$geoIntersects',
  '$near',
  '$nearSphere'
]

/**
 * Caractères spéciaux à échapper dans les requêtes
 */
const SPECIAL_CHARS = /[{}[\]]/g

/**
 * Sanitize un objet de requête pour prévenir les injections NoSQL
 * @param {Object} obj - L'objet à sanitizer
 * @param {string} path - Le chemin actuel (pour logging)
 * @returns {Object} - L'objet sanitizé
 */
const sanitizeObject = (obj, path = '') => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`))
  }

  if (typeof obj === 'string') {
    // Échapper les caractères spéciaux MongoDB
    return obj.replace(SPECIAL_CHARS, '')
  }

  if (typeof obj !== 'object') {
    return obj
  }

  const sanitized = {}
  for (const key in obj) {
    // Vérifier si la clé contient un opérateur dangereux
    if (DANGEROUS_OPERATORS.some(op => key.includes(op))) {
      logger.warn('Tentative d\'injection NoSQL détectée', {
        key,
        path,
        value: obj[key]
      })
      throw new AppError('Requête invalide détectée', 400)
    }

    // Sanitizer récursivement la valeur
    sanitized[key] = sanitizeObject(obj[key], path ? `${path}.${key}` : key)
  }

  return sanitized
}

/**
 * Middleware pour protéger contre les injections NoSQL
 * Sanitize req.body, req.query, et req.params
 */
export const nosqlInjectionProtection = (req, res, next) => {
  try {
    // Sanitizer req.body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, 'body')
    }

    // Sanitizer req.query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, 'query')
    }

    // Sanitizer req.params (sauf les IDs MongoDB valides)
    if (req.params && typeof req.params === 'object') {
      for (const key in req.params) {
        const value = req.params[key]
        // Si c'est un ID MongoDB, vérifier qu'il est valide
        if (key === 'id' || key.endsWith('Id')) {
          // Vérifier le format ObjectId (24 caractères hexadécimaux)
          if (value && !/^[0-9a-fA-F]{24}$/.test(value)) {
            logger.warn('ID MongoDB invalide détecté', {
              key,
              value,
              path: req.originalUrl
            })
            throw new AppError('ID invalide', 400)
          }
        } else {
          // Pour les autres paramètres, sanitizer comme une string
          if (typeof value === 'string') {
            req.params[key] = value.replace(SPECIAL_CHARS, '')
          }
        }
      }
    }

    next()
  } catch (error) {
    // Si c'est déjà une AppError, la passer au gestionnaire d'erreurs
    if (error instanceof AppError) {
      return next(error)
    }
    // Sinon, logger et créer une nouvelle erreur
    logger.error('Erreur lors de la sanitization NoSQL', {
      error: error.message,
      stack: error.stack,
      path: req.originalUrl
    })
    next(new AppError('Erreur de traitement de la requête', 400))
  }
}

/**
 * Valide qu'un ID est un ObjectId MongoDB valide
 * @param {string} id - L'ID à valider
 * @returns {boolean} - True si valide
 */
export const isValidMongoId = (id) => {
  if (!id || typeof id !== 'string') {
    return false
  }
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Middleware pour valider les IDs MongoDB dans les paramètres
 */
export const validateMongoIds = (req, res, next) => {
  const idParams = ['id', 'userId', 'productId', 'orderId', 'blogId', 'communityId']
  
  for (const param of idParams) {
    if (req.params[param] && !isValidMongoId(req.params[param])) {
      return next(new AppError(`ID invalide: ${param}`, 400))
    }
  }

  next()
}

