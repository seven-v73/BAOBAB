import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight, ChevronRight, Minus, Plus, Search, X } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { AfricaRelief } from '../components/AfricaRelief/AfricaRelief'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { allAfricanCountries } from '../data/allAfricanCountries'
import { getCountryDiscoveryDefault, REGION_LABELS, regionOf, type AfricaRegion } from '../data/countryDiscoveryDefaults'
import { CAPITAL_COORDS, ENRICHED_TERRITORIES, projectOnAfrica } from '../data/africaGeo'
import { joinMeta, readableQuantity } from '../utils'
import './MapPage.css'

// Page Explorer d'après la maquette Figma « Explorer / Desktop 1440 », « Mobile 390 » et « Pays sélectionné ».

const REGIONS = REGION_LABELS

const CHIPS = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'nord', label: 'Nord' },
  { key: 'ouest', label: 'Ouest' },
  { key: 'centre', label: 'Centre' },
  { key: 'est', label: 'Est' },
  { key: 'australe', label: 'Australe' },
] as const

// Cadre de la carte de la maquette (896 × 860, contour de 725 px à (80, 50)), en unités du contour
const VIEW = { x: -70, y: -44, w: 783, h: 752 }
const ZOOMS = [1, 1.6, 2.4]

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const COUNTRIES = allAfricanCountries
  .map((country) => ({
    ...country,
    code: country.id,
    region: regionOf(country.id),
    point: projectOnAfrica(CAPITAL_COORDS[country.id]),
    enriched: ENRICHED_TERRITORIES[country.id],
  }))
  .sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))

type Country = (typeof COUNTRIES)[number]

const regionCounts = COUNTRIES.reduce<Partial<Record<AfricaRegion | 'toutes', number>>>(
  (acc, c) => ({ ...acc, [c.region]: (acc[c.region] ?? 0) + 1, toutes: (acc.toutes ?? 0) + 1 }),
  {}
)

export const MapPage = () => {
  const [region, setRegion] = useParamState<AfricaRegion | 'toutes'>('region', 'toutes')
  const [selectedCode, setSelectedCode] = useParamState<string>('pays', '')
  const [query, setQuery] = useState('')
  const [zoom, setZoom] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  const selected = COUNTRIES.find((c) => c.code === selectedCode.toUpperCase())
  const select = (country: Country) => setSelectedCode(country.code.toLowerCase())

  const groups = useMemo(() => {
    const q = normalize(query.trim())
    const visible = COUNTRIES.filter(
      (c) => (region === 'toutes' || c.region === region) && (!q || normalize(c.nameFr).includes(q) || normalize(c.capital).includes(q))
    )
    return (Object.keys(REGIONS) as AfricaRegion[])
      .map((key) => ({ key, countries: visible.filter((c) => c.region === key) }))
      .filter((group) => group.countries.length > 0)
  }, [query, region])

  // Zoom : le cadre se resserre autour du pays choisi (ou du centre du continent)
  useEffect(() => {
    const scale = ZOOMS[zoom]
    const w = VIEW.w / scale
    const h = VIEW.h / scale
    const center = selected?.point ?? { x: VIEW.x + VIEW.w / 2, y: VIEW.y + VIEW.h / 2 }
    const x = Math.min(Math.max(center.x - w / 2, VIEW.x), VIEW.x + VIEW.w - w)
    const y = Math.min(Math.max(center.y - h / 2, VIEW.y), VIEW.y + VIEW.h - h)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(svgRef.current, { attr: { viewBox: `${x} ${y} ${w} ${h}` }, duration: reduce ? 0 : 0.6, ease: 'power3.out' })
  }, [zoom, selected])

  const scale = ZOOMS[zoom]
  const summary = selected && (getCountryDiscoveryDefault(selected.code).oneSentenceSummary || selected.enriched?.tagline || selected.description)

  return (
    <Layout fullWidth>
      <div className="mbx">
        <section className="mbx-panel" aria-labelledby="mbx-title">
          <header className="mbx-intro">
            <h1 id="mbx-title">Explorer l’Afrique</h1>
            <p>{COUNTRIES.length} pays, cinq régions. Choisissez un pays sur la carte ou dans la liste pour ouvrir sa fiche.</p>
          </header>

          <div className="mbx-chips">
            <TypeChips label="Région" options={CHIPS} counts={regionCounts} active={region} onChange={setRegion} />
          </div>

          <div className="mbx-sheet">
            <label className="mbx-search">
              <Search size={18} strokeWidth={1.6} aria-hidden="true" />
              <span className="sr-only">Rechercher un pays ou une capitale</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un pays ou une capitale"
              />
            </label>

            <div className="mbx-list">
              {groups.length === 0 && <p className="mbx-empty">Aucun pays ne correspond à « {query.trim()} ».</p>}
              {groups.map((group) => (
                <div key={group.key} role="group" aria-label={REGIONS[group.key]}>
                  <p className="mbx-group">
                    <span>{REGIONS[group.key]}</span>
                    <span>{group.countries.length} pays</span>
                  </p>
                  {group.countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      className="mbx-row"
                      aria-pressed={country.code === selected?.code}
                      onClick={() => select(country)}
                      style={{ '--dot': country.enriched?.color ?? 'var(--brand-sauge)' } as React.CSSProperties}
                    >
                      <span className="mbx-dot" aria-hidden="true" />
                      <span className="mbx-row-text">
                        <strong>{country.nameFr}</strong>
                        <span>{joinMeta(country.capital, country.description)}</span>
                      </span>
                      <ChevronRight size={18} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mbx-map" aria-label="Carte de l’Afrique">
          <AfricaRelief id="mbx-africa" viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} svgRef={svgRef} className="mbx-relief">
            {COUNTRIES.map((country) => {
              const { x, y } = country.point
              const active = country.code === selected?.code
              return (
                <g key={country.code} className="mbx-capital" onClick={() => select(country)}>
                  <title>{`${country.nameFr} · ${country.capital}`}</title>
                  {active && <circle cx={x} cy={y} r={21 / scale} fill={country.enriched?.color ?? 'var(--brand-sauge)'} opacity="0.28" />}
                  {country.enriched || active ? (
                    <circle
                      cx={x}
                      cy={y}
                      r={(active ? 8.7 : 6) / scale}
                      fill={country.enriched?.color ?? 'var(--brand-sauge)'}
                      stroke="var(--brand-blanc)"
                      strokeWidth={(active ? 2.6 : 2.2) / scale}
                    />
                  ) : (
                    <circle cx={x} cy={y} r={3.5 / scale} fill="var(--brand-creme)" stroke="var(--brand-sauge)" strokeWidth={1.3 / scale} />
                  )}
                </g>
              )
            })}
            {selected && (
              <foreignObject
                x={selected.point.x - 80 / scale}
                y={selected.point.y - 52 / scale}
                width={160 / scale}
                height={36 / scale}
                className="mbx-label-wrap"
              >
                <div className="mbx-label" style={{ transform: `scale(${1 / scale})` }}>
                  <span>{selected.nameFr}</span>
                </div>
              </foreignObject>
            )}
          </AfricaRelief>

          <div className="mbx-legend" aria-hidden="true">
            <span><i className="mbx-legend-rich" /> Fiche enrichie</span>
            <span><i className="mbx-legend-wip" /> Fiche en cours</span>
          </div>

          <div className="mbx-zoom">
            <button type="button" aria-label="Agrandir la carte" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => z + 1)}>
              <Plus size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Réduire la carte" disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)}>
              <Minus size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>

          {selected && (
            <article className="mbx-preview" aria-live="polite">
              {selected.enriched?.gallery?.[0] && <img src={selected.enriched.gallery[0].src} alt="" />}
              <div className="mbx-preview-body">
                <button type="button" className="mbx-close" aria-label="Fermer l’aperçu" onClick={() => setSelectedCode('')}>
                  <X size={18} aria-hidden="true" />
                </button>
                <p className="mbx-eyebrow">{REGIONS[selected.region]}</p>
                <h2>{selected.nameFr}</h2>
                {summary && <p className="mbx-summary">{summary}</p>}
                <p className="mbx-facts">
                  {joinMeta(selected.capital, `${readableQuantity(selected.population)} hab.`, readableQuantity(selected.area))}
                </p>
                <Link to={`/country/${selected.code.toLowerCase()}`} className="mbx-open">
                  Ouvrir la fiche <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}
        </section>
      </div>
    </Layout>
  )
}
