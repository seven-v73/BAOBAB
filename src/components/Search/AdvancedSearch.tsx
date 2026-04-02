import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { timelineService, figureService, collectionService, blogService, countryService } from '../../services/api'
import './AdvancedSearch.css'

interface SearchResult {
  type: 'event' | 'figure' | 'collection' | 'blog' | 'country'
  id: string
  title: string
  description: string
  image?: string
  metadata?: string
}

export const AdvancedSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all', // all, event, figure, collection, blog, country
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch()
      }, 300) // Debounce de 300ms

      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query, filters])

  const performSearch = async () => {
    if (query.length < 2) return

    setLoading(true)
    setShowResults(true)

    try {
      const searchPromises: Promise<any>[] = []

      if (filters.type === 'all' || filters.type === 'event') {
        searchPromises.push(
          timelineService.getAll({ search: query, limit: 5 }).then(res => 
            res.data.events?.map((e: any) => ({
              type: 'event' as const,
              id: e._id,
              title: e.title,
              description: e.shortDescription || e.description,
              metadata: `${e.period} • ${e.location?.country?.nameFr || ''}`,
            })) || []
          )
        )
      }

      if (filters.type === 'all' || filters.type === 'figure') {
        searchPromises.push(
          figureService.getAll({ search: query, limit: 5 }).then(res =>
            res.data.figures?.map((f: any) => ({
              type: 'figure' as const,
              id: f._id,
              title: f.name,
              description: f.shortBiography || f.biography,
              image: f.image,
              metadata: f.role?.[0] || '',
            })) || []
          )
        )
      }

      if (filters.type === 'all' || filters.type === 'collection') {
        searchPromises.push(
          collectionService.getAll({ search: query, limit: 5 }).then(res =>
            res.data.collections?.map((c: any) => ({
              type: 'collection' as const,
              id: c._id,
              title: c.title,
              description: c.shortDescription || c.description,
              image: c.coverImage,
              metadata: c.theme?.[0] || '',
            })) || []
          )
        )
      }

      if (filters.type === 'all' || filters.type === 'blog') {
        searchPromises.push(
          blogService.getAll().then(res =>
            res.data
              ?.filter((b: any) => 
                b.title.toLowerCase().includes(query.toLowerCase()) ||
                b.content.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((b: any) => ({
                type: 'blog' as const,
                id: b._id,
                title: b.title,
                description: b.excerpt || b.content,
                image: b.image,
                metadata: b.category || '',
              })) || []
          )
        )
      }

      if (filters.type === 'all' || filters.type === 'country') {
        searchPromises.push(
          countryService.getAll({ search: query }).then(res =>
            res.data
              ?.slice(0, 5)
              .map((c: any) => ({
                type: 'country' as const,
                id: c.id || c._id,
                title: c.nameFr,
                description: c.description,
                metadata: c.capital || '',
              })) || []
          )
        )
      }

      const allResults = await Promise.all(searchPromises)
      const flattened = allResults.flat()
      setResults(flattened)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getResultIconClass = (type: string) => {
    switch (type) {
      case 'event':
        return 'icon-clock'
      case 'figure':
        return 'icon-user'
      case 'collection':
        return 'icon-book'
      case 'blog':
        return 'icon-file'
      case 'country':
        return 'icon-globe'
      default:
        return 'icon-search'
    }
  }

  const getResultPath = (result: SearchResult) => {
    switch (result.type) {
      case 'event':
        return `/timeline/${result.id}`
      case 'figure':
        return `/figures/${result.id}`
      case 'collection':
        return `/collections/${result.id}`
      case 'blog':
        return `/blog/${result.id}`
      case 'country':
        return `/country/${result.id}`
      default:
        return '/'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(getResultPath(result))
    setQuery('')
    setShowResults(false)
  }

  return (
    <div className="advanced-search-container">
      <div className="search-input-wrapper">
        <span className="icon-search search-icon" />
        <input
          id="advanced-search-input"
          name="advanced-search-input"
          type="text"
          className="search-input"
          placeholder="Rechercher dans l'histoire de l'Afrique..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button
            className="search-clear icon-close"
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
            aria-label="Effacer la recherche"
          />
        )}
      </div>

      {showResults && (
        <div className="search-results">
          <div className="search-filters">
            <button
              className={`filter-btn ${filters.type === 'all' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'all' })}
            >
              Tout
            </button>
            <button
              className={`filter-btn ${filters.type === 'event' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'event' })}
            >
              <span className="icon-clock" />
              Événements
            </button>
            <button
              className={`filter-btn ${filters.type === 'figure' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'figure' })}
            >
              <span className="icon-user" />
              Personnages
            </button>
            <button
              className={`filter-btn ${filters.type === 'collection' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'collection' })}
            >
              <span className="icon-book" />
              Collections
            </button>
            <button
              className={`filter-btn ${filters.type === 'blog' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'blog' })}
            >
              <span className="icon-file" />
              Articles
            </button>
            <button
              className={`filter-btn ${filters.type === 'country' ? 'active' : ''}`}
              onClick={() => setFilters({ type: 'country' })}
            >
              <span className="icon-globe" />
              Pays
            </button>
          </div>

          {loading ? (
            <div className="search-loading">
              <p>Recherche en cours...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <p>Aucun résultat trouvé pour "{query}"</p>
            </div>
          ) : (
            <div className="results-list">
              {results.map((result, index) => {
                const iconClass = getResultIconClass(result.type)
                return (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-icon">
                      <span className={iconClass} />
                    </div>
                    <div className="result-content">
                      <h4>{result.title}</h4>
                      <p className="result-description">
                        {result.description?.substring(0, 100)}...
                      </p>
                      {result.metadata && (
                        <span className="result-metadata">{result.metadata}</span>
                      )}
                    </div>
                    {result.image && (
                      <div className="result-image">
                        <img src={result.image} alt={result.title} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

