import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null, // Optionnel, pour vérifier que l'utilisateur a acheté
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    default: [],
  }],
  isVerified: {
    type: Boolean,
    default: false, // Achat vérifié
  },
  isApproved: {
    type: Boolean,
    default: true, // Modération
  },
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
})

// Index
reviewSchema.index({ product: 1, createdAt: -1 })
reviewSchema.index({ user: 1, product: 1 }, { unique: true }) // Un avis par utilisateur par produit

const Review = mongoose.model('Review', reviewSchema)

export default Review

