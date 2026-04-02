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
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'

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
import figureRoutes from './routes/figures.js'
import collectionRoutes from './routes/collections.js'
import storyRoutes from './routes/stories.js'
import quizRoutes from './routes/quizzes.js'
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

// Connexion à MongoDB
connectDB().catch((error) => {
  logger.error('❌ Erreur de connexion à MongoDB:', error)
  process.exit(1)
})

// Connexion à Redis (optionnel)
initRedis().catch((error) => {
  logger.warn('⚠️  Redis non disponible - Le cache est désactivé:', error.message)
})

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // À ajuster selon vos besoins
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
app.use(cors())

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Protection NoSQL Injection (avant les routes)
app.use('/api/', nosqlInjectionProtection)

// Rate limiting global
app.use('/api/', apiLimiter)

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BAOBAB API Documentation'
}))

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'BAOBAB API',
    version: '1.0.0',
    description: 'API complète pour la plateforme BAOBAB - Découvrez et promouvez les valeurs, l\'histoire et les produits de l\'Afrique',
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
  res.json({ status: 'OK', message: 'BAOBAB API is running', timestamp: new Date().toISOString() })
})

// Routes avec rate limiting spécifique pour l'auth
app.use('/api/auth', authLimiter, authRoutes)
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
app.use('/api/figures', figureRoutes)
app.use('/api/collections', collectionRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/proverbs', proverbRoutes)
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

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`)
  logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api-docs`)
  logger.info(`🌍 Environment: ${env.NODE_ENV}`)
})

