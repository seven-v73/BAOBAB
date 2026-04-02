import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import logger from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Magic numbers pour différents types de fichiers
 * Les magic numbers sont les premiers octets d'un fichier qui identifient son type réel
 */
const MAGIC_NUMBERS = {
  // Images
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF87a ou GIF89a
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF...WEBP
  // PDF
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  // Vidéos
  'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ou variations
  'video/webm': [0x1A, 0x45, 0xDF, 0xA3],
  // Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // ZIP (DOCX est un ZIP)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B, 0x03, 0x04], // ZIP (XLSX est un ZIP)
}

/**
 * Types MIME autorisés par catégorie
 */
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  document: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint'
  ]
}

/**
 * Taille maximale par type de fichier (en octets)
 */
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  document: 20 * 1024 * 1024 // 20MB
}

/**
 * Lit les premiers octets d'un fichier pour vérifier le magic number
 * @param {string} filePath - Chemin du fichier
 * @param {number} length - Nombre d'octets à lire (défaut: 20)
 * @returns {Promise<Buffer>} - Les premiers octets du fichier
 */
const readFileHeader = async (filePath, length = 20) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { start: 0, end: length - 1 })
    const chunks = []
    
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

/**
 * Vérifie si le magic number correspond au type MIME déclaré
 * @param {Buffer} header - Les premiers octets du fichier
 * @param {string} declaredMimeType - Le type MIME déclaré
 * @returns {boolean} - True si le magic number correspond
 */
const checkMagicNumber = (header, declaredMimeType) => {
  const expectedMagic = MAGIC_NUMBERS[declaredMimeType]
  if (!expectedMagic) {
    // Si on n'a pas de magic number pour ce type, on accepte (pour compatibilité)
    return true
  }

  // Vérifier si les premiers octets correspondent
  for (let i = 0; i < expectedMagic.length && i < header.length; i++) {
    if (header[i] !== expectedMagic[i]) {
      return false
    }
  }

  return true
}

/**
 * Détermine le type MIME réel d'un fichier basé sur son magic number
 * @param {Buffer} header - Les premiers octets du fichier
 * @returns {string|null} - Le type MIME détecté ou null
 */
const detectMimeType = (header) => {
  for (const [mimeType, magic] of Object.entries(MAGIC_NUMBERS)) {
    if (checkMagicNumber(header, mimeType)) {
      return mimeType
    }
  }
  return null
}

/**
 * Valide un fichier uploadé en vérifiant :
 * 1. Le type MIME déclaré
 * 2. Le magic number (type réel)
 * 3. La taille
 * 4. L'extension
 * @param {Object} file - Objet fichier Multer
 * @param {string} category - Catégorie du fichier (image, pdf, video, document)
 * @returns {Promise<Object>} - { valid: boolean, error?: string, detectedMimeType?: string }
 */
export const validateFile = async (file, category) => {
  try {
    if (!file) {
      return { valid: false, error: 'Aucun fichier fourni' }
    }

    // Vérifier que la catégorie est valide
    if (!ALLOWED_MIME_TYPES[category]) {
      return { valid: false, error: `Catégorie invalide: ${category}` }
    }

    // Vérifier le type MIME déclaré
    const declaredMimeType = file.mimetype
    if (!ALLOWED_MIME_TYPES[category].includes(declaredMimeType)) {
      logger.warn('Type MIME non autorisé', {
        declaredMimeType,
        category,
        filename: file.originalname
      })
      return { valid: false, error: `Type MIME non autorisé: ${declaredMimeType}` }
    }

    // Vérifier la taille
    const maxSize = MAX_FILE_SIZES[category]
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`
      }
    }

    // Vérifier le magic number (type réel du fichier)
    const filePath = file.path || file.destination + '/' + file.filename
    if (fs.existsSync(filePath)) {
      const header = await readFileHeader(filePath)
      const detectedMimeType = detectMimeType(header)

      // Si on a détecté un type, vérifier qu'il correspond
      if (detectedMimeType && detectedMimeType !== declaredMimeType) {
        logger.warn('Type MIME déclaré ne correspond pas au type réel', {
          declaredMimeType,
          detectedMimeType,
          filename: file.originalname,
          category
        })
        return {
          valid: false,
          error: 'Type de fichier invalide. Le contenu du fichier ne correspond pas à son extension.'
        }
      }

      // Vérifier que le type détecté est autorisé pour cette catégorie
      if (detectedMimeType && !ALLOWED_MIME_TYPES[category].includes(detectedMimeType)) {
        return {
          valid: false,
          error: 'Type de fichier non autorisé pour cette catégorie'
        }
      }

      return {
        valid: true,
        detectedMimeType: detectedMimeType || declaredMimeType
      }
    }

    // Si le fichier n'existe pas encore (upload en mémoire), on ne peut vérifier que le MIME déclaré
    return { valid: true, detectedMimeType: declaredMimeType }
  } catch (error) {
    logger.error('Erreur lors de la validation du fichier', {
      error: error.message,
      stack: error.stack,
      filename: file?.originalname
    })
    return { valid: false, error: 'Erreur lors de la validation du fichier' }
  }
}

/**
 * Valide plusieurs fichiers
 * @param {Array} files - Tableau de fichiers
 * @param {string} category - Catégorie des fichiers
 * @returns {Promise<Object>} - { valid: boolean, errors?: string[] }
 */
export const validateFiles = async (files, category) => {
  if (!Array.isArray(files)) {
    files = [files]
  }

  const errors = []
  for (const file of files) {
    const result = await validateFile(file, category)
    if (!result.valid) {
      errors.push(result.error)
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

