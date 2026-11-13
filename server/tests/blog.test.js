import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import blogRoutes from '../src/routes/blog.js'
import Blog from '../src/models/Blog.js'
import User from '../src/models/User.js'
import { generateToken } from '../src/utils/jwt.js'
import { errorHandler } from '../src/utils/errorHandler.js'

// Base de test distincte de la production (supprimée à la fin)
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test'
jest.setTimeout(30000)

let app
let author
let other
let admin
const auth = (user) => ({ Authorization: `Bearer ${generateToken(user._id.toString())}` })

const longText = 'Un savoir transmis avec soin, phrase après phrase, pour que chacun puisse le lire. '.repeat(10)
const testimony = { title: 'Le marché de mon enfance', content: longText, kind: 'temoignage', category: 'Société' }

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  app = express()
  app.use(express.json())
  app.use('/api/blog', blogRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const make = (name, email, role) => User.collection.insertOne({ name, email, password: 'x', role, isActive: true }).then(({ insertedId }) => ({ _id: insertedId, name, role }))
  author = await make('Awa', 'awa@example.com', 'user')
  other = await make('Moussa', 'moussa@example.com', 'user')
  admin = await make('Admin', 'admin@example.com', 'admin')
})

describe('Contribution d’un membre', () => {
  it('passe toujours en relecture, même si le membre demande la publication', async () => {
    const res = await request(app)
      .post('/api/blog')
      .set(auth(author))
      .send({ ...testimony, published: true, status: 'published', author: 'Quelqu’un d’autre' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('pending')
    expect(res.body.published).toBe(false)
    expect(res.body.author).toBe('Awa') // pas d'usurpation du nom d'auteur
  })

  it('refuse un article de savoir sans source', async () => {
    const res = await request(app).post('/api/blog').set(auth(author)).send({ ...testimony, kind: 'savoir' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/source/i)
  })

  it('refuse un texte trop court', async () => {
    const res = await request(app).post('/api/blog').set(auth(author)).send({ ...testimony, content: 'Bien trop court pour être soumis.' })
    expect(res.status).toBe(400)
  })

  it('accepte un brouillon incomplet', async () => {
    const res = await request(app).post('/api/blog').set(auth(author)).send({ ...testimony, content: 'Début de texte…', status: 'draft' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
  })

  it('ne garde que les liens http(s) dans les références', async () => {
    const res = await request(app)
      .post('/api/blog')
      .set(auth(author))
      .send({ ...testimony, kind: 'savoir', references: [{ title: 'Source', url: 'https://example.org' }, { title: 'Piège' }] })
    expect(res.status).toBe(201)
    expect(res.body.references).toHaveLength(2)
    expect(res.body.references[0].url).toBe('https://example.org')
  })

  it('rejette un lien de référence non http(s)', async () => {
    const res = await request(app)
      .post('/api/blog')
      .set(auth(author))
      .send({ ...testimony, kind: 'savoir', references: [{ title: 'Source', url: 'javascript:alert(1)' }] })
    expect(res.status).toBe(400)
  })
})

describe('Visibilité', () => {
  let pendingId
  beforeEach(async () => {
    const res = await request(app).post('/api/blog').set(auth(author)).send(testimony)
    pendingId = res.body._id
  })

  it('un texte en relecture est invisible du public', async () => {
    const list = await request(app).get('/api/blog')
    expect(list.body.find((b) => b._id === pendingId)).toBeUndefined()
    const one = await request(app).get(`/api/blog/${pendingId}`)
    expect(one.status).toBe(404)
  })

  it('l’auteur voit son texte, un autre membre non', async () => {
    expect((await request(app).get(`/api/blog/${pendingId}`).set(auth(author))).status).toBe(200)
    expect((await request(app).get(`/api/blog/${pendingId}`).set(auth(other))).status).toBe(404)
  })

  it('« mes textes » ne renvoie que les textes de l’auteur', async () => {
    const mine = await request(app).get('/api/blog?mine=true').set(auth(author))
    expect(mine.body).toHaveLength(1)
    const others = await request(app).get('/api/blog?mine=true').set(auth(other))
    expect(others.body).toHaveLength(0)
  })

  it('l’admin voit la file de relecture', async () => {
    const res = await request(app).get('/api/blog?status=pending').set(auth(admin))
    expect(res.body.map((b) => b._id)).toContain(pendingId)
  })
})

describe('Modération', () => {
  let id
  beforeEach(async () => {
    id = (await request(app).post('/api/blog').set(auth(author)).send(testimony)).body._id
  })

  it('un membre ne peut pas modérer', async () => {
    expect((await request(app).patch(`/api/blog/${id}/review`).set(auth(author)).send({ decision: 'approve' })).status).toBe(403)
  })

  it('un autre membre ne peut ni modifier ni supprimer', async () => {
    expect((await request(app).put(`/api/blog/${id}`).set(auth(other)).send(testimony)).status).toBe(403)
    expect((await request(app).delete(`/api/blog/${id}`).set(auth(other))).status).toBe(403)
  })

  it('renvoi à l’auteur avec une note, puis nouvelle soumission', async () => {
    const rejected = await request(app).patch(`/api/blog/${id}/review`).set(auth(admin)).send({ decision: 'reject', note: 'Précisez la ville.' })
    expect(rejected.body.status).toBe('rejected')
    expect(rejected.body.reviewNote).toBe('Précisez la ville.')

    const resubmitted = await request(app).put(`/api/blog/${id}`).set(auth(author)).send({ ...testimony, title: 'Le marché de Sor, à Saint-Louis' })
    expect(resubmitted.status).toBe(200)
    expect(resubmitted.body.status).toBe('pending')
    expect(resubmitted.body.reviewNote).toBe('')
  })

  it('publication par l’admin : visible du public, plus modifiable par l’auteur', async () => {
    const approved = await request(app).patch(`/api/blog/${id}/review`).set(auth(admin)).send({ decision: 'approve' })
    expect(approved.body.status).toBe('published')
    expect(approved.body.published).toBe(true)

    const list = await request(app).get('/api/blog')
    expect(list.body.map((b) => b._id)).toContain(id)

    expect((await request(app).put(`/api/blog/${id}`).set(auth(author)).send(testimony)).status).toBe(403)
    expect((await request(app).delete(`/api/blog/${id}`).set(auth(author))).status).toBe(403)
    expect((await request(app).delete(`/api/blog/${id}`).set(auth(admin))).status).toBe(200)
  })

  it('les vues ne comptent que pour les textes publiés', async () => {
    await request(app).get(`/api/blog/${id}`).set(auth(author))
    expect((await Blog.findById(id)).views).toBe(0)
    await request(app).patch(`/api/blog/${id}/review`).set(auth(admin)).send({ decision: 'approve' })
    await request(app).get(`/api/blog/${id}`)
    expect((await Blog.findById(id)).views).toBe(1)
  })
})
