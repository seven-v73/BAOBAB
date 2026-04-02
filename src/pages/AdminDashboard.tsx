import { useState, useEffect } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { useAuthStore } from '../stores/authStore'
import { 
  BarChart3, 
  Globe, 
  BookOpen, 
  ShoppingBag, 
  Users, 
  Settings,
  Clock,
  User,
  FolderOpen
} from 'lucide-react'
import { AdminStats } from './admin/AdminStats'
import { AdminCountries } from './admin/AdminCountries'
import { AdminBlog } from './admin/AdminBlog'
import { AdminProducts } from './admin/AdminProducts'
import { AdminUsers } from './admin/AdminUsers'
import { AdminSettings } from './admin/AdminSettings'
import { AdminTimeline } from './admin/AdminTimeline'
import { AdminFigures } from './admin/AdminFigures'
import { AdminCollections } from './admin/AdminCollections'
import { AdminQuiz } from './admin/AdminQuiz'
import './AdminDashboard.css'

type AdminSection = 'overview' | 'countries' | 'blog' | 'products' | 'users' | 'settings' | 'timeline' | 'figures' | 'collections' | 'quizzes'

export const AdminDashboard = () => {
  const platformName = usePlatformName()
  const { isAuthenticated, user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  // Vérification du rôle admin (double sécurité)
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  // Gérer la section depuis l'URL
  useEffect(() => {
    const section = searchParams.get('section') as AdminSection
    if (section && ['overview', 'countries', 'blog', 'products', 'users', 'settings', 'timeline', 'figures', 'collections', 'quizzes'].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section)
    setSearchParams({ section })
  }

  const menuItems = [
    { id: 'overview' as AdminSection, label: 'Vue d\'ensemble', iconClass: 'icon-trending-up' },
    { id: 'countries' as AdminSection, label: 'Pays', iconClass: 'icon-globe' },
    { id: 'blog' as AdminSection, label: 'Blog', iconClass: 'icon-book' },
    { id: 'products' as AdminSection, label: 'Produits', iconClass: 'icon-shopping' },
    { id: 'timeline' as AdminSection, label: 'Chronologie', iconClass: 'icon-clock' },
    { id: 'figures' as AdminSection, label: 'Personnages', iconClass: 'icon-user' },
    { id: 'collections' as AdminSection, label: 'Collections', iconClass: 'icon-folder-open' },
    { id: 'quizzes' as AdminSection, label: 'Quiz', iconClass: 'icon-book' },
    { id: 'users' as AdminSection, label: 'Utilisateurs', iconClass: 'icon-users' },
    { id: 'settings' as AdminSection, label: 'Paramètres', iconClass: 'icon-settings' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminStats />
      case 'countries':
        return <AdminCountries />
      case 'blog':
        return <AdminBlog />
      case 'products':
        return <AdminProducts />
      case 'timeline':
        return <AdminTimeline />
      case 'figures':
        return <AdminFigures />
      case 'collections':
        return <AdminCollections />
      case 'quizzes':
        return <AdminQuiz />
      case 'users':
        return <AdminUsers />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminStats />
    }
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2>🌳 {platformName}</h2>
            <p className="admin-role">Administration</p>
          </div>
          
          <nav className="admin-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSectionChange(item.id)}
              >
                <span className={item.iconClass} style={{ fontSize: '20px', width: '20px', height: '20px' }} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">{user?.name || 'Admin'}</p>
              <p className="admin-user-email">{user?.email || 'admin@baobab.com'}</p>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <div className="admin-content-header">
            <div>
              <h1 className="admin-page-title">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="admin-page-subtitle">
                Gérez le contenu de la plateforme {platformName}
              </p>
            </div>
          </div>

          <div className="admin-content-body">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  )
}

