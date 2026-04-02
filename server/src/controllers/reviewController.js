import Review from '../models/Review.js'
import Product from '../models/Product.js'

// POST /api/reviews - Créer un avis
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images, orderId } = req.body

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    })

    if (existingReview) {
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour ce produit' })
    }

    const review = new Review({
      product: productId,
      user: req.user._id,
      order: orderId || null,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: !!orderId,
    })

    await review.save()

    // Mettre à jour la note moyenne du produit
    await updateProductRating(productId)

    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// GET /api/reviews/product/:productId - Avis d'un produit
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name avatar')
      .select('-__v')

    const total = await Review.countDocuments({
      product: req.params.productId,
      isApproved: true,
    })

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/reviews/:id/helpful - Marquer un avis comme utile
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' })
    }

    const userId = req.user._id.toString()
    const isHelpful = review.helpfulUsers.includes(userId)

    if (isHelpful) {
      review.helpfulUsers = review.helpfulUsers.filter(id => id.toString() !== userId)
      review.helpful -= 1
    } else {
      review.helpfulUsers.push(userId)
      review.helpful += 1
    }

    await review.save()
    res.json(review)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Fonction helper pour mettre à jour la note du produit
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true })
  
  if (reviews.length === 0) return

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await Product.findByIdAndUpdate(productId, {
    'rating.average': Math.round(average * 10) / 10,
    'rating.count': reviews.length,
  })
}

