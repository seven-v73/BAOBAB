import mongoose from 'mongoose'

const communityPostSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null, // null pour les posts généraux
    index: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  video: {
    type: String,
    default: '',
  },
  pdf: {
    type: String,
    default: '',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment',
  }],
  tags: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ['Discussion', 'Question', 'Partage', 'Événement', 'Autre'],
    default: 'Discussion',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index pour les requêtes fréquentes
communityPostSchema.index({ community: 1, createdAt: -1 })
communityPostSchema.index({ community: 1, isPinned: -1, createdAt: -1 })
communityPostSchema.index({ author: 1, createdAt: -1 })
communityPostSchema.index({ category: 1, createdAt: -1 })
communityPostSchema.index({ isPinned: -1, createdAt: -1 })
communityPostSchema.index({ isApproved: 1, community: 1 })
communityPostSchema.index({ 'likes': 1 })

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema)

export default CommunityPost

