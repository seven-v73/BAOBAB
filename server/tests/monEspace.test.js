import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import bookmarkRoutes from '../src/routes/bookmarks.js'
import contributionRoutes from '../src/routes/contributions.js'
import User from '../src/models/User.js'
import Proverb from '../src/models/Proverb.js'
import Contribution from '../src/models/Contribution.js'
import Bookmark from '../src/models/Bookmark.js'
import { generateToken } from '../src/utils/jwt.js'

// Mon espace : un membre voit toutes ses propositions, et ses favoris arrivent avec leur titre.
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_mon_espace'
let app
let token
let member

jest.setTimeout(30000)

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  app = express()
  app.use(express.json())
  app.use('/api/bookmarks', bookmarkRoutes)
  app.use('/api/contributions', contributionRoutes)

  member = await User.create({ name: 'Membre Test', email: 'membre@example.test', password: 'Kora!River78Sun' })
  const other = await User.create({ name: 'Autre', email: 'autre@example.test', password: 'Kora!River78Sun' })
  token = generateToken(member._id)

  await Contribution.create([
    { type: 'source', title: 'En relecture', content: 'x', status: 'in-review', submittedBy: member._id },
    { type: 'proverb', title: 'À revoir', content: 'x', status: 'rejected', reviewNote: 'Ajoutez une source.', submittedBy: member._id },
    { type: 'proverb', title: 'Publiée ailleurs', content: 'x', status: 'approved', submittedBy: other._id },
  ])
  const proverb = await Proverb.create({ text: 'Un seul arbre ne fait pas une forêt.', explanation: 'x', country: new mongoose.Types.ObjectId(), countryName: 'Burkina Faso' })
  await Bookmark.create({ user: member._id, itemType: 'proverb', itemId: proverb._id })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

it('liste toutes les propositions du membre, avec la note de relecture', async () => {
  const res = await request(app).get('/api/contributions?mine=true').set('Authorization', `Bearer ${token}`)
  expect(res.status).toBe(200)
  const titles = res.body.contributions.map((c) => c.title).sort()
  expect(titles).toEqual(['En relecture', 'À revoir'])
  expect(res.body.contributions.find((c) => c.title === 'À revoir').reviewNote).toBe('Ajoutez une source.')
})

it('ne montre que le publié à un visiteur', async () => {
  const res = await request(app).get('/api/contributions')
  expect(res.body.contributions.map((c) => c.title)).toEqual(['Publiée ailleurs'])
  expect(res.body.contributions[0].reviewNote).toBeUndefined()
})

it('joint l’élément enregistré à chaque favori', async () => {
  const res = await request(app).get('/api/bookmarks').set('Authorization', `Bearer ${token}`)
  expect(res.status).toBe(200)
  expect(res.body.data[0].item).toMatchObject({ text: 'Un seul arbre ne fait pas une forêt.', countryName: 'Burkina Faso' })
})
