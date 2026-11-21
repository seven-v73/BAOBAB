import { MemoryStore } from 'express-rate-limit'
import { getRedisClient } from '../utils/cache.js'
import logger from '../utils/logger.js'

/**
 * Stockage des compteurs de limites de requêtes dans Redis : ils survivent aux redémarrages de
 * l'API et seraient partagés entre plusieurs processus. Si Redis est absent ou coupé, on bascule
 * sur la mémoire du processus : les limites continuent de s'appliquer, jamais d'erreur visible.
 * Préfixe « mb:rl: » : le Redis du serveur est partagé avec d'autres applications.
 */
export class RedisFallbackStore {
  constructor(name) {
    this.prefix = `mb:rl:${name}:`
    this.memory = new MemoryStore()
    this.warned = false
  }

  init(options) {
    this.windowMs = options.windowMs
    this.memory.init(options)
  }

  redis() {
    return getRedisClient()
  }

  fallback(error) {
    if (!this.warned) {
      logger.warn(`Limites de requêtes : Redis indisponible, compteurs en mémoire (${error?.message || 'non connecté'})`)
      this.warned = true
    }
  }

  async increment(key) {
    const client = this.redis()
    if (!client) return this.memory.increment(key)
    try {
      const redisKey = this.prefix + key
      const [hits, ttl] = await client.multi().incr(redisKey).pTTL(redisKey).exec()
      let remaining = Number(ttl)
      if (remaining < 0) {
        // Premier coup de la fenêtre (ou clé sans expiration) : on fixe la durée
        await client.pExpire(redisKey, this.windowMs)
        remaining = this.windowMs
      }
      this.warned = false
      return { totalHits: Number(hits), resetTime: new Date(Date.now() + remaining) }
    } catch (error) {
      this.fallback(error)
      return this.memory.increment(key)
    }
  }

  async decrement(key) {
    const client = this.redis()
    if (!client) return this.memory.decrement(key)
    try {
      await client.decr(this.prefix + key)
    } catch (error) {
      this.fallback(error)
      await this.memory.decrement(key)
    }
  }

  async resetKey(key) {
    await this.memory.resetKey(key)
    const client = this.redis()
    if (!client) return
    try {
      await client.del(this.prefix + key)
    } catch (error) {
      this.fallback(error)
    }
  }

  shutdown() {
    this.memory.shutdown?.()
  }
}
