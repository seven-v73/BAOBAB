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
  // Compte de l'auteur (contributions de la communauté)
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  // « savoir » : article documenté (références obligatoires pour la communauté)
  // « temoignage » : récit d'expérience personnelle, présenté comme tel
  kind: {
    type: String,
    enum: ['savoir', 'temoignage'],
    default: 'savoir',
  },
  // Cycle de modération. `published` reste le champ de visibilité, synchronisé ci-dessous.
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'published',
    index: true,
  },
  reviewNote: {
    type: String,
    default: '',
  },
  // Références citées dans l'article (bibliographie)
  references: [{
    title: { type: String, required: true, trim: true, maxlength: 300 },
    author: { type: String, default: '', trim: true, maxlength: 200 },
    publisher: { type: String, default: '', trim: true, maxlength: 200 },
    year: { type: Number, default: null },
    url: { type: String, default: '', trim: true, maxlength: 600 },
    note: { type: String, default: '', trim: true, maxlength: 300 },
  }],
  // Pays principal concerné (code ISO, facultatif)
  country: {
    type: String,
    default: '',
    uppercase: true,
    trim: true,
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
    enum: ['Histoire', 'Culture', 'Géographie', 'Économie', 'Politique', 'Société', 'Arts', 'Cuisine', 'Langues', 'Autre'],
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

// La visibilité publique découle du statut de modération
blogSchema.pre('save', function syncPublished(next) {
  if (this.isModified('status') || this.isNew) {
    this.published = this.status === 'published'
  }
  next()
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

