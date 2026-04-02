import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import Country from '../models/Country.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'
import { getCache, setCache } from '../utils/cache.js'

// GET /api/stats/home - Statistiques pour la page d'accueil
export const getHomeStats = catchAsync(async (req, res) => {
  // Vérifier le cache
  const cacheKey = 'stats:home'
  const cached = await getCache(cacheKey)
  if (cached) {
    return res.json(cached)
  }

  const [
    countriesCount,
    blogPostsCount,
    productsCount,
    eventsCount,
    figuresCount,
    storiesCount,
    collectionsCount,
    usersCount,
    totalBlogViews,
    totalProductViews,
  ] = await Promise.all([
    Country.countDocuments(),
    Blog.countDocuments({ published: true }),
    Product.countDocuments({ isActive: true }),
    TimelineEvent.countDocuments(),
    HistoricalFigure.countDocuments(),
    Story.countDocuments(),
    Collection.countDocuments(),
    User.countDocuments(),
    Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Product.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
  ])

  const totalViews = (totalBlogViews[0]?.total || 0) + (totalProductViews[0]?.total || 0)

  const stats = {
    countries: countriesCount,
    blogPosts: blogPostsCount,
    products: productsCount,
    events: eventsCount,
    figures: figuresCount,
    stories: storiesCount,
    collections: collectionsCount,
    users: usersCount,
    totalViews,
  }

  // Mettre en cache pour 1 heure
  await setCache(cacheKey, stats, 3600)

  res.json(stats)
})

// GET /api/content/featured - Contenu en vedette
export const getFeaturedContent = catchAsync(async (req, res) => {
  const { limit = 6 } = req.query

  const [featuredBlogs, featuredProducts, featuredEvents, featuredFigures, featuredStories, featuredCollections] = await Promise.all([
    Blog.find({ published: true })
      .sort({ views: -1, createdAt: -1 })
      .limit(Number(limit))
      .select('title excerpt image createdAt views category')
      .lean(),
    Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('name description shortDescription price currency images category views rating')
      .lean(),
    TimelineEvent.find({ verified: true })
      .sort({ importance: -1, views: -1 })
      .limit(Number(limit))
      .populate('location.country', 'nameFr id color')
      .select('title shortDescription date period location category views images')
      .lean(),
    HistoricalFigure.find({ verified: true })
      .sort({ views: -1 })
      .limit(Number(limit))
      .populate('birthPlace.country', 'nameFr id')
      .select('name nameNative shortBiography image role birthDate deathDate birthPlace views')
      .lean(),
    Story.find({ isFeatured: true })
      .sort({ views: -1 })
      .limit(Number(limit))
      .select('title subtitle description coverImage category readingTime views difficulty')
      .lean(),
    Collection.find({ isFeatured: true })
      .sort({ views: -1 })
      .limit(Number(limit))
      .select('title shortDescription coverImage theme difficulty views rating estimatedTime')
      .lean(),
  ])

  res.json({
    blogs: featuredBlogs,
    products: featuredProducts,
    events: featuredEvents,
    figures: featuredFigures,
    stories: featuredStories,
    collections: featuredCollections,
  })
})

// GET /api/content/trending - Contenu tendance
export const getTrendingContent = catchAsync(async (req, res) => {
  const { limit = 5, period = '7d' } = req.query

  // Calculer la date de début selon la période
  const now = new Date()
  let startDate = new Date()
  switch (period) {
    case '24h':
      startDate.setHours(now.getHours() - 24)
      break
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    default:
      startDate.setDate(now.getDate() - 7)
  }

  const [trendingBlogs, trendingProducts, trendingEvents, trendingFigures] = await Promise.all([
    Blog.find({
      published: true,
      createdAt: { $gte: startDate },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(Number(limit))
      .select('title excerpt image createdAt views category')
      .lean(),
    Product.find({
      isActive: true,
      createdAt: { $gte: startDate },
    })
      .sort({ views: -1, 'rating.average': -1 })
      .limit(Number(limit))
      .select('name description shortDescription price currency images category views rating')
      .lean(),
    TimelineEvent.find({
      createdAt: { $gte: startDate },
    })
      .sort({ views: -1, importance: -1 })
      .limit(Number(limit))
      .populate('location.country', 'nameFr id color')
      .select('title shortDescription date period location category views images')
      .lean(),
    HistoricalFigure.find({
      createdAt: { $gte: startDate },
    })
      .sort({ views: -1 })
      .limit(Number(limit))
      .populate('birthPlace.country', 'nameFr id')
      .select('name nameNative shortBiography image role views')
      .lean(),
  ])

  res.json({
    period,
    blogs: trendingBlogs,
    products: trendingProducts,
    events: trendingEvents,
    figures: trendingFigures,
  })
})

// GET /api/content/recent - Contenu récent
export const getRecentContent = catchAsync(async (req, res) => {
  const { limit = 6 } = req.query

  const [recentBlogs, recentEvents, recentFigures, recentStories] = await Promise.all([
    Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title excerpt image createdAt views category')
      .lean(),
    TimelineEvent.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('location.country', 'nameFr id color')
      .select('title shortDescription date period location category views images')
      .lean(),
    HistoricalFigure.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('birthPlace.country', 'nameFr id')
      .select('name nameNative shortBiography image role views')
      .lean(),
    Story.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title subtitle description coverImage category readingTime views')
      .lean(),
  ])

  res.json({
    blogs: recentBlogs,
    events: recentEvents,
    figures: recentFigures,
    stories: recentStories,
  })
})

