import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Globe2,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  PenLine,
  Settings,
  Inbox,
  Users,
  UserRound,
  X,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { usePlatformName } from '../hooks/usePlatformName'
import { blogService, contributionService, ficheService } from '../services/api'
import { listFrom } from '../utils'
import { AdminStats } from './admin/AdminStats'
import { AdminCountries } from './admin/AdminCountries'
import { AdminBlog } from './admin/AdminBlog'
import { AdminUsers } from './admin/AdminUsers'
import { AdminSettings } from './admin/AdminSettings'
import { AdminTimeline } from './admin/AdminTimeline'
import { AdminFigures } from './admin/AdminFigures'
import { AdminCollections } from './admin/AdminCollections'
import { AdminSources } from './admin/AdminSources'
import { AdminContributions } from './admin/AdminContributions'
import { AdminFiches } from './admin/AdminFiches'
import './Rubriques.css'
import './admin/admin-kit.css'
import './AdminDashboard.css'

// Espace d'administration au langage de la refonte : colonne vert forêt aux courbes de niveau,
// menu groupé par domaine, pastilles « à traiter », barre de titre qui dit à quoi sert chaque section.

type AdminSection = 'overview' | 'fiches' | 'countries' | 'blog' | 'users' | 'settings' | 'timeline' | 'figures' | 'collections' | 'sources' | 'contributions'

interface Item {
  id: AdminSection
  label: string
  icon: LucideIcon
  aide: string
}

const GROUPES: Array<{ titre?: string; items: Item[] }> = [
  {
    items: [{ id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, aide: 'Ce qui attend une action, et la couverture du continent.' }],
  },
  {
    titre: 'Savoirs',
    items: [
      { id: 'fiches', label: 'Base de connaissances', icon: Library, aide: 'Fiches sourcées par pays : relire, valider, publier.' },
      { id: 'countries', label: 'Pays', icon: Globe2, aide: 'Fiches des 55 pays et territoires : repères, culture, mémoire.' },
      { id: 'timeline', label: 'Chronologie', icon: CalendarDays, aide: 'Dates de la rubrique Repères, de l’Antiquité à aujourd’hui.' },
      { id: 'figures', label: 'Personnalités', icon: UserRound, aide: 'Celles et ceux qui ont marqué l’histoire du continent.' },
      { id: 'collections', label: 'Dossiers', icon: Layers, aide: 'Parcours thématiques qui relient dates, personnes et récits.' },
      { id: 'sources', label: 'Sources', icon: BookOpen, aide: 'Bibliothèque de référence : ouvrages, archives, musées.' },
    ],
  },
  {
    titre: 'Récits',
    items: [{ id: 'blog', label: 'Articles', icon: PenLine, aide: 'Articles et témoignages : relecture et publication.' }],
  },
  {
    titre: 'Communauté',
    items: [
      { id: 'contributions', label: 'Contributions', icon: Inbox, aide: 'Propositions des membres : proverbes, sources, corrections.' },
      { id: 'users', label: 'Membres', icon: Users, aide: 'Comptes, rôles et accès.' },
    ],
  },
  {
    titre: 'Réglages',
    items: [{ id: 'settings', label: 'Paramètres', icon: Settings, aide: 'Nom de la plateforme, contact, réglages généraux.' }],
  },
]

const ITEMS = GROUPES.flatMap((groupe) => groupe.items)
const SECTIONS = ITEMS.map((item) => item.id)

const initiales = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A'

export const AdminDashboard = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const platformName = usePlatformName()
  const [searchParams, setSearchParams] = useSearchParams()
  const demandee = searchParams.get('section') as AdminSection | null
  const section: AdminSection = demandee && SECTIONS.includes(demandee) ? demandee : 'overview'
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [aTraiter, setATraiter] = useState<Partial<Record<AdminSection, number>>>({})

  // Pastilles « à traiter » : fiches en revue, contributions proposées, articles en relecture
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return
    let cancelled = false
    Promise.allSettled([
      ficheService.getStats(),
      contributionService.getAll({ status: 'proposed', limit: 1 }),
      blogService.getAll({ status: 'pending' }),
    ]).then(([fiches, contributions, articles]) => {
      if (cancelled) return
      setATraiter({
        fiches: fiches.status === 'fulfilled' ? fiches.value.data?.statuts?.en_revue || 0 : 0,
        contributions: contributions.status === 'fulfilled' ? contributions.value.data?.pagination?.total ?? listFrom(contributions.value.data, 'contributions').length : 0,
        blog: articles.status === 'fulfilled' ? listFrom(articles.value.data, 'blogs').length : 0,
      })
    })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.role, section])

  if (!isAuthenticated || user?.role !== 'admin') return null

  const courant = ITEMS.find((item) => item.id === section) ?? ITEMS[0]
  const aller = (id: AdminSection) => {
    setSearchParams(id === 'overview' ? {} : { section: id })
    setMenuOuvert(false)
    window.scrollTo(0, 0)
  }

  const renderContent = () => {
    switch (section) {
      case 'fiches':
        return <AdminFiches />
      case 'countries':
        return <AdminCountries />
      case 'blog':
        return <AdminBlog />
      case 'timeline':
        return <AdminTimeline />
      case 'figures':
        return <AdminFigures />
      case 'collections':
        return <AdminCollections />
      case 'sources':
        return <AdminSources />
      case 'contributions':
        return <AdminContributions />
      case 'users':
        return <AdminUsers />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminStats aTraiter={aTraiter} onNavigate={(id) => aller(id as AdminSection)} />
    }
  }

  return (
    <div className="mba">
      <aside className={`mba-side${menuOuvert ? ' is-open' : ''}`} aria-label="Administration">
        <div className="mba-side-head">
          <Link to="/" className="mba-logo" aria-label={`${platformName}, retour au site`}>
            <img src="/Logo/Fichier%207.svg" alt="" width="132" height="44" />
          </Link>
          <span className="mba-role">Administration</span>
          <button type="button" className="mba-fermer" onClick={() => setMenuOuvert(false)} aria-label="Fermer le menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="mba-nav">
          {GROUPES.map((groupe, index) => (
            <div key={groupe.titre ?? index} className="mba-groupe">
              {groupe.titre && <p className="mba-groupe-titre">{groupe.titre}</p>}
              {groupe.items.map((item) => {
                const Icon = item.icon
                const compte = aTraiter[item.id] || 0
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mba-lien${section === item.id ? ' is-active' : ''}`}
                    aria-current={section === item.id ? 'page' : undefined}
                    onClick={() => aller(item.id)}
                  >
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                    {compte > 0 && (
                      <span className="mba-pastille" aria-label={`${compte} à traiter`}>
                        {compte > 999 ? '999+' : compte}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="mba-moi">
          <span className="mba-avatar" aria-hidden="true">
            {initiales(user?.name)}
          </span>
          <span className="mba-moi-texte">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </span>
          <button type="button" className="mba-icone" onClick={() => logout()} aria-label="Se déconnecter" title="Se déconnecter">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
      {menuOuvert && <button type="button" className="mba-voile" aria-label="Fermer le menu" onClick={() => setMenuOuvert(false)} />}

      <div className="mba-main">
        <header className="mba-top">
          <button type="button" className="mba-burger" onClick={() => setMenuOuvert(true)} aria-label="Ouvrir le menu">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="mba-titre">
            <p className="mba-fil">Administration · {platformName}</p>
            <h1>{courant.label}</h1>
            <p className="mba-aide">{courant.aide}</p>
          </div>
          <Link to="/" className="mbr-button mbr-button--ghost mba-site">
            Voir le site <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </header>
        <main className="mba-contenu">{renderContent()}</main>
      </div>
    </div>
  )
}
