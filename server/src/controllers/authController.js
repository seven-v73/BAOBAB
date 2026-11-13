import User from '../models/User.js'
import RefreshToken from '../models/RefreshToken.js'
import TwoFactorAuth from '../models/TwoFactorAuth.js'
import { generateTwoFactorChallenge, hashToken } from '../utils/jwt.js'
import { AppError, catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { sendWelcomeEmail } from '../utils/notifications.js'
import { validatePassword } from '../utils/passwordValidator.js'
import { logLoginAttempt, logRegistrationAttempt, logPasswordChange } from '../utils/securityLogger.js'
import { anomalyDetector } from '../utils/anomalyDetection.js'
import { securityMonitoring } from '../utils/securityMonitoring.js'
import {
  clearRefreshCookie,
  findSession,
  publicUser,
  readRefreshToken,
  refreshSession,
  revokeAllSessions,
  startSession,
} from '../utils/session.js'

// Temps de réponse homogène : on ne peut pas deviner si un compte existe en chronométrant la réponse
const uniformDelay = () => new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300))

// POST /api/auth/register
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body
  await uniformDelay()

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    logRegistrationAttempt(req, false, null, 'password_validation_failed')
    return next(new AppError(passwordValidation.errors[0], 400))
  }

  const normalizedEmail = email.toLowerCase().trim()
  if (await User.exists({ email: normalizedEmail })) {
    logRegistrationAttempt(req, false, null, 'email_already_exists')
    return next(new AppError('Un compte existe déjà avec cette adresse. Connectez-vous plutôt.', 409))
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password })
  logRegistrationAttempt(req, true, user._id.toString())
  logger.info('Nouvel utilisateur inscrit', { userId: user._id })

  sendWelcomeEmail(user).catch((error) => logger.error('Email de bienvenue non envoyé', { error: error.message }))

  const { body } = await startSession(req, res, user)
  res.status(201).json({ message: 'Bienvenue sur MonBaobab !', ...body })
})

// POST /api/auth/login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  await uniformDelay()

  const normalizedEmail = email.toLowerCase().trim()
  const user = await User.findOne({ email: normalizedEmail }).select('+password')
  const reject = async (userId, reason, severity = 'medium') => {
    logLoginAttempt(req, false, userId, reason)
    await anomalyDetector.recordFailedLogin(normalizedEmail, req.ip)
    securityMonitoring.recordEvent('LOGIN_FAILED', { email: normalizedEmail, userId, reason }, severity)
    // Message identique dans tous les cas : on ne révèle pas si le compte existe
    return next(new AppError('Adresse e-mail ou mot de passe incorrect', 401))
  }

  if (!user) return reject(null, 'user_not_found')
  if (!user.isActive) return reject(user._id.toString(), 'account_disabled', 'high')
  if (!(await user.comparePassword(password))) return reject(user._id.toString(), 'invalid_password')

  anomalyDetector.resetFailedAttempts(normalizedEmail)

  // Double authentification : aucun jeton tant que le code n'est pas vérifié
  const twoFactor = await TwoFactorAuth.findOne({ user: user._id, enabled: true }).select('_id')
  if (twoFactor) {
    logLoginAttempt(req, true, user._id.toString(), '2fa_required')
    return res.json({ requires2FA: true, challengeToken: generateTwoFactorChallenge(user._id) })
  }

  await anomalyDetector.detectSuspiciousSession(user._id.toString(), req.ip, req.get('user-agent'))
  logLoginAttempt(req, true, user._id.toString())
  securityMonitoring.recordEvent('LOGIN_SUCCESS', { userId: user._id.toString() }, 'low')
  logger.info('Connexion réussie', { userId: user._id })

  const { body } = await startSession(req, res, user)
  res.json({ message: 'Connexion réussie', ...body })
})

// GET /api/auth/me
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('favorites', 'name price images').populate('wishlist', 'name price images')
  if (!user) return next(new AppError('Utilisateur non trouvé', 404))
  // `id` en plus de `_id` : un seul format d'utilisateur côté application
  res.json({ ...user.toJSON(), id: String(user._id) })
})

// POST /api/auth/refresh — cookie httpOnly (ou ancien jeton dans le corps, pour la migration)
export const refreshToken = catchAsync(async (req, res) => {
  const token = readRefreshToken(req)
  if (!token) {
    clearRefreshCookie(res)
    return res.status(401).json({ error: 'Aucune session active' })
  }

  const result = await refreshSession(req, res, token, (id) => User.findById(id))
  if (result.status !== 200) {
    clearRefreshCookie(res)
    return res.status(result.status).json({ error: result.error })
  }
  res.json(result.body)
})

// POST /api/auth/logout — fonctionne même si le jeton d'accès a expiré
export const logout = catchAsync(async (req, res) => {
  const token = readRefreshToken(req)
  if (token) {
    const session = await findSession(token)
    if (session && !session.revokedAt) {
      session.revokedAt = new Date()
      session.revokedReason = 'logout'
      await session.save()
      logger.info('Déconnexion', { userId: String(session.user) })
    }
  }
  clearRefreshCookie(res)
  res.json({ message: 'Vous êtes déconnecté·e' })
})

// POST /api/auth/logout-all — déconnecter tous les appareils
export const logoutAll = catchAsync(async (req, res) => {
  await revokeAllSessions(req.user._id, 'logout_all')
  clearRefreshCookie(res)
  logger.info('Déconnexion de tous les appareils', { userId: req.user._id })
  res.json({ message: 'Tous vos appareils ont été déconnectés' })
})

// GET /api/auth/sessions — appareils connectés
export const listSessions = catchAsync(async (req, res) => {
  const current = readRefreshToken(req)
  const currentHashes = current ? [hashToken(current), current] : []
  const sessions = await RefreshToken.find({ user: req.user._id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ lastUsedAt: -1 })
    .select('token sessionStartedAt createdAt lastUsedAt ipAddress userAgent expiresAt')
  res.json(
    sessions.map((session) => ({
      id: String(session._id),
      startedAt: session.sessionStartedAt || session.createdAt,
      lastUsedAt: session.lastUsedAt || session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      current: currentHashes.includes(session.token),
    })),
  )
})

// DELETE /api/auth/sessions/:id — déconnecter un appareil précis
export const revokeSession = catchAsync(async (req, res, next) => {
  const session = await RefreshToken.findOne({ _id: req.params.id, user: req.user._id, revokedAt: null })
  if (!session) return next(new AppError('Session introuvable', 404))
  session.revokedAt = new Date()
  session.revokedReason = 'revoked_by_user'
  await session.save()
  res.json({ message: 'Appareil déconnecté' })
})

// PUT /api/auth/change-password
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.valid) {
    logPasswordChange(req, req.user._id.toString(), false, 'password_validation_failed')
    return next(new AppError(passwordValidation.errors[0], 400))
  }

  const user = await User.findById(req.user._id).select('+password')
  if (!user) return next(new AppError('Utilisateur non trouvé', 404))

  if (!(await user.comparePassword(currentPassword))) {
    logPasswordChange(req, user._id.toString(), false, 'current_password_incorrect')
    return next(new AppError('Le mot de passe actuel est incorrect', 400))
  }
  if (await user.comparePassword(newPassword)) {
    return next(new AppError('Le nouveau mot de passe doit être différent de l’actuel', 400))
  }

  user.password = newPassword
  await user.save()

  // Les autres appareils sont déconnectés ; celui-ci reste connecté avec une nouvelle session
  await revokeAllSessions(user._id, 'password_changed')
  const { body } = await startSession(req, res, user)

  logPasswordChange(req, user._id.toString(), true)
  logger.info('Mot de passe changé', { userId: user._id })
  res.json({ message: 'Mot de passe modifié. Vos autres appareils ont été déconnectés.', ...body })
})

export { publicUser }
