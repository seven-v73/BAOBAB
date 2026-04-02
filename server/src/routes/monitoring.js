import express from 'express'
import { getSecurityStats, getSecurityEvents, getSecurityAlerts } from '../controllers/monitoringController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification et un rôle admin
router.use(authenticate)
router.use(authorize('admin'))

// GET /api/monitoring/security/stats - Statistiques de sécurité
router.get('/security/stats', getSecurityStats)

// GET /api/monitoring/security/events - Événements récents
router.get('/security/events', getSecurityEvents)

// GET /api/monitoring/security/alerts - Alertes récentes
router.get('/security/alerts', getSecurityAlerts)

export default router

