import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'
import { catchAsync } from '../utils/errorHandler.js'

// Middleware d'authentification optionnel
// Ajoute req.user si un token valide est présent, mais ne bloque pas si absent
export const optionalAuthenticate = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    // Pas de token, continuer sans req.user
    return next()
  }

  try {
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (user && user.isActive) {
      req.user = user
    }
  } catch (error) {
    // Token invalide ou expiré, continuer sans req.user
    // Ne pas bloquer la requête
  }
  
  next()
})

