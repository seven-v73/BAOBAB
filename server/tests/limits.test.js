import request from 'supertest'
import express from 'express'
import { boundPagination, MAX_PAGE_SIZE } from '../src/middleware/pagination.js'
import { registerLimiter, writeLimiter } from '../src/middleware/rateLimiter.js'
import { errorHandler } from '../src/utils/errorHandler.js'

// Limites de l'API : pagination, corps de requête, écritures répétées
const makeApp = () => {
  const app = express()
  app.use(express.json({ limit: '1kb' }))
  app.use('/api/', boundPagination)
  app.get('/api/list', (req, res) => res.json(req.query))
  app.get('/api/products', (req, res) => res.json(req.query))
  app.post('/api/echo', (req, res) => res.json({ ok: true }))
  app.post('/api/like', writeLimiter, (req, res) => res.json({ ok: true }))
  app.post('/api/register', registerLimiter, (req, res) => res.status(201).json({ ok: true }))
  app.use(errorHandler)
  return app
}

describe('Pagination', () => {
  const app = makeApp()

  it('ramène une page négative ou invalide à 1', async () => {
    expect((await request(app).get('/api/list?page=-5')).body.page).toBe('1')
    expect((await request(app).get('/api/list?page=abc')).body.page).toBe('1')
  })

  it(`plafonne la taille de page à ${MAX_PAGE_SIZE}`, async () => {
    expect((await request(app).get('/api/list?limit=100000')).body.limit).toBe(String(MAX_PAGE_SIZE))
    expect((await request(app).get('/api/list?limit=50')).body.limit).toBe('50')
    expect((await request(app).get('/api/list?limit=abc')).body.limit).toBe('20')
  })

  it('laisse /api/products à son propre validateur', async () => {
    expect((await request(app).get('/api/products?limit=1000')).body.limit).toBe('1000')
  })
})

describe('Corps de requête', () => {
  const app = makeApp()

  it('répond 413 (et non 500) à un corps trop volumineux', async () => {
    const res = await request(app).post('/api/echo').send({ x: 'a'.repeat(5000) })
    expect(res.status).toBe(413)
  })

  it('répond 400 (et non 500) à un JSON mal formé', async () => {
    const res = await request(app).post('/api/echo').set('Content-Type', 'application/json').send('{mauvais')
    expect(res.status).toBe(400)
  })
})

describe('Écritures répétées', () => {
  it('bloque au-delà de 30 actions en un quart d’heure', async () => {
    const app = makeApp()
    for (let i = 0; i < 30; i++) expect((await request(app).post('/api/like')).status).toBe(200)
    expect((await request(app).post('/api/like')).status).toBe(429)
  })

  it('compte aussi les inscriptions réussies (10 par heure)', async () => {
    const app = makeApp()
    for (let i = 0; i < 10; i++) expect((await request(app).post('/api/register')).status).toBe(201)
    expect((await request(app).post('/api/register')).status).toBe(429)
  })
})
