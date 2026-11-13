import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user, status, loggedOut } = useAuthStore()
  const location = useLocation()

  // Vérification de session en cours (rechargement de page) : on attend avant de décider
  if (status !== 'ready' && isAuthenticated) {
    return (
      <div className="mb-page-loader" role="status" aria-live="polite">
        <span className="sr-only">Vérification de la session…</span>
        <div className="mb-skeleton" style={{ height: 40, width: '40%' }} />
      </div>
    )
  }

  if (!isAuthenticated && loggedOut) return <Navigate to="/" replace />

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
