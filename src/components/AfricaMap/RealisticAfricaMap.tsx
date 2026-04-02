import { useState } from 'react'
import { allAfricanCountries, type AfricanCountry } from '../../data/allAfricanCountries'
import { africaSVGPaths } from '../../data/africaSVGPaths'
import './RealisticAfricaMap.css'

interface RealisticAfricaMapProps {
  onCountrySelect?: (country: AfricanCountry) => void
}

export const RealisticAfricaMap = ({ onCountrySelect }: RealisticAfricaMapProps) => {
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const handleCountryClick = (country: AfricanCountry) => {
    setSelectedCountry(country)
    if (onCountrySelect) {
      onCountrySelect(country)
    }
  }

  const getCountryPath = (country: AfricanCountry): string => {
    // Utiliser les paths précis depuis le fichier dédié
    return africaSVGPaths[country.id] || `M ${country.center[0]-30} ${country.center[1]-20} L ${country.center[0]+30} ${country.center[1]-20} L ${country.center[0]+30} ${country.center[1]+20} L ${country.center[0]-30} ${country.center[1]+20} Z`
  }

  return (
    <div className="realistic-africa-map-container">
      <div className="realistic-africa-map-wrapper">
        <svg
          viewBox="0 0 1000 1200"
          className="realistic-africa-map"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f5dc" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#e8e8d8" stopOpacity="0.15" />
            </linearGradient>
            <filter id="countryGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Fond de la carte */}
          <rect width="1000" height="1200" fill="url(#oceanGrad)" />
          
          {/* Tous les pays africains avec leurs vraies formes */}
          {allAfricanCountries.map((country) => {
            const isSelected = selectedCountry?.id === country.id
            const isHovered = hoveredCountry === country.id
            const opacity = hoveredCountry && !isHovered ? 0.4 : 1
            
            return (
              <g key={country.id}>
                <path
                  d={getCountryPath(country)}
                  fill={country.color}
                  stroke={isSelected ? '#d4af37' : isHovered ? '#fff' : 'rgba(0,0,0,0.3)'}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.5'}
                  className={`country-path ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => handleCountryClick(country)}
                  onMouseEnter={() => setHoveredCountry(country.id)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity,
                    filter: isSelected ? 'url(#countryGlow)' : 'url(#shadow)',
                    transformOrigin: `${country.center[0]}px ${country.center[1]}px`,
                  }}
                >
                  <title>{country.nameFr} - Cliquez pour plus d'informations</title>
                </path>
                
                {/* Label du pays - affiché seulement si survolé ou sélectionné */}
                {(isHovered || isSelected) && (
                  <text
                    x={country.center[0]}
                    y={country.center[1] + 5}
                    textAnchor="middle"
                    fill={isSelected ? '#d4af37' : '#fff'}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight="700"
                    className="country-label"
                    style={{
                      pointerEvents: 'none',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                      filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))',
                    }}
                  >
                    {country.nameFr}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Légende interactive */}
      <div className="map-legend">
        <h3>🌍 Les 54 Pays d'Afrique</h3>
        <p className="legend-subtitle">Cliquez sur un pays sur la carte ou dans la liste</p>
        
        <div className="legend-search">
          <input
            id="realistic-africa-map-search"
            name="realistic-africa-map-search"
            type="text"
            placeholder="🔍 Rechercher un pays..."
            className="search-input"
          />
        </div>
        
        <div className="legend-grid">
          {allAfricanCountries.map((country) => (
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
              <span className="legend-name">{country.nameFr}</span>
              <span className="legend-code">{country.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carte d'information du pays sélectionné */}
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
              <span className="detail-label">🏛️ Capitale:</span>
              <span className="detail-value">{selectedCountry.capital}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">👥 Population:</span>
              <span className="detail-value">{selectedCountry.population}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📐 Superficie:</span>
              <span className="detail-value">{selectedCountry.area}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🗣️ Langues:</span>
              <span className="detail-value">{selectedCountry.languages.join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">💰 Monnaie:</span>
              <span className="detail-value">{selectedCountry.currency}</span>
            </div>
            <div className="country-description">
              <p>{selectedCountry.description}</p>
            </div>
            <div className="country-culture">
              <h4>🎨 Culture & Traditions</h4>
              <p>{selectedCountry.culture}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

