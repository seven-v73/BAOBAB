import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../..')

const readStaticCountries = () => {
  const filePath = path.join(rootDir, 'src', 'data', 'allAfricanCountries.ts')
  const source = fs.readFileSync(filePath, 'utf8')
  const declarationStart = source.indexOf('export const allAfricanCountries')
  const arrayStart = source.indexOf('[', declarationStart)
  const nextSectionStart = source.indexOf('\n\n// Fonction', arrayStart)

  if (declarationStart === -1 || arrayStart === -1 || nextSectionStart === -1) {
    throw new Error('Impossible de lire allAfricanCountries.ts')
  }

  const arraySource = source.slice(arrayStart, nextSectionStart).trim()
  return Function(`"use strict"; return (${arraySource});`)()
}

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null && String(value).trim() !== ''
}

const countryFromStatic = (country) => ({
  id: country.id.toUpperCase(),
  name: country.name,
  nameFr: country.nameFr,
  capital: country.capital,
  population: country.population || '',
  area: country.area || '',
  languages: country.languages || [],
  currency: country.currency || '',
  description: country.description || `${country.nameFr} est une fiche pays à enrichir avec des sources, récits, images et repères culturels.`,
  culture: country.culture || 'Fiche culturelle à compléter depuis l’administration.',
  color: country.color || '#2f7d59',
  center: country.center,
  rites: country.rites || [],
  customs: country.customs || [],
  foods: country.foods || [],
  traditions: country.traditions || [],
  festivals: country.festivals || [],
  arts: country.arts || [],
  oneSentenceSummary: country.description || `${country.nameFr}, repère culturel à explorer sur MonBaobab.`,
  discoveryIntro: country.culture || `Commencez par les langues, la capitale, les traditions et les contenus liés à ${country.nameFr}.`,
  keyFacts: [
    `Capitale: ${country.capital}`,
    country.population ? `Population indicative: ${country.population}` : '',
    country.languages?.length ? `Langues repères: ${country.languages.join(', ')}` : '',
  ].filter(Boolean),
  relatedThemes: [
    country.nameFr,
    ...(country.languages || []).slice(0, 3),
    ...(country.foods || []).slice(0, 2),
    ...(country.arts || []).slice(0, 2),
  ].filter(Boolean),
  sourceQuality: 'draft',
  sourceNotes: [
    'Fiche importée depuis le socle statique MonBaobab pour rendre le pays disponible dans les recherches et sélecteurs.',
    'À enrichir avec des sources officielles, contributions communautaires et références culturelles vérifiées.',
  ],
  lastUpdated: '2026',
  isActive: true,
})

const mergeWithExisting = (existing, incoming) => {
  const merged = {
    id: incoming.id,
    name: incoming.name,
    nameFr: incoming.nameFr,
    capital: incoming.capital,
    population: incoming.population,
    area: incoming.area,
    languages: hasValue(existing.languages) ? existing.languages : incoming.languages,
    currency: incoming.currency,
    color: incoming.color,
    center: incoming.center,
    isActive: true,
  }

  const preserveFields = [
    'description',
    'culture',
    'oneSentenceSummary',
    'discoveryIntro',
    'keyFacts',
    'peoples',
    'languageNotes',
    'historyHighlights',
    'notableFigures',
    'musicAndArts',
    'foodCulture',
    'oralTraditions',
    'knowledgeToPreserve',
    'recommendedPaths',
    'relatedThemes',
    'sourceQuality',
    'sourceNotes',
    'lastUpdated',
    'rites',
    'customs',
    'foods',
    'traditions',
    'festivals',
    'arts',
  ]

  for (const field of preserveFields) {
    merged[field] = hasValue(existing[field]) ? existing[field] : incoming[field]
  }

  return merged
}

const seedCountriesComplete = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  const countries = readStaticCountries().map(countryFromStatic)
  let created = 0
  let updated = 0

  for (const incoming of countries) {
    const existing = await Country.findOne({ id: incoming.id })
    if (existing) {
      await Country.updateOne({ _id: existing._id }, { $set: mergeWithExisting(existing.toObject(), incoming) })
      updated++
    } else {
      await Country.create(incoming)
      created++
    }
  }

  logger.info(`Pays africains complets: ${created} créé(s), ${updated} mis à jour, ${countries.length} dans le socle`)
  return { created, updated, total: countries.length }
}

export { seedCountriesComplete }

if (process.argv[1] && process.argv[1].includes('seedCountriesComplete.js')) {
  seedCountriesComplete()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant le seed complet des pays', { message: error.message, stack: error.stack })
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
