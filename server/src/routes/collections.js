import express from 'express'
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  completeCollection,
} from '../controllers/collectionController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getCollections)
router.get('/:id', getCollectionById)
router.post('/:id/complete', authenticate, completeCollection) // Utilisateurs authentifiés peuvent compléter

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createCollection)
router.put('/:id', authenticate, authorize('admin'), updateCollection)
router.delete('/:id', authenticate, authorize('admin'), deleteCollection)

export default router

