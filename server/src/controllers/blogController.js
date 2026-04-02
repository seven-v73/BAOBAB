import Blog from '../models/Blog.js'
import logger from '../utils/logger.js'
import { catchAsync } from '../utils/errorHandler.js'

// GET /api/blog - Récupérer tous les articles
export const getAllBlogs = catchAsync(async (req, res) => {
  const { category, search, published } = req.query
  const query = {}

  if (category) {
    query.category = category
  }

  if (published !== undefined) {
    query.published = published === 'true'
  }

  if (search) {
    query.$text = { $search: search }
  }

  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 })
    .select('-__v')

  res.json(blogs)
})

// GET /api/blog/:id - Récupérer un article par ID
export const getBlogById = catchAsync(async (req, res) => {
  const { id } = req.params
  const blog = await Blog.findById(id).select('-__v')

  if (!blog) {
    return res.status(404).json({ error: 'Article non trouvé' })
  }

  // Incrémenter les vues
  blog.views += 1
  await blog.save()

  res.json(blog)
})

// POST /api/blog - Créer un nouvel article
export const createBlog = catchAsync(async (req, res) => {
  const { title, content, excerpt, author, image, images, pdfs, videos, documents, category, tags, published } = req.body

  // Générer un excerpt si non fourni
  const blogExcerpt = excerpt || content.substring(0, 200) + '...'

  // Utiliser le nom de l'utilisateur connecté comme auteur si non fourni
  const authorName = author || (req.user?.name ? req.user.name : 'BAOBAB Team')

  const blog = new Blog({
    title,
    content,
    excerpt: blogExcerpt,
    author: authorName,
    image: image || '',
    images: images || [],
    pdfs: pdfs || [],
    videos: videos || [],
    documents: documents || [],
    category: category || 'Histoire',
    tags: tags || [],
    published: published !== undefined ? published : false, // Par défaut non publié, l'admin valide
  })

  const savedBlog = await blog.save()
  logger.info('Article de blog créé', { blogId: savedBlog._id, title: savedBlog.title })
  res.status(201).json(savedBlog)
})

// PUT /api/blog/:id - Mettre à jour un article
export const updateBlog = catchAsync(async (req, res) => {
  const { id } = req.params
  const { title, content, excerpt, author, image, images, pdfs, videos, documents, category, tags, published } = req.body

  const blog = await Blog.findById(id)

  if (!blog) {
    return res.status(404).json({ error: 'Article non trouvé' })
  }

  // Mettre à jour les champs fournis
  if (title) blog.title = title
  if (content) blog.content = content
  if (excerpt !== undefined) blog.excerpt = excerpt
  if (author) blog.author = author
  if (image !== undefined) blog.image = image
  if (images !== undefined) blog.images = images
  if (pdfs !== undefined) blog.pdfs = pdfs
  if (videos !== undefined) blog.videos = videos
  if (documents !== undefined) blog.documents = documents
  if (category) blog.category = category
  if (tags) blog.tags = tags
  if (published !== undefined) blog.published = published

  // Générer un excerpt si le contenu change et qu'aucun excerpt n'est fourni
  if (content && !excerpt) {
    blog.excerpt = content.substring(0, 200) + '...'
  }

  const updatedBlog = await blog.save()
  logger.info('Article de blog mis à jour', { blogId: updatedBlog._id })
  res.json(updatedBlog)
})

// DELETE /api/blog/:id - Supprimer un article
export const deleteBlog = catchAsync(async (req, res) => {
  const { id } = req.params
  const blog = await Blog.findByIdAndDelete(id)

  if (!blog) {
    return res.status(404).json({ error: 'Article non trouvé' })
  }

  logger.info('Article de blog supprimé', { blogId: id })
  res.json({ message: 'Article supprimé avec succès', id })
})

