import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import authRoutes from '../src/routes/auth.js'
import User from '../src/models/User.js'

let app
const validPassword = 'Kora!River78Sun'
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test'

jest.setTimeout(30000)

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  
  app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
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
        password: validPassword,
        name: 'Test User'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.user).toHaveProperty('email', 'test@example.com')
    expect(response.body).toHaveProperty('token')
  })

  it('devrait rejeter un email invalide', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: validPassword,
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
        password: validPassword,
        name: 'Test User'
      })
  })

  it('devrait connecter un utilisateur avec des identifiants valides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: validPassword
      })
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
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
