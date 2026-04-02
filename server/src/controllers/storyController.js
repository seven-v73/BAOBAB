import Story from '../models/Story.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { getCountryObjectId } from '../utils/countryHelper.js'

// GET /api/stories - Récupérer toutes les histoires avec filtres
export const getStories = catchAsync(async (req, res) => {
  const {
    category,
    difficulty,
    country,
    featured,
    search,
    limit = 20,
    page = 1,
    sort = 'createdAt',
  } = req.query

  const query = { published: true }

  if (category) {
    query.category = category
  }

  if (difficulty) {
    query.difficulty = difficulty
  }

  if (country) {
    const countryObjectId = await getCountryObjectId(country)
    if (countryObjectId) {
      query.relatedCountries = countryObjectId
    } else {
      // Si le pays n'est pas trouvé, retourner un tableau vide
      return res.json({
        stories: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        },
      })
    }
  }

  if (featured !== undefined) {
    query.isFeatured = featured === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'createdAt' ? { createdAt: -1 } : { views: -1 }

  const stories = await Story.find(query)
    .populate('relatedCountries', 'nameFr id')
    .populate('relatedEvents', 'title date')
    .populate('relatedFigures', 'name nameNative')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  const total = await Story.countDocuments(query)

  logger.info('Histoires récupérées', { count: stories.length, filters: query })

  res.json({
    stories,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/stories/:id - Récupérer une histoire spécifique
export const getStoryById = catchAsync(async (req, res) => {
  const story = await Story.findById(req.params.id)
    .populate('relatedCountries', 'nameFr id color')
    .populate('relatedEvents', 'title date shortDescription')
    .populate('relatedFigures', 'name nameNative image')

  if (!story || !story.published) {
    return res.status(404).json({ error: 'Histoire non trouvée' })
  }

  // Incrémenter les vues
  story.views += 1
  await story.save()

  logger.info('Histoire récupérée', { storyId: story._id, title: story.title })

  res.json(story)
})

// POST /api/stories - Créer une nouvelle histoire (Admin uniquement)
export const createStory = catchAsync(async (req, res) => {
  const story = new Story(req.body)
  await story.save()

  logger.info('Nouvelle histoire créée', { storyId: story._id, title: story.title, userId: req.user._id })

  res.status(201).json(story)
})

// PUT /api/stories/:id - Mettre à jour une histoire (Admin uniquement)
export const updateStory = catchAsync(async (req, res) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!story) {
    return res.status(404).json({ error: 'Histoire non trouvée' })
  }

  logger.info('Histoire mise à jour', { storyId: story._id, userId: req.user._id })

  res.json(story)
})

// DELETE /api/stories/:id - Supprimer une histoire (Admin uniquement)
export const deleteStory = catchAsync(async (req, res) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    { published: false },
    { new: true }
  )

  if (!story) {
    return res.status(404).json({ error: 'Histoire non trouvée' })
  }

  logger.info('Histoire supprimée', { storyId: story._id, userId: req.user._id })

  res.json({ message: 'Histoire supprimée avec succès' })
})

// POST /api/stories/:id/complete - Marquer une histoire comme complétée
export const completeStory = catchAsync(async (req, res) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    { $inc: { completions: 1 } },
    { new: true }
  )

  if (!story) {
    return res.status(404).json({ error: 'Histoire non trouvée' })
  }

  logger.info('Histoire complétée', { storyId: story._id, userId: req.user._id })

  res.json({ completions: story.completions })
})

