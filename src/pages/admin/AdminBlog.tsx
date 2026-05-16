import { useState, useEffect } from 'react'
import { usePlatformName } from '../../hooks/usePlatformName'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { FileUpload } from '../../components/FileUpload/FileUpload'
import { MediaUpload } from '../../components/Community/MediaUpload'
import { blogService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { Plus, Edit, Trash2, Eye, Search, Image as ImageIcon, FileText, Video, File as FileIcon, X, ArrowUp, ArrowDown, Link as LinkIcon } from 'lucide-react'
import '../BlogAdmin.css'

interface BlogImage {
  url: string
  caption: string
  order: number
}

interface BlogPDF {
  url: string
  title: string
  description: string
  order: number
}

interface BlogVideo {
  url: string
  title: string
  description: string
  type: 'youtube' | 'vimeo' | 'direct'
  thumbnail: string
  order: number
}

interface BlogDocument {
  url: string
  title: string
  description: string
  type: string
  order: number
}

interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt: string
  author: string
  image?: string
  images?: BlogImage[]
  pdfs?: BlogPDF[]
  videos?: BlogVideo[]
  documents?: BlogDocument[]
  category: string
  tags: string[]
  published: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export const AdminBlog = () => {
  const platformName = usePlatformName()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'pdfs' | 'videos' | 'documents'>('basic')
  const [images, setImages] = useState<BlogImage[]>([])
  const [pdfs, setPdfs] = useState<BlogPDF[]>([])
  const [videos, setVideos] = useState<BlogVideo[]>([])
  const [documents, setDocuments] = useState<BlogDocument[]>([])
  const [uploadMode, setUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
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
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setError(null)
      const response = await blogService.getAll()
      const postsData = Array.isArray(response.data) ? response.data : []
      setPosts(postsData)
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
      
      // Valider les médias partiellement remplis
      const validPdfs = pdfs.filter(pdf => pdf.url && pdf.title)
      const validVideos = videos.filter(video => video.url && video.title)
      const validDocuments = documents.filter(doc => doc.url && doc.title)

      if (pdfs.length > validPdfs.length || videos.length > validVideos.length || documents.length > validDocuments.length) {
        setError('Veuillez compléter tous les champs des médias ou supprimer les entrées incomplètes')
        showError('Veuillez compléter tous les champs des médias ou supprimer les entrées incomplètes')
        return
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        author: formData.author.trim() || `${platformName} Team`,
        image: formData.image.trim(),
        images: images.map((img, idx) => ({ ...img, order: idx })),
        pdfs: validPdfs.map((pdf, idx) => ({ ...pdf, order: idx })),
        videos: validVideos.map((video, idx) => ({ ...video, order: idx })),
        documents: validDocuments.map((doc, idx) => ({ ...doc, order: idx })),
        category: formData.category,
        tags: tagsArray,
        published: formData.published,
      }

      if (editingPost) {
        await blogService.update(editingPost._id, postData)
        success('Article mis à jour avec succès !')
      } else {
        await blogService.create(postData)
        success('Article créé avec succès !')
      }

      resetForm()
      fetchPosts()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde de l\'article'
      setError(errorMessage)
      showError(errorMessage)
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
    setImages(post.images?.sort((a, b) => a.order - b.order) || [])
    setPdfs(post.pdfs?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setVideos(post.videos?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setDocuments(post.documents?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setActiveTab('basic')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Supprimer cet article ?',
      message: 'L’article sera retiré du blog.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await blogService.delete(id)
      success('Article supprimé avec succès !')
      fetchPosts()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
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
    setImages([])
    setPdfs([])
    setVideos([])
    setDocuments([])
    setActiveTab('basic')
    setUploadMode({})
    setEditingPost(null)
    setShowForm(false)
  }

  // Fonctions pour gérer les images
  const addImage = () => {
    setImages([...images, { url: '', caption: '', order: images.length }])
  }

  const updateImage = (index: number, field: keyof BlogImage, value: string) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: value }
    setImages(updated)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx })))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === images.length - 1) return
    const updated = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setImages(updated.map((img, idx) => ({ ...img, order: idx })))
  }

  // Fonctions pour gérer les PDFs
  const addPDF = () => {
    setPdfs([...pdfs, { url: '', title: '', description: '', order: pdfs.length }])
  }

  const updatePDF = (index: number, field: keyof BlogPDF, value: string) => {
    const updated = [...pdfs]
    updated[index] = { ...updated[index], [field]: value }
    setPdfs(updated)
  }

  const removePDF = (index: number) => {
    setPdfs(pdfs.filter((_, i) => i !== index).map((pdf, idx) => ({ ...pdf, order: idx })))
  }

  const movePDF = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === pdfs.length - 1) return
    const updated = [...pdfs]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setPdfs(updated.map((pdf, idx) => ({ ...pdf, order: idx })))
  }

  // Fonctions pour gérer les vidéos
  const addVideo = () => {
    setVideos([...videos, { url: '', title: '', description: '', type: 'direct', thumbnail: '', order: videos.length }])
  }

  const updateVideo = (index: number, field: keyof BlogVideo, value: string) => {
    const updated = [...videos]
    updated[index] = { ...updated[index], [field]: value }
    setVideos(updated)
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index).map((video, idx) => ({ ...video, order: idx })))
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === videos.length - 1) return
    const updated = [...videos]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setVideos(updated.map((video, idx) => ({ ...video, order: idx })))
  }

  // Fonctions pour gérer les documents
  const addDocument = () => {
    setDocuments([...documents, { url: '', title: '', description: '', type: 'document', order: documents.length }])
  }

  const updateDocument = (index: number, field: keyof BlogDocument, value: string) => {
    const updated = [...documents]
    updated[index] = { ...updated[index], [field]: value }
    setDocuments(updated)
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index).map((doc, idx) => ({ ...doc, order: idx })))
  }

  const moveDocument = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === documents.length - 1) return
    const updated = [...documents]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setDocuments(updated.map((doc, idx) => ({ ...doc, order: idx })))
  }

  if (loading) {
    return <div className="loading">Chargement des articles...</div>
  }

  return (
    <div className="admin-blog">
      <div className="admin-section-header">
        <div>
          <h2>Gestion du Blog</h2>
          <p>Créez et gérez les articles de blog</p>
        </div>
        <Button onClick={() => {
          resetForm()
          setShowForm(!showForm)
        }}>
          <Plus size={20} />
          {showForm ? 'Annuler' : 'Nouvel Article'}
        </Button>
      </div>

      <div className="blog-search-bar">
        <Search size={20} />
        <Input
          placeholder="Rechercher un article..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
          <h3>{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</h3>
          
          {/* Onglets */}
          <div className="form-tabs">
            <button
              type="button"
              className={`form-tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Informations
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Images ({images.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'pdfs' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdfs')}
            >
              PDFs ({pdfs.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Vidéos ({videos.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({documents.length})
            </button>
          </div>

          <form onSubmit={handleSubmit} className="blog-form">
            <Input
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Titre de l'article"
            />

            <div className="form-group">
              <label htmlFor="blog-content" className="input-label">Contenu</label>
              <textarea
                id="blog-content"
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
              <label htmlFor="blog-excerpt" className="input-label">Extrait (optionnel)</label>
              <textarea
                id="blog-excerpt"
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
                <label htmlFor="blog-category" className="input-label">Catégorie</label>
                <select
                  id="blog-category"
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

            {activeTab === 'basic' && (
              <>
                <MediaUpload
                  type="image"
                  value={formData.image}
                  label="Image principale"
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                />

                <Input
                  label="Tags (séparés par des virgules)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Afrique, Histoire, Culture"
                />

                <div className="form-group">
                  <label htmlFor="blog-published" className="form-checkbox">
                    <input
                      id="blog-published"
                      name="published"
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span>Publier l'article</span>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'images' && (
              <div className="media-section">
                <div className="media-section-header">
                  <h4>Images additionnelles</h4>
                  <Button type="button" onClick={addImage} size="small">
                    <Plus size={16} />
                    Ajouter une image
                  </Button>
                </div>
                {images.map((img, idx) => (
                  <div key={idx} className="media-item">
                    <div className="media-item-header">
                      <span className="media-item-number">Image {idx + 1}</span>
                      <div className="media-item-actions">
                        <Button type="button" size="small" variant="outline" onClick={() => moveImage(idx, 'up')} disabled={idx === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => removeImage(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="media-upload-mode">
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`image-${idx}`] === 'upload' ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`image-${idx}`]: 'upload' })}
                      >
                        <ImageIcon size={14} />
                        Upload depuis PC
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`image-${idx}`] === 'url' || !uploadMode[`image-${idx}`] ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`image-${idx}`]: 'url' })}
                      >
                        <LinkIcon size={14} />
                        Lien URL
                      </Button>
                    </div>
                    {uploadMode[`image-${idx}`] === 'upload' ? (
                      <FileUpload
                        type="image"
                        onUploadSuccess={(url) => updateImage(idx, 'url', url)}
                        label="Uploader une image"
                      />
                    ) : (
                      <Input
                        label="URL de l'image"
                        type="url"
                        value={img.url}
                        onChange={(e) => updateImage(idx, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    )}
                    <Input
                      label="Légende (optionnel)"
                      value={img.caption}
                      onChange={(e) => updateImage(idx, 'caption', e.target.value)}
                      placeholder="Description de l'image"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pdfs' && (
              <div className="media-section">
                <div className="media-section-header">
                  <h4>Documents PDF</h4>
                  <Button type="button" onClick={addPDF} size="small">
                    <Plus size={16} />
                    Ajouter un PDF
                  </Button>
                </div>
                {pdfs.map((pdf, idx) => (
                  <div key={idx} className="media-item">
                    <div className="media-item-header">
                      <span className="media-item-number">PDF {idx + 1}</span>
                      <div className="media-item-actions">
                        <Button type="button" size="small" variant="outline" onClick={() => movePDF(idx, 'up')} disabled={idx === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => movePDF(idx, 'down')} disabled={idx === pdfs.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => removePDF(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="media-upload-mode">
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`pdf-${idx}`] === 'upload' ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`pdf-${idx}`]: 'upload' })}
                      >
                        <FileText size={14} />
                        Upload depuis PC
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`pdf-${idx}`] === 'url' || !uploadMode[`pdf-${idx}`] ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`pdf-${idx}`]: 'url' })}
                      >
                        <LinkIcon size={14} />
                        Lien URL
                      </Button>
                    </div>
                    {uploadMode[`pdf-${idx}`] === 'upload' ? (
                      <FileUpload
                        type="pdf"
                        onUploadSuccess={(url) => updatePDF(idx, 'url', url)}
                        label="Uploader un PDF"
                      />
                    ) : (
                      <Input
                        label="URL du PDF"
                        type="url"
                        value={pdf.url}
                        onChange={(e) => updatePDF(idx, 'url', e.target.value)}
                        placeholder="https://example.com/document.pdf"
                      />
                    )}
                    <Input
                      label="Titre du PDF"
                      value={pdf.title}
                      onChange={(e) => updatePDF(idx, 'title', e.target.value)}
                      placeholder="Titre du document"
                      required
                    />
                    <div className="form-group">
                      <label htmlFor={`pdf-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`pdf-description-${idx}`}
                        name={`pdf-description-${idx}`}
                        className="form-textarea"
                        value={pdf.description}
                        onChange={(e) => updatePDF(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description du document"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="media-section">
                <div className="media-section-header">
                  <h4>Vidéos</h4>
                  <Button type="button" onClick={addVideo} size="small">
                    <Plus size={16} />
                    Ajouter une vidéo
                  </Button>
                </div>
                {videos.map((video, idx) => (
                  <div key={idx} className="media-item">
                    <div className="media-item-header">
                      <span className="media-item-number">Vidéo {idx + 1}</span>
                      <div className="media-item-actions">
                        <Button type="button" size="small" variant="outline" onClick={() => moveVideo(idx, 'up')} disabled={idx === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => moveVideo(idx, 'down')} disabled={idx === videos.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => removeVideo(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="media-upload-mode">
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`video-${idx}`] === 'upload' ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`video-${idx}`]: 'upload' })}
                      >
                        <Video size={14} />
                        Upload depuis PC
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`video-${idx}`] === 'url' || !uploadMode[`video-${idx}`] ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`video-${idx}`]: 'url' })}
                      >
                        <LinkIcon size={14} />
                        Lien URL
                      </Button>
                    </div>
                    {uploadMode[`video-${idx}`] === 'upload' ? (
                      <FileUpload
                        type="video"
                        onUploadSuccess={(url) => updateVideo(idx, 'url', url)}
                        label="Uploader une vidéo"
                      />
                    ) : (
                      <Input
                        label="URL de la vidéo"
                        type="url"
                        value={video.url}
                        onChange={(e) => updateVideo(idx, 'url', e.target.value)}
                        placeholder="https://example.com/video.mp4 ou lien YouTube/Vimeo"
                      />
                    )}
                    <Input
                      label="Titre de la vidéo"
                      value={video.title}
                      onChange={(e) => updateVideo(idx, 'title', e.target.value)}
                      placeholder="Titre de la vidéo"
                      required
                    />
                    <div className="form-group">
                      <label htmlFor={`video-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`video-description-${idx}`}
                        name={`video-description-${idx}`}
                        className="form-textarea"
                        value={video.description}
                        onChange={(e) => updateVideo(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description de la vidéo"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`video-type-${idx}`} className="input-label">Type de vidéo</label>
                      <select
                        id={`video-type-${idx}`}
                        name={`video-type-${idx}`}
                        className="form-select"
                        value={video.type}
                        onChange={(e) => updateVideo(idx, 'type', e.target.value as 'youtube' | 'vimeo' | 'direct')}
                      >
                        <option value="direct">Direct (MP4, WebM, etc.)</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                      </select>
                    </div>
                    <Input
                      label="Miniature (URL optionnel)"
                      type="url"
                      value={video.thumbnail}
                      onChange={(e) => updateVideo(idx, 'thumbnail', e.target.value)}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="media-section">
                <div className="media-section-header">
                  <h4>Autres documents</h4>
                  <Button type="button" onClick={addDocument} size="small">
                    <Plus size={16} />
                    Ajouter un document
                  </Button>
                </div>
                {documents.map((doc, idx) => (
                  <div key={idx} className="media-item">
                    <div className="media-item-header">
                      <span className="media-item-number">Document {idx + 1}</span>
                      <div className="media-item-actions">
                        <Button type="button" size="small" variant="outline" onClick={() => moveDocument(idx, 'up')} disabled={idx === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => moveDocument(idx, 'down')} disabled={idx === documents.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => removeDocument(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="media-upload-mode">
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`document-${idx}`] === 'upload' ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`document-${idx}`]: 'upload' })}
                      >
                        <FileIcon size={14} />
                        Upload depuis PC
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant={uploadMode[`document-${idx}`] === 'url' || !uploadMode[`document-${idx}`] ? 'primary' : 'outline'}
                        onClick={() => setUploadMode({ ...uploadMode, [`document-${idx}`]: 'url' })}
                      >
                        <LinkIcon size={14} />
                        Lien URL
                      </Button>
                    </div>
                    {uploadMode[`document-${idx}`] === 'upload' ? (
                      <FileUpload
                        type="document"
                        onUploadSuccess={(url) => updateDocument(idx, 'url', url)}
                        label="Uploader un document"
                      />
                    ) : (
                      <Input
                        label="URL du document"
                        type="url"
                        value={doc.url}
                        onChange={(e) => updateDocument(idx, 'url', e.target.value)}
                        placeholder="https://example.com/document.docx"
                      />
                    )}
                    <Input
                      label="Titre du document"
                      value={doc.title}
                      onChange={(e) => updateDocument(idx, 'title', e.target.value)}
                      placeholder="Titre du document"
                      required
                    />
                    <div className="form-group">
                      <label htmlFor={`document-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`document-description-${idx}`}
                        name={`document-description-${idx}`}
                        className="form-textarea"
                        value={doc.description}
                        onChange={(e) => updateDocument(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description du document"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`document-type-${idx}`} className="input-label">Type de document</label>
                      <select
                        id={`document-type-${idx}`}
                        name={`document-type-${idx}`}
                        className="form-select"
                        value={doc.type}
                        onChange={(e) => updateDocument(idx, 'type', e.target.value)}
                      >
                        <option value="document">Document</option>
                        <option value="docx">DOCX</option>
                        <option value="xlsx">XLSX</option>
                        <option value="pptx">PPTX</option>
                        <option value="odt">ODT</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

      <div className="admin-blog-list">
        <h3>Articles ({posts.length})</h3>
        <div className="admin-posts-grid">
          {posts
            .filter(post => 
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((post) => (
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
              <h4>{post.title}</h4>
              <p className="admin-post-excerpt">{post.excerpt || post.content.substring(0, 150)}...</p>
              <div className="admin-post-meta">
                <span className="category">{post.category}</span>
                <span className="date">
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {Dialog}
    </div>
  )
}
