import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { useRecits, type RecitItem } from '../hooks/useRubriques'
import { interleaveByRegion, REGION_COLORS, REGION_LABELS, REGION_ORDER, type Region } from '../utils/afrique'
import './Recits.css'

// Récits d'après la maquette Figma « Récits / Desktop 1440 » et « Mobile 390 », alimentés par la
// base : articles et témoignages du carnet, histoires, dossiers, plus les récits de la maquette.
// Lecture pluriculturelle : filtre par région, régions alternées dans la liste, pays et région
// visibles sur chaque carte.

const TYPES = [
  { key: 'tous', label: 'Tous' },
  { key: 'articles', label: 'Articles' },
  { key: 'temoignages', label: 'Témoignages' },
  { key: 'histoires', label: 'Histoires' },
  { key: 'dossiers', label: 'Dossiers' },
] as const
type TypeKey = (typeof TYPES)[number]['key']

const REGIONS = [{ key: 'partout', label: 'Tout le continent' }, ...REGION_ORDER.map((key) => ({ key, label: REGION_LABELS[key] }))] as const
type RegionKey = 'partout' | Region

const PAGE = 12

const regionStyle = (region: Region | null) => ({ '--mrc-region': region ? REGION_COLORS[region] : 'var(--brand-sauge)' }) as CSSProperties

/** Pays et région d'un récit, avec le point de couleur de la région */
const Place = ({ item }: { item: RecitItem }) => (
  <p className="mrc-place">
    <i aria-hidden="true" />
    {item.pays === item.regionLabel ? item.pays : `${item.pays} · ${item.regionLabel}`}
  </p>
)

/** Vignette : l'image du récit, sinon les courbes de niveau de la marque dans la couleur de sa région */
const Media = ({ item, className }: { item: RecitItem; className: string }) =>
  item.image ? (
    <div className={className} style={{ backgroundImage: `url(${item.image})` }} aria-hidden="true" />
  ) : (
    <div className={`${className} mrc-motif`} aria-hidden="true" />
  )

export const Recits = () => {
  const { items, status } = useRecits()
  const [query, setQuery] = useState('')
  const [pays, setPays] = useState('')
  const [theme, setTheme] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [type, setType] = useParamState<TypeKey>('type', 'tous')
  const [region, setRegion] = useParamState<RegionKey>('region', 'partout')

  const paysOptions = useMemo(
    () => [...new Set(items.flatMap((item) => item.pays.split(', ')).filter((name) => name && name !== 'Tout le continent'))].sort((a, b) => a.localeCompare(b, 'fr')),
    [items],
  )
  const themeOptions = useMemo(() => [...new Set(items.map((item) => item.theme).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [items])

  const matchesFilters = (item: RecitItem) =>
    (region === 'partout' || item.region === region) &&
    (!pays || item.pays.split(', ').includes(pays)) &&
    (!theme || item.theme === theme) &&
    (!query.trim() || `${item.title} ${item.excerpt} ${item.pays}`.toLowerCase().includes(query.trim().toLowerCase()))

  // Compteurs par type selon les autres filtres, pour voir tout de suite ce qu'une région contient
  const filtered = items.filter(matchesFilters)
  const counts = Object.fromEntries(
    TYPES.map(({ key }) => [key, key === 'tous' ? filtered.length : filtered.filter((item) => item.kind === key).length]),
  ) as Record<TypeKey, number>
  const regionCounts = Object.fromEntries(
    REGIONS.map(({ key }) => [
      key,
      items.filter((item) => (key === 'partout' || item.region === key) && (type === 'tous' || item.kind === type)).length,
    ]),
  ) as Record<RegionKey, number>

  // Deux files alternées par région (illustrés / sans image), puis mêlées une à une : chaque ligne de
  // la grille mélange les régions et garde des photos, au lieu de trois vignettes vides d'affilée
  const candidates = filtered.filter((item) => (type === 'tous' ? item.kind !== 'dossiers' : item.kind === type))
  const illustrated = interleaveByRegion(candidates.filter((item) => item.image), (item) => item.region)
  const plain = interleaveByRegion(candidates.filter((item) => !item.image), (item) => item.region)
  const ofType = Array.from({ length: Math.max(illustrated.length, plain.length) }, (_, i) => [illustrated[i], plain[i]])
    .flat()
    .filter((item): item is RecitItem => Boolean(item))
  const dossiers = type === 'tous' ? interleaveByRegion(filtered.filter((item) => item.kind === 'dossiers'), (item) => item.region) : []

  // À la une : le premier récit illustré, pour garder la grande image de la maquette
  const feature = ofType.find((item) => item.image)
  const rest = ofType.filter((item) => item !== feature)
  const visible = rest.slice(0, shown)

  const countriesCount = new Set(items.flatMap((item) => item.codes)).size
  const regionsCount = new Set(items.map((item) => item.region).filter(Boolean)).size

  return (
    <Layout fullWidth>
      <div className="mrc">
        <header className="mrc-intro">
          <h1>Des histoires qui créent des liens</h1>
          <p>
            Articles, témoignages, histoires et dossiers pour comprendre les lieux, les voix et les héritages du continent.
            {status === 'pret' && countriesCount > 1 && (
              <span className="mrc-diversite">
                {' '}
                Des récits de {countriesCount} pays{regionsCount > 1 ? `, dans ${regionsCount} régions d’Afrique` : ''}.
              </span>
            )}
          </p>
        </header>

        {feature && (
          <Link to={feature.to} className="mrc-feature" style={regionStyle(feature.region)}>
            <img className="mrc-feature-media" src={feature.image} alt="" width={680} height={440} />
            <div className="mrc-feature-body">
              <p className="mrc-kicker">{feature.meta}</p>
              <h2>{feature.title}</h2>
              {feature.excerpt && <p className="mrc-feature-text">{feature.excerpt}</p>}
              <Place item={feature} />
              <span className="mrc-btn">
                Lire le récit <ArrowRight size={18} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}

        <div className="mrc-filters">
          <TypeChips label="Type de récit" options={TYPES} counts={counts} active={type} onChange={(key) => { setType(key); setShown(PAGE) }} />
          <div className="mrc-refine">
            <Dropdown label="Pays" allLabel="Pays : tous" value={pays} options={paysOptions} onChange={setPays} />
            <Dropdown label="Thème" allLabel="Thème : tous" value={theme} options={themeOptions} onChange={setTheme} />
            <label className="mrc-search">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un récit"
                aria-label="Rechercher un récit"
              />
            </label>
          </div>
        </div>
        <div className="mrc-regions">
          <TypeChips label="Région" options={REGIONS} counts={regionCounts} active={region} onChange={(key) => { setRegion(key); setShown(PAGE) }} />
        </div>

        {status === 'hors-ligne' && (
          <p className="mrc-empty">Les récits de la communauté ne sont pas joignables pour le moment : voici une sélection de la rédaction.</p>
        )}
        {!feature && visible.length === 0 && dossiers.length === 0 && (
          <p className="mrc-empty">
            Aucun récit ne correspond pour l’instant.{' '}
            <Link to="/contribute">Proposer un récit de cette région</Link>
          </p>
        )}

        {visible.length > 0 && (
          <ul className="mrc-grid">
            {visible.map((recit) => (
              <li key={recit.id}>
                <Link to={recit.to} className="mrc-card" style={regionStyle(recit.region)}>
                  <Media item={recit} className="mrc-card-media" />
                  <div className="mrc-card-body">
                    <p className="mrc-kicker">{recit.meta}</p>
                    <h3>{recit.title}</h3>
                    {recit.excerpt && <p className="mrc-card-text">{recit.excerpt}</p>}
                    <Place item={recit} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {rest.length > shown && (
          <div className="mrc-plus">
            <button type="button" className="mbr-button mbr-button--ghost" onClick={() => setShown((count) => count + PAGE)}>
              Voir plus de récits ({rest.length - shown})
            </button>
          </div>
        )}

        {dossiers.length > 0 && (
          <section className="mrc-dossiers">
            <header className="mrc-dossiers-head">
              <div>
                <h2>Dossiers</h2>
                <p>Des récits rassemblés autour d’un même sujet, d’une région à l’autre.</p>
              </div>
              <Link to="/recits?type=dossiers" className="mrc-more">
                Tous les dossiers <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <ul className="mrc-dossiers-list">
              {dossiers.slice(0, 6).map((dossier) => (
                <li key={dossier.id}>
                  <Link to={dossier.to} className="mrc-dossier" style={regionStyle(dossier.region)}>
                    {dossier.image ? (
                      <img className="mrc-dossier-img" src={dossier.image} alt="" loading="lazy" />
                    ) : (
                      <div className="mrc-dossier-img mrc-motif" aria-hidden="true" />
                    )}
                    <div className="mrc-dossier-body">
                      <p className="mrc-kicker">{dossier.meta}</p>
                      <h3>{dossier.title}</h3>
                      <span className="mrc-dossier-link">
                        Ouvrir le dossier <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Layout>
  )
}
