import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../Layout/Layout'
import './Space.css'

/*
 * Coquille commune des espaces connectés : Mon espace, Mes cercles, Administration.
 * - Barre latérale vert profond (#174123) au motif topographique de la charte, identité, navigation groupée.
 * - En-tête de page au motif topographique vert, titre, actions.
 * - Sur mobile, la navigation devient une barre de pastilles défilante, collée sous l'en-tête du site.
 */

export interface SpaceNavItem {
  id: string
  label: string
  icon: ReactNode
  badge?: number | string
  /** Lien de navigation (sinon, sélection d'une section via onSelect) */
  to?: string
}

export interface SpaceNavGroup {
  label: string
  items: SpaceNavItem[]
}

interface SpaceShellProps {
  variant: 'member' | 'circle' | 'admin'
  spaceLabel: string
  identity: { name: string; detail?: string; badge?: string; avatar?: string }
  nav: SpaceNavGroup[]
  active: string
  onSelect?: (id: string) => void
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  /** Remplace l'en-tête standard (ex. bannière d'un cercle) */
  hero?: ReactNode
  sidebarFooter?: ReactNode
  children: ReactNode
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'M'

export const SpaceShell = ({
  variant,
  spaceLabel,
  identity,
  nav,
  active,
  onSelect,
  eyebrow,
  title,
  subtitle,
  actions,
  hero,
  sidebarFooter,
  children,
}: SpaceShellProps) => {
  const mainRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)

  // Changement de section : on remonte en haut du contenu et on garde la pastille active visible (mobile)
  useEffect(() => {
    const top = (mainRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 80
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top) })
    chipsRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [active])

  const renderItem = (item: SpaceNavItem, compact = false) => {
    const content = (
      <>
        <span className="space-nav__icon">{item.icon}</span>
        <span className="space-nav__label">{item.label}</span>
        {item.badge !== undefined && item.badge !== 0 && item.badge !== '' && <span className="space-nav__badge">{item.badge}</span>}
      </>
    )
    const className = `${compact ? 'space-chip' : 'space-nav__item'}${active === item.id ? ' is-active' : ''}`
    return item.to ? (
      <Link key={item.id} to={item.to} className={className} aria-current={active === item.id ? 'page' : undefined}>
        {content}
      </Link>
    ) : (
      <button key={item.id} type="button" className={className} aria-current={active === item.id ? 'page' : undefined} onClick={() => onSelect?.(item.id)}>
        {content}
      </button>
    )
  }

  return (
    <Layout fullWidth hideFooter>
      <div className={`space space--${variant}`}>
        <aside className="space-side" aria-label={spaceLabel}>
          <div className="space-side__inner">
            <div className="space-side__brand">
              <span className="space-side__label">{spaceLabel}</span>
            </div>

            <div className="space-id">
              <span className="space-id__avatar" aria-hidden="true">
                {identity.avatar ? <img src={identity.avatar} alt="" /> : initials(identity.name)}
              </span>
              <span className="space-id__text">
                <strong>{identity.name}</strong>
                {identity.detail && <small>{identity.detail}</small>}
              </span>
              {identity.badge && <span className="space-id__badge">{identity.badge}</span>}
            </div>

            <nav className="space-nav" aria-label={`Navigation — ${spaceLabel}`}>
              {nav.map((group) => (
                <div key={group.label} className="space-nav__group">
                  <span className="space-nav__heading">{group.label}</span>
                  {group.items.map((item) => renderItem(item))}
                </div>
              ))}
            </nav>

            {sidebarFooter && <div className="space-side__foot">{sidebarFooter}</div>}
          </div>
        </aside>

        {/* Mobile : navigation en pastilles */}
        <div className="space-chips" ref={chipsRef} role="navigation" aria-label={`Navigation — ${spaceLabel}`}>
          {nav.flatMap((group) => group.items).map((item) => renderItem(item, true))}
        </div>

        <div className="space-main" ref={mainRef}>
          {hero || (
            <header className="space-head">
              <div className="space-head__text">
                {eyebrow && <p className="space-head__eyebrow">{eyebrow}</p>}
                <h1>{title}</h1>
                {subtitle && <p className="space-head__subtitle">{subtitle}</p>}
              </div>
              {actions && <div className="space-head__actions">{actions}</div>}
            </header>
          )}
          <div className="space-body" key={active}>
            {children}
          </div>
        </div>
      </div>
    </Layout>
  )
}

/** Tuile de statistique de la charte (icône dans un médaillon) */
export const SpaceStat = ({ icon, value, label, hint, onClick }: { icon: ReactNode; value: ReactNode; label: string; hint?: string; onClick?: () => void }) => {
  const body = (
    <>
      <span className="space-stat__icon">{icon}</span>
      <span className="space-stat__text">
        <strong>{value}</strong>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </span>
    </>
  )
  return onClick ? (
    <button type="button" className="space-stat is-action" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="space-stat">{body}</div>
  )
}

/** Carte d'action rapide */
export const SpaceAction = ({ icon, title, text, to, onClick }: { icon: ReactNode; title: string; text: string; to?: string; onClick?: () => void }) => {
  const body = (
    <>
      <span className="space-action__icon">{icon}</span>
      <span className="space-action__text">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>
      <span className="space-action__arrow" aria-hidden="true">
        →
      </span>
    </>
  )
  return to ? (
    <Link to={to} className="space-action">
      {body}
    </Link>
  ) : (
    <button type="button" className="space-action" onClick={onClick}>
      {body}
    </button>
  )
}
