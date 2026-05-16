import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { getCountryMapPlaces, type CountryMapPlace } from '../../data/countryMapPlaces'
import 'leaflet/dist/leaflet.css'
import './CountryInteractiveMap.css'

interface ApiMapPlace {
  name?: string
  type?: CountryMapPlace['type'] | 'archaeological' | 'monument' | 'museum'
  description?: string
  highlight?: string
  coordinates?: {
    lat?: number
    lng?: number
  }
}

interface CountryInteractiveMapProps {
  country: {
    id: string
    nameFr: string
    capital?: string
    color?: string
    mapPlaces?: ApiMapPlace[]
    historicalSites?: ApiMapPlace[]
  }
}

const typeLabels: Record<CountryMapPlace['type'], string> = {
  capital: 'Capitale',
  economic: 'Économie',
  historic: 'Mémoire',
  cultural: 'Culture',
  natural: 'Nature',
  port: 'Port',
}

const typeColors: Record<CountryMapPlace['type'], string> = {
  capital: '#d4af37',
  economic: '#0f8f6f',
  historic: '#b66d2d',
  cultural: '#7d5cc6',
  natural: '#2f9d5b',
  port: '#2f7fc4',
}

const normalizeType = (type?: string): CountryMapPlace['type'] => {
  if (type === 'capital' || type === 'economic' || type === 'historic' || type === 'cultural' || type === 'natural' || type === 'port') {
    return type
  }

  if (type === 'archaeological' || type === 'monument' || type === 'museum') return 'historic'

  return 'cultural'
}

const normalizeApiPlaces = (places?: ApiMapPlace[]): CountryMapPlace[] => {
  if (!places?.length) return []

  return places
    .filter((place) => place.name && typeof place.coordinates?.lat === 'number' && typeof place.coordinates?.lng === 'number')
    .map((place) => ({
      name: place.name!,
      type: normalizeType(place.type),
      coordinates: [place.coordinates!.lat!, place.coordinates!.lng!],
      description: place.description || 'Repère ajouté depuis l’administration MonBaobab.',
      highlight: place.highlight,
    }))
}

const getMapCenter = (places: CountryMapPlace[]): LatLngExpression => {
  if (!places.length) return [8, 20]

  const totals = places.reduce(
    (acc, place) => ({
      lat: acc.lat + place.coordinates[0],
      lng: acc.lng + place.coordinates[1],
    }),
    { lat: 0, lng: 0 },
  )

  return [totals.lat / places.length, totals.lng / places.length]
}

const getMapBounds = (places: CountryMapPlace[]): LatLngBoundsExpression | null => {
  if (places.length < 2) return null
  return places.map((place) => place.coordinates) as LatLngBoundsExpression
}

function CountryMapController({
  bounds,
  center,
  selectedPlace,
  resetSignal,
}: {
  bounds: LatLngBoundsExpression | null
  center: LatLngExpression
  selectedPlace: CountryMapPlace | null
  resetSignal: number
}) {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        animate: true,
        duration: 0.8,
        maxZoom: 7,
        padding: [82, 82],
      })
      return
    }

    map.setView(center, 6, { animate: true })
  }, [bounds, center, map])

  useEffect(() => {
    if (!selectedPlace) return

    const targetZoom = Math.max(map.getZoom(), 7)
    map.flyTo(selectedPlace.coordinates, Math.min(targetZoom, 9), {
      animate: true,
      duration: 0.9,
    })
  }, [map, selectedPlace])

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        animate: true,
        duration: 0.75,
        maxZoom: 7,
        padding: [92, 92],
      })
      return
    }

    map.flyTo(center, 6, {
      animate: true,
      duration: 0.75,
    })
  }, [bounds, center, map, resetSignal])

  return null
}

export const CountryInteractiveMap = ({ country }: CountryInteractiveMapProps) => {
  const places = useMemo(() => {
    const adminPlaces = normalizeApiPlaces(country.mapPlaces)
    const historicalSites = normalizeApiPlaces(country.historicalSites)
    const fallbackPlaces = getCountryMapPlaces(country.id, country.capital)
    const merged = [...adminPlaces, ...historicalSites, ...fallbackPlaces]
    const seen = new Set<string>()

    return merged.filter((place) => {
      const key = `${place.name}-${place.coordinates.join(',')}`
      if (seen.has(key)) return false
      seen.add(key)
      return place.coordinates[0] !== 0 || place.coordinates[1] !== 0
    })
  }, [country])

  const [selectedPlace, setSelectedPlace] = useState<CountryMapPlace | null>(places[0] || null)
  const [resetSignal, setResetSignal] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const typeSummary = Array.from(new Set(places.map((place) => typeLabels[place.type]))).slice(0, 4)
  const accent = country.color || typeColors[selectedPlace?.type || 'capital']
  const mapCenter = useMemo(() => getMapCenter(places), [places])
  const mapBounds = useMemo(() => getMapBounds(places), [places])
  const routePositions = useMemo(() => places.map((place) => place.coordinates), [places])

  useEffect(() => {
    setSelectedPlace(places[0] || null)
  }, [places])

  if (places.length === 0) {
    return (
      <div className="country-map-empty">
        <strong>Carte à enrichir</strong>
        <span>Ajoutez des villes et repères depuis l’administration pour rendre cette fiche plus vivante.</span>
      </div>
    )
  }

  return (
    <div
      className={`country-interactive-map country-interactive-map--leaflet ${isExpanded ? 'expanded' : ''}`}
      style={{ '--country-map-accent': accent } as CSSProperties}
    >
      <div className="country-map-stage">
        <div className="country-map-story">
          <span className="section-kicker">Carte immersive</span>
          <h3>{country.nameFr}, par ses villes et ses routes</h3>
          <p>
            Cliquez sur un repère pour lire le pays autrement: capitale, ports, lieux de mémoire,
            villes créatives et paysages qui structurent la découverte.
          </p>
          <div className="country-map-stats">
            <span><strong>{places.length}</strong> repères</span>
            <span><strong>{typeSummary.length}</strong> entrées</span>
            <span><strong>{country.capital || places[0].name}</strong> capitale</span>
          </div>
        </div>

        <div className="country-map-actions">
          <button
            type="button"
            onClick={() => {
              setSelectedPlace(places[0])
              setResetSignal((value) => value + 1)
            }}
          >
            Recentrer
          </button>
          <button type="button" onClick={() => setIsExpanded((value) => !value)}>
            {isExpanded ? 'Réduire' : 'Agrandir'}
          </button>
        </div>

        <div className="country-map-current" aria-live="polite">
          <span style={{ background: typeColors[selectedPlace?.type || 'capital'] }} />
          <div>
            <small>{typeLabels[selectedPlace?.type || 'capital']}</small>
            <strong>{selectedPlace?.name || country.nameFr}</strong>
            <p>{selectedPlace?.description || 'Cliquez sur une ville pour afficher ses repères.'}</p>
            {selectedPlace?.highlight && <em>{selectedPlace.highlight}</em>}
          </div>
        </div>

        <div className="country-map-zoom-hint">
          <span>Zoomer</span>
          <strong>Molette, pincement ou boutons</strong>
        </div>

        <div className="country-map-places-strip" aria-label={`Villes de ${country.nameFr}`}>
          {places.map((place) => (
            <button
              type="button"
              key={`${place.name}-strip`}
              className={selectedPlace?.name === place.name ? 'active' : ''}
              onClick={() => setSelectedPlace(place)}
            >
              <span style={{ background: typeColors[place.type] }} />
              <strong>{place.name}</strong>
              <small>{typeLabels[place.type]}</small>
            </button>
          ))}
        </div>

        <MapContainer
          key={country.id}
          center={mapCenter}
          zoom={6}
          minZoom={4}
          maxZoom={12}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
          zoomSnap={0.35}
          zoomDelta={0.7}
          className="country-leaflet-map"
        >
          <CountryMapController
            bounds={mapBounds}
            center={mapCenter}
            selectedPlace={selectedPlace}
            resetSignal={resetSignal}
          />
          <ZoomControl position="bottomleft" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />

          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: accent,
                weight: 4,
                opacity: 0.92,
                dashArray: '9 10',
                lineCap: 'round',
              }}
            />
          )}

          {places.map((place) => {
            const isSelected = selectedPlace?.name === place.name
            const pinColor = typeColors[place.type]

            return (
              <CircleMarker
                key={`${place.name}-${place.coordinates.join(',')}`}
                center={place.coordinates}
                radius={isSelected ? 14 : 10}
                pathOptions={{
                  color: '#fffdf4',
                  fillColor: pinColor,
                  fillOpacity: 0.98,
                  opacity: 1,
                  weight: isSelected ? 4 : 3,
                }}
                eventHandlers={{
                  click: () => setSelectedPlace(place),
                  mouseover: () => setSelectedPlace(place),
                }}
              >
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -12]}
                  opacity={1}
                  className={`country-city-tooltip ${isSelected ? 'active' : ''}`}
                >
                  <span>{place.name}</span>
                </Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
