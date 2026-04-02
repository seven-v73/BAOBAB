import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/orderController.js'
import { authenticate } from '../middleware/auth.js'
import { authorize } from '../middleware/auth.js'
import { validateOrder, validateMongoId, validatePagination } from '../middleware/validation.js'

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authenticate)

// Routes utilisateur
router.post('/', validateOrder, createOrder)
router.get('/my-orders', getMyOrders)
router.get('/', authorize('admin'), validatePagination, getAllOrders)
router.get('/:id', validateMongoId, getOrderById)

// Routes admin
router.get('/', authorize('admin'), getAllOrders)
router.put('/:id/status', authorize('admin'), updateOrderStatus)

export default router

