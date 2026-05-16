import { Link } from 'react-router-dom'
import './Breadcrumbs.css'

interface BreadcrumbItem {
  label: string
  to?: string
}

export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="ux-breadcrumbs" aria-label="Fil d'Ariane">
    <Link to="/">Accueil</Link>
    {items.map((item) => (
      <span key={`${item.label}-${item.to || 'current'}`}>
        <span aria-hidden="true">/</span>
        {item.to ? <Link to={item.to}>{item.label}</Link> : <strong>{item.label}</strong>}
      </span>
    ))}
  </nav>
)
