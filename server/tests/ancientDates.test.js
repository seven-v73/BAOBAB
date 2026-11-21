import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import TimelineEvent from '../src/models/TimelineEvent.js'
import HistoricalFigure from '../src/models/HistoricalFigure.js'
import { bc, fixAncientDates } from '../src/scripts/fixAncientDates.js'

// Dates avant J.-C. enregistrées par erreur après J.-C. par les anciens scripts de remplissage
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/baobab_test_dates'
jest.setTimeout(30000)

beforeAll(() => mongoose.connect(testMongoUri))
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})
beforeEach(() => Promise.all([TimelineEvent.deleteMany({}), HistoricalFigure.deleteMany({})]))

it('bc() donne la numérotation astronomique (an 0 = 1 av. J.-C.)', () => {
  expect(bc(2500).getUTCFullYear()).toBe(-2499)
  expect(bc(1).getUTCFullYear()).toBe(0)
  expect(bc(216, 8, 2).toISOString()).toBe('-000215-08-02T00:00:00.000Z')
})

it('corrige les dates encore fausses, une seule fois', async () => {
  await TimelineEvent.create({ title: 'Apparition de la civilisation de Kerma', description: 'Kerma.', date: new Date('-2500-01-01') })
  await HistoricalFigure.create({ name: 'Amanirenas', biography: 'Reine de Koush.', birthDate: new Date('-060-01-01'), deathDate: new Date('-010-01-01') })
  // L'erreur d'origine : ces dates sont lues comme 2500 et 1960
  expect((await TimelineEvent.findOne()).date.getUTCFullYear()).toBe(2500)

  expect(await fixAncientDates()).toEqual(['Apparition de la civilisation de Kerma', 'Amanirenas'])
  expect((await TimelineEvent.findOne()).date.getUTCFullYear()).toBe(-2499)
  const figure = await HistoricalFigure.findOne()
  expect(figure.birthDate.getUTCFullYear()).toBe(-59)
  expect(figure.deathDate.getUTCFullYear()).toBe(-9)

  expect(await fixAncientDates()).toEqual([])
})

it('ne touche pas aux dates après J.-C.', async () => {
  await TimelineEvent.create({ title: 'Royaume d’Axoum', description: 'Axoum.', date: new Date('0100-01-01') })
  expect(await fixAncientDates()).toEqual([])
  expect((await TimelineEvent.findOne()).date.getUTCFullYear()).toBe(100)
})
