import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Languages,
  Map as MapIcon,
  Music,
  PenLine,
  PlayCircle,
  Quote,
  Sparkles,
  Utensils,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import { DocumentViewer } from '../components/MediaViewer/DocumentViewer'
import { CountryInteractiveMap } from '../components/Country/CountryInteractiveMap'
import { countryService, searchService, sourceService } from '../services/api'
import { getCountryById as getStaticCountryById } from '../data/allAfricanCountries'
import { africaMapShapes } from '../data/africaMapShapes'
import { getRegion, pathBounds } from '../data/africaRegions'
import { getCountryDiscoveryDefault } from '../data/countryDiscoveryDefaults'
import { useSeo } from '../seo/useSeo'
import './CountryDetail.css'

/* ------------------------------------------------------------------ types */

interface CustomSection {
  title: string
  content: string
  type: 'text' | 'html' | 'list'
  order: number
}

interface CountryImage {
  url: string
  caption: string
  order: number
}

interface CountryPDF {
  url: string
  title: string
  description: string
  order?: number
}

interface CountryVideo {
  url: string
  title: string
  description?: string
  type?: 'youtube' | 'vimeo' | 'direct' | 'other'
  thumbnail?: string
  order?: number
}

interface CountryDocument {
  url: string
  title: string
  description?: string
  type?: 'docx' | 'doc' | 'xlsx' | 'xls' | 'pptx' | 'ppt' | 'txt' | 'other'
  order?: number
}

interface CountryMapPlace {
  name?: string
  type?: 'capital' | 'economic' | 'historic' | 'cultural' | 'natural' | 'port'
  description?: string
  highlight?: string
  coordinates?: { lat?: number; lng?: number }
}

interface CountrySource {
  _id: string
  type: string
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  reliability?: number
  description?: string
}

interface Country {
  _id: string
  id: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  culture: string
  oneSentenceSummary?: string
  keyFacts?: string[]
  peoples?: string[]
  languageNotes?: string
  historyHighlights?: string[]
  notableFigures?: string[]
  musicAndArts?: string[]
  foodCulture?: string[]
  oralTraditions?: string[]
  knowledgeToPreserve?: string[]
  relatedThemes?: string[]
  sourceQuality?: 'draft' | 'community' | 'verified' | 'official'
  discoveryIntro?: string
  lastUpdated?: string
  officialName?: string
  region?: string
  subregion?: string
  demonym?: string
  timeZone?: string
  callingCode?: string
  internetTld?: string
  drivingSide?: string
  independenceDate?: string
  governmentType?: string
  economicOverview?: string
  climate?: string
  bestTimeToVisit?: string
  safetyNote?: string
  etiquette?: string
  transport?: string
  connectivity?: string
  visaNote?: string
  healthAdvice?: string
  emergencyNumbers?: string
  color: string
  rites?: string[]
  customs?: string[]
  foods?: string[]
  traditions?: string[]
  festivals?: string[]
  arts?: string[]
  placesToDiscover?: string[]
  experiences?: string[]
  practicalTips?: string[]
  sourceNotes?: string[]
  customSections?: CustomSection[]
  images?: CountryImage[]
  pdfs?: CountryPDF[]
  videos?: CountryVideo[]
  documents?: CountryDocument[]
  mapPlaces?: CountryMapPlace[]
  historicalSites?: CountryMapPlace[]
}

interface RelatedItem {
  _id?: string
  title?: string
  name?: string
  text?: string
  translation?: string
  explanation?: string
  language?: string
  shortDescription?: string
  shortBiography?: string
  subtitle?: string
  description?: string
  period?: string
  date?: string
  category?: string
}

type Related = Partial<Record<'proverbs' | 'figures' | 'events' | 'stories' | 'collections' | 'quizzes' | 'blogs', RelatedItem[]>>

/* ------------------------------------------------------------------ utilitaires */

const flagUrl = (id: string, size: 'w40' | 'w80' | 'w160' | 'w320' | 'w640' = 'w160') => `https://flagcdn.com/${size}/${id.toLowerCase()}.png`

const list = (...sources: Array<string[] | undefined>) => {
  const seen = new Set<string>()
  return sources
    .flat()
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/** « Léopold Sédar Senghor - poète et président » → { name, role } */
const splitPerson = (value: string) => {
  const [name, ...rest] = value.split(/\s[-–—:]\s/)
  return { name: name.trim(), role: rest.join(' - ').trim() }
}

const byOrder = <T extends { order?: number }>(items?: T[]) => [...(items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const applyDefaults = (country: Country): Country => {
  const d = getCountryDiscoveryDefault(country.id) as Partial<Country>
  const pick = <K extends keyof Country>(key: K) => {
    const value = country[key]
    if (Array.isArray(value)) return (value.length ? value : d[key]) as Country[K]
    return (value || d[key]) as Country[K]
  }
  const keys: Array<keyof Country> = [
    'oneSentenceSummary', 'keyFacts', 'peoples', 'languageNotes', 'historyHighlights', 'notableFigures', 'musicAndArts',
    'foodCulture', 'oralTraditions', 'knowledgeToPreserve', 'relatedThemes', 'sourceQuality', 'discoveryIntro',
    'economicOverview', 'climate', 'bestTimeToVisit', 'etiquette', 'transport', 'connectivity', 'visaNote',
    'healthAdvice', 'safetyNote', 'placesToDiscover', 'experiences', 'practicalTips', 'sourceNotes', 'rites',
    'customs', 'foods', 'traditions', 'festivals', 'arts', 'lastUpdated',
  ]
  const merged: Country = { ...(d as Country), ...country }
  keys.forEach((key) => {
    ;(merged as unknown as Record<string, unknown>)[key] = pick(key)
  })
  return merged
}

const fromStatic = (id: string): Country | null => {
  const s = getStaticCountryById(id.toUpperCase())
  if (!s) return null
  return applyDefaults({
    _id: s.id,
    id: s.id,
    nameFr: s.nameFr,
    capital: s.capital,
    population: s.population,
    area: s.area,
    languages: s.languages || [],
    currency: s.currency || '',
    description: s.description,
    culture: s.culture || '',
    color: s.color,
    rites: s.rites,
    customs: s.customs,
    foods: s.foods,
    traditions: s.traditions,
    festivals: s.festivals,
    arts: s.arts,
  })
}

const qualityLabels: Record<string, string> = {
  draft: 'Brouillon à compléter',
  community: 'Contenu communautaire',
  verified: 'Contenu vérifié',
  official: 'Sources officielles',
}

/* ------------------------------------------------------------------ silhouette */

const continentShapes = Object.entries(africaMapShapes)

const CountrySilhouette = ({ id, color }: { id: string; color: string }) => {
  const shape = africaMapShapes[id]
  if (!shape) return null
  const b = pathBounds(shape.path)
  const pad = Math.max(b.width, b.height) * 0.08
  return (
    <div className="cd-shape" aria-hidden="true">
      <svg viewBox={`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`} className="cd-shape__main">
        <defs>
          <linearGradient id={`cd-grad-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path d={shape.path} fill={`url(#cd-grad-${id})`} className="cd-shape__path" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 1000 1140" className="cd-shape__locator">
        {continentShapes.map(([key, s]) => (
          <path key={key} d={s.path} className={key === id ? 'is-current' : ''} />
        ))}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ blocs */

const Section = ({ id, eyebrow, title, children, alt }: { id: string; eyebrow: string; title: string; children: ReactNode; alt?: boolean }) => (
  <section id={id} className={`cd-section${alt ? ' cd-section--alt' : ''}`} aria-labelledby={`${id}-title`}>
    <div className="container">
      <header className="cd-section__head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
      </header>
      {children}
    </div>
  </section>
)

const Chips = ({ items }: { items: string[] }) => (
  <ul className="cd-chips">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

const ThemeCard = ({ icon, title, items, text }: { icon: ReactNode; title: string; items?: string[]; text?: string }) =>
  (items && items.length > 0) || text ? (
    <article className="cd-theme">
      <h3>
        <span className="cd-theme__icon">{icon}</span>
        {title}
      </h3>
      {text && <p>{text}</p>}
      {items && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  ) : null

/* ------------------------------------------------------------------ page */

export const CountryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<Related | null>(null)
  const [sources, setSources] = useState<CountrySource[]>([])
  const [activeSection, setActiveSection] = useState('essentiel')
  const [lightbox, setLightbox] = useState<CountryImage | null>(null)
  const [pdf, setPdf] = useState<CountryPDF | null>(null)
  const [video, setVideo] = useState<CountryVideo | null>(null)
  const [doc, setDoc] = useState<CountryDocument | null>(null)

  useSeo(
    country
      ? {
          title: `${country.nameFr} : histoire, langues et cultures`,
          description: country.oneSentenceSummary || country.description,
          image: `https://flagcdn.com/w1280/${country.id.toLowerCase()}.png`,
          jsonLd: {
            '@type': 'Country',
            name: country.nameFr,
            description: (country.oneSentenceSummary || country.description || '').slice(0, 300),
            containedInPlace: { '@type': 'Continent', name: 'Afrique' },
          },
        }
      : null,
  )

  /* ---------- données ---------- */
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setRelated(null)
    setSources([])
    countryService
      .getById(id)
      .then((response) => {
        if (!cancelled) setCountry(response.data ? applyDefaults(response.data) : fromStatic(id))
      })
      .catch(() => {
        // API injoignable ou pays absent de la base : données statiques du catalogue
        if (!cancelled) setCountry(fromStatic(id))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!country) return
    let cancelled = false
    searchService
      .search({ q: country.nameFr, limit: 6 })
      .then((response) => !cancelled && setRelated(response.data || null))
      .catch(() => !cancelled && setRelated(null))
    sourceService
      .getAll({ country: country.id, limit: 6, minReliability: 3 })
      .then((response) => !cancelled && setSources(response.data?.sources || []))
      .catch(() => !cancelled && setSources([]))
    return () => {
      cancelled = true
    }
  }, [country])

  /* ---------- contenu dérivé ---------- */
  const region = country ? getRegion(country.id) : undefined
  const accent = region?.colorDark || country?.color || '#05662f'

  const culture = useMemo(() => {
    if (!country) return null
    return {
      arts: list(country.musicAndArts, country.arts),
      traditions: list(country.traditions, country.festivals),
      rites: list(country.rites, country.customs),
      oral: list(country.oralTraditions),
      food: list(country.foodCulture, country.foods),
      people: list(country.notableFigures).map(splitPerson),
      places: list(country.placesToDiscover, country.experiences),
      history: list(country.historyHighlights),
      peoples: list(country.peoples),
      preserve: list(country.knowledgeToPreserve),
    }
  }, [country])

  const practical = useMemo(() => {
    if (!country) return []
    return [
      ['Climat', country.climate],
      ['Meilleure période', country.bestTimeToVisit],
      ['Se déplacer', country.transport],
      ['Connectivité', country.connectivity],
      ['Savoir-vivre', country.etiquette],
      ['Visa', country.visaNote],
      ['Santé', country.healthAdvice],
      ['Sécurité', country.safetyNote],
      ['Urgences', country.emergencyNumbers],
    ].filter(([, value]) => Boolean(value)) as Array<[string, string]>
  }, [country])

  const technical = useMemo(() => {
    if (!country) return []
    return [
      ['Nom officiel', country.officialName],
      ['Gentilé', country.demonym],
      ['Indépendance', country.independenceDate],
      ['Régime', country.governmentType],
      ['Fuseau horaire', country.timeZone],
      ['Indicatif', country.callingCode],
      ['Domaine internet', country.internetTld],
      ['Conduite', country.drivingSide],
    ].filter(([, value]) => Boolean(value)) as Array<[string, string]>
  }, [country])

  const images = byOrder(country?.images).filter((image) => image?.url)
  const pdfs = byOrder(country?.pdfs).filter((item) => item?.url)
  const videos = byOrder(country?.videos).filter((item) => item?.url)
  const documents = byOrder(country?.documents).filter((item) => item?.url)
  const customSections = byOrder(country?.customSections).filter((section) => section?.title && section?.content)

  const proverbs = related?.proverbs || []
  const relatedFigures = related?.figures || []
  const relatedEvents = related?.events || []
  const further = [
    ...(related?.stories || []).map((item) => ({ item, to: `/stories/${item._id}`, kind: 'Récit', icon: <BookOpen size={18} /> })),
    ...(related?.collections || []).map((item) => ({ item, to: `/collections/${item._id}`, kind: 'Collection', icon: <MapIcon size={18} /> })),
    ...(related?.quizzes || []).map((item) => ({ item, to: `/quizzes/${item._id}`, kind: 'Quiz', icon: <GraduationCap size={18} /> })),
    ...(related?.blogs || []).map((item) => ({ item, to: `/blog/${item._id}`, kind: 'Article', icon: <FileText size={18} /> })),
  ]

  /* Sections présentes (la navigation n'affiche que celles qui ont du contenu) */
  const sections = useMemo(() => {
    if (!country || !culture) return []
    return [
      { id: 'essentiel', label: 'L’essentiel', show: true },
      { id: 'histoire', label: 'Histoire', show: culture.history.length > 0 || relatedEvents.length > 0 },
      { id: 'peuples', label: 'Peuples & langues', show: culture.peoples.length > 0 || country.languages.length > 0 },
      { id: 'culture', label: 'Culture', show: culture.arts.length + culture.traditions.length + culture.rites.length + culture.oral.length > 0 || proverbs.length > 0 },
      { id: 'cuisine', label: 'Cuisine', show: culture.food.length > 0 },
      { id: 'personnalites', label: 'Personnalités', show: culture.people.length > 0 || relatedFigures.length > 0 },
      { id: 'lieux', label: 'Lieux', show: true },
      { id: 'medias', label: 'Médias', show: images.length + pdfs.length + videos.length + documents.length > 0 },
      { id: 'pratique', label: 'Pratique', show: practical.length + technical.length > 0 || (country.practicalTips?.length ?? 0) > 0 },
      { id: 'sources', label: 'Sources', show: true },
    ].filter((section) => section.show)
  }, [country, culture, relatedEvents.length, proverbs.length, relatedFigures.length, images.length, pdfs.length, videos.length, documents.length, practical.length, technical.length])

  /* Section active pendant le défilement : la dernière dont le haut est passé sous la barre d'onglets */
  useEffect(() => {
    if (!sections.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const offset = (document.querySelector('.cd-tabs')?.getBoundingClientRect().bottom || 120) + 40
      let current = sections[0].id
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= offset) current = section.id
      }
      // Bas de page atteint : la dernière section est forcément celle lue
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].id
      }
      setActiveSection(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  // Garder l'onglet actif visible dans la barre (mobile)
  useEffect(() => {
    document.querySelector(`.cd-tabs a[href="#${activeSection}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [activeSection])

  /* Pays précédent / suivant dans la même région */
  const neighbours = useMemo(() => {
    if (!country || !region) return null
    const ids = [...region.countries].sort((a, b) =>
      (getStaticCountryById(a)?.nameFr || a).localeCompare(getStaticCountryById(b)?.nameFr || b, 'fr'),
    )
    const index = ids.indexOf(country.id)
    if (index < 0) return null
    const get = (offset: number) => getStaticCountryById(ids[(index + offset + ids.length) % ids.length])
    return { prev: get(-1), next: get(1), others: ids.filter((other) => other !== country.id).map((other) => getStaticCountryById(other)).filter(Boolean) }
  }, [country, region])

  /* ---------- états ---------- */
  if (loading) {
    return (
      <Layout fullWidth>
        <div className="mb-page-loader" role="status" aria-live="polite">
          <span className="sr-only">Chargement de la fiche pays…</span>
          <div className="mb-skeleton" style={{ height: 22, width: 160 }} />
          <div className="mb-skeleton" style={{ height: 56, width: '50%' }} />
          <div className="mb-skeleton" style={{ height: 18, width: '70%' }} />
          <div className="mb-skeleton" style={{ height: 320, marginTop: 24 }} />
        </div>
      </Layout>
    )
  }

  if (!country || !culture) {
    return (
      <Layout>
        <div className="mb-state" style={{ marginTop: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Pays introuvable</h1>
          <p>Aucune fiche ne correspond à « {id} ». Retrouvez tous les pays sur la carte.</p>
          <Link to="/map" className="btn">
            Ouvrir la carte
          </Link>
        </div>
      </Layout>
    )
  }

  const stats = [
    ['Capitale', country.capital],
    ['Population', country.population],
    ['Superficie', country.area],
    ['Monnaie', country.currency],
    ['Indépendance', country.independenceDate],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>

  return (
    <Layout fullWidth>
      <div className="cd" style={{ ['--cd-accent' as string]: accent }}>
        {/* ---------- Héros ---------- */}
        <header className="cd-hero">
          <div className="container cd-hero__grid">
            <div className="cd-hero__text">
              <nav className="cd-crumbs" aria-label="Fil d’Ariane">
                <Link to="/map">Carte</Link>
                <span aria-hidden="true">›</span>
                {region ? <Link to={`/map?pays=${country.id.toLowerCase()}`}>{region.name}</Link> : <span>Afrique</span>}
                <span aria-hidden="true">›</span>
                <span aria-current="page">{country.nameFr}</span>
              </nav>
              <div className="cd-hero__title">
                <img src={flagUrl(country.id, 'w160')} alt={`Drapeau : ${country.nameFr}`} width={72} height={48} />
                <div>
                  <h1>{country.nameFr}</h1>
                  {country.officialName && country.officialName !== country.nameFr && <p className="cd-hero__official">{country.officialName}</p>}
                </div>
              </div>
              <p className="cd-hero__lead">{country.oneSentenceSummary || country.description}</p>
              <dl className="cd-stats">
                {stats.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="cd-hero__actions">
                <a href="#essentiel" className="btn">
                  Découvrir le pays
                </a>
                <Link to={`/map?pays=${country.id.toLowerCase()}`} className="btn btn-outline">
                  <MapIcon size={18} aria-hidden={true} /> Voir sur la carte
                </Link>
              </div>
            </div>
            <CountrySilhouette id={country.id} color={accent} />
          </div>
        </header>

        {/* ---------- Navigation de la fiche ---------- */}
        <nav className="cd-tabs" aria-label="Sections de la fiche">
          <div className="container">
            <ul>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={activeSection === section.id ? 'is-active' : ''} aria-current={activeSection === section.id ? 'true' : undefined}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ---------- L'essentiel ---------- */}
        <Section id="essentiel" eyebrow="L’essentiel" title={`${country.nameFr} en bref`}>
          <div className="cd-essential">
            <div className="cd-prose">
              {(country.discoveryIntro || country.description)
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              {country.description && country.discoveryIntro && country.discoveryIntro !== country.description && <p>{country.description}</p>}
              {country.economicOverview && (
                <p>
                  <strong>Économie. </strong>
                  {country.economicOverview}
                </p>
              )}
            </div>
            {country.keyFacts && country.keyFacts.length > 0 && (
              <ol className="cd-facts">
                {country.keyFacts.map((fact, index) => (
                  <li key={fact}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {fact}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Section>

        {/* ---------- Histoire ---------- */}
        {sections.some((s) => s.id === 'histoire') && (
          <Section id="histoire" eyebrow="Histoire" title="Repères historiques" alt>
            <div className="cd-history">
              {culture.history.length > 0 && (
                <ol className="cd-timeline">
                  {culture.history.map((item) => (
                    <li key={item}>
                      <p>{item}</p>
                    </li>
                  ))}
                </ol>
              )}
              {relatedEvents.length > 0 && (
                <aside className="cd-linked">
                  <h3>
                    <Clock3 size={18} aria-hidden={true} /> Dans la chronologie
                  </h3>
                  <ul>
                    {relatedEvents.map((event) => (
                      <li key={event._id}>
                        <Link to={`/timeline/${event._id}`}>
                          <strong>{event.title}</strong>
                          {event.period && <span>{event.period}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to="/timeline" className="link-arrow">
                    Toute la chronologie <ArrowRight size={16} aria-hidden={true} />
                  </Link>
                </aside>
              )}
            </div>
          </Section>
        )}

        {/* ---------- Peuples & langues ---------- */}
        {sections.some((s) => s.id === 'peuples') && (
          <Section id="peuples" eyebrow="Peuples & langues" title="Celles et ceux qui font le pays">
            <div className="cd-two">
              {culture.peoples.length > 0 && (
                <div>
                  <h3 className="cd-subtitle">Peuples et communautés</h3>
                  <Chips items={culture.peoples} />
                </div>
              )}
              <div>
                <h3 className="cd-subtitle">
                  <Languages size={18} aria-hidden={true} /> Langues
                </h3>
                <Chips items={country.languages} />
                {country.languageNotes && <p className="cd-note">{country.languageNotes}</p>}
              </div>
            </div>
          </Section>
        )}

        {/* ---------- Culture ---------- */}
        {sections.some((s) => s.id === 'culture') && (
          <Section id="culture" eyebrow="Culture" title="Arts, traditions et paroles" alt>
            {country.culture && <p className="cd-lead">{country.culture}</p>}
            <div className="cd-themes">
              <ThemeCard icon={<Music size={20} />} title="Musiques et arts" items={culture.arts} />
              <ThemeCard icon={<Sparkles size={20} />} title="Traditions et fêtes" items={culture.traditions} />
              <ThemeCard icon={<Landmark size={20} />} title="Rites et coutumes" items={culture.rites} />
              <ThemeCard icon={<Quote size={20} />} title="Oralité" items={culture.oral} />
            </div>

            {proverbs.length > 0 && (
              <div className="cd-proverbs">
                <h3 className="cd-subtitle">Proverbes — {country.nameFr}</h3>
                <div className="cd-proverbs__grid">
                  {proverbs.slice(0, 4).map((proverb) => (
                    <figure key={proverb._id} className="cd-proverb">
                      <blockquote>« {proverb.text} »</blockquote>
                      {proverb.translation && <p className="cd-proverb__translation">{proverb.translation}</p>}
                      {proverb.explanation && <figcaption>{proverb.explanation}</figcaption>}
                      {proverb.language && <span className="mb-tag">{proverb.language}</span>}
                    </figure>
                  ))}
                </div>
                <Link to={`/proverbs?search=${encodeURIComponent(country.nameFr)}`} className="link-arrow">
                  Tous les proverbes <ArrowRight size={16} aria-hidden={true} />
                </Link>
              </div>
            )}
          </Section>
        )}

        {/* ---------- Cuisine ---------- */}
        {sections.some((s) => s.id === 'cuisine') && (
          <Section id="cuisine" eyebrow="Cuisine" title="À goûter">
            <ul className="cd-dishes">
              {culture.food.map((dish) => (
                <li key={dish}>
                  <Utensils size={18} aria-hidden={true} />
                  {dish}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ---------- Personnalités ---------- */}
        {sections.some((s) => s.id === 'personnalites') && (
          <Section id="personnalites" eyebrow="Personnalités" title="Des figures qui ont marqué le pays" alt>
            <div className="cd-people">
              {relatedFigures.map((figure) => (
                <Link key={figure._id} to={`/figures/${figure._id}`} className="cd-person is-link">
                  <span className="cd-person__avatar" aria-hidden="true">
                    {(figure.name || '?').charAt(0)}
                  </span>
                  <span>
                    <strong>{figure.name}</strong>
                    <small>{figure.shortBiography}</small>
                  </span>
                  <ArrowRight size={16} aria-hidden={true} className="cd-person__arrow" />
                </Link>
              ))}
              {culture.people
                .filter((person) => !relatedFigures.some((figure) => figure.name && person.name.toLowerCase().includes(figure.name.toLowerCase())))
                .map((person) => (
                  <div key={person.name} className="cd-person">
                    <span className="cd-person__avatar" aria-hidden="true">
                      {person.name.charAt(0)}
                    </span>
                    <span>
                      <strong>{person.name}</strong>
                      {person.role && <small>{person.role}</small>}
                    </span>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* ---------- Lieux ---------- */}
        <Section id="lieux" eyebrow="Lieux" title="Villes, routes et paysages">
          <CountryInteractiveMap country={country} />
          {culture.places.length > 0 && (
            <div className="cd-places">
              <h3 className="cd-subtitle">À découvrir</h3>
              <Chips items={culture.places} />
            </div>
          )}
        </Section>

        {/* ---------- Sections personnalisées (administration) ---------- */}
        {customSections.map((section) => (
          <Section key={section.title} id={`section-${section.order}`} eyebrow="Dossier" title={section.title} alt>
            {section.type === 'list' ? (
              <ul className="cd-list">
                {section.content
                  .split('\n')
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line}>{line.replace(/^[-•]\s*/, '')}</li>
                  ))}
              </ul>
            ) : section.type === 'html' ? (
              // Contenu saisi par l'administration
              <div className="cd-prose" dangerouslySetInnerHTML={{ __html: section.content }} />
            ) : (
              <div className="cd-prose">
                {section.content.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            )}
          </Section>
        ))}

        {/* ---------- Médias ---------- */}
        {sections.some((s) => s.id === 'medias') && (
          <Section id="medias" eyebrow="Médias" title="Images, vidéos et documents" alt>
            {images.length > 0 && (
              <div className="cd-gallery">
                {images.map((image) => (
                  <button key={image.url} type="button" onClick={() => setLightbox(image)} className="cd-gallery__item">
                    <img src={image.url} alt={image.caption || country.nameFr} loading="lazy" />
                    {image.caption && <span>{image.caption}</span>}
                  </button>
                ))}
              </div>
            )}
            {videos.length + pdfs.length + documents.length > 0 && (
              <ul className="cd-files">
                {videos.map((item) => (
                  <li key={item.url}>
                    <button type="button" onClick={() => setVideo(item)}>
                      <PlayCircle size={20} aria-hidden={true} />
                      <span>
                        <strong>{item.title}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                    </button>
                  </li>
                ))}
                {pdfs.map((item) => (
                  <li key={item.url}>
                    <button type="button" onClick={() => setPdf(item)}>
                      <FileText size={20} aria-hidden={true} />
                      <span>
                        <strong>{item.title}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                    </button>
                  </li>
                ))}
                {documents.map((item) => (
                  <li key={item.url}>
                    <button type="button" onClick={() => setDoc(item)}>
                      <FileText size={20} aria-hidden={true} />
                      <span>
                        <strong>{item.title}</strong>
                        {item.description && <small>{item.description}</small>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {/* ---------- Pratique ---------- */}
        {sections.some((s) => s.id === 'pratique') && (
          <Section id="pratique" eyebrow="Pratique" title="Avant de partir">
            <div className="cd-practical">
              {practical.length > 0 && (
                <div className="cd-accordion">
                  {practical.map(([label, value], index) => (
                    <details key={label} open={index < 2}>
                      <summary>{label}</summary>
                      <p>{value}</p>
                    </details>
                  ))}
                  {country.practicalTips && country.practicalTips.length > 0 && (
                    <details>
                      <summary>Conseils</summary>
                      <ul>
                        {country.practicalTips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              {technical.length > 0 && (
                <dl className="cd-sheet">
                  {technical.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Section>
        )}

        {/* ---------- Aller plus loin ---------- */}
        {further.length > 0 && (
          <Section id="plus-loin" eyebrow="Aller plus loin" title="Sur MonBaobab" alt>
            <div className="cd-further">
              {further.slice(0, 6).map(({ item, to, kind, icon }) => (
                <Link key={to} to={to} className="cd-further__item">
                  <span className="cd-further__kind">
                    {icon} {kind}
                  </span>
                  <strong>{item.title || item.name}</strong>
                  {(item.subtitle || item.shortDescription || item.description) && (
                    <small>{item.subtitle || item.shortDescription || item.description}</small>
                  )}
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ---------- Sources ---------- */}
        <Section id="sources" eyebrow="Sources" title="D’où viennent ces informations">
          <div className="cd-sources">
            <div>
              <p className="cd-quality">
                <span className={`cd-quality__badge is-${country.sourceQuality || 'draft'}`}>
                  {qualityLabels[country.sourceQuality || 'draft']}
                </span>
                {country.lastUpdated && <span>Mise à jour : {country.lastUpdated}</span>}
              </p>
              {country.sourceNotes && country.sourceNotes.length > 0 && (
                <ul className="cd-list">
                  {country.sourceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
              {sources.length > 0 && (
                <ul className="cd-source-list">
                  {sources.map((source) => (
                    <li key={source._id}>
                      <strong>{source.title}</strong>
                      <span>{[source.author, source.publisher, source.year].filter(Boolean).join(' · ')}</span>
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          Consulter <ExternalLink size={14} aria-label="(nouvel onglet)" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <aside className="cd-contribute">
              <PenLine size={22} aria-hidden={true} />
              <h3>Vous connaissez bien ce pays ?</h3>
              <p>Un proverbe, une recette, un lieu ou une correction : aidez-nous à enrichir cette fiche.</p>
              <Link to="/contribute" className="btn">
                Contribuer
              </Link>
            </aside>
          </div>
        </Section>

        {/* ---------- Pays voisins ---------- */}
        {neighbours && (
          <nav className="cd-neighbours" aria-label={`Autres pays — ${region?.name}`}>
            <div className="container">
              <div className="cd-neighbours__nav">
                {neighbours.prev && (
                  <Link to={`/country/${neighbours.prev.id.toLowerCase()}`} className="cd-neighbours__link">
                    <ChevronLeft size={20} aria-hidden={true} />
                    <img src={flagUrl(neighbours.prev.id, 'w40')} alt="" width={24} height={16} />
                    <span>
                      <small>Précédent</small>
                      {neighbours.prev.nameFr}
                    </span>
                  </Link>
                )}
                <Link to={`/map?pays=${country.id.toLowerCase()}`} className="cd-neighbours__map">
                  <ArrowLeft size={16} aria-hidden={true} /> Retour à la carte
                </Link>
                {neighbours.next && (
                  <Link to={`/country/${neighbours.next.id.toLowerCase()}`} className="cd-neighbours__link is-next">
                    <span>
                      <small>Suivant</small>
                      {neighbours.next.nameFr}
                    </span>
                    <img src={flagUrl(neighbours.next.id, 'w40')} alt="" width={24} height={16} />
                    <ChevronRight size={20} aria-hidden={true} />
                  </Link>
                )}
              </div>
              <h2 className="cd-neighbours__title">Autres pays — {region?.name}</h2>
              <ul className="cd-neighbours__list">
                {neighbours.others.map((other) => (
                  <li key={other!.id}>
                    <Link to={`/country/${other!.id.toLowerCase()}`}>
                      <img src={flagUrl(other!.id, 'w40')} alt="" width={20} height={14} loading="lazy" />
                      {other!.nameFr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>

      {/* ---------- Visionneuses ---------- */}
      {lightbox && (
        <div className="cd-modal" role="dialog" aria-modal="true" aria-label={lightbox.caption || 'Image'} onClick={() => setLightbox(null)}>
          <figure className="cd-modal__image" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || country.nameFr} />
            {lightbox.caption && <figcaption>{lightbox.caption}</figcaption>}
            <button type="button" className="btn btn-outline" onClick={() => setLightbox(null)}>
              Fermer
            </button>
          </figure>
        </div>
      )}
      {pdf && (
        <div className="cd-modal" role="dialog" aria-modal="true" onClick={() => setPdf(null)}>
          <div className="cd-modal__box" onClick={(event) => event.stopPropagation()}>
            <PDFViewer url={pdf.url} title={pdf.title || 'Document PDF'} description={pdf.description} onClose={() => setPdf(null)} />
          </div>
        </div>
      )}
      {video && (
        <div className="cd-modal" role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
          <div className="cd-modal__box" onClick={(event) => event.stopPropagation()}>
            <VideoViewer url={video.url} title={video.title} description={video.description} type={video.type} thumbnail={video.thumbnail} onClose={() => setVideo(null)} />
          </div>
        </div>
      )}
      {doc && (
        <div className="cd-modal" role="dialog" aria-modal="true" onClick={() => setDoc(null)}>
          <div className="cd-modal__box" onClick={(event) => event.stopPropagation()}>
            <DocumentViewer url={doc.url} title={doc.title} description={doc.description} type={doc.type || 'other'} onClose={() => setDoc(null)} />
          </div>
        </div>
      )}
    </Layout>
  )
}
