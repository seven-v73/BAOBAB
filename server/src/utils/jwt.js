import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'

const JWT_SECRET = env.JWT_SECRET
export const ACCESS_TOKEN_TTL = env.JWT_EXPIRES_IN || '15m' // jeton d'accès : court, gardé en mémoire côté navigateur
export const REFRESH_TOKEN_DAYS = Number(env.REFRESH_TOKEN_DAYS) || 30 // session glissante : prolongée à chaque rafraîchissement
const TWO_FACTOR_CHALLENGE_TTL = '5m'

/*
 * Chaque jeton porte un `type` : un jeton de rafraîchissement ou un défi 2FA ne peut jamais
 * servir de jeton d'accès (auparavant, un refresh token de 7 jours était accepté partout).
 * `jti` rend chaque jeton unique, même émis dans la même seconde pour le même utilisateur.
 */

export const generateToken = (userId) =>
  jwt.sign({ userId: String(userId), type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })

export const generateRefreshToken = (userId) =>
  jwt.sign({ userId: String(userId), type: 'refresh', jti: crypto.randomUUID() }, JWT_SECRET, {
    expiresIn: `${REFRESH_TOKEN_DAYS}d`,
  })

/** Défi de connexion 2FA : prouve que le mot de passe a été validé, pour 5 minutes seulement. */
export const generateTwoFactorChallenge = (userId) =>
  jwt.sign({ userId: String(userId), type: '2fa', jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: TWO_FACTOR_CHALLENGE_TTL })

/** Vérifie un jeton d'accès (les anciens jetons sans type restent acceptés jusqu'à leur expiration). */
export const verifyToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET)
  if (decoded.type && decoded.type !== 'access') {
    const error = new Error('Ce jeton ne peut pas servir à accéder à l’API')
    error.name = 'JsonWebTokenError'
    throw error
  }
  return decoded
}

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET)
  if (decoded.type !== 'refresh') throw new Error('Token invalide : ce n’est pas un refresh token')
  return decoded
}

export const verifyTwoFactorChallenge = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET)
  if (decoded.type !== '2fa') throw new Error('Défi 2FA invalide')
  return decoded
}

/** Empreinte stockée en base : une fuite de la base ne livre pas de session utilisable. */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
