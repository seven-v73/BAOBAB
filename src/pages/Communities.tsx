import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { communityService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { EmptyState } from '../components/UX/EmptyState'
import { Skeleton } from '../components/UX/Skeleton'
import { Users, Lock, Globe, Plus, Search } from 'lucide-react'
import './Communities.css'

interface Community {
  _id: string
  name: string
  description: string
  type: 'public' | 'private'
  culture: string
  image: string
  coverImage: string
  creator: {
    _id: string
    name: string
    avatar?: string
  }
  memberCount: number
  postCount: number
  tags: string[]
  membership?: {
    role: string
    status: string
  }
}

export const Communities = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { success, error: showError, info } = useNotifications()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    culture: '',
    search: '',
  })
  const [searchInput, setSearchInput] = useState('')
  const [cultureInput, setCultureInput] = useState('')
  const hasActiveFilters = Boolean(filters.type || filters.culture || filters.search)
  const clearFilters = () => {
    setFilters({ type: '', culture: '', search: '' })
    setSearchInput('')
    setCultureInput('')
  }

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await communityService.getAllCommunities({
        ...filters,
        page: 1,
        limit: 20,
      })
      setCommunities(response.data.communities || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des communautés')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [filters])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        search: searchInput,
        culture: cultureInput,
      }))
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput, cultureInput])

  const handleJoin = async (communityId: string) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/communities/${communityId}`)}`)
      return
    }

    try {
      await communityService.joinCommunity(communityId)
      success('Vous avez rejoint la communauté.')
      fetchCommunities()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la demande d’adhésion')
    }
  }

  return (
    <Layout>
      <div className="communities-page">
        <div className="communities-header">
          <h1>Cercles et communautés</h1>
          <p>Des espaces pour poser une question, transmettre une ressource, rejoindre une culture ou faire grandir une conversation avec respect.</p>
        </div>

        <div className="communities-actions">
          <Link to={user ? '/communities/create' : `/login?redirect=${encodeURIComponent('/communities/create')}`} className="btn btn-primary">
            <Plus size={20} />
            Proposer un cercle
          </Link>
        </div>

        <div className="communities-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Chercher un cercle, une culture, une discussion..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="filter-select"
          >
            <option value="">Tous les types</option>
            <option value="public">Publiques</option>
            <option value="private">Privées</option>
          </select>
          <input
            type="text"
            placeholder="Culture (ex: Wolof, Bambara...)"
            value={cultureInput}
            onChange={(e) => setCultureInput(e.target.value)}
            className="culture-input"
          />
        </div>

        {hasActiveFilters && (
          <div className="active-filter-chips" aria-label="Filtres actifs">
            {filters.search && (
              <button type="button" className="active-filter-chip" onClick={() => {
                setSearchInput('')
                setFilters({ ...filters, search: '' })
              }}>
                <span>Recherche: {filters.search}</span>
                <span aria-hidden="true">×</span>
              </button>
            )}
            {filters.type && (
              <button type="button" className="active-filter-chip" onClick={() => setFilters({ ...filters, type: '' })}>
                <span>{filters.type === 'public' ? 'Publiques' : 'Privées'}</span>
                <span aria-hidden="true">×</span>
              </button>
            )}
            {filters.culture && (
              <button type="button" className="active-filter-chip" onClick={() => {
                setCultureInput('')
                setFilters({ ...filters, culture: '' })
              }}>
                <span>{filters.culture}</span>
                <span aria-hidden="true">×</span>
              </button>
            )}
            <button type="button" className="active-filter-clear" onClick={clearFilters}>
              Tout effacer
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {loading ? (
          <Skeleton variant="cards" count={6} label="Chargement des communautés" />
        ) : communities.length === 0 ? (
          <EmptyState
            title="Aucun cercle ne correspond à ces filtres"
            description="Essayez une recherche plus large ou revenez au cercle Baobab, le point de départ commun."
            action={<button className="btn btn-outline" onClick={clearFilters}>Réinitialiser les filtres</button>}
          />
        ) : (
          <div className="communities-grid">
            {communities.map(community => (
              <div key={community._id} className={`community-card ${community.name.toLowerCase() === 'baobab' ? 'default-community-card' : ''}`}>
                {community.coverImage && (
                  <div className="community-cover">
                    <img src={community.coverImage} alt={community.name} />
                  </div>
                )}
                <div className="community-content">
                  <div className="community-header-card">
                    {community.image ? (
                      <img src={community.image} alt={community.name} className="community-avatar" />
                    ) : (
                      <div className="community-avatar-placeholder">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="community-info">
                      <h3>{community.name}</h3>
                      <div className="community-meta">
                        {community.type === 'private' ? (
                          <Lock size={14} />
                        ) : (
                          <Globe size={14} />
                        )}
                        <span>{community.type === 'private' ? 'Privée' : 'Publique'}</span>
                        {community.name.toLowerCase() === 'baobab' && (
                          <>
                            <span>•</span>
                            <span>Cercle officiel</span>
                          </>
                        )}
                        {community.culture && (
                          <>
                            <span>•</span>
                            <span>{community.culture}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="community-description">{community.description}</p>
                  <div className="community-stats">
                    <div className="stat">
                      <Users size={16} />
                      <span>{community.memberCount} membres</span>
                    </div>
                    <div className="stat">
                      <span>{community.postCount} message{community.postCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {community.tags.length > 0 && (
                    <div className="community-tags">
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="community-actions">
                    {community.membership?.status === 'active' ? (
                      <Link
                        to={`/communities/${community._id}`}
                        className="btn btn-primary"
                      >
                        Entrer dans le cercle
                      </Link>
                    ) : community.type === 'public' ? (
                      <>
                        <Link
                          to={`/communities/${community._id}`}
                          className="btn btn-outline"
                        >
                          Voir le cercle
                        </Link>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleJoin(community._id)}
                        >
                          Rejoindre
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline"
                        onClick={() => info('Cette communauté est privée. Une invitation est requise pour y accéder.')}
                      >
                        Demander l’accès
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
