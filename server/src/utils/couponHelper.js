import Coupon from '../models/Coupon.js'
import { AppError } from './errorHandler.js'

/**
 * Valide et applique un code promo
 * @param {string} code - Code promo
 * @param {number} subtotal - Sous-total de la commande
 * @param {Array} items - Items de la commande
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} - { discount, coupon }
 */
export const validateAndApplyCoupon = async (code, subtotal, items = [], userId = null) => {
  if (!code) {
    return { discount: 0, coupon: null }
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase().trim(),
    isActive: true 
  })

  if (!coupon) {
    throw new AppError('Code promo invalide', 400)
  }

  // Vérifier les dates
  const now = new Date()
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new AppError('Code promo expiré', 400)
  }

  // Vérifier la limite d'utilisation totale
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('Code promo épuisé', 400)
  }

  // Vérifier le montant minimum d'achat
  if (subtotal < coupon.minPurchase) {
    throw new AppError(`Montant minimum d'achat: ${coupon.minPurchase}€`, 400)
  }

  // Vérifier les catégories
  if (coupon.categories && coupon.categories.length > 0) {
    const itemCategories = items.map(item => item.category).filter(Boolean)
    const hasValidCategory = itemCategories.some(cat => coupon.categories.includes(cat))
    if (!hasValidCategory) {
      throw new AppError('Code promo non applicable à ces produits', 400)
    }
  }

  // Vérifier les produits spécifiques
  if (coupon.products && coupon.products.length > 0) {
    const itemProductIds = items.map(item => item.productId?.toString() || item.product?.toString())
    const hasValidProduct = itemProductIds.some(id => 
      coupon.products.some(p => p.toString() === id)
    )
    if (!hasValidProduct) {
      throw new AppError('Code promo non applicable à ces produits', 400)
    }
  }

  // Calculer la réduction
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100
    // Appliquer le maximum si défini
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value
    // Ne pas dépasser le sous-total
    if (discount > subtotal) {
      discount = subtotal
    }
  }

  return { discount: Math.round(discount * 100) / 100, coupon }
}

/**
 * Incrémente le compteur d'utilisation d'un coupon
 */
export const incrementCouponUsage = async (couponId) => {
  await Coupon.findByIdAndUpdate(couponId, {
    $inc: { usageCount: 1 }
  })
}

