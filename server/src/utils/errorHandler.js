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

export const errorHandler = (err, req, res, next) => {
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
      body: req.body,
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

