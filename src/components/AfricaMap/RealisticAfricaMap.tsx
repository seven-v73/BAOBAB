import { useMemo, useState } from 'react'
import { allAfricanCountries, type AfricanCountry } from '../../data/allAfricanCountries'
import { africaMapShapes } from '../../data/africaMapShapes'
import './RealisticAfricaMap.css'

interface RealisticAfricaMapProps {
  onCountrySelect?: (country: AfricanCountry) => void
}

export const RealisticAfricaMap = ({ onCountrySelect }: RealisticAfricaMapProps) => {
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const visibleCountries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return allAfricanCountries

    return allAfricanCountries.filter((country) => {
      return (
        country.nameFr.toLowerCase().includes(query) ||
        country.name.toLowerCase().includes(query) ||
        country.capital.toLowerCase().includes(query) ||
        country.id.toLowerCase().includes(query)
      )
    })
  }, [searchTerm])

  const getFlagUrl = (countryId: string, size: 'w40' | 'w80' | 'w160' = 'w80') => {
    return `https://flagcdn.com/${size}/${countryId.toLowerCase()}.png`
  }

  const handleCountryClick = (country: AfricanCountry) => {
    setSelectedCountry(country)
    if (onCountrySelect) {
      onCountrySelect(country)
    }
  }

  const getCountryPath = (country: AfricanCountry): string =>
    africaMapShapes[country.id]?.path || `M ${country.center[0] - 30} ${country.center[1] - 20} L ${country.center[0] + 30} ${country.center[1] - 20} L ${country.center[0] + 30} ${country.center[1] + 20} L ${country.center[0] - 30} ${country.center[1] + 20} Z`

  const getCountryLabel = (country: AfricanCountry): [number, number] =>
    africaMapShapes[country.id]?.label || country.center

  return (
    <div className="realistic-africa-map-container">
      <div className="map-command-bar">
        <div>
          <p className="map-kicker">Carte politique interactive</p>
          <h2>Afrique complète, frontières et drapeaux</h2>
        </div>
        <div className="legend-search">
          <input
            id="realistic-africa-map-search"
            name="realistic-africa-map-search"
            type="text"
            placeholder="Rechercher un pays, une capitale ou un code..."
            className="search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="realistic-africa-map-wrapper">
        <svg
          viewBox="0 0 1000 1140"
          className="realistic-africa-map"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10251f" stopOpacity="0.16" />
              <stop offset="52%" stopColor="#234a7d" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f2cf66" stopOpacity="0.12" />
            </linearGradient>
            <filter id="countryGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#080b0d" floodOpacity="0.22"/>
            </filter>
            <radialGradient id="mapFocus" cx="52%" cy="48%" r="68%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <rect x="0" y="0" width="1000" height="1140" rx="28" fill="url(#oceanGrad)" />
          <rect x="0" y="0" width="1000" height="1140" rx="28" fill="url(#mapFocus)" />
          
          {/* Pays africains avec frontières et drapeaux */}
          {allAfricanCountries.map((country) => {
            const isSelected = selectedCountry?.id === country.id
            const isHovered = hoveredCountry === country.id
            const isVisible = visibleCountries.some((visibleCountry) => visibleCountry.id === country.id)
            const opacity = !isVisible ? 0.12 : hoveredCountry && !isHovered ? 0.34 : 1
            const flagSize = ['GM', 'GW', 'GQ', 'ST', 'CV', 'DJ', 'RW', 'BI', 'LS', 'SZ', 'MU', 'SC', 'KM'].includes(country.id) ? 24 : 34
            const [labelX, labelY] = getCountryLabel(country)
            
            return (
              <g
                key={country.id}
                className={`country-group ${isVisible ? '' : 'filtered-out'}`}
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <path
                  d={getCountryPath(country)}
                  fill={country.color}
                  stroke={isSelected ? '#f2cf66' : isHovered ? '#fffaf0' : 'rgba(8, 11, 13, 0.62)'}
                  strokeWidth={isSelected ? '4' : isHovered ? '3' : '1.35'}
                  className={`country-path ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => handleCountryClick(country)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ouvrir la fiche de ${country.nameFr}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleCountryClick(country)
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity,
                    filter: isSelected ? 'url(#countryGlow)' : 'url(#shadow)',
                    transformOrigin: `${labelX}px ${labelY}px`,
                  }}
                >
                  <title>{country.nameFr} - Cliquez pour plus d'informations</title>
                </path>

                {isVisible && (
                  <g
                    className={`country-flag-marker ${isHovered || isSelected ? 'active' : ''}`}
                    onClick={() => handleCountryClick(country)}
                    role="button"
                    aria-label={`Drapeau de ${country.nameFr}`}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleCountryClick(country)
                      }
                    }}
                  >
                    <rect
                      x={labelX - flagSize / 2}
                      y={labelY - flagSize / 2}
                      width={flagSize}
                      height={flagSize * 0.68}
                      rx="4"
                      fill="rgba(255, 250, 240, 0.92)"
                      stroke="rgba(8, 11, 13, 0.42)"
                      strokeWidth="1"
                    />
                    <image
                      href={getFlagUrl(country.id)}
                      x={labelX - flagSize / 2 + 2}
                      y={labelY - flagSize / 2 + 2}
                      width={flagSize - 4}
                      height={flagSize * 0.68 - 4}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                )}
                
                {(isHovered || isSelected) && (
                  <text
                    x={labelX}
                    y={labelY + flagSize * 0.58}
                    textAnchor="middle"
                    fill={isSelected ? '#f2cf66' : '#fffaf0'}
                    fontSize={isSelected ? '16' : '13'}
                    fontWeight="800"
                    className="country-label"
                    style={{
                      pointerEvents: 'none',
                      textShadow: '0 2px 8px rgba(0,0,0,0.9)',
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

      <div className="map-legend">
        <h3>{visibleCountries.length} pays affichés</h3>
        <p className="legend-subtitle">Cliquez sur un pays, son drapeau ou une ligne de la liste pour ouvrir sa fiche.</p>
        
        <div className="legend-grid">
          {visibleCountries.map((country) => (
            <div
              key={country.id}
              className={`legend-item ${selectedCountry?.id === country.id ? 'active' : ''} ${hoveredCountry === country.id ? 'hovered' : ''}`}
              onClick={() => handleCountryClick(country)}
              onMouseEnter={() => setHoveredCountry(country.id)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <img className="legend-flag" src={getFlagUrl(country.id, 'w40')} alt="" loading="lazy" />
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
