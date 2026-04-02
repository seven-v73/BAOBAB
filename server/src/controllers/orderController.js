import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { validateAndApplyCoupon, incrementCouponUsage } from '../utils/couponHelper.js'
import { sendOrderConfirmation } from '../utils/notifications.js'
import User from '../models/User.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

// POST /api/orders - Créer une commande
export const createOrder = catchAsync(async (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, notes, couponCode } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' })
  }

  // Optimisation: Récupérer tous les produits en une seule requête
  const productIds = items.map(item => item.productId)
  const products = await Product.find({ _id: { $in: productIds } })
  const productMap = new Map(products.map(p => [p._id.toString(), p]))

  // Calculer les totaux
  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || !product.isActive) {
      return res.status(400).json({ error: `Produit ${item.productId} non disponible` })
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` })
    }

    const itemSubtotal = product.price * item.quantity
    subtotal += itemSubtotal

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    })
  }

  // Calculer shipping (exemple: 10€ ou gratuit si > 100€)
  const shipping = subtotal >= 100 ? 0 : 10

  // Appliquer coupon si fourni
  let discount = 0
  let appliedCoupon = null
  if (couponCode) {
    try {
      // Utiliser les produits déjà récupérés au lieu de refaire des requêtes
      const itemsWithCategories = items.map(item => {
        const product = productMap.get(item.productId)
        return {
          productId: item.productId,
          category: product?.category
        }
      })
      
      const couponResult = await validateAndApplyCoupon(
        couponCode,
        subtotal,
        itemsWithCategories,
        req.user._id.toString()
      )
      discount = couponResult.discount
      appliedCoupon = couponResult.coupon
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

    const total = subtotal + shipping - discount

    // Créer la commande
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal,
      shipping,
      discount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'stripe',
      notes,
    })

    await order.save()

    // Incrémenter l'utilisation du coupon si appliqué
    if (appliedCoupon) {
      await incrementCouponUsage(appliedCoupon._id)
    }

    // Mettre à jour le stock des produits
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sales: item.quantity },
      })
    }

    // Envoyer l'email de confirmation
    try {
      const user = await User.findById(req.user._id)
      await sendOrderConfirmation(order, user)
    } catch (emailError) {
      logger.error('Erreur lors de l\'envoi de l\'email de confirmation', { 
        error: emailError, 
        orderId: order._id 
      })
      // Ne pas faire échouer la commande si l'email échoue
    }

    logger.info('Commande créée', { orderId: order._id, userId: req.user._id, total: order.total })
    res.status(201).json(order)
})

// GET /api/orders - Liste des commandes de l'utilisateur
export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product', 'name images')
  
  res.json(orders)
})

// GET /api/orders/:id - Détails d'une commande
export const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images')

  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' })
  }

  // Vérifier que l'utilisateur peut voir cette commande
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  res.json(order)
})

// PUT /api/orders/:id/status - Mettre à jour le statut (Admin)
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, trackingNumber } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' })
  }

  order.status = status
  if (trackingNumber) order.trackingNumber = trackingNumber
  if (status === 'shipped') order.shippedAt = new Date()
  if (status === 'delivered') order.deliveredAt = new Date()

  await order.save()

  logger.info('Statut de commande mis à jour', { orderId: order._id, status })
  res.json(order)
})

// GET /api/orders (Admin) - Toutes les commandes
export const getAllOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query

  const query = {}
  if (status) query.status = status

  const skip = (Number(page) - 1) * Number(limit)

  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'name email')
    .populate('items.product', 'name')

  const total = await Order.countDocuments(query)

  res.json({
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

