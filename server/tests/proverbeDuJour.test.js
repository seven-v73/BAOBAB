import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import proverbRoutes from '../src/routes/proverbs.js'
import Proverb from '../src/models/Proverb.js'
import { errorHandler } from '../src/utils/errorHandler.js'
import { choisirIndexDuJour } from '../src/controllers/proverbController.js'

// Proverbe du jour : identique pour tout le monde toute la journée
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_proverbe_du_jour'
jest.setTimeout(30000)

let app
const hier = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  app = express()
  app.use('/api/proverbs', proverbRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Proverb.deleteMany({})
  const docs = Array.from({ length: 12 }, (_, i) => ({
    text: `Proverbe ${i + 1}`,
    country: new mongoose.Types.ObjectId(),
    countryName: 'Sénégal',
    language: 'wolof',
    explanation: 'Test.',
    createdAt: hier,
    updatedAt: hier,
  }))
  await Proverb.collection.insertMany(docs)
})

test('le même proverbe à chaque appel de la journée', async () => {
  const a = await request(app).get('/api/proverbs/du-jour')
  const b = await request(app).get('/api/proverbs/du-jour')
  expect(a.status).toBe(200)
  expect(a.body.data.text).toBe(b.body.data.text)
  expect(a.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(a.headers['cache-control']).toMatch(/public/)
})

test('un proverbe ajouté aujourd’hui ne change pas celui du jour', async () => {
  const avant = await request(app).get('/api/proverbs/du-jour')
  await Proverb.create({ text: 'Ajouté ce matin', explanation: 'Test.', country: new mongoose.Types.ObjectId(), countryName: 'Mali', language: 'bambara' })
  const apres = await request(app).get('/api/proverbs/du-jour')
  expect(apres.body.data.text).toBe(avant.body.data.text)
})

test('le tirage parcourt tous les proverbes avant de se répéter', () => {
  for (const total of [1, 12, 87, 200]) {
    const vus = new Set(Array.from({ length: total }, (_, jour) => choisirIndexDuJour(20000 + jour, total)))
    expect(vus.size).toBe(total)
  }
  expect(choisirIndexDuJour(5, 0)).toBe(-1)
})

test('aucun proverbe : 404 propre', async () => {
  await Proverb.deleteMany({})
  expect((await request(app).get('/api/proverbs/du-jour')).status).toBe(404)
})
