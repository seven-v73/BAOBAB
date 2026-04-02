import Community from '../models/Community.js'
import CommunityMember from '../models/CommunityMember.js'
import CommunityInvitation from '../models/CommunityInvitation.js'
import CommunityPost from '../models/CommunityPost.js'
import User from '../models/User.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/communities - Récupérer toutes les communautés
export const getAllCommunities = catchAsync(async (req, res) => {
  const { type, culture, search, page = 1, limit = 20 } = req.query
  const skip = (page - 1) * limit

  const query = { isActive: true }
  
  if (type) query.type = type
  if (culture) query.culture = { $regex: culture, $options: 'i' }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const communities = await Community.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'name avatar')
    .lean()

  // Ajouter le statut de membre pour l'utilisateur connecté
  const communitiesWithMembership = await Promise.all(
    communities.map(async (community) => {
      let membership = null
      if (req.user) {
        membership = await CommunityMember.findOne({
          community: community._id,
          user: req.user._id,
        }).lean()
      }
      return {
        ...community,
        membership,
      }
    })
  )

  const total = await Community.countDocuments(query)

  res.json({
    communities: communitiesWithMembership,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// GET /api/communities/my - Récupérer mes communautés
export const getMyCommunities = catchAsync(async (req, res) => {
  const memberships = await CommunityMember.find({
    user: req.user._id,
    status: 'active',
  })
    .populate('community')
    .sort({ joinedAt: -1 })

  res.json(memberships.map(m => ({
    ...m.community.toObject(),
    role: m.role,
    joinedAt: m.joinedAt,
  })))
})

// GET /api/communities/:id - Récupérer une communauté par ID
export const getCommunityById = catchAsync(async (req, res) => {
  const community = await Community.findById(req.params.id)
    .populate('creator', 'name avatar email')

  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  // Récupérer le statut de membre (si utilisateur connecté)
  let membership = null
  if (req.user) {
    membership = await CommunityMember.findOne({
      community: community._id,
      user: req.user._id,
    })
  }

  // Si pas de membership mais que l'utilisateur est le créateur, créer un membership virtuel
  const creatorId = community.creator._id?.toString() || community.creator.toString()
  const userId = req.user?._id?.toString() || req.user?.id?.toString()
  const isCreator = req.user && (creatorId === userId)
  
  if (isCreator && !membership) {
    // Le créateur devrait toujours avoir un membership, mais au cas où
    membership = {
      role: 'owner',
      status: 'active',
      joinedAt: community.createdAt,
    }
  }

  // Vérifier l'accès pour les communautés privées
  if (community.type === 'private') {
    // Vérifier si l'utilisateur est membre actif ou créateur
    const isActiveMember = membership && membership.status === 'active'
    
    if (!isCreator && !isActiveMember) {
      return res.status(403).json({ 
        error: 'Accès refusé. Cette communauté est privée. Une invitation est requise.',
        membership: null,
      })
    }
  }

  res.json({
    ...community.toObject(),
    membership: membership ? {
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
    } : null,
  })
})

// POST /api/communities - Créer une nouvelle communauté
export const createCommunity = catchAsync(async (req, res) => {
  const { name, description, type, culture, image, coverImage, tags, settings } = req.body

  if (!name || !description) {
    return res.status(400).json({ error: 'Le nom et la description sont requis' })
  }

  // Vérifier si le nom existe déjà
  const existing = await Community.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
  if (existing) {
    return res.status(400).json({ error: 'Une communauté avec ce nom existe déjà' })
  }

  const community = new Community({
    name: name.trim(),
    description: description.trim(),
    type: type || 'public',
    culture: culture || '',
    image: image || '',
    coverImage: coverImage || '',
    tags: tags || [],
    creator: req.user._id,
    settings: settings || {},
  })

  await community.save()

  // Ajouter le créateur comme owner
  const member = new CommunityMember({
    community: community._id,
    user: req.user._id,
    role: 'owner',
    status: 'active',
  })
  await member.save()

  // Mettre à jour le compteur
  community.memberCount = 1
  await community.save()

  await community.populate('creator', 'name avatar')

  // Retourner la communauté avec le membership
  const communityObj = community.toObject()
  communityObj.membership = {
    role: 'owner',
    status: 'active',
    joinedAt: member.joinedAt,
  }

  logger.info(`Nouvelle communauté créée: ${community.name} par ${req.user.name}`)

  res.status(201).json(communityObj)
})

// PUT /api/communities/:id - Mettre à jour une communauté
export const updateCommunity = catchAsync(async (req, res) => {
  const community = await Community.findById(req.params.id)

  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  // Vérifier les permissions
  const membership = await CommunityMember.findOne({
    community: community._id,
    user: req.user._id,
  })

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  const { name, description, type, culture, image, coverImage, tags, settings } = req.body

  if (name) community.name = name.trim()
  if (description) community.description = description.trim()
  if (type) community.type = type
  if (culture !== undefined) community.culture = culture
  if (image !== undefined) community.image = image
  if (coverImage !== undefined) community.coverImage = coverImage
  if (tags) community.tags = tags
  if (settings) community.settings = { ...community.settings, ...settings }

  await community.save()
  await community.populate('creator', 'name avatar')

  logger.info(`Communauté ${community._id} mise à jour par ${req.user.name}`)

  res.json(community)
})

// DELETE /api/communities/:id - Supprimer une communauté
export const deleteCommunity = catchAsync(async (req, res) => {
  const community = await Community.findById(req.params.id)

  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  // Seul le créateur peut supprimer
  if (community.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Seul le créateur peut supprimer la communauté' })
  }

  // Supprimer tous les éléments associés
  await CommunityMember.deleteMany({ community: community._id })
  await CommunityInvitation.deleteMany({ community: community._id })
  await CommunityPost.deleteMany({ community: community._id })
  await Community.findByIdAndDelete(community._id)

  logger.info(`Communauté ${community._id} supprimée par ${req.user.name}`)

  res.json({ message: 'Communauté supprimée avec succès' })
})

// POST /api/communities/:id/join - Rejoindre une communauté
export const joinCommunity = catchAsync(async (req, res) => {
  const community = await Community.findById(req.params.id)

  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  // Vérifier si déjà membre
  const existingMember = await CommunityMember.findOne({
    community: community._id,
    user: req.user._id,
  })

  if (existingMember) {
    if (existingMember.status === 'active') {
      return res.status(400).json({ error: 'Vous êtes déjà membre de cette communauté' })
    }
    if (existingMember.status === 'banned') {
      return res.status(403).json({ error: 'Vous avez été banni de cette communauté' })
    }
  }

  // Pour les communautés privées, nécessite une invitation
  if (community.type === 'private') {
    const invitation = await CommunityInvitation.findOne({
      community: community._id,
      invitee: req.user._id,
      status: 'pending',
    })

    if (!invitation) {
      return res.status(403).json({ error: 'Cette communauté est privée. Une invitation est requise.' })
    }

    // Marquer l'invitation comme acceptée
    invitation.status = 'accepted'
    await invitation.save()
  }

  // Créer ou réactiver le membre
  if (existingMember) {
    existingMember.status = 'active'
    existingMember.joinedAt = new Date()
    await existingMember.save()
  } else {
    const member = new CommunityMember({
      community: community._id,
      user: req.user._id,
      role: 'member',
      status: 'active',
    })
    await member.save()
  }

  // Mettre à jour le compteur
  community.memberCount = await CommunityMember.countDocuments({
    community: community._id,
    status: 'active',
  })
  await community.save()

  logger.info(`${req.user.name} a rejoint la communauté ${community.name}`)

  res.json({ message: 'Vous avez rejoint la communauté avec succès' })
})

// POST /api/communities/:id/leave - Quitter une communauté
export const leaveCommunity = catchAsync(async (req, res) => {
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  if (!membership) {
    return res.status(404).json({ error: 'Vous n\'êtes pas membre de cette communauté' })
  }

  // Le propriétaire ne peut pas quitter
  if (membership.role === 'owner') {
    return res.status(400).json({ error: 'Le propriétaire ne peut pas quitter sa communauté' })
  }

  membership.status = 'left'
  await membership.save()

  // Mettre à jour le compteur
  const community = await Community.findById(req.params.id)
  if (community) {
    community.memberCount = await CommunityMember.countDocuments({
      community: community._id,
      status: 'active',
    })
    await community.save()
  }

  logger.info(`${req.user.name} a quitté la communauté ${req.params.id}`)

  res.json({ message: 'Vous avez quitté la communauté' })
})

// GET /api/communities/:id/members - Récupérer les membres d'une communauté
export const getCommunityMembers = catchAsync(async (req, res) => {
  // Vérifier que l'utilisateur est membre
  const requesterMembership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
    status: 'active',
  })

  if (!requesterMembership) {
    return res.status(403).json({ error: 'Vous devez être membre pour voir la liste des membres' })
  }

  const { role, status, page = 1, limit = 100 } = req.query
  const skip = (page - 1) * limit

  const query = {
    community: req.params.id,
  }
  
  // Si aucun statut spécifié, retourner tous les statuts sauf 'left'
  if (status) {
    query.status = status
  } else {
    query.status = { $ne: 'left' }
  }
  
  if (role) query.role = role

  const members = await CommunityMember.find(query)
    .populate('user', 'name avatar email')
    .sort({ role: 1, joinedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean()

  const total = await CommunityMember.countDocuments(query)

  res.json({
    members: members.map(m => ({
      _id: m._id,
      user: m.user,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// PUT /api/communities/:id/members/:userId/role - Modifier le rôle d'un membre
export const updateMemberRole = catchAsync(async (req, res) => {
  const { role } = req.body

  if (!['owner', 'admin', 'moderator', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' })
  }

  const community = await Community.findById(req.params.id)
  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.params.userId,
  })

  if (!membership) {
    return res.status(404).json({ error: 'Membre non trouvé' })
  }

  // Vérifier les permissions
  const requesterMembership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  // Seul le propriétaire peut modifier les rôles
  if (!requesterMembership || requesterMembership.role !== 'owner') {
    return res.status(403).json({ error: 'Seul le propriétaire peut modifier les rôles' })
  }

  // Si on transfère la propriété
  if (role === 'owner') {
    // L'ancien propriétaire devient admin
    requesterMembership.role = 'admin'
    await requesterMembership.save()
    
    // Le nouveau propriétaire
    membership.role = 'owner'
    await membership.save()
    
    // Mettre à jour le créateur de la communauté
    community.creator = req.params.userId
    await community.save()

    await membership.populate('user', 'name avatar')
    logger.info(`Propriété de la communauté ${req.params.id} transférée à ${membership.user.name}`)

    return res.json({
      ...membership.toObject(),
      message: 'Propriété transférée avec succès',
    })
  }

  // Le propriétaire ne peut pas être rétrogradé (sauf via transfert)
  if (membership.role === 'owner') {
    return res.status(400).json({ error: 'Le propriétaire ne peut pas être rétrogradé. Utilisez le transfert de propriété.' })
  }

  membership.role = role
  await membership.save()

  await membership.populate('user', 'name avatar')

  logger.info(`Rôle de ${membership.user.name} modifié à ${role} dans la communauté ${req.params.id}`)

  res.json(membership)
})

// DELETE /api/communities/:id/members/:userId - Retirer un membre
export const removeMember = catchAsync(async (req, res) => {
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.params.userId,
  })

  if (!membership) {
    return res.status(404).json({ error: 'Membre non trouvé' })
  }

  // Vérifier les permissions
  const requesterMembership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  // Seuls owner et admin peuvent retirer des membres
  if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  // Un admin ne peut pas retirer un autre admin ou le propriétaire
  if (requesterMembership.role === 'admin' && ['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Un admin ne peut pas retirer un autre admin ou le propriétaire' })
  }

  // Le propriétaire ne peut pas être retiré
  if (membership.role === 'owner') {
    return res.status(400).json({ error: 'Le propriétaire ne peut pas être retiré' })
  }

  membership.status = 'left'
  await membership.save()

  // Mettre à jour le compteur
  const community = await Community.findById(req.params.id)
  if (community) {
    community.memberCount = await CommunityMember.countDocuments({
      community: community._id,
      status: 'active',
    })
    await community.save()
  }

  await membership.populate('user', 'name avatar')
  logger.info(`Membre ${membership.user.name} retiré de la communauté ${req.params.id}`)

  res.json({ message: 'Membre retiré avec succès' })
})

// PUT /api/communities/:id/members/:userId/ban - Bloquer un membre
export const banMember = catchAsync(async (req, res) => {
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.params.userId,
  })

  if (!membership) {
    return res.status(404).json({ error: 'Membre non trouvé' })
  }

  // Vérifier les permissions
  const requesterMembership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  // Seuls owner et admin peuvent bloquer
  if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  // Un admin ne peut pas bloquer un autre admin ou le propriétaire
  if (requesterMembership.role === 'admin' && ['owner', 'admin'].includes(membership.role)) {
    return res.status(403).json({ error: 'Un admin ne peut pas bloquer un autre admin ou le propriétaire' })
  }

  // Le propriétaire ne peut pas être bloqué
  if (membership.role === 'owner') {
    return res.status(400).json({ error: 'Le propriétaire ne peut pas être bloqué' })
  }

  membership.status = 'banned'
  await membership.save()

  // Mettre à jour le compteur
  const community = await Community.findById(req.params.id)
  if (community) {
    community.memberCount = await CommunityMember.countDocuments({
      community: community._id,
      status: 'active',
    })
    await community.save()
  }

  await membership.populate('user', 'name avatar')
  logger.info(`Membre ${membership.user.name} bloqué de la communauté ${req.params.id}`)

  res.json({ message: 'Membre bloqué avec succès', membership })
})

// PUT /api/communities/:id/members/:userId/unban - Débloquer un membre
export const unbanMember = catchAsync(async (req, res) => {
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.params.userId,
  })

  if (!membership) {
    return res.status(404).json({ error: 'Membre non trouvé' })
  }

  if (membership.status !== 'banned') {
    return res.status(400).json({ error: 'Ce membre n\'est pas bloqué' })
  }

  // Vérifier les permissions
  const requesterMembership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  // Seuls owner et admin peuvent débloquer
  if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  membership.status = 'active'
  await membership.save()

  // Mettre à jour le compteur
  const community = await Community.findById(req.params.id)
  if (community) {
    community.memberCount = await CommunityMember.countDocuments({
      community: community._id,
      status: 'active',
    })
    await community.save()
  }

  await membership.populate('user', 'name avatar')
  logger.info(`Membre ${membership.user.name} débloqué de la communauté ${req.params.id}`)

  res.json({ message: 'Membre débloqué avec succès', membership })
})

