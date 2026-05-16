import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { storyService } from '../services/api'
import { usePlatformName } from '../hooks/usePlatformName'
import { Link } from 'react-router-dom'
import './Stories.css'

interface Story {
  _id: string
  title: string
  subtitle: string
  coverImage: string
  description: string
  readingTime: number
  difficulty: string
  category: string
  views: number
  completions: number
  isFeatured: boolean
}

export const Stories = () => {
  const platformName = usePlatformName()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    featured: '',
  })

  useEffect(() => {
    fetchStories()
  }, [filters])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.category) params.category = filters.category
      if (filters.difficulty) params.difficulty = filters.difficulty
      if (filters.featured) params.featured = filters.featured === 'true'

      const response = await storyService.getAll(params)
      // La réponse peut être un tableau directement ou un objet avec une propriété stories
      const storiesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.stories || response.data?.data || []
      setStories(storiesData)
    } catch (error) {
      console.error('Erreur lors du chargement des récits:', error)
      setStories([])
    } finally {
      setLoading(false)
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
      <div className="stories-page">
        <div className="stories-header">
          <h1>Récits et histoires</h1>
          <p>Des récits pour entrer dans les lieux, les voix et les mémoires.</p>
        </div>

        <div className="stories-filters">
          <select
            id="stories-category-filter"
            name="stories-category-filter"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">Toutes les catégories</option>
            <option value="Histoire">Histoire</option>
            <option value="Biographie">Biographie</option>
            <option value="Légende">Légende</option>
            <option value="Épopée">Épopée</option>
            <option value="Documentaire">Documentaire</option>
          </select>
          <select
            id="stories-difficulty-filter"
            name="stories-difficulty-filter"
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

        {loading ? (
          <div className="stories-loading">
            <p>Chargement des récits...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="stories-empty">
            <p>Aucun récit trouvé</p>
          </div>
        ) : (
          <div className="stories-grid">
            {stories.map((story) => (
              <Card key={story._id} className="story-card">
                <div className="story-cover">
                  {story.coverImage ? (
                    <img src={story.coverImage} alt={story.title} />
                  ) : (
                    <div className="story-cover-placeholder">
                      <span className="icon-book" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    </div>
                  )}
                  {story.isFeatured && (
                    <div className="story-featured-badge">
                      <span className="icon-star" />
                      <span>À la une</span>
                    </div>
                  )}
                </div>
                <div className="story-content">
                  <div className="story-category">{story.category}</div>
                  <h3>{story.title}</h3>
                  {story.subtitle && <p className="story-subtitle">{story.subtitle}</p>}
                  <p className="story-description">
                    {story.description?.substring(0, 150)}...
                  </p>
                  <div className="story-meta">
                    <div className="meta-item">
                      <span className="icon-clock" />
                      <span>{story.readingTime} min</span>
                    </div>
                    <div className="meta-item">
                      <span>{story.views} vues</span>
                    </div>
                    <div className="meta-item">
                      <span>{story.completions} complétions</span>
                    </div>
                  </div>
                  <div className="story-footer">
                    <span className="difficulty-badge">{getDifficultyLabel(story.difficulty)}</span>
                    <Link to={`/stories/${story._id}`}>
                      <Button variant="outline" size="small">
                        <span className="icon-arrow icon-arrow-right" />
                        Lire
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
