import express from 'express'
import {
  getTimelineEvents,
  getTimelineEventById,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  getPeriods,
  getCategories,
} from '../controllers/timelineController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Routes publiques
router.get('/', getTimelineEvents)
router.get('/periods', getPeriods)
router.get('/categories', getCategories)
router.get('/:id', getTimelineEventById)

// Routes protégées (Admin uniquement)
router.post('/', authenticate, authorize('admin'), createTimelineEvent)
router.put('/:id', authenticate, authorize('admin'), updateTimelineEvent)
router.delete('/:id', authenticate, authorize('admin'), deleteTimelineEvent)

export default router

