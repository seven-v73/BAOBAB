import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { FileUpload } from '../../components/FileUpload/FileUpload'
import { productService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { Plus, Edit, Trash2, Search, Package, TrendingUp, Image as ImageIcon, FileText, Video, File as FileIcon, X, ArrowUp, ArrowDown, Link as LinkIcon } from 'lucide-react'
import './AdminProducts.css'

interface ProductImage {
  url: string
  caption: string
  order: number
}

interface ProductPDF {
  url: string
  title: string
  description: string
  order: number
}

interface ProductVideo {
  url: string
  title: string
  description: string
  type: 'youtube' | 'vimeo' | 'direct'
  thumbnail: string
  order: number
}

interface ProductDocument {
  url: string
  title: string
  description: string
  type: string
  order: number
}

interface Product {
  _id?: string
  id?: string
  name: string
  description: string
  shortDescription?: string
  price: number
  currency?: 'FCFA' | 'EUR' | 'USD'
  prices?: {
    FCFA?: number
    EUR?: number
    USD?: number
  }
  images?: string[]
  additionalImages?: ProductImage[]
  pdfs?: ProductPDF[]
  videos?: ProductVideo[]
  documents?: ProductDocument[]
  image?: string
  category: string
  stock: number
  sku?: string
  isActive?: boolean
  isFeatured?: boolean
  sales?: number
  views?: number
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'pdfs' | 'videos' | 'documents'>('basic')
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>([])
  const [pdfs, setPdfs] = useState<ProductPDF[]>([])
  const [videos, setVideos] = useState<ProductVideo[]>([])
  const [documents, setDocuments] = useState<ProductDocument[]>([])
  const [uploadMode, setUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    currency: 'FCFA' as 'FCFA' | 'EUR' | 'USD',
    images: '',
    category: 'Artisanat',
    stock: '',
    isFeatured: false,
  })
  const { success, error: showError } = useNotifications()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 1000, includeInactive: 'true' } // Voir tous les produits (actifs et inactifs)
      if (searchTerm) params.search = searchTerm

      const response = await productService.getAll(params)
      const productsData = response.data.products || response.data || []
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error)
      showError('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchTerm) {
        fetchProducts()
      }
    }, 500)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price.toString(),
      currency: product.currency || 'FCFA',
      images: (product.images?.join(', ') || product.image || ''),
      category: product.category,
      stock: product.stock.toString(),
      isFeatured: product.isFeatured || false,
    })
    setAdditionalImages(product.additionalImages?.sort((a, b) => a.order - b.order) || [])
    setPdfs(product.pdfs?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setVideos(product.videos?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setDocuments(product.documents?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [])
    setActiveTab('basic')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Valider les médias partiellement remplis
      const validPdfs = pdfs.filter(pdf => pdf.url && pdf.title)
      const validVideos = videos.filter(video => video.url && video.title)
      const validDocuments = documents.filter(doc => doc.url && doc.title)

      if (pdfs.length > validPdfs.length || videos.length > validVideos.length || documents.length > validDocuments.length) {
        showError('Veuillez compléter tous les champs des médias ou supprimer les entrées incomplètes')
        return
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
        additionalImages: additionalImages.map((img, idx) => ({ ...img, order: idx })),
        pdfs: validPdfs.map((pdf, idx) => ({ ...pdf, order: idx })),
        videos: validVideos.map((video, idx) => ({ ...video, order: idx })),
        documents: validDocuments.map((doc, idx) => ({ ...doc, order: idx })),
        category: formData.category,
        stock: parseInt(formData.stock),
        isFeatured: formData.isFeatured,
      }

      if (editingProduct) {
        await productService.update(editingProduct._id || editingProduct.id || '', productData)
        success('Produit mis à jour avec succès !')
      } else {
        await productService.create(productData)
        success('Produit créé avec succès !')
      }

      resetForm()
      fetchProducts()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde'
      showError(errorMessage)
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await productService.update(product._id || product.id || '', {
        isActive: !product.isActive
      })
      success(`Produit ${product.isActive ? 'désactivé' : 'activé'} avec succès !`)
      fetchProducts()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la modification'
      showError(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      await productService.delete(id)
      success('Produit supprimé avec succès !')
      fetchProducts()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      currency: 'FCFA',
      images: '',
      category: 'Artisanat',
      stock: '',
      isFeatured: false,
    })
    setAdditionalImages([])
    setPdfs([])
    setVideos([])
    setDocuments([])
    setActiveTab('basic')
    setUploadMode({})
    setEditingProduct(null)
    setShowForm(false)
  }

  // Fonctions pour gérer les images additionnelles
  const addAdditionalImage = () => {
    setAdditionalImages([...additionalImages, { url: '', caption: '', order: additionalImages.length }])
  }

  const updateAdditionalImage = (index: number, field: keyof ProductImage, value: string) => {
    const updated = [...additionalImages]
    updated[index] = { ...updated[index], [field]: value }
    setAdditionalImages(updated)
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx })))
  }

  const moveAdditionalImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === additionalImages.length - 1) return
    const updated = [...additionalImages]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setAdditionalImages(updated.map((img, idx) => ({ ...img, order: idx })))
  }

  // Fonctions pour gérer les PDFs
  const addPDF = () => {
    setPdfs([...pdfs, { url: '', title: '', description: '', order: pdfs.length }])
  }

  const updatePDF = (index: number, field: keyof ProductPDF, value: string) => {
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

  const updateVideo = (index: number, field: keyof ProductVideo, value: string) => {
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

  const updateDocument = (index: number, field: keyof ProductDocument, value: string) => {
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
    return <div className="admin-loading">Chargement des produits...</div>
  }

  return (
    <div className="admin-products">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des Produits</h2>
          <p>Gérez les produits de la boutique</p>
        </div>
        <Button onClick={() => {
          resetForm()
          setShowForm(!showForm)
        }}>
          <Plus size={20} />
          {showForm ? 'Annuler' : 'Nouveau Produit'}
        </Button>
      </div>

      <div className="products-search-bar">
        <Search size={20} />
        <Input
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <Card className="product-form-card">
          <h3>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          
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
              Images ({additionalImages.length})
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

          <form onSubmit={handleSubmit} className="product-form">
            <Input
              label="Nom du produit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="form-group">
              <label htmlFor="product-description" className="input-label">Description complète</label>
              <textarea
                id="product-description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-short-description" className="input-label">Description courte (optionnel)</label>
              <textarea
                id="product-short-description"
                name="shortDescription"
                className="form-textarea"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-price" className="input-label">Prix</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{ flex: 1 }}
                  />
                  <select
                    id="product-currency"
                    className="form-select"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'FCFA' | 'EUR' | 'USD' })}
                    style={{ width: '120px' }}
                  >
                    <option value="FCFA">FCFA</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Le prix sera automatiquement converti dans toutes les devises
                </small>
              </div>
              <Input
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-category" className="input-label">Catégorie</label>
                <select
                  id="product-category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Artisanat">Artisanat</option>
                  <option value="Textile">Textile</option>
                  <option value="Bijoux">Bijoux</option>
                  <option value="Cuisine">Cuisine</option>
                  <option value="Musique">Musique</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="product-featured" className="form-checkbox">
                  <input
                    id="product-featured"
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Produit en vedette</span>
                </label>
              </div>
            </div>
            {activeTab === 'basic' && (
              <div className="form-group">
                <label htmlFor="product-images" className="input-label">Images principales (URLs séparées par des virgules)</label>
                <textarea
                  id="product-images"
                  name="images"
                  className="form-textarea"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  rows={2}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
            )}

            {activeTab === 'images' && (
              <div className="media-section">
                <div className="media-section-header">
                  <h4>Images additionnelles</h4>
                  <Button type="button" onClick={addAdditionalImage} size="small">
                    <Plus size={16} />
                    Ajouter une image
                  </Button>
                </div>
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="media-item">
                    <div className="media-item-header">
                      <span className="media-item-number">Image {idx + 1}</span>
                      <div className="media-item-actions">
                        <Button type="button" size="small" variant="outline" onClick={() => moveAdditionalImage(idx, 'up')} disabled={idx === 0}>
                          <ArrowUp size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => moveAdditionalImage(idx, 'down')} disabled={idx === additionalImages.length - 1}>
                          <ArrowDown size={14} />
                        </Button>
                        <Button type="button" size="small" variant="outline" onClick={() => removeAdditionalImage(idx)}>
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
                        onUploadSuccess={(url) => updateAdditionalImage(idx, 'url', url)}
                        label="Uploader une image"
                      />
                    ) : (
                      <Input
                        label="URL de l'image"
                        type="url"
                        value={img.url}
                        onChange={(e) => updateAdditionalImage(idx, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    )}
                    <Input
                      label="Légende (optionnel)"
                      value={img.caption}
                      onChange={(e) => updateAdditionalImage(idx, 'caption', e.target.value)}
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
                      <label htmlFor={`product-pdf-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`product-pdf-description-${idx}`}
                        name={`product-pdf-description-${idx}`}
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
                      <label htmlFor={`product-video-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`product-video-description-${idx}`}
                        name={`product-video-description-${idx}`}
                        className="form-textarea"
                        value={video.description}
                        onChange={(e) => updateVideo(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description de la vidéo"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`product-video-type-${idx}`} className="input-label">Type de vidéo</label>
                      <select
                        id={`product-video-type-${idx}`}
                        name={`product-video-type-${idx}`}
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
                      <label htmlFor={`product-document-description-${idx}`} className="input-label">Description (optionnel)</label>
                      <textarea
                        id={`product-document-description-${idx}`}
                        name={`product-document-description-${idx}`}
                        className="form-textarea"
                        value={doc.description}
                        onChange={(e) => updateDocument(idx, 'description', e.target.value)}
                        rows={2}
                        placeholder="Description du document"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`product-document-type-${idx}`} className="input-label">Type de document</label>
                      <select
                        id={`product-document-type-${idx}`}
                        name={`product-document-type-${idx}`}
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
                {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="products-grid-admin">
        {products.length === 0 ? (
          <Card className="empty-state">
            <Package size={48} />
            <p>Aucun produit pour le moment. Créez votre premier produit !</p>
          </Card>
        ) : (
          products.map((product) => {
            const productId = product._id || product.id || ''
            const productImage = product.images?.[0] || product.image || ''
            
            return (
              <Card key={productId} className="product-card-admin">
                {productImage && (
                  <div className="product-image-admin">
                    <img src={productImage} alt={product.name} />
                  </div>
                )}
                <div className="product-info-admin">
                  <div className="product-header-admin">
                    <h4>{product.name}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {product.isFeatured && (
                        <span className="featured-badge">⭐ Vedette</span>
                      )}
                      {product.isActive === false && (
                        <span style={{ 
                          background: '#ef4444', 
                          color: 'white', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">{product.shortDescription || product.description}</p>
                  <div className="product-meta">
                    <span className="product-price">{product.price.toFixed(2)} €</span>
                    <span className="product-stock">Stock: {product.stock}</span>
                  </div>
                  {(product.sales || product.views) && (
                    <div className="product-stats">
                      {product.sales && (
                        <span className="stat-item">
                          <TrendingUp size={14} />
                          {product.sales} ventes
                        </span>
                      )}
                      {product.views && (
                        <span className="stat-item">
                          👁️ {product.views} vues
                        </span>
                      )}
                    </div>
                  )}
                  <div className="product-actions">
                    <Button
                      size="small"
                      variant={product.isActive ? "outline" : "primary"}
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit size={16} />
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleDelete(productId)}
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
