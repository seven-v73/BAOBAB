import logger from './logger.js'

/**
 * Logs de sécurité pour audit trail
 * Ces logs sont critiques pour la détection d'anomalies et la conformité
 */

/**
 * Log une action de sécurité
 * @param {string} event - Type d'événement
 * @param {Object} data - Données de l'événement
 */
export const logSecurityEvent = (event, data = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  }

  logger.info(`[SECURITY] ${event}`, logData)
}

/**
 * Log une tentative de connexion
 */
export const logLoginAttempt = (req, success, userId = null, reason = null) => {
  logSecurityEvent('LOGIN_ATTEMPT', {
    success,
    userId,
    email: req.body?.email || req.query?.email || 'unknown',
    ip: req.ip,
    userAgent: req.get('user-agent'),
    reason: reason || (success ? 'success' : 'failed')
  })
}

/**
 * Log une tentative d'inscription
 */
export const logRegistrationAttempt = (req, success, userId = null, reason = null) => {
  logSecurityEvent('REGISTRATION_ATTEMPT', {
    success,
    userId,
    email: req.body?.email || 'unknown',
    ip: req.ip,
    userAgent: req.get('user-agent'),
    reason: reason || (success ? 'success' : 'failed')
  })
}

/**
 * Log un changement de mot de passe
 */
export const logPasswordChange = (req, userId, success, reason = null) => {
  logSecurityEvent('PASSWORD_CHANGE', {
    success,
    userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    reason: reason || (success ? 'success' : 'failed')
  })
}

/**
 * Log une tentative d'injection
 */
export const logInjectionAttempt = (req, type, details = {}) => {
  logSecurityEvent('INJECTION_ATTEMPT', {
    type, // 'nosql', 'xss', 'sql', etc.
    ip: req.ip,
    userAgent: req.get('user-agent'),
    path: req.originalUrl,
    method: req.method,
    ...details
  })
}

/**
 * Log un upload de fichier suspect
 */
export const logSuspiciousUpload = (req, file, reason) => {
  logSecurityEvent('SUSPICIOUS_UPLOAD', {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    filename: file?.originalname,
    mimetype: file?.mimetype,
    size: file?.size,
    reason
  })
}

/**
 * Log un accès non autorisé
 */
export const logUnauthorizedAccess = (req, userId = null, resource = null) => {
  logSecurityEvent('UNAUTHORIZED_ACCESS', {
    userId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    path: req.originalUrl,
    method: req.method,
    resource
  })
}

/**
 * Log une action administrative
 */
export const logAdminAction = (req, userId, action, details = {}) => {
  logSecurityEvent('ADMIN_ACTION', {
    userId,
    action,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    path: req.originalUrl,
    ...details
  })
}

/**
 * Log une session suspecte
 */
export const logSuspiciousSession = (req, userId, reason, details = {}) => {
  logSecurityEvent('SUSPICIOUS_SESSION', {
    userId,
    reason,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    previousIp: details.previousIp,
    previousUserAgent: details.previousUserAgent,
    ...details
  })
}

/**
 * Log un rate limit déclenché
 */
export const logRateLimitExceeded = (req, limit, windowMs) => {
  logSecurityEvent('RATE_LIMIT_EXCEEDED', {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    path: req.originalUrl,
    method: req.method,
    limit,
    windowMs
  })
}

/**
 * Log une erreur de sécurité
 */
export const logSecurityError = (req, error, context = {}) => {
  logSecurityEvent('SECURITY_ERROR', {
    error: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    path: req.originalUrl,
    method: req.method,
    ...context
  })
}

