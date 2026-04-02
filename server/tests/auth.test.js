import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import authRoutes from '../src/routes/auth.js'
import '../src/models/User.js' // Charger le modèle

let mongoServer
let app

beforeAll(async () => {
  // Créer un serveur MongoDB en mémoire pour les tests
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  
  await mongoose.connect(mongoUri)
  
  app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  // Nettoyer la base de données avant chaque test
  await User.deleteMany({})
})

describe('POST /api/auth/register', () => {
  it('devrait créer un nouvel utilisateur', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user).toHaveProperty('email', 'test@example.com')
    expect(response.body.data).toHaveProperty('token')
  })

  it('devrait rejeter un email invalide', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'SecurePassword123!',
        name: 'Test User'
      })
    
    expect(response.status).toBe(400)
  })

  it('devrait rejeter un mot de passe trop court', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User'
      })
    
    expect(response.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Créer un utilisateur de test
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User'
      })
  })

  it('devrait connecter un utilisateur avec des identifiants valides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePassword123!'
      })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('token')
  })

  it('devrait rejeter un mot de passe incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123!'
      })
    
    expect(response.status).toBe(401)
  })
})

