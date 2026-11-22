import logger from './logger.js'

export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

// Jamais de mot de passe, code 2FA ou jeton en clair dans les journaux
const SENSITIVE_KEYS = /pass|token|secret|code|otp/i
const redactBody = (body) => {
  if (!body || typeof body !== 'object') return body
  return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, SENSITIVE_KEYS.test(key) ? '[masqué]' : value]))
}

// Erreurs Mongoose provoquées par la requête du client, pas par un bug : réponse 4xx lisible
// (sinon /api/figures/zzz renvoyait une erreur 500)
const clientDbError = (err) => {
  if (err.name === 'CastError') return new AppError('Ressource introuvable', 404)
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message }))
    return new AppError('Données invalides', 400, details.length ? details : null)
  }
  if (err.code === 11000) return new AppError('Cette ressource existe déjà', 409)
  return null
}

export const errorHandler = (err, req, res, next) => {
  if (!err.isOperational) err = clientDbError(err) || err
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Logger l'erreur
  if (err.statusCode >= 500) {
    logger.error('ERROR 💥', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      body: redactBody(req.body),
      params: req.params,
      query: req.query
    })
  } else {
    logger.warn('Client Error', {
      message: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    })
  }

  // Réponse en développement
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      ...(err.details && { details: err.details }),
      stack: err.stack,
      ...(req.originalUrl && { path: req.originalUrl })
    })
  } else {
    // Réponse en production
    if (err.isOperational) {
      // Erreurs opérationnelles (créées par nous)
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(err.details && { details: err.details })
      })
    } else if (err.expose && err.statusCode < 500) {
      // Erreurs du client signalées par les bibliothèques (corps trop volumineux, JSON mal formé…)
      const messages = { 413: 'Requête trop volumineuse.', 400: 'Requête mal formée.' }
      res.status(err.statusCode).json({
        status: 'fail',
        message: messages[err.statusCode] || 'Requête refusée.'
      })
    } else {
      // Erreurs de programmation (non prévues)
      res.status(500).json({
        status: 'error',
        message: 'Quelque chose s\'est mal passé!'
      })
    }
  }
}

// Gestion des routes non trouvées
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} non trouvée`, 404)
  next(err)
}

// Gestion des erreurs async
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

