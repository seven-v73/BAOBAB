import { useState } from 'react'
import { africanCountries, type AfricanCountry } from '../../data/africanCountries'
import './AfricaMap.css'

interface AfricaMapProps {
  onCountrySelect?: (country: AfricanCountry) => void
}

export const AfricaMap = ({ onCountrySelect }: AfricaMapProps) => {
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const handleCountryClick = (country: AfricanCountry) => {
    setSelectedCountry(country)
    if (onCountrySelect) {
      onCountrySelect(country)
    }
  }

  return (
    <div className="africa-map-container">
      <div className="africa-map-wrapper">
        <svg
          viewBox="0 0 1000 1200"
          className="africa-map"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Carte stylisée de l'Afrique */}
          <defs>
            <linearGradient id="africaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d2a1f" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2d1f1a" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          
          {/* Forme générale de l'Afrique - stylisée */}
          <path
            d="M 150 200 
               L 200 150 L 300 120 L 450 100 L 600 110 L 750 130 L 850 180 
               L 900 250 L 920 350 L 900 450 L 850 550 L 800 650 
               L 750 750 L 700 850 L 600 950 L 500 1000 L 400 1050 
               L 300 1100 L 200 1120 L 150 1100 L 120 1000 
               L 100 900 L 90 800 L 100 700 L 110 600 L 120 500 
               L 130 400 L 140 300 L 150 200 Z"
            fill="url(#africaGradient)"
            stroke="#d4af37"
            strokeWidth="4"
            className="continent-outline"
          />
          
          {/* Marqueurs pour les pays - positionnés de manière stylisée */}
          {africanCountries.map((country, index) => {
            // Position calculée pour placer les pays sur la carte
            const positions = [
              { x: 200, y: 250 },   // Algérie (Nord)
              { x: 550, y: 200 },   // Égypte (Nord-Est)
              { x: 450, y: 600 },   // Nigeria (Centre-Ouest)
              { x: 600, y: 950 },   // Afrique du Sud (Sud)
              { x: 650, y: 700 },   // Kenya (Est)
              { x: 350, y: 550 },   // Ghana (Ouest)
              { x: 200, y: 500 },   // Sénégal (Ouest)
              { x: 150, y: 300 },   // Maroc (Nord-Ouest)
              { x: 700, y: 500 },   // Éthiopie (Est)
              { x: 700, y: 750 },   // Tanzanie (Est)
              { x: 300, y: 600 },   // Côte d'Ivoire (Ouest)
              { x: 500, y: 550 },   // Cameroun (Centre)
            ]
            
            const pos = positions[index] || { x: 500, y: 600 }
            
            return (
              <g key={country.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={selectedCountry?.id === country.id ? 35 : hoveredCountry === country.id ? 30 : 25}
                  fill={country.color}
                  stroke={selectedCountry?.id === country.id ? '#d4af37' : hoveredCountry === country.id ? '#fff' : 'rgba(255,255,255,0.5)'}
                  strokeWidth={selectedCountry?.id === country.id ? '4' : '2'}
                  className={`country-marker ${selectedCountry?.id === country.id ? 'selected' : ''}`}
                  onClick={() => handleCountryClick(country)}
                  onMouseEnter={() => setHoveredCountry(country.id)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: hoveredCountry && hoveredCountry !== country.id ? 0.4 : 1,
                    filter: selectedCountry?.id === country.id ? 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.8))' : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
                  }}
                >
                  <title>{country.nameFr}</title>
                </circle>
                {/* Label du pays */}
                <text
                  x={pos.x}
                  y={pos.y + 50}
                  textAnchor="middle"
                  fill="#d4af37"
                  fontSize="14"
                  fontWeight="600"
                  className="country-label"
                  style={{
                    opacity: hoveredCountry === country.id || selectedCountry?.id === country.id ? 1 : 0.7,
                    pointerEvents: 'none',
                  }}
                >
                  {country.nameFr}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Légende des pays */}
      <div className="map-legend">
        <h3>Pays d’Afrique</h3>
        <p className="legend-subtitle">Cliquez sur un pays pour découvrir ses richesses culturelles</p>
        <div className="legend-grid">
          {africanCountries.map((country) => (
            <div
              key={country.id}
              className={`legend-item ${selectedCountry?.id === country.id ? 'active' : ''} ${hoveredCountry === country.id ? 'hovered' : ''}`}
              onClick={() => handleCountryClick(country)}
              onMouseEnter={() => setHoveredCountry(country.id)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: country.color }}
              />
              <span>{country.nameFr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Informations du pays sélectionné */}
      {selectedCountry && (
        <div className="country-info-card">
          <button
            className="close-button"
            onClick={() => setSelectedCountry(null)}
            aria-label="Fermer"
          >
            ×
          </button>
          <div className="country-header">
            <h3>{selectedCountry.nameFr}</h3>
            <div className="country-flag" style={{ backgroundColor: selectedCountry.color }} />
          </div>
          <div className="country-details">
            <div className="detail-row">
              <span className="detail-label">Capitale</span>
              <span className="detail-value">{selectedCountry.capital}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Population</span>
              <span className="detail-value">{selectedCountry.population}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Superficie</span>
              <span className="detail-value">{selectedCountry.area}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Langues</span>
              <span className="detail-value">{selectedCountry.languages.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Monnaie</span>
              <span className="detail-value">{selectedCountry.currency}</span>
            </div>
            <div className="country-description">
              <p>{selectedCountry.description}</p>
            </div>
            <div className="country-culture">
              <h4>Culture et traditions</h4>
              <p>{selectedCountry.culture}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
