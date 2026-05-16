import mongoose from 'mongoose'
import logger from '../utils/logger.js'
import env from './env.js'

/**
 * Connexion à MongoDB avec gestion d'erreurs
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Options recommandées pour Mongoose 8
    })

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`)
    
    // Créer les index après la connexion
    await createIndexes()
    
    return conn
  } catch (error) {
    logger.error(`❌ Erreur de connexion MongoDB: ${error.message}`)
    throw error
  }
}

/**
 * Crée les index optimisés pour améliorer les performances
 * Les index sont créés automatiquement par Mongoose lors de la définition des schémas
 */
const createIndexes = async () => {
  try {
    // Les index sont définis dans les schémas Mongoose
    // Mongoose les crée automatiquement au premier accès
    // On peut forcer la création avec syncIndexes() si nécessaire
    logger.info('✅ Index MongoDB seront créés automatiquement par Mongoose')
  } catch (error) {
    logger.warn('⚠️  Erreur lors de la création des index:', error.message)
  }
}

export default connectDB
