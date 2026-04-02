import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Prix dans différentes devises (pour conversion)
  prices: {
    FCFA: { type: Number, default: null },
    EUR: { type: Number, default: null },
    USD: { type: Number, default: null },
  },
  currency: {
    type: String,
    enum: ['FCFA', 'EUR', 'USD'],
    default: 'FCFA',
    required: true,
  },
  comparePrice: {
    type: Number,
    default: null, // Prix barré pour promotions
  },
  images: [{
    type: String,
    default: [],
  }],
  // Images additionnelles avec métadonnées
  additionalImages: [{
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
    required: true,
    enum: ['Artisanat', 'Textile', 'Bijoux', 'Cuisine', 'Musique', 'Autre'],
    index: true,
  },
  tags: [{
    type: String,
    default: [],
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  weight: {
    type: Number,
    default: 0, // en grammes
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  country: {
    type: String,
    default: '', // Pays d'origine du produit
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
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  sales: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Index pour recherche full-text
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text', tags: 'text' })

// Index composés pour les requêtes fréquentes
productSchema.index({ category: 1, isActive: 1, isFeatured: 1 })
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 })
productSchema.index({ category: 1, price: 1 })
productSchema.index({ price: 1, stock: 1 })

// Index simples
productSchema.index({ createdAt: -1 })
productSchema.index({ updatedAt: -1 })
productSchema.index({ 'rating.average': -1 })
productSchema.index({ views: -1 })
productSchema.index({ sales: -1 })
// Note: sku a déjà un index unique créé automatiquement par unique: true

const Product = mongoose.model('Product', productSchema)

export default Product

