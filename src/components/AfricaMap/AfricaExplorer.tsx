import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Locate, Minus, Plus, Search, Shuffle, X } from 'lucide-react'
import { allAfricanCountries, type AfricanCountry } from '../../data/allAfricanCountries'
import { africaMapShapes } from '../../data/africaMapShapes'
import {
  africaRegions,
  getRegion,
  officialLanguageLabels,
  officialLanguages,
  parsePopulation,
  pathBounds,
  populationColor,
  populationScale,
  type OfficialLanguage,
  type RegionId,
} from '../../data/africaRegions'
import { countryService } from '../../services/api'
import './AfricaExplorer.css'

/* ------------------------------------------------------------------ constantes */

const MAP_W = 1000
const MAP_H = 1140
const FULL_VIEW = { x: -40, y: -20, w: MAP_W + 80, h: MAP_H + 40 }
const MIN_W = 120 // zoom maximal (largeur visible minimale)

type View = typeof FULL_VIEW
type Lens = 'region' | 'language' | 'population'

const flagUrl = (id: string, size: 'w40' | 'w80' | 'w160' | 'w320' = 'w80') =>
  `https://flagcdn.com/${size}/${id.toLowerCase()}.png`

interface CountryDetails {
  oneSentenceSummary?: string
  description?: string
  keyFacts?: string[]
  foodCulture?: string[]
  notableFigures?: string[]
  peoples?: string[]
  independenceDate?: string
}

/* Pré-calcul des formes : boîte englobante + surface relative (pour l'affichage des noms) */
const shapes = allAfricanCountries
  .filter((country) => africaMapShapes[country.id])
  .map((country) => {
    const shape = africaMapShapes[country.id]
    const box = pathBounds(shape.path)
    return { country, path: shape.path, label: shape.label, box, size: box.width * box.height }
  })
  .sort((a, b) => b.size - a.size) // les grands pays d'abord : les petits restent cliquables au-dessus

const shapeById = new Map(shapes.map((shape) => [shape.country.id, shape]))
const sortedCountries = [...allAfricanCountries].sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Cadre de vue centré sur une boîte, au ratio de la carte */
const viewForBox = (box: { x: number; y: number; width: number; height: number }, aspect: number): View => {
  const pad = Math.max(box.width, box.height) * 0.9 + 50
  let w = Math.max(box.width + pad * 2, MIN_W * 1.6)
  let h = Math.max(box.height + pad * 2, (MIN_W * 1.6) / aspect)
  if (w / h > aspect) h = w / aspect
  else w = h * aspect
  return { x: box.x + box.width / 2 - w / 2, y: box.y + box.height / 2 - h / 2, w, h }
}

/* ------------------------------------------------------------------ couche des pays */

interface CountriesLayerProps {
  fillFor: (country: AfricanCountry) => string
  isDimmed: (country: AfricanCountry) => boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

const CountriesLayer = memo(({ fillFor, isDimmed, selectedId, onSelect, onHover }: CountriesLayerProps) => (
  <g className="ax-countries">
    {shapes.map(({ country, path }) => (
      <path
        key={country.id}
        d={path}
        fill={fillFor(country)}
        className={`ax-country${selectedId === country.id ? ' is-selected' : ''}${isDimmed(country) ? ' is-dimmed' : ''}`}
        vectorEffect="non-scaling-stroke"
        tabIndex={0}
        role="button"
        aria-label={country.nameFr}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(country.id)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(country.id)
          }
        }}
        onPointerEnter={() => onHover(country.id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(country.id)}
        onBlur={() => onHover(null)}
      />
    ))}
  </g>
))

/* ------------------------------------------------------------------ composant */

interface AfricaExplorerProps {
  initialCountryId?: string | null
  onSelectionChange?: (countryId: string | null) => void
}

export const AfricaExplorer = ({ initialCountryId, onSelectionChange }: AfricaExplorerProps) => {
  const [view, setView] = useState<View>(FULL_VIEW)
  const [lens, setLens] = useState<Lens>('region')
  const [languageFilter, setLanguageFilter] = useState<OfficialLanguage | null>(null)
  const [regionFilter, setRegionFilter] = useState<RegionId | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(initialCountryId?.toUpperCase() || null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [details, setDetails] = useState<Record<string, CountryDetails | 'loading' | 'error'>>({})

  const stageRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const viewRef = useRef(view)
  const animRef = useRef<number | null>(null)
  const dragRef = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{ distance: number; view: View } | null>(null)

  viewRef.current = view
  const zoom = FULL_VIEW.w / view.w
  const selected = selectedId ? allAfricanCountries.find((c) => c.id === selectedId) || null : null
  const selectedRegion = selected ? getRegion(selected.id) : undefined

  /* ---------- animation de la vue ---------- */
  const aspect = () => {
    const rect = stageRef.current?.getBoundingClientRect()
    return rect && rect.height > 0 ? rect.width / rect.height : FULL_VIEW.w / FULL_VIEW.h
  }

  const fitView = (target: View): View => {
    // Adapter le cadre au ratio réel de la zone d'affichage (pas de déformation)
    const a = aspect()
    let { x, y, w, h } = target
    if (w / h > a) {
      const nh = w / a
      y -= (nh - h) / 2
      h = nh
    } else {
      const nw = h * a
      x -= (nw - w) / 2
      w = nw
    }
    return { x, y, w, h }
  }

  const animateTo = useCallback((target: View, duration = 650) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = viewRef.current
    if (reduce || duration === 0) {
      setView(target)
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const k = easeInOut(t)
      setView({
        x: from.x + (target.x - from.x) * k,
        y: from.y + (target.y - from.y) * k,
        w: from.w + (target.w - from.w) * k,
        h: from.h + (target.h - from.h) * k,
      })
      if (t < 1) animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
  }, [])

  const resetView = useCallback(() => animateTo(fitView(FULL_VIEW)), [animateTo])

  const focusCountry = useCallback(
    (id: string) => {
      const shape = shapeById.get(id)
      if (shape) animateTo(viewForBox(shape.box, aspect()))
    },
    [animateTo],
  )

  // Cadre initial adapté à la taille réelle (et centrage sur le pays demandé dans l'URL)
  useEffect(() => {
    if (initialCountryId && shapeById.has(initialCountryId.toUpperCase())) {
      setView(viewForBox(shapeById.get(initialCountryId.toUpperCase())!.box, aspect()))
    } else {
      setView(fitView(FULL_VIEW))
    }
    const onResize = () => setView((current) => fitView(current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- sélection ---------- */
  const selectCountry = useCallback(
    (id: string | null, focus = true) => {
      setSelectedId(id)
      onSelectionChange?.(id)
      if (id && focus) focusCountry(id)
    },
    [focusCountry, onSelectionChange],
  )

  useEffect(() => {
    if (!selectedId || details[selectedId]) return
    setDetails((current) => ({ ...current, [selectedId]: 'loading' }))
    countryService
      .getById(selectedId.toLowerCase())
      .then((response) => setDetails((current) => ({ ...current, [selectedId]: response.data || 'error' })))
      .catch(() => setDetails((current) => ({ ...current, [selectedId]: 'error' })))
  }, [selectedId, details])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        if (selectedId) {
          selectCountry(null, false)
          resetView()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, selectCountry, resetView])

  /* ---------- lentilles ---------- */
  const populations = useMemo(() => new Map(allAfricanCountries.map((c) => [c.id, parsePopulation(c.population)])), [])

  const fillFor = useCallback(
    (country: AfricanCountry) => {
      if (lens === 'population') return populationColor(populations.get(country.id) ?? null)
      if (lens === 'language') {
        const langs = officialLanguages[country.id] || []
        if (!languageFilter) return langs.length ? '#c9bfa9' : '#e4ddcd'
        return langs.includes(languageFilter) ? '#2f7d4f' : '#e4ddcd'
      }
      return getRegion(country.id)?.color || '#cfc4b0'
    },
    [lens, languageFilter, populations],
  )

  const isDimmed = useCallback(
    (country: AfricanCountry) => {
      if (regionFilter && getRegion(country.id)?.id !== regionFilter) return true
      return false
    },
    [regionFilter],
  )

  /* ---------- interactions : glisser, molette, pincer ---------- */
  const clientToMap = (clientX: number, clientY: number, v: View = viewRef.current) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: v.x + ((clientX - rect.left) / rect.width) * v.w, y: v.y + ((clientY - rect.top) / rect.height) * v.h }
  }

  const zoomAround = (factor: number, clientX?: number, clientY?: number) => {
    const v = viewRef.current
    const rect = svgRef.current!.getBoundingClientRect()
    const cx = clientX ?? rect.left + rect.width / 2
    const cy = clientY ?? rect.top + rect.height / 2
    const anchor = clientToMap(cx, cy, v)
    const w = Math.min(FULL_VIEW.w * 1.6, Math.max(MIN_W, v.w / factor))
    const h = w * (v.h / v.w)
    const rx = (cx - rect.left) / rect.width
    const ry = (cy - rect.top) / rect.height
    return { x: anchor.x - rx * w, y: anchor.y - ry * h, w, h }
  }

  const onWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setView(zoomAround(Math.exp(-event.deltaY * 0.0015), event.clientX, event.clientY))
  }

  // La molette ne doit pas faire défiler la page quand elle zoome la carte
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const prevent = (event: WheelEvent) => event.preventDefault()
    svg.addEventListener('wheel', prevent, { passive: false })
    return () => svg.removeEventListener('wheel', prevent)
  }, [])

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), view: viewRef.current }
      dragRef.current = null
      return
    }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    dragRef.current = { x: event.clientX, y: event.clientY, view: viewRef.current, moved: false }
  }

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (rect && event.pointerType === 'mouse') setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })

    if (pointersRef.current.has(event.pointerId)) pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pinchRef.current && pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const factor = distance / pinchRef.current.distance
      const base = pinchRef.current.view
      const w = Math.min(FULL_VIEW.w * 1.6, Math.max(MIN_W, base.w / factor))
      const h = w * (base.h / base.w)
      setView({ x: base.x + (base.w - w) / 2, y: base.y + (base.h - h) / 2, w, h })
      return
    }

    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < 4) return
    if (!drag.moved) {
      drag.moved = true
      svgRef.current?.setPointerCapture(event.pointerId)
    }
    const svgRect = svgRef.current!.getBoundingClientRect()
    setView({
      ...drag.view,
      x: drag.view.x - (dx / svgRect.width) * drag.view.w,
      y: drag.view.y - (dy / svgRect.height) * drag.view.h,
    })
  }

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    const drag = dragRef.current
    dragRef.current = null
    // Un glisser ne doit pas déclencher la sélection du pays sous le curseur
    if (drag?.moved) {
      const stop = (e: Event) => {
        e.stopPropagation()
        window.removeEventListener('click', stop, true)
      }
      window.addEventListener('click', stop, true)
      setTimeout(() => window.removeEventListener('click', stop, true), 0)
    }
  }

  /* ---------- recherche ---------- */
  const suggestions = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return []
    return sortedCountries
      .filter((c) => normalize(c.nameFr).includes(q) || normalize(c.capital).includes(q) || c.id.toLowerCase() === q)
      .slice(0, 6)
  }, [query])

  const pickSuggestion = (country: AfricanCountry) => {
    setQuery('')
    setSearchOpen(false)
    selectCountry(country.id)
  }

  const randomCountry = () => {
    const pool = shapes.filter((s) => s.country.id !== selectedId)
    pickSuggestion(pool[Math.floor(Math.random() * pool.length)].country)
  }

  /* ---------- navigation dans la région ---------- */
  const regionNeighbours = useMemo(() => {
    if (!selected || !selectedRegion) return { prev: null, next: null }
    const list = selectedRegion.countries
      .map((id) => allAfricanCountries.find((c) => c.id === id))
      .filter(Boolean)
      .sort((a, b) => a!.nameFr.localeCompare(b!.nameFr, 'fr')) as AfricanCountry[]
    const index = list.findIndex((c) => c.id === selected.id)
    return { prev: list[(index - 1 + list.length) % list.length], next: list[(index + 1) % list.length] }
  }, [selected, selectedRegion])

  /* ---------- étiquettes ---------- */
  const labelScale = view.w / 1000 // taille constante à l'écran
  const showLabel = (size: number, id: string) => id === selectedId || size * zoom * zoom > 9000

  const hovered = hoverId ? allAfricanCountries.find((c) => c.id === hoverId) : null
  const info = selectedId ? details[selectedId] : undefined
  const detail = info && typeof info === 'object' ? info : null

  return (
    <div className="ax">
      <div className="ax__stage" ref={stageRef}>
        <svg
          ref={svgRef}
          className="ax__svg"
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label="Carte interactive de l’Afrique. Utilisez la recherche ou la touche Tab pour parcourir les pays."
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => setPointer(null)}
          onClick={() => selectedId && selectCountry(null, false)}
        >
          <defs>
            <pattern id="ax-graticule" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0H0V60" fill="none" className="ax__graticule" />
            </pattern>
            <filter id="ax-land-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b2a1c" floodOpacity="0.28" />
            </filter>
            <filter id="ax-selected-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.9" />
            </filter>
          </defs>

          <rect x={-2000} y={-2000} width={5000} height={5000} className="ax__ocean" />
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="url(#ax-graticule)" />

          <g className="ax__land">
            <CountriesLayer
              fillFor={fillFor}
              isDimmed={isDimmed}
              selectedId={selectedId}
              onSelect={(id) => selectCountry(id)}
              onHover={setHoverId}
            />
          </g>

          {selectedId && shapeById.get(selectedId) && (
            <path
              d={shapeById.get(selectedId)!.path}
              className="ax-country-outline"
              vectorEffect="non-scaling-stroke"
              filter="url(#ax-selected-glow)"
              pointerEvents="none"
            />
          )}

          <g className="ax__labels" pointerEvents="none">
            {shapes.map(({ country, label, size }) =>
              showLabel(size, country.id) ? (
                <text
                  key={country.id}
                  x={label[0]}
                  y={label[1]}
                  className={`ax__label${country.id === selectedId ? ' is-selected' : ''}`}
                  style={{ fontSize: `${(country.id === selectedId ? 15 : 12) * labelScale}px`, strokeWidth: `${3 * labelScale}px` }}
                >
                  {country.nameFr}
                </text>
              ) : null,
            )}
          </g>
        </svg>

        {/* Info-bulle au survol (souris) */}
        {hovered && pointer && hovered.id !== selectedId && (
          <div className="ax__tooltip" style={{ left: pointer.x, top: pointer.y }}>
            <img src={flagUrl(hovered.id, 'w40')} alt="" width={20} height={14} />
            <strong>{hovered.nameFr}</strong>
            <span>{hovered.capital}</span>
          </div>
        )}

        {/* Barre d'outils */}
        <div className="ax__toolbar">
          <div className="ax__search">
            <Search size={18} aria-hidden={true} />
            <label htmlFor="ax-search" className="sr-only">
              Rechercher un pays
            </label>
            <input
              id="ax-search"
              type="search"
              placeholder="Rechercher un pays ou une capitale"
              value={query}
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && suggestions[0]) pickSuggestion(suggestions[0])
              }}
              aria-expanded={searchOpen && suggestions.length > 0}
              aria-controls="ax-suggestions"
            />
            {searchOpen && suggestions.length > 0 && (
              <ul id="ax-suggestions" className="ax__suggestions" role="listbox">
                {suggestions.map((country) => (
                  <li key={country.id} role="option" aria-selected={false}>
                    <button type="button" onClick={() => pickSuggestion(country)}>
                      <img src={flagUrl(country.id, 'w40')} alt="" width={22} height={15} />
                      <span>
                        <strong>{country.nameFr}</strong>
                        <small>{country.capital}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ax__lenses" role="radiogroup" aria-label="Lecture de la carte">
            {(
              [
                ['region', 'Régions'],
                ['language', 'Langues'],
                ['population', 'Population'],
              ] as Array<[Lens, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={lens === id}
                className={lens === id ? 'is-active' : ''}
                onClick={() => {
                  setLens(id)
                  if (id !== 'language') setLanguageFilter(null)
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Légende de la lentille active */}
        <div className={`ax__legend${selected ? ' has-peek' : ''}`}>
          {lens === 'region' &&
            africaRegions.map((region) => (
              <button
                key={region.id}
                type="button"
                className={`ax__chip${regionFilter === region.id ? ' is-active' : ''}`}
                aria-pressed={regionFilter === region.id}
                onClick={() => setRegionFilter((current) => (current === region.id ? null : region.id))}
              >
                <i style={{ background: region.color }} />
                {region.name}
              </button>
            ))}
          {lens === 'language' &&
            (Object.keys(officialLanguageLabels) as OfficialLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`ax__chip${languageFilter === lang ? ' is-active' : ''}`}
                aria-pressed={languageFilter === lang}
                onClick={() => setLanguageFilter((current) => (current === lang ? null : lang))}
              >
                {officialLanguageLabels[lang]}
                <small>{Object.values(officialLanguages).filter((langs) => langs.includes(lang)).length}</small>
              </button>
            ))}
          {lens === 'population' && (
            <div className="ax__scale">
              {populationScale.map((step) => (
                <span key={step.label}>
                  <i style={{ background: step.color }} />
                  {step.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mobile : aperçu compact du pays sélectionné, par-dessus la carte */}
        {selected && (
          <div className="ax__peek">
            <img src={flagUrl(selected.id, 'w80')} alt="" width={40} height={27} />
            <div>
              <strong>{selected.nameFr}</strong>
              <span>
                {selected.capital} · {selected.population}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-small"
              onClick={() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Détails
            </button>
            <Link to={`/country/${selected.id.toLowerCase()}`} className="btn btn-small">
              Fiche
            </Link>
          </div>
        )}

        {/* Zoom */}
        <div className="ax__zoom">
          <button type="button" onClick={() => animateTo(zoomAround(1.6), 250)} aria-label="Zoomer">
            <Plus size={18} aria-hidden={true} />
          </button>
          <button type="button" onClick={() => animateTo(zoomAround(1 / 1.6), 250)} aria-label="Dézoomer">
            <Minus size={18} aria-hidden={true} />
          </button>
          <button type="button" onClick={resetView} aria-label="Voir tout le continent">
            <Locate size={18} aria-hidden={true} />
          </button>
          <button type="button" onClick={randomCountry} aria-label="Pays au hasard" title="Pays au hasard">
            <Shuffle size={18} aria-hidden={true} />
          </button>
        </div>
      </div>

      {/* Panneau latéral */}
      <aside ref={panelRef} className={`ax__panel${selected ? ' has-country' : ''}`} aria-live="polite">
        {selected ? (
          <article className="ax-card">
            <header className="ax-card__head">
              <img src={flagUrl(selected.id, 'w160')} alt={`Drapeau : ${selected.nameFr}`} width={64} height={43} />
              <div>
                <span className="ax-card__region">
                  <i style={{ background: selectedRegion?.color }} />
                  {selectedRegion?.name}
                </span>
                <h2>{selected.nameFr}</h2>
              </div>
              <button
                type="button"
                className="ax-card__close"
                aria-label="Fermer"
                onClick={() => {
                  selectCountry(null, false)
                  resetView()
                }}
              >
                <X size={18} aria-hidden={true} />
              </button>
            </header>

            {info === 'loading' ? (
              <div className="ax-card__loading">
                <div className="mb-skeleton" style={{ height: 16 }} />
                <div className="mb-skeleton" style={{ height: 16, width: '80%' }} />
              </div>
            ) : (
              <p className="ax-card__summary">{detail?.oneSentenceSummary || selected.description}</p>
            )}

            <dl className="ax-card__facts">
              <div>
                <dt>Capitale</dt>
                <dd>{selected.capital}</dd>
              </div>
              <div>
                <dt>Population</dt>
                <dd>{selected.population}</dd>
              </div>
              <div>
                <dt>Superficie</dt>
                <dd>{selected.area}</dd>
              </div>
              <div>
                <dt>Monnaie</dt>
                <dd>{selected.currency}</dd>
              </div>
              <div className="is-wide">
                <dt>Langues</dt>
                <dd>{selected.languages.slice(0, 5).join(', ')}</dd>
              </div>
            </dl>

            {detail?.keyFacts && detail.keyFacts.length > 0 && (
              <section className="ax-card__block">
                <h3>À savoir</h3>
                <ul className="ax-card__facts-list">
                  {detail.keyFacts.slice(0, 3).map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </section>
            )}

            {detail?.foodCulture && detail.foodCulture.length > 0 && (
              <section className="ax-card__block">
                <h3>À goûter</h3>
                <div className="ax-card__chips">
                  {detail.foodCulture.slice(0, 5).map((food) => (
                    <span key={food}>{food}</span>
                  ))}
                </div>
              </section>
            )}

            {detail?.notableFigures && detail.notableFigures.length > 0 && (
              <section className="ax-card__block">
                <h3>Personnalités</h3>
                <ul className="ax-card__people">
                  {detail.notableFigures.slice(0, 3).map((figure) => {
                    const [name, role] = figure.split(/\s[-–]\s/)
                    return (
                      <li key={figure}>
                        <strong>{name}</strong>
                        {role && <span>{role}</span>}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            <div className="ax-card__actions">
              <Link to={`/country/${selected.id.toLowerCase()}`} className="btn btn-full-width">
                Ouvrir la fiche complète <ArrowRight size={18} aria-hidden={true} />
              </Link>
              {regionNeighbours.prev && regionNeighbours.next && (
                <div className="ax-card__nav">
                  <button type="button" className="btn btn-ghost" onClick={() => selectCountry(regionNeighbours.prev!.id)}>
                    <ChevronLeft size={18} aria-hidden={true} /> {regionNeighbours.prev.nameFr}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => selectCountry(regionNeighbours.next!.id)}>
                    {regionNeighbours.next.nameFr} <ChevronRight size={18} aria-hidden={true} />
                  </button>
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="ax-intro">
            <p className="eyebrow">Carte interactive</p>
            <h1>Explorer l’Afrique</h1>
            <p>
              {allAfricanCountries.length} pays, cinq grandes régions et des centaines de langues. Touchez un pays pour le
              découvrir sans quitter la carte, changez de lecture ou laissez-vous surprendre.
            </p>
            <ul className="ax-intro__tips">
              <li>
                <strong>Zoomer</strong> molette, pincement ou boutons
              </li>
              <li>
                <strong>Se déplacer</strong> glisser la carte
              </li>
              <li>
                <strong>Lire autrement</strong> régions, langues officielles, population
              </li>
            </ul>
            <button type="button" className="btn btn-outline" onClick={randomCountry}>
              <Shuffle size={18} aria-hidden={true} /> Un pays au hasard
            </button>
            <div className="ax-intro__regions">
              {africaRegions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => {
                    setLens('region')
                    setRegionFilter(region.id)
                    const boxes = region.countries.map((id) => shapeById.get(id)?.box).filter(Boolean) as Array<ReturnType<typeof pathBounds>>
                    const x = Math.min(...boxes.map((b) => b.x))
                    const y = Math.min(...boxes.map((b) => b.y))
                    const x2 = Math.max(...boxes.map((b) => b.x + b.width))
                    const y2 = Math.max(...boxes.map((b) => b.y + b.height))
                    animateTo(fitView({ x: x - 30, y: y - 30, w: x2 - x + 60, h: y2 - y + 60 }))
                  }}
                >
                  <i style={{ background: region.color }} />
                  <span>{region.name}</span>
                  <small>{region.countries.length} pays</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
