import express from 'express'
import { getRecommendations } from '../controllers/recommendationController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET /api/recommendations - Recommandations personnalisées (nécessite authentification)
router.get('/', authenticate, getRecommendations)

export default router

