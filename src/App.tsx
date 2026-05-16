import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { BlogPostPage } from './pages/BlogPost'
import { Shop } from './pages/Shop'
import { Cart } from './pages/Cart'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Community } from './pages/Community'
import { Communities } from './pages/Communities'
import { CreateCommunity } from './pages/CreateCommunity'
import { CommunityDetail } from './pages/CommunityDetail'
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

// Lazy loading pour les pages moins fréquemment utilisées
const BlogAdmin = lazy(() => import('./pages/BlogAdmin').then(module => ({ default: module.BlogAdmin })))
const CountryDetail = lazy(() => import('./pages/CountryDetail').then(module => ({ default: module.CountryDetail })))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(module => ({ default: module.OrderDetail })))
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })))
const Timeline = lazy(() => import('./pages/Timeline').then(module => ({ default: module.Timeline })))
const HistoricalFigures = lazy(() => import('./pages/HistoricalFigures').then(module => ({ default: module.HistoricalFigures })))
const HistoricalFigureDetail = lazy(() => import('./pages/HistoricalFigureDetail').then(module => ({ default: module.HistoricalFigureDetail })))
const Collections = lazy(() => import('./pages/Collections').then(module => ({ default: module.Collections })))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail').then(module => ({ default: module.CollectionDetail })))
const TimelineDetail = lazy(() => import('./pages/TimelineDetail').then(module => ({ default: module.TimelineDetail })))
const Stories = lazy(() => import('./pages/Stories').then(module => ({ default: module.Stories })))
const StoryDetail = lazy(() => import('./pages/StoryDetail').then(module => ({ default: module.StoryDetail })))
const Quizzes = lazy(() => import('./pages/Quizzes').then(module => ({ default: module.Quizzes })))
const Quiz = lazy(() => import('./pages/Quiz').then(module => ({ default: module.Quiz })))
const Proverbs = lazy(() => import('./pages/Proverbs').then(module => ({ default: module.Proverbs })))
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
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

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

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/country/:id" 
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CountryDetail />
            </Suspense>
          } 
        />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route
          path="/timeline"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Timeline />
            </Suspense>
          }
        />
        <Route
          path="/timeline/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TimelineDetail />
            </Suspense>
          }
        />
        <Route path="/figures" element={<HistoricalFigures />} />
        <Route path="/figures/:id" element={<HistoricalFigureDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route
          path="/stories"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Stories />
            </Suspense>
          }
        />
        <Route
          path="/stories/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <StoryDetail />
            </Suspense>
          }
        />
        <Route
          path="/quizzes"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Quizzes />
            </Suspense>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Quiz />
            </Suspense>
          }
        />
        <Route
          path="/proverbs"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Proverbs />
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
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/search"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SearchResults />
            </Suspense>
          }
        />
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <Communities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/create"
          element={
            <ProtectedRoute>
              <CreateCommunity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/:id"
          element={
            <ProtectedRoute>
              <CommunityDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Checkout />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
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
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <OrderDetail />
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
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </>
  )
}

export default App
