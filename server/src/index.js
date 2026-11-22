import os from 'node:os'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'
import { connectDB } from './config/database.js'
import { initRedis } from './utils/cache.js'
import { initSentry } from './utils/sentry.js'
import env from './config/env.js'
import logger from './utils/logger.js'
import { errorHandler, notFoundHandler } from './utils/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { boundPagination } from './middleware/pagination.js'

// Initialiser Sentry en premier
initSentry()
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import blogRoutes from './routes/blog.js'
import userRoutes from './routes/users.js'
import orderRoutes from './routes/orders.js'
import countryRoutes from './routes/countries.js'
import reviewRoutes from './routes/reviews.js'
import commentRoutes from './routes/comments.js'
import communityRoutes from './routes/community.js'
import communitiesRoutes from './routes/communities.js'
import newsletterRoutes from './routes/newsletter.js'
import uploadRoutes from './routes/upload.js'
import paymentRoutes from './routes/payments.js'
import couponRoutes from './routes/coupons.js'
import settingsRoutes from './routes/settings.js'
import timelineRoutes from './routes/timeline.js'
import sourceRoutes from './routes/sources.js'
import contributionRoutes from './routes/contributions.js'
import figureRoutes from './routes/figures.js'
import collectionRoutes from './routes/collections.js'
import storyRoutes from './routes/stories.js'
import quizRoutes from './routes/quizzes.js'
import ficheRoutes from './routes/fiches.js'
import proverbRoutes from './routes/proverbs.js'
import bookmarkRoutes from './routes/bookmarks.js'
import progressRoutes from './routes/progress.js'
import homeRoutes from './routes/home.js'
import searchRoutes from './routes/search.js'
import recommendationRoutes from './routes/recommendations.js'
import analyticsRoutes from './routes/analytics.js'
import notificationRoutes from './routes/notifications.js'
import monitoringRoutes from './routes/monitoring.js'
import { nosqlInjectionProtection, validateMongoIds } from './middleware/nosqlInjection.js'

const app = express()

// Le serveur tourne derrière Nginx sur le VPS : on lit X-Forwarded-For (IP réelle du visiteur,
// utilisée par les limites de requêtes) uniquement quand la connexion vient de cette machine,
// c'est-à-dire de nginx. Une requête envoyée directement sur le port 3000 depuis Internet
// garde sa vraie IP : un X-Forwarded-For forgé ne permet plus de contourner les limites.
const localAddresses = new Set(
  Object.values(os.networkInterfaces()).flat().filter(Boolean).map((iface) => iface.address),
)
const isLocalAddress = (address = '') => {
  const ip = address.replace(/^::ffff:/, '')
  return ip === '::1' || ip.startsWith('127.') || localAddresses.has(ip)
}
app.set('trust proxy', (address, hop) => hop === 0 && isLocalAddress(address))

// Connexion à Redis (optionnel)
initRedis().catch((error) => {
  logger.warn(' Redis non disponible - Le cache est désactivé:', error.message)
})

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: env.NODE_ENV === 'production' ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false, // Peut causer des problèmes avec certaines intégrations
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: env.CORS_ORIGIN || false,
  credentials: true,
}))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Protection NoSQL Injection (avant les routes)
app.use('/api/', nosqlInjectionProtection)

// Rate limiting global
app.use('/api/', apiLimiter)

// Pagination : bornes communes à toutes les listes (sauf /api/products, qui a son validateur)
app.use('/api/', boundPagination)

// Documentation Swagger: désactivée par défaut en production.
if (env.NODE_ENV !== 'production' || env.ENABLE_API_DOCS) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MonBaobab API Documentation'
  }))
}

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'MonBaobab API',
    version: '1.0.0',
    description: 'API complète pour la plateforme MonBaobab - Découvrez et promouvez les valeurs, l\'histoire et les produits de l\'Afrique',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      documentation: '/api-docs',
      auth: '/api/auth',
      products: '/api/products',
      blog: '/api/blog',
      users: '/api/users',
      orders: '/api/orders',
      countries: '/api/countries',
      timeline: '/api/timeline',
      figures: '/api/figures',
      stories: '/api/stories',
      collections: '/api/collections',
      quizzes: '/api/quizzes',
      proverbs: '/api/proverbs',
      communities: '/api/communities',
      contributions: '/api/contributions',
      sources: '/api/sources',
      search: '/api/search',
      recommendations: '/api/recommendations',
      analytics: '/api/analytics',
      notifications: '/api/notifications',
      monitoring: '/api/monitoring'
    }
  })
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MonBaobab API is running', timestamp: new Date().toISOString() })
})

// Routes avec rate limiting spécifique pour l'auth
// Limites de débit appliquées route par route dans routes/auth.js
app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/countries', countryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/communities', communitiesRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/sources', sourceRoutes)
app.use('/api/contributions', contributionRoutes)
app.use('/api/figures', figureRoutes)
app.use('/api/collections', collectionRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/proverbs', proverbRoutes)
app.use('/api/fiches', ficheRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api', homeRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/monitoring', monitoringRoutes)

// Route 404
app.use(notFoundHandler)

// Gestionnaire d'erreurs global
app.use(errorHandler)

try {
  await connectDB()

  // Adresses lisibles pour les contenus qui n'en ont pas encore (avant la génération SEO)
  try {
    const { ensureSlugs } = await import('./utils/slug.js')
    const load = async (name) => (await import(`./models/${name}.js`)).default
    await ensureSlugs([
      [await load('HistoricalFigure'), 'name'],
      [await load('Blog'), 'title'],
      [await load('Story'), 'title'],
      [await load('Collection'), 'title'],
      [await load('TimelineEvent'), 'title'],
    ])
  } catch (error) {
    logger.warn(`Slugs : attribution impossible — ${error.message}`)
  }

  // Pages SEO pré-générées (meta, aperçus de partage, contenu lisible sans JS) :
  // régénérées au démarrage puis toutes les 30 min pour inclure les nouveaux contenus.
  // Activé seulement si SEO_DIST_DIR pointe vers le dossier dist servi par nginx.
  if (process.env.SEO_DIST_DIR) {
    const { buildSeo } = await import('./scripts/buildSeo.js')
    const refreshSeo = () =>
      buildSeo()
        .then((count) => logger.info(`SEO : ${count} pages régénérées`))
        .catch((error) => logger.warn(`SEO : régénération impossible — ${error.message}`))
    setTimeout(refreshSeo, 10_000)
    setInterval(refreshSeo, 30 * 60 * 1000).unref()
  }

  // HOST permet de restreindre l'écoute (ex. HOST=127.0.0.1 si nginx passe par la boucle locale)
  const listenArgs = process.env.HOST ? [env.PORT, process.env.HOST] : [env.PORT]
  app.listen(...listenArgs, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`)
    logger.info(`API Documentation: http://localhost:${env.PORT}/api-docs`)
    logger.info(`Environment: ${env.NODE_ENV}`)
  })
} catch (error) {
  logger.error(`Impossible de démarrer le serveur: ${error.message}`)
  logger.error('Démarrez MongoDB localement ou configurez MONGODB_URI dans server/.env')
  process.exit(1)
}
