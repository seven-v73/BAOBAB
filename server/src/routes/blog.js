import express from 'express'
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateBlog, validateMongoId } from '../middleware/validation.js'

const router = express.Router()

// GET /api/blog - Récupérer tous les articles
router.get('/', getAllBlogs)

// GET /api/blog/:id - Récupérer un article par ID
router.get('/:id', validateMongoId, getBlogById)

// POST /api/blog - Créer un nouvel article (Utilisateurs authentifiés)
router.post('/', authenticate, validateBlog, createBlog)

// PUT /api/blog/:id - Mettre à jour un article (Admin uniquement)
router.put('/:id', authenticate, authorize('admin'), validateMongoId, validateBlog, updateBlog)

// DELETE /api/blog/:id - Supprimer un article (Admin uniquement)
router.delete('/:id', authenticate, authorize('admin'), validateMongoId, deleteBlog)

export default router
