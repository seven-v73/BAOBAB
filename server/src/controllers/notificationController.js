import Notification from '../models/Notification.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user?.id
  const { unreadOnly = false, limit = 50 } = req.query

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const query = { user: userId }
  if (unreadOnly === 'true') {
    query.read = false
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean()

  const unreadCount = await Notification.countDocuments({ user: userId, read: false })

  res.json({
    notifications,
    unreadCount,
  })
})

// PUT /api/notifications/:id/read - Marquer une notification comme lue
export const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?.id
  const notificationId = req.params.id

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  )

  if (!notification) {
    return res.status(404).json({ error: 'Notification non trouvée' })
  }

  res.json(notification)
})

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
export const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  )

  res.json({ message: 'Toutes les notifications ont été marquées comme lues' })
})

// DELETE /api/notifications/:id - Supprimer une notification
export const deleteNotification = catchAsync(async (req, res) => {
  const userId = req.user?.id
  const notificationId = req.params.id

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  })

  if (!notification) {
    return res.status(404).json({ error: 'Notification non trouvée' })
  }

  res.json({ message: 'Notification supprimée' })
})

