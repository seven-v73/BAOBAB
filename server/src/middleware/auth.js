import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'
import { AppError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'

export const authenticate = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return next(new AppError('Token manquant', 401))
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide', 401))
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expiré', 401))
    }
    return next(new AppError('Erreur d\'authentification', 401))
  }

  const user = await User.findById(decoded.userId).select('-password')
  
  if (!user || !user.isActive) {
    return next(new AppError('Utilisateur non autorisé', 401))
  }

  req.user = user
  next()
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Non authentifié', 401))
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Accès refusé', 403))
    }
    
    next()
  }
}

