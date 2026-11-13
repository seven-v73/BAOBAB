import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Clock3,
  ExternalLink,
  GraduationCap,
  Map as MapIcon,
  PenLine,
  Quote,
  Search,
  User,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { allAfricanCountries, type AfricanCountry } from '../data/allAfricanCountries'
import { homeService } from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'
import { useSeo, SITE_URL, DEFAULT_DESCRIPTION } from '../seo/useSeo'
import './Home.css'

const flagUrl = (id: string, size: 'w40' | 'w80' | 'w160' = 'w80') =>
  `https://flagcdn.com/${size}/${id.toLowerCase()}.png`

interface HomeStats {
  countries?: number
  blogPosts?: number
  products?: number
  events?: number
  figures?: number
  stories?: number
  collections?: number
  proverbs?: number
  quizzes?: number
  communities?: number
  sources?: number
}

interface FeaturedBlog {
  _id: string
  title: string
  excerpt?: string
  image?: string
  category?: string
  createdAt?: string
}

interface FeaturedFigure {
  _id: string
  name: string
  shortBiography?: string
  image?: string
  birthPlace?: { location?: string }
}

interface FeaturedStory {
  _id: string
  title: string
  subtitle?: string
  description?: string
  readingTime?: number
  category?: string
}

interface FeaturedProduct {
  _id: string
  name: string
  price: number
  currency?: string
  images?: string[]
  category?: string
}

interface Featured {
  blogs?: FeaturedBlog[]
  figures?: FeaturedFigure[]
  stories?: FeaturedStory[]
  products?: FeaturedProduct[]
}

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  url: string
}

const featuredCountryIds = ['SN', 'CI', 'GH', 'NG', 'ML', 'BF']

const countryNotes: Record<string, string> = {
  SN: 'Teranga, Saint-Louis, mbalax, oralité wolof et mémoire atlantique.',
  CI: 'Abidjan, cacao, zouglou, masques et cultures akan, mandé et kru.',
  GH: 'Kente, héritage ashanti, forts côtiers et première indépendance subsaharienne.',
  NG: 'Lagos, Kano, Nollywood, afrobeat, cultures yoruba, haoussa et igbo.',
  ML: 'Tombouctou, Djenné, griots, empires mandingues et routes du Niger.',
  BF: 'Ouagadougou, FESPACO, masques, artisanats et carrefours sahéliens.',
}

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)
const formatPrice = (value: number, currency = 'FCFA') => `${formatNumber(value)} ${currency}`

export const Home = () => {
  const settings = useSettingsStore((state) => state.settings)
  const navigate = useNavigate()
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featured, setFeatured] = useState<Featured | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [showAllCountries, setShowAllCountries] = useState(false)
  const [spotlightId, setSpotlightId] = useState(featuredCountryIds[0])

  useSeo({
    path: '/',
    jsonLd: [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'MonBaobab',
        url: `${SITE_URL}/`,
        inLanguage: 'fr',
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'MonBaobab', url: `${SITE_URL}/`, logo: `${SITE_URL}/LogoFiles/Fichier%202.png` },
    ],
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      homeService.getStats().catch(() => null),
      homeService.getFeatured({ limit: 4 }).catch(() => null),
      fetch('/api/news/africa')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([statsRes, featuredRes, newsRes]) => {
      if (cancelled) return
      if (statsRes?.data) setStats(statsRes.data)
      if (featuredRes?.data) setFeatured(featuredRes.data)
      const items = Array.isArray(newsRes) ? newsRes : newsRes?.items
      if (Array.isArray(items)) setNews(items.slice(0, 5))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const spotlight = useMemo(
    () => allAfricanCountries.find((country) => country.id === spotlightId) as AfricanCountry | undefined,
    [spotlightId],
  )

  const sortedCountries = useMemo(
    () => [...allAfricanCountries].sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr', { sensitivity: 'base' })),
    [],
  )

  const visibleCountries = useMemo(() => {
    const q = countryFilter.trim().toLowerCase()
    if (q) {
      return sortedCountries.filter(
        (c) => c.nameFr.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q) || c.id.toLowerCase() === q,
      )
    }
    return showAllCountries ? sortedCountries : sortedCountries.slice(0, 12)
  }, [countryFilter, showAllCountries, sortedCountries])

  const entryPoints = [
    { to: '/map', title: 'Carte & pays', desc: 'Parcourir les pays, leurs régions et leurs cultures.', icon: MapIcon, count: stats?.countries, unit: 'pays' },
    { to: '/timeline', title: 'Chronologie', desc: 'Suivre les grandes périodes, des royaumes aux indépendances.', icon: Clock3, count: stats?.events, unit: 'repères' },
    { to: '/figures', title: 'Personnalités', desc: 'Rencontrer celles et ceux qui ont marqué leur époque.', icon: User, count: stats?.figures, unit: 'portraits' },
    { to: '/stories', title: 'Récits', desc: 'Lire des histoires transmises et des parcours inspirants.', icon: BookOpen, count: stats?.stories, unit: 'récits' },
    { to: '/proverbs', title: 'Proverbes', desc: 'Découvrir la sagesse des langues africaines.', icon: Quote, count: stats?.proverbs, unit: 'proverbes' },
    { to: '/quizzes', title: 'Quiz', desc: 'Tester et enrichir ses connaissances en s’amusant.', icon: GraduationCap, count: stats?.quizzes, unit: 'quiz' },
  ]

  const metrics = [
    { label: 'pays à explorer', value: stats?.countries },
    { label: 'personnalités', value: stats?.figures },
    { label: 'proverbes', value: stats?.proverbs },
    { label: 'sources documentées', value: stats?.sources },
  ].filter((metric) => typeof metric.value === 'number' && metric.value > 0)

  const teamMembers = (settings?.team || []).filter((member) => member.name && member.image)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const blogs = featured?.blogs?.slice(0, 3) || []
  const figures = featured?.figures?.slice(0, 4) || []
  const stories = featured?.stories?.slice(0, 3) || []
  const products = featured?.products?.slice(0, 4) || []

  return (
    <Layout fullWidth>
      <div className="home">
        {/* ---------- Héros ---------- */}
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__text">
              <p className="eyebrow">Racines profondes · Horizons ouverts</p>
              <h1>L’Afrique a beaucoup à raconter.</h1>
              <p className="hero__lead">
                Histoires, cultures, savoirs et talents : explorez les pays du continent, lisez des récits
                documentés et partagez ce qui vous a été transmis.
              </p>

              <form className="hero__search" role="search" onSubmit={handleSearch}>
                <Search size={20} aria-hidden={true} />
                <label htmlFor="home-search" className="sr-only">
                  Rechercher sur MonBaobab
                </label>
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Un pays, une personnalité, un proverbe…"
                  autoComplete="off"
                />
                <button type="submit" className="btn">
                  Rechercher
                </button>
              </form>

              <div className="hero__actions">
                <Link to="/map" className="btn btn-large">
                  Explorer la carte <ArrowRight size={18} aria-hidden={true} />
                </Link>
                <Link to="/contribute" className="btn btn-outline btn-large">
                  Partager une histoire
                </Link>
              </div>
            </div>

            <aside className="hero__visual" aria-label="Pays à la une">
              <img src="/content/baobab-community.jpg" alt="Un baobab dans la savane" className="hero__image" />
              {spotlight && (
                <div className="spotlight">
                  <div className="spotlight__head">
                    <img src={flagUrl(spotlight.id, 'w80')} alt="" width={40} height={27} />
                    <div>
                      <span className="spotlight__label">Commencer par</span>
                      <strong>{spotlight.nameFr}</strong>
                    </div>
                  </div>
                  <p>{countryNotes[spotlight.id] || spotlight.description}</p>
                  <div className="spotlight__foot">
                    <div className="spotlight__flags" role="group" aria-label="Choisir un pays">
                      {featuredCountryIds.map((id) => {
                        const country = allAfricanCountries.find((c) => c.id === id)
                        return (
                          <button
                            key={id}
                            type="button"
                            className={id === spotlightId ? 'is-active' : ''}
                            onClick={() => setSpotlightId(id)}
                            aria-pressed={id === spotlightId}
                            aria-label={country?.nameFr || id}
                            title={country?.nameFr}
                          >
                            <img src={flagUrl(id, 'w40')} alt="" width={24} height={16} />
                          </button>
                        )
                      })}
                    </div>
                    <Link to={`/country/${spotlight.id.toLowerCase()}`} className="link-arrow">
                      Lire la fiche <ArrowRight size={16} aria-hidden={true} />
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>

          {metrics.length > 0 && (
            <div className="container">
              <dl className="metrics">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd>{formatNumber(metric.value as number)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {/* ---------- Points d'entrée ---------- */}
        <section className="section" aria-labelledby="entrees-titre">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Par où commencer</p>
                <h2 id="entrees-titre">Six façons d’explorer le continent</h2>
              </div>
            </div>
            <div className="entries">
              {entryPoints.map((entry) => (
                <Link key={entry.to} to={entry.to} className="entry">
                  <span className="entry__icon">
                    <entry.icon size={22} aria-hidden={true} />
                  </span>
                  <span className="entry__body">
                    <strong>{entry.title}</strong>
                    <span>{entry.desc}</span>
                    {typeof entry.count === 'number' && entry.count > 0 && (
                      <small>
                        {formatNumber(entry.count)} {entry.unit}
                      </small>
                    )}
                  </span>
                  <ArrowRight size={18} className="entry__arrow" aria-hidden={true} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Lecture ---------- */}
        {(loading || blogs.length > 0) && (
          <section className="section section--alt" aria-labelledby="lecture-titre">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Carnet de savoirs</p>
                  <h2 id="lecture-titre">À lire en ce moment</h2>
                </div>
                <Link to="/blog" className="link-arrow">
                  Tous les articles <ArrowRight size={16} aria-hidden={true} />
                </Link>
              </div>
              <div className="mb-grid">
                {loading
                  ? [0, 1, 2].map((i) => <div key={i} className="mb-skeleton" style={{ height: 320 }} />)
                  : blogs.map((blog) => (
                      <Link key={blog._id} to={`/blog/${blog._id}`} className="mb-card">
                        <div className="mb-card__media">
                          {blog.image && <img src={blog.image} alt="" loading="lazy" />}
                        </div>
                        <div className="mb-card__body">
                          {blog.category && <span className="mb-tag">{blog.category}</span>}
                          <h3>{blog.title}</h3>
                          {blog.excerpt && <p>{blog.excerpt}</p>}
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Personnalités & récits ---------- */}
        {(figures.length > 0 || stories.length > 0) && (
          <section className="section" aria-labelledby="memoire-titre">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Mémoire vivante</p>
                  <h2 id="memoire-titre">Des personnes, des récits, des héritages</h2>
                </div>
              </div>
              <div className="memory">
                {figures.length > 0 && (
                  <div className="memory__col">
                    <div className="memory__title">
                      <h3>Personnalités</h3>
                      <Link to="/figures" className="link-arrow">
                        Voir tout <ArrowRight size={16} aria-hidden={true} />
                      </Link>
                    </div>
                    <ul className="people">
                      {figures.map((figure) => (
                        <li key={figure._id}>
                          <Link to={`/figures/${figure._id}`} className="person">
                            <span className="person__avatar" aria-hidden="true">
                              {figure.image ? <img src={figure.image} alt="" loading="lazy" /> : figure.name.charAt(0)}
                            </span>
                            <span>
                              <strong>{figure.name}</strong>
                              <small>{figure.shortBiography || figure.birthPlace?.location}</small>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stories.length > 0 && (
                  <div className="memory__col">
                    <div className="memory__title">
                      <h3>Récits</h3>
                      <Link to="/stories" className="link-arrow">
                        Voir tout <ArrowRight size={16} aria-hidden={true} />
                      </Link>
                    </div>
                    <ul className="tales">
                      {stories.map((story) => (
                        <li key={story._id}>
                          <Link to={`/stories/${story._id}`} className="tale">
                            <span className="tale__meta">
                              {story.category}
                              {story.readingTime ? ` · ${story.readingTime} min` : ''}
                            </span>
                            <strong>{story.title}</strong>
                            {(story.subtitle || story.description) && <span>{story.subtitle || story.description}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Pays ---------- */}
        <section className="section section--alt" id="territoires" aria-labelledby="pays-titre">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Territoires</p>
                <h2 id="pays-titre">De Dakar à Nairobi, de Tunis au Cap</h2>
                <p>Chaque pays a sa fiche : histoire, langues, cultures, cuisine et personnalités.</p>
              </div>
              <Link to="/map" className="link-arrow">
                Ouvrir la carte <ArrowRight size={16} aria-hidden={true} />
              </Link>
            </div>

            <div className="country-filter">
              <Search size={18} aria-hidden={true} />
              <label htmlFor="country-filter" className="sr-only">
                Filtrer les pays
              </label>
              <input
                id="country-filter"
                type="search"
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                placeholder="Filtrer par pays ou capitale"
                autoComplete="off"
              />
            </div>

            {visibleCountries.length > 0 ? (
              <ul className="countries">
                {visibleCountries.map((country) => (
                  <li key={country.id}>
                    <Link to={`/country/${country.id.toLowerCase()}`} className="country">
                      <img src={flagUrl(country.id, 'w80')} alt="" loading="lazy" width={36} height={24} />
                      <span>
                        <strong>{country.nameFr}</strong>
                        <small>{country.capital}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mb-state">
                <h3>Aucun pays ne correspond</h3>
                <p>Essayez un autre nom ou une capitale.</p>
              </div>
            )}

            {!countryFilter && !showAllCountries && (
              <div className="countries__more">
                <button type="button" className="btn btn-outline" onClick={() => setShowAllCountries(true)}>
                  Afficher les {sortedCountries.length} pays
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---------- Boutique ---------- */}
        {products.length > 0 && (
          <section className="section" aria-labelledby="boutique-titre">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Créateurs & objets</p>
                  <h2 id="boutique-titre">Des objets qui racontent un savoir-faire</h2>
                </div>
                <Link to="/shop" className="link-arrow">
                  Visiter la boutique <ArrowRight size={16} aria-hidden={true} />
                </Link>
              </div>
              <div className="products">
                {products.map((product) => (
                  <Link key={product._id} to="/shop" className="mb-card product">
                    <div className="mb-card__media">
                      {product.images?.[0] && <img src={product.images[0]} alt="" loading="lazy" />}
                    </div>
                    <div className="mb-card__body">
                      {product.category && <small className="product__cat">{product.category}</small>}
                      <h3>{product.name}</h3>
                      <strong className="product__price">{formatPrice(product.price, product.currency)}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Actualité ---------- */}
        {news.length > 0 && (
          <section className="section section--tight section--alt" aria-labelledby="actu-titre">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Actualité</p>
                  <h2 id="actu-titre">Ce qui se passe sur le continent</h2>
                </div>
              </div>
              <ul className="news">
                {news.map((item) => (
                  <li key={item.id}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="news__item">
                      <span className="news__meta">
                        {item.source} ·{' '}
                        {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <strong>{item.title}</strong>
                      <ExternalLink size={16} aria-label="(nouvel onglet)" className="news__ext" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- Équipe ---------- */}
        {teamMembers.length > 0 && (
          <section className="section" aria-labelledby="equipe-titre">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">L’équipe</p>
                  <h2 id="equipe-titre">Celles et ceux qui construisent MonBaobab</h2>
                </div>
              </div>
              <ul className="team">
                {teamMembers.map((member) => (
                  <li key={member.name} className="team__member">
                    <img src={member.image} alt="" loading="lazy" />
                    <strong>{member.name}</strong>
                    {member.role && <span>{member.role}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ---------- Appel à contribuer ---------- */}
        <section className="cta-band">
          <div className="container cta-band__inner">
            <div>
              <h2>Ce qui est transmis ne disparaît pas.</h2>
              <p>
                Une recette, un proverbe, un lieu, un savoir-faire : ajoutez votre pierre à la mémoire collective.
              </p>
            </div>
            <div className="cta-band__actions">
              <Link to="/contribute" className="btn btn-large cta-band__primary">
                <PenLine size={18} aria-hidden={true} /> Contribuer
              </Link>
              <Link to="/communities" className="btn btn-large cta-band__secondary">
                Rejoindre un cercle
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
