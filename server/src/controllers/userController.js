import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/users - Liste tous les utilisateurs (Admin)
export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const query = {}
  if (role) query.role = role
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))

  const total = await User.countDocuments(query)

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

// GET /api/users/:id - Récupérer un utilisateur
export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' })
  }
  res.json(user)
})

// POST /api/users - Créer un utilisateur (Admin uniquement)
export const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' })
  }

  // Créer l'utilisateur
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: role === 'admin' ? 'admin' : 'user',
  })

  await user.save()

  logger.info('Utilisateur créé', { userId: user._id, email: user.email, role: user.role })

  res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

// PUT /api/users/:id - Mettre à jour un utilisateur
export const updateUser = catchAsync(async (req, res) => {
  const { name, role, isActive, phone, address, favorites, wishlist } = req.body
  const userId = req.params.id

  // Vérifier les permissions
  if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  // Un utilisateur non-admin ne peut pas changer son rôle
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Vous ne pouvez pas modifier votre rôle' })
  }

  const updateData = {}
  if (name) updateData.name = name
  if (role && req.user.role === 'admin') updateData.role = role
  if (isActive !== undefined && req.user.role === 'admin') updateData.isActive = isActive
  if (phone !== undefined) updateData.phone = phone
  if (address) updateData.address = address
  if (favorites !== undefined) updateData.favorites = favorites
  if (wishlist !== undefined) updateData.wishlist = wishlist

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
    .populate('favorites', 'name price images')
    .populate('wishlist', 'name price images')
    .select('-password')

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' })
  }

  logger.info('Utilisateur mis à jour', { userId: user._id })
  res.json(user)
})

// DELETE /api/users/:id - Supprimer un utilisateur (Admin)
export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password')

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' })
  }

  logger.info('Utilisateur désactivé', { userId: user._id })
  res.json({ message: 'Utilisateur désactivé avec succès' })
})

// GET /api/users/profile - Profil de l'utilisateur connecté
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favorites', 'name price images')
    .populate('wishlist', 'name price images')
    .select('-password')
  
  res.json(user)
})
