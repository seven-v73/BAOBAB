import Coupon from '../models/Coupon.js'
import { validateAndApplyCoupon } from '../utils/couponHelper.js'
import { AppError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'

/**
 * Valider un code promo
 * POST /api/coupons/validate
 */
export const validateCoupon = catchAsync(async (req, res, next) => {
  const { code, subtotal, items = [] } = req.body

  if (!code || !subtotal) {
    return next(new AppError('Code et sous-total requis', 400))
  }

  try {
    const { discount, coupon } = await validateAndApplyCoupon(
      code,
      subtotal,
      items,
      req.user?._id?.toString()
    )

    res.json({
      valid: true,
      discount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    })
  } catch (error) {
    res.status(400).json({
      valid: false,
      error: error.message,
    })
  }
})

/**
 * Créer un coupon (Admin)
 * POST /api/coupons
 */
export const createCoupon = catchAsync(async (req, res, next) => {
  const coupon = new Coupon(req.body)
  await coupon.save()

  res.status(201).json(coupon)
})

/**
 * Obtenir tous les coupons (Admin)
 * GET /api/coupons
 */
export const getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt')
  res.json(coupons)
})

/**
 * Obtenir un coupon par ID
 * GET /api/coupons/:id
 */
export const getCouponById = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) {
    return next(new AppError('Coupon non trouvé', 404))
  }
  res.json(coupon)
})

/**
 * Mettre à jour un coupon (Admin)
 * PUT /api/coupons/:id
 */
export const updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!coupon) {
    return next(new AppError('Coupon non trouvé', 404))
  }

  res.json(coupon)
})

/**
 * Supprimer un coupon (Admin)
 * DELETE /api/coupons/:id
 */
export const deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)

  if (!coupon) {
    return next(new AppError('Coupon non trouvé', 404))
  }

  res.json({ message: 'Coupon supprimé' })
})

