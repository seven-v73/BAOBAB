import logger from './logger.js'

/**
 * Adresses lisibles : /figures/nelson-mandela plutôt que /figures/6a1f69b5…
 * Les anciennes adresses par identifiant continuent de fonctionner (findByIdOrSlug).
 * Un slug ne change plus une fois attribué, même si le titre change : les liens partagés restent bons.
 */
export const slugify = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .replace(/['’ʼ]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')

const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value))

/** Requête Mongoose par identifiant ou par slug (chaînable : .populate(), .lean()…) */
export const findByIdOrSlug = (Model, param) =>
  Model.findOne(isObjectId(param) ? { _id: param } : { slug: String(param).toLowerCase().slice(0, 100) })

// Mots déjà pris par des routes du site ou de l'API (/blog/ecrire, /blog/admin, /api/blog/mine…)
const RESERVES = new Set(['ecrire', 'admin', 'mine', 'new', 'nouveau', 'search', 'featured', 'stats', 'categories', 'tags', 'mes-textes', 'moderation', 'random', 'periods'])

const uniqueSlug = async (Model, base, excludeId) => {
  const root = !base ? 'page' : RESERVES.has(base) ? `${base}-1` : base
  let candidate = root
  for (let n = 2; await Model.exists({ slug: candidate, _id: { $ne: excludeId } }); n += 1) candidate = `${root}-${n}`
  return candidate
}

/** Plugin de schéma : champ `slug` rempli à la création à partir du champ source (name ou title) */
export const slugPlugin = (schema, { source }) => {
  schema.add({ slug: { type: String, trim: true, lowercase: true } })
  schema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string' } } })
  schema.pre('save', async function attribuerSlug() {
    if (this.slug || !this.get(source)) return
    this.slug = await uniqueSlug(this.constructor, slugify(this.get(source)), this._id)
  })
}

/** Au démarrage : attribue un slug aux contenus créés avant cette fonction (ou par insertMany/seed) */
export const ensureSlugs = async (models) => {
  for (const [Model, source] of models) {
    const missing = await Model.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }).select(`_id ${source}`).lean()
    for (const doc of missing) {
      const slug = await uniqueSlug(Model, slugify(doc[source]), doc._id)
      await Model.updateOne({ _id: doc._id }, { $set: { slug } })
    }
    if (missing.length) logger.info(`Slugs : ${missing.length} adresse(s) lisible(s) attribuée(s) (${Model.modelName})`)
  }
}
