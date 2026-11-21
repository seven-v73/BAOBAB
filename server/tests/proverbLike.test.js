import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import proverbRoutes from '../src/routes/proverbs.js'
import Proverb from '../src/models/Proverb.js'
import User from '../src/models/User.js'
import { generateToken } from '../src/utils/jwt.js'
import { errorHandler } from '../src/utils/errorHandler.js'
import { writeLimiter } from '../src/middleware/rateLimiter.js'

// « J'aime » sur un proverbe : réservé aux membres, un seul par compte
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_likes'
jest.setTimeout(30000)

let app
let proverb
let awa
let kofi
const auth = (user) => ({ Authorization: `Bearer ${generateToken(user._id.toString())}` })
const like = (user) => {
  const req = request(app).post(`/api/proverbs/${proverb._id}/like`)
  return user ? req.set(auth(user)) : req
}

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  app = express()
  app.use(express.json())
  app.use('/api/proverbs', proverbRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Promise.all([Proverb.deleteMany({}), User.deleteMany({})])
  await writeLimiter.resetKey('127.0.0.1')
  const make = (name, email) => User.collection.insertOne({ name, email, password: 'x', role: 'user', isActive: true }).then(({ insertedId }) => ({ _id: insertedId }))
  awa = await make('Awa', 'awa@example.com')
  kofi = await make('Kofi', 'kofi@example.com')
  proverb = await Proverb.create({ text: 'L’homme est le remède de l’homme.', explanation: 'Entraide.', country: new mongoose.Types.ObjectId(), countryName: 'Sénégal', language: 'wolof' })
})

it('refuse un « j’aime » sans compte', async () => {
  expect((await like()).status).toBe(401)
  expect((await Proverb.findById(proverb._id)).likes).toBe(0)
})

it('compte un seul « j’aime » par membre', async () => {
  expect((await like(awa)).body.data).toMatchObject({ likes: 1, liked: true })
  expect((await like(awa)).body.data).toMatchObject({ likes: 1, alreadyLiked: true })
  expect((await like(kofi)).body.data.likes).toBe(2)
})

it('des clics simultanés du même membre ne comptent qu’une fois', async () => {
  await Promise.all(Array.from({ length: 8 }, () => like(awa)))
  expect((await Proverb.findById(proverb._id)).likes).toBe(1)
})

it('ne publie pas la liste des membres qui ont aimé', async () => {
  await like(awa)
  const res = await request(app).get(`/api/proverbs/${proverb._id}`)
  expect(JSON.stringify(res.body)).not.toContain('likedBy')
})
