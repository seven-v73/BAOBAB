import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  /** Contenu sur toute la largeur de l'écran, sans marges de page */
  fullWidth?: boolean
  /** Barre de navigation posée sur le contenu (hero verte de l'accueil) */
  overlayHeader?: boolean
}

export const Layout = ({ children, fullWidth = false, overlayHeader = false }: LayoutProps) => {
  return (
    <div className="layout">
      <Header overlay={overlayHeader} />
      <main className={`layout-main${fullWidth ? ' layout-main--full' : ''}`}>{children}</main>
      <Footer />
    </div>
  )
}
