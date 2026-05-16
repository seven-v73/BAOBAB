import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    required: true,
    default: 'MonBaobab Team',
  },
  // Sources pour vérification
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
  image: {
    type: String,
    default: '',
  },
  // Images additionnelles
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  }],
  // Documents PDF
  pdfs: [{
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  }],
  // Vidéos
  videos: [{
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    type: { type: String, enum: ['youtube', 'vimeo', 'direct'], default: 'direct' },
    order: { type: Number, default: 0 },
  }],
  // Autres documents (DOCX, XLSX, etc.)
  documents: [{
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'document' },
    order: { type: Number, default: 0 },
  }],
  category: {
    type: String,
    default: 'Histoire',
    enum: ['Histoire', 'Culture', 'Géographie', 'Économie', 'Politique', 'Autre'],
  },
  tags: {
    type: [String],
    default: [],
  },
  published: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Index pour la recherche full-text
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' })

// Index composés pour les requêtes fréquentes
blogSchema.index({ published: 1, createdAt: -1 })
blogSchema.index({ category: 1, published: 1, createdAt: -1 })
blogSchema.index({ published: 1, views: -1 })

// Index simples
blogSchema.index({ createdAt: -1 })
blogSchema.index({ updatedAt: -1 })
blogSchema.index({ views: -1 })
blogSchema.index({ author: 1 })

const Blog = mongoose.model('Blog', blogSchema)

export default Blog

