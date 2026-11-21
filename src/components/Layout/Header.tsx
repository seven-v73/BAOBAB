import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, Search, Settings, X } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import './Header.css'

gsap.registerPlugin(useGSAP)

// Navigation de la maquette Figma : composant « Navigation/Claire », sa variante posée sur la hero,
// et le cadre « Mobile 390 / Menu ouvert ».
type NavItem = { to: string; label: string; also?: string[] }

// Les 5 entrées de clean.md. `also` : anciennes adresses ou pages de détail rattachées à l'entrée.
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Accueil' },
  { to: '/map', label: 'Explorer', also: ['/country'] },
  { to: '/recits', label: 'Récits', also: ['/blog', '/stories', '/collections'] },
  { to: '/reperes', label: 'Repères', also: ['/timeline', '/figures', '/proverbs'] },
  { to: '/contribute', label: 'Contribuer', also: ['/sources'] },
]

interface HeaderProps {
  /** La barre se pose sur la hero verte de l'accueil : logo blanc, pastilles en verre */
  overlay?: boolean
}

export const Header = ({ overlay = false }: HeaderProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const { settings, fetchSettings } = useSettingsStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const platformName = settings?.platformName || 'MonBaobab'

  /* Menu mobile en trois phases pour pouvoir animer la fermeture :
   * « open » affiche la carte verte, « closing » joue le rabattement avant de retourner à « closed ». */
  const [menuPhase, setMenuPhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const headerRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTl = useRef<gsap.core.Timeline | null>(null)
  const barRect = useRef<DOMRect | null>(null)
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const menuOpen = menuPhase !== 'closed'

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setIsSearchOpen(false)
    setMenuPhase((phase) => (phase === 'closed' ? phase : 'closing'))
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsSearchOpen(false)
      setMenuPhase((phase) => (phase === 'closed' ? phase : 'closing'))
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleMenu = () => {
    if (menuPhase === 'closed') {
      // Mesure avant le rendu de la carte : sert au FLIP qui suit
      barRect.current = barRef.current?.getBoundingClientRect() ?? null
      setMenuPhase('open')
    } else {
      setMenuPhase('closing')
    }
  }

  /* Morphose du menu : la barre reste immobile (FLIP) pendant que la carte verte
   * se déploie et que les liens montent en cascade. Le logo et les pastilles se
   * fondent en CSS ; sans GSAP (mouvement réduit), le CSS bascule directement. */
  useGSAP(
    () => {
      const header = headerRef.current
      const bar = barRef.current
      const menu = menuRef.current
      if (!header || !bar || !menu) return
      const items = Array.from(menu.querySelectorAll('.mbn-menu-link, .mbn-menu-cta, .mbn-menu-signin'))
      menuTl.current?.kill()
      gsap.killTweensOf([header, bar, menu, ...items])

      // FLIP : compense le décalage du passage en carte flottante (inset 8 px).
      // Mesure capturée une fois : l'ouverture et la fermeture la consument à tour de rôle.
      const pendingRect: DOMRect | null = barRect.current
      barRect.current = null
      const flip = { x: 0, y: 0 }
      if (pendingRect) {
        const last = bar.getBoundingClientRect()
        flip.x = pendingRect.left - last.left
        flip.y = pendingRect.top - last.top
      }

      if (reducedMotion) {
        if (menuPhase === 'closing') setMenuPhase('closed')
        return
      }

      if (menuPhase === 'open') {
        menuTl.current = gsap
          .timeline()
          .fromTo(
            header,
            {
              backgroundColor: overlay ? 'rgb(23 65 35 / 0)' : '#f7f6f2',
              borderRadius: '0px',
              boxShadow: '0 24px 64px rgb(17 17 17 / 0)',
            },
            {
              backgroundColor: '#174123',
              borderRadius: '32px',
              boxShadow: '0 24px 64px rgb(17 17 17 / 0.3)',
              duration: 0.5,
              ease: 'power2.out',
            },
            0,
          )
          .from(bar, { ...flip, duration: 0.5, ease: 'power3.out' }, 0)
          .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power3.inOut' }, 0)
          .fromTo(items, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.055, duration: 0.45, ease: 'power2.out' }, 0.14)
      }

      if (menuPhase === 'closing') {
        menuTl.current = gsap
          .timeline({
            onComplete: () => {
              // Mesure avant le retour en flux, pour le FLIP de fermeture
              barRect.current = bar.getBoundingClientRect()
              setMenuPhase('closed')
            },
          })
          .to(items, { y: -16, autoAlpha: 0, stagger: 0.03, duration: 0.2, ease: 'power2.in' }, 0)
          .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.4, ease: 'power3.inOut' }, 0.08)
          .to(
            header,
            {
              backgroundColor: overlay ? 'rgb(23 65 35 / 0)' : '#f7f6f2',
              borderRadius: '0px',
              boxShadow: '0 24px 64px rgb(17 17 17 / 0)',
              duration: 0.4,
              ease: 'power2.in',
            },
            0.1,
          )
      }

      if (menuPhase === 'closed') {
        // Rendu propre au CSS : les styles inline de l'animation partent
        gsap.set([header, menu, ...items], { clearProps: 'all' })
        if (pendingRect) {
          const last = bar.getBoundingClientRect()
          gsap.from(bar, {
            x: pendingRect.left - last.left,
            y: pendingRect.top - last.top,
            duration: 0.45,
            ease: 'power3.out',
          })
        }
      }
    },
    { dependencies: [menuPhase, overlay], scope: headerRef },
  )

  // La loupe s'allonge en champ ; une fois ouvert, le même bouton lance la recherche
  useEffect(() => {
    if (isSearchOpen) searchInput.current?.focus()
  }, [isSearchOpen])

  const closeSearch = () => {
    setIsSearchOpen(false)
    setQuery('')
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    if (!isSearchOpen || !q) {
      setIsSearchOpen(true)
      return
    }
    navigate(`/search?q=${encodeURIComponent(q)}`)
    closeSearch()
  }

  const matches = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`)
  const isActive = (item: NavItem) => matches(item.to) || (item.also ?? []).some(matches)

  // Bouton de droite : « Mon espace » une fois connecté, sinon « Rejoindre » (ou « Explorer l'atlas » sur la hero)
  const cta = isAuthenticated
    ? { to: '/dashboard', label: 'Mon espace' }
    : overlay
      ? { to: '/map', label: 'Explorer l’atlas' }
      : { to: '/register', label: 'Rejoindre' }

  const links = (className: string) =>
    NAV_ITEMS.map((item) => (
      <Link key={item.to} to={item.to} className={className} aria-current={isActive(item) ? 'page' : undefined}>
        {item.label}
        {className === 'mbn-menu-link' && <ArrowRight size={20} aria-hidden="true" />}
      </Link>
    ))

  return (
    <header ref={headerRef} className="mbn" data-overlay={overlay || undefined} data-menu-open={menuOpen || undefined}>
      <div className="mbn-bar" ref={barRef}>
        <Link to="/" className="mbn-logo" aria-label={`${platformName}, accueil`}>
          {/* Les deux versions empilées se fondent l'une dans l'autre (hero, menu ouvert) */}
          <img src="/Logo/Fichier%203.svg" alt="" width="144" height="48" />
          <img src="/Logo/Fichier%207.svg" alt="" width="144" height="48" />
        </Link>

        <nav className="mbn-links" aria-label="Navigation principale">
          {links('mbn-link')}
        </nav>

        <div className="mbn-actions">
          <form
            role="search"
            className="mbn-search"
            data-open={isSearchOpen || undefined}
            onSubmit={submitSearch}
            onBlur={(event) => {
              if (!query.trim() && !event.currentTarget.contains(event.relatedTarget as Node)) closeSearch()
            }}
          >
            <button type="submit" className="mbn-search-btn" aria-label={isSearchOpen ? 'Lancer la recherche' : 'Rechercher'}>
              <Search size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <input
              ref={searchInput}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Un pays, un récit, un proverbe…"
              aria-label="Rechercher sur MonBaobab"
              tabIndex={isSearchOpen ? 0 : -1}
            />
          </form>
          {user?.role === 'admin' && (
            <Link to="/admin" className="mbn-round mbn-desktop" aria-label="Administration">
              <Settings size={20} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          )}
          <Link to={cta.to} className="mbn-cta mbn-desktop">
            {cta.label} {!overlay && <ArrowRight size={18} aria-hidden="true" />}
          </Link>
          <button
            type="button"
            className="mbn-round mbn-mobile"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="mbn-menu"
            onClick={toggleMenu}
          >
            {/* Burger et croix empilés : fondu + rotation d'un état à l'autre */}
            <span className="mbn-toggle-icons" aria-hidden="true">
              <Menu size={20} strokeWidth={1.8} />
              <X size={20} strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </div>

      {/* Toujours monté : GSAP anime l'ouverture et la fermeture, le CSS cache par défaut */}
      <div id="mbn-menu" ref={menuRef} className="mbn-menu">
        <nav
          aria-label="Menu"
          onClick={() => setMenuPhase((phase) => (phase === 'closed' ? phase : 'closing'))}
        >
          {links('mbn-menu-link')}
        </nav>
        <Link to={isAuthenticated ? '/dashboard' : '/map'} className="mbn-menu-cta">
          {isAuthenticated ? 'Mon espace' : 'Explorer l’atlas'} <ArrowRight size={18} aria-hidden="true" />
        </Link>
        {!isAuthenticated && (
          <Link to="/login" className="mbn-menu-signin">
            Se connecter
          </Link>
        )}
      </div>
    </header>
  )
}
