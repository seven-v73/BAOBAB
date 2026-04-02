import express from 'express'
import {
  createReview,
  getProductReviews,
  markHelpful,
} from '../controllers/reviewController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Route publique
router.get('/product/:productId', getProductReviews)

// Routes protégées
router.post('/', authenticate, createReview)
router.put('/:id/helpful', authenticate, markHelpful)

export default router

