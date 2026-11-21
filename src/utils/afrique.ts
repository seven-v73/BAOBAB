import { allAfricanCountries } from '../data/allAfricanCountries'
import { REGION_LABELS, regionOf, type AfricaRegion } from '../data/countryDiscoveryDefaults'

// Outils communs aux rubriques (Récits, Repères) pour une lecture pluriculturelle du continent :
// retrouver pays et région d'un contenu, écrire les années anciennes correctement, et alterner
// les régions pour qu'aucune ne monopolise l'affichage.

export type Region = AfricaRegion

export const REGION_ORDER: Region[] = ['nord', 'ouest', 'centre', 'est', 'australe']
export { REGION_LABELS }

/**
 * Une couleur secondaire de la charte par région. Décor uniquement (points, filets, fonds de
 * vignette) : jamais pour du texte, la plupart ne passent pas le contraste sur crème (DESIGN.md §3).
 */
export const REGION_COLORS: Record<Region, string> = {
  nord: '#e87525', // orange désert
  ouest: '#e2b52f', // jaune ambre
  centre: '#00a39a', // turquoise minéral
  est: '#1478a6', // bleu abysse
  australe: '#d94a3a', // rouge terre cuite
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'")
    .toLowerCase()

// Noms anciens ou courants rencontrés dans les contenus, rattachés au pays actuel
const ALIASES: Array<[string, string]> = [
  ['republique democratique du congo', 'CD'],
  ['rdc', 'CD'],
  ['liberia', 'LR'],
  ['swaziland', 'SZ'],
  ['carthage', 'TN'],
  ['koush', 'SD'],
  ['nubie', 'SD'],
  ['meroe', 'SD'],
  ['kerma', 'SD'],
  ['axoum', 'ET'],
  ['zanzibar', 'TZ'],
  ['dahomey', 'BJ'],
  ['abomey', 'BJ'],
  ['zazzau', 'NG'],
  ['zaria', 'NG'],
  ['tombouctou', 'ML'],
  ['djenne', 'ML'],
  // Grandes villes, souvent citées seules dans les titres
  ['dakar', 'SN'],
  ['saint-louis du senegal', 'SN'],
  ['abidjan', 'CI'],
  ['lagos', 'NG'],
  ['abuja', 'NG'],
  ['accra', 'GH'],
  ['kumasi', 'GH'],
  ['bamako', 'ML'],
  ['ouagadougou', 'BF'],
  ['niamey', 'NE'],
  ['lome', 'TG'],
  ['cotonou', 'BJ'],
  ['conakry', 'GN'],
  ['le caire', 'EG'],
  ['alexandrie', 'EG'],
  ['tunis', 'TN'],
  ['alger', 'DZ'],
  ['casablanca', 'MA'],
  ['marrakech', 'MA'],
  ['fes', 'MA'],
  ['kinshasa', 'CD'],
  ['brazzaville', 'CG'],
  ['douala', 'CM'],
  ['yaounde', 'CM'],
  ['libreville', 'GA'],
  ['luanda', 'AO'],
  ['nairobi', 'KE'],
  ['mombasa', 'KE'],
  ['addis-abeba', 'ET'],
  ['kigali', 'RW'],
  ['kampala', 'UG'],
  ['dar es salaam', 'TZ'],
  ['johannesburg', 'ZA'],
  ['le cap', 'ZA'],
  ['soweto', 'ZA'],
  ['maputo', 'MZ'],
  ['harare', 'ZW'],
  ['antananarivo', 'MG'],
]

const byCode = new Map(allAfricanCountries.map((country) => [country.id.toUpperCase(), country]))

// Les noms les plus longs d'abord : « Soudan du Sud » avant « Soudan », « Guinée-Bissau » avant « Guinée »
const MATCHERS = [
  ...allAfricanCountries.map((country) => [normalize(country.nameFr), country.id.toUpperCase()] as [string, string]),
  ...ALIASES,
].sort((a, b) => b[0].length - a[0].length)

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const MATCHER_RES = MATCHERS.map(([name, code]) => [new RegExp(`(^|[^a-z])${escapeRegExp(name)}(?![a-z])`), code] as const)

/** Codes pays (ISO) cités dans les textes donnés, dans l'ordre d'apparition des textes. */
export const findCountryCodes = (...texts: Array<string | null | undefined | string[]>): string[] => {
  const found: string[] = []
  for (const raw of texts.flat()) {
    if (!raw) continue
    let text = normalize(raw)
    const hits: Array<[number, string]> = []
    for (const [pattern, code] of MATCHER_RES) {
      const match = pattern.exec(text)
      if (match) {
        hits.push([match.index, code])
        // Masque le nom trouvé (même longueur) : « soudan » ne retrouve pas « soudan du sud »
        text = text.slice(0, match.index) + match[0].replace(/./g, ' ') + text.slice(match.index + match[0].length)
      }
    }
    // Ordre d'apparition dans le texte : « Angola, RDC » donne d'abord l'Angola
    for (const [, code] of hits.sort((a, b) => a[0] - b[0])) if (!found.includes(code)) found.push(code)
  }
  return found
}

export const countryNameOf = (code?: string | null) => (code ? byCode.get(code.toUpperCase())?.nameFr ?? '' : '')
export const regionOfCode = (code?: string | null): Region | null => (code && byCode.has(code.toUpperCase()) ? regionOf(code) : null)

/** Place d'un contenu sur le continent : pays principal, région, libellés prêts à afficher. */
export interface Place {
  codes: string[]
  pays: string
  region: Region | null
  regionLabel: string
}

export const placeOf = (codes: string[], fallbackLabel = 'Tout le continent'): Place => {
  const region = regionOfCode(codes[0])
  const names = codes.map(countryNameOf).filter(Boolean)
  return {
    codes,
    pays: names.slice(0, 2).join(', ') || fallbackLabel,
    region,
    regionLabel: region ? REGION_LABELS[region] : fallbackLabel,
  }
}

/**
 * Alterne les régions (Nord, Ouest, Centre, Est, Australe, puis le reste) en gardant l'ordre
 * d'origine à l'intérieur de chaque région : une liste reflète la diversité du continent dès
 * les premières cartes, au lieu de s'ouvrir sur dix contenus d'un même pays.
 */
export const interleaveByRegion = <T,>(items: T[], regionOfItem: (item: T) => Region | null): T[] => {
  const buckets = new Map<string, T[]>()
  for (const item of items) {
    const key = regionOfItem(item) ?? 'autre'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(item)
  }
  const order = [...REGION_ORDER, 'autre'].filter((key) => buckets.has(key))
  const result: T[] = []
  for (let round = 0; result.length < items.length; round++) {
    for (const key of order) {
      const item = buckets.get(key)![round]
      if (item !== undefined) result.push(item)
    }
  }
  return result
}

/**
 * Année lisible d'une date de la base. Les dates anciennes sont stockées en numérotation
 * astronomique (an 0 = 1 av. J.-C.) : -2499 s'affiche « 2500 av. J.-C. ».
 */
export const yearOf = (value?: string | Date | null): number | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getUTCFullYear()
}

export const formatYear = (value?: string | Date | null): string => {
  const year = yearOf(value)
  if (year === null) return ''
  if (year <= 0) return `${1 - year} av. J.-C.`
  if (year < 1000) return `${year} apr. J.-C.`
  return String(year)
}

/** « 1918 – 2013 », « 60 av. J.-C. – 10 av. J.-C. », « 1934 – » pour une personne vivante */
export const formatLifespan = (birth?: string | null, death?: string | null) => {
  const start = formatYear(birth)
  const end = formatYear(death)
  if (start && end) return `${start} – ${end}`
  return start ? `${start} –` : end
}

/** Initiales d'un nom pour une vignette sans portrait (« Wangari Maathai » → « WM »). */
const TITLES = new Set(['Reine', 'Roi', 'Sultan', 'Prince', 'Princesse'])
export const initialsOf = (name = '') =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((part) => !TITLES.has(part) && !/^[IVXLC]+$/.test(part)) // ni titre ni numéro de règne (Menelik II)
    .join(' ')
    .split(/\s+/)
    .filter((part) => part && part[0] === part[0].toUpperCase() && /\p{L}/u.test(part[0]))
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/**
 * Date historique lisible. Un 1er janvier signale une date connue à l'année près (saisie sans jour) :
 * on n'affiche alors que l'année, pour ne pas inventer de précision (« 2500 av. J.-C. », « 1960 »).
 */
export const formatHistoricalDate = (value?: string | Date | null): string => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const yearLabel = formatYear(date)
  if (date.getUTCMonth() === 0 && date.getUTCDate() === 1) return yearLabel
  return `${date.getUTCDate() === 1 ? '1er' : date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${yearLabel}`
}
