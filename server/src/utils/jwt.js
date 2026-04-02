import jwt from 'jsonwebtoken'
import env from '../config/env.js'

const JWT_SECRET = env.JWT_SECRET
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '15m' // Access token : 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = env.REFRESH_TOKEN_EXPIRES_IN || '7d' // Refresh token : 7 jours

// Générer un access token (court terme)
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

// Générer un refresh token (long terme)
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

// Vérifier un access token
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

// Vérifier un refresh token
export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET)
  if (decoded.type !== 'refresh') {
    throw new Error('Token invalide : ce n\'est pas un refresh token')
  }
  return decoded
}

