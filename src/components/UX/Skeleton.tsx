import './Skeleton.css'

interface SkeletonProps {
  variant?: 'cards' | 'table' | 'dashboard'
  count?: number
  label?: string
}

export const Skeleton = ({ variant = 'cards', count = 6, label = 'Chargement du contenu' }: SkeletonProps) => {
  if (variant === 'table') {
    return (
      <div className="ux-skeleton ux-skeleton-table" aria-label={label} aria-live="polite">
        {Array.from({ length: count }).map((_, index) => (
          <div className="ux-skeleton-row" key={index}>
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'dashboard') {
    return (
      <div className="ux-skeleton ux-skeleton-dashboard" aria-label={label} aria-live="polite">
        <div className="ux-skeleton-hero" />
        <div className="ux-skeleton-stats">
          {Array.from({ length: 4 }).map((_, index) => <span key={index} />)}
        </div>
        <div className="ux-skeleton-panel" />
      </div>
    )
  }

  return (
    <div className="ux-skeleton ux-skeleton-cards" aria-label={label} aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <article className="ux-skeleton-card" key={index}>
          <span className="ux-skeleton-media" />
          <span className="ux-skeleton-line wide" />
          <span className="ux-skeleton-line" />
          <span className="ux-skeleton-line short" />
        </article>
      ))}
    </div>
  )
}
