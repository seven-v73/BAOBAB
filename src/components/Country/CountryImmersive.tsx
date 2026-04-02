import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, Users, Globe, Calendar, Sparkles, Music, Palette, 
  History, UtensilsCrossed, Languages, Award, BookOpen,
  TrendingUp, Clock, Star, ArrowRight, Play, Image as ImageIcon
} from 'lucide-react'
import { Card } from '../Card/Card'
import { Button } from '../Button/Button'
import { countryService, figureService, timelineService, storyService, productService, proverbService } from '../../services/api'
import './CountryImmersive.css'

interface CountryImmersiveProps {
  countryId: string
  country: any
}

export const CountryImmersive = ({ countryId, country }: CountryImmersiveProps) => {
  const [relatedFigures, setRelatedFigures] = useState<any[]>([])
  const [relatedEvents, setRelatedEvents] = useState<any[]>([])
  const [relatedStories, setRelatedStories] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [relatedProverbs, setRelatedProverbs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    if (countryId && country) {
      fetchRelatedContent()
    }
  }, [countryId, country])

  useEffect(() => {
    // Configurer les animations après le chargement du contenu
    const timer = setTimeout(() => {
      setupScrollAnimations()
    }, 200)
    
    return () => clearTimeout(timer)
  }, [loading])

  const fetchRelatedContent = async () => {
    try {
      setLoading(true)
      const [figuresRes, eventsRes, storiesRes, productsRes, proverbsRes] = await Promise.all([
        figureService.getAll({ country: countryId, limit: 6 }).catch(() => ({ data: null })),
        timelineService.getAll({ country: countryId, limit: 6 }).catch(() => ({ data: null })),
        storyService.getAll({ country: countryId, limit: 6 }).catch(() => ({ data: null })),
        productService.getAll({ country: country.nameFr, limit: 6 }).catch(() => ({ data: null })),
        proverbService.getAll({ country: countryId, limit: 5 }).catch(() => ({ data: null }))
      ])

      // Gérer les différents formats de réponse API
      // Format attendu: { data: { figures: [], pagination: {} } }
      if (figuresRes.data?.figures) {
        setRelatedFigures(figuresRes.data.figures)
      }
      
      if (eventsRes.data?.events) {
        setRelatedEvents(eventsRes.data.events)
      }
      
      if (storiesRes.data?.stories) {
        setRelatedStories(storiesRes.data.stories)
      }
      
      if (productsRes.data?.products) {
        setRelatedProducts(productsRes.data.products)
      } else if (Array.isArray(productsRes.data)) {
        // Certains endpoints peuvent retourner directement un array
        setRelatedProducts(productsRes.data)
      }
      
      if (proverbsRes.data?.proverbs) {
        setRelatedProverbs(proverbsRes.data.proverbs)
      } else if (Array.isArray(proverbsRes.data)) {
        setRelatedProverbs(proverbsRes.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu lié:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupScrollAnimations = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            const sectionId = entry.target.getAttribute('data-section')
            if (sectionId) setActiveSection(sectionId)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    // Observer les sections après un court délai pour s'assurer qu'elles sont dans le DOM
    const timer = setTimeout(() => {
      Object.values(sectionsRef.current).forEach((section) => {
        if (section) observer.observe(section)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      Object.values(sectionsRef.current).forEach((section) => {
        if (section) observer.unobserve(section)
      })
      observer.disconnect()
    }
  }

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return (
    <div className="country-immersive">
      {/* Section Statistiques Animées */}
      <section 
        className="immersive-section stats-section"
        ref={(el) => sectionsRef.current['stats'] = el}
        data-section="stats"
      >
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-value">{formatNumber(country.population)}</div>
            <div className="stat-label">Habitants</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Globe size={32} />
            </div>
            <div className="stat-value">{country.area}</div>
            <div className="stat-label">Superficie</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Languages size={32} />
            </div>
            <div className="stat-value">{country.languages?.length || 0}</div>
            <div className="stat-label">Langues</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={32} />
            </div>
            <div className="stat-value">{country.capital}</div>
            <div className="stat-label">Capitale</div>
          </div>
        </div>
      </section>

      {/* Section Personnages Historiques */}
      {relatedFigures.length > 0 && (
        <section 
          className="immersive-section figures-section"
          ref={(el) => sectionsRef.current['figures'] = el}
          data-section="figures"
        >
          <div className="section-header-immersive">
            <div className="section-icon-wrapper">
              <Award size={40} />
            </div>
            <div>
              <h2>Personnages Historiques</h2>
              <p className="section-subtitle">Découvrez les grandes figures qui ont marqué l'histoire de ce pays</p>
            </div>
            <Link to={`/figures?country=${countryId}`} className="section-link">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>
          <div className="content-grid">
            {relatedFigures.slice(0, 6).map((figure) => (
              <Link key={figure._id} to={`/figures/${figure._id}`} className="content-card">
                <div className="content-card-image">
                  {figure.image ? (
                    <img src={figure.image} alt={figure.name} />
                  ) : (
                    <div className="content-card-placeholder">
                      <Award size={48} />
                    </div>
                  )}
                </div>
                <div className="content-card-content">
                  <h3>{figure.name}</h3>
                  {figure.nameNative && <p className="content-card-subtitle">{figure.nameNative}</p>}
                  {figure.role && <span className="content-card-badge">{figure.role}</span>}
                  {figure.shortBiography && (
                    <p className="content-card-description">{figure.shortBiography.substring(0, 100)}...</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section Événements Historiques */}
      {relatedEvents.length > 0 && (
        <section 
          className="immersive-section events-section"
          ref={(el) => sectionsRef.current['events'] = el}
          data-section="events"
        >
          <div className="section-header-immersive">
            <div className="section-icon-wrapper">
              <History size={40} />
            </div>
            <div>
              <h2>Événements Historiques</h2>
              <p className="section-subtitle">Explorez les moments clés de l'histoire de ce pays</p>
            </div>
            <Link to={`/timeline?country=${countryId}`} className="section-link">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>
          <div className="timeline-immersive">
            {relatedEvents.slice(0, 6).map((event, index) => (
              <div key={event._id} className="timeline-item">
                <div className="timeline-marker">
                  <Calendar size={20} />
                </div>
                <Link to={`/timeline/${event._id}`} className="timeline-content">
                  <div className="timeline-date">
                    {new Date(event.date).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <h3>{event.title}</h3>
                  {event.shortDescription && (
                    <p>{event.shortDescription.substring(0, 150)}...</p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section Récits & Histoires */}
      {relatedStories.length > 0 && (
        <section 
          className="immersive-section stories-section"
          ref={(el) => sectionsRef.current['stories'] = el}
          data-section="stories"
        >
          <div className="section-header-immersive">
            <div className="section-icon-wrapper">
              <BookOpen size={40} />
            </div>
            <div>
              <h2>Récits & Histoires</h2>
              <p className="section-subtitle">Plongez dans les histoires et légendes de ce pays</p>
            </div>
            <Link to={`/stories?country=${countryId}`} className="section-link">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>
          <div className="content-grid">
            {relatedStories.slice(0, 6).map((story) => (
              <Link key={story._id} to={`/stories/${story._id}`} className="content-card story-card">
                {story.coverImage && (
                  <div className="content-card-image">
                    <img src={story.coverImage} alt={story.title} />
                    <div className="story-overlay">
                      <Play size={32} />
                    </div>
                  </div>
                )}
                <div className="content-card-content">
                  <h3>{story.title}</h3>
                  {story.subtitle && <p className="content-card-subtitle">{story.subtitle}</p>}
                  {story.description && (
                    <p className="content-card-description">{story.description.substring(0, 120)}...</p>
                  )}
                  {story.readingTime && (
                    <div className="content-card-meta">
                      <Clock size={16} />
                      <span>{story.readingTime} min</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section Produits */}
      {relatedProducts.length > 0 && (
        <section 
          className="immersive-section products-section"
          ref={(el) => sectionsRef.current['products'] = el}
          data-section="products"
        >
          <div className="section-header-immersive">
            <div className="section-icon-wrapper">
              <Sparkles size={40} />
            </div>
            <div>
              <h2>Produits Authentiques</h2>
              <p className="section-subtitle">Découvrez les produits artisanaux et authentiques de ce pays</p>
            </div>
            <Link to={`/shop?country=${country.nameFr}`} className="section-link">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>
          <div className="content-grid">
            {relatedProducts.slice(0, 6).map((product) => (
              <Link key={product._id} to={`/shop/${product._id}`} className="content-card product-card">
                {product.images && product.images.length > 0 && (
                  <div className="content-card-image">
                    <img src={product.images[0]} alt={product.name} />
                    {product.isFeatured && (
                      <div className="product-badge">
                        <Star size={16} />
                        <span>Vedette</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="content-card-content">
                  <h3>{product.name}</h3>
                  {product.shortDescription && (
                    <p className="content-card-description">{product.shortDescription.substring(0, 100)}...</p>
                  )}
                  <div className="product-price">
                    {product.price?.fcfa && (
                      <span className="price-main">{product.price.fcfa.toLocaleString()} FCFA</span>
                    )}
                    {product.rating && product.rating.average > 0 && (
                      <div className="product-rating">
                        <Star size={16} fill="#d4af37" />
                        <span>{product.rating.average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section Proverbes */}
      {relatedProverbs.length > 0 && (
        <section 
          className="immersive-section proverbs-section"
          ref={(el) => sectionsRef.current['proverbs'] = el}
          data-section="proverbs"
        >
          <div className="section-header-immersive">
            <div className="section-icon-wrapper">
              <Sparkles size={40} />
            </div>
            <div>
              <h2>Proverbes & Sagesse</h2>
              <p className="section-subtitle">La sagesse traditionnelle de ce pays</p>
            </div>
            <Link to={`/proverbs?country=${countryId}`} className="section-link">
              Voir tout <ArrowRight size={20} />
            </Link>
          </div>
          <div className="proverbs-grid">
            {relatedProverbs.map((proverb) => (
              <Card key={proverb._id} className="proverb-card">
                <div className="proverb-quote">"</div>
                <p className="proverb-text">{proverb.text}</p>
                {proverb.translation && (
                  <p className="proverb-translation">{proverb.translation}</p>
                )}
                {proverb.explanation && (
                  <p className="proverb-explanation">{proverb.explanation}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

