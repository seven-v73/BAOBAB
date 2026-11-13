import mongoose from 'mongoose'

const contributionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['proverb', 'correction', 'source', 'photo', 'family-memory', 'place', 'oral-tradition'],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 8000,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    default: null,
    index: true,
  },
  countryName: {
    type: String,
    default: '',
    trim: true,
  },
  language: {
    type: String,
    default: '',
    trim: true,
  },
  period: {
    type: String,
    default: '',
    trim: true,
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  sourceUrl: {
    type: String,
    default: '',
    trim: true,
  },
  mediaUrl: {
    type: String,
    default: '',
    trim: true,
  },
  tags: [{
    type: String,
    default: [],
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  status: {
    type: String,
    enum: ['proposed', 'in-review', 'approved', 'rejected'],
    default: 'proposed',
    index: true,
  },
  reviewNote: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
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
}, {
  timestamps: true,
})

contributionSchema.index({ title: 'text', content: 'text', countryName: 'text', tags: 'text' })
contributionSchema.index({ status: 1, createdAt: -1 })
contributionSchema.index({ type: 1, status: 1, createdAt: -1 })

const Contribution = mongoose.model('Contribution', contributionSchema)

export default Contribution
