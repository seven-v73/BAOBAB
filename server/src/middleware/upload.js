import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { uploadToCloudinary as cloudinaryUpload, deleteFromCloudinary } from '../utils/cloudinary.js'
import { processImage } from '../utils/imageProcessor.js'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// S'assurer que le dossier uploads existe

const uploadsDir = path.join(__dirname, '../../uploads/')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  logger.info('Dossier uploads créé', { uploadsDir })
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../uploads/')
    logger.debug('Destination upload', { dest })
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    logger.debug('Nom de fichier généré', { filename })
    cb(null, filename)
  },
})

// Filtre pour les images
const imageFilter = (req, file, cb) => {
  logger.debug('Filtre image', { filename: file.originalname, mimetype: file.mimetype })
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    logger.debug('Image acceptée', { filename: file.originalname })
    return cb(null, true)
  } else {
    logger.warn('Image rejetée', { filename: file.originalname, extname, mimetype: file.mimetype })
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'))
  }
}

// Filtre pour les PDFs
const pdfFilter = (req, file, cb) => {
  logger.debug('Filtre PDF', { filename: file.originalname, mimetype: file.mimetype })
  const allowedTypes = /pdf/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  // Accepter différents types MIME pour PDF
  const mimetype = /application\/pdf|application\/x-pdf/.test(file.mimetype)

  if (mimetype && extname) {
    logger.debug('PDF accepté', { filename: file.originalname })
    return cb(null, true)
  } else {
    logger.warn('PDF rejeté', { filename: file.originalname, extname, mimetype: file.mimetype })
    cb(new Error('Seuls les fichiers PDF sont autorisés'))
  }
}

// Filtre pour les vidéos
const videoFilter = (req, file, cb) => {
  logger.debug('Filtre vidéo', { filename: file.originalname, mimetype: file.mimetype })
  const allowedTypes = /mp4|webm|ogg|mov|avi/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = /video\/(mp4|webm|ogg|quicktime|x-msvideo)/.test(file.mimetype)

  if (mimetype && extname) {
    logger.debug('Vidéo acceptée', { filename: file.originalname })
    return cb(null, true)
  } else {
    logger.warn('Vidéo rejetée', { filename: file.originalname, extname, mimetype: file.mimetype })
    cb(new Error('Seules les vidéos sont autorisées (mp4, webm, ogg, mov, avi)'))
  }
}

// Filtre pour les documents (DOCX, XLSX, PPTX, etc.)
const documentFilter = (req, file, cb) => {
  logger.debug('Filtre document', { filename: file.originalname, mimetype: file.mimetype })
  const allowedTypes = /docx?|xlsx?|pptx?|odt|ods|odp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = /application\/(vnd\.openxmlformats-officedocument\.|msword|vnd\.ms-|vnd\.oasis\.open)|application\/pdf/.test(file.mimetype)

  if (mimetype && extname) {
    logger.debug('Document accepté', { filename: file.originalname })
    return cb(null, true)
  } else {
    logger.warn('Document rejeté', { filename: file.originalname, extname, mimetype: file.mimetype })
    cb(new Error('Seuls les documents sont autorisés (doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp)'))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
})

export const uploadPDF = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB pour les PDFs
  },
  fileFilter: pdfFilter,
})

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB pour les vidéos
  },
  fileFilter: videoFilter,
})

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB pour les documents
  },
  fileFilter: documentFilter,
})

/**
 * Upload vers Cloudinary après traitement
 */
export const uploadToCloudinary = async (file) => {
  try {
    // Traiter l'image si c'est une image
    if (file.mimetype.startsWith('image/')) {
      const processedPath = await processImage(file.path)
      // Remplacer le fichier original par le fichier traité
      if (processedPath !== file.path) {
        fs.unlinkSync(file.path)
        file.path = processedPath
      }
    }

    // Upload vers Cloudinary
    const result = await cloudinaryUpload(file.path, {
      folder: 'baobab',
      resource_type: 'auto',
    })

    // Supprimer le fichier local après upload
    try {
      fs.unlinkSync(file.path)
    } catch (err) {
      logger.error('Erreur lors de la suppression du fichier local', { error: err, filePath: file.path })
    }

    return result
  } catch (error) {
    // En cas d'erreur, retourner l'URL locale
    logger.error('Erreur upload Cloudinary, utilisation du stockage local', { error, filename: file.filename })
    return { url: `/uploads/${file.filename}` }
  }
}

