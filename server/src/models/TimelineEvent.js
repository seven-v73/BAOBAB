import mongoose from 'mongoose'

const timelineEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    default: null, // Pour les événements sur une période
  },
  period: {
    type: String,
    enum: ['Préhistoire', 'Antiquité', 'Moyen-Âge', 'Période Moderne', 'Époque Contemporaine', 'Autre'],
    default: 'Autre',
    index: true,
  },
  location: {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    region: {
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
  category: [{
    type: String,
    enum: ['Politique', 'Culture', 'Économie', 'Guerre', 'Découverte', 'Art', 'Religion', 'Science', 'Commerce'],
    default: [],
  }],
  sources: [{
    type: {
      type: String,
      enum: ['book', 'article', 'document', 'video', 'museum', 'archive', 'testimony'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      default: null,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
      default: null,
    },
  }],
  images: [{
    type: String,
    default: [],
  }],
  videos: [{
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['youtube', 'vimeo', 'direct'],
      default: 'direct',
    },
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimelineEvent',
  }],
  relatedCountries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
  }],
  relatedFigures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalFigure',
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
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['author', 'reviewer', 'translator', 'researcher'],
      default: 'researcher',
    },
  }],
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
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
timelineEventSchema.index({ title: 'text', description: 'text', shortDescription: 'text' })
timelineEventSchema.index({ date: 1, period: 1 })
timelineEventSchema.index({ 'location.country': 1 })
timelineEventSchema.index({ category: 1, verified: 1 })
timelineEventSchema.index({ isActive: 1, date: -1 })

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema)

export default TimelineEvent

