import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // unique: true crée automatiquement un index
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Suppression automatique après expiration
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
})

// Index pour améliorer les performances
// Note: token a déjà un index unique créé automatiquement par unique: true
refreshTokenSchema.index({ user: 1 })

// Méthode pour vérifier si le token est valide
refreshTokenSchema.methods.isValid = function() {
  return !this.revokedAt && this.expiresAt > new Date()
}

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)

export default RefreshToken

