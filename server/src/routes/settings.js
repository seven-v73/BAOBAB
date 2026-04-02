import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// GET /api/settings - Récupérer les paramètres (public)
router.get('/', getSettings)

// PUT /api/settings - Mettre à jour les paramètres (Admin uniquement)
router.put('/', authenticate, authorize('admin'), updateSettings)

export default router

