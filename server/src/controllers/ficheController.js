import Fiche, { FICHE_STATUTS, FICHE_TYPES } from '../models/Fiche.js'
import { AppError, catchAsync } from '../utils/errorHandler.js'
import { escapeRegExp } from '../utils/regex.js'

// Base de connaissances : le public ne voit que les fiches publiées ; l'équipe relit, valide,
// publie ou retire (avec historique de chaque décision).

const PUBLIC_SELECT = '-empreinte -historique -miseAJourDisponible -origine'

const filtres = (query, { admin = false } = {}) => {
  const filtre = {}
  if (query.pays) filtre.pays = String(query.pays).toUpperCase().slice(0, 2)
  if (query.type && FICHE_TYPES.includes(query.type)) filtre.type = query.type
  if (query.region) filtre.region = String(query.region)
  if (query.wikidata) filtre.wikidata = String(query.wikidata)
  if (admin) {
    if (query.statut && FICHE_STATUTS.includes(query.statut)) filtre.statut = query.statut
    if (query.sensible === 'true') filtre.sensible = true
    if (query.miseAJour === 'true') filtre.miseAJourDisponible = true
  } else {
    filtre.statut = 'publie'
  }
  if (query.q && String(query.q).trim()) {
    const motif = new RegExp(escapeRegExp(String(query.q).trim().slice(0, 100)), 'i')
    filtre.$or = [{ titre: motif }, { description: motif }]
  }
  return filtre
}

const lister = (admin) =>
  catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 24
    const filtre = filtres(req.query, { admin })
    const tri = req.query.type === 'evenement' ? { date: 1 } : { titre: 1 }
    const [fiches, total] = await Promise.all([
      Fiche.find(filtre).select(admin ? '-contenu' : PUBLIC_SELECT).sort(tri).skip((page - 1) * limit).limit(limit).lean(),
      Fiche.countDocuments(filtre),
    ])
    res.json({ fiches, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  })

// GET /api/fiches — fiches publiées
export const getFiches = lister(false)
// GET /api/fiches/admin — toutes les fiches (équipe)
export const getFichesAdmin = lister(true)

// GET /api/fiches/:ficheId
export const getFiche = catchAsync(async (req, res) => {
  const admin = req.user?.role === 'admin'
  const fiche = await Fiche.findOne({ ficheId: req.params.ficheId }).select(admin ? '' : PUBLIC_SELECT).lean()
  if (!fiche || (!admin && fiche.statut !== 'publie')) throw new AppError('Fiche introuvable', 404)
  res.json(fiche)
})

// GET /api/fiches/admin/stats — couverture par pays, type et statut
export const getStats = catchAsync(async (req, res) => {
  const [parPays, parStatut, parType, signalees] = await Promise.all([
    Fiche.aggregate([{ $group: { _id: { pays: '$pays', statut: '$statut' }, n: { $sum: 1 } } }]),
    Fiche.aggregate([{ $group: { _id: '$statut', n: { $sum: 1 } } }]),
    Fiche.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }]),
    Fiche.countDocuments({ miseAJourDisponible: true }),
  ])
  const pays = {}
  for (const { _id, n } of parPays) {
    pays[_id.pays] ??= { total: 0 }
    pays[_id.pays][_id.statut] = n
    pays[_id.pays].total += n
  }
  res.json({
    pays,
    statuts: Object.fromEntries(parStatut.map((s) => [s._id, s.n])),
    types: Object.fromEntries(parType.map((t) => [t._id, t.n])),
    miseAJourDisponible: signalees,
  })
})

// PATCH /api/fiches/:ficheId/statut — décision de l'équipe (validation, publication, retrait)
export const changerStatut = catchAsync(async (req, res) => {
  const { statut, note } = req.body
  if (!FICHE_STATUTS.includes(statut)) throw new AppError(`Statut inconnu (${FICHE_STATUTS.join(', ')})`, 400)
  const fiche = await Fiche.findOne({ ficheId: req.params.ficheId })
  if (!fiche) throw new AppError('Fiche introuvable', 404)
  // Un contenu sensible ne se publie qu'avec une note de validation (communauté, institution partenaire)
  if (statut === 'publie' && fiche.sensible && !String(note || '').trim()) {
    throw new AppError('Contenu sensible : indiquez qui a validé la fiche avant de la publier.', 400)
  }
  fiche.statut = statut
  if (statut !== 'retire') fiche.miseAJourDisponible = false
  fiche.historique.push({ statut, par: req.user._id, note: String(note || '').slice(0, 1000) })
  await fiche.save()
  res.json({ ficheId: fiche.ficheId, statut: fiche.statut, historique: fiche.historique })
})
