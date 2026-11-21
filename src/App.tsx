import { useEffect, lazy, Suspense, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { BlogPostPage } from './pages/BlogPost'
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { Register } from './pages/Register'
// En pause (voir clean.md) : boutique, panier, paiement, commandes, cercles, fil social et quiz.
// Les pages restent dans src/pages, mais elles ne sont plus routées.
import { Sources } from './pages/Sources'
import { Contribute } from './pages/Contribute'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { useSettingsStore } from './stores/settingsStore'
import { useNotifications } from './hooks/useNotifications'
import { NotificationContainer } from './components/Notification/NotificationContainer'
import { AdminRoute } from './components/AdminRoute'
import './App.css'
import './styles/theme-overrides.css'
import './styles/premium-pages.css'
import './styles/contrast-system.css'
import './styles/button-system.css'
import './styles/human-design.css'
import './styles/admin-fixes.css'
import './styles/form-system.css'
import './styles/premium-polish.css'
import './styles/production-ergonomics.css'
import './styles/page-transitions.css'
import './styles/page-limits.css'
import './styles/layout-safety.css'
import './styles/typography-human.css'
import './styles/human-experience.css'
import './styles/monbaobab-header.css'

// Lazy loading pour les pages moins fréquemment utilisées
const BlogAdmin = lazy(() => import('./pages/BlogAdmin').then(module => ({ default: module.BlogAdmin })))
const CountryDetail = lazy(() => import('./pages/CountryDetail').then(module => ({ default: module.CountryDetail })))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const HistoricalFigureDetail = lazy(() => import('./pages/HistoricalFigureDetail').then(module => ({ default: module.HistoricalFigureDetail })))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail').then(module => ({ default: module.CollectionDetail })))
const TimelineDetail = lazy(() => import('./pages/TimelineDetail').then(module => ({ default: module.TimelineDetail })))
const StoryDetail = lazy(() => import('./pages/StoryDetail').then(module => ({ default: module.StoryDetail })))
const Recits = lazy(() => import('./pages/Recits').then(module => ({ default: module.Recits })))
const RecitDetail = lazy(() => import('./pages/RecitDetail').then(module => ({ default: module.RecitDetail })))
const Reperes = lazy(() => import('./pages/Reperes').then(module => ({ default: module.Reperes })))
const MapPage = lazy(() => import('./pages/MapPage').then(module => ({ default: module.MapPage })))
const SearchResults = lazy(() => import('./pages/SearchResults').then(module => ({ default: module.SearchResults })))

// Composant de chargement
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Chargement...
  </div>
)

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const redirect = `${location.pathname}${location.search}`
  return isAuthenticated ? <>{children}</> : <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
}

function App() {
  const { notifications, removeNotification } = useNotifications()
  const { token, fetchMe } = useAuthStore()
  const { theme } = useThemeStore()
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  // Seul le chemin rejoue la transition : un filtre ou un onglet (?type=, ?onglet=) ne remonte pas la page.
  const routeKey = location.pathname

  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Charger les paramètres de la plateforme au démarrage
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Récupérer les données utilisateur au chargement si un token existe
  useEffect(() => {
    if (token) {
      fetchMe().catch(console.error)
    }
  }, [token, fetchMe])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pathChanged = previousPathRef.current !== location.pathname
    const timers: number[] = []
    previousPathRef.current = location.pathname

    if (pathChanged) {
      document.documentElement.classList.add('route-transitioning')
      timers.push(window.setTimeout(() => {
        document.documentElement.classList.remove('route-transitioning')
      }, reduceMotion ? 0 : 520))
    }

    const scrollToHash = (attempt = 0) => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) {
        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        })
        return
      }

      if (attempt < 12) {
        timers.push(window.setTimeout(() => scrollToHash(attempt + 1), 120))
      }
    }

    timers.push(window.setTimeout(() => {
      if (location.hash) {
        scrollToHash()
        return
      }

      if (pathChanged) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }
    }, pathChanged ? 90 : 0))

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [location.pathname, location.search, location.hash])

  return (
    <>
      <div className="page-transition-shell" key={routeKey}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route 
          path="/country/:id" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CountryDetail />
            </Suspense>
          } 
        />
        {/* Récits et Repères remplacent six anciennes listes ; leurs adresses redirigent (clean.md) */}
        <Route
          path="/recits"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Recits />
            </Suspense>
          }
        />
        <Route
          path="/recit/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RecitDetail />
            </Suspense>
          }
        />
        <Route
          path="/reperes"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Reperes />
            </Suspense>
          }
        />
        <Route path="/blog" element={<Navigate to="/recits?type=articles" replace />} />
        <Route path="/stories" element={<Navigate to="/recits?type=histoires" replace />} />
        <Route path="/collections" element={<Navigate to="/recits?type=dossiers" replace />} />
        <Route path="/timeline" element={<Navigate to="/reperes?type=dates" replace />} />
        <Route path="/figures" element={<Navigate to="/reperes?type=personnalites" replace />} />
        <Route path="/proverbs" element={<Navigate to="/reperes?type=proverbes" replace />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route
          path="/timeline/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TimelineDetail />
            </Suspense>
          }
        />
        <Route path="/figures/:id" element={<HistoricalFigureDetail />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route
          path="/stories/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <StoryDetail />
            </Suspense>
          }
        />
        <Route
          path="/map"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <BlogAdmin />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SearchResults />
            </Suspense>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/auth/register" element={<Navigate to="/register" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </>
  )
}

export default App
