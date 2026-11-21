// Import de la base de connaissances (server/data/afrique/pays/*.json) dans la collection « fiches ».
//
//   node src/scripts/importerBaseAfrique.js [--essai] [CODE ...]
//
// Règles :
//  - fiche nouvelle : créée avec le statut du fichier (« en_revue » à la collecte) ;
//  - fiche encore en brouillon ou en revue : contenu mis à jour ;
//  - fiche validée, publiée ou retirée par l'équipe : jamais modifiée ; si la collecte propose un
//    contenu différent, elle est signalée (miseAJourDisponible) pour relecture.
// Aucune fiche n'est supprimée. --essai : compte sans rien écrire.
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import Fiche from '../models/Fiche.js'

const here = path.dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = path.join(here, '..', '..', 'data', 'afrique', 'pays')

const COLLECTIONS = {
  langues: 'langue',
  peuples: 'peuple',
  sites: 'site',
  traditions: 'tradition',
  personnalites: 'personnalite',
  evenements: 'evenement',
  oeuvres: 'oeuvre',
  proverbes: 'proverbe',
}
const DECIDEES = ['valide_expert', 'publie', 'retire']

const empreinte = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24)

const titreDe = (item, type) =>
  item.nom || item.titre || (type === 'proverbe' ? item.traduction || item.texte_original : '') || item.id

/** Transforme un fichier pays en documents « fiche » prêts à enregistrer. */
export const fichesDuPays = (data, fichier) => {
  const sources = new Map((data.sources || []).map((s) => [s.id, s]))
  const resoudre = (ids = []) => ids.map((id) => sources.get(id)).filter(Boolean)
  const base = { pays: data.code, region: data.region, origine: { fichier, maj: data.maj } }
  const out = [
    {
      ...base,
      ficheId: `${data.code}-pays`,
      type: 'pays',
      titre: data.nom,
      description: data.pays?.resume || '',
      wikidata: data.wikidata,
      statut: 'en_revue',
      verification: { etat: 'a_verifier' },
      sources: resoudre(data.pays?.sources),
      contenu: data.pays,
    },
  ]
  for (const [collection, type] of Object.entries(COLLECTIONS)) {
    for (const item of data[collection] || []) {
      out.push({
        ...base,
        ficheId: item.id,
        type,
        titre: titreDe(item, type),
        description: item.description || item.sens || '',
        wikidata: item.wikidata || undefined,
        date: item.date ? new Date(item.date) : null,
        periode: item.periode || item.date_affichee || '',
        coordonnees: item.coordonnees || undefined,
        sensible: Boolean(item.sensible),
        statut: item.statut || 'en_revue',
        verification: item.verification || { etat: 'a_verifier' },
        sources: resoudre(item.sources),
        contenu: item,
      })
    }
  }
  return out.map((fiche) => ({ ...fiche, empreinte: empreinte(fiche.contenu) }))
}

export const importer = async ({ codes = [], essai = false } = {}) => {
  const fichiers = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json') && (!codes.length || codes.includes(f.slice(0, 2))))
  const bilan = { crees: 0, mis_a_jour: 0, inchanges: 0, signales: 0, ignores: 0 }
  for (const fichier of fichiers.sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, fichier), 'utf8'))
    for (const fiche of fichesDuPays(data, fichier)) {
      const existante = await Fiche.findOne({ ficheId: fiche.ficheId }).select('statut empreinte miseAJourDisponible').lean()
      if (!existante) {
        bilan.crees++
        if (!essai) await Fiche.create({ ...fiche, historique: [{ statut: fiche.statut, note: `Import ${fichier}` }] })
      } else if (existante.empreinte === fiche.empreinte) {
        bilan.inchanges++
      } else if (DECIDEES.includes(existante.statut)) {
        if (!existante.miseAJourDisponible) {
          bilan.signales++
          if (!essai) await Fiche.updateOne({ _id: existante._id }, { $set: { miseAJourDisponible: true } })
        } else bilan.ignores++
      } else {
        bilan.mis_a_jour++
        const { statut, ...modifiable } = fiche // le statut de revue en cours n'est pas écrasé
        if (!essai) await Fiche.updateOne({ _id: existante._id }, { $set: modifiable })
      }
    }
  }
  return bilan
}

if (process.argv[1]?.endsWith('importerBaseAfrique.js')) {
  const args = process.argv.slice(2)
  await mongoose.connect(process.env.MONGODB_URI)
  const bilan = await importer({ codes: args.filter((a) => /^[A-Z]{2}$/.test(a)), essai: args.includes('--essai') })
  console.log(`Base de connaissances${args.includes('--essai') ? ' (essai, rien écrit)' : ''} :`, bilan)
  await mongoose.disconnect()
}
