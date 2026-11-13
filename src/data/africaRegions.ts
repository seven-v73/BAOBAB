/**
 * Référentiel géographique : régions (géoschéma de l'ONU, M49) et langues officielles.
 * Utilisé par la carte et les fiches pays. En base, le champ `region` n'est renseigné
 * que pour une partie des pays : ce référentiel garantit une valeur pour les 55.
 */

export type RegionId = 'north' | 'west' | 'central' | 'east' | 'south'

export interface AfricaRegion {
  id: RegionId
  name: string
  color: string
  colorDark: string
  countries: string[]
}

export const africaRegions: AfricaRegion[] = [
  { id: 'north', name: 'Afrique du Nord', color: '#d9a35f', colorDark: '#b07a3a', countries: ['MA', 'DZ', 'TN', 'LY', 'EG', 'SD', 'EH'] },
  { id: 'west', name: 'Afrique de l’Ouest', color: '#7fb27a', colorDark: '#4f8a4a', countries: ['MR', 'SN', 'GM', 'GW', 'GN', 'SL', 'LR', 'CI', 'GH', 'TG', 'BJ', 'NG', 'NE', 'ML', 'BF', 'CV'] },
  { id: 'central', name: 'Afrique centrale', color: '#5f9e9a', colorDark: '#3c7773', countries: ['TD', 'CM', 'CF', 'GQ', 'GA', 'CG', 'CD', 'AO', 'ST'] },
  { id: 'east', name: 'Afrique de l’Est', color: '#c97b5a', colorDark: '#a3573a', countries: ['SS', 'ER', 'ET', 'DJ', 'SO', 'KE', 'UG', 'RW', 'BI', 'TZ', 'MW', 'ZM', 'ZW', 'MZ', 'MG', 'MU', 'SC', 'KM'] },
  { id: 'south', name: 'Afrique australe', color: '#a58cc0', colorDark: '#7c64a0', countries: ['ZA', 'LS', 'SZ', 'NA', 'BW'] },
]

const regionByCountry = new Map<string, AfricaRegion>()
africaRegions.forEach((region) => region.countries.forEach((id) => regionByCountry.set(id, region)))

export const getRegion = (countryId: string): AfricaRegion | undefined => regionByCountry.get(countryId.toUpperCase())

export type OfficialLanguage = 'fr' | 'en' | 'ar' | 'pt' | 'es'

export const officialLanguageLabels: Record<OfficialLanguage, string> = {
  fr: 'Français',
  en: 'Anglais',
  ar: 'Arabe',
  pt: 'Portugais',
  es: 'Espagnol',
}

/** Langues officielles (ou de travail officielles) des langues internationales, par pays. */
export const officialLanguages: Record<string, OfficialLanguage[]> = {
  MA: ['ar'], DZ: ['ar'], TN: ['ar'], LY: ['ar'], EG: ['ar'], SD: ['ar', 'en'], EH: ['ar', 'es'],
  MR: ['ar'], SN: ['fr'], GM: ['en'], GW: ['pt'], GN: ['fr'], SL: ['en'], LR: ['en'], CI: ['fr'],
  GH: ['en'], TG: ['fr'], BJ: ['fr'], NG: ['en'], NE: ['fr'], ML: ['fr'], BF: ['fr'], CV: ['pt'],
  TD: ['fr', 'ar'], CM: ['fr', 'en'], CF: ['fr'], GQ: ['es', 'fr', 'pt'], GA: ['fr'], CG: ['fr'],
  CD: ['fr'], AO: ['pt'], ST: ['pt'],
  SS: ['en'], ER: ['ar', 'en'], ET: [], DJ: ['fr', 'ar'], SO: ['ar'], KE: ['en'], UG: ['en'],
  RW: ['fr', 'en'], BI: ['fr', 'en'], TZ: ['en'], MW: ['en'], ZM: ['en'], ZW: ['en'], MZ: ['pt'],
  MG: ['fr'], MU: ['en', 'fr'], SC: ['en', 'fr'], KM: ['fr', 'ar'],
  ZA: ['en'], LS: ['en'], SZ: ['en'], NA: ['en'], BW: ['en'],
}

/** "21M", "600K", "1,22M" → nombre d'habitants (approximatif, pour les échelles de couleur). */
export const parsePopulation = (value?: string): number | null => {
  if (!value) return null
  const match = value.replace(/\s/g, '').match(/([\d.,]+)\s*([MK]|Md)?/i)
  if (!match) return null
  const number = parseFloat(match[1].replace(',', '.'))
  if (Number.isNaN(number)) return null
  const unit = (match[2] || '').toUpperCase()
  return unit === 'M' ? number * 1e6 : unit === 'K' ? number * 1e3 : unit === 'MD' ? number * 1e9 : number
}

/** Classes de population pour la lentille « Population » (couleurs séquentielles). */
export const populationScale = [
  { max: 2e6, label: '< 2 M', color: '#e8eedf' },
  { max: 10e6, label: '2 – 10 M', color: '#bcd7b0' },
  { max: 30e6, label: '10 – 30 M', color: '#84b77e' },
  { max: 60e6, label: '30 – 60 M', color: '#4f9058' },
  { max: Infinity, label: '> 60 M', color: '#21613a' },
]

export const populationColor = (value: number | null) =>
  value === null ? '#d8d2c4' : (populationScale.find((step) => value < step.max) || populationScale[populationScale.length - 1]).color

/** Boîte englobante d'un tracé SVG (commandes absolues M/L/Z, comme dans africaMapShapes). */
export const pathBounds = (path: string) => {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = numbers[i]
    const y = numbers[i + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}
