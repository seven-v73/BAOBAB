import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../store/productStore'
import { useSettingsStore } from '../stores/settingsStore'
import { Button } from '../components/ui/Button'
import './Header.css'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const cartItemCount = useProductStore((state) => state.getCartItemCount())
  const navigate = useNavigate()
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const platformName = settings?.platformName || 'MonBaobab'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">
            <span>MB</span>
          </span>
          <span className="logo-wordmark">
            <span className="logo-text">{platformName}</span>
            <span className="logo-signature">Afrique connectée</span>
          </span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/shop" className="nav-link">Boutique</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link to="/shop/cart" className="cart-link">
                <span className="icon-shopping" aria-hidden="true" /> Panier
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>
              <span className="user-name">{user?.name}</span>
              <Button variant="outline" size="small" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="small">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="small">
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
