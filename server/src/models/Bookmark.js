import mongoose from 'mongoose'

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  itemType: {
    type: String,
    enum: ['event', 'figure', 'collection', 'story', 'quiz', 'proverb', 'blog', 'country'],
    required: true,
    index: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['favorite', 'read-later', 'study'],
    default: 'favorite',
    index: true,
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    default: [],
  }],
}, {
  timestamps: true,
})

// Index composé pour éviter les doublons
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true })

// Index pour recherche
bookmarkSchema.index({ user: 1, category: 1, createdAt: -1 })

const Bookmark = mongoose.model('Bookmark', bookmarkSchema)

export default Bookmark

