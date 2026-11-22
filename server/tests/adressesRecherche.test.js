import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import figureRoutes from '../src/routes/figures.js'
import searchRoutes from '../src/routes/search.js'
import HistoricalFigure from '../src/models/HistoricalFigure.js'
import Country from '../src/models/Country.js'
import { errorHandler } from '../src/utils/errorHandler.js'
import { ensureSlugs, slugify } from '../src/utils/slug.js'
import { safeRegExp } from '../src/utils/regex.js'

// Adresses lisibles (/figures/samori-toure) et recherche sans accents
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_adresses'
jest.setTimeout(30000)

let app

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  await HistoricalFigure.init()
  app = express()
  app.use(express.json())
  app.use('/api/figures', figureRoutes)
  app.use('/api/search', searchRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Promise.all([HistoricalFigure.deleteMany({}), Country.deleteMany({})])
})

describe('slugify', () => {
  test('retire accents, apostrophes et ligatures', () => {
    expect(slugify('Samori Touré')).toBe('samori-toure')
    expect(slugify('Les cités swahilies, portes de l’océan Indien')).toBe('les-cites-swahilies-portes-de-l-ocean-indien')
    expect(slugify('Œuvre & cœur')).toBe('oeuvre-coeur')
  })
})

describe('adresses lisibles', () => {
  test('attribuée à la création, unique, et l’ancienne adresse marche encore', async () => {
    const a = await HistoricalFigure.create({ name: 'Samori Touré', biography: 'b', shortBiography: 's' })
    const b = await HistoricalFigure.create({ name: 'Samori Touré', biography: 'b', shortBiography: 's' })
    expect(a.slug).toBe('samori-toure')
    expect(b.slug).toBe('samori-toure-2')

    const parSlug = await request(app).get('/api/figures/samori-toure')
    expect(parSlug.status).toBe(200)
    expect(String(parSlug.body._id ?? parSlug.body.figure?._id)).toBe(String(a._id))

    const parId = await request(app).get(`/api/figures/${a._id}`)
    expect(parId.status).toBe(200)

    expect((await request(app).get('/api/figures/inconnu')).status).toBe(404)
    expect((await request(app).get('/api/figures/zzz')).status).toBe(404)
  })

  test('le slug ne change pas quand le nom change', async () => {
    const f = await HistoricalFigure.create({ name: 'Behanzin', biography: 'b', shortBiography: 's' })
    f.name = 'Béhanzin Hossu Bowelé'
    await f.save()
    expect(f.slug).toBe('behanzin')
  })

  test('les contenus anciens reçoivent un slug au démarrage', async () => {
    await HistoricalFigure.collection.insertOne({ name: 'Yaa Asantewaa', isActive: true })
    await ensureSlugs([[HistoricalFigure, 'name']])
    const doc = await HistoricalFigure.findOne({ name: 'Yaa Asantewaa' }).lean()
    expect(doc.slug).toBe('yaa-asantewaa')
  })
})

describe('recherche', () => {
  test('safeRegExp plie les accents sans interpréter les caractères spéciaux', () => {
    expect(safeRegExp('senegal', { fold: true }).test('Sénégal')).toBe(true)
    expect(safeRegExp('cote d ivoire', { fold: true }).test('Côte d’Ivoire')).toBe(true)
    expect(safeRegExp('coeur', { fold: true }).test('cœur')).toBe(true)
    expect(safeRegExp('x.*', { fold: true }).test('xyz')).toBe(false)
  })

  test('« senegal » trouve « Sénégal », sans rubriques en pause', async () => {
    await Country.collection.insertOne({ id: 'SN', name: 'Senegal', nameFr: 'Sénégal', capital: 'Dakar', isActive: true })
    const res = await request(app).get('/api/search').query({ q: 'senegal' })
    expect(res.status).toBe(200)
    expect(res.body.countries.map((c) => c.id)).toEqual(['SN'])
    expect(res.body.products).toEqual([])
    expect(res.body.quizzes).toEqual([])
  })

  test('paramètre q répété : pas d’erreur 500', async () => {
    const res = await request(app).get('/api/search?q=a&q=b')
    expect(res.status).toBe(200)
  })
})
