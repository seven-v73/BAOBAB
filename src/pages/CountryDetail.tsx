import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  HandHeart,
  Images,
  MessageCircle,
  Palette,
  ShieldCheck,
  Ticket,
  TriangleAlert,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { AfricaRelief } from '../components/AfricaRelief/AfricaRelief'
import { BookmarkButton } from '../components/BookmarkButton/BookmarkButton'
import { ShareButton } from '../components/ShareButton/ShareButton'
import { Breadcrumbs } from '../components/UX/Breadcrumbs'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { countryService, searchService, sourceService } from '../services/api'
import { useSeo } from '../seo/useSeo'
import { getCountryById as getStaticCountry } from '../data/allAfricanCountries'
import {
  getCountryDiscoveryDefault,
  REGION_LABELS,
  regionOf,
  type CountryDiscoveryDefault,
} from '../data/countryDiscoveryDefaults'
import { getCountryMapPlaces } from '../data/countryMapPlaces'
import { CAPITAL_COORDS, ENRICHED_TERRITORIES, projectOnAfrica } from '../data/africaGeo'
import { FEATURED_STORIES } from '../data/featuredStories'
import { joinMeta, listFrom, readableQuantity } from '../utils'
import './CountryDetail.css'

// Fiche pays d'après la maquette Figma « Fiche pays / Desktop 1440 », « Mobile 390 » et ses quatre onglets.

type Country = CountryDiscoveryDefault & {
  _id: string
  id: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  images?: Array<{ url: string; caption?: string }>
}

type Tab = 'reperes' | 'culture' | 'memoire' | 'sources'

const TABS = [
  { key: 'reperes', label: 'Repères' },
  { key: 'culture', label: 'Culture' },
  { key: 'memoire', label: 'Mémoire' },
  { key: 'sources', label: 'Sources' },
] as const

const PLACE_TYPES: Record<string, string> = {
  capital: 'Capitale',
  economic: 'Économie',
  historic: 'Histoire',
  cultural: 'Culture',
  natural: 'Nature',
  port: 'Port',
}

const isEmpty = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

// La base est encore peu remplie : chaque champ vide prend la valeur rédigée dans countryDiscoveryDefaults.
const withDefaults = (country: Country): Country => {
  const defaults = getCountryDiscoveryDefault(country.id) as Record<string, unknown>
  const merged: Record<string, unknown> = { ...country }
  for (const [key, value] of Object.entries(defaults)) if (isEmpty(merged[key])) merged[key] = value
  return merged as unknown as Country
}

const loadCountry = async (id: string) => {
  try {
    const { data } = await countryService.getById(id)
    if (data) return withDefaults(data)
  } catch {
    // Pays absent de la base : on se rabat sur le catalogue statique
  }
  const fallback = getStaticCountry(id.toUpperCase())
  return fallback ? withDefaults({ ...fallback, _id: fallback.id, languages: fallback.languages || [] } as Country) : null
}

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

/** Section titrée de la fiche (titre en Hepta Slab, sous-titre facultatif). */
const Block = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <section className="mbp-block">
    <header>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
    {children}
  </section>
)

/** Grille d'éléments avec picto rond : savoir-faire, usages, méthode de vérification. */
const FeatureGrid = ({ items, icon: Icon }: { items: Array<{ title: string; text?: string; icon?: LucideIcon }>; icon?: LucideIcon }) => (
  <ul className="mbp-features">
    {items.map((item) => {
      const ItemIcon = item.icon ?? Icon
      return (
        <li key={item.title}>
          {ItemIcon && (
            <span className="mbp-picto" aria-hidden="true">
              <ItemIcon size={20} strokeWidth={1.8} />
            </span>
          )}
          <h3>{item.title}</h3>
          {item.text && <p>{item.text}</p>}
        </li>
      )
    })}
  </ul>
)

const TagList = ({ items }: { items: string[] }) => (
  <ul className="mbp-tags">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

export const CountryDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<any[]>([])
  const [proverbs, setProverbs] = useState<any[]>([])
  const [photoIndex, setPhotoIndex] = useState(0)

  // Titre, description et aperçu de partage propres au pays (les robots lisent la version pré-générée)
  useSeo(
    country
      ? {
          title: `${country.nameFr} : histoire, langues et cultures`,
          description: country.description,
          image: `https://flagcdn.com/w1280/${country.id.toLowerCase()}.png`,
          jsonLd: {
            '@type': 'Country',
            name: country.nameFr,
            description: (country.description || '').slice(0, 300),
            containedInPlace: { '@type': 'Continent', name: 'Afrique' },
          },
        }
      : null,
  )
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [tab, setTab] = useParamState<Tab>('onglet', 'reperes')
  const closeRef = useRef<HTMLButtonElement>(null)
  const photosRef = useRef<HTMLDivElement>(null)

  /** Fait défiler la bande photo d'un cran (chevrons mobiles, un cran par photo). */
  const scrollPhotos = (direction: 1 | -1) => {
    const el = photosRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  // La visionneuse se ferme avec Échap et bloque le défilement de la fiche
  useEffect(() => {
    if (!galleryOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGalleryOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [galleryOpen])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadCountry(id).then((result) => {
      if (cancelled) return
      setCountry(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!country) return
    let cancelled = false
    Promise.all([
      sourceService.getAll({ country: country.id, limit: 6, minReliability: 3 }).then((r) => listFrom(r.data, 'sources')).catch(() => []),
      searchService.search({ q: country.nameFr, limit: 6 }).then((r) => listFrom(r.data?.proverbs, 'proverbs')).catch(() => []),
    ]).then(([sourceList, proverbList]) => {
      if (cancelled) return
      setSources(sourceList)
      setProverbs(proverbList)
    })
    return () => {
      cancelled = true
    }
  }, [country])

  // Tout ce que la fiche affiche, calculé une fois à partir du pays
  const view = useMemo(() => {
    if (!country) return null
    const code = country.id.toUpperCase()
    const region = regionOf(code)
    const territory = ENRICHED_TERRITORIES[code]
    const places = getCountryMapPlaces(code, country.capital).filter((place) => place.description)
    const foods = country.foods ?? []
    const festivals = country.festivals ?? []
    const gallery = (country.images ?? []).filter((image) => image?.url).map((image) => ({ src: image.url, caption: image.caption ?? '' }))
    const photos = gallery.length > 0 ? gallery : (territory?.gallery ?? [])
    const doors = [
      places[0] && { kicker: 'Voir', title: places[0].name, text: places[0].description, icon: Eye },
      foods[0] && {
        kicker: 'Goûter',
        title: foods[0],
        text: foods.length > 2 ? `Une entrée simple dans les goûts du quotidien, avec ${lower(foods[1])} et ${lower(foods[2])}.` : undefined,
        icon: UtensilsCrossed,
      },
      festivals[0] && {
        kicker: 'Vivre',
        title: festivals[0],
        text: (country.experiences ?? []).find((e) => e.includes(festivals[0])) ?? 'Un grand rendez-vous de la vie culturelle du pays.',
        icon: Ticket,
      },
    ].filter(Boolean) as Array<{ kicker: string; title: string; text?: string; icon: LucideIcon }>
    const usages = [...(country.customs ?? []), ...(country.traditions ?? []), ...(country.rites ?? [])]
    const themes = [...(country.arts ?? []).slice(0, 3), ...usages].slice(0, 8)
    const datesAndFigures = [...(country.historyHighlights ?? []), ...(country.notableFigures ?? [])]
    const facts = [
      ['Capitale', country.capital],
      ['Population', country.population && `${readableQuantity(country.population)} hab.`],
      ['Superficie', readableQuantity(country.area)],
      [country.languages.length > 1 ? 'Langues officielles' : 'Langue officielle', country.languages.join(', ')],
      ['Monnaie', country.currency],
      ['Indicatif', country.callingCode],
    ].filter(([, value]) => value) as Array<[string, string]>
    return {
      code,
      region,
      territory,
      places,
      foods,
      festivals,
      photos,
      doors,
      usages,
      themes,
      datesAndFigures,
      facts,
      stories: FEATURED_STORIES.filter((story) => story.country === code),
      point: CAPITAL_COORDS[code] && projectOnAfrica(CAPITAL_COORDS[code]),
      notes: country.sourceNotes ?? [],
    }
  }, [country])

  if (loading) {
    return (
      <Layout>
        <p className="mbp-empty">Chargement de la fiche…</p>
      </Layout>
    )
  }

  if (!country || !view) {
    return (
      <Layout>
        <p className="mbp-empty">
          Ce pays n’a pas encore de fiche. <Link to="/map">Revenir à la carte</Link>
        </p>
      </Layout>
    )
  }

  const mapLink = `/map?pays=${view.code.toLowerCase()}`
  const summary = country.oneSentenceSummary || country.discoveryIntro || country.description
  const pinColor = view.territory?.color ?? 'var(--brand-sauge)'
  const counts: Record<Tab, number> = {
    reperes: view.doors.length + view.places.length + view.themes.length,
    culture: (country.arts ?? []).length + view.foods.length + view.festivals.length,
    memoire: view.usages.length + proverbs.length + view.datesAndFigures.length,
    sources: sources.length + view.notes.length,
  }

  return (
    <Layout fullWidth>
      <div className="mbp">
        <div className="mbp-crumbs">
          <Breadcrumbs
            items={[
              { label: 'Explorer', to: '/map' },
              { label: REGION_LABELS[view.region], to: `/map?region=${view.region}` },
              { label: country.nameFr },
            ]}
          />
        </div>

        {/* Galerie : grande photo et deux secondaires sur desktop, carrousel plein écran sur mobile */}
        <section className={`mbp-gallery${view.photos.length === 0 ? ' mbp-gallery--empty' : ''}`} data-count={view.photos.length} aria-label="Photos">
          <div
            className="mbp-photos"
            ref={photosRef}
            onScroll={(event) => {
              const el = event.currentTarget
              setPhotoIndex(Math.round(el.scrollLeft / el.clientWidth))
            }}
          >
            {view.photos.map((photo, index) => (
              <figure key={photo.src}>
                {/* Les deux premières en eager : le chargement différé casse le défilement
                    horizontal sur mobile (les photos suivantes restent vides au balayage). */}
                <img src={photo.src} alt={photo.caption} loading={index < 2 ? 'eager' : 'lazy'} />
                {index === 0 && photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
          {view.photos.length > 1 && (
            <div className="mbp-nav-row">
              <button type="button" className="mbp-nav" aria-label="Photo précédente" onClick={() => scrollPhotos(-1)}>
                <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <button type="button" className="mbp-nav" aria-label="Photo suivante" onClick={() => scrollPhotos(1)}>
                <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
          )}
          <div className="mbp-gallery-bar">
            <Link to="/map" className="mbp-round" aria-label="Retour à la carte">
              <ArrowLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <div className="mbp-gallery-actions">
              <BookmarkButton itemType="country" itemId={country._id} iconOnly className="mbp-round" />
              <ShareButton url={`/country/${id}`} title={country.nameFr} iconOnly className="mbp-round-wrap" />
            </div>
          </div>
          {view.photos.length > 1 && (
            <span className="mbp-counter">
              {photoIndex + 1} / {view.photos.length}
            </span>
          )}
          {view.photos.length > 1 && (
            <button type="button" className="mbp-all" onClick={() => setGalleryOpen(true)}>
              <Images size={16} strokeWidth={1.6} aria-hidden="true" />
              Toutes les photos
            </button>
          )}
        </section>

        <header className="mbp-intro">
          <div className="mbp-intro-text">
            <div className="mbp-labels">
              <span className={`mbp-label mbp-label--status${view.territory ? '' : ' mbp-label--wip'}`}>
                <i style={{ background: view.territory?.color }} /> {view.territory ? 'Fiche enrichie' : 'Fiche en cours'}
              </span>
            </div>
            <div className="mbp-heading">
              <h1>{country.nameFr}</h1>
              <p className="mbp-kicker">{REGION_LABELS[view.region]}</p>
            </div>
            {summary && <p className="mbp-lead">{summary}</p>}
            <div className="mbp-actions">
              <Link to={mapLink} className="mbp-btn">
                Voir sur la carte <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <BookmarkButton itemType="country" itemId={country._id} className="mbp-btn mbp-btn--pale" />
              <ShareButton url={`/country/${id}`} title={country.nameFr} className="mbp-share" />
            </div>
          </div>

          <div className="mbp-facts">
            <dl>
              {view.facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {view.notes[0] && <p className="mbp-facts-source">{view.notes[0]}</p>}
          </div>

          <Link to={mapLink} className="mbp-btn mbp-map-cta">
            Voir sur la carte <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </header>

        <div className="mbp-tabs">
          <TypeChips label="Rubriques de la fiche" options={TABS} counts={counts} active={tab} onChange={setTab} variant="tabs" />
        </div>

        <div className="mbp-body">
          <div className="mbp-main">
            {tab === 'reperes' && (
              <>
                {view.doors.length > 0 && (
                  <Block title="Par où commencer">
                    <ul className="mbp-doors">
                      {view.doors.map((door) => (
                        <li key={door.kicker}>
                          <span className="mbp-picto" aria-hidden="true">
                            <door.icon size={22} strokeWidth={1.8} />
                          </span>
                          <p className="mbp-kicker">{door.kicker}</p>
                          <h3>{door.title}</h3>
                          {door.text && <p>{door.text}</p>}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                {view.places.length > 0 && (
                  <Block title="Lieux à situer">
                    <ol className="mbp-list">
                      {view.places.map((place, index) => (
                        <li key={place.name}>
                          <Link to={mapLink} className="mbp-row">
                            <span className="mbp-number">{String(index + 1).padStart(2, '0')}</span>
                            <span className="mbp-row-text">
                              <span className="mbp-row-title">
                                <strong>{place.name}</strong>
                                <span className="mbp-type">{PLACE_TYPES[place.type] ?? place.type}</span>
                              </span>
                              <span className="mbp-row-desc">{place.description}</span>
                            </span>
                            <ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </Block>
                )}
                {view.themes.length > 0 && (
                  <Block title="Ce qui fait le pays">
                    <TagList items={view.themes} />
                    <button type="button" className="mbp-more" onClick={() => setTab('culture')}>
                      Tout voir dans l’onglet Culture <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </Block>
                )}
              </>
            )}

            {tab === 'culture' && (
              <>
                {view.stories[0] && (
                  <Link to={`/recit/${view.stories[0].id}`} className="mbp-feature">
                    <img src={view.stories[0].image} alt="" />
                    <span>
                      <span className="mbp-kicker">{view.stories[0].meta} · à la une</span>
                      <strong>{view.stories[0].title}</strong>
                      <span className="mbp-feature-text">{view.stories[0].text}</span>
                      <span className="mbp-more">
                        Lire le récit <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                )}
                {(country.arts ?? []).length > 0 && (
                  <Block title="Savoir-faire" subtitle="Les gestes et les objets qui racontent le pays.">
                    <FeatureGrid items={(country.arts ?? []).map((title) => ({ title }))} icon={Palette} />
                  </Block>
                )}
                {view.foods.length > 0 && (
                  <Block title="À table" subtitle="Plats du quotidien et de fête.">
                    <FeatureGrid items={view.foods.map((title) => ({ title }))} icon={UtensilsCrossed} />
                  </Block>
                )}
                {view.festivals.length > 0 && (
                  <Block title="Fêtes et rendez-vous">
                    <ul className="mbp-list">
                      {view.festivals.map((festival) => (
                        <li key={festival} className="mbp-row">
                          <span className="mbp-picto" aria-hidden="true">
                            <CalendarDays size={20} strokeWidth={1.8} />
                          </span>
                          <span className="mbp-row-text">
                            <strong>{festival}</strong>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
              </>
            )}

            {tab === 'memoire' && (
              <>
                {view.usages.length > 0 && (
                  <Block title="Usages à transmettre" subtitle="Ce qui se vit au quotidien et mérite d’être raconté avec justesse.">
                    <FeatureGrid items={view.usages.map((title) => ({ title }))} icon={HandHeart} />
                  </Block>
                )}
                {proverbs.length > 0 && (
                  <Block title="Paroles" subtitle="Proverbes reliés au pays.">
                    <ul className="mbp-quotes">
                      {proverbs.map((proverb) => (
                        <li key={proverb._id}>
                          <blockquote>« {String(proverb.text).replace(/^«\s*|\s*»$/g, '')} »</blockquote>
                          {(proverb.translation || proverb.meaning) && <p>{proverb.translation || proverb.meaning}</p>}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                <Block title="Dates et figures">
                  {view.datesAndFigures.length > 0 ? (
                    <TagList items={view.datesAndFigures} />
                  ) : (
                    <div className="mbp-placeholder">
                      <span className="mbp-picto" aria-hidden="true">
                        <CalendarDays size={20} strokeWidth={1.8} />
                      </span>
                      <span>
                        <strong>Aucune date ni figure reliée pour l’instant</strong>
                        Une date clé, une personnalité qui a marqué le pays ? Proposez-la avec sa source.
                      </span>
                      <Link to="/contribute" className="mbp-btn mbp-btn--pale">
                        Proposer
                      </Link>
                    </div>
                  )}
                </Block>
              </>
            )}

            {tab === 'sources' && (
              <>
                <Block title="Sources de cette fiche" subtitle="Chaque information affichée renvoie à une source. Les données sensibles se vérifient avant de voyager.">
                  <ul className="mbp-list">
                    {sources.map((source) => (
                      <li key={source._id} className="mbp-row">
                        <span className="mbp-picto" aria-hidden="true">
                          <BookOpen size={20} strokeWidth={1.8} />
                        </span>
                        <span className="mbp-row-text">
                          <span className="mbp-kicker">{joinMeta(source.type, source.publisher, source.year && String(source.year))}</span>
                          <strong>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}</strong>
                          {source.description && <span className="mbp-row-desc">{source.description}</span>}
                        </span>
                        <span className="mbp-badge">
                          <ShieldCheck size={16} aria-hidden="true" /> Vérifiée
                        </span>
                      </li>
                    ))}
                    {view.notes.map((note) => {
                      const toConfirm = /confirm/i.test(note)
                      return (
                        <li key={note} className="mbp-row">
                          <span className="mbp-picto" aria-hidden="true">
                            {toConfirm ? <TriangleAlert size={20} strokeWidth={1.8} /> : <ShieldCheck size={20} strokeWidth={1.8} />}
                          </span>
                          <span className="mbp-row-text">
                            <span className="mbp-row-desc">{note}</span>
                          </span>
                          <span className={`mbp-badge${toConfirm ? ' mbp-badge--warn' : ''}`}>{toConfirm ? 'À confirmer' : 'Vérifiée'}</span>
                        </li>
                      )
                    })}
                  </ul>
                </Block>
                <Block title="Comment MonBaobab vérifie" subtitle="Trois natures d’information, signalées partout sur le site.">
                  <FeatureGrid
                    items={[
                      { title: 'Source officielle', text: 'Données publiques ou institutionnelles, datées et citées.', icon: ShieldCheck },
                      { title: 'Tradition orale', text: 'Récits, proverbes et usages transmis, présentés avec leur contexte.', icon: MessageCircle },
                      { title: 'Contribution vérifiée', text: 'Proposée par la communauté, relue avant publication.', icon: Users },
                    ]}
                  />
                </Block>
                <div className="mbp-actions">
                  <Link to="/contribute" className="mbp-btn">
                    Proposer une source <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link to="/sources" className="mbp-more">
                    Voir toutes les sources <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </>
            )}
          </div>

          <aside className="mbp-aside">
            {view.point && (
              <Link to={mapLink} className="mbp-situer" aria-label={`Voir ${country.nameFr} sur la carte`}>
                <AfricaRelief id="mbp-africa" className="mbp-situer-map">
                  {/* Unités du viewBox (≈ ×3,07 px) : halo 30 px, point 13 px bordé de blanc comme la maquette */}
                  <circle cx={view.point.x} cy={view.point.y} r="46" fill={pinColor} opacity="0.3" />
                  <circle cx={view.point.x} cy={view.point.y} r="16" fill={pinColor} stroke="var(--brand-blanc)" strokeWidth="7.7" />
                </AfricaRelief>
                <span className="mbp-chip">
                  Voir sur la carte <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            )}
            {proverbs[0] && (
              <div className="mbp-proverb">
                <p className="mbp-kicker">Proverbe</p>
                <blockquote>« {String(proverbs[0].text).replace(/^«\s*|\s*»$/g, '')} »</blockquote>
                <Link to="/reperes?type=proverbes" className="mbp-more">
                  Lire les proverbes <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
            {view.stories.length > 0 && (
              <div className="mbp-stories">
                <h2>Récits liés</h2>
                {view.stories.map((story) => (
                  <Link key={story.title} to={`/recit/${story.id}`} className="mbp-story">
                    <img src={story.image} alt="" loading="lazy" />
                    <span>
                      <span className="mbp-kicker">{story.meta}</span>
                      <strong>{story.title}</strong>
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <div className="mbp-contribute">
              <h2>Vous connaissez {country.nameFr} ?</h2>
              <p>Proposez un récit, un proverbe ou une source. Chaque contribution est vérifiée avant publication.</p>
              <Link to="/contribute" className="mbp-btn mbp-btn--ambre">
                Contribuer <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        {galleryOpen && (
          <div
            className="mbp-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Photos de ${country.nameFr}`}
            onClick={() => setGalleryOpen(false)}
          >
            <div className="mbp-lightbox-bar">
              <h2>{country.nameFr}</h2>
              <button ref={closeRef} type="button" className="mbp-lightbox-close" onClick={() => setGalleryOpen(false)}>
                <X size={20} strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>
            <div className="mbp-lightbox-grid" onClick={(event) => event.stopPropagation()}>
              {view.photos.map((photo) => (
                <figure key={photo.src}>
                  <img src={photo.src} alt={photo.caption} loading="lazy" />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
