import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  Clock3,
  Feather,
  FileText,
  GraduationCap,
  Layers,
  LogOut,
  Map as MapIcon,
  Menu,
  Moon,
  PenLine,
  Quote,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  User,
  UsersRound,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useThemeStore } from '../../stores/themeStore'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>

type NavItem = { to: string; label: string; description: string; icon: IconType }
type NavEntry =
  | { kind: 'link'; label: string; to: string }
  | { kind: 'menu'; label: string; items: NavItem[] }

export const navigation: NavEntry[] = [
  {
    kind: 'menu',
    label: 'Explorer',
    items: [
      { to: '/map', label: 'Carte & pays', description: 'Tous les pays, leurs régions et leurs cultures', icon: MapIcon },
      { to: '/timeline', label: 'Chronologie', description: 'Les grandes périodes de l’histoire africaine', icon: Clock3 },
      { to: '/figures', label: 'Personnalités', description: 'Celles et ceux qui ont marqué leur époque', icon: User },
      { to: '/collections', label: 'Collections', description: 'Objets, arts et patrimoines thématiques', icon: Layers },
    ],
  },
  {
    kind: 'menu',
    label: 'Lire',
    items: [
      { to: '/stories', label: 'Récits', description: 'Contes, mémoires et histoires transmises', icon: BookOpen },
      { to: '/blog', label: 'Carnet de savoirs', description: 'Articles, analyses et repères', icon: FileText },
      { to: '/proverbs', label: 'Proverbes', description: 'La sagesse des langues africaines', icon: Quote },
    ],
  },
  { kind: 'link', label: 'Apprendre', to: '/quizzes' },
  {
    kind: 'menu',
    label: 'Communauté',
    items: [
      { to: '/communities', label: 'Cercles', description: 'Échanger autour d’un pays ou d’un thème', icon: UsersRound },
      { to: '/blog/ecrire', label: 'Écrire dans le carnet', description: 'Transmettre un savoir ou une expérience', icon: Feather },
      { to: '/contribute', label: 'Contribuer', description: 'Proposer un lieu, une correction, une source', icon: PenLine },
      { to: '/sources', label: 'Sources & provenance', description: 'D’où viennent nos contenus', icon: GraduationCap },
    ],
  },
  { kind: 'link', label: 'Boutique', to: '/shop' },
]

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.getItemCount())
  const settings = useSettingsStore((state) => state.settings)
  const { theme, toggleTheme } = useThemeStore()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const platformName = settings?.platformName || 'MonBaobab'
  const isDark = theme === 'dark'

  // Une seule entrée active : la plus précise (ex. /blog/ecrire active « Écrire », pas « Carnet de savoirs »)
  const allPaths = navigation.flatMap((entry) => (entry.kind === 'link' ? [entry.to] : entry.items.map((item) => item.to)))
  const matches = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`)
  const bestMatch = allPaths.filter(matches).sort((a, b) => b.length - a.length)[0]
  const isActive = (to: string) => to === bestMatch
  const entryIsActive = (entry: NavEntry) =>
    entry.kind === 'link' ? isActive(entry.to) : entry.items.some((item) => isActive(item.to))

  // Fermer tous les menus à chaque navigation
  useEffect(() => {
    setOpenMenu(null)
    setIsDrawerOpen(false)
    setIsSearchOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Clic extérieur + touche Échap
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (navRef.current && !navRef.current.contains(target)) setOpenMenu(null)
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenMenu(null)
      setIsUserMenuOpen(false)
      setIsSearchOpen(false)
      setIsDrawerOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // Bloquer le défilement de la page quand le tiroir mobile est ouvert
  useEffect(() => {
    if (!isDrawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [isDrawerOpen])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    setIsDrawerOpen(false)
    navigate('/')
  }

  const toggleSearch = () => {
    setIsSearchOpen((open) => !open)
    setOpenMenu(null)
  }

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__bar">
          <Link to="/" className="site-header__logo" aria-label={`${platformName}, accueil`}>
            <span className="site-logo" role="img" aria-label={platformName} />
          </Link>

          <nav className="site-nav" aria-label="Navigation principale" ref={navRef}>
            <ul className="site-nav__list">
              {navigation.map((entry) => (
                <li key={entry.label} className="site-nav__entry">
                  {entry.kind === 'link' ? (
                    <Link
                      to={entry.to}
                      className={`site-nav__link${entryIsActive(entry) ? ' is-active' : ''}`}
                      aria-current={isActive(entry.to) ? 'page' : undefined}
                    >
                      {entry.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`site-nav__link${entryIsActive(entry) ? ' is-active' : ''}`}
                        aria-expanded={openMenu === entry.label}
                        aria-controls={`menu-${entry.label}`}
                        onClick={() => setOpenMenu((current) => (current === entry.label ? null : entry.label))}
                      >
                        {entry.label}
                        <ChevronDown size={16} aria-hidden={true} className="site-nav__chevron" />
                      </button>
                      <div
                        id={`menu-${entry.label}`}
                        className={`site-nav__panel${openMenu === entry.label ? ' is-open' : ''}`}
                      >
                        {entry.items.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`nav-item${isActive(item.to) ? ' is-active' : ''}`}
                            aria-current={isActive(item.to) ? 'page' : undefined}
                          >
                            <span className="nav-item__icon">
                              <item.icon size={18} strokeWidth={2} aria-hidden={true} />
                            </span>
                            <span>
                              <strong>{item.label}</strong>
                              <small>{item.description}</small>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className={`hdr-btn${isSearchOpen ? ' is-active' : ''}`}
              onClick={toggleSearch}
              aria-label="Rechercher"
              aria-expanded={isSearchOpen}
            >
              <Search size={20} aria-hidden={true} />
            </button>

            <button
              type="button"
              className="hdr-btn hide-mobile"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun size={20} aria-hidden={true} /> : <Moon size={20} aria-hidden={true} />}
            </button>

            <Link
              to="/cart"
              className="hdr-btn"
              aria-label={itemCount ? `Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}` : 'Panier'}
            >
              <ShoppingBag size={20} aria-hidden={true} />
              {itemCount > 0 && <span className="hdr-btn__badge">{itemCount > 99 ? '99+' : itemCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu hide-mobile" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-menu__trigger"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="Mon compte"
                >
                  <span className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  <ChevronDown size={16} aria-hidden={true} />
                </button>
                <div className={`user-menu__panel${isUserMenuOpen ? ' is-open' : ''}`}>
                  <div className="user-menu__who">
                    <strong>{user?.name || 'Utilisateur'}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/dashboard">
                    <User size={18} aria-hidden={true} /> Mon espace
                  </Link>
                  <Link to="/communities">
                    <UsersRound size={18} aria-hidden={true} /> Mes cercles
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <Settings size={18} aria-hidden={true} /> Administration
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={18} aria-hidden={true} /> Se déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="site-header__auth hide-mobile">
                <Link to="/login" className="btn btn-ghost">
                  Se connecter
                </Link>
                <Link to="/register" className="btn">
                  Rejoindre
                </Link>
              </div>
            )}

            <button
              type="button"
              className="hdr-btn show-mobile"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={22} aria-hidden={true} />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="site-search" role="search">
            <div className="site-search__inner">
              <AdvancedSearch />
              <button type="button" className="hdr-btn" onClick={() => setIsSearchOpen(false)} aria-label="Fermer la recherche">
                <X size={20} aria-hidden={true} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tiroir mobile */}
      <div
        className={`drawer-backdrop${isDrawerOpen ? ' is-open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-drawer"
        ref={drawerRef}
        className={`drawer${isDrawerOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isDrawerOpen}
        inert={!isDrawerOpen ? true : undefined}
      >
        <div className="drawer__head">
          <span className="site-logo" role="img" aria-label={platformName} />
          <button type="button" className="hdr-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Fermer le menu">
            <X size={22} aria-hidden={true} />
          </button>
        </div>

        <div className="drawer__body">
          {isAuthenticated ? (
            <div className="drawer__account">
              <span className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              <div>
                <strong>{user?.name || 'Utilisateur'}</strong>
                <Link to="/dashboard">Mon espace</Link>
              </div>
            </div>
          ) : (
            <div className="drawer__cta">
              <Link to="/register" className="btn btn-full-width">
                Rejoindre MonBaobab
              </Link>
              <Link to="/login" className="btn btn-outline btn-full-width">
                Se connecter
              </Link>
            </div>
          )}

          {navigation.map((entry) =>
            entry.kind === 'link' ? (
              <Link
                key={entry.label}
                to={entry.to}
                className={`drawer__single${isActive(entry.to) ? ' is-active' : ''}`}
              >
                {entry.label}
              </Link>
            ) : (
              <section key={entry.label} className="drawer__group">
                <h2>{entry.label}</h2>
                {entry.items.map((item) => (
                  <Link key={item.to} to={item.to} className={`drawer__link${isActive(item.to) ? ' is-active' : ''}`}>
                    <item.icon size={18} aria-hidden={true} />
                    {item.label}
                  </Link>
                ))}
              </section>
            ),
          )}
        </div>

        <div className="drawer__foot">
          <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
            {isDark ? <Sun size={18} aria-hidden={true} /> : <Moon size={18} aria-hidden={true} />}
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </button>
          {isAuthenticated && (
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              <LogOut size={18} aria-hidden={true} /> Se déconnecter
            </button>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-ghost">
              <Settings size={18} aria-hidden={true} /> Admin
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
