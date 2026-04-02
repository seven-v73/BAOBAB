import express from 'express'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  createPostComment,
  getPostComments,
  likeComment,
} from '../controllers/communityController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateMongoId } from '../middleware/validation.js'

const router = express.Router()

// Routes publiques
router.get('/', getAllPosts)
router.get('/:id', validateMongoId, getPostById)
router.get('/:id/comments', validateMongoId, getPostComments)

// Routes protégées
router.post('/', authenticate, createPost)
router.put('/:id/like', authenticate, validateMongoId, likePost)
router.post('/:id/comments', authenticate, validateMongoId, createPostComment)
router.put('/:id', authenticate, validateMongoId, updatePost)
router.delete('/:id', authenticate, validateMongoId, deletePost)

// Routes pour les commentaires
router.put('/comments/:id/like', authenticate, validateMongoId, likeComment)

export default router

