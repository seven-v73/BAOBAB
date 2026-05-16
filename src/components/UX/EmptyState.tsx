import type { ReactNode } from 'react'
import { Compass } from 'lucide-react'
import './EmptyState.css'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="ux-empty-state">
    <div className="ux-empty-icon" aria-hidden="true">
      <Compass size={22} />
    </div>
    <div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="ux-empty-action">{action}</div>}
  </div>
)
