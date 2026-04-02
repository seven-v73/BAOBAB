// Script de migration pour importer les pays depuis allAfricanCountries.ts
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

// Données des pays (à importer depuis le frontend ou créer ici)
const countriesData = [
  // Exemple - vous devrez importer toutes les données depuis allAfricanCountries.ts
  {
    id: 'MA',
    name: 'Morocco',
    nameFr: 'Maroc',
    capital: 'Rabat',
    population: '37M',
    area: '447K km²',
    languages: ['Arabe', 'Amazigh'],
    currency: 'Dirham',
    description: 'Carrefour entre Afrique et Europe...',
    culture: 'Architecture mauresque, musique gnawa...',
    color: '#8E44AD',
    center: { x: 140, y: 120 },
    rites: ['Cérémonie du thé à la menthe'],
    customs: ['Hospitalité et générosité'],
    foods: ['Tajine', 'Couscous'],
    traditions: ['Musique gnawa'],
    festivals: ['Festival des Gnaouas'],
    arts: ['Zellige'],
  },
  // ... ajouter tous les autres pays
]

const migrateCountries = async () => {
  try {
    await connectDB()
    logger.info('🔄 Début de la migration des pays...')

    let created = 0
    let updated = 0

    for (const countryData of countriesData) {
      const existing = await Country.findOne({ id: countryData.id })
      
      if (existing) {
        await Country.findOneAndUpdate({ id: countryData.id }, countryData)
        updated++
        logger.info(`✅ Mis à jour: ${countryData.nameFr}`)
      } else {
        await Country.create(countryData)
        created++
        logger.info(`✅ Créé: ${countryData.nameFr}`)
      }
    }

    logger.info(`✨ Migration terminée: ${created} créés, ${updated} mis à jour`)
    process.exit(0)
  } catch (error) {
    logger.error('❌ Erreur lors de la migration', { error })
    process.exit(1)
  }
}

migrateCountries()

