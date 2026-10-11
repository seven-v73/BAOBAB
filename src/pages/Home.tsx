import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Lightbulb, MapPinned, Palette, Sprout, UsersRound } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import { Layout } from '../components/Layout/Layout'
import { Button } from '../components/Button/Button'
import { allAfricanCountries, type AfricanCountry } from '../data/allAfricanCountries'
import { homeService } from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'
import './Home.css'

const getFlagUrl = (countryId: string, size: 'w40' | 'w80' | 'w160' | 'w320' = 'w160') => {
  return `https://flagcdn.com/${size}/${countryId.toLowerCase()}.png`
}

interface HomeStats {
  countries: number
  blogPosts: number
  products: number
  events: number
  figures: number
  stories: number
  collections: number
  proverbs?: number
  quizzes?: number
  communities?: number
  sources?: number
  users: number
  totalViews: number
}

interface AfricanNewsItem {
  id: string
  title: string
  excerpt: string
  category: string
  country: string
  image: string
  source: string
  date: string
  url: string
}

const recommendedCountryIds = ['SN', 'GH', 'CI', 'NG', 'BF', 'ML']

const countryEditorialNotes: Record<string, string> = {
  SN: 'Teranga, Dakar, Saint-Louis, musique mbalax, oralite wolof et memoire atlantique.',
  GH: 'Kente, heritage ashanti, Accra creative, forts cotiers et premiere independance subsaharienne.',
  CI: 'Abidjan, Yamoussoukro, cacao, zouglou, masques, lagunes et cultures akan, mande et kru.',
  NG: 'Lagos, Kano, Abuja, Nollywood, afrobeat, cultures yoruba, haoussa, igbo et economie creative.',
  BF: 'Ouagadougou, FESPACO, masques, integrite, artisanats et carrefours saheliens.',
  ML: 'Bamako, Tombouctou, Djenne, griots, empires mandingues et routes du Niger.',
}

const defaultTeamMembers = [
  {
    name: 'Victoire Sawadogo',
    role: 'IT Support',
    nationality: 'Burkina Faso',
    flag: getFlagUrl('BF', 'w80'),
    image: '/Equipe/Victoire%20SAWADOGO.jpeg',
    focus: 'center 38%',
    profileUrl: '',
  },
  {
    name: 'Blanchard Kouassi',
    role: 'Referent Digital et Createur de Contenu',
    nationality: "Cote d'Ivoire",
    flag: getFlagUrl('CI', 'w80'),
    image: '/Equipe/Blanchard%20Kouassi.jpeg',
    focus: 'center 35%',
    profileUrl: '',
  },
  {
    name: 'Dieudonne Dara',
    role: 'Developpeur Fullstack et Designer',
    nationality: 'Mali',
    flag: getFlagUrl('ML', 'w80'),
    image: '/Equipe/Dieudonn%C3%A9%20Dara.jpeg',
    focus: 'center 34%',
    profileUrl: '',
  },
]

const teamCreativeNotes = [
  { eyebrow: 'Soutenir', line: "Rendre l'acces simple, rapide et fiable au quotidien." },
  { eyebrow: 'Raconter', line: 'Transformer la matiere culturelle en contenus clairs et vivants.' },
  { eyebrow: 'Construire', line: 'Donner forme a une plateforme stable, belle et pratique.' },
]

const exploreCategories = [
  { num: '01', title: 'Histoires', desc: 'Les récits qui ont façonné nos sociétés.', to: '/stories', icon: BookOpen },
  { num: '02', title: 'Cultures', desc: 'Langues, traditions, arts, cuisines et patrimoines.', to: '/cultures', icon: Palette },
  { num: '03', title: 'Savoirs', desc: 'Les connaissances transmises entre générations.', to: '/knowledge', icon: Lightbulb },
  { num: '04', title: 'Talents', desc: 'Les personnes qui créent et innovent.', to: '/talents', icon: UsersRound },
  { num: '05', title: 'Initiatives', desc: 'Les projets qui transforment les communautés.', to: '/initiatives', icon: Sprout },
  { num: '06', title: 'Territoires', desc: 'Des villes aux villages, des racines aux horizons.', to: '/map', icon: MapPinned },
]

const fallbackNews: AfricanNewsItem[] = [
  {
    id: '1',
    title: 'Une entrepreneure transforme les dechets textiles en mobilier durable.',
    excerpt: "A Abidjan, Awa Kone a developpe un procede innovant pour recycler les chutes de tissu en mobilier design, creant ainsi une dizaine d'emplois.",
    category: 'Innovation',
    country: 'CI',
    image: '/content/blog/ville-abidjan.webp',
    source: 'MonBaobab Veille',
    date: new Date().toISOString(),
    url: '/country/ci',
  },
  {
    id: '2',
    title: 'Un jeune developpeur cree une solution mobile pour les agriculteurs.',
    excerpt: 'Kwame Asante, 24 ans, a lance une application qui connecte les petits producteurs ghanéens aux marches urbains en temps reel.',
    category: 'Technologie',
    country: 'GH',
    image: '/content/blog/marche-mali.webp',
    source: 'MonBaobab Veille',
    date: new Date().toISOString(),
    url: '/country/gh',
  },
  {
    id: '3',
    title: 'Une communaute rurale sauvegarde une langue locale menacee de disparition.',
    excerpt: 'Au Mali, des villageois ont numerise 200 heures de recits oraux pour preserver la langue bamanankan dans sa forme ancestrale.',
    category: 'Culture',
    country: 'ML',
    image: '/content/blog/griot-kora.webp',
    source: 'MonBaobab Veille',
    date: new Date().toISOString(),
    url: '/country/ml',
  },
  {
    id: '4',
    title: 'Une cooperative feminine developpe une nouvelle filiere agricole.',
    excerpt: "Au Burkina Faso, 45 femmes ont uni leurs forces pour transformer le karite en cosmetiques haut de gamme exportes vers l'Europe.",
    category: 'Entrepreneuriat',
    country: 'BF',
    image: '/content/blog/karite-burkina.webp',
    source: 'MonBaobab Veille',
    date: new Date().toISOString(),
    url: '/country/bf',
  },
  {
    id: '5',
    title: 'Le Senegal inaugure la plus grande ferme solaire de l\'Afrique de l\'Ouest.',
    excerpt: 'Le parc photovoltaique de Diass produira 30 MW, alimentant 200 000 foyers et reduisant les emissions de CO2 de 60 000 tonnes par an.',
    category: 'Energie',
    country: 'SN',
    image: '/content/blog/bogolan-mali.webp',
    source: 'MonBaobab Veille',
    date: new Date().toISOString(),
    url: '/country/sn',
  },
]

const baobabStories = [
  {
    name: 'Awa',
    location: 'Abidjan',
    country: 'CI',
    role: 'Creatrice textile',
    excerpt: 'Elle transforme le textile traditionnel en creations contemporaines.',
    image: '/content/blog/bogolan-mali.webp',
  },
  {
    name: 'Moussa',
    location: 'Bobo-Dioulasso',
    country: 'BF',
    role: 'Maitre artisan',
    excerpt: 'Il transmet un savoir-faire familial a une nouvelle generation.',
    image: '/content/products/djembe-guinee.webp',
  },
  {
    name: 'Fatima',
    location: 'Bamako',
    country: 'ML',
    role: 'Innovatrice agricole',
    excerpt: 'Elle developpe des techniques durables pour preserver les sols.',
    image: '/content/blog/karite-burkina.webp',
  },
]

const transmitActions = [
  { label: 'Partager une histoire', to: '/contribute?type=story' },
  { label: 'Documenter un savoir', to: '/contribute?type=knowledge' },
  { label: 'Ajouter un lieu', to: '/contribute?type=place' },
  { label: 'Presenter un talent', to: '/contribute?type=talent' },
  { label: 'Partager une initiative', to: '/contribute?type=initiative' },
]

const communityVerbs = [
  { verb: 'Decouvrir', desc: 'Explorer les recits et les territoires.', to: '/map' },
  { verb: 'Partager', desc: 'Raconter son histoire et sa culture.', to: '/contribute' },
  { verb: 'Creer', desc: 'Proposer du contenu et des initiatives.', to: '/contribute' },
  { verb: 'Transmettre', desc: 'Preserver et passer le flambeau.', to: '/contribute' },
]

const normalizeTeamProfileUrl = (value?: string) => {
  const trimmed = value?.trim() || ''
  if (!trimmed) return ''
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return ''
}

const formatMetricValue = (value?: number | null) => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('fr-FR').format(value)
}

const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export const Home = () => {
  const platformName = usePlatformName()
  const { settings } = useSettingsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featuredContent, setFeaturedContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePanelCountryIndex, setActivePanelCountryIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const [news, setNews] = useState<AfricanNewsItem[]>(fallbackNews)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)

  const revealRef1 = useReveal()
  const revealRef2 = useReveal()
  const revealRef3 = useReveal()
  const revealRef4 = useReveal()
  const revealRef5 = useReveal()
  const revealRef6 = useReveal()

  const recommendedCountries = useMemo(() => {
    return recommendedCountryIds
      .map((id) => allAfricanCountries.find((country) => country.id === id))
      .filter(Boolean) as AfricanCountry[]
  }, [])

  const activePanelCountry = recommendedCountries[activePanelCountryIndex] || recommendedCountries[0]
  const isSearching = searchTerm.trim().length > 0

  const filteredCountries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const sortedCountries = [...allAfricanCountries].sort((a, b) =>
      a.nameFr.localeCompare(b.nameFr, 'fr', { sensitivity: 'base' })
    )
    if (!query) return sortedCountries
    return sortedCountries
      .filter((country) => {
        return (
          country.nameFr.toLowerCase().includes(query) ||
          country.capital.toLowerCase().includes(query) ||
          country.id.toLowerCase().includes(query)
        )
      })
      .slice(0, 12)
  }, [searchTerm])

  const teamMembers = useMemo(() => {
    const configuredTeam = settings?.team?.filter((member) => member.name && member.image)
    return configuredTeam && configuredTeam.length > 0 ? configuredTeam : defaultTeamMembers
  }, [settings?.team])

  const homeMetrics = useMemo(() => [
    { label: 'Pays', value: stats?.countries || allAfricanCountries.length },
    { label: 'Figures', value: stats?.figures },
    { label: 'Sources', value: stats?.sources },
    { label: 'Objets', value: stats?.products },
  ], [stats])

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [statsRes, featuredRes] = await Promise.all([
          homeService.getStats().catch(() => ({ data: null })),
          homeService.getFeatured({ limit: 4 }).catch(() => ({ data: null })),
        ])
        if (statsRes.data) setStats(statsRes.data)
        if (featuredRes.data) setFeaturedContent(featuredRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement de l'accueil:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news/africa')
        if (res.ok) {
          const data = await res.json()
          const articles = Array.isArray(data) ? data : data.items
          if (Array.isArray(articles) && articles.length > 0) {
            setNews(articles)
          }
        }
      } catch {
        // Keep fallback data
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    if (recommendedCountries.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => {
      setActivePanelCountryIndex((currentIndex) => (currentIndex + 1) % recommendedCountries.length)
    }, 4200)
    return () => window.clearInterval(interval)
  }, [recommendedCountries.length])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isPaused || news.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % news.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, news.length])

  const nextSlide = useCallback(() => setActiveSlide((prev) => (prev + 1) % news.length), [news.length])
  const prevSlide = useCallback(() => setActiveSlide((prev) => (prev - 1 + news.length) % news.length), [news.length])

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) <= 50) return
    if (diff > 0) nextSlide()
    else prevSlide()
  }

  return (
    <Layout fullWidth>
      <main className="home">
        <nav className={`home-sticky-nav ${scrolled ? 'is-visible' : ''}`} aria-label="Navigation principale">
          <div className="sticky-nav-inner">
            <Link to="/" className="sticky-logo">{platformName}</Link>
            <div className="sticky-links">
              <a href="#explorer">Explorer</a>
              <a href="#aujourdhui">Aujourd’hui</a>
              <a href="#territoires">Territoires</a>
              <a href="#communaute">Communauté</a>
            </div>
            <Link to="/contribute" className="sticky-cta">Contribuer</Link>
          </div>
        </nav>

        <section className="home-hero" aria-label="Accueil MonBaobab">
          <div className="home-hero-inner">
            <div className="home-hero-main">
              <p className="home-hero-kicker">Racines profondes · Horizons ouverts</p>
              <h1 className="home-hero-title">
                L’Afrique a beaucoup à raconter.
                <em>Nous sommes là pour la faire vivre.</em>
              </h1>
              <p className="home-hero-lead">
                Découvrez les histoires, cultures, savoirs, talents, créations et initiatives 
                qui font l’Afrique d’aujourd’hui et de demain.
              </p>
              <div className="home-hero-actions">
                <Link to="/map"><Button size="large">Explorer MonBaobab</Button></Link>
                <Link to="/contribute" className="hero-link-secondary">Partager mon histoire</Link>
              </div>
              <ul className="hero-pillars" aria-label="Les engagements MonBaobab">
                <li><span>01</span> Découvrir</li>
                <li><span>02</span> Valoriser</li>
                <li><span>03</span> Transmettre</li>
              </ul>
            </div>

            <aside className="home-hero-panel" aria-label="Parcours conseille">
              <span className="panel-label">Un territoire à la fois</span>
              <h2>{activePanelCountry ? `Commencer par ${activePanelCountry.nameFr}` : "Commencer par l’Afrique de l’Ouest"}</h2>
              <p>{activePanelCountry ? countryEditorialNotes[activePanelCountry.id] || activePanelCountry.description : 'Textiles, royaumes, ports, musiques urbaines et grandes routes marchandes.'}</p>
              <div className="panel-country-focus">
                <img src={getFlagUrl(activePanelCountry?.id || 'SN', 'w160')} alt="" />
                <div>
                  <strong>{activePanelCountry?.capital}</strong>
                  <span>{activePanelCountry?.population} &middot; {activePanelCountry?.currency}</span>
                </div>
              </div>
              <div className="panel-strip" role="tablist" aria-label="Choisir un pays conseille">
                {recommendedCountries.map((country, index) => (
                  <button
                    type="button"
                    key={country.id}
                    className={index === activePanelCountryIndex ? 'active' : ''}
                    onClick={() => setActivePanelCountryIndex(index)}
                    aria-label={`Afficher ${country.nameFr}`}
                    aria-selected={index === activePanelCountryIndex}
                  >
                    <img src={getFlagUrl(country.id, 'w80')} alt="" />
                  </button>
                ))}
              </div>
              <Link to={`/country/${(activePanelCountry?.id || 'SN').toLowerCase()}`} className="panel-cta">
                Lire la fiche {activePanelCountry?.nameFr || 'Senegal'} <span>&rarr;</span>
              </Link>
            </aside>
          </div>
        </section>

        <section className="home-metrics" aria-label="Chiffres cles">
          {homeMetrics.map((metric) => (
            <div key={metric.label}>
              <strong>{loading && !stats ? '...' : formatMetricValue(metric.value)}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className="home-explore" id="explorer" ref={revealRef1}>
          <div className="home-explore-inner">
            <header className="section-header">
              <p className="section-kicker">Explorer l’Afrique</p>
              <h2>Six portes d’entrée vers une Afrique plurielle</h2>
              <p className="section-lead">Des racines profondes, des voix contemporaines et des horizons ouverts à explorer à votre rythme.</p>
            </header>
            <div className="explore-list">
              {exploreCategories.map((cat) => (
                <Link key={cat.title} to={cat.to} className="explore-item">
                  <span className="explore-num"><cat.icon aria-hidden="true" size={20} /><small>{cat.num}</small></span>
                  <div className="explore-body">
                    <h3>{cat.title}</h3>
                    <p>{cat.desc}</p>
                  </div>
                  <ArrowRight className="explore-arrow" aria-hidden="true" size={20} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-today" id="aujourdhui" ref={revealRef2}>
          <div className="home-today-inner">
            <header className="section-header">
              <p className="section-kicker">Aujourd'hui en Afrique</p>
              <h2>L’Afrique qui se construit aujourd’hui</h2>
            </header>
            <div 
              className="today-carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button className="carousel-btn carousel-prev" onClick={prevSlide} aria-label="Precedent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>

              <div className="carousel-viewport">
                <div 
                  className="carousel-track" 
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {news.map((item) => (
                    <article key={item.id} className="carousel-slide">
                      <div className="carousel-image">
                        <img src={item.image || '/content/blog/ville-abidjan.webp'} alt="" loading="lazy" />
                        <div className="carousel-gradient" />
                      </div>
                      <div className="carousel-content">
                        <div className="carousel-meta">
                          <span className="carousel-tag">{item.category}</span>
                          <span className="carousel-source">{item.source} &middot; {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p className="carousel-excerpt">{item.excerpt}</p>
                        <a href={item.url} className="carousel-link" target="_blank" rel="noopener noreferrer">
                          Lire le récit sur {item.source} <span>&rarr;</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <button className="carousel-btn carousel-next" onClick={nextSlide} aria-label="Suivant">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              <div className="carousel-dots">
                {news.map((_, i) => (
                  <button 
                    key={i} 
                    className={i === activeSlide ? 'active' : ''} 
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-stories" id="histoires" ref={revealRef3}>
          <div className="home-stories-inner">
            <header className="section-header">
              <p className="section-kicker">Histoires de Baobab</p>
              <h2>Des personnes. Des territoires. Des idées qui restent.</h2>
            </header>
            <div className="stories-scroll">
              {baobabStories.map((story) => (
                <article key={story.name} className="story-card">
                  <div className="story-image">
                    <img src={story.image} alt={story.name} loading="lazy" />
                  </div>
                  <div className="story-body">
                    <div className="story-meta">
                      <img src={getFlagUrl(story.country, 'w80')} alt="" />
                      <span>{story.location}</span>
                    </div>
                    <h3>{story.name}</h3>
                    <p className="story-role">{story.role}</p>
                    <p className="story-excerpt">{story.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-territories" id="territoires" ref={revealRef4}>
          <div className="home-territories-inner">
            <header className="section-header">
              <p className="section-kicker">Nos territoires</p>
              <h2>De Dakar à Nairobi, de Cotonou à Johannesburg</h2>
              <p className="section-lead">
                Des villes aux villages, découvrons nos territoires sans réduire l’Afrique à un bloc uniforme.
              </p>
            </header>

            <div className="territories-search">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Chercher un pays, une capitale..."
                aria-label="Recherche rapide par pays"
              />
              <Link to="/map" className="search-link">Carte complete <span>&rarr;</span></Link>
            </div>

            <div className="country-list">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <Link key={country.id} to={`/country/${country.id.toLowerCase()}`} className="country-item">
                    <img src={getFlagUrl(country.id, 'w160')} alt="" />
                    <div>
                      <strong>{country.nameFr}</strong>
                      <span>{country.capital}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="country-empty">
                  <strong>Aucun pays trouve</strong>
                  <span>{isSearching ? 'Essayez un nom, une capitale ou un code pays different.' : 'Commencez par taper une recherche.'}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="home-community" id="communaute" ref={revealRef5}>
          <div className="home-community-inner">
            <div className="community-text">
              <p className="section-kicker">MonBaobab, c’est nous</p>
              <h2>Une plateforme construite avec celles et ceux qui font vivre l’Afrique.</h2>
              <p className="section-lead">
                Vous avez votre place ici. Chaque histoire compte, chaque savoir mérite d’être préservé.
              </p>
              <div className="verbs-list">
                {communityVerbs.map((v) => (
                  <Link key={v.verb} to={v.to} className="verb-item">
                    <strong>{v.verb}</strong>
                    <span>{v.desc}</span>
                    <span className="verb-arrow">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="community-visual">
              <div className="community-image-wrap">
                <img src="/content/baobab-community.jpg" alt="Un baobab dans la savane africaine" loading="lazy" />
              </div>
              <div className="team-mini">
                {teamMembers.map((member, index) => {
                  const note = teamCreativeNotes[index % teamCreativeNotes.length]
                  return (
                    <div key={member.name} className="team-mini-item">
                      <img src={member.image} alt={member.name} loading="lazy" style={{ objectPosition: member.focus }} />
                      <div>
                        <strong>{member.name}</strong>
                        <span>{note.eyebrow}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="home-transmit" id="transmettre" ref={revealRef6}>
          <div className="home-transmit-inner">
            <p className="section-kicker light">Memoire vivante</p>
            <h2>Ce qui est transmis ne disparait pas.</h2>
            <p className="transmit-lead">
              Les langues, les recettes, les récits, les savoir-faire et les connaissances 
              constituent une mémoire vivante. Ajoutez votre pierre à l’édifice.
            </p>
            <div className="transmit-list">
              {transmitActions.map((action) => (
                <Link key={action.label} to={action.to} className="transmit-item">
                  {action.label}
                </Link>
              ))}
            </div>
            <Link to="/contribute" className="transmit-main-cta">
              Contribuer a MonBaobab <span>&rarr;</span>
            </Link>
          </div>
        </section>

        {featuredContent?.blogs?.length > 0 && (
          <section className="home-editorial">
            <div className="home-editorial-inner">
              <header className="section-header">
                <p className="section-kicker">Lecture</p>
                <h2>Selection editoriale</h2>
              </header>
              <div className="editorial-list">
                {featuredContent.blogs.slice(0, 3).map((blog: any) => (
                  <Link key={blog._id} to={`/blog/${blog._id}`} className="editorial-item">
                    {blog.image && <img src={blog.image} alt="" loading="lazy" />}
                    <div className="editorial-body">
                      <span>{blog.category || 'Article'}</span>
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt || "Lire l'article"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="home-closing">
          <h2>Revenir souvent, decouvrir autrement.</h2>
          <p>MonBaobab rassemble carte, contenus, collections et communaute dans un meme espace.</p>
          <div className="closing-actions">
            <Link to="/communities"><Button variant="outline">Voir les communautes</Button></Link>
            <Link to="/register"><Button>Rejoindre</Button></Link>
          </div>
        </section>
      </main>
    </Layout>
  )
}
