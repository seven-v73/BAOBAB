import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import Country from '../models/Country.js'
import Proverb from '../models/Proverb.js'
import Community from '../models/Community.js'
import Quiz from '../models/Quiz.js'
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
      countries: [],
      proverbs: [],
      communities: [],
      quizzes: [],
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
    countries: [],
    proverbs: [],
    communities: [],
    quizzes: [],
  }

  // Recherche dans les pays
  if (!type || type === 'countries') {
    results.countries = await Country.find({
      $or: [
        { nameFr: searchRegex },
        { name: searchRegex },
        { capital: searchRegex },
        { region: searchRegex },
        { subregion: searchRegex },
        { languages: { $in: [searchRegex] } },
        { culture: searchRegex },
        { description: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('id nameFr capital population area region subregion color description')
      .lean()
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

  // Recherche dans les proverbes
  if (!type || type === 'proverbs') {
    results.proverbs = await Proverb.find({
      $or: [
        { text: searchRegex },
        { translation: searchRegex },
        { explanation: searchRegex },
        { countryName: searchRegex },
        { language: searchRegex },
        { category: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(Number(limit))
      .select('text translation explanation countryName language category likes views')
      .lean()
  }

  // Recherche dans les communautés
  if (!type || type === 'communities') {
    results.communities = await Community.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { culture: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(Number(limit))
      .select('name description type culture image coverImage memberCount postCount tags')
      .lean()
  }

  // Recherche dans les quiz
  if (!type || type === 'quizzes') {
    results.quizzes = await Quiz.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(Number(limit))
      .select('title description difficulty totalPoints attempts averageScore tags')
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

  const [products, blogs, events, figures, countries, proverbs, communities, quizzes] = await Promise.all([
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
    Country.find({
      $or: [
        { nameFr: searchRegex },
        { capital: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('nameFr id capital')
      .lean(),
    Proverb.find({
      $or: [
        { text: searchRegex },
        { countryName: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(Number(limit))
      .select('text countryName')
      .lean(),
    Community.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { culture: searchRegex },
      ],
    })
      .limit(Number(limit))
      .select('name culture')
      .lean(),
    Quiz.find({
      isActive: true,
      title: searchRegex,
    })
      .limit(Number(limit))
      .select('title')
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
  countries.forEach((country) => {
    suggestions.push({ type: 'country', text: country.nameFr, id: country.id })
    if (country.capital) {
      suggestions.push({ type: 'country', text: country.capital, id: country.id })
    }
  })
  proverbs.forEach((proverb) => {
    suggestions.push({ type: 'proverb', text: proverb.text, id: proverb._id })
  })
  communities.forEach((community) => {
    suggestions.push({ type: 'community', text: community.name, id: community._id })
  })
  quizzes.forEach((quiz) => {
    suggestions.push({ type: 'quiz', text: quiz.title, id: quiz._id })
  })

  // Limiter et mélanger
  const shuffled = suggestions.sort(() => 0.5 - Math.random()).slice(0, Number(limit))

  res.json(shuffled)
})
