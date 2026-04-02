import mongoose from 'mongoose'

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // index: true supprimé car on crée l'index manuellement plus bas
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    required: true,
    default: 'public',
  },
  culture: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    allowMemberPosts: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    allowInvitations: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
})

// Index pour les requêtes fréquentes
communitySchema.index({ type: 1, createdAt: -1 })
communitySchema.index({ creator: 1 })
communitySchema.index({ culture: 1, type: 1 })
communitySchema.index({ name: 'text', description: 'text' })
communitySchema.index({ isActive: 1, type: 1, createdAt: -1 })

const Community = mongoose.model('Community', communitySchema)

export default Community

