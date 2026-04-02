import { body, param, query, validationResult } from 'express-validator'
import { AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// Middleware pour vérifier les résultats de validation
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }))
    // Logger les erreurs de validation en détail
    logger.warn('Erreurs de validation', {
      errors: errorMessages,
      body: req.body,
      url: req.originalUrl,
      method: req.method
    })
    return next(new AppError('Erreurs de validation', 400, errorMessages))
  }
  next()
}

// Validation pour les blogs
export const validateBlog = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Le contenu doit contenir au moins 10 caractères'),
  body('category')
    .optional()
    .isIn(['Histoire', 'Culture', 'Géographie', 'Économie', 'Politique', 'Autre'])
    .withMessage('Catégorie invalide'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  validate
]

// Validation pour les produits (création complète)
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom doit contenir entre 3 et 200 caractères'),
  body('description')
    .trim()
    .isLength({ min: 3 })
    .withMessage('La description doit contenir au moins 3 caractères'),
  body('shortDescription')
    .optional()
    .trim(),
  body('price')
    .custom((value) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(numValue) || numValue < 0) {
        throw new Error('Le prix doit être un nombre positif')
      }
      return true
    })
    .withMessage('Le prix doit être un nombre positif'),
  body('stock')
    .custom((value) => {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value
      if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
        throw new Error('Le stock doit être un entier positif')
      }
      return true
    })
    .withMessage('Le stock doit être un entier positif'),
  body('category')
    .isIn(['Artisanat', 'Textile', 'Bijoux', 'Cuisine', 'Musique', 'Autre'])
    .withMessage('Catégorie invalide'),
  body('currency')
    .optional()
    .isIn(['FCFA', 'EUR', 'USD'])
    .withMessage('Devise invalide. Doit être FCFA, EUR ou USD'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Les images doivent être un tableau'),
  body('additionalImages')
    .optional()
    .isArray()
    .withMessage('Les images additionnelles doivent être un tableau'),
  body('pdfs')
    .optional()
    .isArray()
    .withMessage('Les PDFs doivent être un tableau'),
  body('videos')
    .optional()
    .isArray()
    .withMessage('Les vidéos doivent être un tableau'),
  body('documents')
    .optional()
    .isArray()
    .withMessage('Les documents doivent être un tableau'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  validate
]

// Validation pour les mises à jour partielles de produits (tous les champs optionnels)
export const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('La description doit contenir au moins 3 caractères'),
  body('shortDescription')
    .optional()
    .trim(),
  body('price')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(numValue) || numValue < 0) {
        throw new Error('Le prix doit être un nombre positif')
      }
      return true
    })
    .withMessage('Le prix doit être un nombre positif'),
  body('stock')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value
      if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
        throw new Error('Le stock doit être un entier positif')
      }
      return true
    })
    .withMessage('Le stock doit être un entier positif'),
  body('category')
    .optional()
    .isIn(['Artisanat', 'Textile', 'Bijoux', 'Cuisine', 'Musique', 'Autre'])
    .withMessage('Catégorie invalide'),
  body('currency')
    .optional()
    .isIn(['FCFA', 'EUR', 'USD'])
    .withMessage('Devise invalide. Doit être FCFA, EUR ou USD'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Les images doivent être un tableau'),
  body('additionalImages')
    .optional()
    .isArray()
    .withMessage('Les images additionnelles doivent être un tableau'),
  body('pdfs')
    .optional()
    .isArray()
    .withMessage('Les PDFs doivent être un tableau'),
  body('videos')
    .optional()
    .isArray()
    .withMessage('Les vidéos doivent être un tableau'),
  body('documents')
    .optional()
    .isArray()
    .withMessage('Les documents doivent être un tableau'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  validate
]

// Validation pour l'authentification
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 12, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 12 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:',.<>?])/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  validate
]

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  validate
]

// Validation pour les IDs MongoDB
export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide'),
  validate
]

// Validation pour les commandes
export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Le panier doit contenir au moins un article'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('ID produit invalide'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La quantité doit être un entier positif'),
  body('shippingAddress')
    .isObject()
    .withMessage('L\'adresse de livraison est requise'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 3 })
    .withMessage('La rue est requise'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('La ville est requise'),
  body('shippingAddress.zipCode')
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Le code postal est invalide'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Le pays est requis'),
  body('couponCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Le code coupon est invalide'),
  validate
]

// Validation pour les utilisateurs
export const validateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .optional()
    .isLength({ min: 12, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 12 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:',.<>?])/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Rôle invalide'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value === '') return true // Permettre les chaînes vides
      // Validation plus flexible pour le téléphone
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      if (phoneRegex.test(value)) return true
      // Accepter aussi les numéros avec espaces et tirets
      const flexibleRegex = /^[\d\s\+\-\(\)\.]{6,20}$/
      return flexibleRegex.test(value)
    })
    .withMessage('Numéro de téléphone invalide'),
  body('address')
    .optional()
    .isObject()
    .withMessage('L\'adresse doit être un objet'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La rue ne doit pas dépasser 200 caractères'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne doit pas dépasser 100 caractères'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Le code postal ne doit pas dépasser 20 caractères'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne doit pas dépasser 100 caractères'),
  body('favorites')
    .optional()
    .isArray()
    .withMessage('Les favoris doivent être un tableau'),
  body('wishlist')
    .optional()
    .isArray()
    .withMessage('La liste de souhaits doit être un tableau'),
  validate
]

// Validation pour les pays
export const validateCountry = [
  body('nameFr')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom français doit contenir entre 2 et 100 caractères'),
  body('capital')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La capitale doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('La description doit contenir au moins 10 caractères'),
  body('population')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La population est invalide'),
  body('area')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La superficie est invalide'),
  validate
]

// Validation pour les query parameters
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La limite doit être entre 1 et 1000'),
  validate
]

// Validation pour les prix
export const validatePriceRange = [
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être un nombre positif'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être un nombre positif'),
  validate
]

// Sanitization améliorée (pour éviter XSS)
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    const sanitizeString = (str, context = 'html') => {
      if (typeof str !== 'string') return str
      
      // Liste des caractères à échapper selon le contexte
      const escapeMap = {
        html: {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;',
          '&': '&amp;'
        },
        js: {
          '\\': '\\\\',
          "'": "\\'",
          '"': '\\"',
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t'
        },
        url: {
          ' ': '%20',
          '<': '%3C',
          '>': '%3E',
          '"': '%22',
          "'": '%27',
          '/': '%2F'
        }
      }

      const map = escapeMap[context] || escapeMap.html
      let sanitized = str

      // Échapper les caractères dangereux
      for (const [char, replacement] of Object.entries(map)) {
        sanitized = sanitized.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
      }

      // Supprimer les scripts et événements inline
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

      return sanitized
    }

    const sanitizeObject = (obj, path = '') => {
      // Champs qui peuvent contenir du HTML (nécessitent un traitement spécial)
      const htmlFields = ['content', 'description', 'excerpt', 'body', 'text', 'html']
      // Champs qui sont des URLs (nécessitent validation)
      const urlFields = ['url', 'image', 'avatar', 'link', 'href', 'src']
      // Champs qui ne doivent jamais être sanitizés (IDs, emails, etc.)
      const skipFields = ['_id', 'id', 'email', 'password', 'token', 'refreshToken']

      if (Array.isArray(obj)) {
        return obj.map((item, index) => 
          typeof item === 'object' && item !== null 
            ? sanitizeObject(item, `${path}[${index}]`) 
            : sanitizeString(item)
        )
      }
      
      if (typeof obj === 'object' && obj !== null) {
        const sanitized = {}
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key
          
          // Ne pas sanitizer certains champs
          if (skipFields.includes(key.toLowerCase())) {
            sanitized[key] = obj[key]
            continue
          }

          if (typeof obj[key] === 'string') {
            // Déterminer le contexte de sanitization
            let context = 'html'
            if (urlFields.some(field => key.toLowerCase().includes(field))) {
              context = 'url'
            } else if (htmlFields.some(field => key.toLowerCase().includes(field))) {
              context = 'html' // Pour les champs HTML, on échappe mais on permet le HTML basique
            }

            sanitized[key] = sanitizeString(obj[key], context)
          } else if (typeof obj[key] === 'object') {
            sanitized[key] = sanitizeObject(obj[key], currentPath)
          } else {
            sanitized[key] = obj[key]
          }
        }
        return sanitized
      }
      
      return sanitizeString(obj)
    }

    req.body = sanitizeObject(req.body)
  }

  // Sanitizer aussi req.query pour les paramètres de requête
  if (req.query && typeof req.query === 'object') {
    const sanitizeQueryValue = (value) => {
      if (typeof value === 'string') {
        return sanitizeString(value, 'url')
      }
      return value
    }

    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeQueryValue(req.query[key])
      }
    }
  }

  next()
}

