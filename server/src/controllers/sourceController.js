import Source from '../models/Source.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/sources - Récupérer toutes les sources avec filtres
export const getSources = catchAsync(async (req, res) => {
  const {
    type,
    language,
    year,
    minReliability,
    search,
    limit = 50,
    page = 1,
    sort = 'citations',
  } = req.query

  const query = { isActive: true }

  if (type) {
    query.type = type
  }

  if (language) {
    query.language = language
  }

  if (year) {
    query.year = parseInt(year)
  }

  if (minReliability) {
    query.reliability = { $gte: parseInt(minReliability) }
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'citations' ? { citations: -1 } : { year: -1 }

  const sources = await Source.find(query)
    .populate('relatedCountries', 'nameFr id')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  const total = await Source.countDocuments(query)

  logger.info('Sources récupérées', { count: sources.length, filters: query })

  res.json({
    sources,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/sources/:id - Récupérer une source spécifique
export const getSourceById = catchAsync(async (req, res) => {
  const source = await Source.findById(req.params.id)
    .populate('relatedCountries', 'nameFr id')
    .populate('verifiedBy', 'name email')

  if (!source || !source.isActive) {
    return res.status(404).json({ error: 'Source non trouvée' })
  }

  logger.info('Source récupérée', { sourceId: source._id, title: source.title })

  res.json(source)
})

// POST /api/sources - Créer une nouvelle source (Admin uniquement)
export const createSource = catchAsync(async (req, res) => {
  const source = new Source(req.body)
  await source.save()

  logger.info('Nouvelle source créée', { sourceId: source._id, title: source.title, userId: req.user._id })

  res.status(201).json(source)
})

// PUT /api/sources/:id - Mettre à jour une source (Admin uniquement)
export const updateSource = catchAsync(async (req, res) => {
  const source = await Source.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!source) {
    return res.status(404).json({ error: 'Source non trouvée' })
  }

  logger.info('Source mise à jour', { sourceId: source._id, userId: req.user._id })

  res.json(source)
})

// DELETE /api/sources/:id - Supprimer une source (Admin uniquement)
export const deleteSource = catchAsync(async (req, res) => {
  const source = await Source.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!source) {
    return res.status(404).json({ error: 'Source non trouvée' })
  }

  logger.info('Source supprimée', { sourceId: source._id, userId: req.user._id })

  res.json({ message: 'Source supprimée avec succès' })
})

// POST /api/sources/:id/cite - Incrémenter le compteur de citations
export const citeSource = catchAsync(async (req, res) => {
  const source = await Source.findByIdAndUpdate(
    req.params.id,
    { $inc: { citations: 1 } },
    { new: true }
  )

  if (!source) {
    return res.status(404).json({ error: 'Source non trouvée' })
  }

  res.json({ citations: source.citations })
})

