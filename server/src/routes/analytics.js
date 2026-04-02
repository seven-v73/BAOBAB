import express from 'express'
import { getAnalytics, getUserAnalytics } from '../controllers/analyticsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET /api/analytics - Analytics globales (Admin)
router.get('/', authenticate, getAnalytics)

// GET /api/analytics/user - Analytics utilisateur
router.get('/user', authenticate, getUserAnalytics)

export default router

