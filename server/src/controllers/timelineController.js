import TimelineEvent from '../models/TimelineEvent.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { getCountryObjectId } from '../utils/countryHelper.js'

// GET /api/timeline - Récupérer tous les événements avec filtres
export const getTimelineEvents = catchAsync(async (req, res) => {
  const {
    period,
    category,
    country,
    startDate,
    endDate,
    verified,
    search,
    limit = 50,
    page = 1,
    sort = 'date',
  } = req.query

  const query = { isActive: true }

  if (period) {
    query.period = period
  }

  if (category) {
    query.category = Array.isArray(category) ? { $in: category } : category
  }

  if (country) {
    const countryObjectId = await getCountryObjectId(country)
    if (countryObjectId) {
      query['location.country'] = countryObjectId
    } else {
      // Si le pays n'est pas trouvé, retourner un tableau vide
      return res.json({
        events: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0,
        },
      })
    }
  }

  if (startDate || endDate) {
    query.date = {}
    if (startDate) query.date.$gte = new Date(startDate)
    if (endDate) query.date.$lte = new Date(endDate)
  }

  if (verified !== undefined) {
    query.verified = verified === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'date' ? { date: 1 } : { createdAt: -1 }

  const events = await TimelineEvent.find(query)
    .populate('location.country', 'nameFr id color')
    .populate('relatedEvents', 'title date')
    .populate('relatedCountries', 'nameFr id')
    .populate('relatedFigures', 'name nameNative')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  const total = await TimelineEvent.countDocuments(query)

  logger.info('Événements de timeline récupérés', { count: events.length, filters: query })

  res.json({
    events,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/timeline/:id - Récupérer un événement spécifique
export const getTimelineEventById = catchAsync(async (req, res) => {
  const event = await TimelineEvent.findById(req.params.id)
    .populate('location.country', 'nameFr id color')
    .populate('relatedEvents', 'title date shortDescription')
    .populate('relatedCountries', 'nameFr id')
    .populate('relatedFigures', 'name nameNative image')
    .populate('sources.sourceId')
    .populate('contributors.user', 'name email')
    .populate('verifiedBy', 'name email')

  if (!event || !event.isActive) {
    return res.status(404).json({ error: 'Événement non trouvé' })
  }

  // Incrémenter les vues
  event.views += 1
  await event.save()

  logger.info('Événement de timeline récupéré', { eventId: event._id, title: event.title })

  res.json(event)
})

// POST /api/timeline - Créer un nouvel événement (Admin uniquement)
export const createTimelineEvent = catchAsync(async (req, res) => {
  const event = new TimelineEvent(req.body)
  await event.save()

  logger.info('Nouvel événement de timeline créé', { eventId: event._id, title: event.title, userId: req.user._id })

  res.status(201).json(event)
})

// PUT /api/timeline/:id - Mettre à jour un événement (Admin uniquement)
export const updateTimelineEvent = catchAsync(async (req, res) => {
  const event = await TimelineEvent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!event) {
    return res.status(404).json({ error: 'Événement non trouvé' })
  }

  logger.info('Événement de timeline mis à jour', { eventId: event._id, userId: req.user._id })

  res.json(event)
})

// DELETE /api/timeline/:id - Supprimer un événement (Admin uniquement)
export const deleteTimelineEvent = catchAsync(async (req, res) => {
  const event = await TimelineEvent.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!event) {
    return res.status(404).json({ error: 'Événement non trouvé' })
  }

  logger.info('Événement de timeline supprimé', { eventId: event._id, userId: req.user._id })

  res.json({ message: 'Événement supprimé avec succès' })
})

// GET /api/timeline/periods - Récupérer les périodes disponibles
export const getPeriods = catchAsync(async (req, res) => {
  const periods = await TimelineEvent.distinct('period', { isActive: true })
  res.json({ periods })
})

// GET /api/timeline/categories - Récupérer les catégories disponibles
export const getCategories = catchAsync(async (req, res) => {
  const categories = await TimelineEvent.distinct('category', { isActive: true })
  res.json({ categories })
})

