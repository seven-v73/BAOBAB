import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  chapters: [{
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
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
    audio: {
      type: String,
      default: '', // URL de narration audio
    },
    interactiveElements: [{
      type: {
        type: String,
        enum: ['map', 'timeline', 'quiz', 'video', 'image-gallery'],
        required: true,
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      order: {
        type: Number,
        default: 0,
      },
    }],
    order: {
      type: Number,
      required: true,
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
  relatedFigures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalFigure',
  }],
  readingTime: {
    type: Number,
    default: 0, // En minutes
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    index: true,
  },
  tags: [{
    type: String,
    default: [],
  }],
  category: {
    type: String,
    enum: ['Histoire', 'Biographie', 'Légende', 'Épopée', 'Documentaire'],
    default: 'Histoire',
  },
  author: {
    type: String,
    default: 'BAOBAB Team',
  },
  views: {
    type: Number,
    default: 0,
  },
  completions: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: true,
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
})

// Index pour recherche
storySchema.index({ title: 'text', subtitle: 'text', description: 'text' })
storySchema.index({ published: 1, isFeatured: 1, createdAt: -1 })
storySchema.index({ difficulty: 1, category: 1 })
storySchema.index({ 'relatedCountries': 1 })

const Story = mongoose.model('Story', storySchema)

export default Story

