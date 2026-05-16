import swaggerJsdoc from 'swagger-jsdoc'
import env from './env.js'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MonBaobab API',
      version: '1.0.0',
      description: 'API complète pour la plateforme MonBaobab - Découvrez et promouvez les valeurs, l\'histoire et les produits de l\'Afrique',
      contact: {
        name: 'Support MonBaobab',
        email: 'support@baobab.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: env.NODE_ENV === 'production' 
          ? (env.FRONTEND_URL?.replace('http://localhost:5173', 'https://api.baobab.com') || 'https://api.baobab.com')
          : `http://localhost:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenu via /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                details: { type: 'string' }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Masque africain' },
            description: { type: 'string' },
            price: {
              type: 'object',
              properties: {
                fcfa: { type: 'number' },
                eur: { type: 'number' },
                usd: { type: 'number' }
              }
            },
            category: { type: 'string', example: 'Artisanat' },
            images: { type: 'array', items: { type: 'string' } },
            stock: { type: 'number', example: 10 },
            rating: {
              type: 'object',
              properties: {
                average: { type: 'number' },
                count: { type: 'number' }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des utilisateurs' },
      { name: 'Products', description: 'Gestion des produits e-commerce' },
      { name: 'Blog', description: 'Articles de blog' },
      { name: 'Orders', description: 'Commandes et paiements' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Countries', description: 'Informations sur les pays africains' },
      { name: 'Timeline', description: 'Événements historiques' },
      { name: 'Figures', description: 'Personnages historiques' },
      { name: 'Stories', description: 'Récits et histoires' },
      { name: 'Collections', description: 'Collections thématiques' },
      { name: 'Quizzes', description: 'Quiz interactifs' },
      { name: 'Proverbs', description: 'Proverbes africains' },
      { name: 'Communities', description: 'Communautés' },
      { name: 'Search', description: 'Recherche unifiée' },
      { name: 'Recommendations', description: 'Recommandations personnalisées' },
      { name: 'Analytics', description: 'Statistiques et analytics' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Monitoring', description: 'Monitoring de sécurité' }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/index.js'
  ]
}

export const swaggerSpec = swaggerJsdoc(options)
export default swaggerSpec

