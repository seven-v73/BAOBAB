import mongoose from 'mongoose'

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  name: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

// Index (email a déjà un index unique via unique: true)
newsletterSchema.index({ isActive: 1 })

const Newsletter = mongoose.model('Newsletter', newsletterSchema)

export default Newsletter

