// Graines vérifiables par pays, collectées à la source sans intermédiaire :
//  - Wikidata : identité du pays, sites du patrimoine mondial (identifiant UNESCO P757 + coordonnées),
//    langues parlées (avec code Glottolog quand il existe)
//  - UNESCO (ich.unesco.org) : éléments inscrits sur les listes du patrimoine culturel immatériel
//
//   node server/data/afrique/outils/collecter-graines.mjs [CODE ...]
//
// Écrit server/data/afrique/graines/<CODE>.json. Données Wikidata : CC0. Notices UNESCO : citées
// avec leur lien, jamais recopiées.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(here, '..', 'graines')
const PAYS = JSON.parse(fs.readFileSync(path.join(here, 'pays.json'), 'utf8'))
const UA = 'MonBaobab-donnees/1.0 (plateforme culturelle, collecte de références publiques)'
const today = new Date().toISOString().slice(0, 10)
const pause = (ms) => new Promise((r) => setTimeout(r, ms))

const sparql = async (query) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' },
    })
    if (res.ok) return (await res.json()).results.bindings
    await pause(3000 * (attempt + 1))
  }
  throw new Error('Wikidata indisponible')
}

const v = (b, k) => b[k]?.value
const qid = (uri) => uri?.split('/').pop()
const point = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt || '')
  return m ? { lat: Number(m[2]), lng: Number(m[1]) } : null
}

// Page UNESCO de chaque État (liste déroulante de ich.unesco.org/en/lists)
const ichStates = async () => {
  const html = await (await fetch('https://ich.unesco.org/en/lists', { headers: { 'User-Agent': UA } })).text()
  return Object.fromEntries([...html.matchAll(/<option value="(https:\/\/ich\.unesco\.org\/en\/state\/[^"]+-([A-Z]{2}))">/g)].map((m) => [m[2], m[1]]))
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#039;|&#39;/g, "'").replace(/&quot;/g, '"').trim()
const LISTES = { RL: 'Liste représentative', USL: 'Sauvegarde urgente', BSP: 'Registre des bonnes pratiques' }

const ichElements = async (stateUrl) => {
  if (!stateUrl) return []
  const html = await (await fetch(`${stateUrl}?info=elements-on-the-lists`, { headers: { 'User-Agent': UA } })).text()
  const seen = new Map()
  for (const m of html.matchAll(/href="(https:\/\/ich\.unesco\.org\/en\/(RL|USL|BSP)\/[^"]+?-(\d{5}))"[^>]*>\s*([^<]{4,300}?)\s*</g)) {
    if (!seen.has(m[1])) seen.set(m[1], { titre_en: decode(m[4]), liste: LISTES[m[2]], unesco_id: m[3], url: m[1] })
  }
  return [...seen.values()]
}

const collect = async ([code, nom, region], states) => {
  const [pays] = await sparql(`SELECT ?p ?pLabel ?capLabel ?pop ?popDate ?area ?curLabel WHERE {
    ?p wdt:P297 "${code}". OPTIONAL{?p wdt:P36 ?cap}
    OPTIONAL{?p p:P1082 ?ps. ?ps ps:P1082 ?pop; pq:P585 ?popDate}
    OPTIONAL{?p wdt:P2046 ?area} OPTIONAL{?p wdt:P38 ?cur}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". } } ORDER BY DESC(?popDate) LIMIT 1`)
  const q = qid(v(pays || {}, 'p'))
  if (!q) throw new Error(`QID introuvable pour ${code}`)
  await pause(800)

  const sites = (await sparql(`SELECT ?s ?sLabel ?whc ?coord ?year WHERE {
      ?s wdt:P757 ?whc; wdt:P17 wd:${q}. OPTIONAL{?s wdt:P625 ?coord}
      OPTIONAL{?s p:P1435 ?h. ?h ps:P1435 wd:Q9259; pq:P580 ?year}
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". } }`))
    .filter((b) => /^\d+(rev|bis|ter)?$/.test(v(b, 'whc')))
  const sitesUniques = [...new Map(sites.map((b) => [v(b, 'whc'), {
    nom: v(b, 'sLabel'), wikidata: qid(v(b, 's')), unesco_id: v(b, 'whc'),
    url_unesco: `https://whc.unesco.org/fr/list/${v(b, 'whc').replace(/\D+$/, '')}`,
    coordonnees: point(v(b, 'coord')), inscription: v(b, 'year')?.slice(0, 4) || null,
  }])).values()]
  await pause(800)

  const langues = (await sparql(`SELECT DISTINCT ?l ?lLabel ?glotto ?official WHERE {
      { ?l wdt:P31/wdt:P279* wd:Q34770; wdt:P17 wd:${q}. } UNION { wd:${q} wdt:P37 ?l. BIND(true AS ?official) }
      OPTIONAL{?l wdt:P1394 ?glotto}
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". } } LIMIT 300`))
  const languesUniques = [...new Map(langues.map((b) => [qid(v(b, 'l')), {
    nom: v(b, 'lLabel'), wikidata: qid(v(b, 'l')), glottocode: v(b, 'glotto') || null, officielle: Boolean(v(b, 'official')),
  }])).values()].filter((l) => !/^Q\d+$/.test(l.nom))
  await pause(800)

  const immateriel = await ichElements(states[code])

  return {
    code, nom, region, collecte_le: today,
    wikidata: q,
    identite: {
      nom_wikidata: v(pays, 'pLabel'), capitale: v(pays, 'capLabel') || null,
      population: v(pays, 'pop') ? { valeur: Number(v(pays, 'pop')), date: v(pays, 'popDate')?.slice(0, 10) } : null,
      superficie_km2: v(pays, 'area') ? Number(v(pays, 'area')) : null, monnaie: v(pays, 'curLabel') || null,
      source: { titre: `Wikidata ${q}`, url: `https://www.wikidata.org/wiki/${q}`, licence: 'CC0' },
    },
    patrimoine_mondial: sitesUniques,
    patrimoine_immateriel: immateriel,
    patrimoine_immateriel_source: states[code] || null,
    langues: languesUniques,
  }
}

const main = async () => {
  fs.mkdirSync(outDir, { recursive: true })
  const wanted = process.argv.slice(2)
  const states = await ichStates()
  for (const entry of PAYS.filter(([c]) => !wanted.length || wanted.includes(c))) {
    try {
      const data = await collect(entry, states)
      fs.writeFileSync(path.join(outDir, `${entry[0]}.json`), `${JSON.stringify(data, null, 2)}\n`)
      console.log(`${entry[0]} ${entry[1]} : ${data.patrimoine_mondial.length} sites, ${data.patrimoine_immateriel.length} éléments immatériels, ${data.langues.length} langues`)
    } catch (error) {
      console.log(`${entry[0]} ${entry[1]} : ÉCHEC ${error.message}`)
    }
    await pause(1500)
  }
}

main()
