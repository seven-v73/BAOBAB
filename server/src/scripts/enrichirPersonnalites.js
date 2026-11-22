/**
 * Ajoute aux personnalités les sources et portraits relus dans server/data/personnalites-sources.json.
 *
 *   node server/src/scripts/enrichirPersonnalites.js              # simulation : montre ce qui changerait
 *   node server/src/scripts/enrichirPersonnalites.js --appliquer  # écrit dans la base
 *
 * - Les sources sont créées une seule fois (repérées par leur URL), puis rattachées à la personnalité.
 *   Relancer le script ne crée aucun doublon.
 * - Un portrait n'est posé que si la personnalité n'en a pas. Une photo ou gravure sourcée passe
 *   avant les illustrations du site (src/data/reperesContent.ts), qui n'ont ni source ni crédit.
 * - Le crédit de la photo (auteur, licence, Wikimedia Commons) va dans la légende, comme l'exige la licence.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.resolve(__dirname, '../..')
const rootDir = path.resolve(serverDir, '..')
dotenv.config({ path: path.join(serverDir, '.env') })

const APPLIQUER = process.argv.includes('--appliquer')
const DATA = path.join(serverDir, 'data/personnalites-sources.json')

const normaliser = (texte) => String(texte || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Noms des personnalités qui ont déjà un portrait illustré sur le site
const illustrees = () => {
  const fichier = path.join(rootDir, 'src/data/reperesContent.ts')
  if (!fs.existsSync(fichier)) return new Set()
  const texte = fs.readFileSync(fichier, 'utf8')
  const noms = [...texte.matchAll(/nom:\s*'([^']+)'[\s\S]*?portrait:\s*'\/content\//g)].map((m) => normaliser(m[1]))
  return new Set(noms)
}

const TYPES = new Set(['book', 'article', 'document', 'archive', 'testimony', 'museum', 'video', 'website'])

const main = async () => {
  const entrees = JSON.parse(fs.readFileSync(DATA, 'utf8'))
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  const HistoricalFigure = (await import('../models/HistoricalFigure.js')).default
  const Source = (await import('../models/Source.js')).default
  const dejaIllustrees = illustrees()

  let sourcesCreees = 0
  let liens = 0
  let portraits = 0
  for (const entree of entrees) {
    const figure = await HistoricalFigure.findById(entree._id)
    if (!figure) {
      console.log(`?  ${entree.nom} : introuvable dans la base (ignoré)`)
      continue
    }
    const actions = []

    for (const s of entree.sources || []) {
      if (!s.url || !s.title) continue
      let source = await Source.findOne({ url: s.url })
      if (!source) {
        const donnees = {
          type: TYPES.has(s.type) ? s.type : 'website',
          title: String(s.title).slice(0, 300),
          author: s.author || '',
          publisher: s.publisher || '',
          year: Number.isInteger(s.year) ? s.year : undefined,
          url: s.url,
          language: s.language || 'fr',
          reliability: Math.min(Math.max(Number(s.reliability) || 3, 1), 5),
          description: s.description || '',
          keywords: [figure.name],
          isActive: true,
        }
        sourcesCreees += 1
        actions.push(`+ source « ${donnees.title} »`)
        if (APPLIQUER) source = await Source.create(donnees)
      }
      if (source && !figure.sources.some((id) => String(id) === String(source._id))) {
        figure.sources.push(source._id)
        liens += 1
        if (!actions.some((a) => a.includes(s.title))) actions.push(`→ source existante « ${source.title} »`)
      } else if (!source && !APPLIQUER) {
        liens += 1
      }
    }

    const p = entree.portrait
    if (p?.url && !figure.image) {
      figure.image = p.url
      figure.images = [{ url: p.url, caption: p.legende || `${figure.name}. Wikimedia Commons, ${p.licence || 'licence libre'}.`, order: 0 }]
      portraits += 1
      actions.push(`portrait : ${p.page || p.url}${dejaIllustrees.has(normaliser(figure.name)) ? ' (remplace l’illustration du site sur la fiche)' : ''}`)
    }

    console.log(`${actions.length ? '✓' : '='}  ${figure.name}${actions.length ? `\n     ${actions.join('\n     ')}` : ' : rien à changer'}`)
    if (APPLIQUER && actions.length) await figure.save()
  }

  console.log(
    `\n${APPLIQUER ? 'Appliqué' : 'Simulation (rien n’est écrit ; ajoutez --appliquer)'} : ${sourcesCreees} source(s) nouvelle(s), ${liens} lien(s) personnalité → source, ${portraits} portrait(s).`,
  )
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(`Échec : ${error.message}`)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
