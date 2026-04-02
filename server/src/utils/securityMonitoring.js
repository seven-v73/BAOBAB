import logger from './logger.js'
import { logSecurityEvent } from './securityLogger.js'
import { anomalyDetector } from './anomalyDetection.js'
import env from '../config/env.js'

/**
 * Système de monitoring de sécurité
 */
class SecurityMonitoring {
  constructor() {
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      last24Hours: [],
      alerts: []
    }
    this.startTime = Date.now()
  }

  /**
   * Enregistre un événement de sécurité
   * @param {string} eventType - Type d'événement
   * @param {Object} data - Données de l'événement
   * @param {string} severity - Sévérité (low, medium, high, critical)
   */
  recordEvent(eventType, data = {}, severity = 'low') {
    const event = {
      type: eventType,
      severity,
      data,
      timestamp: new Date().toISOString()
    }

    // Mettre à jour les métriques
    this.metrics.totalEvents++
    this.metrics.eventsByType[eventType] = (this.metrics.eventsByType[eventType] || 0) + 1
    this.metrics.eventsBySeverity[severity] = (this.metrics.eventsBySeverity[severity] || 0) + 1

    // Ajouter aux événements des 24 dernières heures
    this.metrics.last24Hours.push(event)
    
    // Nettoyer les événements de plus de 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.metrics.last24Hours = this.metrics.last24Hours.filter(e => {
      return new Date(e.timestamp).getTime() > oneDayAgo
    })

    // Logger l'événement
    logSecurityEvent(eventType, { ...data, severity })

    // Si sévérité élevée, ajouter aux alertes
    if (severity === 'high' || severity === 'critical') {
      this.metrics.alerts.push(event)
      // Garder seulement les 100 dernières alertes
      if (this.metrics.alerts.length > 100) {
        this.metrics.alerts.shift()
      }
    }

    logger.info(`[SECURITY MONITORING] ${eventType}`, { severity, ...data })
  }

  /**
   * Obtient les statistiques de sécurité
   * @param {Object} options - Options de filtrage
   * @returns {Object} - Statistiques
   */
  getStats(options = {}) {
    const { hours = 24 } = options
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000)
    
    const recentEvents = this.metrics.last24Hours.filter(e => {
      return new Date(e.timestamp).getTime() > cutoffTime
    })

    const stats = {
      uptime: Math.floor((Date.now() - this.startTime) / 1000), // en secondes
      totalEvents: this.metrics.totalEvents,
      eventsByType: { ...this.metrics.eventsByType },
      eventsBySeverity: { ...this.metrics.eventsBySeverity },
      recentEvents: recentEvents.length,
      recentEventsByType: {},
      recentEventsBySeverity: {},
      alerts: this.metrics.alerts.length,
      recentAlerts: this.metrics.alerts.filter(a => {
        return new Date(a.timestamp).getTime() > cutoffTime
      }),
      anomalyStats: anomalyDetector.getStats()
    }

    // Calculer les statistiques pour les événements récents
    recentEvents.forEach(event => {
      stats.recentEventsByType[event.type] = (stats.recentEventsByType[event.type] || 0) + 1
      stats.recentEventsBySeverity[event.severity] = (stats.recentEventsBySeverity[event.severity] || 0) + 1
    })

    return stats
  }

  /**
   * Obtient les événements récents
   * @param {number} limit - Nombre d'événements à retourner
   * @param {string} severity - Filtrer par sévérité
   * @returns {Array} - Événements
   */
  getRecentEvents(limit = 50, severity = null) {
    let events = [...this.metrics.last24Hours]
    
    if (severity) {
      events = events.filter(e => e.severity === severity)
    }

    // Trier par timestamp (plus récent en premier)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return events.slice(0, limit)
  }

  /**
   * Obtient les alertes récentes
   * @param {number} limit - Nombre d'alertes à retourner
   * @returns {Array} - Alertes
   */
  getRecentAlerts(limit = 20) {
    return this.metrics.alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
  }

  /**
   * Réinitialise les métriques (pour les tests)
   */
  reset() {
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      last24Hours: [],
      alerts: []
    }
    this.startTime = Date.now()
  }
}

// Instance singleton
export const securityMonitoring = new SecurityMonitoring()

// Enregistrer les événements système
process.on('uncaughtException', (error) => {
  securityMonitoring.recordEvent('UNCAUGHT_EXCEPTION', {
    error: error.message,
    stack: error.stack
  }, 'critical')
})

process.on('unhandledRejection', (reason, promise) => {
  securityMonitoring.recordEvent('UNHANDLED_REJECTION', {
    reason: reason?.message || String(reason),
    promise: String(promise)
  }, 'high')
})

