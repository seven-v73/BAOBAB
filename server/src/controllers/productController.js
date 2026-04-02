import Product from '../models/Product.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'
import { convertToAllCurrencies } from '../utils/currencyConverter.js'

// GET /api/products - Liste tous les produits
export const getAllProducts = catchAsync(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    country,
    minRating,
    sort = '-createdAt',
    page = 1,
    limit = 20,
    featured,
    includeInactive, // Pour les admins
  } = req.query

  // Par défaut, ne montrer que les produits actifs
  // Les admins peuvent voir tous les produits avec includeInactive=true
  const query = {}
  if (includeInactive !== 'true' && req.user?.role !== 'admin') {
    query.isActive = true
  }

  // Filtres
  if (category) query.category = category
  if (featured === 'true') query.isFeatured = true
  if (country) query.country = country
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }
  if (minRating) {
    query['rating.average'] = { $gte: Number(minRating) }
  }
  if (search) {
    query.$text = { $search: search }
  }

  // Gestion du tri
  let sortOption = sort
  if (sort === 'price-asc') sortOption = 'price'
  else if (sort === 'price-desc') sortOption = '-price'
  else if (sort === 'popularity') sortOption = '-views'
  else if (sort === 'rating') sortOption = '-rating.average'
  else if (sort === 'newest') sortOption = '-createdAt'
  else if (sort === 'oldest') sortOption = 'createdAt'

  const skip = (Number(page) - 1) * Number(limit)

  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .select('-__v')

  const total = await Product.countDocuments(query)

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

// GET /api/products/:id - Récupérer un produit
export const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews', 'rating comment user createdAt')

  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé' })
  }

  // Incrémenter les vues
  product.views += 1
  await product.save()

  res.json(product)
})

// POST /api/products - Créer un produit
export const createProduct = catchAsync(async (req, res) => {
  const productData = { ...req.body }

  // Normaliser les descriptions - utiliser shortDescription si description est vide ou trop courte
  if (!productData.description || productData.description.trim().length < 3) {
    if (productData.shortDescription && productData.shortDescription.trim().length >= 3) {
      productData.description = productData.shortDescription.trim()
    } else if (!productData.description || productData.description.trim().length === 0) {
      productData.description = productData.name || 'Produit sans description'
    }
  }

  // Filtrer les additionalImages pour ne garder que ceux avec un url valide
  if (Array.isArray(productData.additionalImages)) {
    productData.additionalImages = productData.additionalImages.filter(
      img => img && img.url && img.url.trim().length > 0
    )
  }

  // Filtrer les pdfs pour ne garder que ceux avec un url et title valides
  if (Array.isArray(productData.pdfs)) {
    productData.pdfs = productData.pdfs.filter(
      pdf => pdf && pdf.url && pdf.url.trim().length > 0 && pdf.title && pdf.title.trim().length > 0
    )
  }

  // Filtrer les videos pour ne garder que ceux avec un url et title valides
  if (Array.isArray(productData.videos)) {
    productData.videos = productData.videos.filter(
      video => video && video.url && video.url.trim().length > 0 && video.title && video.title.trim().length > 0
    )
  }

  // Filtrer les documents pour ne garder que ceux avec un url et title valides
  if (Array.isArray(productData.documents)) {
    productData.documents = productData.documents.filter(
      doc => doc && doc.url && doc.url.trim().length > 0 && doc.title && doc.title.trim().length > 0
    )
  }

  // Convertir les types si nécessaire
  if (typeof productData.price === 'string') {
    productData.price = parseFloat(productData.price)
  }
  if (typeof productData.stock === 'string') {
    productData.stock = parseInt(productData.stock, 10)
  }
  if (typeof productData.isFeatured === 'string') {
    productData.isFeatured = productData.isFeatured === 'true'
  }

  // Gestion des devises et conversion
  const currency = productData.currency || 'FCFA'
  const basePrice = productData.price || 0

  if (basePrice > 0) {
    // Convertir le prix dans toutes les devises
    const allPrices = convertToAllCurrencies(basePrice, currency)
    productData.prices = {
      FCFA: allPrices.FCFA,
      EUR: allPrices.EUR,
      USD: allPrices.USD,
    }
    // Le prix principal reste dans la devise choisie
    productData.price = allPrices[currency]
  }

  productData.currency = currency

  // Générer SKU si non fourni
  if (!productData.sku) {
    const count = await Product.countDocuments()
    productData.sku = `BAO-PRD-${String(count + 1).padStart(6, '0')}`
  }

  // Par défaut, les produits créés par les utilisateurs ne sont pas actifs
  // L'admin devra les activer après validation
  // Les admins peuvent créer des produits actifs directement
  if (req.user?.role !== 'admin') {
    productData.isActive = false
  } else {
    // Les admins créent des produits actifs par défaut (sauf si explicitement défini à false)
    if (productData.isActive === undefined) {
      productData.isActive = true
    }
  }

  const product = new Product(productData)
  await product.save()

  logger.info('Produit créé', { 
    productId: product._id, 
    name: product.name,
    price: product.price,
    currency: product.currency
  })
  res.status(201).json(product)
})

// PUT /api/products/:id - Mettre à jour un produit (Admin)
export const updateProduct = catchAsync(async (req, res) => {
  const updateData = { ...req.body }

  // Filtrer les additionalImages pour ne garder que ceux avec un url valide
  if (Array.isArray(updateData.additionalImages)) {
    updateData.additionalImages = updateData.additionalImages.filter(
      img => img && img.url && img.url.trim().length > 0
    )
  }

  // Filtrer les pdfs pour ne garder que ceux avec un url et title valides
  if (Array.isArray(updateData.pdfs)) {
    updateData.pdfs = updateData.pdfs.filter(
      pdf => pdf && pdf.url && pdf.url.trim().length > 0 && pdf.title && pdf.title.trim().length > 0
    )
  }

  // Filtrer les videos pour ne garder que ceux avec un url et title valides
  if (Array.isArray(updateData.videos)) {
    updateData.videos = updateData.videos.filter(
      video => video && video.url && video.url.trim().length > 0 && video.title && video.title.trim().length > 0
    )
  }

  // Filtrer les documents pour ne garder que ceux avec un url et title valides
  if (Array.isArray(updateData.documents)) {
    updateData.documents = updateData.documents.filter(
      doc => doc && doc.url && doc.url.trim().length > 0 && doc.title && doc.title.trim().length > 0
    )
  }

  // Convertir les types si nécessaire
  if (typeof updateData.price === 'string') {
    updateData.price = parseFloat(updateData.price)
  }
  if (typeof updateData.stock === 'string') {
    updateData.stock = parseInt(updateData.stock, 10)
  }
  if (typeof updateData.isFeatured === 'string') {
    updateData.isFeatured = updateData.isFeatured === 'true'
  }

  // Gestion des devises si le prix est modifié
  if (updateData.price !== undefined && updateData.price > 0) {
    const currency = updateData.currency || 'FCFA'
    const allPrices = convertToAllCurrencies(updateData.price, currency)
    updateData.prices = {
      FCFA: allPrices.FCFA,
      EUR: allPrices.EUR,
      USD: allPrices.USD,
    }
    updateData.price = allPrices[currency]
    updateData.currency = currency
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )

  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé' })
  }

  logger.info('Produit mis à jour', { productId: product._id })
  res.json(product)
})

// DELETE /api/products/:id - Supprimer un produit (Admin)
export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé' })
  }

  logger.info('Produit désactivé', { productId: product._id })
  res.json({ message: 'Produit désactivé avec succès' })
})

// GET /api/products/categories - Liste des catégories
export const getCategories = catchAsync(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true })
  res.json(categories)
})

// GET /api/products/similar/:id - Produits similaires
export const getSimilarProducts = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
  
  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé' })
  }

  const { limit = 4 } = req.query

  // Trouver des produits similaires par catégorie, pays, ou tags
  const similarProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [
      { category: product.category },
      { country: product.country },
    ],
  })
    .limit(Number(limit))
    .select('name price currency images category rating views')
    .sort('-rating.average -views')

  res.json(similarProducts)
})

// GET /api/products/trending - Produits tendance
export const getTrendingProducts = catchAsync(async (req, res) => {
  const { limit = 10, period = '7d' } = req.query

  // Calculer la date de début selon la période
  const now = new Date()
  let startDate = new Date()
  switch (period) {
    case '24h':
      startDate.setHours(now.getHours() - 24)
      break
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    default:
      startDate.setDate(now.getDate() - 7)
  }

  const trendingProducts = await Product.find({
    isActive: true,
    $or: [
      { createdAt: { $gte: startDate } },
      { views: { $gt: 0 } },
    ],
  })
    .sort({ views: -1, 'rating.average': -1, createdAt: -1 })
    .limit(Number(limit))
    .select('name price currency images category rating views isFeatured')

  res.json(trendingProducts)
})

