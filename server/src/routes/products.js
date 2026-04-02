import express from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSimilarProducts,
  getTrendingProducts,
} from '../controllers/productController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateProduct, validateProductUpdate, validateMongoId, validatePagination, validatePriceRange } from '../middleware/validation.js'

const router = express.Router()

// Routes publiques
router.get('/', validatePagination, validatePriceRange, getAllProducts)
router.get('/categories', getCategories)
router.get('/trending', getTrendingProducts)
router.get('/similar/:id', validateMongoId, getSimilarProducts)
router.get('/:id', validateMongoId, getProductById)

// Routes protégées
// POST - Créer un produit (Utilisateurs authentifiés)
router.post('/', authenticate, validateProduct, createProduct)
// PUT - Mettre à jour un produit (Admin uniquement) - Validation partielle pour permettre les mises à jour de champs individuels
router.put('/:id', authenticate, authorize('admin'), validateMongoId, validateProductUpdate, updateProduct)
// DELETE - Supprimer un produit (Admin uniquement)
router.delete('/:id', authenticate, authorize('admin'), validateMongoId, deleteProduct)

export default router

