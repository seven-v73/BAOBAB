import mongoose from 'mongoose'

const historicalFigureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  nameNative: {
    type: String,
    default: '', // Nom dans langue locale
  },
  birthDate: {
    type: Date,
    default: null,
  },
  deathDate: {
    type: Date,
    default: null,
  },
  birthPlace: {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
  },
  deathPlace: {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
  },
  role: [{
    type: String,
    enum: ['Roi/Reine', 'Guerrier', 'Savant', 'Artiste', 'Commerçant', 'Religieux', 'Diplomate', 'Explorateur', 'Innovateur', 'Autre'],
    default: [],
  }],
  achievements: [{
    type: String,
    default: [],
  }],
  biography: {
    type: String,
    required: true,
  },
  shortBiography: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  relatedCountries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimelineEvent',
  }],
  quotes: [{
    text: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  }],
  legacy: {
    type: String,
    default: '',
  },
  culturalImpact: {
    type: String,
    default: '',
  },
  sources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
  }],
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verifiedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [{
    type: String,
    default: [],
  }],
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index pour recherche
historicalFigureSchema.index({ name: 'text', nameNative: 'text', biography: 'text', shortBiography: 'text' })
historicalFigureSchema.index({ 'birthPlace.country': 1 })
historicalFigureSchema.index({ role: 1, verified: 1 })
historicalFigureSchema.index({ birthDate: 1, deathDate: 1 })
historicalFigureSchema.index({ isActive: 1, views: -1 })

const HistoricalFigure = mongoose.model('HistoricalFigure', historicalFigureSchema)

export default HistoricalFigure

