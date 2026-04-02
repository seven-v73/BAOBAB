import express from 'express'
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} from '../controllers/quizController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getQuizzes)
router.get('/:id', getQuizById)
router.post('/:id/submit', authenticate, submitQuiz) // Utilisateurs authentifiés peuvent soumettre

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createQuiz)
router.put('/:id', authenticate, authorize('admin'), updateQuiz)
router.delete('/:id', authenticate, authorize('admin'), deleteQuiz)

export default router

