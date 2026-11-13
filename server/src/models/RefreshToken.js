import mongoose from 'mongoose'

/**
 * Une session = un appareil connecté.
 * `token` contient l'empreinte SHA-256 du refresh token (jamais le jeton lui-même) ;
 * les sessions créées avant cette version stockaient le jeton en clair et restent reconnues.
 */
const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // suppression automatique à expiration
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  revokedReason: {
    type: String,
    default: '',
  },
  // Empreinte du jeton qui l'a remplacé lors de la rotation (tolérance aux requêtes simultanées)
  replacedBy: {
    type: String,
    default: null,
  },
  // Date de première connexion de la session (conservée d'une rotation à l'autre)
  sessionStartedAt: {
    type: Date,
    default: Date.now,
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

refreshTokenSchema.index({ user: 1, revokedAt: 1 })

refreshTokenSchema.methods.isValid = function isValid() {
  return !this.revokedAt && this.expiresAt > new Date()
}

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)

export default RefreshToken
