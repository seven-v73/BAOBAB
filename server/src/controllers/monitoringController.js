import { securityMonitoring } from '../utils/securityMonitoring.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { catchAsync } from '../utils/errorHandler.js'
import { AppError } from '../utils/errorHandler.js'

// GET /api/monitoring/security/stats - Statistiques de sécurité
export const getSecurityStats = catchAsync(async (req, res, next) => {
  const { hours = 24 } = req.query
  
  const stats = securityMonitoring.getStats({ hours: parseInt(hours) })
  
  res.json({
    success: true,
    data: stats
  })
})

// GET /api/monitoring/security/events - Événements récents
export const getSecurityEvents = catchAsync(async (req, res, next) => {
  const { limit = 50, severity } = req.query
  
  const events = securityMonitoring.getRecentEvents(
    parseInt(limit),
    severity || null
  )
  
  res.json({
    success: true,
    data: events,
    count: events.length
  })
})

// GET /api/monitoring/security/alerts - Alertes récentes
export const getSecurityAlerts = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query
  
  const alerts = securityMonitoring.getRecentAlerts(parseInt(limit))
  
  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  })
})

