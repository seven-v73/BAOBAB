import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { searchService } from '../services/api'
import './SearchResults.css'

export const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || ''
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      fetchResults()
    } else {
      setLoading(false)
    }
  }, [query, type])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await searchService.search({ q: query, type: type || undefined, limit: 10 })
      setResults(response.data)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const searchSections = [
    {
      key: 'countries',
      type: 'countries',
      title: 'Pays',
      path: (item: any) => `/country/${item.id}`,
      titleOf: (item: any) => item.nameFr,
      textOf: (item: any) => [item.capital, item.region || item.subregion].filter(Boolean).join(' · ') || item.description,
    },
    {
      key: 'proverbs',
      type: 'proverbs',
      title: 'Proverbes',
      path: () => '/proverbs',
      titleOf: (item: any) => item.text,
      textOf: (item: any) => [item.countryName, item.category, item.translation].filter(Boolean).join(' · '),
    },
    {
      key: 'figures',
      type: 'figures',
      title: 'Personnages',
      path: (item: any) => `/figures/${item._id}`,
      titleOf: (item: any) => item.name,
      textOf: (item: any) => item.nameNative || item.shortBiography,
    },
    {
      key: 'events',
      type: 'events',
      title: 'Chronologie',
      path: (item: any) => `/timeline/${item._id}`,
      titleOf: (item: any) => item.title,
      textOf: (item: any) => item.shortDescription || item.period,
    },
    {
      key: 'stories',
      type: 'stories',
      title: 'Récits',
      path: (item: any) => `/stories/${item._id}`,
      titleOf: (item: any) => item.title,
      textOf: (item: any) => item.subtitle || item.description,
    },
    {
      key: 'collections',
      type: 'collections',
      title: 'Collections',
      path: (item: any) => `/collections/${item._id}`,
      titleOf: (item: any) => item.title,
      textOf: (item: any) => item.shortDescription || item.theme?.join?.(', '),
    },
    {
      key: 'products',
      type: 'products',
      title: 'Boutique',
      path: () => '/shop',
      titleOf: (item: any) => item.name,
      textOf: (item: any) => `${item.price} ${item.currency || 'FCFA'} · ${item.category || 'Produit'}`,
    },
    {
      key: 'communities',
      type: 'communities',
      title: 'Communautés',
      path: (item: any) => `/communities/${item._id}`,
      titleOf: (item: any) => item.name,
      textOf: (item: any) => `${item.memberCount || 0} membres · ${item.culture || item.description || 'Espace de transmission'}`,
    },
    {
      key: 'quizzes',
      type: 'quizzes',
      title: 'Quiz',
      path: (item: any) => `/quizzes/${item._id}`,
      titleOf: (item: any) => item.title,
      textOf: (item: any) => [item.difficulty, item.totalPoints ? `${item.totalPoints} points` : null].filter(Boolean).join(' · '),
    },
    {
      key: 'blogs',
      type: 'blogs',
      title: 'Articles',
      path: (item: any) => `/blog/${item._id}`,
      titleOf: (item: any) => item.title,
      textOf: (item: any) => item.excerpt,
    },
  ]

  const getTotalResults = () => {
    if (!results) return 0
    return searchSections.reduce((total, section) => total + (results[section.key]?.length || 0), 0)
  }

  const activeSections = searchSections.filter((section) => results?.[section.key]?.length > 0)

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
          <div className="search-type-tabs" aria-label="Filtrer les résultats">
            <Link className={!type ? 'active' : ''} to={`/search?q=${encodeURIComponent(query)}`}>Tout</Link>
            {searchSections.slice(0, 9).map((section) => (
              <Link
                key={section.type}
                className={type === section.type ? 'active' : ''}
                to={`/search?q=${encodeURIComponent(query)}&type=${section.type}`}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>

        {!results || getTotalResults() === 0 ? (
          <div className="search-empty">
            <p>Aucun résultat trouvé pour "{query}"</p>
          </div>
        ) : (
          <div className="search-results-content">
            {activeSections.map((section) => (
              <section className="search-section" key={section.key}>
                <div className="search-section-header">
                  <h2>{section.title} ({results[section.key].length})</h2>
                  <Link to={`/search?q=${encodeURIComponent(query)}&type=${section.type}`}>Voir ce type</Link>
                </div>
                <div className="search-grid">
                  {results[section.key].map((item: any) => (
                    <Card key={item._id || item.id || section.titleOf(item)} className="search-item">
                      <Link to={section.path(item)}>
                        <span>{section.title}</span>
                        <h3>{section.titleOf(item)}</h3>
                        {section.textOf(item) && <p>{section.textOf(item)}</p>}
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
