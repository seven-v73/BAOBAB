import Bookmark from '../models/Bookmark.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/bookmarks - Récupérer tous les favoris de l'utilisateur
export const getBookmarks = catchAsync(async (req, res) => {
  const { category, itemType, page = 1, limit = 20 } = req.query
  const userId = req.user._id

  const query = { user: userId }
  
  if (category) {
    query.category = category
  }
  
  if (itemType) {
    query.itemType = itemType
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  
  const bookmarks = await Bookmark.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean()

  const total = await Bookmark.countDocuments(query)

  logger.info('Favoris récupérés', { userId, count: bookmarks.length })

  res.json({
    data: bookmarks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// POST /api/bookmarks - Créer un favori
export const createBookmark = catchAsync(async (req, res) => {
  const { itemType, itemId, category = 'favorite', notes, tags } = req.body
  const userId = req.user._id

  // Vérifier si le favori existe déjà
  const existing = await Bookmark.findOne({
    user: userId,
    itemType,
    itemId,
  })

  if (existing) {
    return res.status(400).json({ error: 'Ce contenu est déjà dans vos favoris' })
  }

  const bookmark = new Bookmark({
    user: userId,
    itemType,
    itemId,
    category,
    notes: notes || '',
    tags: tags || [],
  })

  await bookmark.save()

  logger.info('Favori créé', { userId, itemType, itemId })

  res.status(201).json(bookmark)
})

// DELETE /api/bookmarks/:id - Supprimer un favori
export const deleteBookmark = catchAsync(async (req, res) => {
  const bookmark = await Bookmark.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!bookmark) {
    return res.status(404).json({ error: 'Favori non trouvé' })
  }

  await bookmark.deleteOne()

  logger.info('Favori supprimé', { userId: req.user._id, bookmarkId: req.params.id })

  res.json({ message: 'Favori supprimé avec succès' })
})

// DELETE /api/bookmarks/item/:itemType/:itemId - Supprimer un favori par item
export const deleteBookmarkByItem = catchAsync(async (req, res) => {
  const { itemType, itemId } = req.params
  const userId = req.user._id

  const bookmark = await Bookmark.findOneAndDelete({
    user: userId,
    itemType,
    itemId,
  })

  if (!bookmark) {
    return res.status(404).json({ error: 'Favori non trouvé' })
  }

  logger.info('Favori supprimé par item', { userId, itemType, itemId })

  res.json({ message: 'Favori supprimé avec succès' })
})

// PUT /api/bookmarks/:id - Mettre à jour un favori
export const updateBookmark = catchAsync(async (req, res) => {
  const { category, notes, tags } = req.body
  const userId = req.user._id

  const bookmark = await Bookmark.findOne({
    _id: req.params.id,
    user: userId,
  })

  if (!bookmark) {
    return res.status(404).json({ error: 'Favori non trouvé' })
  }

  if (category) bookmark.category = category
  if (notes !== undefined) bookmark.notes = notes
  if (tags) bookmark.tags = tags

  await bookmark.save()

  logger.info('Favori mis à jour', { userId, bookmarkId: req.params.id })

  res.json(bookmark)
})

// GET /api/bookmarks/check/:itemType/:itemId - Vérifier si un contenu est favori
export const checkBookmark = catchAsync(async (req, res) => {
  const { itemType, itemId } = req.params
  const userId = req.user._id

  const bookmark = await Bookmark.findOne({
    user: userId,
    itemType,
    itemId,
  })

  res.json({ isBookmarked: !!bookmark, bookmark: bookmark || null })
})

