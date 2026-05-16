import Stripe from 'stripe'
import Order from '../models/Order.js'
import env from '../config/env.js'
import logger from '../utils/logger.js'
import { AppError } from '../utils/errorHandler.js'
import { catchAsync } from '../utils/errorHandler.js'

// Initialiser Stripe
let stripe = null
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
  logger.info('💳 Stripe configuré')
} else {
  logger.warn('⚠️  Stripe non configuré - les paiements ne fonctionneront pas')
}

/**
 * Créer un Payment Intent Stripe
 * POST /api/payments/create-intent
 */
export const createPaymentIntent = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe non configuré', 500))
  }

  const { orderId, amount, currency = 'eur' } = req.body

  if (!orderId || !amount) {
    return next(new AppError('orderId et amount requis', 400))
  }

  // Vérifier que la commande existe et appartient à l'utilisateur
  const order = await Order.findById(orderId)
  if (!order) {
    return next(new AppError('Commande non trouvée', 404))
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Accès refusé', 403))
  }

  // Vérifier que le montant correspond
  if (Math.abs(order.total - amount) > 0.01) {
    return next(new AppError('Le montant ne correspond pas à la commande', 400))
  }

  try {
    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId.toString(),
        userId: req.user._id.toString(),
        orderNumber: order.orderNumber,
      },
      description: `Commande ${order.orderNumber} - MonBaobab`,
    })

    // Mettre à jour la commande avec le paymentIntentId
    order.paymentIntentId = paymentIntent.id
    await order.save()

    logger.info('Payment Intent créé', {
      paymentIntentId: paymentIntent.id,
      orderId: orderId.toString(),
      amount,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    logger.error('Erreur lors de la création du Payment Intent:', error)
    return next(new AppError('Erreur lors de la création du paiement', 500))
  }
})

/**
 * Webhook Stripe pour confirmer les paiements
 * POST /api/payments/webhook
 */
export const handleStripeWebhook = catchAsync(async (req, res) => {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook non configuré' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    logger.error('Erreur webhook Stripe:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Gérer les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      await handlePaymentSuccess(paymentIntent)
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      await handlePaymentFailure(failedPayment)
      break

    default:
      logger.info(`Événement Stripe non géré: ${event.type}`)
  }

  res.json({ received: true })
})

/**
 * Gérer un paiement réussi
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId
    const order = await Order.findById(orderId)

    if (!order) {
      logger.error('Commande non trouvée pour le paiement:', orderId)
      return
    }

    // Mettre à jour le statut de paiement et de commande
    order.paymentStatus = 'paid'
    order.status = 'confirmed'
    await order.save()

    logger.info('Paiement confirmé', {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      paymentIntentId: paymentIntent.id,
    })

    // L'email de confirmation sera envoyé par le contrôleur de commande
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement réussi:', error)
  }
}

/**
 * Gérer un paiement échoué
 */
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId
    const order = await Order.findById(orderId)

    if (!order) {
      logger.error('Commande non trouvée pour le paiement échoué:', orderId)
      return
    }

    order.paymentStatus = 'failed'
    await order.save()

    logger.warn('Paiement échoué', {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement échoué:', error)
  }
}

/**
 * Rembourser une commande
 * POST /api/payments/refund/:orderId
 */
export const refundOrder = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe non configuré', 500))
  }

  const { orderId } = req.params
  const order = await Order.findById(orderId)

  if (!order) {
    return next(new AppError('Commande non trouvée', 404))
  }

  // Vérifier les permissions (admin ou propriétaire)
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Accès refusé', 403))
  }

  if (!order.paymentIntentId) {
    return next(new AppError('Aucun paiement associé à cette commande', 400))
  }

  if (order.paymentStatus === 'refunded') {
    return next(new AppError('Commande déjà remboursée', 400))
  }

  try {
    // Créer le remboursement
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: Math.round(order.total * 100), // En centimes
    })

    // Mettre à jour la commande
    order.paymentStatus = 'refunded'
    order.status = 'refunded'
    await order.save()

    logger.info('Remboursement effectué', {
      orderId: order._id.toString(),
      refundId: refund.id,
    })

    res.json({
      message: 'Remboursement effectué',
      refund,
      order,
    })
  } catch (error) {
    logger.error('Erreur lors du remboursement:', error)
    return next(new AppError('Erreur lors du remboursement', 500))
  }
})

