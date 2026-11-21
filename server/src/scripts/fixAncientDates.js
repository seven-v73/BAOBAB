// Corrige les dates avant J.-C. enregistrées par erreur après J.-C.
//
// Les scripts de remplissage écrivaient new Date('-2500-01-01') : JavaScript n'y lit pas une année
// négative et enregistre l'an 2500 (et 1960 pour '-060-01-01'). Résultat : Kerma « en 2500 »,
// Amanirenas « née en 1960 ». Les années anciennes sont stockées en numérotation astronomique
// (an 0 = 1 av. J.-C.), que le site affiche « 2500 av. J.-C. ».
//
// Sans risque à relancer : seules les dates encore positives sont corrigées.
import 'dotenv/config'
import mongoose from 'mongoose'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'

/** Date avant J.-C. : bc(2500) = 2500 av. J.-C. (année astronomique -2499) */
export const bc = (yearBC, month = 1, day = 1) => {
  const date = new Date(Date.UTC(2000, month - 1, day))
  date.setUTCFullYear(1 - yearBC)
  return date
}

const EVENTS = [
  ['Construction des Pyramides de Gizeh', bc(2580)],
  ['Apparition de la civilisation de Kerma', bc(2500)],
  ['Fondation et expansion de Carthage', bc(814)],
  ['Essor du royaume de Koush à Napata', bc(800)],
  ['Méroé, capitale du royaume de Koush', bc(300)],
  ['Victoire d’Hannibal à Cannes', bc(216, 8, 2)],
]

const FIGURES = [
  ['Hannibal Barca', bc(247), bc(183)],
  ['Amanirenas', bc(60), bc(10)],
]

const stillWrong = (date) => date && new Date(date).getUTCFullYear() > 0

export const fixAncientDates = async () => {
  const fixed = []
  for (const [title, date] of EVENTS) {
    const event = await TimelineEvent.findOne({ title })
    if (event && stillWrong(event.date)) {
      await TimelineEvent.updateOne({ _id: event._id }, { $set: { date } })
      fixed.push(title)
    }
  }
  for (const [name, birthDate, deathDate] of FIGURES) {
    const figure = await HistoricalFigure.findOne({ name })
    if (!figure) continue
    const update = {}
    if (stillWrong(figure.birthDate)) update.birthDate = birthDate
    if (stillWrong(figure.deathDate)) update.deathDate = deathDate
    if (Object.keys(update).length) {
      await HistoricalFigure.updateOne({ _id: figure._id }, { $set: update })
      fixed.push(name)
    }
  }
  return fixed
}

if (process.argv[1]?.endsWith('fixAncientDates.js')) {
  await mongoose.connect(process.env.MONGODB_URI)
  const fixed = await fixAncientDates()
  console.log('Dates anciennes corrigées :', fixed.length ? fixed.join(', ') : 'aucune (déjà à jour)')
  await mongoose.disconnect()
}
