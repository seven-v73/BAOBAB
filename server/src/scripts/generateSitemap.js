import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { connectDB } from '../config/database.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import Country from '../models/Country.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Collection from '../models/Collection.js'
import Quiz from '../models/Quiz.js'
import Proverb from '../models/Proverb.js'
import Community from '../models/Community.js'
import logger from '../utils/logger.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../..')
const baseUrl = (process.env.FRONTEND_URL || 'https://monbaobab.com').replace(/\/$/, '')

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const formatDate = (date) => {
  const value = date ? new Date(date) : new Date()
  return Number.isNaN(value.getTime()) ? new Date().toISOString().slice(0, 10) : value.toISOString().slice(0, 10)
}

const urlNode = ({ loc, lastmod = new Date(), changefreq = 'weekly', priority = '0.7' }) => `  <url>
    <loc>${escapeXml(`${baseUrl}${loc}`)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

const generateSitemap = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  const [
    blogs,
    products,
    countries,
    events,
    figures,
    stories,
    collections,
    quizzes,
    proverbs,
    communities,
  ] = await Promise.all([
    Blog.find({ published: true }).select('_id updatedAt createdAt').lean(),
    Product.find({ isActive: true }).select('_id updatedAt createdAt').lean(),
    Country.find({ isActive: true }).select('id updatedAt createdAt').lean(),
    TimelineEvent.find({ isActive: { $ne: false } }).select('_id updatedAt createdAt').lean(),
    HistoricalFigure.find({ isActive: true }).select('_id updatedAt createdAt').lean(),
    Story.find({ published: true }).select('_id updatedAt createdAt').lean(),
    Collection.find({ isActive: true }).select('_id updatedAt createdAt').lean(),
    Quiz.find({ isActive: { $ne: false } }).select('_id updatedAt createdAt').lean(),
    Proverb.find({ isActive: { $ne: false } }).select('_id updatedAt createdAt').lean(),
    Community.find({ isActive: true, type: 'public' }).select('_id updatedAt createdAt').lean(),
  ])

  const urls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.9' },
    { loc: '/shop', changefreq: 'weekly', priority: '0.9' },
    { loc: '/communities', changefreq: 'daily', priority: '0.8' },
    { loc: '/timeline', changefreq: 'weekly', priority: '0.8' },
    { loc: '/figures', changefreq: 'weekly', priority: '0.8' },
    { loc: '/stories', changefreq: 'weekly', priority: '0.8' },
    { loc: '/collections', changefreq: 'weekly', priority: '0.8' },
    { loc: '/quizzes', changefreq: 'weekly', priority: '0.7' },
    { loc: '/proverbs', changefreq: 'weekly', priority: '0.7' },
    { loc: '/sources', changefreq: 'weekly', priority: '0.8' },
    { loc: '/contribute', changefreq: 'weekly', priority: '0.7' },
    { loc: '/map', changefreq: 'monthly', priority: '0.7' },
    ...blogs.map((item) => ({ loc: `/blog/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...products.map((item) => ({ loc: `/shop/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...countries.map((item) => ({ loc: `/country/${item.id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.8' })),
    ...events.map((item) => ({ loc: `/timeline/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...figures.map((item) => ({ loc: `/figures/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...stories.map((item) => ({ loc: `/stories/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...collections.map((item) => ({ loc: `/collections/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.7' })),
    ...quizzes.map((item) => ({ loc: `/quizzes/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.6' })),
    ...proverbs.map((item) => ({ loc: `/proverbs/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.6' })),
    ...communities.map((item) => ({ loc: `/communities/${item._id}`, lastmod: item.updatedAt || item.createdAt, priority: '0.6', changefreq: 'daily' })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(urlNode).join('\n')}
</urlset>
`

  const publicPath = path.join(rootDir, 'public', 'sitemap.xml')
  const distPath = path.join(rootDir, 'dist', 'sitemap.xml')
  fs.writeFileSync(publicPath, xml, 'utf8')
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, xml, 'utf8')
  }

  logger.info(`Sitemap généré: ${urls.length} URL(s)`)
  return { count: urls.length }
}

export { generateSitemap }

if (process.argv[1] && process.argv[1].includes('generateSitemap.js')) {
  generateSitemap()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant la génération du sitemap', { message: error.message, stack: error.stack })
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
