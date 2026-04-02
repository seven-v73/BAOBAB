import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema({
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
  coverImage: {
    type: String,
    default: '',
  },
  theme: [{
    type: String,
    enum: ['Empires', 'Commerce', 'Art', 'Religion', 'Guerre', 'Innovation', 'Culture', 'Géographie', 'Personnages', 'Événements'],
    default: [],
    index: true,
  }],
  items: [{
    type: {
      type: String,
      enum: ['country', 'blog', 'event', 'figure', 'story'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.type',
    },
    order: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  }],
  curator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    index: true,
  },
  estimatedTime: {
    type: Number,
    default: 0, // Temps de lecture en minutes
  },
  order: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    default: [],
  }],
  views: {
    type: Number,
    default: 0,
  },
  completions: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Index pour recherche
collectionSchema.index({ title: 'text', description: 'text', shortDescription: 'text' })
collectionSchema.index({ theme: 1, difficulty: 1 })
collectionSchema.index({ isFeatured: 1, views: -1 })
collectionSchema.index({ isActive: 1, order: 1 })

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection

