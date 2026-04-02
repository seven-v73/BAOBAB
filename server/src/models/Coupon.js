import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null, // Pour les pourcentages
  },
  categories: [{
    type: String,
    default: [],
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: [],
  }],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // Nombre total d'utilisations
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  userLimit: {
    type: Number,
    default: 1, // Nombre d'utilisations par utilisateur
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index
// Note: code a déjà un index unique via unique: true dans la définition du schéma
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 })

const Coupon = mongoose.model('Coupon', couponSchema)

export default Coupon

