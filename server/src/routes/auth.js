import express from 'express'
import { register, login, getMe, refreshToken, logout, changePassword } from '../controllers/authController.js'
import { setup2FA, verify2FA, disable2FA, verify2FALogin, get2FAStatus } from '../controllers/twoFactorController.js'
import { authenticate } from '../middleware/auth.js'
import { validateRegister, validateLogin, sanitizeInput } from '../middleware/validation.js'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.js'

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 example: SecurePassword123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// POST /api/auth/register
router.post('/register', sanitizeInput, validateRegister, register)

// POST /api/auth/login
router.post('/login', sanitizeInput, validateLogin, login)

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requis'),
  validate
], refreshToken)

// POST /api/auth/logout - Déconnexion
router.post('/logout', authenticate, logout)

// GET /api/auth/me - Récupérer l'utilisateur connecté
router.get('/me', authenticate, getMe)

// PUT /api/auth/change-password - Changer le mot de passe
router.put('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  validate
], changePassword)

// Routes 2FA
// GET /api/auth/2fa/setup - Initialiser la 2FA
router.get('/2fa/setup', authenticate, setup2FA)

// POST /api/auth/2fa/verify - Vérifier et activer la 2FA
router.post('/2fa/verify', authenticate, [
  body('token')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('Code TOTP requis (6 chiffres)'),
  validate
], verify2FA)

// POST /api/auth/2fa/disable - Désactiver la 2FA
router.post('/2fa/disable', authenticate, [
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  validate
], disable2FA)

// POST /api/auth/2fa/verify-login - Vérifier le code 2FA lors de la connexion
router.post('/2fa/verify-login', [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),
  body('token')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('Code TOTP invalide'),
  body('backupCode')
    .optional()
    .isLength({ min: 8, max: 8 })
    .withMessage('Code de sauvegarde invalide'),
  validate
], verify2FALogin)

// GET /api/auth/2fa/status - Obtenir le statut de la 2FA
router.get('/2fa/status', authenticate, get2FAStatus)

export default router

