import mongoose from 'mongoose'

const twoFactorAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
  },
  backupCodes: [{
    code: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  }],
  enabled: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lastUsed: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

const TwoFactorAuth = mongoose.model('TwoFactorAuth', twoFactorAuthSchema)

export default TwoFactorAuth
