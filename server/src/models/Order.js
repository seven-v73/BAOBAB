import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String, // Nom du produit au moment de la commande
  price: Number, // Prix au moment de la commande
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: Number,
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
    default: 'stripe',
  },
  paymentIntentId: {
    type: String,
    default: '',
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    zipCode: String,
    country: String,
    phone: String,
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
  notes: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  shippedAt: Date,
  deliveredAt: Date,
}, {
  timestamps: true,
})

// Générer numéro de commande unique
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `BAO-${Date.now()}-${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Index (orderNumber a déjà un index unique via unique: true)
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1, createdAt: -1 })

const Order = mongoose.model('Order', orderSchema)

export default Order

