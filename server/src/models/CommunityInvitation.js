import mongoose from 'mongoose'

const communityInvitationSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
  },
  message: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
  },
}, {
  timestamps: true,
})

// Index
communityInvitationSchema.index({ community: 1, invitee: 1, status: 1 })
communityInvitationSchema.index({ invitee: 1, status: 1 })
communityInvitationSchema.index({ email: 1, status: 1 })
communityInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const CommunityInvitation = mongoose.model('CommunityInvitation', communityInvitationSchema)

export default CommunityInvitation

