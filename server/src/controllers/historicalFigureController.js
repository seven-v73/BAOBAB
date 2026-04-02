import HistoricalFigure from '../models/HistoricalFigure.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { getCountryObjectId } from '../utils/countryHelper.js'

// GET /api/figures - Récupérer toutes les figures historiques avec filtres
export const getHistoricalFigures = catchAsync(async (req, res) => {
  const {
    role,
    country,
    birthYear,
    deathYear,
    verified,
    search,
    limit = 50,
    page = 1,
    sort = 'birthDate',
  } = req.query

  const query = { isActive: true }

  if (role) {
    query.role = Array.isArray(role) ? { $in: role } : role
  }

  if (country) {
    const countryObjectId = await getCountryObjectId(country)
    if (countryObjectId) {
      query['birthPlace.country'] = countryObjectId
    } else {
      // Si le pays n'est pas trouvé, retourner un tableau vide
      return res.json({
        figures: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        },
      })
    }
  }

  if (birthYear) {
    query.birthDate = { $gte: new Date(`${birthYear}-01-01`) }
  }

  if (deathYear) {
    query.deathDate = { $lte: new Date(`${deathYear}-12-31`) }
  }

  if (verified !== undefined) {
    query.verified = verified === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'birthDate' ? { birthDate: 1 } : { views: -1 }

  const figures = await HistoricalFigure.find(query)
    .populate('birthPlace.country', 'nameFr id color')
    .populate('relatedCountries', 'nameFr id')
    .populate('relatedEvents', 'title date')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  const total = await HistoricalFigure.countDocuments(query)

  logger.info('Figures historiques récupérées', { count: figures.length, filters: query })

  res.json({
    figures,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/figures/:id - Récupérer une figure spécifique
export const getHistoricalFigureById = catchAsync(async (req, res) => {
  const figure = await HistoricalFigure.findById(req.params.id)
    .populate('birthPlace.country', 'nameFr id color')
    .populate('relatedCountries', 'nameFr id')
    .populate('relatedEvents', 'title date shortDescription')
    .populate('sources')
    .populate('verifiedBy', 'name email')

  if (!figure || !figure.isActive) {
    return res.status(404).json({ error: 'Figure historique non trouvée' })
  }

  // Incrémenter les vues
  figure.views += 1
  await figure.save()

  logger.info('Figure historique récupérée', { figureId: figure._id, name: figure.name })

  res.json(figure)
})

// POST /api/figures - Créer une nouvelle figure (Admin uniquement)
export const createHistoricalFigure = catchAsync(async (req, res) => {
  const figure = new HistoricalFigure(req.body)
  await figure.save()

  logger.info('Nouvelle figure historique créée', { figureId: figure._id, name: figure.name, userId: req.user._id })

  res.status(201).json(figure)
})

// PUT /api/figures/:id - Mettre à jour une figure (Admin uniquement)
export const updateHistoricalFigure = catchAsync(async (req, res) => {
  const figure = await HistoricalFigure.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!figure) {
    return res.status(404).json({ error: 'Figure historique non trouvée' })
  }

  logger.info('Figure historique mise à jour', { figureId: figure._id, userId: req.user._id })

  res.json(figure)
})

// DELETE /api/figures/:id - Supprimer une figure (Admin uniquement)
export const deleteHistoricalFigure = catchAsync(async (req, res) => {
  const figure = await HistoricalFigure.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!figure) {
    return res.status(404).json({ error: 'Figure historique non trouvée' })
  }

  logger.info('Figure historique supprimée', { figureId: figure._id, userId: req.user._id })

  res.json({ message: 'Figure historique supprimée avec succès' })
})

