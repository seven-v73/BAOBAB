import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import Source from '../models/Source.js'
import logger from '../utils/logger.js'

dotenv.config()

const sourceDefinitions = [
  {
    type: 'website',
    title: 'UNESCO - Patrimoine culturel immatériel en Afrique',
    author: 'UNESCO',
    publisher: 'UNESCO',
    year: 2026,
    url: 'https://ich.unesco.org/',
    language: 'fr',
    reliability: 5,
    description: 'Répertoire international utile pour vérifier des pratiques, expressions et savoir-faire reconnus.',
    keywords: ['patrimoine immatériel', 'unesco', 'transmission'],
    relatedTopics: ['Patrimoine', 'Transmission', 'Savoirs vivants'],
    countryIds: ['MA', 'ML', 'NG', 'ET', 'KE', 'SN'],
  },
  {
    type: 'website',
    title: 'UNESCO World Heritage Centre - Sites africains',
    author: 'UNESCO',
    publisher: 'UNESCO',
    year: 2026,
    url: 'https://whc.unesco.org/',
    language: 'fr',
    reliability: 5,
    description: 'Base de référence pour les sites classés, paysages culturels, villes historiques et patrimoines matériels.',
    keywords: ['sites', 'patrimoine mondial', 'histoire'],
    relatedTopics: ['Sites historiques', 'Paysages culturels'],
    countryIds: ['BF', 'CI', 'GH', 'EG', 'TZ', 'ZA'],
  },
  {
    type: 'website',
    title: 'African Union - Culture, patrimoine et identité',
    author: 'Union africaine',
    publisher: 'African Union',
    year: 2026,
    url: 'https://au.int/',
    language: 'fr',
    reliability: 4,
    description: 'Repères institutionnels sur les politiques culturelles, la jeunesse, la mémoire et les initiatives panafricaines.',
    keywords: ['union africaine', 'culture', 'panafricain'],
    relatedTopics: ['Panafricanisme', 'Politiques culturelles'],
    countryIds: ['ET', 'GH', 'SN', 'ZA'],
  },
  {
    type: 'book',
    title: 'Histoire générale de l’Afrique',
    author: 'Comité scientifique international de l’UNESCO',
    publisher: 'UNESCO',
    year: 1980,
    language: 'fr',
    reliability: 5,
    description: 'Collection majeure pour contextualiser les périodes historiques, sociétés, empires et circulations africaines.',
    keywords: ['histoire', 'empires', 'mémoire'],
    relatedTopics: ['Histoire africaine', 'Empires', 'Mémoire'],
    countryIds: ['ML', 'GH', 'SD', 'EG', 'ET'],
  },
  {
    type: 'archive',
    title: 'Archives nationales du Sénégal',
    author: 'République du Sénégal',
    publisher: 'Archives nationales du Sénégal',
    year: 2026,
    language: 'fr',
    reliability: 4,
    description: 'Point d’entrée pour les recherches documentaires liées au Sénégal, à l’Afrique de l’Ouest et aux trajectoires administratives.',
    keywords: ['archives', 'sénégal', 'documents'],
    relatedTopics: ['Archives', 'Afrique de l’Ouest'],
    countryIds: ['SN'],
  },
  {
    type: 'museum',
    title: 'Musée des Civilisations Noires',
    author: 'Musée des Civilisations Noires',
    publisher: 'MCN Dakar',
    year: 2026,
    url: 'https://mcn.sn/',
    language: 'fr',
    reliability: 4,
    description: 'Institution muséale dédiée aux civilisations noires, aux arts, aux mémoires et aux dialogues culturels.',
    keywords: ['musée', 'civilisations noires', 'dakar'],
    relatedTopics: ['Musées', 'Arts', 'Mémoire'],
    countryIds: ['SN'],
  },
  {
    type: 'museum',
    title: 'Musée national du Mali',
    author: 'Musée national du Mali',
    publisher: 'Musée national du Mali',
    year: 2026,
    language: 'fr',
    reliability: 4,
    description: 'Repère culturel pour les objets, textiles, patrimoines matériels et expressions du Mali.',
    keywords: ['mali', 'musée', 'objets culturels'],
    relatedTopics: ['Objets culturels', 'Textiles', 'Patrimoine'],
    countryIds: ['ML'],
  },
  {
    type: 'website',
    title: 'Bibliothèque numérique mondiale - Collections africaines',
    author: 'Library of Congress / UNESCO',
    publisher: 'World Digital Library',
    year: 2020,
    url: 'https://www.wdl.org/',
    language: 'fr',
    reliability: 4,
    description: 'Ressources numérisées pour explorer manuscrits, cartes, photographies et documents historiques.',
    keywords: ['bibliothèque numérique', 'cartes', 'manuscrits'],
    relatedTopics: ['Archives numériques', 'Manuscrits', 'Cartographie'],
    countryIds: ['ML', 'MA', 'EG', 'ET'],
  },
  {
    type: 'article',
    title: 'Les manuscrits de Tombouctou et la transmission savante',
    author: 'Ressource éditoriale MonBaobab',
    publisher: 'MonBaobab',
    year: 2026,
    language: 'fr',
    reliability: 3,
    description: 'Note de travail à enrichir sur les manuscrits, bibliothèques familiales et traditions d’écriture au Sahel.',
    keywords: ['tombouctou', 'manuscrits', 'sahel'],
    relatedTopics: ['Manuscrits', 'Savoirs écrits', 'Sahel'],
    countryIds: ['ML'],
  },
  {
    type: 'testimony',
    title: 'Tradition orale, griots et mémoire mandingue',
    author: 'Communauté MonBaobab',
    publisher: 'MonBaobab',
    year: 2026,
    language: 'fr',
    reliability: 3,
    description: 'Entrée communautaire à compléter par témoignages, sources locales et références audio.',
    keywords: ['griots', 'oralité', 'mandingue'],
    relatedTopics: ['Oralité', 'Mandingue', 'Mémoire familiale'],
    countryIds: ['ML', 'GN', 'SN', 'GM'],
  },
  {
    type: 'article',
    title: 'Textiles kente et symboles akan',
    author: 'Ressource éditoriale MonBaobab',
    publisher: 'MonBaobab',
    year: 2026,
    language: 'fr',
    reliability: 3,
    description: 'Point de départ pour relier textiles, symboles, artisanat et contexte culturel akan.',
    keywords: ['kente', 'akan', 'textile'],
    relatedTopics: ['Textiles', 'Symboles', 'Artisanat'],
    countryIds: ['GH', 'CI'],
  },
  {
    type: 'video',
    title: 'Archives audiovisuelles pour l’oralité africaine',
    author: 'Ressource éditoriale MonBaobab',
    publisher: 'MonBaobab',
    year: 2026,
    language: 'fr',
    reliability: 3,
    description: 'Fiche destinée à référencer interviews, récits, chants, prononciations et témoignages validés.',
    keywords: ['audio', 'oralité', 'témoignages'],
    relatedTopics: ['Oralité', 'Audio', 'Transmission'],
    countryIds: ['BF', 'CI', 'SN', 'ML'],
  },
]

const seedSources = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  let created = 0
  let updated = 0

  for (const definition of sourceDefinitions) {
    const { countryIds, ...sourceData } = definition
    const countries = await Country.find({ id: { $in: countryIds } }).select('_id')
    const payload = {
      ...sourceData,
      relatedCountries: countries.map((country) => country._id),
      isActive: true,
    }

    const existing = await Source.findOne({ title: sourceData.title })
    if (existing) {
      Object.assign(existing, payload)
      await existing.save()
      updated++
    } else {
      await Source.create(payload)
      created++
    }
  }

  logger.info(`Sources documentaires: ${created} créée(s), ${updated} mise(s) à jour`)
  return { created, updated, total: sourceDefinitions.length }
}

export { seedSources }

if (process.argv[1] && process.argv[1].includes('seedSources.js')) {
  seedSources()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant le seed des sources', { message: error.message, stack: error.stack })
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
