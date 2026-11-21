import express from 'express'
import {
  createComment,
  getBlogComments,
  likeComment,
} from '../controllers/commentController.js'
import { authenticate } from '../middleware/auth.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Route publique
router.get('/blog/:blogId', getBlogComments)

// Routes protégées
router.post('/', writeLimiter, authenticate, createComment)
router.put('/:id/like', authenticate, likeComment)

export default router

