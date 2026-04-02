import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/search - Recherche unifiée
export const searchAll = catchAsync(async (req, res) => {
  const { q, type, limit = 10 } = req.query

  if (!q || q.trim().length === 0) {
    return res.json({
      products: [],
      blogs: [],
      events: [],
      figures: [],
      stories: [],
      collections: [],
    })
  }

  const searchQuery = q.trim()
  const searchRegex = new RegExp(searchQuery, 'i')

  const results = {
    products: [],
    blogs: [],
    events: [],
    figures: [],
    stories: [],
    collections: [],
  }

  // Recherche dans les produits
  if (!type || type === 'products') {
    results.products = await Product.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { country: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('name price currency images category rating views')
      .lean()
  }

  // Recherche dans les blogs
  if (!type || type === 'blogs') {
    results.blogs = await Blog.find({
      published: true,
      $or: [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('title excerpt image category views createdAt')
      .lean()
  }

  // Recherche dans les événements
  if (!type || type === 'events') {
    results.events = await TimelineEvent.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { period: searchRegex },
      ],
    })
      .populate('location.country', 'nameFr id color')
      .limit(Number(limit))
      .select('title shortDescription date period location category views images')
      .lean()
  }

  // Recherche dans les figures historiques
  if (!type || type === 'figures') {
    results.figures = await HistoricalFigure.find({
      $or: [
        { name: searchRegex },
        { nameNative: searchRegex },
        { shortBiography: searchRegex },
        { role: { $in: [searchRegex] } },
      ],
    })
      .populate('birthPlace.country', 'nameFr id')
      .limit(Number(limit))
      .select('name nameNative shortBiography image role views')
      .lean()
  }

  // Recherche dans les récits
  if (!type || type === 'stories') {
    results.stories = await Story.find({
      $or: [
        { title: searchRegex },
        { subtitle: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('title subtitle description coverImage category views')
      .lean()
  }

  // Recherche dans les collections
  if (!type || type === 'collections') {
    results.collections = await Collection.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { theme: { $in: [searchRegex] } },
      ],
    })
      .limit(Number(limit))
      .select('title shortDescription coverImage theme views rating')
      .lean()
  }

  res.json(results)
})

// GET /api/search/suggestions - Suggestions de recherche
export const getSearchSuggestions = catchAsync(async (req, res) => {
  const { q, limit = 5 } = req.query

  if (!q || q.trim().length < 2) {
    return res.json([])
  }

  const searchQuery = q.trim()
  const searchRegex = new RegExp(searchQuery, 'i')

  const [products, blogs, events, figures] = await Promise.all([
    Product.find({
      isActive: true,
      name: searchRegex,
    })
      .limit(Number(limit))
      .select('name')
      .lean(),
    Blog.find({
      published: true,
      title: searchRegex,
    })
      .limit(Number(limit))
      .select('title')
      .lean(),
    TimelineEvent.find({
      title: searchRegex,
    })
      .limit(Number(limit))
      .select('title')
      .lean(),
    HistoricalFigure.find({
      $or: [
        { name: searchRegex },
        { nameNative: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('name nameNative')
      .lean(),
  ])

  const suggestions = []
  
  products.forEach((p) => {
    suggestions.push({ type: 'product', text: p.name, id: p._id })
  })
  blogs.forEach((b) => {
    suggestions.push({ type: 'blog', text: b.title, id: b._id })
  })
  events.forEach((e) => {
    suggestions.push({ type: 'event', text: e.title, id: e._id })
  })
  figures.forEach((f) => {
    suggestions.push({ type: 'figure', text: f.name, id: f._id })
    if (f.nameNative && f.nameNative !== f.name) {
      suggestions.push({ type: 'figure', text: f.nameNative, id: f._id })
    }
  })

  // Limiter et mélanger
  const shuffled = suggestions.sort(() => 0.5 - Math.random()).slice(0, Number(limit))

  res.json(shuffled)
})

