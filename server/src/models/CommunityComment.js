import mongoose from 'mongoose'

const communityCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment',
    default: null, // Pour les réponses
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
})

// Index
communityCommentSchema.index({ post: 1, createdAt: -1 })
communityCommentSchema.index({ parent: 1 })

const CommunityComment = mongoose.model('CommunityComment', communityCommentSchema)

export default CommunityComment

