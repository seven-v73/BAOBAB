import Country from '../models/Country.js'
import mongoose from 'mongoose'
import logger from './logger.js'

/**
 * Convertit un code pays (ex: "DZ", "CM") ou un ObjectId en ObjectId MongoDB
 * @param {string} countryIdentifier - Code pays (ex: "DZ") ou ObjectId MongoDB
 * @returns {Promise<mongoose.Types.ObjectId|null>} ObjectId du pays ou null si non trouvé
 */
export const getCountryObjectId = async (countryIdentifier) => {
  if (!countryIdentifier) {
    return null
  }

  // Si c'est déjà un ObjectId valide, le retourner directement
  if (mongoose.Types.ObjectId.isValid(countryIdentifier) && countryIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
    return new mongoose.Types.ObjectId(countryIdentifier)
  }

  // Sinon, chercher le pays par son code (id)
  try {
    const country = await Country.findOne({ id: countryIdentifier.toUpperCase() }).select('_id').lean()
    
    if (!country) {
      logger.warn('Pays non trouvé pour conversion ObjectId', { countryIdentifier })
      return null
    }

    return country._id
  } catch (error) {
    logger.error('Erreur lors de la conversion du code pays en ObjectId', { 
      countryIdentifier, 
      error: error.message 
    })
    return null
  }
}

/**
 * Convertit un tableau de codes pays en ObjectIds
 * @param {string[]} countryIdentifiers - Tableau de codes pays ou ObjectIds
 * @returns {Promise<mongoose.Types.ObjectId[]>} Tableau d'ObjectIds
 */
export const getCountryObjectIds = async (countryIdentifiers) => {
  if (!Array.isArray(countryIdentifiers) || countryIdentifiers.length === 0) {
    return []
  }

  const objectIds = await Promise.all(
    countryIdentifiers.map(id => getCountryObjectId(id))
  )

  // Filtrer les nulls
  return objectIds.filter(id => id !== null)
}

