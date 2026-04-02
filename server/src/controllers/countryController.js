import Country from '../models/Country.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/countries - Liste tous les pays
export const getAllCountries = catchAsync(async (req, res) => {
  const { search, sort = 'nameFr' } = req.query

  const query = { isActive: true }

  if (search) {
    query.$or = [
      { nameFr: { $regex: search, $options: 'i' } },
      { capital: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const countries = await Country.find(query)
    .sort(sort)
    .select('-__v')

  res.json(countries)
})

// GET /api/countries/:id - Récupérer un pays
export const getCountryById = catchAsync(async (req, res) => {
  const countryId = req.params.id
  logger.debug('getCountryById appelé', { countryId })
  
  // Chercher le pays - utiliser findById si c'est un ObjectId valide, sinon chercher par id
  let country
  if (countryId.match(/^[0-9a-fA-F]{24}$/)) {
    // C'est un ObjectId MongoDB
    country = await Country.findById(countryId).lean()
  } else {
    // Chercher par le champ id
    country = await Country.findOne({ id: countryId.toUpperCase() }).lean()
  }

  if (!country) {
    logger.warn('Pays non trouvé', { countryId })
    return res.status(404).json({ error: 'Pays non trouvé' })
  }

  logger.debug('Pays trouvé', { countryId: country.id, mongoId: country._id })

  // Incrémenter les vues de manière asynchrone (ne pas bloquer la réponse)
  if (country._id) {
    Country.findByIdAndUpdate(
      country._id,
      { $inc: { views: 1 } },
      { new: false }
    ).catch(err => {
      logger.error('Erreur lors de l\'incrémentation des vues', { error: err, countryId: country._id })
    })
  }

  // Nettoyer les champs internes de Mongoose et créer une copie propre
  const responseData = { ...country }
  delete responseData.__v
  
  res.json(responseData)
})

// POST /api/countries - Créer un pays (Admin)
export const createCountry = catchAsync(async (req, res) => {
  const country = new Country(req.body)
  await country.save()
  logger.info('Pays créé', { countryId: country.id, name: country.nameFr })
  res.status(201).json(country)
})

// PUT /api/countries/:id - Mettre à jour un pays (Admin)
export const updateCountry = catchAsync(async (req, res) => {
  logger.debug('updateCountry appelé', { countryId: req.params.id })
  
  const country = await Country.findOneAndUpdate(
    { $or: [{ _id: req.params.id }, { id: req.params.id.toUpperCase() }] },
    req.body,
    { new: true, runValidators: true }
  ).select('-__v')

  if (!country) {
    logger.warn('Pays non trouvé pour mise à jour', { countryId: req.params.id })
    return res.status(404).json({ error: 'Pays non trouvé' })
  }

  logger.info('Pays mis à jour avec succès', { countryId: country.id })
  res.json(country)
})

// DELETE /api/countries/:id - Supprimer un pays (Admin)
export const deleteCountry = catchAsync(async (req, res) => {
  const country = await Country.findOneAndUpdate(
    { $or: [{ _id: req.params.id }, { id: req.params.id.toUpperCase() }] },
    { isActive: false },
    { new: true }
  )

  if (!country) {
    return res.status(404).json({ error: 'Pays non trouvé' })
  }

  logger.info('Pays désactivé', { countryId: country.id })
  res.json({ message: 'Pays désactivé avec succès' })
})

// POST /api/countries/initialize - Initialiser tous les pays depuis les données statiques (Admin)
export const initializeCountries = catchAsync(async (req, res) => {
  const { countries } = req.body

  if (!Array.isArray(countries) || countries.length === 0) {
    return res.status(400).json({ error: 'Un tableau de pays est requis' })
  }

  let created = 0
  let updated = 0
  const errors = []

  for (const countryData of countries) {
    try {
      const existing = await Country.findOne({ id: countryData.id.toUpperCase() })
      
      if (existing) {
        // Mettre à jour seulement les champs de base, ne pas écraser les sections personnalisées
        await Country.findOneAndUpdate(
          { id: countryData.id.toUpperCase() },
          {
            name: countryData.name || countryData.nameFr,
            nameFr: countryData.nameFr,
            capital: countryData.capital,
            population: countryData.population,
            area: countryData.area,
            languages: countryData.languages || [],
            currency: countryData.currency || '',
            description: countryData.description,
            culture: countryData.culture || '',
            color: countryData.color,
            rites: countryData.rites || [],
            customs: countryData.customs || [],
            foods: countryData.foods || [],
            traditions: countryData.traditions || [],
            festivals: countryData.festivals || [],
            arts: countryData.arts || [],
            // Ne pas écraser customSections, images, pdfs si elles existent
          },
          { new: true }
        )
        updated++
      } else {
        await Country.create({
          id: countryData.id.toUpperCase(),
          name: countryData.name || countryData.nameFr,
          nameFr: countryData.nameFr,
          capital: countryData.capital,
          population: countryData.population,
          area: countryData.area,
          languages: countryData.languages || [],
          currency: countryData.currency || '',
          description: countryData.description,
          culture: countryData.culture || '',
          color: countryData.color,
          rites: countryData.rites || [],
          customs: countryData.customs || [],
          foods: countryData.foods || [],
          traditions: countryData.traditions || [],
          festivals: countryData.festivals || [],
          arts: countryData.arts || [],
          customSections: [],
          images: [],
          pdfs: [],
          views: 0,
          isActive: true,
        })
        created++
      }
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation d\'un pays', { 
        country: countryData.nameFr || countryData.id, 
        error: error.message 
      })
      errors.push({ country: countryData.nameFr || countryData.id, error: error.message })
    }
  }

  logger.info('Initialisation des pays terminée', { created, updated, errors: errors.length })
  res.json({
    message: 'Initialisation terminée',
    created,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  })
})

