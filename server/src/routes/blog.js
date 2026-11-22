import express from 'express'
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  reviewBlog,
  deleteBlog,
} from '../controllers/blogController.js'
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js'
import { validateBlog, validateMongoId, validateIdOrSlug } from '../middleware/validation.js'

const router = express.Router()

// Lecture publique (articles publiés) ; l'auteur et l'admin voient aussi les textes non publiés
router.get('/', optionalAuthenticate, getAllBlogs)
router.get('/:id', optionalAuthenticate, validateIdOrSlug, getBlogById)

// Écriture : tout membre connecté peut proposer un texte (modéré avant publication)
router.post('/', authenticate, validateBlog, createBlog)

// Modification / suppression : auteur (texte non publié) ou admin — contrôlé dans le contrôleur
router.put('/:id', authenticate, validateMongoId, validateBlog, updateBlog)
router.delete('/:id', authenticate, validateMongoId, deleteBlog)

// Modération (admin)
router.patch('/:id/review', authenticate, authorize('admin'), validateMongoId, reviewBlog)

export default router
