import mongoose from 'mongoose'

// Fiche de la base de connaissances (server/data/afrique, voir SCHEMA.md) : un document par élément
// (langue, peuple, site, tradition, personnalité, événement, œuvre, proverbe) ou par pays.
// Le contenu complet est gardé tel que collecté ; les champs extraits servent aux recherches.

export const FICHE_TYPES = ['pays', 'langue', 'peuple', 'site', 'tradition', 'personnalite', 'evenement', 'oeuvre', 'proverbe']
export const FICHE_STATUTS = ['brouillon', 'en_revue', 'valide_expert', 'publie', 'retire']

const sourceSchema = new mongoose.Schema(
  {
    id: String,
    titre: String,
    institution: String,
    auteur: String,
    annee: mongoose.Schema.Types.Mixed,
    url: String,
    type: String,
    licence: String,
    consulte_le: String,
  },
  { _id: false },
)

const ficheSchema = new mongoose.Schema(
  {
    ficheId: { type: String, required: true, unique: true },
    type: { type: String, enum: FICHE_TYPES, required: true, index: true },
    pays: { type: String, required: true, index: true }, // code ISO 3166-1 alpha-2
    region: { type: String, index: true },
    titre: { type: String, required: true },
    description: { type: String, default: '' },
    wikidata: { type: String, index: true, sparse: true },
    date: { type: Date, default: null }, // événements (numérotation astronomique avant J.-C.)
    periode: { type: String, default: '' },
    coordonnees: { lat: Number, lng: Number },
    sensible: { type: Boolean, default: false },
    statut: { type: String, enum: FICHE_STATUTS, default: 'en_revue', index: true },
    verification: {
      etat: { type: String, default: 'a_verifier' },
      le: String,
      note: String,
    },
    sources: [sourceSchema],
    contenu: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Empreinte du contenu collecté : une nouvelle collecte différente d'une fiche déjà validée est signalée
    empreinte: { type: String, default: '' },
    miseAJourDisponible: { type: Boolean, default: false },
    historique: [
      {
        statut: String,
        par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        le: { type: Date, default: Date.now },
        note: String,
        _id: false,
      },
    ],
    origine: { fichier: String, maj: String },
  },
  { timestamps: true },
)

ficheSchema.index({ pays: 1, type: 1, statut: 1 })
ficheSchema.index({ titre: 'text', description: 'text' }, { default_language: 'french', language_override: 'langueIndex' })

const Fiche = mongoose.model('Fiche', ficheSchema)
export default Fiche
