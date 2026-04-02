import Comment from '../models/Comment.js'
import Blog from '../models/Blog.js'

// POST /api/comments - Créer un commentaire
export const createComment = async (req, res) => {
  try {
    const { blogId, content, parentId } = req.body

    if (!blogId || !content) {
      return res.status(400).json({ error: 'Blog ID et contenu requis' })
    }

    const comment = new Comment({
      blog: blogId,
      user: req.user._id,
      content,
      parent: parentId || null,
    })

    await comment.save()

    // Populate pour retourner les infos complètes
    await comment.populate('user', 'name avatar')

    res.status(201).json(comment)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// GET /api/comments/blog/:blogId - Commentaires d'un article
export const getBlogComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      blog: req.params.blogId,
      parent: null, // Seulement les commentaires principaux
      isApproved: true,
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
        const replies = await Comment.find({
          parent: comment._id,
          isApproved: true,
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/comments/:id/like - Liker un commentaire
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' })
    }

    const userId = req.user._id.toString()
    const isLiked = comment.likes.includes(userId)

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId)
    } else {
      comment.likes.push(userId)
    }

    await comment.save()
    res.json(comment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

