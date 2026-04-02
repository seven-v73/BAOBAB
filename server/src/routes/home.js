import express from 'express'
import { getHomeStats, getFeaturedContent, getTrendingContent, getRecentContent } from '../controllers/homeController.js'

const router = express.Router()

// GET /api/stats/home - Statistiques pour la page d'accueil
router.get('/stats/home', getHomeStats)

// GET /api/content/featured - Contenu en vedette
router.get('/content/featured', getFeaturedContent)

// GET /api/content/trending - Contenu tendance
router.get('/content/trending', getTrendingContent)

// GET /api/content/recent - Contenu récent
router.get('/content/recent', getRecentContent)

export default router

