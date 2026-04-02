import mongoose from 'mongoose'

const communityMemberSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'moderator', 'member'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'banned', 'left'],
    default: 'active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Index composé pour éviter les doublons
communityMemberSchema.index({ community: 1, user: 1 }, { unique: true })
communityMemberSchema.index({ user: 1, status: 1 })
communityMemberSchema.index({ community: 1, role: 1 })
communityMemberSchema.index({ community: 1, status: 1 })

const CommunityMember = mongoose.model('CommunityMember', communityMemberSchema)

export default CommunityMember

