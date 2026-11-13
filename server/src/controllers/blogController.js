import Blog from '../models/Blog.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

/*
 * Règles d'accès du carnet de savoirs
 * - Public : uniquement les articles publiés.
 * - Auteur connecté : voit, modifie et supprime ses propres textes tant qu'ils ne sont pas publiés.
 * - Administrateur : voit tout, publie, refuse (avec une note pour l'auteur), modifie et supprime.
 * Un texte soumis par un membre passe toujours par la modération ("pending").
 */

const MIN_CONTRIBUTION_LENGTH = 600 // ~100 mots : évite les textes vides ou de test
const isAdmin = (req) => req.user?.role === 'admin'
const isOwner = (req, blog) => Boolean(req.user && blog.authorId && blog.authorId.equals(req.user._id))

const makeExcerpt = (content = '') => {
  const plain = content
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_>#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 220 ? `${plain.slice(0, 217).replace(/\s+\S*$/, '')}…` : plain
}

const cleanReferences = (references) =>
  Array.isArray(references)
    ? references
        .filter((ref) => ref && typeof ref.title === 'string' && ref.title.trim())
        .slice(0, 30)
        .map((ref) => ({
          title: String(ref.title).trim().slice(0, 300),
          author: String(ref.author || '').trim().slice(0, 200),
          publisher: String(ref.publisher || '').trim().slice(0, 200),
          year: Number.isInteger(Number(ref.year)) && Number(ref.year) > 0 ? Number(ref.year) : null,
          url: /^https?:\/\//i.test(ref.url || '') ? String(ref.url).trim().slice(0, 600) : '',
          note: String(ref.note || '').trim().slice(0, 300),
        }))
    : []

/** Exigences éditoriales pour les contributions de la communauté */
const contributionErrors = ({ content, kind, references, status }) => {
  if (status === 'draft') return null // un brouillon peut être incomplet
  if ((content || '').trim().length < MIN_CONTRIBUTION_LENGTH) {
    return `Votre texte est un peu court : au moins ${MIN_CONTRIBUTION_LENGTH} caractères sont nécessaires pour le soumettre.`
  }
  if (kind !== 'temoignage' && references.length === 0) {
    return 'Un article de savoir doit citer au moins une source (livre, article, site institutionnel…). Pour un récit personnel, choisissez « Témoignage ».'
  }
  return null
}

// GET /api/blog
export const getAllBlogs = catchAsync(async (req, res) => {
  const { category, search, published, mine, status, kind } = req.query
  const query = {}

  if (mine === 'true') {
    if (!req.user) return res.status(401).json({ error: 'Connexion requise' })
    query.authorId = req.user._id
  } else if (isAdmin(req)) {
    if (published !== undefined) query.published = published === 'true'
    if (status) query.status = status
  } else {
    query.published = true // jamais de brouillon ou de texte en attente en lecture publique
  }

  if (category) query.category = category
  if (kind) query.kind = kind
  if (search) query.$text = { $search: search }

  const blogs = await Blog.find(query).sort({ createdAt: -1 }).select('-__v')
  res.json(blogs)
})

// GET /api/blog/:id
export const getBlogById = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id).select('-__v')

  if (!blog || (!blog.published && !isAdmin(req) && !isOwner(req, blog))) {
    return res.status(404).json({ error: 'Article non trouvé' })
  }

  if (blog.published) {
    // Incrément atomique, sans réécrire le document
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } })
    blog.views += 1
  }

  res.json(blog)
})

// POST /api/blog
export const createBlog = catchAsync(async (req, res) => {
  const admin = isAdmin(req)
  const { title, content, excerpt, author, image, images, pdfs, videos, documents, category, tags, published, kind, country } = req.body
  const references = cleanReferences(req.body.references)

  // Un membre ne peut que créer un brouillon ou soumettre à la modération
  const status = admin
    ? req.body.status || (published === false ? 'draft' : 'published')
    : req.body.status === 'draft'
      ? 'draft'
      : 'pending'

  if (!admin) {
    const error = contributionErrors({ content, kind, references, status })
    if (error) return res.status(400).json({ error })
  }

  const blog = new Blog({
    title,
    content,
    excerpt: excerpt || makeExcerpt(content),
    // Pour un membre, l'auteur affiché est toujours son nom de compte (pas d'usurpation)
    author: admin ? author || req.user.name || 'MonBaobab' : req.user.name,
    authorId: req.user._id,
    image: image || '',
    images: admin ? images || [] : [],
    pdfs: admin ? pdfs || [] : [],
    videos: admin ? videos || [] : [],
    documents: admin ? documents || [] : [],
    category: category || 'Culture',
    tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
    kind: kind === 'temoignage' ? 'temoignage' : 'savoir',
    references,
    country: country || '',
    status,
  })

  const savedBlog = await blog.save()
  logger.info('Article de blog créé', { blogId: savedBlog._id, status, byAdmin: admin })
  res.status(201).json(savedBlog)
})

// PUT /api/blog/:id
export const updateBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Article non trouvé' })

  const admin = isAdmin(req)
  if (!admin && !isOwner(req, blog)) return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres textes' })
  if (!admin && blog.status === 'published') {
    return res.status(403).json({ error: 'Ce texte est publié : contactez l’équipe pour le modifier.' })
  }

  const { title, content, excerpt, author, image, images, pdfs, videos, documents, category, tags, published, kind, country } = req.body

  if (title) blog.title = title
  if (content) blog.content = content
  if (excerpt !== undefined) blog.excerpt = excerpt
  if (content && !excerpt) blog.excerpt = makeExcerpt(content)
  if (image !== undefined) blog.image = image
  if (category) blog.category = category
  if (Array.isArray(tags)) blog.tags = tags.slice(0, 10)
  if (kind) blog.kind = kind === 'temoignage' ? 'temoignage' : 'savoir'
  if (country !== undefined) blog.country = country
  if (req.body.references !== undefined) blog.references = cleanReferences(req.body.references)

  if (admin) {
    if (author) blog.author = author
    if (images !== undefined) blog.images = images
    if (pdfs !== undefined) blog.pdfs = pdfs
    if (videos !== undefined) blog.videos = videos
    if (documents !== undefined) blog.documents = documents
    if (req.body.status) blog.status = req.body.status
    else if (published !== undefined) blog.status = published ? 'published' : 'draft'
  } else {
    // Le membre enregistre un brouillon ou (re)soumet à la modération
    blog.status = req.body.status === 'draft' ? 'draft' : 'pending'
    blog.reviewNote = blog.status === 'pending' ? '' : blog.reviewNote
    const error = contributionErrors({ content: blog.content, kind: blog.kind, references: blog.references, status: blog.status })
    if (error) return res.status(400).json({ error })
  }

  const updatedBlog = await blog.save()
  logger.info('Article de blog mis à jour', { blogId: updatedBlog._id, status: updatedBlog.status })
  res.json(updatedBlog)
})

// PATCH /api/blog/:id/review (admin) — publier ou renvoyer à l'auteur avec une note
export const reviewBlog = catchAsync(async (req, res) => {
  const { decision, note } = req.body
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Décision invalide (approve ou reject)' })
  }
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Article non trouvé' })

  blog.status = decision === 'approve' ? 'published' : 'rejected'
  blog.reviewNote = String(note || '').slice(0, 1000)
  if (decision === 'approve') blog.verifiedBy.addToSet(req.user._id)
  const saved = await blog.save()
  logger.info('Article de blog modéré', { blogId: saved._id, decision })
  res.json(saved)
})

// DELETE /api/blog/:id
export const deleteBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Article non trouvé' })

  if (!isAdmin(req) && !(isOwner(req, blog) && blog.status !== 'published')) {
    return res.status(403).json({ error: 'Suppression non autorisée' })
  }

  await blog.deleteOne()
  logger.info('Article de blog supprimé', { blogId: blog._id })
  res.json({ message: 'Article supprimé avec succès', id: blog._id })
})
