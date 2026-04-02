import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  createPaymentIntent,
  handleStripeWebhook,
  refundOrder,
} from '../controllers/paymentController.js'

const router = express.Router()

// Webhook Stripe (pas d'authentification, vérification par signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

// Créer un Payment Intent (utilisateur authentifié)
router.post('/create-intent', authenticate, createPaymentIntent)

// Rembourser une commande (utilisateur ou admin)
router.post('/refund/:orderId', authenticate, refundOrder)

export default router

