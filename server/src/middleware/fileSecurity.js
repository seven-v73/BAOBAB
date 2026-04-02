import { validateFile, validateFiles } from '../utils/fileValidator.js'
import { logSuspiciousUpload } from '../utils/securityLogger.js'
import { AppError } from '../utils/errorHandler.js'

/**
 * Middleware pour valider les fichiers uploadés avec vérification du magic number
 * @param {string} category - Catégorie du fichier (image, pdf, video, document)
 * @param {string} fieldName - Nom du champ dans le formulaire (défaut: 'file')
 */
export const validateUploadedFile = (category, fieldName = 'file') => {
  return async (req, res, next) => {
    try {
      const file = req.file
      const files = req.files

      // Si un seul fichier
      if (file) {
        const result = await validateFile(file, category)
        if (!result.valid) {
          logSuspiciousUpload(req, file, result.error)
          return next(new AppError(result.error, 400))
        }
      }

      // Si plusieurs fichiers
      if (files && Array.isArray(files)) {
        const result = await validateFiles(files, category)
        if (!result.valid) {
          logSuspiciousUpload(req, files[0], result.errors?.join(', ') || 'Validation failed')
          return next(new AppError('Erreur de validation des fichiers: ' + result.errors?.join(', '), 400))
        }
      }

      // Si fichiers dans un objet (ex: { images: [...], pdfs: [...] })
      if (files && typeof files === 'object' && !Array.isArray(files)) {
        for (const [key, fileArray] of Object.entries(files)) {
          if (Array.isArray(fileArray) && fileArray.length > 0) {
            const result = await validateFiles(fileArray, category)
            if (!result.valid) {
              logSuspiciousUpload(req, fileArray[0], result.errors?.join(', ') || 'Validation failed')
              return next(new AppError('Erreur de validation des fichiers: ' + result.errors?.join(', '), 400))
            }
          }
        }
      }

      next()
    } catch (error) {
      return next(new AppError('Erreur lors de la validation du fichier: ' + error.message, 500))
    }
  }
}

