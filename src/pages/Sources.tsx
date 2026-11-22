import { CREDITS_PHOTOS } from '../data/creditsPhotos'
import { SOURCE_TYPE_LABELS } from '../utils/sources'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { sourceService } from '../services/api'
import { foundationSources } from '../data/foundationContent'
import { joinMeta, listFrom } from '../utils'
import { countryNameOf, interleaveByRegion, REGION_COLORS, REGION_LABELS, REGION_ORDER, regionOfCode, type Region } from '../utils/afrique'
import './Rubriques.css'
import './Sources.css'

// Sources : la bibliothèque de référence de MonBaobab, au style de la refonte (pastilles,
// cartes blanches arrondies) et lue à l'échelle du continent (filtre par région).

interface Source {
  _id: string
  type: string
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  reliability?: number
  description?: string
  relatedCountries?: Array<{ _id?: string; id?: string; nameFr?: string } | string>
}

const TYPES = [
  { key: 'tous', label: 'Toutes' },
  { key: 'book', label: 'Livres' },
  { key: 'archive', label: 'Archives' },
  { key: 'museum', label: 'Musées' },
  { key: 'testimony', label: 'Témoignages' },
  { key: 'video', label: 'Audio et vidéo' },
  { key: 'website', label: 'Sites' },
] as const
type TypeKey = (typeof TYPES)[number]['key']

const TYPE_LABELS = SOURCE_TYPE_LABELS

const RELIABILITY = ['3 et plus : contextualisée', '4 et plus : solide', '5 : référence']
const REGIONS = [{ key: 'partout', label: 'Tout le continent' }, ...REGION_ORDER.map((key) => ({ key, label: REGION_LABELS[key] }))] as const
type RegionKey = 'partout' | Region

const codesOf = (source: Source) =>
  (source.relatedCountries || [])
    .map((country) => (typeof country === 'string' ? country : country.id || ''))
    .filter(Boolean)
    .map((code) => code.toUpperCase())

export const Sources = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const country = (searchParams.get('country') || '').toUpperCase()
  const [sources, setSources] = useState<Source[]>(foundationSources as Source[])
  const [status, setStatus] = useState<'chargement' | 'pret' | 'hors-ligne'>('chargement')
  const [query, setQuery] = useState('')
  const [reliability, setReliability] = useState('')
  const [type, setType] = useParamState<TypeKey>('type', 'tous')
  const [region, setRegion] = useParamState<RegionKey>('region', 'partout')

  useEffect(() => {
    let cancelled = false
    sourceService
      .getAll({ limit: 200 })
      .then((response) => {
        if (cancelled) return
        const list = listFrom(response.data, 'sources') as Source[]
        if (list.length) setSources(list)
        setStatus('pret')
      })
      .catch(() => !cancelled && setStatus('hors-ligne'))
    return () => {
      cancelled = true
    }
  }, [])

  const minReliability = reliability ? Number(reliability[0]) : 0
  const inScope = (source: Source) => {
    const codes = codesOf(source)
    return (
      (!country || codes.includes(country)) &&
      (region === 'partout' || codes.some((code) => regionOfCode(code) === region)) &&
      (source.reliability || 0) >= minReliability &&
      (!query.trim() || `${source.title} ${source.description} ${source.author} ${source.publisher}`.toLowerCase().includes(query.trim().toLowerCase()))
    )
  }

  const scoped = sources.filter(inScope)
  const visible = interleaveByRegion(
    scoped.filter((source) => type === 'tous' || source.type === type),
    (source) => regionOfCode(codesOf(source)[0]),
  )
  const counts = Object.fromEntries(TYPES.map(({ key }) => [key, key === 'tous' ? scoped.length : scoped.filter((s) => s.type === key).length])) as Record<TypeKey, number>
  const regionCounts = Object.fromEntries(
    REGIONS.map(({ key }) => [key, sources.filter((s) => key === 'partout' || codesOf(s).some((code) => regionOfCode(code) === key)).length]),
  ) as Record<RegionKey, number>

  const stats = useMemo(
    () => ({
      reliable: sources.filter((source) => (source.reliability || 0) >= 4).length,
      countries: new Set(sources.flatMap(codesOf)).size,
    }),
    [sources],
  )

  return (
    <Layout fullWidth>
      <div className="msr">
        <header className="msr-intro">
          <div>
            <p className="msr-kicker">Bibliothèque de référence</p>
            <h1>Des sources pour vérifier la mémoire</h1>
          </div>
          <div className="msr-intro-side">
            <p>
              Ouvrages, archives, musées et témoignages qui fondent les contenus de MonBaobab. Chaque source porte une note de fiabilité,
              pour distinguer le savoir documenté de la tradition orale à contextualiser.
            </p>
            <p className="msr-stats">
              {sources.length} sources · {stats.reliable} très fiables · {stats.countries} pays
            </p>
            <div className="msr-actions">
              <Link to="/contribute" className="mbr-button">
                Proposer une source <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/map" className="mbr-button mbr-button--ghost">
                Explorer les pays
              </Link>
            </div>
          </div>
        </header>

        <div className="msr-filters">
          <TypeChips label="Type de source" options={TYPES} counts={counts} active={type} onChange={setType} />
          <div className="msr-refine">
            <Dropdown label="Fiabilité" allLabel="Fiabilité : toutes" value={reliability} options={RELIABILITY} onChange={setReliability} />
            <label className="msr-search">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une source" aria-label="Rechercher une source" />
            </label>
          </div>
        </div>
        <div className="msr-regions">
          <TypeChips label="Région" options={REGIONS} counts={regionCounts} active={region} onChange={setRegion} />
        </div>

        {country && (
          <p className="msr-scope">
            Sources liées à <strong>{countryNameOf(country) || country}</strong>.{' '}
            <button
              type="button"
              className="msr-link"
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('country')
                setSearchParams(next, { replace: true })
              }}
            >
              Voir toutes les sources
            </button>
          </p>
        )}
        {status === 'hors-ligne' && <p className="msr-scope">La bibliothèque n’est pas joignable pour le moment : voici les sources de référence de la rédaction.</p>}

        {visible.length > 0 ? (
          <ul className="msr-grid">
            {visible.map((source) => {
              const codes = codesOf(source)
              const firstRegion = regionOfCode(codes[0])
              return (
                <li key={source._id} className="msr-card" style={{ '--msr-region': firstRegion ? REGION_COLORS[firstRegion] : 'var(--brand-sauge)' } as CSSProperties}>
                  <p className="msr-card-kicker">
                    {joinMeta(TYPE_LABELS[source.type] || 'Source', source.reliability && `Fiabilité ${source.reliability}/5`)}
                  </p>
                  <h2>{source.title}</h2>
                  {source.description && <p className="msr-card-text">{source.description}</p>}
                  <p className="msr-card-meta">{joinMeta(source.author, source.publisher !== source.author && source.publisher, source.year)}</p>
                  {codes.length > 0 && (
                    <ul className="msr-countries">
                      {codes.slice(0, 5).map((code) => (
                        <li key={code}>
                          <Link to={`/country/${code.toLowerCase()}`}>{countryNameOf(code) || code}</Link>
                        </li>
                      ))}
                      {codes.length > 5 && <li>+{codes.length - 5}</li>}
                    </ul>
                  )}
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="msr-card-link">
                      Consulter la source <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="msr-empty">
            Aucune source ne correspond pour l’instant. <Link to="/contribute">Proposer une source</Link>
          </p>
        )}

        <aside className="msr-scale">
          <h2>Lire la note de fiabilité</h2>
          <ol>
            <li>
              <strong>5</strong> Référence scientifique ou institutionnelle, recoupée.
            </li>
            <li>
              <strong>4</strong> Source solide, auteur ou institution identifiés.
            </li>
            <li>
              <strong>3</strong> Source utile à contextualiser : tradition orale, témoignage, presse.
            </li>
          </ol>
        </aside>

        <aside className="msr-scale msr-credits" id="credits-photos">
          <h2>Crédits des photos</h2>
          <ul>
            {CREDITS_PHOTOS.map((photo) => (
              <li key={photo.src}>
                <a href={photo.page} target="_blank" rel="noopener noreferrer">{photo.legende}</a>, {photo.credit}, Wikimedia Commons.
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Layout>
  )
}
