import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import Bookmark from '../models/Bookmark.js'
import UserProgress from '../models/UserProgress.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/recommendations - Recommandations personnalisées
export const getRecommendations = catchAsync(async (req, res) => {
  const userId = req.user?.id
  const { type, limit = 10 } = req.query

  if (!userId) {
    return res.json({
      products: [],
      blogs: [],
      events: [],
      figures: [],
      stories: [],
      collections: [],
    })
  }

  // Récupérer les favoris et l'activité de l'utilisateur
  const [bookmarks, progress] = await Promise.all([
    Bookmark.find({ user: userId }).select('itemType itemId').lean(),
    UserProgress.findOne({ user: userId }).lean(),
  ])

  // Extraire les catégories/thèmes favoris
  const favoriteCategories = new Set()
  const favoriteCountries = new Set()
  const viewedItems = new Set()

  bookmarks.forEach((bookmark) => {
    viewedItems.add(`${bookmark.itemType}-${bookmark.itemId}`)
  })

  if (progress?.activities) {
    progress.activities.forEach((activity) => {
      if (activity.metadata?.category) favoriteCategories.add(activity.metadata.category)
      if (activity.metadata?.country) favoriteCountries.add(activity.metadata.country)
    })
  }

  const recommendations = {
    products: [],
    blogs: [],
    events: [],
    figures: [],
    stories: [],
    collections: [],
  }

  // Recommandations de produits
  if (!type || type === 'products') {
    const productQuery = { isActive: true }
    if (favoriteCategories.size > 0) {
      productQuery.category = { $in: Array.from(favoriteCategories) }
    }
    if (favoriteCountries.size > 0) {
      productQuery.country = { $in: Array.from(favoriteCountries) }
    }

    recommendations.products = await Product.find(productQuery)
      .sort({ 'rating.average': -1, views: -1 })
      .limit(Number(limit))
      .select('name price currency images category rating views')
      .lean()
  }

  // Recommandations de blogs
  if (!type || type === 'blogs') {
    const blogQuery = { published: true }
    if (favoriteCategories.size > 0) {
      blogQuery.category = { $in: Array.from(favoriteCategories) }
    }

    recommendations.blogs = await Blog.find(blogQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(Number(limit))
      .select('title excerpt image category views createdAt')
      .lean()
  }

  // Recommandations d'événements
  if (!type || type === 'events') {
    const eventQuery = {}
    if (favoriteCountries.size > 0) {
      // Note: Cette requête nécessiterait un populate, simplifié ici
      eventQuery.period = { $in: Array.from(favoriteCategories) }
    }

    recommendations.events = await TimelineEvent.find(eventQuery)
      .sort({ importance: -1, views: -1 })
      .limit(Number(limit))
      .populate('location.country', 'nameFr id color')
      .select('title shortDescription date period location category views')
      .lean()
  }

  // Recommandations de figures
  if (!type || type === 'figures') {
    recommendations.figures = await HistoricalFigure.find({})
      .sort({ views: -1 })
      .limit(Number(limit))
      .populate('birthPlace.country', 'nameFr id')
      .select('name nameNative shortBiography image role views')
      .lean()
  }

  res.json(recommendations)
})

