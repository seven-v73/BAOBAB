import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './Notification.css'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationProps {
  id: string
  type: NotificationType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

export const Notification = ({ id, type, message, duration = 5000, onClose }: NotificationProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const Icon = icons[type]

  return (
    <div className={`notification notification-${type}`}>
      <Icon size={20} className="notification-icon" />
      <span className="notification-message">{message}</span>
      <button
        className="notification-close"
        onClick={() => onClose(id)}
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  )
}

