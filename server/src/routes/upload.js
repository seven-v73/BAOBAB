import express from 'express'
import { upload, uploadPDF, uploadVideo, uploadDocument, uploadToCloudinary } from '../middleware/upload.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { catchAsync } from '../utils/errorHandler.js'
import { AppError } from '../utils/errorHandler.js'
import { processImage } from '../utils/imageProcessor.js'
import logger from '../utils/logger.js'
import env from '../config/env.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Route pour upload d'images (Admin uniquement)
router.post('/image', authenticate, authorize('admin'), upload.single('image'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier uploadé', 400))
  }

  try {
    // Upload vers Cloudinary (qui gère aussi le traitement)
    const cloudinaryResult = await uploadToCloudinary(req.file)
    
    logger.info('Image uploadée', {
      url: cloudinaryResult.url,
      userId: req.user._id
    })
    
    res.json({
      url: cloudinaryResult.url || cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      filename: req.file.originalname,
      size: cloudinaryResult.bytes || req.file.size,
    })
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'image', {
      error: error.message,
      stack: error.stack
    })
    return next(new AppError('Erreur lors du traitement de l\'image', 500))
  }
}))

// Route pour upload de PDFs (Admin uniquement)
router.post('/pdf', authenticate, authorize('admin'), uploadPDF.single('pdf'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier uploadé', 400))
  }

  // Utiliser une URL de base configurée ou construire depuis la requête
  // En production, utiliser une variable d'environnement pour l'URL de base
  let baseUrl = process.env.API_BASE_URL || process.env.BACKEND_URL
  
  if (!baseUrl) {
    // Fallback: construire depuis la requête
    const host = req.get('host')
    const protocol = req.protocol || (req.secure ? 'https' : 'http')
    baseUrl = `${protocol}://${host}`
  }
  
  const pdfUrl = `${baseUrl}/api/upload/uploads/${req.file.filename}`
  
  logger.info('PDF uploadé', {
    filename: req.file.filename,
    size: req.file.size,
    url: pdfUrl,
    userId: req.user._id
  })
  
  res.json({
    url: pdfUrl,
    filename: req.file.filename,
    size: req.file.size,
  })
}))

// Route pour upload de vidéos (Admin uniquement)
router.post('/video', authenticate, authorize('admin'), uploadVideo.single('video'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier uploadé', 400))
  }

  // Utiliser une URL de base configurée ou construire depuis la requête
  let baseUrl = process.env.API_BASE_URL || process.env.BACKEND_URL
  
  if (!baseUrl) {
    // Fallback: construire depuis la requête
    const host = req.get('host')
    const protocol = req.protocol || (req.secure ? 'https' : 'http')
    baseUrl = `${protocol}://${host}`
  }
  
  const videoUrl = `${baseUrl}/api/upload/uploads/${req.file.filename}`
  
  logger.info('Vidéo uploadée', {
    filename: req.file.filename,
    size: req.file.size,
    url: videoUrl,
    userId: req.user._id
  })
  
  res.json({
    url: videoUrl,
    filename: req.file.filename,
    size: req.file.size,
  })
}))

// Route pour upload de documents (Admin uniquement)
router.post('/document', authenticate, authorize('admin'), uploadDocument.single('document'), catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier uploadé', 400))
  }

  // Utiliser une URL de base configurée ou construire depuis la requête
  let baseUrl = process.env.API_BASE_URL || process.env.BACKEND_URL
  
  if (!baseUrl) {
    // Fallback: construire depuis la requête
    const host = req.get('host')
    const protocol = req.protocol || (req.secure ? 'https' : 'http')
    baseUrl = `${protocol}://${host}`
  }
  
  const documentUrl = `${baseUrl}/api/upload/uploads/${req.file.filename}`
  
  logger.info('Document uploadé', {
    filename: req.file.filename,
    size: req.file.size,
    url: documentUrl,
    userId: req.user._id
  })
  
  res.json({
    url: documentUrl,
    filename: req.file.filename,
    size: req.file.size,
  })
}))

// Servir les fichiers uploadés
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

export default router

