import Contribution from '../models/Contribution.js'
import Country from '../models/Country.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

const publicSelect = 'type title content country countryName language period location sourceUrl mediaUrl tags visibility status createdAt submittedBy'

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean)
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  return []
}

const resolveCountry = async (countryValue) => {
  if (!countryValue) return { country: null, countryName: '' }

  const country = await Country.findOne({
    $or: [
      { _id: countryValue.match?.(/^[a-f\d]{24}$/i) ? countryValue : undefined },
      { id: String(countryValue).toUpperCase() },
      { nameFr: new RegExp(`^${String(countryValue).trim()}$`, 'i') },
    ].filter((condition) => Object.values(condition)[0] !== undefined),
  })

  return {
    country: country?._id || null,
    countryName: country?.nameFr || String(countryValue).trim(),
  }
}

export const getContributions = catchAsync(async (req, res) => {
  const { status, type, country, mine, page = 1, limit = 20 } = req.query
  const query = {}

  if (req.user?.role !== 'admin') {
    query.visibility = 'public'
    query.status = 'approved'
  } else if (status && status !== 'all') {
    query.status = status
  }

  if (type) query.type = type
  if (country) query.countryName = new RegExp(String(country), 'i')
  if (mine === 'true' && req.user) query.submittedBy = req.user._id

  const skip = (Number(page) - 1) * Number(limit)
  const [contributions, total] = await Promise.all([
    Contribution.find(query)
      .populate('country', 'id nameFr color')
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(publicSelect),
    Contribution.countDocuments(query),
  ])

  res.json({
    contributions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

export const createContribution = catchAsync(async (req, res) => {
  const { country, tags, ...body } = req.body
  const resolvedCountry = await resolveCountry(country || body.countryName)

  const contribution = await Contribution.create({
    ...body,
    ...resolvedCountry,
    tags: parseTags(tags),
    submittedBy: req.user._id,
    status: 'proposed',
  })

  logger.info('Nouvelle contribution proposée', {
    contributionId: contribution._id,
    type: contribution.type,
    userId: req.user._id,
  })

  res.status(201).json(contribution)
})

export const updateContributionStatus = catchAsync(async (req, res) => {
  const { status, reviewNote = '' } = req.body
  if (!['proposed', 'in-review', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' })
  }

  const contribution = await Contribution.findByIdAndUpdate(
    req.params.id,
    {
      status,
      reviewNote,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('country', 'id nameFr color')
    .populate('submittedBy', 'name')
    .populate('reviewedBy', 'name')

  if (!contribution) {
    return res.status(404).json({ error: 'Contribution non trouvée' })
  }

  logger.info('Contribution modérée', {
    contributionId: contribution._id,
    status,
    adminId: req.user._id,
  })

  res.json(contribution)
})

export const deleteContribution = catchAsync(async (req, res) => {
  const contribution = await Contribution.findByIdAndDelete(req.params.id)
  if (!contribution) {
    return res.status(404).json({ error: 'Contribution non trouvée' })
  }

  res.json({ message: 'Contribution supprimée' })
})
