import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { Layout } from '../components/Layout/Layout'
import { proverbService, countryService } from '../services/api'
import { usePlatformName } from '../hooks/usePlatformName'
import './Proverbs.css'

interface Proverb {
  _id: string
  text: string
  translation?: string
  explanation: string
  country?: {
    _id: string
    name: string
    nameFr: string
    id: string
  }
  countryName: string
  language?: string
  category: string
  tags?: string[]
  source?: string
  author?: string
  isVerified: boolean
  views: number
  likes: number
  isFeatured: boolean
}

interface Country {
  _id: string
  nameFr: string
  id: string
}

export const Proverbs = () => {
  const platformName = usePlatformName()
  const [proverbs, setProverbs] = useState<Proverb[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [countries, setCountries] = useState<Country[]>([])
  const [randomProverb, setRandomProverb] = useState<Proverb | null>(null)

  useEffect(() => {
    fetchProverbs()
    fetchCountries()
    fetchRandomProverb()
  }, [])

  useEffect(() => {
    fetchProverbs()
  }, [selectedCountry, selectedCategory, searchTerm])

  const fetchProverbs = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: 1,
        limit: 50,
        sort: '-createdAt',
      }

      if (selectedCountry) {
        params.countryName = selectedCountry
      }

      if (selectedCategory) {
        params.category = selectedCategory
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await proverbService.getAll(params)
      setProverbs(response.data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des proverbes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await countryService.getAll()
      setCountries(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
    }
  }

  const fetchRandomProverb = async () => {
    try {
      const response = await proverbService.getRandom()
      setRandomProverb(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement du proverbe aléatoire:', error)
    }
  }

  const handleLike = async (id: string) => {
    try {
      await proverbService.like(id)
      setProverbs(prevProverbs =>
        prevProverbs.map(p => p._id === id ? { ...p, likes: p.likes + 1 } : p)
      )
      if (randomProverb && randomProverb._id === id) {
        setRandomProverb({ ...randomProverb, likes: randomProverb.likes + 1 })
      }
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  const categories = ['Sagesse', 'Famille', 'Travail', 'Nature', 'Relations', 'Spiritualité', 'Autre']

  if (loading && proverbs.length === 0) {
    return (
      <Layout>
        <div className="proverbs-page">
          <div className="proverbs-loading">
            <p>Chargement des proverbes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="proverbs-page">
        <div className="proverbs-header">
          <h1>Proverbes Africains</h1>
          <p className="proverbs-subtitle">
            Découvrez la sagesse authentique de l'Afrique à travers ses proverbes traditionnels
          </p>
        </div>

        {/* Proverbe aléatoire en vedette */}
        {randomProverb && (
          <Card className="random-proverb-card">
            <div className="random-proverb-header">
              <span className="random-proverb-badge">Proverbe du jour</span>
              <Button
                size="small"
                variant="outline"
                onClick={fetchRandomProverb}
                className="refresh-random-btn"
              >
                <span className="icon-refresh" />
                Nouveau proverbe
              </Button>
            </div>
            <div className="random-proverb-content">
              <blockquote className="proverb-text-large">
                "{randomProverb.text}"
              </blockquote>
              {randomProverb.translation && (
                <p className="proverb-translation">{randomProverb.translation}</p>
              )}
              <div className="proverb-meta">
                <div className="proverb-country">
                  <span className="icon-location" />
                  <span>{randomProverb.countryName}</span>
                  {randomProverb.country && (
                    <Link to={`/country/${randomProverb.country.id}`} className="country-link">
                      Voir le pays
                    </Link>
                  )}
                </div>
                {randomProverb.language && (
                  <div className="proverb-language">
                    <span className="icon-globe" />
                    <span>{randomProverb.language}</span>
                  </div>
                )}
                <div className="proverb-category">
                  <span className="icon-book" />
                  <span>{randomProverb.category}</span>
                </div>
              </div>
              <div className="proverb-explanation">
                <h4>Explication</h4>
                <p>{randomProverb.explanation}</p>
              </div>
              {randomProverb.source && (
                <div className="proverb-source">
                  <span className="icon-file" />
                  <span>Source: {randomProverb.source}</span>
                </div>
              )}
              <div className="proverb-actions">
                <button
                  className="like-btn"
                  onClick={() => handleLike(randomProverb._id)}
                  title="J'aime ce proverbe"
                >
                  <span className="icon-heart" />
                  <span>{randomProverb.likes}</span>
                </button>
                <div className="proverb-stats">
                  <span className="icon-eye" />
                  <span>{randomProverb.views} vues</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filtres et recherche */}
        <div className="proverbs-filters">
          <div className="search-bar">
            <span className="icon-search" />
            <Input
              id="proverb-search"
              name="proverb-search"
              placeholder="Rechercher un proverbe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-row">
            <select
              id="proverb-country-filter"
              name="proverb-country-filter"
              className="filter-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">Tous les pays</option>
              {countries.map((country) => (
                <option key={country._id} value={country.nameFr}>
                  {country.nameFr}
                </option>
              ))}
            </select>
            <select
              id="proverb-category-filter"
              name="proverb-category-filter"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des proverbes */}
        <div className="proverbs-grid">
          {proverbs.length === 0 ? (
            <Card className="empty-state">
              <span className="icon-book" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
              <p>Aucun proverbe trouvé.</p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline" size="small">
                  Effacer la recherche
                </Button>
              )}
            </Card>
          ) : (
            proverbs.map((proverb) => (
              <Card key={proverb._id} className="proverb-card">
                <div className="proverb-card-header">
                  {proverb.isFeatured && (
                    <span className="featured-badge">En vedette</span>
                  )}
                  {proverb.isVerified && (
                    <span className="verified-badge">
                      <span className="icon-check" />
                      Vérifié
                    </span>
                  )}
                </div>
                <blockquote className="proverb-text">
                  "{proverb.text}"
                </blockquote>
                {proverb.translation && (
                  <p className="proverb-translation-small">{proverb.translation}</p>
                )}
                <div className="proverb-meta-small">
                  <div className="proverb-country-small">
                    <span className="icon-location" />
                    <span>{proverb.countryName}</span>
                    {proverb.country && (
                      <Link to={`/country/${proverb.country.id}`} className="country-link-small">
                        Voir
                      </Link>
                    )}
                  </div>
                  <div className="proverb-category-small">
                    <span className="icon-book" />
                    <span>{proverb.category}</span>
                  </div>
                </div>
                <div className="proverb-explanation-small">
                  <p>{proverb.explanation}</p>
                </div>
                {proverb.source && (
                  <div className="proverb-source-small">
                    <span className="icon-file" />
                    <span>Source: {proverb.source}</span>
                  </div>
                )}
                {proverb.tags && proverb.tags.length > 0 && (
                  <div className="proverb-tags">
                    {proverb.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="proverb-actions-small">
                  <button
                    className="like-btn-small"
                    onClick={() => handleLike(proverb._id)}
                    title="J'aime ce proverbe"
                  >
                    <span className="icon-heart" />
                    <span>{proverb.likes}</span>
                  </button>
                  <div className="proverb-stats-small">
                    <span className="icon-eye" />
                    <span>{proverb.views}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

