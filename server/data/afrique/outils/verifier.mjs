// Contrôle des fiches pays (voir ../SCHEMA.md) :
//  structure, champs obligatoires, renvois de sources, identifiants uniques, dates, licences d'images,
//  liens qui répondent (--liens), identifiants Wikidata existants (--wikidata).
//
//   node server/data/afrique/outils/verifier.mjs [--liens] [--wikidata] [CODE ...]
//
// Écrit ../rapport-verification.json et affiche un résumé. Code de sortie 1 si une fiche a une erreur bloquante.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(here, '..', 'pays')
const UA = 'MonBaobab-donnees/1.0 (verification de references publiques)'
const args = process.argv.slice(2)
const checkLinks = args.includes('--liens')
const checkWikidata = args.includes('--wikidata')
const codes = args.filter((a) => /^[A-Z]{2}$/.test(a))

const COLLECTIONS = ['langues', 'peuples', 'sites', 'traditions', 'personnalites', 'evenements', 'oeuvres', 'proverbes']
const STATUTS = ['brouillon', 'en_revue', 'valide_expert', 'publie', 'retire']
const LICENCES_IMAGE = /^(CC0|CC BY(-SA)? [\d.]+|CC BY(-SA)?|domaine public|public domain|PD)/i

const verifierFichier = (code, data) => {
  const erreurs = []
  const alertes = []
  const err = (m) => erreurs.push(m)
  const warn = (m) => alertes.push(m)

  if (data.code !== code) err(`code ${data.code} ≠ nom de fichier ${code}`)
  for (const champ of ['nom', 'region', 'wikidata', 'maj', 'pays', 'sources']) if (!data[champ]) err(`champ racine manquant : ${champ}`)
  const sources = new Map((data.sources || []).map((s) => [s.id, s]))
  for (const s of data.sources || []) {
    if (!s.id || !s.titre || !s.url) err(`source incomplète : ${JSON.stringify(s).slice(0, 120)}`)
    if (s.url && !/^https?:\/\//.test(s.url)) err(`source ${s.id} : URL invalide ${s.url}`)
    if (!s.consulte_le) warn(`source ${s.id} sans date de consultation`)
    if (!s.licence) warn(`source ${s.id} sans licence`)
  }
  const ids = new Set()
  const utilisees = new Set()
  const refs = (owner, list) => {
    if (!Array.isArray(list) || !list.length) return err(`${owner} : aucune source`)
    for (const id of list) {
      if (!sources.has(id)) err(`${owner} : source ${id} absente de la liste`)
      utilisees.add(id)
    }
  }
  refs('pays', data.pays?.sources)

  const counts = {}
  for (const col of COLLECTIONS) {
    const items = data[col] || []
    counts[col] = items.length
    for (const item of items) {
      const label = `${col}/${item.id || '?'}`
      if (!item.id) err(`${col} : élément sans id`)
      else if (ids.has(item.id)) err(`${label} : id en double`)
      else ids.add(item.id)
      if (!item.nom && !item.titre && !item.texte_original && !item.traduction) err(`${label} : ni nom ni titre`)
      if (col !== 'proverbes' && (!item.description || item.description.length < 40)) err(`${label} : description absente ou trop courte`)
      refs(label, item.sources)
      if (!STATUTS.includes(item.statut)) err(`${label} : statut « ${item.statut} » inconnu`)
      if (!item.verification?.etat) err(`${label} : verification.etat manquant`)
      if (item.wikidata && !/^Q\d+$/.test(item.wikidata)) err(`${label} : wikidata « ${item.wikidata} » invalide`)
      if (item.image) {
        if (!/^https:\/\/(upload\.wikimedia\.org|commons\.wikimedia\.org)\//.test(item.image.url || '')) err(`${label} : image hors Wikimedia Commons`)
        if (!LICENCES_IMAGE.test(item.image.licence || '')) err(`${label} : licence d'image absente ou non libre`)
        if (!item.image.auteur) warn(`${label} : image sans crédit`)
      }
      if (item.sensible && !item.note_sensibilite) warn(`${label} : sensible sans note`)
      if (col === 'evenements') {
        if (!item.date || Number.isNaN(new Date(item.date).getTime())) err(`${label} : date ISO invalide (${item.date})`)
        if (!item.date_affichee) warn(`${label} : date_affichee manquante`)
        if (/av\. J\.-C\./.test(item.date_affichee || '') && new Date(item.date).getUTCFullYear() > 0) err(`${label} : « av. J.-C. » mais date positive`)
      }
      if (col === 'sites' && item.coordonnees) {
        const { lat, lng } = item.coordonnees
        if (!(Math.abs(lat) <= 40 && lng >= -26 && lng <= 64)) err(`${label} : coordonnées hors d'Afrique (${lat}, ${lng})`)
      }
      if (col === 'proverbes' && !item.publication) err(`${label} : proverbe sans publication`)
      if (col === 'langues' && item.glottocode && !/^[a-z]{4}\d{4}$/.test(item.glottocode)) err(`${label} : glottocode invalide ${item.glottocode}`)
    }
  }
  for (const id of sources.keys()) if (!utilisees.has(id)) warn(`source ${id} jamais citée`)
  return { erreurs, alertes, counts, nbSources: sources.size }
}

const pool = async (items, n, fn) => {
  const out = []
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const k = i++
      out[k] = await fn(items[k])
    }
  }))
  return out
}

const lienRepond = async (url) => {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) })
      if (res.ok) return { ok: true, statut: res.status }
      if (method === 'GET') return { ok: res.status === 403 || res.status === 429, statut: res.status } // anti-robots : non concluant
    } catch (e) {
      if (method === 'GET') return { ok: false, statut: e.name }
    }
  }
}

const main = async () => {
  const fichiers = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, 2)).filter((c) => !codes.length || codes.includes(c))
  const rapport = { genere_le: new Date().toISOString(), pays: {} }
  let bloquant = false
  for (const code of fichiers.sort()) {
    let data
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, `${code}.json`), 'utf8'))
    } catch (e) {
      rapport.pays[code] = { erreurs: [`JSON illisible : ${e.message}`], alertes: [], counts: {} }
      bloquant = true
      continue
    }
    const r = verifierFichier(code, data)
    if (checkLinks) {
      const urls = [...new Set((data.sources || []).map((s) => s.url).filter(Boolean))]
      const res = await pool(urls, 8, lienRepond)
      r.liens_morts = urls.filter((u, i) => !res[i].ok).map((u, i) => u)
      r.liens_morts.forEach((u) => r.erreurs.push(`lien mort : ${u}`))
      r.nbLiens = urls.length
    }
    if (checkWikidata) {
      const qids = [...new Set(['pays', ...COLLECTIONS].flatMap((c) => (c === 'pays' ? [data.wikidata] : (data[c] || []).map((i) => i.wikidata))).filter(Boolean))]
      const inconnus = []
      for (let i = 0; i < qids.length; i += 50) {
        const lot = qids.slice(i, i + 50)
        const res = await (await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${lot.join('|')}&props=info&format=json`, { headers: { 'User-Agent': UA } })).json()
        for (const q of lot) if (!res.entities?.[q] || res.entities[q].missing !== undefined) inconnus.push(q)
      }
      inconnus.forEach((q) => r.erreurs.push(`identifiant Wikidata inexistant : ${q}`))
    }
    if (r.erreurs.length) bloquant = true
    rapport.pays[code] = r
    const total = Object.values(r.counts).reduce((a, b) => a + b, 0)
    console.log(`${code} ${String(total).padStart(4)} éléments, ${String(r.nbSources).padStart(3)} sources, ${r.erreurs.length} erreur(s), ${r.alertes.length} alerte(s)`)
  }
  // Rapport global seulement pour un contrôle complet (plusieurs agents vérifient chacun leur pays en parallèle)
  if (!codes.length) fs.writeFileSync(path.join(here, '..', 'rapport-verification.json'), `${JSON.stringify(rapport, null, 2)}\n`)
  process.exit(bloquant ? 1 : 0)
}

main()
