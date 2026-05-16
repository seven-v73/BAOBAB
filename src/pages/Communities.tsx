import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const { success, error: showError, info } = useNotifications()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    culture: '',
    search: '',
  })
  const hasActiveFilters = Boolean(filters.type || filters.culture || filters.search)
  const clearFilters = () => setFilters({ type: '', culture: '', search: '' })

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

  const handleJoin = async (communityId: string) => {
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
          <h1>Communautés</h1>
          <p>Le cercle Baobab est ouvert à tous. Les nouveaux groupes passent par une demande pour garder un espace lisible et bien animé.</p>
        </div>

        <div className="communities-actions">
          <Link to="/communities/create" className="btn btn-primary">
            <Plus size={20} />
            Proposer un groupe
          </Link>
        </div>

        <div className="communities-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une communauté..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
            value={filters.culture}
            onChange={(e) => setFilters({ ...filters, culture: e.target.value })}
            className="culture-input"
          />
        </div>

        {hasActiveFilters && (
          <div className="active-filter-chips" aria-label="Filtres actifs">
            {filters.search && (
              <button type="button" className="active-filter-chip" onClick={() => setFilters({ ...filters, search: '' })}>
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
              <button type="button" className="active-filter-chip" onClick={() => setFilters({ ...filters, culture: '' })}>
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
            title="Aucune communauté ne correspond à ces filtres"
            description="Essayez une recherche plus large ou revenez au cercle Baobab, le point de départ commun de MonBaobab."
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
                      <span>{community.postCount} posts</span>
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
                        Voir la communauté
                      </Link>
                    ) : community.type === 'public' ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleJoin(community._id)}
                      >
                        Rejoindre
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline"
                        onClick={() => info('Cette communauté est privée. Une invitation est requise pour y accéder.')}
                      >
                        Demander l'accès
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
