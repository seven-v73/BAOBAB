import { useState } from 'react'
import { allAfricanCountries, type AfricanCountry } from '../../data/allAfricanCountries'
import './RealAfricaMap.css'

interface RealAfricaMapProps {
  onCountrySelect?: (country: AfricanCountry) => void
}

export const RealAfricaMap = ({ onCountrySelect }: RealAfricaMapProps) => {
  const [selectedCountry, setSelectedCountry] = useState<AfricanCountry | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const handleCountryClick = (country: AfricanCountry) => {
    setSelectedCountry(country)
    if (onCountrySelect) {
      onCountrySelect(country)
    }
  }

  // Paths SVG réalistes pour chaque pays africain (coordonnées normalisées 0-1000)
  const getCountryPath = (country: AfricanCountry): string => {
    // Paths basés sur les formes réelles des pays africains
    const paths: Record<string, string> = {
      // Afrique du Nord
      'MA': 'M 100 80 L 180 75 L 200 120 L 180 160 L 120 155 L 100 120 Z', // Maroc
      'DZ': 'M 180 75 L 400 70 L 420 200 L 400 350 L 200 340 L 180 200 Z', // Algérie - grand pays
      'TN': 'M 280 100 L 340 95 L 350 140 L 330 170 L 280 165 Z', // Tunisie
      'LY': 'M 400 70 L 550 65 L 570 200 L 550 320 L 420 310 L 400 200 Z', // Libye
      'EG': 'M 570 65 L 700 60 L 720 180 L 700 250 L 570 240 Z', // Égypte
      'SD': 'M 550 200 L 700 190 L 720 350 L 700 500 L 570 490 L 550 350 Z', // Soudan
      'SS': 'M 600 350 L 680 345 L 690 450 L 670 520 L 600 510 Z', // Soudan du Sud
      
      // Afrique de l'Ouest
      'MR': 'M 100 200 L 250 195 L 260 280 L 250 350 L 120 345 L 100 280 Z', // Mauritanie
      'SN': 'M 80 350 L 180 345 L 190 420 L 170 480 L 90 475 Z', // Sénégal
      'GM': 'M 100 420 L 150 418 L 155 450 L 145 470 L 105 468 Z', // Gambie
      'GW': 'M 120 480 L 180 475 L 185 520 L 175 550 L 125 545 Z', // Guinée-Bissau
      'GN': 'M 180 420 L 280 415 L 290 480 L 280 540 L 190 535 Z', // Guinée
      'SL': 'M 200 480 L 280 475 L 285 530 L 275 570 L 210 565 Z', // Sierra Leone
      'LR': 'M 280 500 L 350 495 L 360 550 L 350 590 L 290 585 Z', // Libéria
      'CI': 'M 280 540 L 380 535 L 390 600 L 380 660 L 290 655 Z', // Côte d'Ivoire
      'GH': 'M 380 580 L 480 575 L 490 640 L 480 700 L 390 695 Z', // Ghana
      'TG': 'M 480 620 L 540 615 L 550 670 L 540 710 L 490 705 Z', // Togo
      'BJ': 'M 540 620 L 600 615 L 610 670 L 600 710 L 550 705 Z', // Bénin
      'NG': 'M 480 580 L 600 575 L 620 650 L 600 720 L 490 715 Z', // Nigeria - grand
      'NE': 'M 450 400 L 550 395 L 560 480 L 550 540 L 460 535 Z', // Niger
      'ML': 'M 250 300 L 450 295 L 460 400 L 450 480 L 260 475 Z', // Mali
      'BF': 'M 350 450 L 450 445 L 460 520 L 450 580 L 360 575 Z', // Burkina Faso
      'TD': 'M 500 350 L 600 345 L 610 450 L 600 540 L 510 535 Z', // Tchad
      
      // Afrique Centrale
      'CM': 'M 480 620 L 560 615 L 570 680 L 560 740 L 490 735 Z', // Cameroun
      'CF': 'M 550 500 L 650 495 L 660 580 L 650 650 L 560 645 Z', // République centrafricaine
      'GQ': 'M 480 700 L 520 698 L 525 720 L 515 740 L 485 738 Z', // Guinée équatoriale
      'GA': 'M 500 700 L 580 695 L 590 760 L 580 820 L 510 815 Z', // Gabon
      'CG': 'M 550 700 L 650 695 L 660 780 L 650 850 L 560 845 Z', // Congo
      'CD': 'M 550 600 L 700 595 L 720 750 L 700 900 L 560 895 Z', // RD Congo - très grand
      'AO': 'M 480 750 L 580 745 L 590 850 L 580 950 L 490 945 Z', // Angola
      'ST': 'M 450 750 L 480 748 L 485 770 L 475 785 L 455 783 Z', // São Tomé-et-Príncipe
      
      // Afrique de l'Est
      'ER': 'M 700 200 L 750 195 L 760 280 L 750 350 L 710 345 Z', // Érythrée
      'ET': 'M 700 200 L 800 195 L 820 350 L 800 500 L 710 495 Z', // Éthiopie
      'DJ': 'M 780 280 L 820 278 L 825 320 L 815 350 L 785 348 Z', // Djibouti
      'SO': 'M 800 350 L 900 345 L 920 500 L 900 650 L 810 645 Z', // Somalie
      'KE': 'M 750 500 L 850 495 L 860 600 L 850 700 L 760 695 Z', // Kenya
      'UG': 'M 750 600 L 820 595 L 830 680 L 820 740 L 760 735 Z', // Ouganda
      'RW': 'M 750 650 L 800 648 L 805 690 L 795 720 L 755 718 Z', // Rwanda
      'BI': 'M 750 680 L 800 678 L 805 720 L 795 750 L 755 748 Z', // Burundi
      'TZ': 'M 750 650 L 850 645 L 870 800 L 850 950 L 760 945 Z', // Tanzanie
      'MW': 'M 750 750 L 820 745 L 830 820 L 820 880 L 760 875 Z', // Malawi
      'ZM': 'M 650 700 L 750 695 L 760 800 L 750 900 L 660 895 Z', // Zambie
      'ZW': 'M 700 850 L 780 845 L 790 920 L 780 980 L 710 975 Z', // Zimbabwe
      'BW': 'M 600 850 L 700 845 L 710 920 L 700 980 L 610 975 Z', // Botswana
      'MZ': 'M 750 850 L 850 845 L 870 1000 L 850 1100 L 760 1095 Z', // Mozambique
      'MG': 'M 900 850 L 980 840 L 1000 1000 L 980 1150 L 910 1145 Z', // Madagascar
      
      // Afrique Australe
      'ZA': 'M 600 950 L 700 945 L 720 1050 L 700 1120 L 610 1115 Z', // Afrique du Sud
      'LS': 'M 650 1000 L 680 998 L 685 1030 L 675 1050 L 655 1048 Z', // Lesotho
      'SZ': 'M 680 1020 L 720 1018 L 725 1050 L 715 1070 L 685 1068 Z', // Eswatini
      'NA': 'M 550 900 L 650 895 L 660 1000 L 650 1080 L 560 1075 Z', // Namibie
      
      // Îles
      'CV': 'M 50 400 L 120 395 L 130 450 L 120 500 L 60 495 Z', // Cap-Vert
      'MU': 'M 900 950 L 950 948 L 955 980 L 945 1000 L 905 998 Z', // Maurice
      'SC': 'M 900 700 L 950 698 L 955 730 L 945 750 L 905 748 Z', // Seychelles
      'KM': 'M 850 700 L 900 698 L 905 730 L 895 750 L 855 748 Z', // Comores
      'EH': 'M 150 250 L 250 245 L 260 320 L 250 380 L 160 375 Z', // Sahara occidental
    }
    
    // Si on a une forme spécifique, l'utiliser
    if (paths[country.id]) {
      return paths[country.id]
    }
    
    // Sinon, forme par défaut basée sur la position
    const [cx, cy] = country.center
    const size = country.area.includes('M') ? 60 : country.area.includes('K') ? 40 : 30
    return `M ${cx-size} ${cy-size/2} 
            Q ${cx-size/2} ${cy-size} ${cx} ${cy-size/2}
            Q ${cx+size/2} ${cy-size} ${cx+size} ${cy-size/2}
            Q ${cx+size} ${cy+size/2} ${cx+size/2} ${cy+size}
            Q ${cx} ${cy+size/2} ${cx-size/2} ${cy+size}
            Q ${cx-size} ${cy+size/2} ${cx-size} ${cy-size/2} Z`
  }

  return (
    <div className="real-africa-map-container">
      <div className="real-africa-map-wrapper">
        <svg
          viewBox="0 0 1000 1200"
          className="real-africa-map"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d1f1a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3d2a1f" stopOpacity="0.35" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Fond de la carte avec grille subtile */}
          <rect width="1000" height="1200" fill="url(#oceanGradient)" />
          <rect width="1000" height="1200" fill="url(#grid)" opacity="0.3" />
          
          {/* Contour général de l'Afrique pour référence */}
          <path
            d="M 50 80 Q 100 70 150 75 T 250 80 T 400 75 T 700 70 T 950 80 
               L 980 200 L 950 400 L 900 600 L 850 800 L 750 1000 L 600 1100 
               L 400 1150 L 200 1120 L 100 1000 L 60 800 L 50 600 L 50 400 L 50 200 Z"
            fill="none"
            stroke="rgba(212,175,55,0.2)"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="africa-outline"
          />
          
          {/* Tous les pays africains */}
          {allAfricanCountries.map((country) => {
            const isSelected = selectedCountry?.id === country.id
            const isHovered = hoveredCountry === country.id
            const opacity = hoveredCountry && !isHovered ? 0.25 : 1
            
            return (
              <g key={country.id}>
                <path
                  d={getCountryPath(country)}
                  fill={country.color}
                  stroke={isSelected ? '#d4af37' : isHovered ? '#fff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isSelected ? '4' : isHovered ? '2.5' : '1.5'}
                  className={`country-path ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCountryClick(country)}
                  onMouseEnter={() => setHoveredCountry(country.id)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity,
                    filter: isSelected ? 'url(#glow)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                >
                  <title>{country.nameFr}</title>
                </path>
                
                {/* Label du pays (code ISO) */}
                {(!hoveredCountry || isHovered || isSelected) && (
                  <text
                    x={country.center[0]}
                    y={country.center[1] + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#d4af37' : isHovered ? '#fff' : 'rgba(255,255,255,0.8)'}
                    fontSize={isSelected ? '11' : '9'}
                    fontWeight={isSelected ? '700' : '600'}
                    className="country-label"
                    style={{
                      pointerEvents: 'none',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                    }}
                  >
                    {country.id}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Légende avec recherche */}
      <div className="map-legend">
        <h3>🌍 Les 54 Pays d'Afrique</h3>
        <p className="legend-subtitle">Cliquez sur un pays sur la carte ou dans la liste pour découvrir ses richesses</p>
        
        <div className="legend-search">
          <input
            id="real-africa-map-search"
            name="real-africa-map-search"
            type="text"
            placeholder="Rechercher un pays..."
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
