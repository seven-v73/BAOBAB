import { useState, useEffect } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { useAuthStore } from '../stores/authStore'
import { blogService } from '../services/api'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import './BlogAdmin.css'

interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt: string
  author: string
  image?: string
  category: string
  tags: string[]
  published: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export const BlogAdmin = () => {
  const platformName = usePlatformName()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: `${platformName} Team`,
    image: '',
    category: 'Histoire',
    tags: '',
    published: true,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchPosts()
  }, [isAuthenticated, navigate])

  const fetchPosts = async () => {
    try {
      setError(null)
      const response = await blogService.getAll()
      setPosts(response.data)
    } catch (error: any) {
      console.error('Erreur lors du chargement des articles:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de connexion au serveur'
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network')) {
        setError('Le serveur backend n\'est pas démarré. Veuillez démarrer le serveur avec: cd server && npm run dev')
      } else {
        setError(`Erreur: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        setError('Le titre et le contenu sont obligatoires')
        return
      }

      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        author: formData.author.trim() || `${platformName} Team`,
        image: formData.image.trim(),
        category: formData.category,
        tags: tagsArray,
        published: formData.published,
      }

      let response
      if (editingPost) {
        response = await blogService.update(editingPost._id, postData)
      } else {
        console.log('Création d\'un article avec les données:', postData)
        response = await blogService.create(postData)
        console.log('Réponse du serveur:', response.data)
      }

      resetForm()
      fetchPosts()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde de l\'article'
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network')) {
        setError('Le serveur backend n\'est pas démarré. Veuillez démarrer le serveur avec: cd server && npm run dev')
      } else {
        setError(`Erreur: ${errorMessage}`)
      }
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      image: post.image || '',
      category: post.category,
      tags: post.tags.join(', '),
      published: post.published,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return
    }

    try {
      await blogService.delete(id)
      fetchPosts()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'article')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: `${platformName} Team`,
      image: '',
      category: 'Histoire',
      tags: '',
      published: true,
    })
    setEditingPost(null)
    setShowForm(false)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <div className="blog-admin">
        <div className="blog-admin-header">
          <h1>Administration du Blog</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} />
            {showForm ? 'Annuler' : 'Nouvel Article'}
          </Button>
        </div>

        {error && (
          <div className="blog-admin-error" style={{
            padding: '1rem',
            margin: '1rem 0',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            color: '#e74c3c'
          }}>
            {error}
          </div>
        )}

        {showForm && (
          <Card className="blog-form-card">
            <h2>{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</h2>
            <form onSubmit={handleSubmit} className="blog-form">
              <Input
                label="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Titre de l'article"
              />

              <div className="form-group">
                <label htmlFor="blog-content-admin" className="input-label">Contenu</label>
                <textarea
                  id="blog-content-admin"
                  name="content"
                  className="form-textarea"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  placeholder="Contenu de l'article..."
                  rows={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-excerpt-admin" className="input-label">Extrait (optionnel)</label>
                <textarea
                  id="blog-excerpt-admin"
                  name="excerpt"
                  className="form-textarea"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Court résumé de l'article..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <Input
                  label="Auteur"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Nom de l'auteur"
                />

                <div className="form-group">
                  <label htmlFor="blog-category-admin" className="input-label">Catégorie</label>
                  <select
                    id="blog-category-admin"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Histoire">Histoire</option>
                    <option value="Culture">Culture</option>
                    <option value="Géographie">Géographie</option>
                    <option value="Économie">Économie</option>
                    <option value="Politique">Politique</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <Input
                label="Image (URL)"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />

              <Input
                label="Tags (séparés par des virgules)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Afrique, Histoire, Culture"
              />

              <div className="form-group">
                <label htmlFor="blog-published-admin" className="form-checkbox">
                  <input
                    id="blog-published-admin"
                    name="published"
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <span>Publier l'article</span>
                </label>
              </div>

              <div className="form-actions">
                <Button type="submit">
                  {editingPost ? 'Mettre à jour' : 'Créer l\'article'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="blog-admin-list">
          <h2>Articles ({posts.length})</h2>
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <div className="admin-posts-grid">
              {posts.map((post) => (
                <Card key={post._id} className="admin-post-card">
                  <div className="admin-post-header">
                    <div className="admin-post-status">
                      <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="views-count">{post.views} vues</span>
                    </div>
                    <div className="admin-post-actions">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => navigate(`/blog/${post._id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleDelete(post._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <h3>{post.title}</h3>
                  <p className="admin-post-excerpt">{post.excerpt || post.content.substring(0, 150)}...</p>
                  <div className="admin-post-meta">
                    <span className="category">{post.category}</span>
                    <span className="date">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="admin-post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

