import express from 'express'
import { searchAll, getSearchSuggestions } from '../controllers/searchController.js'

const router = express.Router()

// GET /api/search - Recherche unifiée
router.get('/', searchAll)

// GET /api/search/suggestions - Suggestions de recherche
router.get('/suggestions', getSearchSuggestions)

export default router

