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
import * as richKnowledgeModule from './seedRichKnowledge.js'
import * as quizzesModule from './seedQuizzes.js'
import * as proverbsModule from './seedProverbs.js'
import * as demoCommerceBlogModule from './seedDemoCommerceBlog.js'
import * as productionFoundationModule from './seedProductionFoundation.js'
import * as countriesCompleteModule from './seedCountriesComplete.js'
import * as moreWisdomModule from './seedMoreProverbsAndQuizzes.js'
import * as sourcesModule from './seedSources.js'

const seedAll = async () => {
  try {
    await connectDB()
    logger.info('🌱 Début du seed complet de la plateforme MonBaobab...\n')

    logger.info('🧭 1/12 - Socle complet: tous les pays africains...')
    if (countriesCompleteModule.seedCountriesComplete) {
      await countriesCompleteModule.seedCountriesComplete()
    }

    logger.info('\n🧭 2/12 - Socle production: fiches pays structurées...')
    if (productionFoundationModule.seedProductionFoundation) {
      await productionFoundationModule.seedProductionFoundation()
    }

    // Exécuter les seeds dans l'ordre
    logger.info('📅 3/12 - Seed des événements historiques (Timeline)...')
    if (timelineModule.seedTimeline) {
      await timelineModule.seedTimeline()
    } else {
      // Si pas d'export, exécuter directement
      const { default: seedTimeline } = await import('./seedTimeline.js')
      await seedTimeline()
    }
    
    logger.info('\n👤 4/12 - Seed des personnages historiques...')
    if (figuresModule.seedFigures) {
      await figuresModule.seedFigures()
    } else {
      const { default: seedFigures } = await import('./seedFigures.js')
      await seedFigures()
    }
    
    logger.info('\n📖 5/12 - Seed des récits historiques...')
    if (storiesModule.seedStories) {
      await storiesModule.seedStories()
    } else {
      const { default: seedStories } = await import('./seedStories.js')
      await seedStories()
    }
    
    logger.info('\n📚 6/12 - Seed des collections thématiques...')
    if (collectionsModule.seedCollections) {
      await collectionsModule.seedCollections()
    } else {
      const { default: seedCollections } = await import('./seedCollections.js')
      await seedCollections()
    }

    logger.info('\n🧠 7/12 - Seed des quiz interactifs...')
    if (quizzesModule.seedQuizzes) {
      await quizzesModule.seedQuizzes()
    }

    logger.info('\n💬 8/12 - Seed des proverbes...')
    if (proverbsModule.seedProverbs) {
      await proverbsModule.seedProverbs()
    }

    logger.info('\n🌍 9/12 - Seed enrichi: motivation, savoirs, quiz et proverbes...')
    if (richKnowledgeModule.seedRichKnowledge) {
      await richKnowledgeModule.seedRichKnowledge()
    }

    logger.info('\n💬 10/12 - Proverbes et quiz supplémentaires...')
    if (moreWisdomModule.seedMoreProverbsAndQuizzes) {
      await moreWisdomModule.seedMoreProverbsAndQuizzes()
    }

    logger.info('\n📚 11/12 - Bibliothèque de sources...')
    if (sourcesModule.seedSources) {
      await sourcesModule.seedSources()
    }

    logger.info('\n🛍️ 12/12 - Blogs et produits de démonstration éditoriale...')
    if (demoCommerceBlogModule.seedDemoCommerceBlog) {
      await demoCommerceBlogModule.seedDemoCommerceBlog()
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
