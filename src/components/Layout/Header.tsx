import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

type NavigationItem = { to: string; label: string; icon: string }

const primaryItems: NavigationItem[] = [
  { to: '/map', label: 'Explorer', icon: 'icon-globe' },
  { to: '/collections', label: 'Comprendre', icon: 'icon-folder' },
  { to: '/stories', label: 'Mémoires', icon: 'icon-book' },
  { to: '/contribute', label: 'Contribuer', icon: 'icon-edit' },
]

const resourceGroups: Array<{ title: string; items: NavigationItem[] }> = [
  {
    title: 'Connaissances',
    items: [
      { to: '/timeline', label: 'Chronologies', icon: 'icon-clock' },
      { to: '/figures', label: 'Personnalités', icon: 'icon-user' },
      { to: '/blog', label: 'Carnet de savoirs', icon: 'icon-file' },
      { to: '/proverbs', label: 'Proverbes', icon: 'icon-quote' },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/sources', label: 'Sources & provenance', icon: 'icon-file' },
      { to: '/communities', label: 'Cercles de mémoire', icon: 'icon-users' },
      { to: '/quizzes', label: 'Apprendre', icon: 'icon-help-circle' },
      { to: '/shop', label: 'Créateurs & objets', icon: 'icon-shopping' },
    ],
  },
]

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.getItemCount())
  const { settings, fetchSettings } = useSettingsStore()
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const resourcesRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setIsResourcesOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node
      if (resourcesRef.current && !resourcesRef.current.contains(target)) {
        setIsResourcesOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  const platformName = settings?.platformName || 'MonBaobab'
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`)
  const resourceIsActive = resourceGroups
    .flatMap((group) => group.items)
    .some((item) => isActive(item.to))

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const renderLink = (item: NavigationItem, mobile = false) => (
    <Link
      key={item.to}
      to={item.to}
      className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
      onClick={() => setIsMenuOpen(false)}
    >
      <span className={item.icon} aria-hidden="true" />
      {!mobile && <span className="nav-link-text">{item.label}</span>}
      {mobile && <span>{item.label}</span>}
    </Link>
  )

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo" aria-label={`${platformName}, accueil`}>
          <img src="/LogoFiles/Fichier%207.svg" alt={platformName} className="logo-image" />
        </Link>

        {/* Navigation desktop */}
        <nav className="header-nav-desktop" aria-label="Navigation principale">
          {primaryItems.map((item) => renderLink(item))}

          <div className="nav-secondary" ref={resourcesRef}>
            <button
              type="button"
              className={`nav-more-btn ${isResourcesOpen || resourceIsActive ? 'active' : ''}`}
              onClick={() => setIsResourcesOpen((open) => !open)}
              aria-expanded={isResourcesOpen}
            >
              <span className="icon-grid" aria-hidden="true" />
              <span className="nav-link-text">Ressources</span>
              <span
                className={`icon-arrow-down ${isResourcesOpen ? 'rotated' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div className={`nav-dropdown ${isResourcesOpen ? 'active' : ''}`}>
              {resourceGroups.map((group) => (
                <div className="nav-dropdown-group" key={group.title}>
                  <span className="nav-dropdown-label">{group.title}</span>
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`nav-dropdown-item ${isActive(item.to) ? 'active' : ''}`}
                      onClick={() => setIsResourcesOpen(false)}
                    >
                      <span className={item.icon} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Actions du header */}
        <div className="header-actions">
          {/* Recherche */}
          <button
            type="button"
            className="action-btn search-toggle-btn"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-label="Rechercher"
          >
            <span className="icon-search" aria-hidden="true" />
          </button>

          {/* Theme Toggle
          <div className="action-btn theme-toggle-wrapper">
            <ThemeToggle />
          </div> */}

          {/* Panier */}
          <Link
            to="/cart"
            className="action-btn cart-link"
            aria-label={`Panier${itemCount ? ` (${itemCount} articles)` : ''}`}
          >
            <span className="icon-shopping" aria-hidden="true" />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* Authentification */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu-btn"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                aria-expanded={isUserMenuOpen}
              >
                <span className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="icon-arrow-down" aria-hidden="true" />
              </button>

              <div className={`user-dropdown ${isUserMenuOpen ? 'active' : ''}`}>
                <div className="user-dropdown-header">
                  <div className="user-info">
                    <span className="user-name">{user?.name || 'Utilisateur'}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                </div>
                <div className="user-dropdown-menu">
                  <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="icon-user" aria-hidden="true" /> Mon espace
                  </Link>
                  <Link to="/communities" onClick={() => setIsUserMenuOpen(false)}>
                    <span className="icon-users" aria-hidden="true" /> Mes cercles
                  </Link>
                  <Link
                    to="/cart"
                    className="user-dropdown-cart"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="icon-shopping" aria-hidden="true" /> Panier
                    {itemCount > 0 && <strong>{itemCount}</strong>}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="icon-settings" aria-hidden="true" /> Administration
                    </Link>
                  )}
                  <div className="user-dropdown-divider" />
                  <button type="button" className="logout-btn" onClick={handleLogout}>
                    <span className="icon-logout" aria-hidden="true" /> Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link auth-link-button">
                <LogIn className="auth-icon" size={18} strokeWidth={2.25} aria-hidden="true" />
                <span className="auth-link-text">Se connecter</span>
              </Link>
              <Link to="/register" className="auth-link auth-link-primary">
                <UserPlus className="auth-icon" size={18} strokeWidth={2.25} aria-hidden="true" />
                <span className="auth-link-text">Rejoindre</span>
              </Link>
            </div>
          )}

          {/* Menu hamburger */}
          <button
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Panneau de recherche */}
      {isSearchOpen && (
        <div className="header-search-expanded">
          <div className="advanced-search-container">
            <AdvancedSearch />
          </div>
          <button
            type="button"
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Fermer la recherche"
          >
            ✕
          </button>
        </div>
      )}

      {/* Menu mobile */}
      <nav
        className={`header-nav-mobile ${isMenuOpen ? 'active' : ''}`}
        aria-label="Navigation mobile"
      >
        <div className="mobile-nav-content">
          <div className="mobile-menu-head">
            <strong>{platformName}</strong>
            <span>Comprendre l'Afrique, ensemble</span>
          </div>

          <div className="mobile-nav-quick">
            {primaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-quick-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={item.icon} aria-hidden="true" />
                <strong>{item.label}</strong>
                <small>Explorer</small>
              </Link>
            ))}
          </div>

          {resourceGroups.map((group) => (
            <div className="mobile-nav-group" key={group.title}>
              <div className="mobile-nav-section-label">{group.title}</div>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`mobile-nav-link ${isActive(item.to) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
    </header>
  )
}
