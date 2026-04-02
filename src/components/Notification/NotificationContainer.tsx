import { useState, useCallback } from 'react'
import { Notification } from './Notification'
import type { NotificationType } from './Notification'
import './NotificationContainer.css'

interface NotificationItem {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

let notificationId = 0

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    duration?: number
  ) => {
    const id = `notification-${++notificationId}`
    setNotifications((prev) => [...prev, { id, type, message, duration }])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { showNotification, removeNotification, notifications }
}

export const NotificationContainer = ({ notifications, onClose }: {
  notifications: NotificationItem[]
  onClose: (id: string) => void
}) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

