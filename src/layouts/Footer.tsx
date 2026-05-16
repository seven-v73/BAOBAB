import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import './Footer.css'

export const Footer = () => {
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const platformName = settings?.platformName || 'MonBaobab'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>À propos</h4>
          <p>Notre mission est de promouvoir la richesse culturelle et économique de l'Afrique</p>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>contact@baobab.africa</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} {platformName}. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

