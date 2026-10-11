import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  fullWidth?: boolean
}

export const Layout = ({ children, fullWidth = false }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <main className={`layout-main${fullWidth ? ' layout-main--full' : ''}`}>{children}</main>
      <Footer />
    </div>
  )
}
