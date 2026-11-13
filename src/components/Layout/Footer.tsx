import { Link, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import { navigation } from './Header'
import './Footer.css'

export const Footer = () => {
  const location = useLocation()
  const settings = useSettingsStore((state) => state.settings)
  const platformName = settings?.platformName || 'MonBaobab'
  const year = new Date().getFullYear()

  // Pages d'authentification : pas de pied de page pour garder le focus sur le formulaire
  if (['/login', '/register'].includes(location.pathname)) return null

  const columns = navigation.filter((entry) => entry.kind === 'menu')

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-logo" role="img" aria-label={platformName} />
          <p>
            Découvrir, valoriser et transmettre les histoires, cultures et savoirs de l’Afrique —
            avec celles et ceux qui les font vivre.
          </p>
          <Link to="/contribute" className="btn btn-outline">
            Partager une histoire
          </Link>
        </div>

        {columns.map((column) =>
          column.kind === 'menu' ? (
            <nav key={column.label} className="site-footer__col" aria-label={column.label}>
              <h2>{column.label}</h2>
              <ul>
                {column.items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null,
        )}

        <nav className="site-footer__col" aria-label="Plus">
          <h2>Plus</h2>
          <ul>
            <li><Link to="/quizzes">Quiz</Link></li>
            <li><Link to="/shop">Boutique</Link></li>
            <li><Link to="/search">Recherche</Link></li>
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p>
          © {year} {platformName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
