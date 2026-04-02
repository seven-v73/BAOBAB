import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import type { NotificationType } from '../components/Notification/Notification'

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => string
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notifications = useNotifications()

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}

