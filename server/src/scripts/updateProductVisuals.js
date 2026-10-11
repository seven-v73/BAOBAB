import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Product from '../models/Product.js'
import logger from '../utils/logger.js'

dotenv.config()

const productImageBase = '/content/products'

const visuals = [
  {
    keywords: ['Écharpe bogolan', 'Bogolan'],
    image: `${productImageBase}/bogolan-mali.webp`,
  },
  {
    keywords: ['Beurre de karité', 'Karité'],
    image: `${productImageBase}/karite-burkina.webp`,
  },
  {
    keywords: ['Panier tressé', 'Panier'],
    image: `${productImageBase}/panier-africain.webp`,
  },
  {
    keywords: ['Collier perles Akan', 'Perles Akan', 'Akan'],
    image: `${productImageBase}/perles-akan.webp`,
  },
  {
    keywords: ['Carnet de proverbes', 'Proverbes'],
    image: `${productImageBase}/carnet-transmission.webp`,
  },
  {
    keywords: ['Set épices', 'Épices', 'Cuisine ouest-africaine'],
    image: `${productImageBase}/epices-nigeria.webp`,
  },
  {
    keywords: ['Mini djembé', 'Djembé'],
    image: `${productImageBase}/djembe-guinee.webp`,
  },
  {
    keywords: ['Affiche carte', 'Carte culturelle'],
    image: `${productImageBase}/carte-afrique-culturelle.webp`,
  },
]

const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const run = async () => {
  await connectDB()

  const products = await Product.find()
  let updated = 0

  for (const product of products) {
    const name = normalize(product.name || '')
    const visual = visuals.find((item) =>
      item.keywords.some((keyword) => name.includes(normalize(keyword)))
    )

    if (!visual) continue

    product.images = [visual.image]
    if (Array.isArray(product.additionalImages)) {
      product.additionalImages = product.additionalImages.filter((image) =>
        image?.url && !String(image.url).includes('images.unsplash.com')
      )
    }
    await product.save()
    updated += 1
    logger.info('Image produit corrigée', { name: product.name })
  }

  logger.info('Correction des images produits terminée', { updated })
  process.exit(0)
}

run().catch((error) => {
  logger.error('Erreur correction images produits', { error: error.message })
  process.exit(1)
})
