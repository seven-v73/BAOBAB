import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  /** Les pages éditoriales gèrent elles-mêmes leurs marges et sections pleine largeur. */
  fullWidth?: boolean
}

export const Layout = ({ children, fullWidth = false }: LayoutProps) => (
  <div className="layout">
    <Header />
    <main id="contenu" tabIndex={-1} className={`layout-main${fullWidth ? ' layout-main--full' : ''}`}>
      {children}
    </main>
    <Footer />
  </div>
)
