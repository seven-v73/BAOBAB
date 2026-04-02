import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
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
    ref: 'Comment',
    default: null, // Pour les réponses
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
})

// Index
commentSchema.index({ blog: 1, createdAt: -1 })
commentSchema.index({ parent: 1 })

const Comment = mongoose.model('Comment', commentSchema)

export default Comment

