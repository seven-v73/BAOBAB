import express from 'express'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
} from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateUser, validateMongoId, validatePagination } from '../middleware/validation.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authenticate)

// Route pour le profil de l'utilisateur connecté
router.get('/profile', getProfile)

// Routes admin
router.get('/', authorize('admin'), validatePagination, getAllUsers)
router.get('/:id', validateMongoId, getUserById)
router.post('/', authorize('admin'), validateUser, createUser)
router.put('/:id', validateMongoId, validateUser, updateUser)
router.delete('/:id', authorize('admin'), validateMongoId, deleteUser)

export default router
