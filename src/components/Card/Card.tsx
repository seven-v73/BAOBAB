import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outline' | 'glass'
  padding?: 'none' | 'small' | 'medium' | 'large'
  onClick?: () => void
  hoverable?: boolean
  clickable?: boolean
  as?: 'div' | 'section' | 'article' | 'aside'
  id?: string
}

export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  onClick,
  hoverable = true,
  clickable = false,
  as: Component = 'div',
  id,
}: CardProps) => {
  const isInteractive = clickable || !!onClick

  return (
    <Component
      id={id}
      className={`
        card
        card-${variant}
        card-padding-${padding}
        ${isInteractive ? 'card-interactive' : ''}
        ${hoverable ? 'card-hoverable' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? 'Cliquer pour interagir' : undefined}
    >
      {children}
    </Component>
  )
}