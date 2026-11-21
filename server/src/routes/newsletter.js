import express from 'express'
import {
  subscribe,
  unsubscribe,
  getSubscribers,
} from '../controllers/newsletterController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Routes publiques
router.post('/subscribe', writeLimiter, subscribe)
router.post('/unsubscribe', writeLimiter, unsubscribe)

// Route admin
router.get('/subscribers', authenticate, authorize('admin'), getSubscribers)

export default router

