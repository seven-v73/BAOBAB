import express from 'express'
import {
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  citeSource,
} from '../controllers/sourceController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getSources)
router.get('/:id', getSourceById)
router.post('/:id/cite', citeSource) // Public pour permettre les citations

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createSource)
router.put('/:id', authenticate, authorize('admin'), updateSource)
router.delete('/:id', authenticate, authorize('admin'), deleteSource)

export default router

