import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import Fiche from '../src/models/Fiche.js'
import User from '../src/models/User.js'
import ficheRoutes from '../src/routes/fiches.js'
import { importer } from '../src/scripts/importerBaseAfrique.js'
import { generateToken } from '../src/utils/jwt.js'
import { errorHandler } from '../src/utils/errorHandler.js'

// Base de connaissances : import des fiches pays (données réelles du Sénégal) et API de relecture
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_fiches'
jest.setTimeout(60000)

let app
let admin
const auth = (user) => ({ Authorization: `Bearer ${generateToken(user._id.toString())}` })

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  await Fiche.init()
  app = express()
  app.use(express.json())
  app.use('/api/fiches', ficheRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Promise.all([Fiche.deleteMany({}), User.deleteMany({})])
  const { insertedId } = await User.collection.insertOne({ name: 'Relectrice', email: 'relecture@example.com', password: 'x', role: 'admin', isActive: true })
  admin = { _id: insertedId }
})

describe('Import', () => {
  it('crée une fiche par élément, avec ses sources résolues', async () => {
    const bilan = await importer({ codes: ['SN'] })
    expect(bilan.crees).toBeGreaterThan(50)
    const pays = await Fiche.findOne({ ficheId: 'SN-pays' }).lean()
    expect(pays.type).toBe('pays')
    const site = await Fiche.findOne({ pays: 'SN', type: 'site' }).lean()
    expect(site.sources.length).toBeGreaterThan(0)
    expect(site.sources[0].url).toMatch(/^https?:\/\//)
    expect(site.statut).toBe('en_revue')
  })

  it('ne change rien à un second import identique', async () => {
    await importer({ codes: ['SN'] })
    const bilan = await importer({ codes: ['SN'] })
    expect(bilan.crees).toBe(0)
    expect(bilan.mis_a_jour).toBe(0)
    expect(bilan.inchanges).toBeGreaterThan(50)
  })

  it('ne touche jamais une fiche validée : elle est seulement signalée', async () => {
    await importer({ codes: ['SN'] })
    const fiche = await Fiche.findOne({ pays: 'SN', type: 'tradition' })
    await Fiche.updateOne({ _id: fiche._id }, { $set: { statut: 'publie', description: 'Texte relu par l’équipe.', empreinte: 'ancienne' } })
    const bilan = await importer({ codes: ['SN'] })
    expect(bilan.signales).toBe(1)
    const apres = await Fiche.findById(fiche._id).lean()
    expect(apres.statut).toBe('publie')
    expect(apres.description).toBe('Texte relu par l’équipe.')
    expect(apres.miseAJourDisponible).toBe(true)
  })
})

describe('API', () => {
  beforeEach(() => importer({ codes: ['SN'] }))

  it('le public ne voit que les fiches publiées', async () => {
    expect((await request(app).get('/api/fiches?pays=SN')).body.pagination.total).toBe(0)
    const fiche = await Fiche.findOne({ pays: 'SN', type: 'site', sensible: false })
    expect((await request(app).get(`/api/fiches/${fiche.ficheId}`)).status).toBe(404)
    await Fiche.updateOne({ _id: fiche._id }, { statut: 'publie' })
    const liste = await request(app).get('/api/fiches?pays=SN&type=site')
    expect(liste.body.pagination.total).toBe(1)
    expect(liste.body.fiches[0].empreinte).toBeUndefined()
  })

  it('l’équipe voit tout, avec la couverture par pays', async () => {
    const liste = await request(app).get('/api/fiches/admin?pays=SN&statut=en_revue').set(auth(admin))
    expect(liste.body.pagination.total).toBeGreaterThan(50)
    const stats = await request(app).get('/api/fiches/admin/stats').set(auth(admin))
    expect(stats.body.pays.SN.total).toBeGreaterThan(50)
  })

  it('refuse l’administration sans compte', async () => {
    expect((await request(app).get('/api/fiches/admin')).status).toBe(401)
  })

  it('publie une fiche avec historique, et exige une validation pour un contenu sensible', async () => {
    const simple = await Fiche.findOne({ pays: 'SN', sensible: false, type: 'langue' })
    const ok = await request(app).patch(`/api/fiches/${simple.ficheId}/statut`).set(auth(admin)).send({ statut: 'publie' })
    expect(ok.status).toBe(200)
    expect(ok.body.historique.at(-1).statut).toBe('publie')

    const sensible = await Fiche.findOne({ pays: 'SN', sensible: true })
    const refus = await request(app).patch(`/api/fiches/${sensible.ficheId}/statut`).set(auth(admin)).send({ statut: 'publie' })
    expect(refus.status).toBe(400)
    const valide = await request(app)
      .patch(`/api/fiches/${sensible.ficheId}/statut`)
      .set(auth(admin))
      .send({ statut: 'publie', note: 'Relue avec le comité culturel de la communauté concernée' })
    expect(valide.status).toBe(200)
  })

  it('publie d’un coup les fiches validées, sauf les contenus sensibles', async () => {
    await Fiche.updateMany({ pays: 'SN', type: 'tradition' }, { statut: 'valide_expert' })
    const sensibles = await Fiche.countDocuments({ pays: 'SN', type: 'tradition', sensible: true })
    const res = await request(app).post('/api/fiches/admin/publier-validees').set(auth(admin)).send({ pays: 'SN', type: 'tradition' })
    expect(res.status).toBe(200)
    expect(res.body.publiees).toBe((await Fiche.countDocuments({ pays: 'SN', type: 'tradition' })) - sensibles)
    expect(await Fiche.countDocuments({ pays: 'SN', type: 'tradition', sensible: true, statut: 'publie' })).toBe(0)
    expect((await request(app).get('/api/fiches?pays=SN&type=tradition')).body.pagination.total).toBe(res.body.publiees)
  })
})
