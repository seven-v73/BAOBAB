import express from 'express'
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  initializeCountries,
} from '../controllers/countryController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateCountry, validateMongoId } from '../middleware/validation.js'

const router = express.Router()

// Routes publiques
router.get('/', getAllCountries)
router.get('/:id', getCountryById)

// Routes protégées (Admin)
router.post('/', authenticate, authorize('admin'), validateCountry, createCountry)
router.post('/initialize', authenticate, authorize('admin'), initializeCountries)
router.put('/:id', authenticate, authorize('admin'), validateCountry, updateCountry)
router.delete('/:id', authenticate, authorize('admin'), deleteCountry)

export default router

