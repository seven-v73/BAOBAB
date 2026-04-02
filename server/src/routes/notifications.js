import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authenticate)

// GET /api/notifications - Récupérer les notifications
router.get('/', getNotifications)

// PUT /api/notifications/:id/read - Marquer comme lue
router.put('/:id/read', markAsRead)

// PUT /api/notifications/read-all - Marquer toutes comme lues
router.put('/read-all', markAllAsRead)

// DELETE /api/notifications/:id - Supprimer
router.delete('/:id', deleteNotification)

export default router

