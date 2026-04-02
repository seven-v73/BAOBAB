import mongoose from 'mongoose'

const sourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['book', 'article', 'document', 'archive', 'testimony', 'museum', 'video', 'website'],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  author: {
    type: String,
    default: '',
    index: true,
  },
  publisher: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    default: null,
    index: true,
  },
  isbn: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  archiveLocation: {
    type: String,
    default: '', // Pour documents d'archives
  },
  language: {
    type: String,
    default: 'fr',
    index: true,
  },
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  reliability: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
    index: true,
  },
  citations: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  abstract: {
    type: String,
    default: '',
  },
  keywords: [{
    type: String,
    default: [],
  }],
  relatedCountries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
  }],
  relatedTopics: [{
    type: String,
    default: [],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index pour recherche
sourceSchema.index({ title: 'text', author: 'text', description: 'text', abstract: 'text' })
sourceSchema.index({ type: 1, reliability: -1 })
sourceSchema.index({ year: -1 })
sourceSchema.index({ citations: -1 })

const Source = mongoose.model('Source', sourceSchema)

export default Source

