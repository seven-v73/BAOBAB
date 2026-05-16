import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import './Footer.css'

export const Footer = () => {
  const location = useLocation()
  const { settings, fetchSettings } = useSettingsStore()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const platformName = settings?.platformName || 'MonBaobab'

  // Ne pas afficher le footer sur certaines pages
  const hideFooter = ['/login', '/register'].includes(location.pathname)

  if (hideFooter) {
    return null
  }

  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {currentYear} {platformName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
