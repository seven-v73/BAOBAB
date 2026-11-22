import Proverb from '../models/Proverb.js'
import Country from '../models/Country.js'
import { catchAsync, AppError } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'
import { getCountryObjectId } from '../utils/countryHelper.js'
import { findByIdOrSlug } from '../utils/slug.js'
import { safeRegExp } from '../utils/regex.js'

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
    query.countryName = safeRegExp(String(countryName), { fold: true })
  }

  if (category) {
    query.category = category
  }

  if (language) {
    query.language = safeRegExp(String(language), { fold: true })
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

  const proverb = await findByIdOrSlug(Proverb, id).populate('country', 'name nameFr id').lean()

  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }

  // Vues : incrément atomique, sans réécrire le document
  await Proverb.updateOne({ _id: proverb._id }, { $inc: { views: 1 } })

  // Autres proverbes du même pays, pour continuer la lecture
  const related = await Proverb.find({ _id: { $ne: proverb._id }, countryName: proverb.countryName })
    .sort({ _id: 1 })
    .limit(4)
    .select('text slug language countryName explanation')
    .lean()

  res.json({
    success: true,
    data: { ...proverb, likedBy: undefined },
    related,
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

// Proverbe du jour : le même pour tout le monde, toute la journée.
// La journée est celle de Dakar, Abidjan, Bamako ou Ouagadougou (heure GMT, sans changement d'heure).
// Le tirage ne dépend que de la date et des proverbes présents avant minuit : un proverbe ajouté
// dans la journée ne change pas celui du jour, il entre en jeu le lendemain.
const JOUR_MS = 24 * 60 * 60 * 1000
const PAS = 7919 // nombre premier : parcourt toute la liste avant de revenir au même proverbe

export const choisirIndexDuJour = (numeroDuJour, total) => (total > 0 ? (numeroDuJour * PAS) % total : -1)

export const getProverbeDuJour = catchAsync(async (req, res) => {
  const maintenant = Date.now()
  const numeroDuJour = Math.floor(maintenant / JOUR_MS)
  const debutDuJour = new Date(numeroDuJour * JOUR_MS)

  let candidats = await Proverb.find({ createdAt: { $lt: debutDuJour } }).sort({ _id: 1 }).select('_id').lean()
  if (!candidats.length) candidats = await Proverb.find({}).sort({ _id: 1 }).select('_id').lean()
  const index = choisirIndexDuJour(numeroDuJour, candidats.length)
  if (index < 0) throw new AppError('Aucun proverbe trouvé', 404)

  const proverb = await Proverb.findById(candidats[index]._id).populate('country', 'name nameFr id').lean()
  const secondesRestantes = Math.max(60, Math.floor((debutDuJour.getTime() + JOUR_MS - maintenant) / 1000))
  res.set('Cache-Control', `public, max-age=${Math.min(600, secondesRestantes)}`)
  res.json({ success: true, date: debutDuJour.toISOString().slice(0, 10), data: proverb })
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

  // Un « j'aime » par membre : l'ajout et l'incrément se font en une seule opération atomique
  const updated = await Proverb.findOneAndUpdate(
    { _id: id, likedBy: { $ne: req.user._id } },
    { $addToSet: { likedBy: req.user._id }, $inc: { likes: 1 } },
    { new: true, projection: { likes: 1 } },
  )

  if (updated) {
    return res.json({ success: true, data: { likes: updated.likes, liked: true } })
  }

  const proverb = await Proverb.findById(id).select('likes')
  if (!proverb) {
    throw new AppError('Proverbe non trouvé', 404)
  }
  res.json({ success: true, data: { likes: proverb.likes, liked: true, alreadyLiked: true } })
})

