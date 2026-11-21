import type { ReactNode } from 'react'

interface RubriqueSectionProps {
  id: string
  title: string
  subtitle?: string
  className?: string
  /** Affiché à la place du contenu quand la liste est vide */
  emptyLabel?: string
  isEmpty?: boolean
  children: ReactNode
}

/** Section titrée des pages Récits et Repères (styles dans pages/Rubriques.css). */
export const RubriqueSection = ({ id, title, subtitle, className, emptyLabel, isEmpty, children }: RubriqueSectionProps) => (
  <section className={`mbr-section${className ? ` ${className}` : ''}`} aria-labelledby={id}>
    <div className="mbr-section-head">
      <div>
        <h2 id={id}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
    {isEmpty ? <p className="mbr-empty">{emptyLabel}</p> : children}
  </section>
)
