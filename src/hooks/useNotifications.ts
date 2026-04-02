import { useState, useCallback } from 'react'
import type { NotificationType } from '../components/Notification/Notification'

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
    duration = 5000
  ) => {
    const id = `notification-${++notificationId}`
    setNotifications((prev) => [...prev, { id, type, message, duration }])
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    return showNotification('success', message, duration)
  }, [showNotification])

  const error = useCallback((message: string, duration?: number) => {
    return showNotification('error', message, duration)
  }, [showNotification])

  const info = useCallback((message: string, duration?: number) => {
    return showNotification('info', message, duration)
  }, [showNotification])

  const warning = useCallback((message: string, duration?: number) => {
    return showNotification('warning', message, duration)
  }, [showNotification])

  return {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  }
}

