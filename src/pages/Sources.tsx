import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { sourceService } from '../services/api'
import { foundationSources } from '../data/foundationContent'
import './Sources.css'

interface Source {
  _id: string
  type: string
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  language?: string
  reliability?: number
  citations?: number
  description?: string
  keywords?: string[]
  relatedTopics?: string[]
  relatedCountries?: Array<{ _id: string; id: string; nameFr: string }>
}

const sourceTypes = [
  { value: '', label: 'Toutes' },
  { value: 'book', label: 'Livres' },
  { value: 'archive', label: 'Archives' },
  { value: 'museum', label: 'Musées' },
  { value: 'testimony', label: 'Témoignages' },
  { value: 'video', label: 'Audio/vidéo' },
  { value: 'website', label: 'Sites' },
]

const typeLabels: Record<string, string> = {
  book: 'Livre',
  article: 'Article',
  document: 'Document',
  archive: 'Archive',
  testimony: 'Témoignage',
  museum: 'Musée',
  video: 'Audio/vidéo',
  website: 'Site',
}

export const Sources = () => {
  const [searchParams] = useSearchParams()
  const [sources, setSources] = useState<Source[]>(foundationSources)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [minReliability, setMinReliability] = useState('')
  const country = searchParams.get('country') || ''

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoadError('')
        const response = await sourceService.getAll({
          search: search || undefined,
          type: type || undefined,
          country: country || undefined,
          minReliability: minReliability || undefined,
          limit: 80,
        })
        const apiSources = response.data.sources || []
        setSources(apiSources.length > 0 ? apiSources : foundationSources)
      } catch (error) {
        console.error('Erreur lors du chargement des sources:', error)
        try {
          const params = new URLSearchParams()
          if (search) params.set('search', search)
          if (type) params.set('type', type)
          if (country) params.set('country', country)
          if (minReliability) params.set('minReliability', minReliability)
          params.set('limit', '80')
          const fallbackResponse = await fetch(`/api/sources?${params.toString()}`)
          const fallbackData = await fallbackResponse.json()
          const fallbackSources = fallbackData.sources || []
          setSources(fallbackSources.length > 0 ? fallbackSources : foundationSources)
        } catch (fallbackError) {
          console.error('Fallback sources échoué:', fallbackError)
          setSources(foundationSources)
          setLoadError('Les sources n’ont pas pu être chargées. Réessayez dans un instant.')
        }
      } finally {
        setLoading(false)
      }
    }

    const timeout = window.setTimeout(fetchSources, 220)
    return () => window.clearTimeout(timeout)
  }, [search, type, minReliability, country])

  const stats = useMemo(() => {
    const reliable = sources.filter((source) => (source.reliability || 0) >= 4).length
    const countries = new Set(sources.flatMap((source) => source.relatedCountries?.map((country) => country.id) || []))
    return { reliable, countries: countries.size }
  }, [sources])

  return (
    <Layout>
      <main className="sources-page">
        <section className="sources-hero">
          <p className="sources-kicker">Bibliothèque de confiance</p>
          <h1>Sources, archives et repères pour vérifier la mémoire.</h1>
          <p>
            MonBaobab distingue les savoirs sourcés, les traditions orales à contextualiser et
            les contributions communautaires. Cette bibliothèque sert de colonne vertébrale à la
            plateforme.
          </p>
          <div className="sources-hero-actions">
            <Link to="/contribute">Proposer une source</Link>
            <Link to="/map">Explorer par pays</Link>
          </div>
        </section>

        {country && (
          <div className="sources-country-filter">
            Sources liées au pays <strong>{country}</strong>
            <Link to="/sources">Voir toute la bibliothèque</Link>
          </div>
        )}

        <section className="sources-metrics" aria-label="Indicateurs sources">
          <div>
            <strong>{loading ? '...' : sources.length}</strong>
            <span>sources affichées</span>
          </div>
          <div>
            <strong>{loading ? '...' : stats.reliable}</strong>
            <span>sources très fiables</span>
          </div>
          <div>
            <strong>{loading ? '...' : stats.countries}</strong>
            <span>pays reliés</span>
          </div>
        </section>

        <section className="sources-tools">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Chercher une source, un thème, une archive..."
            aria-label="Chercher dans les sources"
          />
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filtrer par type">
            {sourceTypes.map((item) => (
              <option key={item.value || 'all'} value={item.value}>{item.label}</option>
            ))}
          </select>
          <select value={minReliability} onChange={(event) => setMinReliability(event.target.value)} aria-label="Filtrer par fiabilité">
            <option value="">Toute fiabilité</option>
            <option value="3">3+ contextualisée</option>
            <option value="4">4+ solide</option>
            <option value="5">5 officielle</option>
          </select>
        </section>

        {loading ? (
          <section className="sources-grid" aria-live="polite" aria-label="Chargement des sources">
            {Array.from({ length: 8 }).map((_, index) => (
              <article className="source-card source-card-skeleton" key={index}>
                <div className="source-card-top"><span /> <strong /></div>
                <h2 />
                <p />
                <p />
                <div className="source-tags"><span /><span /><span /></div>
              </article>
            ))}
          </section>
        ) : loadError ? (
          <div className="sources-loading sources-error">{loadError}</div>
        ) : sources.length === 0 ? (
          <div className="sources-loading">Aucune source ne correspond à ce filtre.</div>
        ) : (
          <section className="sources-grid">
            {sources.map((source) => (
              <article className="source-card" key={source._id}>
                <div className="source-card-top">
                  <span>{typeLabels[source.type] || source.type}</span>
                  <strong>Fiabilité {source.reliability || 3}/5</strong>
                </div>
                <h2>{source.title}</h2>
                <p>{source.description}</p>
                <div className="source-meta">
                  {[source.author, source.publisher, source.year].filter(Boolean).join(' · ')}
                </div>
                {source.relatedCountries && source.relatedCountries.length > 0 && (
                  <div className="source-countries">
                    {source.relatedCountries.slice(0, 5).map((country) => (
                      <Link key={country.id} to={`/country/${country.id}`}>{country.nameFr}</Link>
                    ))}
                  </div>
                )}
                <div className="source-tags">
                  {(source.keywords || source.relatedTopics || []).slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                {source.url && (
                  <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                    Consulter
                  </a>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </Layout>
  )
}
