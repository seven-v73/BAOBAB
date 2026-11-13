import RefreshToken from '../models/RefreshToken.js'
import env from '../config/env.js'
import logger from './logger.js'
import { generateRefreshToken, generateToken, hashToken, REFRESH_TOKEN_DAYS } from './jwt.js'

/*
 * Gestion des sessions
 * - Le refresh token vit dans un cookie httpOnly (illisible par JavaScript : protégé des scripts injectés),
 *   limité aux routes /api/auth et envoyé uniquement depuis le site lui-même (SameSite=Strict).
 * - Le jeton d'accès (15 min) est renvoyé dans la réponse et gardé en mémoire par le navigateur.
 * - Rotation à chaque rafraîchissement. Si un ancien jeton est rejoué hors de la fenêtre de tolérance,
 *   c'est le signe d'un vol : toutes les sessions du compte sont fermées.
 * - Plusieurs appareils peuvent rester connectés en même temps (10 au maximum).
 */

export const REFRESH_COOKIE = 'mb_rt'
const COOKIE_PATH = '/api/auth'
const MAX_SESSIONS = 10
const ROTATION_GRACE_MS = 30 * 1000 // requêtes simultanées (plusieurs onglets) au moment de la rotation

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: COOKIE_PATH,
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
})

export const setRefreshCookie = (res, token) => res.cookie(REFRESH_COOKIE, token, cookieOptions())

export const clearRefreshCookie = (res) => {
  const { maxAge, ...options } = cookieOptions()
  res.clearCookie(REFRESH_COOKIE, options)
}

/** Lit le cookie sans dépendance supplémentaire (cookie-parser n'est pas installé). */
export const readRefreshToken = (req) => {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=')
    if (name === REFRESH_COOKIE) return decodeURIComponent(value.join('='))
  }
  // Compatibilité : anciennes versions de l'application qui envoyaient le jeton dans le corps
  return typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null
}

const expiryDate = () => new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000)

export const publicUser = (user) => ({
  id: String(user._id),
  _id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
})

/** Ouvre une session (connexion, inscription, 2FA validée) et renvoie le corps de réponse. */
export const startSession = async (req, res, user, { sessionStartedAt } = {}) => {
  const refreshToken = generateRefreshToken(user._id)
  const record = await RefreshToken.create({
    token: hashToken(refreshToken),
    user: user._id,
    expiresAt: expiryDate(),
    sessionStartedAt: sessionStartedAt || new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent')?.slice(0, 300) || null,
  })

  // Au-delà de 10 appareils, on ferme les sessions les plus anciennes
  const active = await RefreshToken.find({ user: user._id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ lastUsedAt: -1 })
    .select('_id')
  const overflow = active.slice(MAX_SESSIONS).map((session) => session._id)
  if (overflow.length) {
    await RefreshToken.updateMany({ _id: { $in: overflow } }, { revokedAt: new Date(), revokedReason: 'too_many_sessions' })
  }

  setRefreshCookie(res, refreshToken)
  return { record, body: { token: generateToken(user._id), user: publicUser(user) } }
}

/** Trouve la session correspondant au jeton présenté (empreinte, ou jeton en clair pour les anciennes sessions). */
export const findSession = (token) => RefreshToken.findOne({ token: { $in: [hashToken(token), token] } })

export const revokeAllSessions = (userId, reason, exceptId = null) =>
  RefreshToken.updateMany(
    { user: userId, revokedAt: null, ...(exceptId ? { _id: { $ne: exceptId } } : {}) },
    { revokedAt: new Date(), revokedReason: reason },
  )

/**
 * Rafraîchit une session. Retourne { status, body?, error? }.
 * - Jeton valide : rotation (nouveau cookie + nouveau jeton d'accès).
 * - Jeton tout juste remplacé (< 30 s) : nouveau jeton d'accès sans nouvelle rotation ;
 *   le navigateur a déjà reçu le nouveau cookie via la requête concurrente.
 * - Jeton remplacé depuis longtemps : rejeu suspect → toutes les sessions sont fermées.
 */
export const refreshSession = async (req, res, token, loadUser) => {
  const record = await findSession(token)
  if (!record) return { status: 401, error: 'Session introuvable ou expirée' }

  if (record.revokedAt) {
    const sinceRevocation = Date.now() - record.revokedAt.getTime()
    if (record.replacedBy && sinceRevocation < ROTATION_GRACE_MS) {
      const user = await loadUser(record.user)
      if (!user || !user.isActive) return { status: 401, error: 'Utilisateur non autorisé' }
      return { status: 200, body: { token: generateToken(user._id), user: publicUser(user) } }
    }
    if (record.replacedBy) {
      await revokeAllSessions(record.user, 'reuse_detected')
      logger.warn('Rejeu d’un jeton de session déjà utilisé : toutes les sessions du compte sont fermées', { userId: String(record.user), ip: req.ip })
    }
    return { status: 401, error: 'Session expirée, veuillez vous reconnecter' }
  }

  if (record.expiresAt <= new Date()) return { status: 401, error: 'Session expirée, veuillez vous reconnecter' }

  const user = await loadUser(record.user)
  if (!user || !user.isActive) {
    record.revokedAt = new Date()
    record.revokedReason = 'user_inactive'
    await record.save()
    return { status: 401, error: 'Utilisateur non autorisé' }
  }

  const { record: next, body } = await startSession(req, res, user, { sessionStartedAt: record.sessionStartedAt || record.createdAt })
  record.revokedAt = new Date()
  record.revokedReason = 'rotated'
  record.replacedBy = next.token
  record.lastUsedAt = new Date()
  await record.save()
  return { status: 200, body }
}
