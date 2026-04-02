import Collection from '../models/Collection.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/collections - Récupérer toutes les collections avec filtres
export const getCollections = catchAsync(async (req, res) => {
  const {
    theme,
    difficulty,
    featured,
    search,
    limit = 20,
    page = 1,
    sort = 'order',
  } = req.query

  const query = { isActive: true }

  if (theme) {
    query.theme = Array.isArray(theme) ? { $in: theme } : theme
  }

  if (difficulty) {
    query.difficulty = difficulty
  }

  if (featured !== undefined) {
    query.isFeatured = featured === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'order' ? { order: 1, views: -1 } : { views: -1 }

  const collections = await Collection.find(query)
    .populate('curator', 'name email')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  // Populate dynamique des items selon leur type
  const populatedCollections = await Promise.all(
    collections.map(async (collection) => {
      const populatedItems = await Promise.all(
        collection.items.map(async (item) => {
          let populatedItem = null
          
          try {
            switch (item.type) {
              case 'country':
                const Country = (await import('../models/Country.js')).default
                populatedItem = await Country.findById(item.itemId).select('nameFr name id color').lean()
                break
              case 'blog':
                const Blog = (await import('../models/Blog.js')).default
                populatedItem = await Blog.findById(item.itemId).select('title image').lean()
                break
              case 'event':
                const TimelineEvent = (await import('../models/TimelineEvent.js')).default
                populatedItem = await TimelineEvent.findById(item.itemId).select('title date shortDescription').lean()
                break
              case 'figure':
                const HistoricalFigure = (await import('../models/HistoricalFigure.js')).default
                populatedItem = await HistoricalFigure.findById(item.itemId).select('name nameNative image').lean()
                break
              case 'story':
                const Story = (await import('../models/Story.js')).default
                populatedItem = await Story.findById(item.itemId).select('title coverImage').lean()
                break
            }
          } catch (error) {
            logger.error('Erreur lors du populate d\'un item', { error: error.message, itemType: item.type })
          }
          
          return {
            ...item,
            itemId: populatedItem || item.itemId,
          }
        })
      )
      
      return {
        ...collection,
        items: populatedItems,
      }
    })
  )

  const total = await Collection.countDocuments(query)

  logger.info('Collections récupérées', { count: populatedCollections.length, filters: query })

  res.json({
    collections: populatedCollections,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/collections/:id - Récupérer une collection spécifique
export const getCollectionById = catchAsync(async (req, res) => {
  const collection = await Collection.findById(req.params.id)
    .populate('curator', 'name email')
    .lean()

  if (!collection || !collection.isActive) {
    return res.status(404).json({ error: 'Collection non trouvée' })
  }

  // Populate dynamique des items selon leur type
  const populatedItems = await Promise.all(
    collection.items.map(async (item) => {
      let populatedItem = null
      
      try {
        switch (item.type) {
          case 'country':
            const Country = (await import('../models/Country.js')).default
            populatedItem = await Country.findById(item.itemId).select('nameFr name id color').lean()
            break
          case 'blog':
            const Blog = (await import('../models/Blog.js')).default
            populatedItem = await Blog.findById(item.itemId).select('title image').lean()
            break
          case 'event':
            const TimelineEvent = (await import('../models/TimelineEvent.js')).default
            populatedItem = await TimelineEvent.findById(item.itemId).select('title date shortDescription').lean()
            break
          case 'figure':
            const HistoricalFigure = (await import('../models/HistoricalFigure.js')).default
            populatedItem = await HistoricalFigure.findById(item.itemId).select('name nameNative image').lean()
            break
          case 'story':
            const Story = (await import('../models/Story.js')).default
            populatedItem = await Story.findById(item.itemId).select('title coverImage').lean()
            break
        }
      } catch (error) {
        logger.error('Erreur lors du populate d\'un item', { error: error.message, itemType: item.type })
      }
      
      return {
        ...item,
        itemId: populatedItem || item.itemId,
      }
    })
  )

  collection.items = populatedItems

  if (!collection || !collection.isActive) {
    return res.status(404).json({ error: 'Collection non trouvée' })
  }

  // Incrémenter les vues (utiliser updateOne pour éviter de modifier le document déjà chargé)
  await Collection.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

  logger.info('Collection récupérée', { collectionId: collection._id, title: collection.title })

  res.json(collection)
})

// POST /api/collections - Créer une nouvelle collection (Admin uniquement)
export const createCollection = catchAsync(async (req, res) => {
  const collection = new Collection({
    ...req.body,
    curator: req.user._id,
  })
  await collection.save()

  logger.info('Nouvelle collection créée', { collectionId: collection._id, title: collection.title, userId: req.user._id })

  res.status(201).json(collection)
})

// PUT /api/collections/:id - Mettre à jour une collection (Admin uniquement)
export const updateCollection = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!collection) {
    return res.status(404).json({ error: 'Collection non trouvée' })
  }

  logger.info('Collection mise à jour', { collectionId: collection._id, userId: req.user._id })

  res.json(collection)
})

// DELETE /api/collections/:id - Supprimer une collection (Admin uniquement)
export const deleteCollection = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!collection) {
    return res.status(404).json({ error: 'Collection non trouvée' })
  }

  logger.info('Collection supprimée', { collectionId: collection._id, userId: req.user._id })

  res.json({ message: 'Collection supprimée avec succès' })
})

// POST /api/collections/:id/complete - Marquer une collection comme complétée
export const completeCollection = catchAsync(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(
    req.params.id,
    { $inc: { completions: 1 } },
    { new: true }
  )

  if (!collection) {
    return res.status(404).json({ error: 'Collection non trouvée' })
  }

  logger.info('Collection complétée', { collectionId: collection._id, userId: req.user._id })

  res.json({ completions: collection.completions })
})

