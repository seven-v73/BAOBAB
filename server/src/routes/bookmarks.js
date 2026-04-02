import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
  deleteBookmarkByItem,
  updateBookmark,
  checkBookmark,
} from '../controllers/bookmarkController.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authenticate)

router.get('/', getBookmarks)
router.post('/', createBookmark)
router.get('/check/:itemType/:itemId', checkBookmark)
router.put('/:id', updateBookmark)
router.delete('/:id', deleteBookmark)
router.delete('/item/:itemType/:itemId', deleteBookmarkByItem)

export default router

