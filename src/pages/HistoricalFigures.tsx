import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { figureService } from '../services/api'
import { usePlatformName } from '../hooks/usePlatformName'
import { Link } from 'react-router-dom'
import './HistoricalFigures.css'

interface HistoricalFigure {
  _id: string
  name: string
  nameNative: string
  birthDate?: string
  deathDate?: string
  role: string[]
  shortBiography: string
  image: string
  birthPlace: {
    country?: {
      _id: string
      nameFr: string
      id: string
    }
  }
  verified: boolean
}

const getRoleIconClass = (role: string) => {
  switch (role) {
    case 'Roi/Reine':
      return 'icon-crown'
    case 'Guerrier':
      return 'icon-shield'
    case 'Savant':
      return 'icon-book'
    case 'Artiste':
      return 'icon-star'
    default:
      return 'icon-user'
  }
}

export const HistoricalFigures = () => {
  const platformName = usePlatformName()
  const [figures, setFigures] = useState<HistoricalFigure[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  })

  useEffect(() => {
    fetchFigures()
  }, [filters])

  const fetchFigures = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.role) params.role = filters.role
      if (filters.search) params.search = filters.search

      const response = await figureService.getAll(params)
      // La réponse peut être un tableau directement ou un objet avec une propriété figures
      const figuresData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.figures || response.data?.data || []
      setFigures(figuresData)
    } catch (error) {
      console.error('Erreur lors du chargement des figures:', error)
      setFigures([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.getFullYear().toString()
  }


  return (
    <Layout>
      <div className="figures-page">
        <div className="figures-header">
          <h1>👥 Figures Historiques Africaines</h1>
          <p>Découvrez les personnages emblématiques qui ont marqué l'histoire de l'Afrique</p>
        </div>

        <div className="figures-filters">
          <div className="filter-group">
            <span className="icon-search" />
            <Input
              placeholder="Rechercher une figure historique..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <select
              id="figures-role-filter"
              name="figures-role-filter"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="filter-select"
            >
              <option value="">Tous les rôles</option>
              <option value="Roi/Reine">Roi/Reine</option>
              <option value="Guerrier">Guerrier</option>
              <option value="Savant">Savant</option>
              <option value="Artiste">Artiste</option>
              <option value="Commerçant">Commerçant</option>
              <option value="Religieux">Religieux</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="figures-loading">
            <p>Chargement des figures historiques...</p>
          </div>
        ) : figures.length === 0 ? (
          <div className="figures-empty">
            <p>Aucune figure historique trouvée</p>
          </div>
        ) : (
          <div className="figures-grid">
            {figures.map((figure) => {
              const iconClass = figure.role[0] ? getRoleIconClass(figure.role[0]) : 'icon-user'
              return (
                <Card key={figure._id} className="figure-card">
                  <div className="figure-image-container">
                    {figure.image ? (
                      <img src={figure.image} alt={figure.name} className="figure-image" />
                    ) : (
                      <div className="figure-image-placeholder">
                        <span className={iconClass} style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                      </div>
                    )}
                    {figure.verified && (
                      <div className="figure-verified-badge">
                        <span className="icon-check" />
                      </div>
                    )}
                  </div>
                  <div className="figure-content">
                    <h3>{figure.name}</h3>
                    {figure.nameNative && (
                      <p className="figure-native-name">{figure.nameNative}</p>
                    )}
                    <div className="figure-meta">
                      {(figure.birthDate || figure.deathDate) && (
                        <div className="figure-dates">
                          <span className="icon-calendar" />
                          <span>
                            {formatDate(figure.birthDate)}
                            {figure.birthDate && figure.deathDate && ' - '}
                            {formatDate(figure.deathDate)}
                          </span>
                        </div>
                      )}
                      {figure.birthPlace.country && (
                        <div className="figure-location">
                          <span className="icon-location" />
                          <span>{figure.birthPlace.country.nameFr}</span>
                        </div>
                      )}
                    </div>
                    <div className="figure-roles">
                      {figure.role.slice(0, 2).map((role) => {
                        const roleIconClass = getRoleIconClass(role)
                        return (
                          <span key={role} className="role-tag">
                            <span className={roleIconClass} />
                            {role}
                          </span>
                        )
                      })}
                    </div>
                    <p className="figure-bio">
                      {figure.shortBiography || 'Biographie disponible...'}
                    </p>
                    <Link to={`/figures/${figure._id}`}>
                      <Button variant="outline" size="small" style={{ width: '100%' }}>
                        Voir la biographie complète
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

