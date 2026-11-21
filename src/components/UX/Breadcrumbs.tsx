import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import './Breadcrumbs.css'

interface BreadcrumbItem {
  label: string
  to?: string
}

/** Fil d'Ariane de la maquette : étapes séparées par un chevron, la dernière en vert forêt plein. */
export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="ux-breadcrumbs" aria-label="Fil d’Ariane">
    {items.map((item, index) => (
      <Fragment key={`${item.label}-${index}`}>
        {index > 0 && <ChevronRight size={14} strokeWidth={1.4} aria-hidden="true" />}
        {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
      </Fragment>
    ))}
  </nav>
)
