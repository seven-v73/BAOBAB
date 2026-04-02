import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { searchService } from '../services/api'
import './SearchResults.css'

export const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      fetchResults()
    } else {
      setLoading(false)
    }
  }, [query])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await searchService.search({ q: query, limit: 10 })
      setResults(response.data)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const getTotalResults = () => {
    if (!results) return 0
    return (
      (results.products?.length || 0) +
      (results.blogs?.length || 0) +
      (results.events?.length || 0) +
      (results.figures?.length || 0) +
      (results.stories?.length || 0) +
      (results.collections?.length || 0)
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="search-results">
          <div className="search-loading">Recherche en cours...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="search-results">
        <div className="search-results-header">
          <h1>Résultats de recherche</h1>
          <p className="search-query">"{query}" - {getTotalResults()} résultat(s) trouvé(s)</p>
        </div>

        {!results || getTotalResults() === 0 ? (
          <div className="search-empty">
            <p>Aucun résultat trouvé pour "{query}"</p>
          </div>
        ) : (
          <div className="search-results-content">
            {results.products && results.products.length > 0 && (
              <section className="search-section">
                <h2>Produits ({results.products.length})</h2>
                <div className="search-grid">
                  {results.products.map((product: any) => (
                    <Card key={product._id} className="search-item">
                      <Link to={`/shop`}>
                        <h3>{product.name}</h3>
                        <p>{product.price} {product.currency || 'FCFA'}</p>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {results.blogs && results.blogs.length > 0 && (
              <section className="search-section">
                <h2>Articles ({results.blogs.length})</h2>
                <div className="search-grid">
                  {results.blogs.map((blog: any) => (
                    <Card key={blog._id} className="search-item">
                      <Link to={`/blog/${blog._id}`}>
                        <h3>{blog.title}</h3>
                        <p>{blog.excerpt}</p>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {results.events && results.events.length > 0 && (
              <section className="search-section">
                <h2>Événements ({results.events.length})</h2>
                <div className="search-grid">
                  {results.events.map((event: any) => (
                    <Card key={event._id} className="search-item">
                      <Link to={`/timeline/${event._id}`}>
                        <h3>{event.title}</h3>
                        <p>{event.shortDescription}</p>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {results.figures && results.figures.length > 0 && (
              <section className="search-section">
                <h2>Figures Historiques ({results.figures.length})</h2>
                <div className="search-grid">
                  {results.figures.map((figure: any) => (
                    <Card key={figure._id} className="search-item">
                      <Link to={`/figures/${figure._id}`}>
                        <h3>{figure.name}</h3>
                        {figure.nameNative && <p>{figure.nameNative}</p>}
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

