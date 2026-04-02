import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import logger from '../utils/logger.js'

dotenv.config()

// Importer les modules de seed (ils exportent les fonctions)
import * as timelineModule from './seedTimeline.js'
import * as figuresModule from './seedFigures.js'
import * as storiesModule from './seedStories.js'
import * as collectionsModule from './seedCollections.js'

const seedAll = async () => {
  try {
    await connectDB()
    logger.info('🌱 Début du seed complet de la plateforme BAOBAB...\n')

    // Exécuter les seeds dans l'ordre
    logger.info('📅 1/4 - Seed des événements historiques (Timeline)...')
    if (timelineModule.seedTimeline) {
      await timelineModule.seedTimeline()
    } else {
      // Si pas d'export, exécuter directement
      const { default: seedTimeline } = await import('./seedTimeline.js')
      await seedTimeline()
    }
    
    logger.info('\n👤 2/4 - Seed des personnages historiques...')
    if (figuresModule.seedFigures) {
      await figuresModule.seedFigures()
    } else {
      const { default: seedFigures } = await import('./seedFigures.js')
      await seedFigures()
    }
    
    logger.info('\n📖 3/4 - Seed des récits historiques...')
    if (storiesModule.seedStories) {
      await storiesModule.seedStories()
    } else {
      const { default: seedStories } = await import('./seedStories.js')
      await seedStories()
    }
    
    logger.info('\n📚 4/4 - Seed des collections thématiques...')
    if (collectionsModule.seedCollections) {
      await collectionsModule.seedCollections()
    } else {
      const { default: seedCollections } = await import('./seedCollections.js')
      await seedCollections()
    }

    logger.info('\n✨ Seed complet terminé avec succès !')
    logger.info('🎉 La plateforme est maintenant remplie de contenu authentique africain.')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du seed complet', { message: error.message, stack: error.stack })
    process.exit(1)
  }
}

seedAll()

