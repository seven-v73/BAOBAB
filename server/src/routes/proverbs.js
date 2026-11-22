import express from 'express'
import {
  getAllProverbs,
  getProverbById,
  createProverb,
  updateProverb,
  deleteProverb,
  getRandomProverb,
  getProverbeDuJour,
  likeProverb,
} from '../controllers/proverbController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateMongoId } from '../middleware/validation.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Routes publiques
router.get('/', getAllProverbs)
router.get('/random', getRandomProverb)
router.get('/du-jour', getProverbeDuJour)
router.get('/:id', validateMongoId, getProverbById)
router.post('/:id/like', writeLimiter, authenticate, validateMongoId, likeProverb)

// Routes authentifiées (utilisateurs peuvent créer, admin peut modifier/supprimer)
router.post('/', writeLimiter, authenticate, createProverb) // Tous les utilisateurs authentifiés peuvent créer
router.put('/:id', authenticate, authorize('admin'), validateMongoId, updateProverb)
router.delete('/:id', authenticate, authorize('admin'), validateMongoId, deleteProverb)

export default router

