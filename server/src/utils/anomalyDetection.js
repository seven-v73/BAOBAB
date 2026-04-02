import User from '../models/User.js'
import RefreshToken from '../models/RefreshToken.js'
import logger from './logger.js'
import { sendEmail } from './emailService.js'
import env from '../config/env.js'
import { logSecurityEvent } from './securityLogger.js'

/**
 * Détecte les anomalies de sécurité
 */
class AnomalyDetector {
  constructor() {
    this.failedLoginAttempts = new Map() // email -> { count, lastAttempt, ip }
    this.suspiciousIPs = new Map() // ip -> { count, lastSeen }
    this.alertCooldown = new Map() // email -> lastAlertTime
  }

  /**
   * Enregistre une tentative de connexion échouée
   * @param {string} email - Email de l'utilisateur
   * @param {string} ip - Adresse IP
   */
  async recordFailedLogin(email, ip) {
    const key = email.toLowerCase()
    const now = Date.now()
    
    if (!this.failedLoginAttempts.has(key)) {
      this.failedLoginAttempts.set(key, {
        count: 0,
        lastAttempt: now,
        ip,
        attempts: []
      })
    }

    const record = this.failedLoginAttempts.get(key)
    record.count++
    record.lastAttempt = now
    record.attempts.push({ ip, timestamp: now })
    
    // Garder seulement les 20 dernières tentatives
    if (record.attempts.length > 20) {
      record.attempts.shift()
    }

    // Vérifier si le seuil est dépassé
    if (record.count >= env.MAX_FAILED_LOGIN_ATTEMPTS) {
      await this.detectAnomaly('multiple_failed_logins', {
        email,
        count: record.count,
        ip,
        window: env.ANOMALY_DETECTION_WINDOW
      })
    }

    // Nettoyer les anciennes entrées (plus de 1 heure)
    this.cleanupOldRecords()
  }

  /**
   * Détecte une session suspecte
   * @param {string} userId - ID de l'utilisateur
   * @param {string} ip - Nouvelle adresse IP
   * @param {string} userAgent - User agent
   */
  async detectSuspiciousSession(userId, ip, userAgent) {
    try {
      // Récupérer les sessions récentes de l'utilisateur
      const recentSessions = await RefreshToken.find({
        user: userId,
        revokedAt: null,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h
      }).sort({ createdAt: -1 }).limit(5)

      if (recentSessions.length > 0) {
        const lastSession = recentSessions[0]
        const lastIP = lastSession.ipAddress
        const lastUserAgent = lastSession.userAgent

        // Détecter changement d'IP suspect
        if (lastIP && lastIP !== ip) {
          // Vérifier si l'IP précédente était dans la même région (simplifié)
          const isIPChange = true // En production, utiliser un service de géolocalisation

          if (isIPChange) {
            await this.detectAnomaly('suspicious_ip_change', {
              userId,
              previousIP: lastIP,
              newIP: ip,
              previousUserAgent: lastUserAgent,
              newUserAgent: userAgent
            })
          }
        }

        // Détecter changement de device suspect
        if (lastUserAgent && lastUserAgent !== userAgent) {
          await this.detectAnomaly('suspicious_device_change', {
            userId,
            previousUserAgent: lastUserAgent,
            newUserAgent: userAgent,
            ip
          })
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la détection de session suspecte', { error: error.message })
    }
  }

  /**
   * Détecte une activité suspecte sur un compte
   * @param {string} type - Type d'anomalie
   * @param {Object} data - Données de l'anomalie
   */
  async detectAnomaly(type, data) {
    const anomalyTypes = {
      multiple_failed_logins: {
        severity: 'high',
        message: `Multiple tentatives de connexion échouées pour ${data.email}`,
        threshold: env.MAX_FAILED_LOGIN_ATTEMPTS
      },
      suspicious_ip_change: {
        severity: 'medium',
        message: `Changement d'IP suspect détecté pour l'utilisateur ${data.userId}`,
        threshold: null
      },
      suspicious_device_change: {
        severity: 'medium',
        message: `Changement de device suspect détecté pour l'utilisateur ${data.userId}`,
        threshold: null
      },
      rate_limit_exceeded: {
        severity: 'low',
        message: `Rate limit dépassé pour l'IP ${data.ip}`,
        threshold: null
      },
      injection_attempt: {
        severity: 'high',
        message: `Tentative d'injection détectée depuis ${data.ip}`,
        threshold: null
      }
    }

    const anomaly = anomalyTypes[type]
    if (!anomaly) {
      logger.warn('Type d\'anomalie inconnu', { type, data })
      return
    }

    // Logger l'anomalie
    logSecurityEvent('ANOMALY_DETECTED', {
      type,
      severity: anomaly.severity,
      ...data,
      timestamp: new Date().toISOString()
    })

    // Envoyer une alerte si activé
    if (env.ENABLE_ANOMALY_ALERTS && env.ANOMALY_ALERT_EMAIL) {
      await this.sendAlert(type, anomaly, data)
    }

    // Actions automatiques selon la sévérité
    if (anomaly.severity === 'high') {
      await this.handleHighSeverityAnomaly(type, data)
    }
  }

  /**
   * Envoie une alerte par email
   * @param {string} type - Type d'anomalie
   * @param {Object} anomaly - Configuration de l'anomalie
   * @param {Object} data - Données
   */
  async sendAlert(type, anomaly, data) {
    try {
      const alertKey = `${type}_${data.email || data.userId || data.ip}`
      const now = Date.now()
      const lastAlert = this.alertCooldown.get(alertKey) || 0
      
      // Cooldown de 15 minutes entre les alertes pour le même type
      if (now - lastAlert < 15 * 60 * 1000) {
        return
      }

      this.alertCooldown.set(alertKey, now)

      const subject = `[BAOBAB] Alerte de Sécurité - ${anomaly.severity.toUpperCase()}`
      const html = `
        <h2>Alerte de Sécurité</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Sévérité:</strong> ${anomaly.severity}</p>
        <p><strong>Message:</strong> ${anomaly.message}</p>
        <h3>Détails:</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p><small>Timestamp: ${new Date().toISOString()}</small></p>
      `

      await sendEmail(
        env.ANOMALY_ALERT_EMAIL,
        subject,
        html
      )

      logger.info('Alerte de sécurité envoyée', { type, severity: anomaly.severity })
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'alerte', { error: error.message, type })
    }
  }

  /**
   * Gère les anomalies de haute sévérité
   * @param {string} type - Type d'anomalie
   * @param {Object} data - Données
   */
  async handleHighSeverityAnomaly(type, data) {
    if (type === 'multiple_failed_logins' && data.email) {
      // Optionnel: Désactiver temporairement le compte après X tentatives
      // const user = await User.findOne({ email: data.email })
      // if (user && data.count >= 10) {
      //   user.isActive = false
      //   await user.save()
      //   logger.warn('Compte désactivé temporairement', { email: data.email })
      // }
    }
  }

  /**
   * Nettoie les anciennes entrées
   */
  cleanupOldRecords() {
    const now = Date.now()
    const windowMs = env.ANOMALY_DETECTION_WINDOW * 60 * 1000

    for (const [key, record] of this.failedLoginAttempts.entries()) {
      if (now - record.lastAttempt > windowMs) {
        this.failedLoginAttempts.delete(key)
      }
    }

    // Nettoyer le cooldown des alertes (plus de 1 heure)
    for (const [key, timestamp] of this.alertCooldown.entries()) {
      if (now - timestamp > 60 * 60 * 1000) {
        this.alertCooldown.delete(key)
      }
    }
  }

  /**
   * Réinitialise le compteur pour un email (après connexion réussie)
   * @param {string} email - Email de l'utilisateur
   */
  resetFailedAttempts(email) {
    this.failedLoginAttempts.delete(email.toLowerCase())
  }

  /**
   * Obtient les statistiques de détection
   * @returns {Object} - Statistiques
   */
  getStats() {
    return {
      failedLoginAttempts: this.failedLoginAttempts.size,
      suspiciousIPs: this.suspiciousIPs.size,
      alertCooldown: this.alertCooldown.size
    }
  }
}

// Instance singleton
export const anomalyDetector = new AnomalyDetector()

// Nettoyage périodique toutes les 5 minutes
setInterval(() => {
  anomalyDetector.cleanupOldRecords()
}, 5 * 60 * 1000)

