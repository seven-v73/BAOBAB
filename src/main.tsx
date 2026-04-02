import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

// Initialiser le thème avant le rendu pour éviter le flash
const initTheme = () => {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.state?.theme) {
        document.documentElement.setAttribute('data-theme', parsed.state.theme)
        return
      }
    } catch (e) {
      // Ignore
    }
  }
  // Thème par défaut
  document.documentElement.setAttribute('data-theme', 'dark')
}

initTheme()

// Gestionnaire global pour les promesses non gérées
window.addEventListener('unhandledrejection', (event) => {
  // Ignorer les erreurs liées aux extensions de navigateur
  const errorMessage = event.reason?.message || String(event.reason || '')
  const errorSource = event.reason?.stack || ''
  
  if (
    errorMessage.includes('message channel closed') ||
    errorMessage.includes('Extension context invalidated') ||
    errorMessage.includes('Receiving end does not exist') ||
    errorMessage.includes('asynchronous response') ||
    errorSource.includes('inspector.') ||
    errorSource.includes('extension://') ||
    errorSource.includes('chrome-extension://')
  ) {
    // Ces erreurs proviennent généralement d'extensions de navigateur
    event.preventDefault()
    return
  }
  
  // Logger les autres erreurs non gérées
  console.error('Promesse non gérée:', event.reason)
  event.preventDefault()
})

// Gestionnaire global pour les erreurs non capturées
window.addEventListener('error', (event) => {
  // Ignorer les erreurs liées aux extensions
  const errorSource = event.filename || event.target?.src || ''
  
  if (
    event.message?.includes('message channel closed') ||
    event.message?.includes('Extension context invalidated') ||
    event.message?.includes('Receiving end does not exist') ||
    event.message?.includes('asynchronous response') ||
    errorSource.includes('inspector.') ||
    errorSource.includes('extension://') ||
    errorSource.includes('chrome-extension://') ||
    errorSource.includes('moz-extension://')
  ) {
    event.preventDefault()
    return
  }
  
  console.error('Erreur non capturée:', event.error)
})

// Supprimer les avertissements de dépréciation pour les extensions
// Note: Ces avertissements proviennent d'extensions de navigateur (React DevTools, etc.)
// et ne peuvent pas être supprimés directement, mais nous les ignorons dans la console
if (typeof console !== 'undefined' && console.warn) {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    // Filtrer les avertissements de dépréciation des extensions
    if (
      message.includes('Unload event listeners are deprecated') ||
      message.includes('beforeunload') ||
      (message.includes('deprecated') && message.includes('inspector'))
    ) {
      return // Ignorer silencieusement
    }
    originalWarn.apply(console, args)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
