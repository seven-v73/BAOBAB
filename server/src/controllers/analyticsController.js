import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import UserProgress from '../models/UserProgress.js'
import Bookmark from '../models/Bookmark.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/analytics - Analytics globales (Admin)
export const getAnalytics = catchAsync(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' })
  }

  const { period = '30d' } = req.query

  // Calculer la date de début
  const now = new Date()
  let startDate = new Date()
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  const [
    totalUsers,
    newUsers,
    totalProducts,
    totalBlogs,
    totalEvents,
    totalFigures,
    totalViews,
    totalOrders,
    totalRevenue,
    topProducts,
    topBlogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Product.countDocuments({ isActive: true }),
    Blog.countDocuments({ published: true }),
    TimelineEvent.countDocuments(),
    HistoricalFigure.countDocuments(),
    Product.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Product.find({ isActive: true })
      .sort({ views: -1 })
      .limit(10)
      .select('name views rating')
      .lean(),
    Blog.find({ published: true })
      .sort({ views: -1 })
      .limit(10)
      .select('title views category')
      .lean(),
  ])

  res.json({
    period,
    users: {
      total: totalUsers,
      new: newUsers,
    },
    content: {
      products: totalProducts,
      blogs: totalBlogs,
      events: totalEvents,
      figures: totalFigures,
    },
    engagement: {
      totalViews: totalViews[0]?.total || 0,
      orders: totalOrders,
      revenue: totalRevenue[0]?.total || 0,
    },
    topContent: {
      products: topProducts,
      blogs: topBlogs,
    },
  })
})

// GET /api/analytics/user - Analytics utilisateur
export const getUserAnalytics = catchAsync(async (req, res) => {
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const [progress, bookmarks] = await Promise.all([
    UserProgress.findOne({ user: userId }).lean(),
    Bookmark.countDocuments({ user: userId }),
  ])

  res.json({
    points: progress?.points || 0,
    level: progress?.level || 1,
    streak: progress?.streak || 0,
    badges: progress?.badges?.length || 0,
    bookmarks: bookmarks,
    activities: progress?.activities?.length || 0,
  })
})

