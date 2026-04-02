import { v2 as cloudinary } from 'cloudinary'
import env from '../config/env.js'
import logger from './logger.js'

// Configuration Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
  logger.info('☁️  Cloudinary configuré')
} else {
  logger.warn('⚠️  Cloudinary non configuré - utilisation du stockage local')
}

/**
 * Upload un fichier vers Cloudinary
 * @param {string} filePath - Chemin du fichier local
 * @param {Object} options - Options d'upload
 * @returns {Promise<Object>} - URL et métadonnées
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  // Si Cloudinary n'est pas configuré, retourner une URL locale
  if (!env.CLOUDINARY_CLOUD_NAME) {
    const filename = filePath.split('/').pop()
    return {
      url: `/uploads/${filename}`,
      public_id: null,
      secure_url: `/uploads/${filename}`,
    }
  }

  try {
    const {
      folder = 'baobab',
      resource_type = 'auto',
      transformation = [],
      ...otherOptions
    } = options

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type,
      transformation,
      ...otherOptions,
    })

    logger.info(`✅ Fichier uploadé sur Cloudinary: ${result.public_id}`)

    return {
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'upload Cloudinary:', error)
    throw error
  }
}

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId - ID public du fichier
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!env.CLOUDINARY_CLOUD_NAME || !publicId) {
    return { result: 'ok' }
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info(`✅ Fichier supprimé de Cloudinary: ${publicId}`)
    return result
  } catch (error) {
    logger.error('❌ Erreur lors de la suppression Cloudinary:', error)
    throw error
  }
}

/**
 * Génère une URL optimisée pour Cloudinary
 * @param {string} publicId - ID public
 * @param {Object} options - Options de transformation
 * @returns {string} - URL optimisée
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  if (!publicId || !env.CLOUDINARY_CLOUD_NAME) {
    return publicId // Retourner tel quel si pas de Cloudinary
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options

  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)
  transformations.push(`c_${crop}`)

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ ...options }],
  })
}

export default cloudinary

