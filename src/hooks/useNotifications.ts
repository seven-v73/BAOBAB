import { useState, useCallback, useEffect } from 'react'
import type { NotificationType } from '../components/Notification/Notification'

interface NotificationItem {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

let notificationId = 0
let notificationStore: NotificationItem[] = []
const subscribers = new Set<(items: NotificationItem[]) => void>()

const emit = () => {
  const snapshot = [...notificationStore]
  subscribers.forEach((listener) => listener(snapshot))
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationStore)

  useEffect(() => {
    subscribers.add(setNotifications)
    setNotifications([...notificationStore])

    return () => {
      subscribers.delete(setNotifications)
    }
  }, [])

  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    duration = 5000
  ) => {
    const id = `notification-${++notificationId}`
    notificationStore = [...notificationStore, { id, type, message, duration }]
    emit()
    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    notificationStore = notificationStore.filter((notification) => notification.id !== id)
    emit()
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
    showError: error,
    info,
    warning,
  }
}
