import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  users: number
  totalViews: number
}

const editorialRoutes = [
  {
    title: 'Carte des pays',
    text: 'Entrer par la géographie, comparer les territoires, puis ouvrir chaque fiche pays.',
    to: '/map',
    label: 'Ouvrir la carte',
  },
  {
    title: 'Récits et figures',
    text: 'Lire les trajectoires, les lieux, les dates et les héritages qui structurent la mémoire du continent.',
    to: '/timeline',
    label: 'Parcourir',
  },
  {
    title: 'Objets et savoir-faire',
    text: 'Découvrir une sélection d’articles, de créations et de pièces inspirées par les cultures africaines.',
    to: '/shop',
    label: 'Voir la boutique',
  },
]

const culturalNotes = [
  'Textiles, teintures et gestes d’atelier',
  'Routes commerciales et cités anciennes',
  'Musiques, langues et traditions orales',
  'Cuisine, plantes et rituels du quotidien',
]

const recommendedCountryIds = ['SN', 'GH', 'CI', 'NG', 'BF', 'ML']

const countryEditorialNotes: Record<string, string> = {
  SN: 'Teranga, Dakar, Saint-Louis, musique mbalax, oralité wolof et mémoire atlantique.',
  GH: 'Kente, héritage ashanti, Accra créative, forts côtiers et première indépendance subsaharienne.',
  CI: 'Abidjan, Yamoussoukro, cacao, zouglou, masques, lagunes et cultures akan, mandé et kru.',
  NG: 'Lagos, Kano, Abuja, Nollywood, afrobeat, cultures yoruba, haoussa, igbo et économie créative.',
  BF: 'Ouagadougou, FESPACO, masques, intégrité, artisanats et carrefours sahéliens.',
  ML: 'Bamako, Tombouctou, Djenné, griots, empires mandingues et routes du Niger.',
}

const defaultTeamMembers = [
  {
    name: 'Victoire Sawadogo',
    role: 'IT Support',
    nationality: 'Burkina Faso',
    flag: getFlagUrl('BF', 'w80'),
    image: '/Equipe/Victoire%20SAWADOGO.jpeg',
    focus: 'center 38%',
  },
  {
    name: 'Blanchard Kouassi',
    role: 'Référent Digital et Créateur de Contenu',
    nationality: "Côte d’Ivoire",
    flag: getFlagUrl('CI', 'w80'),
    image: '/Equipe/Blanchard%20Kouassi.jpeg',
    focus: 'center 35%',
  },
  {
    name: 'Dieudonné Dara',
    role: 'Développeur Fullstack et Designer',
    nationality: 'Mali',
    flag: getFlagUrl('ML', 'w80'),
    image: '/Equipe/Dieudonn%C3%A9%20Dara.jpeg',
    focus: 'center 34%',
  },
]

const formatMetricValue = (value?: number | null) => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('fr-FR').format(value)
}

export const Home = () => {
  const platformName = usePlatformName()
  const { settings } = useSettingsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featuredContent, setFeaturedContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePanelCountryIndex, setActivePanelCountryIndex] = useState(0)

  const highlightedCountries = useMemo(() => {
    const countryIds = ['SN', 'MA', 'EG', 'GH', 'NG', 'ET', 'KE', 'ZA']
    return countryIds
      .map((id) => allAfricanCountries.find((country) => country.id === id))
      .filter(Boolean) as AfricanCountry[]
  }, [])

  const recommendedCountries = useMemo(() => {
    return recommendedCountryIds
      .map((id) => allAfricanCountries.find((country) => country.id === id))
      .filter(Boolean) as AfricanCountry[]
  }, [])

  const activePanelCountry = recommendedCountries[activePanelCountryIndex] || recommendedCountries[0]

  const filteredCountries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const sortedCountries = [...allAfricanCountries].sort((a, b) =>
      a.nameFr.localeCompare(b.nameFr, 'fr', { sensitivity: 'base' })
    )

    if (!query) return highlightedCountries

    return sortedCountries
      .filter((country) => {
        return (
          country.nameFr.toLowerCase().includes(query) ||
          country.capital.toLowerCase().includes(query) ||
          country.id.toLowerCase().includes(query)
        )
      })
      .slice(0, 12)
  }, [highlightedCountries, searchTerm])

  const teamMembers = useMemo(() => {
    const configuredTeam = settings?.team?.filter((member) => member.name && member.image)
    return configuredTeam && configuredTeam.length > 0 ? configuredTeam : defaultTeamMembers
  }, [settings?.team])

  const homeMetrics = useMemo(() => [
    {
      label: 'Pays à explorer',
      value: stats?.countries || allAfricanCountries.length,
    },
    {
      label: 'Figures et repères',
      value: stats?.figures,
    },
    {
      label: 'Collections',
      value: stats?.collections,
    },
    {
      label: 'Objets sélectionnés',
      value: stats?.products,
    },
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
        console.error('Erreur lors du chargement de l’accueil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  useEffect(() => {
    if (recommendedCountries.length <= 1) return

    const interval = window.setInterval(() => {
      setActivePanelCountryIndex((currentIndex) => (currentIndex + 1) % recommendedCountries.length)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [recommendedCountries.length])

  return (
    <Layout>
      <main className="home">
        <section className="home-hero" aria-label="Accueil MonBaobab">
          <div className="home-hero-flags" aria-hidden="true">
            {highlightedCountries.map((country) => (
              <img
                key={country.id}
                src={getFlagUrl(country.id, 'w320')}
                alt=""
                className="home-hero-flag"
                loading="eager"
              />
            ))}
          </div>

          <div className="home-hero-content">
            <p className="home-kicker">Atlas culturel africain</p>
            <h1>{platformName}</h1>
            <p className="home-hero-lead">
              Une entrée claire vers les pays, les récits, les figures et les objets qui donnent
              de l’épaisseur aux cultures africaines.
            </p>

            <div className="home-search">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Chercher un pays, une capitale ou un code"
                aria-label="Recherche rapide par pays"
              />
              <Link to="/map">Carte complète</Link>
            </div>

            <div className="home-hero-actions">
              <Link to="/map">
                <Button size="large">Explorer la carte</Button>
              </Link>
              <Link to="/collections">
                <Button variant="outline" size="large">Voir les collections</Button>
              </Link>
            </div>
          </div>

          <aside className="home-hero-panel" aria-label="Aperçu éditorial">
            <span className="panel-label">Parcours conseillé</span>
            <h2>{activePanelCountry ? `Commencer par ${activePanelCountry.nameFr}` : 'Commencer par l’Afrique de l’Ouest'}</h2>
            <p>
              {activePanelCountry
                ? countryEditorialNotes[activePanelCountry.id] || activePanelCountry.description
                : 'Textiles, royaumes, ports, musiques urbaines et grandes routes marchandes.'}
            </p>
            <div className="panel-country-focus">
              <img
                src={getFlagUrl(activePanelCountry?.id || 'SN', 'w320')}
                alt={activePanelCountry ? `Drapeau de ${activePanelCountry.nameFr}` : ''}
              />
              <div>
                <strong>{activePanelCountry?.capital}</strong>
                <span>{activePanelCountry?.population} · {activePanelCountry?.currency}</span>
              </div>
            </div>
            <div className="panel-strip" role="tablist" aria-label="Choisir un pays conseillé">
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
            <Link to={`/country/${(activePanelCountry?.id || 'SN').toLowerCase()}`}>
              Lire la fiche {activePanelCountry?.nameFr || 'Sénégal'}
            </Link>
          </aside>
        </section>

        <section className="home-metrics" aria-label="Chiffres clés">
          {homeMetrics.map((metric) => (
            <div key={metric.label}>
              <strong>{loading && !stats ? '...' : formatMetricValue(metric.value)}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className="home-section home-countries">
          <div className="home-section-heading">
            <p className="home-kicker">Pays</p>
            <h2>Choisir une porte d’entrée</h2>
            <p>
              Quelques pays en vitrine. La recherche ouvre vite le reste de l’atlas.
            </p>
          </div>

          <div className="country-showcase">
            {filteredCountries.map((country) => (
              <Link key={country.id} to={`/country/${country.id.toLowerCase()}`} className="country-tile">
                <img src={getFlagUrl(country.id, 'w160')} alt={`Drapeau de ${country.nameFr}`} />
                <span>{country.nameFr}</span>
                <small>{country.capital}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section home-routes">
          <div className="home-section-heading">
            <p className="home-kicker">Navigation</p>
            <h2>Trois façons d’entrer dans MonBaobab</h2>
          </div>

          <div className="route-grid">
            {editorialRoutes.map((route) => (
              <article key={route.title} className="route-card">
                <h3>{route.title}</h3>
                <p>{route.text}</p>
                <Link to={route.to}>{route.label}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-feature-band">
          <div>
            <p className="home-kicker">Mémoire vivante</p>
            <h2>Une plateforme pensée pour lire, comparer et revenir.</h2>
          </div>
          <div className="note-list">
            {culturalNotes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        </section>

        {featuredContent?.blogs?.length > 0 && (
          <section className="home-section home-editorial">
            <div className="home-section-heading">
              <p className="home-kicker">Lecture</p>
              <h2>Sélection éditoriale</h2>
              <p>Des contenus récents pour prolonger l’exploration.</p>
            </div>

            <div className="editorial-grid">
              {featuredContent.blogs.slice(0, 3).map((blog: any) => (
                <Link key={blog._id} to={`/blog/${blog._id}`} className="editorial-card">
                  {blog.image && <img src={blog.image} alt="" />}
                  <div>
                    <span>{blog.category || 'Article'}</span>
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt || 'Lire l’article'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="home-section home-market">
          <div className="market-visual" aria-hidden="true">
            <img src={getFlagUrl('ET', 'w320')} alt="" />
            <img src={getFlagUrl('MA', 'w320')} alt="" />
            <img src={getFlagUrl('ZA', 'w320')} alt="" />
          </div>
          <div className="market-copy">
            <p className="home-kicker">Boutique</p>
            <h2>Des objets choisis pour leur matière, leur usage et leur histoire.</h2>
            <p>
              La boutique doit rester simple: voir, comparer, comprendre l’origine, puis acheter
              sans friction.
            </p>
            <Link to="/shop">
              <Button size="large">Entrer dans la boutique</Button>
            </Link>
          </div>
        </section>

        <section className="home-section home-team">
          <div className="home-section-heading">
            <p className="home-kicker">Équipe</p>
            <h2>L’équipe MonBaobab</h2>
            <p>
              Une petite équipe, une même attention: rendre la découverte plus simple,
              plus fiable et plus proche des personnes qui transmettent.
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <article key={member.name} className="team-card">
                <div className="team-portrait">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    style={{ objectPosition: member.focus }}
                  />
                  {member.flag && (
                    <span className="team-flag">
                      <img src={member.flag} alt={`Drapeau ${member.nationality}`} loading="lazy" />
                    </span>
                  )}
                </div>
                <div className="team-card-body">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <span>{member.nationality}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-closing">
          <h2>Revenir souvent, découvrir autrement.</h2>
          <p>
            MonBaobab rassemble carte, contenus, collections et communauté dans un même espace.
          </p>
          <div>
            <Link to="/communities">
              <Button variant="outline">Voir les communautés</Button>
            </Link>
            <Link to="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  )
}
