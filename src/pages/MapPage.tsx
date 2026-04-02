import { useState } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { HistoricalMap } from '../components/Map/HistoricalMap'
import { useNavigate } from 'react-router-dom'
import { Filter, MapPin } from 'lucide-react'
import './MapPage.css'

export const MapPage = () => {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')

  const handleSiteClick = (site: any) => {
    // Naviguer vers la page du pays ou afficher les détails
    console.log('Site cliqué:', site)
  }

  const handleEventClick = (event: any) => {
    navigate(`/timeline/${event._id}`)
  }

  return (
    <Layout>
      <div className="map-page">
        <div className="map-page-header">
          <h1>🗺️ Carte Interactive de l'Histoire Africaine</h1>
          <p>Explorez les sites historiques et événements sur une carte interactive</p>
        </div>

        <div className="map-filters">
          <div className="filter-group">
            <Filter size={20} />
            <select
              id="map-period-filter"
              name="map-period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les périodes</option>
              <option value="Préhistoire">Préhistoire</option>
              <option value="Antiquité">Antiquité</option>
              <option value="Moyen-Âge">Moyen-Âge</option>
              <option value="Période Moderne">Période Moderne</option>
              <option value="Époque Contemporaine">Époque Contemporaine</option>
            </select>
          </div>
          <div className="filter-group">
            <MapPin size={20} />
            <select
              id="map-country-filter"
              name="map-country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les pays</option>
              {/* Les pays seront chargés dynamiquement si nécessaire */}
            </select>
          </div>
        </div>

        <Card className="map-card">
          <HistoricalMap
            selectedPeriod={selectedPeriod}
            selectedCountry={selectedCountry}
            onSiteClick={handleSiteClick}
            onEventClick={handleEventClick}
          />
        </Card>

        <div className="map-info">
          <Card>
            <h3>À propos de cette carte</h3>
            <p>
              Cette carte interactive vous permet d'explorer l'histoire de l'Afrique à travers
              les sites historiques et les événements marquants. Cliquez sur les marqueurs pour
              en savoir plus.
            </p>
            <ul>
              <li>
                <strong>Sites historiques</strong> : Lieux archéologiques, monuments, musées
              </li>
              <li>
                <strong>Événements historiques</strong> : Événements marquants avec géolocalisation
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

