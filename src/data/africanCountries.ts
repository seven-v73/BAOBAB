// Données des pays africains avec informations culturelles

export interface AfricanCountry {
  id: string
  name: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  culture: string
  color: string
  coordinates: [number, number] // [longitude, latitude]
}

export const africanCountries: AfricanCountry[] = [
  {
    id: 'DZ',
    name: 'Algeria',
    nameFr: 'Algérie',
    capital: 'Alger',
    population: '44 millions',
    area: '2,38 millions km²',
    languages: ['Arabe', 'Tamazight', 'Français'],
    currency: 'Dinar algérien',
    description: 'Le plus grand pays d\'Afrique, riche en histoire et en culture berbère.',
    culture: 'Culture berbère millénaire, musique raï, architecture mauresque, cuisine méditerranéenne.',
    color: '#4A90E2',
    coordinates: [2.6326, 28.0339],
  },
  {
    id: 'EG',
    name: 'Egypt',
    nameFr: 'Égypte',
    capital: 'Le Caire',
    population: '109 millions',
    area: '1,01 million km²',
    languages: ['Arabe'],
    currency: 'Livre égyptienne',
    description: 'Berceau de l\'une des plus anciennes civilisations du monde.',
    culture: 'Civilisation pharaonique, art islamique, musique traditionnelle, danse orientale.',
    color: '#F39C12',
    coordinates: [30.8025, 26.8206],
  },
  {
    id: 'NG',
    name: 'Nigeria',
    nameFr: 'Nigeria',
    capital: 'Abuja',
    population: '223 millions',
    area: '923 768 km²',
    languages: ['Anglais', 'Hausa', 'Yoruba', 'Igbo'],
    currency: 'Naira',
    description: 'Le pays le plus peuplé d\'Afrique, puissance économique du continent.',
    culture: 'Nollywood, musique afrobeat, littérature riche, arts visuels contemporains.',
    color: '#27AE60',
    coordinates: [8.6753, 9.0820],
  },
  {
    id: 'ZA',
    name: 'South Africa',
    nameFr: 'Afrique du Sud',
    capital: 'Pretoria',
    population: '60 millions',
    area: '1,22 million km²',
    languages: ['Anglais', 'Afrikaans', 'Zulu', 'Xhosa'],
    currency: 'Rand',
    description: 'Nation arc-en-ciel avec une diversité culturelle exceptionnelle.',
    culture: 'Musique jazz, vin, safari, art contemporain, danse traditionnelle zoulou.',
    color: '#E74C3C',
    coordinates: [25.7479, -29.0000],
  },
  {
    id: 'KE',
    name: 'Kenya',
    nameFr: 'Kenya',
    capital: 'Nairobi',
    population: '55 millions',
    area: '580 367 km²',
    languages: ['Anglais', 'Swahili'],
    currency: 'Shilling kényan',
    description: 'Pays de la grande migration et des safaris légendaires.',
    culture: 'Musique benga, marathon, artisanat masaï, cuisine swahili.',
    color: '#16A085',
    coordinates: [37.9062, -0.0236],
  },
  {
    id: 'GH',
    name: 'Ghana',
    nameFr: 'Ghana',
    capital: 'Accra',
    population: '32 millions',
    area: '238 535 km²',
    languages: ['Anglais', 'Akan', 'Ewe'],
    currency: 'Cedi',
    description: 'Premier pays d\'Afrique subsaharienne à obtenir l\'indépendance.',
    culture: 'Musique highlife, kente (tissu traditionnel), festivals colorés, cuisine riche.',
    color: '#F1C40F',
    coordinates: [-1.0232, 7.9465],
  },
  {
    id: 'SN',
    name: 'Senegal',
    nameFr: 'Sénégal',
    capital: 'Dakar',
    population: '17 millions',
    area: '196 722 km²',
    languages: ['Français', 'Wolof'],
    currency: 'Franc CFA',
    description: 'Terre de la Teranga (hospitalité) et berceau de la musique mbalax.',
    culture: 'Musique mbalax, lutte sénégalaise, art contemporain, cuisine thieboudienne.',
    color: '#E67E22',
    coordinates: [-14.4524, 14.4974],
  },
  {
    id: 'MA',
    name: 'Morocco',
    nameFr: 'Maroc',
    capital: 'Rabat',
    population: '37 millions',
    area: '446 550 km²',
    languages: ['Arabe', 'Amazigh', 'Français'],
    currency: 'Dirham',
    description: 'Carrefour entre l\'Afrique et l\'Europe, riche en traditions.',
    culture: 'Architecture mauresque, musique gnawa, cuisine méditerranéenne, artisanat.',
    color: '#8E44AD',
    coordinates: [-7.0926, 31.7917],
  },
  {
    id: 'ET',
    name: 'Ethiopia',
    nameFr: 'Éthiopie',
    capital: 'Addis-Abeba',
    population: '120 millions',
    area: '1,10 million km²',
    languages: ['Amharique', 'Oromo', 'Tigrinya'],
    currency: 'Birr',
    description: 'Pays qui n\'a jamais été colonisé, berceau du café.',
    culture: 'Musique éthiopienne, églises rupestres, cuisine unique, calendrier éthiopien.',
    color: '#C0392B',
    coordinates: [38.7465, 9.1450],
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    nameFr: 'Tanzanie',
    capital: 'Dodoma',
    population: '63 millions',
    area: '947 303 km²',
    languages: ['Swahili', 'Anglais'],
    currency: 'Shilling tanzanien',
    description: 'Pays des safaris et du Kilimandjaro, plus haut sommet d\'Afrique.',
    culture: 'Musique taraab, danse traditionnelle, art tingatinga, culture swahili.',
    color: '#1ABC9C',
    coordinates: [34.8888, -6.3690],
  },
  {
    id: 'CI',
    name: 'Ivory Coast',
    nameFr: 'Côte d\'Ivoire',
    capital: 'Yamoussoukro',
    population: '28 millions',
    area: '322 463 km²',
    languages: ['Français', 'Baoulé', 'Dioula'],
    currency: 'Franc CFA',
    description: 'Premier producteur mondial de cacao, riche en diversité culturelle.',
    culture: 'Musique coupé-décalé, zouglou, masques traditionnels, danse.',
    color: '#F39C12',
    coordinates: [-5.5471, 7.5400],
  },
  {
    id: 'CM',
    name: 'Cameroon',
    nameFr: 'Cameroun',
    capital: 'Yaoundé',
    population: '27 millions',
    area: '475 442 km²',
    languages: ['Français', 'Anglais'],
    currency: 'Franc CFA',
    description: 'Afrique en miniature avec une diversité géographique et culturelle.',
    culture: 'Musique makossa, football, art bamiléké, cuisine variée.',
    color: '#3498DB',
    coordinates: [11.5021, 3.8480],
  },
]

// Fonction pour obtenir un pays par son ID
export const getCountryById = (id: string): AfricanCountry | undefined => {
  return africanCountries.find(country => country.id === id)
}

// Fonction pour obtenir tous les pays
export const getAllCountries = (): AfricanCountry[] => {
  return africanCountries
}

