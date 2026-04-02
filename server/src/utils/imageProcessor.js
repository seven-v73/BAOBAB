import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import logger from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Traite et compresse une image
 * @param {string} inputPath - Chemin du fichier source
 * @param {string} outputPath - Chemin du fichier de sortie (optionnel)
 * @param {object} options - Options de traitement
 * @returns {Promise<string>} - Chemin du fichier traité
 */
export const processImage = async (inputPath, outputPath = null, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp', // webp, jpeg, png
    fit = 'inside' // inside, cover, contain, fill
  } = options

  try {
    // Si pas de chemin de sortie, créer un nom basé sur l'input
    if (!outputPath) {
      const ext = format === 'webp' ? '.webp' : path.extname(inputPath)
      const dir = path.dirname(inputPath)
      const name = path.basename(inputPath, path.extname(inputPath))
      outputPath = path.join(dir, `${name}_processed${ext}`)
    }

    // Lire les métadonnées de l'image
    const metadata = await sharp(inputPath).metadata()
    
    // Vérifier si l'image a besoin d'être redimensionnée
    const needsResize = metadata.width > maxWidth || metadata.height > maxHeight

    let pipeline = sharp(inputPath)

    if (needsResize) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit,
        withoutEnlargement: true
      })
    }

    // Convertir au format souhaité
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality })
        break
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true })
        break
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 })
        break
      default:
        pipeline = pipeline.webp({ quality })
    }

    await pipeline.toFile(outputPath)

    // Obtenir la taille des fichiers
    const originalSize = fs.statSync(inputPath).size
    const processedSize = fs.statSync(outputPath).size
    const compressionRatio = ((1 - processedSize / originalSize) * 100).toFixed(2)

    logger.info('Image traitée', {
      input: path.basename(inputPath),
      output: path.basename(outputPath),
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      processedSize: `${(processedSize / 1024).toFixed(2)} KB`,
      compressionRatio: `${compressionRatio}%`
    })

    return outputPath
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'image', {
      inputPath,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

/**
 * Crée une miniature (thumbnail) d'une image
 * @param {string} inputPath - Chemin du fichier source
 * @param {string} outputPath - Chemin du fichier de sortie
 * @param {number} size - Taille de la miniature (carré)
 * @returns {Promise<string>} - Chemin du fichier de miniature
 */
export const createThumbnail = async (inputPath, outputPath, size = 300) => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 75 })
      .toFile(outputPath)

    logger.debug('Miniature créée', {
      input: path.basename(inputPath),
      output: path.basename(outputPath),
      size: `${size}x${size}`
    })

    return outputPath
  } catch (error) {
    logger.error('Erreur lors de la création de la miniature', {
      inputPath,
      error: error.message
    })
    throw error
  }
}

/**
 * Optimise une image existante (remplace le fichier original)
 * @param {string} filePath - Chemin du fichier à optimiser
 * @returns {Promise<string>} - Chemin du fichier optimisé
 */
export const optimizeImage = async (filePath) => {
  const tempPath = filePath + '.tmp'
  
  try {
    // Traiter l'image dans un fichier temporaire
    await processImage(filePath, tempPath, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 80,
      format: 'webp'
    })

    // Remplacer le fichier original
    fs.renameSync(tempPath, filePath)

    return filePath
  } catch (error) {
    // Supprimer le fichier temporaire en cas d'erreur
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
    throw error
  }
}

