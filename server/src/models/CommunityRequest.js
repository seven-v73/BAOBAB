import mongoose from 'mongoose'

const communityRequestSchema = new mongoose.Schema({
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
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['public', 'private'],
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    default: null,
  },
}, {
  timestamps: true,
})

communityRequestSchema.index({ requestedBy: 1, status: 1, createdAt: -1 })
communityRequestSchema.index({ status: 1, createdAt: -1 })
communityRequestSchema.index({ name: 1, status: 1 })

const CommunityRequest = mongoose.model('CommunityRequest', communityRequestSchema)

export default CommunityRequest
