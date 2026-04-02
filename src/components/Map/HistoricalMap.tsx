import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { LatLngExpression, Icon } from 'leaflet'
import * as L from 'leaflet'
import { countryService, timelineService } from '../../services/api'
import 'leaflet/dist/leaflet.css'
import './HistoricalMap.css'

// Fix pour les icônes Leaflet par défaut
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Fix pour les icônes par défaut
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: icon,
    shadowUrl: iconShadow,
  })
}

interface HistoricalSite {
  _id?: string
  name: string
  type: string
  coordinates: {
    lat: number
    lng: number
  }
  period?: string
  description?: string
  images?: string[]
}

interface TimelineEvent {
  _id: string
  title: string
  date: string
  location: {
    country?: {
      nameFr: string
    }
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

interface HistoricalMapProps {
  selectedPeriod?: string
  selectedCountry?: string
  onSiteClick?: (site: HistoricalSite) => void
  onEventClick?: (event: TimelineEvent) => void
}

function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

export const HistoricalMap = ({
  selectedPeriod,
  selectedCountry,
  onSiteClick,
  onEventClick,
}: HistoricalMapProps) => {
  const [sites, setSites] = useState<HistoricalSite[]>([])
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<HistoricalSite | null>(null)
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([8, 20]) // Centre de l'Afrique
  const [zoom, setZoom] = useState(4)

  useEffect(() => {
    fetchData()
  }, [selectedPeriod, selectedCountry])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les pays avec sites historiques
      const countriesResponse = await countryService.getAll()
      const allSites: HistoricalSite[] = []
      
      if (countriesResponse.data) {
        countriesResponse.data.forEach((country: any) => {
          if (country.historicalSites && Array.isArray(country.historicalSites)) {
            country.historicalSites.forEach((site: any) => {
              if (site.coordinates && site.coordinates.lat && site.coordinates.lng) {
                allSites.push({
                  ...site,
                  name: site.name || 'Site historique',
                })
              }
            })
          }
        })
      }

      // Récupérer les événements de timeline avec coordonnées
      const timelineParams: any = {}
      if (selectedPeriod) timelineParams.period = selectedPeriod
      if (selectedCountry) timelineParams.country = selectedCountry
      
      const timelineResponse = await timelineService.getAll(timelineParams)
      // La réponse peut être un tableau directement ou un objet avec une propriété events/data
      const eventsData = Array.isArray(timelineResponse.data) 
        ? timelineResponse.data 
        : timelineResponse.data?.events || timelineResponse.data?.data || []
      const eventsWithCoords = eventsData.filter(
        (e: TimelineEvent) => e.location?.coordinates?.lat && e.location?.coordinates?.lng
      )

      setSites(allSites)
      setEvents(eventsWithCoords)

      // Ajuster le centre de la carte si un pays est sélectionné
      if (selectedCountry && countriesResponse.data) {
        const country = countriesResponse.data.find((c: any) => c.id === selectedCountry || c._id === selectedCountry)
        if (country && country.historicalSites && country.historicalSites.length > 0) {
          const firstSite = country.historicalSites[0]
          if (firstSite.coordinates) {
            setMapCenter([firstSite.coordinates.lat, firstSite.coordinates.lng])
            setZoom(6)
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de la carte:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSiteIcon = (type: string) => {
    // Vous pouvez personnaliser les icônes selon le type
    return DefaultIcon
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <div className="map-loading">
        <p>Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="historical-map-container">
      <div className="map-legend">
        <h3>Légende</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="icon-location legend-icon site" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
            <span>Sites historiques</span>
          </div>
          <div className="legend-item">
            <span className="icon-clock legend-icon event" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
            <span>Événements historiques</span>
          </div>
        </div>
        <div className="map-stats">
          <p>{sites.length} sites historiques</p>
          <p>{events.length} événements</p>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueurs pour les sites historiques */}
        {sites.map((site, index) => (
          <Marker
            key={`site-${index}`}
            position={[site.coordinates.lat, site.coordinates.lng]}
            icon={getSiteIcon(site.type)}
          >
            <Popup>
              <div className="map-popup">
                <h4>{site.name}</h4>
                {site.type && <p className="popup-type">Type: {site.type}</p>}
                {site.period && <p className="popup-period">Période: {site.period}</p>}
                {site.description && <p className="popup-description">{site.description}</p>}
                {onSiteClick && (
                  <button
                    className="popup-button"
                    onClick={() => {
                      setSelectedSite(site)
                      onSiteClick(site)
                    }}
                  >
                    <span className="icon-external-link" style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-block' }} />
                    En savoir plus
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueurs pour les événements historiques */}
        {events.map((event) => (
          <Marker
            key={event._id}
            position={[
              event.location.coordinates!.lat,
              event.location.coordinates!.lng,
            ]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="map-popup">
                <h4>{event.title}</h4>
                <p className="popup-date">{formatDate(event.date)}</p>
                {event.location.country && (
                  <p className="popup-location">{event.location.country.nameFr}</p>
                )}
                {onEventClick && (
                  <button
                    className="popup-button"
                    onClick={() => onEventClick(event)}
                  >
                    <span className="icon-external-link" style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-block' }} />
                    Voir l'événement
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

