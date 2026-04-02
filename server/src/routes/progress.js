import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  getProgress,
  recordActivity,
  getLeaderboard,
} from '../controllers/progressController.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authenticate)

router.get('/', getProgress)
router.post('/activity', recordActivity)
router.get('/leaderboard', getLeaderboard)

export default router

