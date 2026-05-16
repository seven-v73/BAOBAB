import mongoose from 'mongoose'

const proverbSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  translation: {
    type: String,
    default: '',
  },
  explanation: {
    type: String,
    required: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
    index: true,
  },
  countryName: {
    type: String,
    required: true,
    index: true,
  },
  language: {
    type: String,
    default: '',
    // Pas d'index pour éviter les conflits avec MongoDB Text Search
  },
  category: {
    type: String,
    enum: ['Sagesse', 'Famille', 'Travail', 'Nature', 'Relations', 'Spiritualité', 'Autre'],
    default: 'Sagesse',
    index: true,
  },
  tags: [{
    type: String,
    default: [],
  }],
  source: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

// Index pour recherche full-text (sans le champ language pour éviter les conflits avec MongoDB)
proverbSchema.index(
  { text: 'text', translation: 'text', explanation: 'text', tags: 'text' },
  { default_language: 'none', language_override: 'searchLanguage' }
)

// Index composés pour les requêtes fréquentes
proverbSchema.index({ country: 1, category: 1, isFeatured: 1 })
proverbSchema.index({ countryName: 1, isVerified: 1 })

const Proverb = mongoose.model('Proverb', proverbSchema)

export default Proverb
