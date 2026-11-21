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
import { RouteSeo } from './seo/RouteSeo'
import './App.css'

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
const BlogWrite = lazy(() => import('./pages/BlogWrite').then(module => ({ default: module.BlogWrite })))
const FicheDetail = lazy(() => import('./pages/FicheDetail').then(module => ({ default: module.FicheDetail })))
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })))
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
// Route réservée aux membres : pendant la vérification de session au démarrage, on attend
// (sinon un simple rechargement de page renverrait vers la connexion)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const status = useAuthStore((state) => state.status)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const loggedOut = useAuthStore((state) => state.loggedOut)
  const location = useLocation()
  if (status !== 'ready' && isAuthenticated) return <LoadingFallback />
  if (isAuthenticated) return <>{children}</>
  if (loggedOut) return <Navigate to="/" replace />
  const redirect = `${location.pathname}${location.search}`
  return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}${sessionExpired ? '&expired=1' : ''}`} replace />
}

function App() {
  const { notifications, removeNotification, warning } = useNotifications()
  const initAuth = useAuthStore((state) => state.init)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
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

  // Rétablir la session au démarrage (cookie sécurisé, sans redemander le mot de passe)
  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Session terminée pendant la navigation (inactivité prolongée, déconnexion d'un autre appareil…)
  useEffect(() => {
    if (sessionExpired) warning('Votre session a expiré. Reconnectez-vous pour continuer.', 6000)
  }, [sessionExpired, warning])

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
      {/* Placé avant les pages : ses effets s'exécutent avant ceux des pages, qui peuvent ensuite préciser */}
      <RouteSeo />
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
        <Route
          path="/blog/ecrire"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <BlogWrite />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/ecrire/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <BlogWrite />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route
          path="/fiche/:ficheId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <FicheDetail />
            </Suspense>
          }
        />
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
        {/* Rubriques en pause (clean.md) : leurs anciennes adresses, parfois indexées, ramènent à l'accueil */}
        <Route path="/quizzes" element={<Navigate to="/" replace />} />
        <Route path="/quizzes/:id" element={<Navigate to="/" replace />} />
        <Route path="/shop" element={<Navigate to="/" replace />} />
        <Route path="/cart" element={<Navigate to="/" replace />} />
        <Route path="/checkout" element={<Navigate to="/" replace />} />
        <Route path="/orders/:id" element={<Navigate to="/" replace />} />
        <Route path="/communities" element={<Navigate to="/" replace />} />
        <Route path="/communities/create" element={<Navigate to="/" replace />} />
        <Route path="/communities/:id" element={<Navigate to="/" replace />} />
        <Route path="/community" element={<Navigate to="/" replace />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          }
        />
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
