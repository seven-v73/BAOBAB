import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Blog from '../models/Blog.js'
import logger from '../utils/logger.js'

dotenv.config()

const blogImageBase = '/content/blog'

const visuals = [
  {
    keywords: ['Marchés africains'],
    image: `${blogImageBase}/marche-mali.webp`,
  },
  {
    keywords: ['Griots', 'conteurs', 'mémoire vivante'],
    image: `${blogImageBase}/griot-kora.webp`,
  },
  {
    keywords: ['Les masques'],
    image: `${blogImageBase}/masque-africain.webp`,
  },
  {
    keywords: ['karité'],
    image: `${blogImageBase}/karite-burkina.webp`,
  },
  {
    keywords: ['Dakar', 'Abidjan', 'Lagos'],
    image: `${blogImageBase}/ville-abidjan.webp`,
  },
  {
    keywords: ['Bogolan'],
    image: `${blogImageBase}/bogolan-mali.webp`,
  },
]

const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const run = async () => {
  await connectDB()

  let updated = 0

  for (const visual of visuals) {
    const expression = visual.keywords.map((keyword) => normalize(keyword)).join('|')
    const blogs = await Blog.find()

    for (const blog of blogs) {
      const title = normalize(blog.title || '')
      if (!new RegExp(expression, 'i').test(title)) continue

      blog.image = visual.image
      await blog.save()
      updated += 1
      logger.info('Image article corrigée', { title: blog.title })
    }
  }

  logger.info('Correction des images articles terminée', { updated })
  process.exit(0)
}

run().catch((error) => {
  logger.error('Erreur correction images articles', { error: error.message })
  process.exit(1)
})
