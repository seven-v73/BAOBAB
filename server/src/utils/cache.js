import { createClient } from 'redis'
import logger from './logger.js'
import env from '../config/env.js'

let redisClient = null

/**
 * Initialise la connexion Redis
 */
export const initRedis = async () => {
  try {
    if (!env.REDIS_URL) {
      logger.warn('⚠️  REDIS_URL non configuré - Le cache est désactivé')
      return null
    }

    redisClient = createClient({
      url: env.REDIS_URL
    })

    redisClient.on('error', (err) => {
      logger.error('❌ Erreur Redis:', err)
    })

    redisClient.on('connect', () => {
      logger.info('✅ Redis connecté')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    logger.error('❌ Erreur de connexion Redis:', error)
    return null
  }
}

/**
 * Ferme la connexion Redis
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

/**
 * Récupère une valeur du cache
 * @param {string} key - Clé du cache
 * @returns {Promise<any|null>} - Valeur en cache ou null
 */
export const getCache = async (key) => {
  if (!redisClient) return null

  try {
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    logger.error(`Erreur lors de la récupération du cache (${key}):`, error)
    return null
  }
}

/**
 * Stocke une valeur dans le cache
 * @param {string} key - Clé du cache
 * @param {any} value - Valeur à stocker
 * @param {number} ttl - Time to live en secondes (défaut: 3600 = 1h)
 * @returns {Promise<boolean>} - Succès de l'opération
 */
export const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return false

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value))
    return true
  } catch (error) {
    logger.error(`Erreur lors du stockage en cache (${key}):`, error)
    return false
  }
}

/**
 * Supprime une clé du cache
 * @param {string} key - Clé à supprimer
 * @returns {Promise<boolean>} - Succès de l'opération
 */
export const deleteCache = async (key) => {
  if (!redisClient) return false

  try {
    await redisClient.del(key)
    return true
  } catch (error) {
    logger.error(`Erreur lors de la suppression du cache (${key}):`, error)
    return false
  }
}

/**
 * Supprime toutes les clés correspondant à un pattern
 * @param {string} pattern - Pattern à matcher (ex: 'products:*')
 * @returns {Promise<number>} - Nombre de clés supprimées
 */
export const deleteCachePattern = async (pattern) => {
  if (!redisClient) return 0

  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length === 0) return 0

    const deleted = await redisClient.del(keys)
    return deleted
  } catch (error) {
    logger.error(`Erreur lors de la suppression par pattern (${pattern}):`, error)
    return 0
  }
}

/**
 * Middleware de cache pour Express
 * @param {number} ttl - Time to live en secondes
 * @param {Function} keyGenerator - Fonction pour générer la clé de cache
 */
export const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    if (!redisClient) {
      return next()
    }

    // Générer la clé de cache
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : `cache:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`

    // Vérifier le cache
    const cached = await getCache(cacheKey)
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`)
      return res.json(cached)
    }

    // Intercepter la réponse pour mettre en cache
    const originalJson = res.json.bind(res)
    res.json = function (data) {
      if (res.statusCode === 200) {
        setCache(cacheKey, data, ttl).catch(err => {
          logger.error('Erreur lors de la mise en cache:', err)
        })
      }
      return originalJson(data)
    }

    next()
  }
}

export default {
  initRedis,
  closeRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  cacheMiddleware
}

