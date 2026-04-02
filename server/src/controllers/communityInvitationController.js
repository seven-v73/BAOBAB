import CommunityInvitation from '../models/CommunityInvitation.js'
import CommunityMember from '../models/CommunityMember.js'
import Community from '../models/Community.js'
import User from '../models/User.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// POST /api/communities/:id/invitations - Inviter un utilisateur
export const createInvitation = catchAsync(async (req, res) => {
  const { email, userId, message } = req.body

  if (!email && !userId) {
    return res.status(400).json({ error: 'Email ou ID utilisateur requis' })
  }

  const community = await Community.findById(req.params.id)
  if (!community) {
    return res.status(404).json({ error: 'Communauté non trouvée' })
  }

  // Vérifier les permissions
  const membership = await CommunityMember.findOne({
    community: community._id,
    user: req.user._id,
  })

  if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
    return res.status(403).json({ error: 'Non autorisé. Seuls les admins peuvent inviter.' })
  }

  // Vérifier que la communauté permet les invitations
  if (!community.settings.allowInvitations) {
    return res.status(400).json({ error: 'Les invitations sont désactivées pour cette communauté' })
  }

  let invitee = null
  if (userId) {
    invitee = await User.findById(userId)
    if (!invitee) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
  } else if (email) {
    invitee = await User.findOne({ email: email.toLowerCase() })
    if (!invitee) {
      // Créer une invitation par email (l'utilisateur pourra l'accepter après inscription)
      const invitation = new CommunityInvitation({
        community: community._id,
        inviter: req.user._id,
        email: email.toLowerCase(),
        message: message || '',
      })
      await invitation.save()
      return res.status(201).json({
        ...invitation.toObject(),
        message: 'Invitation envoyée par email. L\'utilisateur pourra l\'accepter après inscription.',
      })
    }
  }

  // Vérifier si déjà membre
  const existingMember = await CommunityMember.findOne({
    community: community._id,
    user: invitee._id,
    status: 'active',
  })

  if (existingMember) {
    return res.status(400).json({ error: 'Cet utilisateur est déjà membre' })
  }

  // Vérifier si invitation déjà envoyée
  const existingInvitation = await CommunityInvitation.findOne({
    community: community._id,
    invitee: invitee._id,
    status: 'pending',
  })

  if (existingInvitation) {
    return res.status(400).json({ error: 'Une invitation est déjà en attente pour cet utilisateur' })
  }

  const invitation = new CommunityInvitation({
    community: community._id,
    inviter: req.user._id,
    invitee: invitee._id,
    email: invitee.email,
    message: message || '',
  })

  await invitation.save()
  await invitation.populate('invitee', 'name avatar email')
  await invitation.populate('inviter', 'name avatar')

  logger.info(`Invitation créée pour ${invitee.email} dans la communauté ${community.name}`)

  res.status(201).json(invitation)
})

// GET /api/communities/:id/invitations - Récupérer les invitations d'une communauté
export const getCommunityInvitations = catchAsync(async (req, res) => {
  const { status = 'pending' } = req.query

  // Vérifier les permissions
  const membership = await CommunityMember.findOne({
    community: req.params.id,
    user: req.user._id,
  })

  if (!membership || !['owner', 'admin', 'moderator'].includes(membership.role)) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  const invitations = await CommunityInvitation.find({
    community: req.params.id,
    status,
  })
    .populate('inviter', 'name avatar')
    .populate('invitee', 'name avatar email')
    .sort({ createdAt: -1 })

  res.json(invitations)
})

// GET /api/invitations/my - Récupérer mes invitations
export const getMyInvitations = catchAsync(async (req, res) => {
  const invitations = await CommunityInvitation.find({
    $or: [
      { invitee: req.user._id, status: 'pending' },
      { email: req.user.email, status: 'pending' },
    ],
  })
    .populate('community', 'name description type image culture')
    .populate('inviter', 'name avatar')
    .sort({ createdAt: -1 })

  res.json(invitations)
})

// POST /api/invitations/:id/accept - Accepter une invitation
export const acceptInvitation = catchAsync(async (req, res) => {
  const invitation = await CommunityInvitation.findById(req.params.id)
    .populate('community')

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation non trouvée' })
  }

  // Vérifier que l'invitation est pour cet utilisateur
  const isForUser = invitation.invitee?.toString() === req.user._id.toString() ||
                    invitation.email?.toLowerCase() === req.user.email.toLowerCase()

  if (!isForUser) {
    return res.status(403).json({ error: 'Cette invitation ne vous est pas destinée' })
  }

  if (invitation.status !== 'pending') {
    return res.status(400).json({ error: 'Cette invitation a déjà été traitée' })
  }

  if (invitation.expiresAt && new Date() > invitation.expiresAt) {
    invitation.status = 'expired'
    await invitation.save()
    return res.status(400).json({ error: 'Cette invitation a expiré' })
  }

  // Vérifier si déjà membre
  const existingMember = await CommunityMember.findOne({
    community: invitation.community._id,
    user: req.user._id,
    status: 'active',
  })

  if (existingMember) {
    invitation.status = 'accepted'
    await invitation.save()
    return res.status(400).json({ error: 'Vous êtes déjà membre de cette communauté' })
  }

  // Créer le membre
  const member = new CommunityMember({
    community: invitation.community._id,
    user: req.user._id,
    role: 'member',
    status: 'active',
  })
  await member.save()

  // Mettre à jour l'invitation
  invitation.status = 'accepted'
  invitation.invitee = req.user._id
  await invitation.save()

  // Mettre à jour le compteur
  const community = await Community.findById(invitation.community._id)
  if (community) {
    community.memberCount = await CommunityMember.countDocuments({
      community: community._id,
      status: 'active',
    })
    await community.save()
  }

  logger.info(`${req.user.name} a accepté l'invitation pour ${invitation.community.name}`)

  res.json({
    message: 'Invitation acceptée avec succès',
    community: invitation.community,
  })
})

// POST /api/invitations/:id/reject - Rejeter une invitation
export const rejectInvitation = catchAsync(async (req, res) => {
  const invitation = await CommunityInvitation.findById(req.params.id)

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation non trouvée' })
  }

  // Vérifier que l'invitation est pour cet utilisateur
  const isForUser = invitation.invitee?.toString() === req.user._id.toString() ||
                    invitation.email?.toLowerCase() === req.user.email.toLowerCase()

  if (!isForUser) {
    return res.status(403).json({ error: 'Cette invitation ne vous est pas destinée' })
  }

  if (invitation.status !== 'pending') {
    return res.status(400).json({ error: 'Cette invitation a déjà été traitée' })
  }

  invitation.status = 'rejected'
  await invitation.save()

  logger.info(`${req.user.name} a rejeté l'invitation ${req.params.id}`)

  res.json({ message: 'Invitation rejetée' })
})

// DELETE /api/invitations/:id - Annuler une invitation
export const cancelInvitation = catchAsync(async (req, res) => {
  const invitation = await CommunityInvitation.findById(req.params.id)
    .populate('community')

  if (!invitation) {
    return res.status(404).json({ error: 'Invitation non trouvée' })
  }

  // Vérifier les permissions
  const membership = await CommunityMember.findOne({
    community: invitation.community._id,
    user: req.user._id,
  })

  const canCancel = membership && ['owner', 'admin', 'moderator'].includes(membership.role) ||
                    invitation.inviter.toString() === req.user._id.toString()

  if (!canCancel) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  await CommunityInvitation.findByIdAndDelete(req.params.id)

  logger.info(`Invitation ${req.params.id} annulée par ${req.user.name}`)

  res.json({ message: 'Invitation annulée' })
})

