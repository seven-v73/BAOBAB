import Proverb from '../models/Proverb.js'
import Country from '../models/Country.js'
import { catchAsync, AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { getCountryObjectId } from '../utils/countryHelper.js'

// Récupérer tous les proverbes avec filtres
export const getAllProverbs = catchAsync(async (req, res) => {
  const {
    country,
    countryName,
    category,
    language,
    search,
    isFeatured,
    isVerified,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query

  const query = {}

  if (country) {
    const countryObjectId = await getCountryObjectId(country)
    if (countryObjectId) {
      query.country = countryObjectId
    } else {
      // Si le pays n'est pas trouvé, retourner un tableau vide
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      })
    }
  }

  if (countryName) {
    query.countryName = { $regex: countryName, $options: 'i' }
  }

  if (category) {
    query.category = category
  }

  if (language) {
    query.language = { $regex: language, $options: 'i' }
  }

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true'
  }

  if (isVerified !== undefined) {
    query.isVerified = isVerified === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const [proverbs, total] = await Promise.all([
    Proverb.find(query)
      .populate('country', 'name nameFr id')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Proverb.countDocuments(query),
  ])

  res.json({
    success: true,
    data: proverbs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// Récupérer un proverbe par ID
export const getProverbById = catchAsync(async (req, res) => {
  const { id } = req.params

  const proverb = await Proverb.findById(id).populate('country', 'name nameFr id')

  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }

  // Incrémenter les vues
  proverb.views += 1
  await proverb.save()

  res.json({
    success: true,
    data: proverb,
  })
})

// Créer un nouveau proverbe
export const createProverb = catchAsync(async (req, res) => {
  const { country, ...restData } = req.body

  // Vérifier que le pays existe et récupérer son nom
  const countryDoc = await Country.findById(country)
  if (!countryDoc) {
    throw new AppError('Pays spécifié non trouvé', 400)
  }

  const proverbData = {
    ...restData,
    country,
    countryName: countryDoc.nameFr, // Stocker le nom du pays pour faciliter les recherches
    createdBy: req.user?.id,
  }

  const proverb = await Proverb.create(proverbData)

  await proverb.populate('country', 'name nameFr id')

  logger.info(`Proverbe créé: ${proverb._id} par ${req.user?.email}`)

  res.status(201).json({
    success: true,
    data: proverb,
  })
})

// Mettre à jour un proverbe
export const updateProverb = catchAsync(async (req, res) => {
  const { id } = req.params

  const proverb = await Proverb.findById(id)

  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }

  Object.assign(proverb, req.body, {
    updatedBy: req.user?.id,
  })

  await proverb.save()
  await proverb.populate('country', 'name nameFr id')

  logger.info(`Proverbe mis à jour: ${id} par ${req.user?.email}`)

  res.json({
    success: true,
    data: proverb,
  })
})

// Supprimer un proverbe
export const deleteProverb = catchAsync(async (req, res) => {
  const { id } = req.params

  const proverb = await Proverb.findByIdAndDelete(id)

  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }

  logger.info(`Proverbe supprimé: ${id} par ${req.user?.email}`)

  res.json({
    success: true,
    message: 'Proverbe supprimé avec succès',
  })
})

// Récupérer un proverbe aléatoire
export const getRandomProverb = catchAsync(async (req, res) => {
  const { country, category } = req.query

  const query = {}
  if (country) {
    const countryObjectId = await getCountryObjectId(country)
    if (countryObjectId) {
      query.country = countryObjectId
    } else {
      throw new AppError('Pays non trouvé', 404)
    }
  }
  if (category) {
    query.category = category
  }

  const count = await Proverb.countDocuments(query)
  const random = Math.floor(Math.random() * count)

  const proverb = await Proverb.findOne(query)
    .populate('country', 'name nameFr id')
    .skip(random)
    .lean()

  if (!proverb) {
    throw new AppError('Aucun proverbe trouvé', 404)
  }

  res.json({
    success: true,
    data: proverb,
  })
})

// Liker un proverbe
export const likeProverb = catchAsync(async (req, res) => {
  const { id } = req.params

  const proverb = await Proverb.findById(id)

  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }

  proverb.likes += 1
  await proverb.save()

  res.json({
    success: true,
    data: { likes: proverb.likes },
  })
})

