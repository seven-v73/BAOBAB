import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.getItemCount())
  const { settings, fetchSettings } = useSettingsStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Détecter le scroll pour réduire la navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  // Fermer le menu "Plus" quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        moreButtonRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false)
      }
      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isMoreMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMoreMenuOpen, isUserMenuOpen])

  const platformName = settings?.platformName || 'BAOBAB'

  // Navigation principale (toujours visible sur desktop)
  const mainNavItems = [
    { to: '/', label: 'Accueil', icon: 'icon-home' },
    { to: '/blog', label: 'Blog', icon: 'icon-file' },
    { to: '/shop', label: 'Boutique', icon: 'icon-shopping' },
  ]

  // Navigation secondaire (menu déroulant "Plus")
  const secondaryNavItems = [
    { to: '/timeline', label: 'Chronologie', icon: 'icon-clock' },
    { to: '/figures', label: 'Personnages', icon: 'icon-user' },
    { to: '/collections', label: 'Collections', icon: 'icon-folder' },
    { to: '/stories', label: 'Récits', icon: 'icon-book' },
    { to: '/quizzes', label: 'Quiz', icon: 'icon-help-circle' },
    { to: '/proverbs', label: 'Proverbes', icon: 'icon-quote' },
    { to: '/map', label: 'Carte', icon: 'icon-globe' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  return (
    <header ref={headerRef} className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">🌳</span>
          <span className="logo-text">{platformName}</span>
        </Link>
        
        {/* Navigation principale - Desktop uniquement */}
        <nav className="header-nav-desktop">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className={item.icon} />
                <span className="nav-link-text">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Menu "Plus" pour navigation secondaire */}
          <div className="nav-secondary" ref={moreMenuRef}>
            <button
              ref={moreButtonRef}
              className={`nav-more-btn ${isMoreMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              aria-label="Plus d'options"
            >
              <span className="icon-more-horizontal" />
              <span className="nav-link-text">Plus</span>
              <span className={`icon-arrow-down ${isMoreMenuOpen ? 'rotated' : ''}`} />
            </button>
            <div className={`nav-dropdown ${isMoreMenuOpen ? 'active' : ''}`}>
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-dropdown-item"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <span className={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        
        {/* Actions utilisateur */}
        <div className="header-actions">
          {/* Bouton recherche compact */}
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Rechercher"
          >
            <span className="icon-search" />
          </button>

          {/* Panier */}
          {isAuthenticated && (
            <Link to="/cart" className="cart-link" aria-label="Panier">
              <span className="icon-shopping" />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {/* Toggle thème */}
          <ThemeToggle />

          {/* Menu utilisateur */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                ref={userButtonRef}
                className="user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menu utilisateur"
              >
                <span className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="icon-arrow-down" />
              </button>
              <div className={`user-dropdown ${isUserMenuOpen ? 'active' : ''}`}>
                <div className="user-dropdown-header">
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="user-dropdown-menu">
                  <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="icon-layout" />
                    Dashboard
                  </Link>
                  <Link to="/communities" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="icon-users" />
                    Communautés
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="icon-settings" />
                      Administration
                    </Link>
                  )}
                  <div className="user-dropdown-divider" />
                  <button onClick={handleLogout} className="logout-btn">
                    <span className="icon-log-out" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link auth-link-button">
                Connexion
              </Link>
              <Link to="/register" className="auth-link auth-link-primary">
                Inscription
              </Link>
            </div>
          )}

          {/* Menu hamburger pour mobile */}
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Barre de recherche expandable */}
      {isSearchOpen && (
        <div className="header-search-expanded">
          <AdvancedSearch />
          <button
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Fermer la recherche"
          >
            <span className="icon-close" />
          </button>
        </div>
      )}

      {/* Menu mobile */}
      <nav className={`header-nav-mobile ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-content">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={item.icon} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          <div className="mobile-nav-divider" />
          
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={item.icon} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          {isAuthenticated && (
            <>
              <div className="mobile-nav-divider" />
              <Link
                to="/dashboard"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="icon-layout" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/communities"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="icon-users" />
                <span>Communautés</span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="icon-settings" />
                  <span>Administration</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
