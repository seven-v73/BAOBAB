import express from 'express'
import {
  getAllCommunities,
  getMyCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  banMember,
  unbanMember,
  createCommunityRequest,
  getCommunityRequests,
  approveCommunityRequest,
  rejectCommunityRequest,
} from '../controllers/communityGroupController.js'
import {
  createInvitation,
  getCommunityInvitations,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} from '../controllers/communityInvitationController.js'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  createPostComment,
  getPostComments,
  likeComment,
} from '../controllers/communityController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { optionalAuthenticate } from '../middleware/optionalAuth.js'
import { validateMongoId } from '../middleware/validation.js'

const router = express.Router()

// Routes spécifiques protégées
router.get('/my/communities', authenticate, getMyCommunities)
router.post('/requests', authenticate, createCommunityRequest)
router.get('/requests', authenticate, authorize('admin'), getCommunityRequests)
router.put('/requests/:id/approve', authenticate, authorize('admin'), validateMongoId, approveCommunityRequest)
router.put('/requests/:id/reject', authenticate, authorize('admin'), validateMongoId, rejectCommunityRequest)

// Routes pour les invitations
router.get('/invitations/my', authenticate, getMyInvitations)
router.post('/invitations/:id/accept', authenticate, validateMongoId, acceptInvitation)
router.post('/invitations/:id/reject', authenticate, validateMongoId, rejectInvitation)
router.delete('/invitations/:id', authenticate, validateMongoId, cancelInvitation)

// Routes pour les posts (dans les communautés ou généraux)
router.get('/posts/all', getAllPosts)
router.get('/posts/:id', validateMongoId, getPostById)
router.post('/posts', authenticate, createPost)
router.put('/posts/:id', authenticate, validateMongoId, updatePost)
router.delete('/posts/:id', authenticate, validateMongoId, deletePost)
router.put('/posts/:id/like', authenticate, validateMongoId, likePost)
router.get('/posts/:id/comments', validateMongoId, getPostComments)
router.post('/posts/:id/comments', authenticate, validateMongoId, createPostComment)
router.put('/comments/:id/like', authenticate, validateMongoId, likeComment)

// Routes publiques pour les communautés (avec auth optionnelle pour connaître le statut de membre)
router.get('/', optionalAuthenticate, getAllCommunities)
router.get('/:id', optionalAuthenticate, validateMongoId, getCommunityById)

// Routes protégées pour les communautés
router.post('/', authenticate, authorize('admin'), createCommunity)
router.put('/:id', authenticate, validateMongoId, updateCommunity)
router.delete('/:id', authenticate, validateMongoId, deleteCommunity)
router.post('/:id/join', authenticate, validateMongoId, joinCommunity)
router.post('/:id/leave', authenticate, validateMongoId, leaveCommunity)

// Routes pour les membres
router.get('/:id/members', authenticate, validateMongoId, getCommunityMembers)
router.put('/:id/members/:userId/role', authenticate, validateMongoId, updateMemberRole)
router.delete('/:id/members/:userId', authenticate, validateMongoId, removeMember)
router.put('/:id/members/:userId/ban', authenticate, validateMongoId, banMember)
router.put('/:id/members/:userId/unban', authenticate, validateMongoId, unbanMember)

// Routes pour les invitations
router.post('/:id/invitations', authenticate, validateMongoId, createInvitation)
router.get('/:id/invitations', authenticate, validateMongoId, getCommunityInvitations)

export default router
