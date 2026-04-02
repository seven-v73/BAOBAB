import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

