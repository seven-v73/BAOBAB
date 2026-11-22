/**
 * Réécritures sobres des contenus (server/data/sobriete-contenus.json) : titres en casse de phrase,
 * sans superlatifs ni tirets cadratins, légende distinguée de l'histoire, faits datés et attribués.
 *
 *   node server/src/scripts/sobrieteContenus.js              # simulation : liste ce qui changerait
 *   node server/src/scripts/sobrieteContenus.js --appliquer  # écrit dans la base
 *   node server/src/scripts/sobrieteContenus.js --annuler    # remet les textes d'avant
 *
 * Une modification ne s'applique que si le texte en base est encore exactement celui relevé :
 * une correction faite entre-temps dans l'admin n'est jamais écrasée (elle est signalée).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.resolve(__dirname, '../..')
dotenv.config({ path: path.join(serverDir, '.env') })

const APPLIQUER = process.argv.includes('--appliquer') || process.argv.includes('--annuler')
const ANNULER = process.argv.includes('--annuler')
const DATA = path.join(serverDir, 'data/sobriete-contenus.json')

const lire = (doc, chemin) => chemin.split('.').reduce((v, k) => (v == null ? v : v[k]), doc)
const pareil = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
const court = (v) => {
  const t = typeof v === 'string' ? v : JSON.stringify(v)
  return t.length > 110 ? `${t.slice(0, 107)}…` : t
}

const main = async () => {
  const entrees = JSON.parse(fs.readFileSync(DATA, 'utf8'))
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  const db = mongoose.connection.db

  const bilan = { appliquees: 0, deja: 0, modifieesEntreTemps: 0, introuvables: 0 }
  for (const e of entrees) {
    const _id = new mongoose.Types.ObjectId(e._id)
    const doc = await db.collection(e.collection).findOne({ _id })
    if (!doc) {
      bilan.introuvables += 1
      console.log(`?  ${e.collection} ${e._id} : document introuvable`)
      continue
    }
    const actuel = lire(doc, e.champ)
    let cible

    if (e.remplacements) {
      const paires = ANNULER ? e.remplacements.map(([a, b]) => [b, a]) : e.remplacements
      let texte = String(actuel ?? '')
      const faites = paires.filter(([a]) => texte.includes(a))
      if (!faites.length) {
        const dejaFait = paires.every(([, b]) => texte.includes(b))
        bilan[dejaFait ? 'deja' : 'modifieesEntreTemps'] += 1
        if (!dejaFait) console.log(`!  ${e.collection} ${e._id} ${e.champ} : passages introuvables (texte modifié entre-temps ?)`)
        continue
      }
      for (const [a, b] of faites) texte = texte.split(a).join(b)
      cible = texte
      console.log(`✓  ${e.collection} ${e._id} ${e.champ} : ${faites.length} passage(s)`)
    } else {
      const [avant, apres] = ANNULER ? [e.apres, e.avant] : [e.avant, e.apres]
      if (pareil(actuel, apres)) {
        bilan.deja += 1
        continue
      }
      if (!pareil(actuel, avant)) {
        bilan.modifieesEntreTemps += 1
        console.log(`!  ${e.collection} ${e._id} ${e.champ} : texte modifié entre-temps, laissé tel quel`)
        continue
      }
      cible = apres
      console.log(`✓  ${e.collection} ${e._id} ${e.champ}\n     avant : ${court(avant)}\n     après : ${court(apres)}`)
    }

    bilan.appliquees += 1
    if (APPLIQUER) await db.collection(e.collection).updateOne({ _id }, { $set: { [e.champ]: cible, updatedAt: new Date() } })
  }

  console.log(
    `\n${APPLIQUER ? (ANNULER ? 'Annulé' : 'Appliqué') : 'Simulation (rien n’est écrit ; ajoutez --appliquer)'} : ` +
      `${bilan.appliquees} modification(s), ${bilan.deja} déjà faite(s), ${bilan.modifieesEntreTemps} laissée(s) car modifiée(s) entre-temps, ${bilan.introuvables} introuvable(s).`,
  )
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(`Échec : ${error.message}`)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
