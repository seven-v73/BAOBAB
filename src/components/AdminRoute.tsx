import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

