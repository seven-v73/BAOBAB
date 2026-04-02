import { useState, useEffect } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, Globe, BookOpen, ShoppingBag, BarChart3, Music, Palette, History, UtensilsCrossed, Languages, Leaf, Shield, GraduationCap, Users2, Award, TrendingUp, Clock, Star } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { allAfricanCountries, type AfricanCountry } from '../data/allAfricanCountries'
import { homeService } from '../services/api'
import './Home.css'

// Fonction pour obtenir l'URL du drapeau d'un pays
const getFlagUrl = (countryId: string, size: 'w40' | 'w80' | 'w160' = 'w80') => {
  // Mapping pour les codes spéciaux
  const codeMap: Record<string, string> = {
    'EH': 'eh', // Sahara occidental
  }
  
  const code = codeMap[countryId] || countryId.toLowerCase()
  return `https://flagcdn.com/${size}/${code}.png`
}

interface HomeStats {
  countries: number
  blogPosts: number
  products: number
  events: number
  figures: number
  stories: number
  collections: number
  users: number
  totalViews: number
}

export const Home = () => {
  const platformName = usePlatformName()
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featuredContent, setFeaturedContent] = useState<any>(null)
  const [trendingContent, setTrendingContent] = useState<any>(null)
  const [recentContent, setRecentContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Trier les pays par ordre alphabétique (A-Z)
  const sortedCountries = [...allAfricanCountries].sort((a, b) => 
    a.nameFr.localeCompare(b.nameFr, 'fr', { sensitivity: 'base' })
  )

  const filteredCountries = sortedCountries.filter(country =>
    country.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.capital.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [statsRes, featuredRes, trendingRes, recentRes] = await Promise.all([
          homeService.getStats().catch(() => ({ data: null })),
          homeService.getFeatured({ limit: 6 }).catch(() => ({ data: null })),
          homeService.getTrending({ limit: 5, period: '7d' }).catch(() => ({ data: null })),
          homeService.getRecent({ limit: 6 }).catch(() => ({ data: null })),
        ])

        if (statsRes.data) setStats(statsRes.data)
        if (featuredRes.data) setFeaturedContent(featuredRes.data)
        if (trendingRes.data) setTrendingContent(trendingRes.data)
        if (recentRes.data) setRecentContent(recentRes.data)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  return (
    <Layout>
      <div className="home">
        <section className="hero">
          <h1 className="hero-title">
            Découvrez les Valeurs et Richesses de l'Afrique
          </h1>
          <p className="hero-subtitle">
            Explorez la culture, l'histoire et les produits authentiques du continent africain
          </p>
          <div className="hero-actions">
            <Link to="/shop">
              <Button size="large">Découvrir la Boutique</Button>
            </Link>
            <Link to="/blog">
              <Button variant="outline" size="large">Lire le Blog</Button>
            </Link>
          </div>
        </section>

        {/* Liste des pays africains */}
        <section className="african-countries-section">
          <div className="section-header">
            <h2 className="section-title">Les 54 Pays d'Afrique</h2>
            <p className="section-subtitle">
              Découvrez les richesses culturelles de chaque pays africain
            </p>
          </div>
          
          <div className="countries-search">
            <Search className="search-icon" size={20} />
            <input
              id="countries-search-input"
              name="countries-search-input"
              type="text"
              placeholder="Rechercher un pays ou une capitale..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="countries-grid">
            {filteredCountries.map((country) => (
              <Card
                key={country.id}
                className={`country-card ${selectedCountry?.id === country.id ? 'selected' : ''}`}
                onClick={() => setSelectedCountry(country)}
              >
                <div className="country-card-header">
                  <div className="country-flag-small">
                    <img 
                      src={getFlagUrl(country.id, 'w80')} 
                      alt={`Drapeau de ${country.nameFr}`}
                      onError={(e) => {
                        // Fallback en cas d'erreur de chargement
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.style.backgroundColor = country.color
                      }}
                    />
                  </div>
                  <div className="country-title-group">
                    <h3>{country.nameFr}</h3>
                    <span className="country-code">{country.id}</span>
                  </div>
                </div>
                <div className="country-card-info">
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{country.capital}</span>
                  </div>
                  <div className="info-item">
                    <Users size={16} />
                    <span>{country.population}</span>
                  </div>
                  <div className="info-item">
                    <Globe size={16} />
                    <span>{country.area}</span>
                  </div>
                </div>
                <p className="country-description-short">{country.description}</p>
                <div className="country-card-footer">
                  <Link 
                    to={`/country/${country.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="outline" size="small">
                      Découvrir plus →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Informations détaillées du pays sélectionné */}
          {selectedCountry && (
            <div className="country-detail-modal" onClick={() => setSelectedCountry(null)}>
              <div className="country-detail-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="close-button"
                  onClick={() => setSelectedCountry(null)}
                  aria-label="Fermer"
                >
                  ×
                </button>
                <div className="country-detail-header">
                  <div className="country-flag">
                    <img 
                      src={getFlagUrl(selectedCountry.id, 'w160')} 
                      alt={`Drapeau de ${selectedCountry.nameFr}`}
                      onError={(e) => {
                        // Fallback en cas d'erreur de chargement
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.style.backgroundColor = selectedCountry.color
                      }}
                    />
                  </div>
                  <h3>{selectedCountry.nameFr}</h3>
                </div>
                <div className="country-detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Capitale</span>
                    <span className="detail-value">{selectedCountry.capital}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Population</span>
                    <span className="detail-value">{selectedCountry.population}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Superficie</span>
                    <span className="detail-value">{selectedCountry.area}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Langues</span>
                    <span className="detail-value">{selectedCountry.languages.join(', ')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Monnaie</span>
                    <span className="detail-value">{selectedCountry.currency}</span>
                  </div>
                  <div className="country-description-full">
                    <p>{selectedCountry.description}</p>
                  </div>
                  <div className="country-culture-full">
                    <h4>Culture & Traditions</h4>
                    <p>{selectedCountry.culture}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Informations culturelles sur l'Afrique */}
        <section className="culture-section">
          <div className="section-header">
            <h2 className="section-title">Culture & Traditions Africaines</h2>
            <p className="section-subtitle">
              Explorez la richesse culturelle du continent africain
            </p>
          </div>
          <div className="culture-grid">
            <Card className="culture-card">
              <div className="culture-card-icon">
                <Music size={32} />
              </div>
              <h3>Musique Africaine</h3>
              <p>
                L'Afrique est le berceau de la musique. Du jazz au reggae, en passant par 
                l'afrobeat et le mbalax, la musique africaine a influencé le monde entier. 
                Chaque région apporte ses rythmes uniques et ses instruments traditionnels.
              </p>
            </Card>
            
            <Card className="culture-card">
              <div className="culture-card-icon">
                <Palette size={32} />
              </div>
              <h3>Arts & Artisanat</h3>
              <p>
                L'art africain est d'une richesse inégalée : masques traditionnels, sculptures 
                en bois, tissus kente et wax, poteries, bijoux en perles. Chaque œuvre raconte 
                une histoire et préserve les traditions ancestrales.
              </p>
            </Card>
            
            <Card className="culture-card">
              <div className="culture-card-icon">
                <History size={32} />
              </div>
              <h3>Histoire & Civilisations</h3>
              <p>
                L'Afrique a vu naître certaines des plus grandes civilisations : l'Égypte 
                antique, l'Empire du Mali, le Royaume du Ghana, l'Empire Songhaï. Ces 
                civilisations ont laissé un héritage architectural et culturel exceptionnel.
              </p>
            </Card>
            
            <Card className="culture-card">
              <div className="culture-card-icon">
                <UtensilsCrossed size={32} />
              </div>
              <h3>Cuisine Africaine</h3>
              <p>
                La cuisine africaine est variée et savoureuse : couscous, jollof rice, 
                thieboudienne, injera, fufu, et bien d'autres. Chaque pays apporte ses 
                spécialités culinaires uniques, riches en épices et en saveurs.
              </p>
            </Card>
            
            <Card className="culture-card">
              <div className="culture-card-icon">
                <Languages size={32} />
              </div>
              <h3>Langues & Littérature</h3>
              <p>
                L'Afrique compte plus de 2000 langues. Des écrivains africains comme 
                Chinua Achebe, Wole Soyinka, et Léopold Sédar Senghor ont enrichi la 
                littérature mondiale avec leurs œuvres puissantes.
              </p>
            </Card>
            
            <Card className="culture-card">
              <div className="culture-card-icon">
                <Leaf size={32} />
              </div>
              <h3>Médecine Traditionnelle</h3>
              <p>
                La médecine traditionnelle africaine utilise les plantes et les connaissances 
                ancestrales. Le baobab, le moringa, le karité sont des trésors naturels 
                utilisés depuis des millénaires pour leurs vertus.
              </p>
            </Card>
          </div>
        </section>

        {/* Statistiques sur l'Afrique */}
        <section className="stats-section">
          <div className="section-header">
            <h2 className="section-title">L'Afrique en Chiffres</h2>
          </div>
          <div className="stats-grid">
            {loading ? (
              <>
                <div className="stat-card">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Chargement...</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Chargement...</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Chargement...</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Chargement...</div>
                </div>
              </>
            ) : stats ? (
              <>
                <div className="stat-card">
                  <div className="stat-number">{stats.countries}</div>
                  <div className="stat-label">Pays</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.blogPosts}</div>
                  <div className="stat-label">Articles de blog</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.products}</div>
                  <div className="stat-label">Produits</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.events}</div>
                  <div className="stat-label">Événements historiques</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.figures}</div>
                  <div className="stat-label">Figures historiques</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalViews.toLocaleString()}</div>
                  <div className="stat-label">Vues totales</div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-number">54</div>
                  <div className="stat-label">Pays</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">1,4</div>
                  <div className="stat-label">Milliards d'habitants</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">30,3</div>
                  <div className="stat-label">Millions de km²</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">2000+</div>
                  <div className="stat-label">Langues</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Contenu en vedette */}
        {featuredContent && (
          <section className="featured-section">
            <div className="section-header">
              <h2 className="section-title">
                <Star size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Contenu en Vedette
              </h2>
              <p className="section-subtitle">Découvrez nos sélections spéciales</p>
            </div>
            <div className="featured-content">
              {featuredContent.blogs && featuredContent.blogs.length > 0 && (
                <div className="featured-category">
                  <h3>Articles Populaires</h3>
                  <div className="featured-grid">
                    {featuredContent.blogs.slice(0, 3).map((blog: any) => (
                      <Card key={blog._id} className="featured-item">
                        {blog.image && (
                          <div className="featured-image">
                            <img src={blog.image} alt={blog.title} />
                          </div>
                        )}
                        <div className="featured-content-text">
                          <span className="featured-category-tag">{blog.category}</span>
                          <h4>{blog.title}</h4>
                          <p>{blog.excerpt || blog.title}</p>
                          <Link to={`/blog/${blog._id}`}>
                            <Button variant="outline" size="small">Lire</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {featuredContent.products && featuredContent.products.length > 0 && (
                <div className="featured-category">
                  <h3>Produits en Vedette</h3>
                  <div className="featured-grid">
                    {featuredContent.products.slice(0, 3).map((product: any) => (
                      <Card key={product._id} className="featured-item">
                        {product.images && product.images[0] && (
                          <div className="featured-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        )}
                        <div className="featured-content-text">
                          <span className="featured-category-tag">{product.category}</span>
                          <h4>{product.name}</h4>
                          <p className="featured-price">
                            {product.price?.toLocaleString()} {product.currency || 'FCFA'}
                          </p>
                          <Link to={`/shop`}>
                            <Button variant="outline" size="small">Voir</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contenu tendance */}
        {trendingContent && (
          <section className="trending-section">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Tendances
              </h2>
              <p className="section-subtitle">Ce qui est populaire en ce moment</p>
            </div>
            <div className="trending-content">
              {trendingContent.blogs && trendingContent.blogs.length > 0 && (
                <div className="trending-category">
                  <h3>Articles Tendance</h3>
                  <div className="trending-list">
                    {trendingContent.blogs.map((blog: any) => (
                      <Card key={blog._id} className="trending-item">
                        <div className="trending-item-content">
                          {blog.image && (
                            <div className="trending-item-image">
                              <img src={blog.image} alt={blog.title} />
                            </div>
                          )}
                          <div className="trending-item-text">
                            <h4>{blog.title}</h4>
                            <div className="trending-meta">
                              <span>{blog.views} vues</span>
                              <span className="trending-category-tag">{blog.category}</span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/blog/${blog._id}`}>
                          <Button variant="outline" size="small">Lire</Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contenu récent */}
        {recentContent && (
          <section className="recent-section">
            <div className="section-header">
              <h2 className="section-title">
                <Clock size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Contenu Récent
              </h2>
              <p className="section-subtitle">Derniers ajouts sur la plateforme</p>
            </div>
            <div className="recent-content">
              {recentContent.events && recentContent.events.length > 0 && (
                <div className="recent-category">
                  <h3>Événements Récents</h3>
                  <div className="recent-grid">
                    {recentContent.events.slice(0, 3).map((event: any) => (
                      <Card key={event._id} className="recent-item">
                        <div className="recent-item-content">
                          <h4>{event.title}</h4>
                          <p>{event.shortDescription || event.description?.substring(0, 100)}...</p>
                          <div className="recent-meta">
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                            {event.location?.country && (
                              <span>{event.location.country.nameFr}</span>
                            )}
                          </div>
                          <Link to={`/timeline/${event._id}`}>
                            <Button variant="outline" size="small">En savoir plus</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {recentContent.figures && recentContent.figures.length > 0 && (
                <div className="recent-category">
                  <h3>Figures Historiques Récentes</h3>
                  <div className="recent-grid">
                    {recentContent.figures.slice(0, 3).map((figure: any) => (
                      <Card key={figure._id} className="recent-item">
                        <div className="recent-item-content">
                          {figure.image && (
                            <div className="recent-item-image">
                              <img src={figure.image} alt={figure.name} />
                            </div>
                          )}
                          <h4>{figure.name}</h4>
                          {figure.nameNative && <p className="recent-native-name">{figure.nameNative}</p>}
                          <p>{figure.shortBiography?.substring(0, 100)}...</p>
                          <Link to={`/figures/${figure._id}`}>
                            <Button variant="outline" size="small">Voir la biographie</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section valeurs */}
        <section className="values">
          <div className="section-header">
            <h2 className="section-title">Nos Valeurs</h2>
          </div>
          <div className="values-grid">
            <Card className="value-card">
              <div className="value-card-icon">
                <Shield size={32} />
              </div>
              <h3>Authenticité</h3>
              <p>Des produits et contenus authentiques directement issus du continent africain</p>
            </Card>
            <Card className="value-card">
              <div className="value-card-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Éducation</h3>
              <p>Partageons l'histoire riche et diverse de l'Afrique à travers notre blog</p>
            </Card>
            <Card className="value-card">
              <div className="value-card-icon">
                <Users2 size={32} />
              </div>
              <h3>Communauté</h3>
              <p>Rejoignez une communauté passionnée par la culture africaine</p>
            </Card>
            <Card className="value-card">
              <div className="value-card-icon">
                <Award size={32} />
              </div>
              <h3>Qualité</h3>
              <p>Des produits sélectionnés avec soin pour leur qualité exceptionnelle</p>
            </Card>
          </div>
        </section>

        {/* Section fonctionnalités */}
        <section className="features">
          <div className="section-header">
            <h2 className="section-title">Explorez {platformName}</h2>
          </div>
          <div className="features-grid">
            <Card className="feature-card">
              <div className="feature-icon">
                <BookOpen size={32} />
              </div>
              <h3>Blog</h3>
              <p>Retracez l'histoire fascinante de l'Afrique à travers nos articles</p>
              <Link to="/blog">
                <Button variant="outline">Lire les articles</Button>
              </Link>
            </Card>
            <Card className="feature-card">
              <div className="feature-icon">
                <ShoppingBag size={32} />
              </div>
              <h3>E-commerce</h3>
              <p>Découvrez notre sélection de produits africains authentiques</p>
              <Link to="/shop">
                <Button variant="outline">Voir les produits</Button>
              </Link>
            </Card>
            <Card className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Dashboard</h3>
              <p>Gérez vos commandes et suivez votre activité</p>
              <Link to="/login">
                <Button variant="outline">Se connecter</Button>
              </Link>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}
