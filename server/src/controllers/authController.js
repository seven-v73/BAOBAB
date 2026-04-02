import User from '../models/User.js'
import RefreshToken from '../models/RefreshToken.js'
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { AppError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { sendWelcomeEmail } from '../utils/notifications.js'
import env from '../config/env.js'
import { validatePassword } from '../utils/passwordValidator.js'
import { logLoginAttempt, logRegistrationAttempt, logPasswordChange } from '../utils/securityLogger.js'
import { anomalyDetector } from '../utils/anomalyDetection.js'
import { securityMonitoring } from '../utils/securityMonitoring.js'

// POST /api/auth/register
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body

  // Délai artificiel pour normaliser les temps de réponse (protection énumération)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

  // Valider le mot de passe avec les nouvelles règles
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    logRegistrationAttempt(req, false, null, 'password_validation_failed')
    return next(new AppError('Mot de passe invalide: ' + passwordValidation.errors.join(', '), 400))
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    // Message identique pour éviter l'énumération
    logRegistrationAttempt(req, false, null, 'email_already_exists')
    return next(new AppError('Email ou mot de passe incorrect', 400))
  }

  // Créer l'utilisateur
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
  })

  await user.save()
  
  logRegistrationAttempt(req, true, user._id.toString())

  logger.info('Nouvel utilisateur inscrit', { userId: user._id, email: user.email })

  // Envoyer l'email de bienvenue (ne pas bloquer si échec)
  try {
    await sendWelcomeEmail(user)
  } catch (emailError) {
    logger.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError)
  }

  // Générer tokens
  const token = generateToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  // Calculer la date d'expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 jours

  // Sauvegarder le refresh token
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json({
    message: 'Inscription réussie',
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

// POST /api/auth/login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Délai artificiel pour normaliser les temps de réponse (protection énumération)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

  // Trouver l'utilisateur avec le password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  
  if (!user) {
    logLoginAttempt(req, false, null, 'user_not_found')
    await anomalyDetector.recordFailedLogin(email, req.ip)
    securityMonitoring.recordEvent('LOGIN_FAILED', { email, reason: 'user_not_found' }, 'medium')
    return next(new AppError('Email ou mot de passe incorrect', 401))
  }

  if (!user.isActive) {
    logLoginAttempt(req, false, user._id.toString(), 'account_disabled')
    await anomalyDetector.recordFailedLogin(email, req.ip)
    securityMonitoring.recordEvent('LOGIN_FAILED', { email, userId: user._id.toString(), reason: 'account_disabled' }, 'high')
    return next(new AppError('Email ou mot de passe incorrect', 401))
  }

  // Vérifier le password
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    logLoginAttempt(req, false, user._id.toString(), 'invalid_password')
    await anomalyDetector.recordFailedLogin(email, req.ip)
    securityMonitoring.recordEvent('LOGIN_FAILED', { email, userId: user._id.toString(), reason: 'invalid_password' }, 'medium')
    return next(new AppError('Email ou mot de passe incorrect', 401))
  }

  // Détecter les sessions suspectes
  await anomalyDetector.detectSuspiciousSession(user._id.toString(), req.ip, req.get('user-agent'))

  logLoginAttempt(req, true, user._id.toString())
  anomalyDetector.resetFailedAttempts(email)
  securityMonitoring.recordEvent('LOGIN_SUCCESS', { email, userId: user._id.toString() }, 'low')
  logger.info('Connexion réussie', { userId: user._id, email: user.email })

  // Révoquer tous les anciens refresh tokens de cet utilisateur (rotation)
  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date() }
  )

  // Générer nouveaux tokens
  const token = generateToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  // Calculer la date d'expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 jours

  // Sauvegarder le nouveau refresh token
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json({
    message: 'Connexion réussie',
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  })
})

// GET /api/auth/me
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('favorites', 'name price images')
    .populate('wishlist', 'name price images')
  
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404))
  }
  
  res.json(user)
})

// POST /api/auth/refresh - Rafraîchir le token
export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body

  if (!token) {
    return next(new AppError('Refresh token requis', 400))
  }

  // Vérifier le refresh token dans la base de données
  const storedToken = await RefreshToken.findOne({ token, revokedAt: null })

  if (!storedToken || !storedToken.isValid()) {
    return next(new AppError('Refresh token invalide ou expiré', 401))
  }

  // Vérifier le token JWT
  let decoded
  try {
    decoded = verifyRefreshToken(token)
  } catch (error) {
    // Révoquer le token si invalide
    storedToken.revokedAt = new Date()
    await storedToken.save()
    return next(new AppError('Refresh token invalide', 401))
  }

  // Vérifier que l'utilisateur existe toujours
  const user = await User.findById(decoded.userId)
  if (!user || !user.isActive) {
    return next(new AppError('Utilisateur non autorisé', 401))
  }

  // Révoquer l'ancien refresh token (rotation)
  storedToken.revokedAt = new Date()
  await storedToken.save()

  // Générer de nouveaux tokens
  const newToken = generateToken(user._id)
  const newRefreshToken = generateRefreshToken(user._id)

  // Calculer la date d'expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 jours

  // Sauvegarder le nouveau refresh token
  await RefreshToken.create({
    token: newRefreshToken,
    user: user._id,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  logger.info('Token rafraîchi', { userId: user._id })

  res.json({
    message: 'Token rafraîchi avec succès',
    token: newToken,
    refreshToken: newRefreshToken,
  })
})

// POST /api/auth/logout - Déconnexion
export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body

  if (token) {
    // Révoquer le refresh token
    await RefreshToken.findOneAndUpdate(
      { token, revokedAt: null },
      { revokedAt: new Date() }
    )
  }

  logger.info('Déconnexion', { userId: req.user?._id })

  res.json({
    message: 'Déconnexion réussie',
  })
})

// PUT /api/auth/change-password - Changer le mot de passe
export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return next(new AppError('Le mot de passe actuel et le nouveau mot de passe sont requis', 400))
  }

  // Valider le nouveau mot de passe avec les nouvelles règles
  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.valid) {
    logPasswordChange(req, req.user._id.toString(), false, 'password_validation_failed')
    return next(new AppError('Nouveau mot de passe invalide: ' + passwordValidation.errors.join(', '), 400))
  }

  // Récupérer l'utilisateur avec le password
  const user = await User.findById(req.user._id).select('+password')
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404))
  }

  // Vérifier le mot de passe actuel
  const isPasswordValid = await user.comparePassword(currentPassword)
  if (!isPasswordValid) {
    logPasswordChange(req, req.user._id.toString(), false, 'current_password_incorrect')
    return next(new AppError('Mot de passe actuel incorrect', 401))
  }

  // Mettre à jour le mot de passe
  user.password = newPassword
  await user.save()

  // Révoquer tous les refresh tokens après changement de mot de passe
  await RefreshToken.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date(), reason: 'password_changed' }
  )

  logPasswordChange(req, user._id.toString(), true)
  logger.info('Mot de passe changé', { userId: user._id })

  res.json({ message: 'Mot de passe changé avec succès' })
})

