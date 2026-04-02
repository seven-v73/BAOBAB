import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js'

const router = express.Router()

// Valider un coupon (utilisateur authentifié ou non)
router.post('/validate', validateCoupon)

// Routes admin
router.use(authenticate)
router.use(authorize('admin'))

router.post('/', createCoupon)
router.get('/', getAllCoupons)
router.get('/:id', getCouponById)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)

export default router

