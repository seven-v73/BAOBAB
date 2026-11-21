import express from 'express'
import { changerStatut, getFiche, getFiches, getFichesAdmin, getStats } from '../controllers/ficheController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { optionalAuthenticate } from '../middleware/optionalAuth.js'

const router = express.Router()

// Équipe (avant /:ficheId pour ne pas être pris pour un identifiant)
router.get('/admin', authenticate, authorize('admin'), getFichesAdmin)
router.get('/admin/stats', authenticate, authorize('admin'), getStats)
router.patch('/:ficheId/statut', authenticate, authorize('admin'), changerStatut)

// Public : fiches publiées uniquement
router.get('/', getFiches)
router.get('/:ficheId', optionalAuthenticate, getFiche)

export default router
