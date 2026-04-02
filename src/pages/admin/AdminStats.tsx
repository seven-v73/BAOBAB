import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Globe, BookOpen, ShoppingBag, Users, TrendingUp, Eye, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { countryService, blogService, productService, userService } from '../../services/api'
import './AdminStats.css'

interface Stats {
  countries: number
  blogPosts: number
  products: number
  users: number
  totalViews: number
  growth: number
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    countries: 0,
    blogPosts: 0,
    products: 0,
    users: 0,
    totalViews: 0,
    growth: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const [countriesRes, blogRes, productsRes, usersRes] = await Promise.all([
        countryService.getAll().catch(() => ({ data: [] })),
        blogService.getAll().catch(() => ({ data: [] })),
        productService.getAll({ limit: 1 }).catch(() => ({ data: { products: [] } })),
        userService.getAll({ limit: 1 }).catch(() => ({ data: { users: [] } })),
      ])

      const countries = Array.isArray(countriesRes.data) ? countriesRes.data : []
      const blogPosts = Array.isArray(blogRes.data) ? blogRes.data : []
      const products = productsRes.data.products || productsRes.data || []
      const users = usersRes.data.users || usersRes.data || []

      // Calculer les vues totales (simplifié)
      const totalViews = blogPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0) +
                        (Array.isArray(products) ? products.reduce((sum: number, p: any) => sum + (p.views || 0), 0) : 0)

      setStats({
        countries: countries.length,
        blogPosts: blogPosts.length,
        products: Array.isArray(products) ? products.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        totalViews,
        growth: 12.5, // TODO: Calculer la croissance réelle
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Pays',
      value: stats.countries,
      icon: Globe,
      color: '#d4af37',
      change: '54 pays africains',
      onClick: () => navigate('/admin?section=countries'),
    },
    {
      label: 'Articles Blog',
      value: stats.blogPosts,
      icon: BookOpen,
      color: '#3498db',
      change: 'Articles publiés',
      onClick: () => navigate('/admin?section=blog'),
    },
    {
      label: 'Produits',
      value: stats.products,
      icon: ShoppingBag,
      color: '#27ae60',
      change: 'En boutique',
      onClick: () => navigate('/admin?section=products'),
    },
    {
      label: 'Utilisateurs',
      value: stats.users,
      icon: Users,
      color: '#e74c3c',
      change: 'Inscrits',
      onClick: () => navigate('/admin?section=users'),
    },
    {
      label: 'Vues Total',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: '#9b59b6',
      change: 'Engagement',
    },
    {
      label: 'Croissance',
      value: `${stats.growth}%`,
      icon: TrendingUp,
      color: '#f39c12',
      change: 'vs mois dernier',
    },
  ]

  if (loading) {
    return <div className="admin-loading">Chargement des statistiques...</div>
  }

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={index} 
              className={`stat-card-admin ${stat.onClick ? 'clickable' : ''}`}
              onClick={stat.onClick}
            >
              <div className="stat-card-header">
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20`, borderColor: stat.color }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <div className="stat-change positive">
                  {stat.change}
                </div>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
              {stat.onClick && (
                <div className="stat-card-footer">
                  <span>Voir plus <ArrowRight size={14} /></span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="stats-actions">
        <Card className="quick-actions-card">
          <h3>Actions Rapides</h3>
          <div className="quick-actions-grid">
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin?section=countries')}
            >
              <Globe size={20} />
              <span>Ajouter un pays</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin?section=blog')}
            >
              <BookOpen size={20} />
              <span>Nouvel article</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin?section=products')}
            >
              <ShoppingBag size={20} />
              <span>Nouveau produit</span>
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navigate('/admin?section=users')}
            >
              <Users size={20} />
              <span>Voir utilisateurs</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
