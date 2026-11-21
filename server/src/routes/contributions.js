import express from 'express'
import {
  createContribution,
  deleteContribution,
  getContributions,
  updateContributionStatus,
} from '../controllers/contributionController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { optionalAuthenticate } from '../middleware/optionalAuth.js'
import { writeLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.get('/', optionalAuthenticate, getContributions)
router.post('/', writeLimiter, authenticate, createContribution)
router.put('/:id/status', authenticate, authorize('admin'), updateContributionStatus)
router.delete('/:id', authenticate, authorize('admin'), deleteContribution)

export default router
