import express from 'express'
import {
  subscribe,
  unsubscribe,
  getSubscribers,
} from '../controllers/newsletterController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)

// Route admin
router.get('/subscribers', authenticate, authorize('admin'), getSubscribers)

export default router

