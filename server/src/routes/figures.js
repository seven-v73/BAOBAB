import express from 'express'
import {
  getHistoricalFigures,
  getHistoricalFigureById,
  createHistoricalFigure,
  updateHistoricalFigure,
  deleteHistoricalFigure,
} from '../controllers/historicalFigureController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getHistoricalFigures)
router.get('/:id', getHistoricalFigureById)

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createHistoricalFigure)
router.put('/:id', authenticate, authorize('admin'), updateHistoricalFigure)
router.delete('/:id', authenticate, authorize('admin'), deleteHistoricalFigure)

export default router

