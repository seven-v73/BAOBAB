import User from '../models/User.js'
import TwoFactorAuth from '../models/TwoFactorAuth.js'
import { generateSecret, generateQRCodeURL, verifyTOTP, generateBackupCodes } from '../utils/totp.js'
import { AppError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { logSecurityEvent } from '../utils/securityLogger.js'
import { securityMonitoring } from '../utils/securityMonitoring.js'

// GET /api/auth/2fa/setup - Initialiser la 2FA
export const setup2FA = catchAsync(async (req, res, next) => {
  const userId = req.user._id

  // Vérifier si la 2FA est déjà activée
  let twoFactor = await TwoFactorAuth.findOne({ user: userId })
  
  if (twoFactor && twoFactor.enabled) {
    return next(new AppError('La 2FA est déjà activée', 400))
  }

  // Générer un nouveau secret
  const secret = generateSecret()
  
  if (!twoFactor) {
    twoFactor = new TwoFactorAuth({
      user: userId,
      secret,
      enabled: false,
      verified: false
    })
  } else {
    twoFactor.secret = secret
    twoFactor.verified = false
  }

  await twoFactor.save()

  // Récupérer l'email de l'utilisateur pour le QR code
  const user = await User.findById(userId)
  const qrCodeURL = generateQRCodeURL(secret, user.email)

  logSecurityEvent('2FA_SETUP_INITIATED', { userId: userId.toString() })
  securityMonitoring.recordEvent('2FA_SETUP', { userId: userId.toString() }, 'low')

  res.json({
    secret,
    qrCodeURL,
    message: 'Scannez le QR code avec votre application d\'authentification'
  })
})

// POST /api/auth/2fa/verify - Vérifier et activer la 2FA
export const verify2FA = catchAsync(async (req, res, next) => {
  const userId = req.user._id
  const { token } = req.body

  if (!token) {
    return next(new AppError('Code TOTP requis', 400))
  }

  const twoFactor = await TwoFactorAuth.findOne({ user: userId })
  
  if (!twoFactor) {
    return next(new AppError('2FA non initialisée', 400))
  }

  if (twoFactor.enabled && twoFactor.verified) {
    return next(new AppError('2FA déjà activée', 400))
  }

  // Vérifier le code TOTP
  const isValid = verifyTOTP(twoFactor.secret, token)
  
  if (!isValid) {
    logSecurityEvent('2FA_VERIFICATION_FAILED', { userId: userId.toString() })
    securityMonitoring.recordEvent('2FA_VERIFICATION_FAILED', { userId: userId.toString() }, 'medium')
    return next(new AppError('Code TOTP invalide', 400))
  }

  // Générer les codes de sauvegarde
  const backupCodes = generateBackupCodes(10)
  twoFactor.backupCodes = backupCodes.map(code => ({ code, used: false }))
  twoFactor.enabled = true
  twoFactor.verified = true
  twoFactor.lastUsed = new Date()
  
  await twoFactor.save()

  logSecurityEvent('2FA_ENABLED', { userId: userId.toString() })
  securityMonitoring.recordEvent('2FA_ENABLED', { userId: userId.toString() }, 'low')

  res.json({
    message: '2FA activée avec succès',
    backupCodes: backupCodes.map(bc => bc.code) // Retourner les codes une seule fois
  })
})

// POST /api/auth/2fa/disable - Désactiver la 2FA
export const disable2FA = catchAsync(async (req, res, next) => {
  const userId = req.user._id
  const { password, token } = req.body

  if (!password) {
    return next(new AppError('Mot de passe requis pour désactiver la 2FA', 400))
  }

  // Vérifier le mot de passe
  const user = await User.findById(userId).select('+password')
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404))
  }

  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    return next(new AppError('Mot de passe incorrect', 401))
  }

  // Si un token est fourni, vérifier qu'il est valide
  const twoFactor = await TwoFactorAuth.findOne({ user: userId })
  if (twoFactor && twoFactor.enabled) {
    if (token) {
      const isValid = verifyTOTP(twoFactor.secret, token)
      if (!isValid) {
        // Vérifier aussi les codes de sauvegarde
        const backupCode = twoFactor.backupCodes.find(bc => bc.code === token.toUpperCase() && !bc.used)
        if (!backupCode) {
          return next(new AppError('Code TOTP ou code de sauvegarde invalide', 400))
        }
        backupCode.used = true
        backupCode.usedAt = new Date()
        await twoFactor.save()
      }
    }
  }

  // Désactiver la 2FA
  if (twoFactor) {
    twoFactor.enabled = false
    twoFactor.verified = false
    await twoFactor.save()
  }

  logSecurityEvent('2FA_DISABLED', { userId: userId.toString() })
  securityMonitoring.recordEvent('2FA_DISABLED', { userId: userId.toString() }, 'medium')

  res.json({
    message: '2FA désactivée avec succès'
  })
})

// POST /api/auth/2fa/verify-login - Vérifier le code 2FA lors de la connexion
export const verify2FALogin = catchAsync(async (req, res, next) => {
  const { email, token, backupCode } = req.body

  if (!email || (!token && !backupCode)) {
    return next(new AppError('Email et code TOTP ou code de sauvegarde requis', 400))
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404))
  }

  const twoFactor = await TwoFactorAuth.findOne({ user: user._id })
  if (!twoFactor || !twoFactor.enabled) {
    return next(new AppError('2FA non activée pour ce compte', 400))
  }

  let isValid = false

  if (token) {
    // Vérifier le code TOTP
    isValid = verifyTOTP(twoFactor.secret, token)
  } else if (backupCode) {
    // Vérifier le code de sauvegarde
    const backup = twoFactor.backupCodes.find(bc => bc.code === backupCode.toUpperCase() && !bc.used)
    if (backup) {
      isValid = true
      backup.used = true
      backup.usedAt = new Date()
      await twoFactor.save()
    }
  }

  if (!isValid) {
    logSecurityEvent('2FA_LOGIN_FAILED', { userId: user._id.toString(), email })
    securityMonitoring.recordEvent('2FA_LOGIN_FAILED', { userId: user._id.toString(), email }, 'high')
    return next(new AppError('Code TOTP ou code de sauvegarde invalide', 401))
  }

  twoFactor.lastUsed = new Date()
  await twoFactor.save()

  logSecurityEvent('2FA_LOGIN_SUCCESS', { userId: user._id.toString(), email })
  securityMonitoring.recordEvent('2FA_LOGIN_SUCCESS', { userId: user._id.toString(), email }, 'low')

  res.json({
    message: 'Code 2FA vérifié avec succès',
    verified: true
  })
})

// GET /api/auth/2fa/status - Obtenir le statut de la 2FA
export const get2FAStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id

  const twoFactor = await TwoFactorAuth.findOne({ user: userId })
  
  if (!twoFactor) {
    return res.json({
      enabled: false,
      verified: false
    })
  }

  res.json({
    enabled: twoFactor.enabled,
    verified: twoFactor.verified,
    lastUsed: twoFactor.lastUsed,
    backupCodesRemaining: twoFactor.backupCodes.filter(bc => !bc.used).length
  })
})

