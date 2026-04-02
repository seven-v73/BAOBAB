import CommunityPost from '../models/CommunityPost.js'
import CommunityComment from '../models/CommunityComment.js'
import CommunityMember from '../models/CommunityMember.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/community/posts - Récupérer tous les posts (général ou d'une communauté)
export const getAllPosts = catchAsync(async (req, res) => {
  const { communityId, category, page = 1, limit = 10 } = req.query
  const skip = (page - 1) * limit

  const query = { isApproved: true }
  
  if (communityId) {
    query.community = communityId
    
    // Vérifier l'accès pour les communautés privées
    const Community = (await import('../models/Community.js')).default
    const community = await Community.findById(communityId)
    
    if (!community) {
      return res.status(404).json({ error: 'Communauté non trouvée' })
    }
    
    if (community.type === 'private') {
      if (!req.user) {
        return res.status(403).json({ error: 'Accès refusé. Connexion requise.' })
      }
      
      const membership = await CommunityMember.findOne({
        community: communityId,
        user: req.user._id,
        status: 'active',
      })
      
      if (!membership) {
        return res.status(403).json({ error: 'Accès refusé. Vous devez être membre de cette communauté.' })
      }
    }
  } else {
    // Posts généraux (sans communauté spécifique)
    query.community = null
  }
  
  if (category) {
    query.category = category
  }

  const posts = await CommunityPost.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'name avatar email')
    .populate('community', 'name type image')
    .lean()

  // Compter les commentaires pour chaque post
  const postsWithCommentCount = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await CommunityComment.countDocuments({ post: post._id })
      return {
        ...post,
        commentCount, // Nombre de commentaires
        comments: [], // Tableau vide, les commentaires seront chargés à la demande
      }
    })
  )

  const total = await CommunityPost.countDocuments(query)

  res.json({
    posts: postsWithCommentCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// GET /api/community/posts/:id - Récupérer un post par ID
export const getPostById = catchAsync(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)
    .populate('author', 'name avatar email')
    .populate('community', 'name type image')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'name avatar',
      },
      options: { sort: { createdAt: -1 } },
    })

  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' })
  }

  // Vérifier l'accès si le post est dans une communauté privée
  if (post.community && post.community.type === 'private') {
    if (!req.user) {
      return res.status(403).json({ error: 'Accès refusé' })
    }

    const membership = await CommunityMember.findOne({
      community: post.community._id,
      user: req.user._id,
      status: 'active',
    })

    if (!membership) {
      return res.status(403).json({ error: 'Accès refusé. Vous devez être membre de cette communauté.' })
    }
  }

  res.json(post)
})

// POST /api/community/posts - Créer un nouveau post
export const createPost = catchAsync(async (req, res) => {
  const { content, image, video, pdf, tags, category, communityId } = req.body

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Le contenu est requis' })
  }

  let requiresApproval = false
  let community = null

  // Si une communauté est spécifiée, vérifier les permissions
  if (communityId) {
    const Community = (await import('../models/Community.js')).default
    community = await Community.findById(communityId)
    
    if (!community) {
      return res.status(404).json({ error: 'Communauté non trouvée' })
    }

    // Vérifier l'accès
    const membership = await CommunityMember.findOne({
      community: communityId,
      user: req.user._id,
      status: 'active',
    })

    if (!membership) {
      return res.status(403).json({ error: 'Vous devez être membre de cette communauté pour y publier' })
    }

    // Vérifier si l'approbation est requise
    requiresApproval = community.settings.requireApproval && 
                       !['owner', 'admin', 'moderator'].includes(membership.role)
  }

  // Créer le post
  const post = new CommunityPost({
    community: communityId || null,
    author: req.user._id,
    content: content.trim(),
    image: image || '',
    video: video || '',
    pdf: pdf || '',
    tags: tags || [],
    category: category || 'Discussion',
    isApproved: !requiresApproval, // Auto-approuvé sauf si la communauté requiert l'approbation
  })

  await post.save()
  await post.populate('author', 'name avatar email')
  if (communityId) {
    await post.populate('community', 'name type image')
    
    // Mettre à jour le compteur de posts de la communauté
    if (community) {
      community.postCount = await CommunityPost.countDocuments({ community: communityId })
      await community.save()
    }
  }

  await post.save()
  await post.populate('author', 'name avatar email')

  logger.info(`Nouveau post créé par ${req.user.name} (${req.user._id})`)

  res.status(201).json(post)
})

// PUT /api/community/posts/:id - Mettre à jour un post
export const updatePost = catchAsync(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)

  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' })
  }

  // Vérifier que l'utilisateur est l'auteur, un modérateur/admin de la communauté, ou un admin global
  let canEdit = post.author.toString() === req.user._id.toString() || req.user.role === 'admin'

  if (!canEdit && post.community) {
    const membership = await CommunityMember.findOne({
      community: post.community,
      user: req.user._id,
      status: 'active',
    })
    canEdit = membership && ['owner', 'admin', 'moderator'].includes(membership.role)
  }

  if (!canEdit) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  const { content, image, video, pdf, tags, category } = req.body

  if (content) post.content = content.trim()
  if (image !== undefined) post.image = image
  if (video !== undefined) post.video = video
  if (pdf !== undefined) post.pdf = pdf
  if (tags) post.tags = tags
  if (category) post.category = category

  await post.save()
  await post.populate('author', 'name avatar email')

  logger.info(`Post ${post._id} mis à jour par ${req.user.name}`)

  res.json(post)
})

// DELETE /api/community/posts/:id - Supprimer un post
export const deletePost = catchAsync(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)

  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' })
  }

  // Vérifier que l'utilisateur est l'auteur, un modérateur/admin de la communauté, ou un admin global
  let canDelete = post.author.toString() === req.user._id.toString() || req.user.role === 'admin'

  if (!canDelete && post.community) {
    const membership = await CommunityMember.findOne({
      community: post.community,
      user: req.user._id,
      status: 'active',
    })
    canDelete = membership && ['owner', 'admin', 'moderator'].includes(membership.role)
  }

  if (!canDelete) {
    return res.status(403).json({ error: 'Non autorisé' })
  }

  // Supprimer tous les commentaires associés
  await CommunityComment.deleteMany({ post: post._id })

  await CommunityPost.findByIdAndDelete(req.params.id)

  // Mettre à jour le compteur de posts de la communauté
  if (post.community) {
    const Community = (await import('../models/Community.js')).default
    const community = await Community.findById(post.community)
    if (community) {
      community.postCount = await CommunityPost.countDocuments({ community: post.community })
      await community.save()
    }
  }

  logger.info(`Post ${post._id} supprimé par ${req.user.name}`)

  res.json({ message: 'Post supprimé avec succès' })
})

// PUT /api/community/posts/:id/like - Liker/unliker un post
export const likePost = catchAsync(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)
    .populate('community')

  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' })
  }

  // Vérifier l'accès si le post est dans une communauté privée
  if (post.community && post.community.type === 'private') {
    const membership = await CommunityMember.findOne({
      community: post.community._id,
      user: req.user._id,
      status: 'active',
    })

    if (!membership) {
      return res.status(403).json({ error: 'Vous devez être membre de cette communauté' })
    }
  }

  const userId = req.user._id.toString()
  const isLiked = post.likes.some(id => id.toString() === userId)

  if (isLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId)
  } else {
    post.likes.push(userId)
  }

  await post.save()
  await post.populate('author', 'name avatar email')

  res.json(post)
})

// POST /api/community/posts/:id/comments - Créer un commentaire sur un post
export const createPostComment = catchAsync(async (req, res) => {
  const { content, parentId } = req.body

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Le contenu est requis' })
  }

  const post = await CommunityPost.findById(req.params.id)
    .populate('community')

  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' })
  }

  // Vérifier l'accès si le post est dans une communauté privée
  if (post.community && post.community.type === 'private') {
    const membership = await CommunityMember.findOne({
      community: post.community._id,
      user: req.user._id,
      status: 'active',
    })

    if (!membership) {
      return res.status(403).json({ error: 'Vous devez être membre de cette communauté' })
    }
  }

  const comment = new CommunityComment({
    post: req.params.id,
    user: req.user._id,
    content: content.trim(),
    parent: parentId || null,
  })

  await comment.save()
  await comment.populate('user', 'name avatar')

  // Ajouter le commentaire au post
  post.comments.push(comment._id)
  await post.save()

  logger.info(`Nouveau commentaire créé par ${req.user.name} sur le post ${req.params.id}`)

  res.status(201).json(comment)
})

// GET /api/community/posts/:id/comments - Récupérer les commentaires d'un post
export const getPostComments = catchAsync(async (req, res) => {
  const comments = await CommunityComment.find({
    post: req.params.id,
    parent: null, // Seulement les commentaires principaux
  })
    .sort('-createdAt')
    .populate('user', 'name avatar')
    .populate({
      path: 'parent',
      populate: { path: 'user', select: 'name avatar' },
    })

  // Récupérer les réponses pour chaque commentaire
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await CommunityComment.find({
        parent: comment._id,
      })
        .sort('createdAt')
        .populate('user', 'name avatar')
      
      return {
        ...comment.toObject(),
        replies,
      }
    })
  )

  res.json(commentsWithReplies)
})

// PUT /api/community/comments/:id/like - Liker un commentaire
export const likeComment = catchAsync(async (req, res) => {
  const comment = await CommunityComment.findById(req.params.id)
  if (!comment) {
    return res.status(404).json({ error: 'Commentaire non trouvé' })
  }

  const userId = req.user._id.toString()
  const isLiked = comment.likes.some(id => id.toString() === userId)

  if (isLiked) {
    comment.likes = comment.likes.filter(id => id.toString() !== userId)
  } else {
    comment.likes.push(userId)
  }

  await comment.save()
  await comment.populate('user', 'name avatar')

  res.json(comment)
})

