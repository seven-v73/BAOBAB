import request from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import authRoutes from '../src/routes/auth.js'
import User from '../src/models/User.js'
import RefreshToken from '../src/models/RefreshToken.js'
import TwoFactorAuth from '../src/models/TwoFactorAuth.js'
import { generateRefreshToken } from '../src/utils/jwt.js'
import { generateSecret, generateTOTP } from '../src/utils/totp.js'
import { errorHandler } from '../src/utils/errorHandler.js'
import '../src/models/Product.js' // requis par /me (populate des favoris)

// Base de test distincte de la production (supprimée à la fin)
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_sessions'
jest.setTimeout(60000)

const password = 'Kora!River78Sun'
let app
let user

const cookieOf = (res) => (res.headers['set-cookie'] || []).find((c) => c.startsWith('mb_rt='))?.split(';')[0]
const login = () => request(app).post('/api/auth/login').send({ email: 'awa@example.com', password })

beforeAll(async () => {
  await mongoose.connect(testMongoUri)
  app = express()
  app.set('trust proxy', 1)
  app.use(express.json())
  app.use('/api/auth', authRoutes)
  app.use(errorHandler)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), RefreshToken.deleteMany({}), TwoFactorAuth.deleteMany({})])
  user = await User.create({ name: 'Awa', email: 'awa@example.com', password })
})

describe('Session et cookie', () => {
  it('la connexion pose un cookie httpOnly et ne renvoie pas le refresh token', async () => {
    const res = await login()
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).toBeUndefined()
    expect(res.body.user).toMatchObject({ email: 'awa@example.com', id: String(user._id) })
    const raw = res.headers['set-cookie'].find((c) => c.startsWith('mb_rt='))
    expect(raw).toMatch(/HttpOnly/i)
    expect(raw).toMatch(/SameSite=Strict/i)
    expect(raw).toMatch(/Path=\/api\/auth/i)
  })

  it('stocke une empreinte du jeton, jamais le jeton lui-même', async () => {
    const res = await login()
    const token = decodeURIComponent(cookieOf(res).slice('mb_rt='.length))
    const stored = await RefreshToken.findOne({ user: user._id })
    expect(stored.token).not.toBe(token)
    expect(stored.token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('se connecter sur un nouvel appareil ne déconnecte pas les autres', async () => {
    const first = cookieOf(await login())
    await login()
    const res = await request(app).post('/api/auth/refresh').set('Cookie', first)
    expect(res.status).toBe(200)
  })

  it('le refresh token ne peut pas servir de jeton d’accès', async () => {
    const refresh = generateRefreshToken(user._id)
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${refresh}`)
    expect(res.status).toBe(401)
  })

  it('/me fonctionne avec le jeton d’accès et renvoie un id', async () => {
    const { body } = await login()
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(String(user._id))
    expect(res.body.password).toBeUndefined()
  })
})

describe('Rafraîchissement', () => {
  it('fait tourner le jeton et renvoie un nouvel accès', async () => {
    const first = cookieOf(await login())
    const res = await request(app).post('/api/auth/refresh').set('Cookie', first)
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(cookieOf(res)).toBeDefined()
    expect(cookieOf(res)).not.toBe(first)
  })

  it('tolère deux onglets qui rafraîchissent en même temps', async () => {
    const first = cookieOf(await login())
    const a = await request(app).post('/api/auth/refresh').set('Cookie', first)
    const b = await request(app).post('/api/auth/refresh').set('Cookie', first) // même ancien jeton, juste après
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    // La session issue de la rotation reste valide
    expect((await request(app).post('/api/auth/refresh').set('Cookie', cookieOf(a))).status).toBe(200)
  })

  it('détecte le rejeu d’un ancien jeton et ferme toutes les sessions', async () => {
    const first = cookieOf(await login())
    const rotated = cookieOf(await request(app).post('/api/auth/refresh').set('Cookie', first))
    // Simule un rejeu tardif (hors fenêtre de tolérance)
    await RefreshToken.updateMany({ revokedReason: 'rotated' }, { revokedAt: new Date(Date.now() - 60 * 60 * 1000) })
    expect((await request(app).post('/api/auth/refresh').set('Cookie', first)).status).toBe(401)
    expect((await request(app).post('/api/auth/refresh').set('Cookie', rotated)).status).toBe(401)
  })

  it('accepte encore l’ancien format (jeton dans le corps) pour migrer en douceur', async () => {
    const legacy = generateRefreshToken(user._id)
    await RefreshToken.create({ token: legacy, user: user._id, expiresAt: new Date(Date.now() + 86400000) })
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: legacy })
    expect(res.status).toBe(200)
    expect(cookieOf(res)).toBeDefined()
  })

  it('sans session : 401 propre', async () => {
    expect((await request(app).post('/api/auth/refresh')).status).toBe(401)
  })
})

describe('Déconnexion et appareils', () => {
  it('la déconnexion fonctionne sans jeton d’accès et invalide la session', async () => {
    const cookie = cookieOf(await login())
    expect((await request(app).post('/api/auth/logout').set('Cookie', cookie)).status).toBe(200)
    expect((await request(app).post('/api/auth/refresh').set('Cookie', cookie)).status).toBe(401)
  })

  it('liste les appareils et en déconnecte un', async () => {
    const phone = cookieOf(await login())
    const laptop = await login()
    const list = await request(app).get('/api/auth/sessions').set('Authorization', `Bearer ${laptop.body.token}`).set('Cookie', cookieOf(laptop))
    expect(list.body).toHaveLength(2)
    expect(list.body.filter((s) => s.current)).toHaveLength(1)
    const other = list.body.find((s) => !s.current)
    expect((await request(app).delete(`/api/auth/sessions/${other.id}`).set('Authorization', `Bearer ${laptop.body.token}`)).status).toBe(200)
    expect((await request(app).post('/api/auth/refresh').set('Cookie', phone)).status).toBe(401)
  })

  it('changer de mot de passe garde cet appareil connecté et déconnecte les autres', async () => {
    const phone = cookieOf(await login())
    const laptop = await login()
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${laptop.body.token}`)
      .send({ currentPassword: password, newPassword: 'Baobab!Tree42Sea' })
    expect(res.status).toBe(200)
    expect(cookieOf(res)).toBeDefined()
    expect((await request(app).post('/api/auth/refresh').set('Cookie', phone)).status).toBe(401)
    expect((await request(app).post('/api/auth/refresh').set('Cookie', cookieOf(res))).status).toBe(200)
  })
})

describe('Double authentification', () => {
  let secret
  beforeEach(async () => {
    secret = generateSecret()
    await TwoFactorAuth.create({ user: user._id, secret, enabled: true, backupCodes: [{ code: 'ABCD2345', used: false }] })
  })

  it('aucun jeton avant le code : seulement un défi', async () => {
    const res = await login()
    expect(res.status).toBe(200)
    expect(res.body.requires2FA).toBe(true)
    expect(res.body.challengeToken).toBeDefined()
    expect(res.body.token).toBeUndefined()
    expect(cookieOf(res)).toBeUndefined()
  })

  it('le défi ne permet pas d’accéder à l’API', async () => {
    const { body } = await login()
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.challengeToken}`)).status).toBe(401)
  })

  it('code correct : session ouverte', async () => {
    const { body } = await login()
    const res = await request(app).post('/api/auth/2fa/verify-login').send({ challengeToken: body.challengeToken, token: generateTOTP(secret) })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(cookieOf(res)).toBeDefined()
  })

  it('code de secours utilisable une seule fois', async () => {
    const { body } = await login()
    expect((await request(app).post('/api/auth/2fa/verify-login').send({ challengeToken: body.challengeToken, backupCode: 'abcd2345' })).status).toBe(200)
    const again = await login()
    expect((await request(app).post('/api/auth/2fa/verify-login').send({ challengeToken: again.body.challengeToken, backupCode: 'ABCD2345' })).status).toBe(401)
  })

  it('impossible sans le défi (on ne peut plus tenter des codes avec un simple e-mail)', async () => {
    const res = await request(app).post('/api/auth/2fa/verify-login').send({ email: 'awa@example.com', token: generateTOTP(secret) })
    expect(res.status).toBe(400)
  })
})
