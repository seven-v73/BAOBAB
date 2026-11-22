import { useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { TopoField } from '../components/TopoField/TopoField'
import { allAfricanCountries } from '../data/allAfricanCountries'
import { AfricaRelief } from '../components/AfricaRelief/AfricaRelief'
import { CAPITAL_COORDS, ENRICHED_TERRITORIES, projectOnAfrica } from '../data/africaGeo'
import { EYE_PATH, MARK_PATH, MARK_VIEWBOX } from '../data/brandMark'
import { FEATURED_STORIES as STORIES } from '../data/featuredStories'
import { useHomeMotion } from '../hooks/useHomeMotion'
import { useNotifications } from '../hooks/useNotifications'
import { newsletterService } from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'
import './Rubriques.css'
import './Home.css'

// Accueil d'après la maquette Figma « Landing MonBaobab / Desktop 1440 » (7:133) et « Mobile 390 » (14:147).

const STATS = [
  { value: allAfricanCountries.length, suffix: '', label: 'pays à parcourir, des côtes atlantiques à l’océan Indien' },
  { value: 2000, suffix: '+', label: 'langues parlées sur le continent, autant de façons de dire le monde' },
  { value: 4, suffix: '', label: 'portes d’entrée : l’atlas, les récits, le patrimoine et les savoir-faire' },
]

const DOORS = [
  { title: 'Atlas', text: '55 pays, leurs territoires et leurs peuples, cartographiés pour se repérer et se laisser surprendre.', cta: 'Ouvrir la carte', to: '/map', tone: 'foret', icon: '/Icons/Fichier%2045.svg' },
  { title: 'Récits', text: 'Des histoires transmises de génération en génération, racontées avec un regard d’aujourd’hui.', cta: 'Lire', to: '/recits', tone: 'ambre', icon: '/Icons/Fichier%2037.svg' },
  // Patrimoine et Savoir-faire n'ont pas encore de rubrique : cartes sans lien
  { title: 'Patrimoine', text: 'Sites, monuments et traditions vivantes, remis dans leur contexte pour mieux les comprendre.', tone: 'terre', icon: '/Icons/Fichier%2051.svg' },
  { title: 'Savoir-faire', text: 'Tissage, poterie, musique, cuisine : les gestes des artisans et de celles et ceux qui les transmettent.', tone: 'sauge', icon: '/Icons/Fichier%2042.svg' },
]

// Les trois territoires à fiche enrichie, placés sur leur capitale (en % du contour)
const TERRITORY_NAMES: Record<string, string> = { BF: 'Burkina Faso', CI: 'Côte d’Ivoire', CV: 'Cap-Vert' }
const TERRITORIES = Object.entries(ENRICHED_TERRITORIES).map(([code, t]) => {
  const { x, y } = projectOnAfrica(CAPITAL_COORDS[code])
  return { id: code.toLowerCase(), name: TERRITORY_NAMES[code], tagline: t.tagline, color: t.color, x: (x / 633.6) * 100, y: (y / 663.961) * 100 }
})

const VALUES = [
  { label: 'Curieuse', tone: 'ambre' },
  { label: 'Accessible', tone: 'turquoise' },
  { label: 'Ouverte', tone: 'abysse' },
  { label: 'Contemporaine', tone: 'desert' },
  { label: 'Humaine', tone: 'terre' },
]

export const Home = () => {
  const scope = useRef<HTMLDivElement>(null)
  const { settings } = useSettingsStore()
  const { success, error } = useNotifications()
  const [territory, setTerritory] = useState('bf')
  const [email, setEmail] = useState('')
  useHomeMotion(scope)

  const subscribe = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await newsletterService.subscribe(email)
      setEmail('')
      success('Merci. Votre première lettre arrive bientôt.')
    } catch {
      error('L’inscription n’a pas abouti. Vérifiez l’adresse et réessayez.')
    }
  }

  const team = settings?.team ?? []

  return (
    <Layout fullWidth overlayHeader>
      <div className="mbh" ref={scope}>
        {/* 1. Hero */}
        <section className="mbh-hero" aria-labelledby="mbh-title">
          <TopoField className="mbh-topo" />
          <div className="mbh-hero-text">
            <h1 id="mbh-title" data-motion="hero-title">
              L’Afrique
              <br />à découvrir
              <br />
              <span>autrement.</span>
            </h1>
            <p className="mbh-lead" data-motion="hero-item">
              MonBaobab rassemble des fiches pays, des récits, des repères et des savoir-faire, documentés et
              sourcés, pour connaître les pays d’Afrique un par un.
            </p>
            <div className="mbh-actions" data-motion="hero-item">
              <Link to="/map" className="mbh-btn mbh-btn--ambre">
                Explorer l’atlas <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/recits" className="mbh-btn mbh-btn--glass">
                Lire les récits <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <svg className="mbh-mark" viewBox={MARK_VIEWBOX} aria-hidden="true" data-motion="hero-mark">
            <defs>
              <clipPath id="mbh-eye">
                <path d={EYE_PATH} />
              </clipPath>
            </defs>
            <g clipPath="url(#mbh-eye)">
              <image
                href="/content/home/baobabs.webp"
                x="52"
                y="28"
                width="124"
                height="70"
                preserveAspectRatio="xMidYMid slice"
                data-motion="hero-photo"
              />
            </g>
            <path d={MARK_PATH} fill="var(--brand-sauge)" />
          </svg>
        </section>

        {/* 2. Manifeste */}
        <section className="mbh-section mbh-manifesto" aria-labelledby="mbh-manifesto">
          <div className="mbh-split">
            <h2 id="mbh-manifesto" data-motion="manifesto">
              L’Afrique n’est pas une histoire unique. <span>Elle est faite de milliers d’histoires.</span>
            </h2>
            <div className="mbh-aside">
              <p>Des histoires transmises de génération en génération. Des savoir-faire vivants. Des cultures en mouvement.</p>
              <p>MonBaobab les rassemble pour explorer le continent avec curiosité et ouverture, loin des clichés.</p>
            </div>
          </div>
          <dl className="mbh-stats">
            {STATS.map((stat) => (
              <div key={stat.label} data-reveal>
                <dt>{stat.label}</dt>
                <dd>
                  <span data-count={stat.value}>{new Intl.NumberFormat('fr-FR').format(stat.value)}</span>
                  {stat.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 3. Quatre portes */}
        <section className="mbh-section" aria-labelledby="mbh-doors">
          <div className="mbh-split mbh-split--end">
            <div>
              <p className="mbr-eyebrow">Explorer</p>
              <h2 id="mbh-doors">Quatre portes d’entrée vers le continent</h2>
            </div>
            <p className="mbh-aside">Choisissez votre chemin : par la carte, par les histoires, par les lieux ou par les gestes.</p>
          </div>
          <ul className="mbh-doors">
            {DOORS.map((door) => {
              const body = (
                <>
                  <img src={door.icon} alt="" width="28" height="28" />
                  <h3>{door.title}</h3>
                  <p>{door.text}</p>
                  {door.to && (
                    <span className="mbh-door-cta">
                      {door.cta} <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  )}
                </>
              )
              const className = `mbh-door mbh-door--${door.tone}`
              return (
                <li key={door.title} data-reveal>
                  {door.to ? <Link to={door.to} className={className}>{body}</Link> : <div className={className}>{body}</div>}
                </li>
              )
            })}
          </ul>
        </section>

        {/* 4. Atlas */}
        <section className="mbh-atlas" aria-labelledby="mbh-atlas">
          <div className="mbh-atlas-text">
            <h2 id="mbh-atlas">Un continent, mille visages</h2>
            <p>Chaque territoire a sa couleur, ses récits et ses repères. Posez le doigt sur la carte et laissez-vous guider.</p>
            <ul className="mbh-territories">
              {TERRITORIES.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/country/${t.id}`}
                    className="mbh-territory"
                    data-active={territory === t.id || undefined}
                    style={{ '--dot': t.color } as CSSProperties}
                    onMouseEnter={() => setTerritory(t.id)}
                    onFocus={() => setTerritory(t.id)}
                  >
                    <strong>{t.name}</strong>
                    <span>{t.tagline}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/map" className="mbh-btn mbh-btn--foret">
              Ouvrir l’atlas <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="mbh-map">
            {/* Le contour et les repères partagent le même cadre : les % des repères suivent la carte */}
            <div className="mbh-map-canvas" aria-hidden="true">
              <AfricaRelief id="mbh-africa" />
              {TERRITORIES.map((t) => (
                <span
                  key={t.id}
                  className="mbh-pin"
                  data-active={territory === t.id || undefined}
                  data-motion="pin"
                  style={{ left: `${t.x}%`, top: `${t.y}%`, '--dot': t.color } as CSSProperties}
                >
                  <i />
                  <b>{t.name}</b>
                </span>
              ))}
            </div>
            <Link to="/country/cv" className="mbh-teaser" tabIndex={-1} data-reveal>
              <img src="/content/home/cap-vert.webp" alt="" loading="lazy" />
              <span className="mbr-meta">Cap-Vert · Musique</span>
              <strong>La morna, âme de l’archipel</strong>
            </Link>
          </div>
        </section>

        {/* 5. Récits */}
        <section className="mbh-section mbh-stories-section" aria-labelledby="mbh-stories">
          <div className="mbh-split mbh-split--end">
            <h2 id="mbh-stories">Des histoires qui créent des liens</h2>
            <Link to="/recits" className="mbh-btn mbh-btn--foret mbh-stories-all">
              Tous les récits <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul className="mbh-stories">
            {STORIES.map((story) => (
              <li key={story.title} data-reveal>
                <Link to={`/recit/${story.id}`} className="mbh-story">
                  <img src={story.image} alt="" loading="lazy" width="384" height="480" />
                  <p className="mbh-story-meta">{story.meta}</p>
                  <h3>{story.title}</h3>
                  <p>{story.text}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/recits" className="mbh-btn mbh-btn--foret mbh-stories-all--mobile">
            Tous les récits <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        {/* 6. Valeurs */}
        <section className="mbh-section mbh-values" aria-labelledby="mbh-values">
          <h2 id="mbh-values">Cinq façons de regarder le continent</h2>
          <ul className="mbh-pills" data-motion="pills">
            {VALUES.map((value) => (
              <li key={value.label} className={`mbh-pill mbh-pill--${value.tone}`}>
                {value.label}
              </li>
            ))}
          </ul>
          <p>
            Curieuse, accessible, ouverte, contemporaine et humaine : MonBaobab cherche à comprendre avant de raconter, et
            place les personnes au cœur de ses récits.
          </p>
        </section>

        {/* 7. Équipe */}
        {team.length > 0 && (
          <section className="mbh-section" aria-labelledby="mbh-team">
            <div className="mbh-split mbh-split--end">
              <h2 id="mbh-team">Les personnes derrière MonBaobab</h2>
              <p className="mbh-aside">Une plateforme construite avec celles et ceux qui font vivre l’Afrique.</p>
            </div>
            <ul className="mbh-team">
              {team.map((member) => (
                <li key={member.name} data-reveal>
                  <img src={member.image} alt="" loading="lazy" style={{ objectPosition: member.focus }} />
                  <p className="mbr-meta">{member.nationality}</p>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8. Lettre */}
        <section className="mbh-letter" aria-labelledby="mbh-letter">
          <TopoField className="mbh-topo" />
          <svg className="mbh-letter-mark" viewBox={MARK_VIEWBOX} aria-hidden="true">
            <path d={MARK_PATH} />
          </svg>
          <h2 id="mbh-letter">Chaque découverte éveille une curiosité.</h2>
          <p>Recevez chaque mois un territoire, un récit et un savoir-faire à découvrir.</p>
          <form className="mbh-letter-form" onSubmit={subscribe}>
            <label htmlFor="mbh-email" className="sr-only">
              Votre adresse e-mail
            </label>
            <input
              id="mbh-email"
              type="email"
              required
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" className="mbh-btn mbh-btn--foret">
              S’abonner <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <small>Un e-mail par mois. Désinscription en un clic.</small>
        </section>
      </div>
    </Layout>
  )
}
