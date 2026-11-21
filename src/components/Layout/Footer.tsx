import { Link, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import { MARK_PATH, MARK_VIEWBOX } from '../../data/brandMark'
import './Footer.css'

// Pied de page d'après la maquette Figma (« Pied de page », 11:178).
const COLUMNS = [
  {
    title: 'Naviguer',
    links: [
      { to: '/map', label: 'Explorer' },
      { to: '/recits', label: 'Récits' },
      { to: '/reperes', label: 'Repères' },
      { to: '/contribute', label: 'Contribuer' },
    ],
  },
  {
    title: 'Territoires',
    links: [
      { to: '/country/bf', label: 'Burkina Faso' },
      { to: '/country/ci', label: 'Côte d’Ivoire' },
      { to: '/country/cv', label: 'Cap-Vert' },
    ],
  },
  {
    title: 'MonBaobab',
    links: [
      { to: '/#mbh-team', label: 'À propos' },
      { to: '/#mbh-manifesto', label: 'Manifeste' },
    ],
  },
]

export const Footer = () => {
  const location = useLocation()
  const { settings } = useSettingsStore()
  const platformName = settings?.platformName || 'MonBaobab'

  if (['/login', '/register'].includes(location.pathname)) return null

  return (
    <footer className="mbf">
      <div className="mbf-card">
        <svg className="mbf-watermark" viewBox={MARK_VIEWBOX} aria-hidden="true">
          <path d={MARK_PATH} />
        </svg>
        <div className="mbf-top">
          <div className="mbf-brand">
            <img src="/Logo/Fichier%207.svg" alt={platformName} width="144" height="48" />
            <p>L’Afrique à découvrir autrement.</p>
          </div>
          <nav className="mbf-columns" aria-label="Pied de page">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="mbf-title">{column.title}</p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                  {column.title === 'MonBaobab' && settings?.contactEmail && (
                    <li>
                      <a href={`mailto:${settings.contactEmail}`}>Contact</a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mbf-bottom">
          <p>© {new Date().getFullYear()} {platformName}. Une plateforme culturelle pour explorer, comprendre et transmettre.</p>
          <p>Mentions légales · Confidentialité</p>
        </div>
      </div>
    </footer>
  )
}
