import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { RealisticAfricaMap } from '../components/AfricaMap/RealisticAfricaMap'
import { useNavigate } from 'react-router-dom'
import type { AfricanCountry } from '../data/allAfricanCountries'
import './MapPage.css'

export const MapPage = () => {
  const navigate = useNavigate()

  const handleCountrySelect = (country: AfricanCountry) => {
    navigate(`/country/${country.id.toLowerCase()}`)
  }

  return (
    <Layout>
      <div className="map-page">
        <div className="map-page-header">
          <h1>Carte interactive de l'Afrique</h1>
          <p>Parcourez le continent par ses pays, ses frontières et ses fiches culturelles.</p>
        </div>

        <Card className="map-card">
          <RealisticAfricaMap onCountrySelect={handleCountrySelect} />
        </Card>

        <div className="map-info">
          <Card>
            <h3>À propos de cette carte</h3>
            <p>
              Cette carte sert d'entrée géographique vers les fiches pays. Les frontières
              permettent de lire les délimitations, les drapeaux facilitent l'identification
              rapide, et chaque pays est accessible au clavier comme à la souris.
            </p>
            <ul>
              <li>
                <strong>Frontières</strong> : contour politique complet de l'Afrique.
              </li>
              <li>
                <strong>Drapeaux</strong> : repères visuels cliquables au centre de chaque pays.
              </li>
              <li>
                <strong>Fiches pays</strong> : ouverture directe vers les contenus culturels détaillés.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
