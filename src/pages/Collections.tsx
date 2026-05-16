import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { collectionService } from '../services/api'
import { Link } from 'react-router-dom'
import './Collections.css'

interface Collection {
  _id: string
  title: string
  description: string
  shortDescription: string
  coverImage: string
  theme: string[]
  difficulty: string
  estimatedTime: number
  views: number
  completions: number
  rating: {
    average: number
    count: number
  }
  isFeatured: boolean
}

export const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    theme: '',
    difficulty: '',
    featured: '',
    search: '',
  })

  useEffect(() => {
    fetchCollections()
  }, [filters])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.theme) params.theme = filters.theme
      if (filters.difficulty) params.difficulty = filters.difficulty
      if (filters.featured) params.featured = filters.featured === 'true'
      if (filters.search) params.search = filters.search

      const response = await collectionService.getAll(params)
      // La réponse peut être un tableau directement ou un objet avec une propriété collections
      const collectionsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.collections || response.data?.data || []
      setCollections(collectionsData)
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981'
      case 'intermediate':
        return '#f59e0b'
      case 'advanced':
        return '#ef4444'
      default:
        return '#d4af37' // Couleur primaire par défaut
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Débutant'
      case 'intermediate':
        return 'Intermédiaire'
      case 'advanced':
        return 'Avancé'
      default:
        return difficulty
    }
  }

  return (
    <Layout>
      <div className="collections-page">
        <div className="collections-header">
          <h1>Collections thématiques</h1>
          <p>Des dossiers organisés pour lire un sujet sans se perdre</p>
        </div>

        <div className="collections-filters">
          <div className="filter-group">
            <span className="icon-search" />
            <Input
              placeholder="Rechercher une collection..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <select
              id="collections-theme-filter"
              name="collections-theme-filter"
              value={filters.theme}
              onChange={(e) => setFilters({ ...filters, theme: e.target.value })}
              className="filter-select"
            >
              <option value="">Tous les thèmes</option>
              <option value="Empires">Empires</option>
              <option value="Commerce">Commerce</option>
              <option value="Art">Art</option>
              <option value="Religion">Religion</option>
              <option value="Guerre">Guerre</option>
              <option value="Innovation">Innovation</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              id="collections-difficulty-filter"
              name="collections-difficulty-filter"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="filter-select"
            >
              <option value="">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="collections-loading">
            <p>Chargement des collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="collections-empty">
            <p>Aucune collection trouvée</p>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((collection) => (
              <Card key={collection._id} className="collection-card">
                <div className="collection-cover">
                  {collection.coverImage ? (
                    <img src={collection.coverImage} alt={collection.title} />
                  ) : (
                    <div className="collection-cover-placeholder">
                      <span className="icon-book" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    </div>
                  )}
                  {collection.isFeatured && (
                    <div className="collection-featured-badge">
                      <span className="icon-star" />
                      <span>À la une</span>
                    </div>
                  )}
                </div>
                <div className="collection-content">
                  <div className="collection-themes">
                    {collection.theme.slice(0, 2).map((theme) => (
                      <span key={theme} className="theme-tag">
                        {theme}
                      </span>
                    ))}
                  </div>
                  <h3>{collection.title}</h3>
                  <p className="collection-description">
                    {collection.shortDescription || collection.description.substring(0, 150)}...
                  </p>
                  <div className="collection-meta">
                    <div className="meta-item">
                      <span className="icon-clock" />
                      <span>{collection.estimatedTime} min</span>
                    </div>
                    <div className="meta-item">
                      <span>{collection.views} vues</span>
                    </div>
                    {collection.rating.count > 0 && (
                      <div className="meta-item">
                        <span className="icon-star" />
                        <span>{collection.rating.average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="collection-footer">
                    <span
                      className="difficulty-badge"
                      style={{ color: getDifficultyColor(collection.difficulty) }}
                    >
                      {getDifficultyLabel(collection.difficulty)}
                    </span>
                    <Link to={`/collections/${collection._id}`}>
                      <Button variant="outline" size="small">
                        Explorer
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

