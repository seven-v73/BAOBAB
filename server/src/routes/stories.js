import express from 'express'
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  completeStory,
} from '../controllers/storyController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getStories)
router.get('/:id', getStoryById)
router.post('/:id/complete', authenticate, completeStory) // Utilisateurs authentifiés peuvent compléter

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createStory)
router.put('/:id', authenticate, authorize('admin'), updateStory)
router.delete('/:id', authenticate, authorize('admin'), deleteStory)

export default router

