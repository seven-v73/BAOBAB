import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { FileUpload } from '../components/FileUpload/FileUpload'
import { useAuthStore } from '../stores/authStore'
import { userService, orderService, blogService, productService, authService, proverbService, countryService, bookmarkService, progressService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
// Toutes les icônes sont remplacées par des effets CSS élégants
import './Dashboard.css'

interface UserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  address?: {
    street?: string
    city?: string
    zipCode?: string
    country?: string
  }
  favorites?: any[]
  wishlist?: any[]
  createdAt: string
}

interface Order {
  _id: string
  orderNumber: string
  items: Array<{
    product: any
    name: string
    price: number
    quantity: number
    subtotal: number
  }>
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  trackingNumber?: string
}

type DashboardSection = 'overview' | 'orders' | 'favorites' | 'wishlist' | 'myBlogs' | 'myProducts' | 'profile' | 'settings' | 'proverbs' | 'bookmarks' | 'progress'

export const Dashboard = () => {
  const { isAuthenticated, user: authUser } = useAuthStore()
  const { success, showError } = useNotifications()
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [orderFilter, setOrderFilter] = useState<string>('all')
  const [orderSort, setOrderSort] = useState<string>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    country: '',
  })
  const [myBlogs, setMyBlogs] = useState<any[]>([])
  const [myProducts, setMyProducts] = useState<any[]>([])
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [blogActiveTab, setBlogActiveTab] = useState<'basic' | 'images' | 'pdfs' | 'videos' | 'documents'>('basic')
  const [productActiveTab, setProductActiveTab] = useState<'basic' | 'images' | 'pdfs' | 'videos' | 'documents'>('basic')
  
  // États pour les paramètres
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  
  // États pour les favoris (bookmarks)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(false)
  const [bookmarkFilter, setBookmarkFilter] = useState<string>('all')
  
  // États pour la progression
  const [userProgress, setUserProgress] = useState<any>(null)
  const [progressLoading, setProgressLoading] = useState(false)
  
  // États pour les médias des blogs
  const [blogImages, setBlogImages] = useState<Array<{ url: string; caption: string; order: number }>>([])
  const [blogPdfs, setBlogPdfs] = useState<Array<{ url: string; title: string; description: string; order: number }>>([])
  const [blogVideos, setBlogVideos] = useState<Array<{ url: string; title: string; description: string; type: 'youtube' | 'vimeo' | 'direct'; thumbnail: string; order: number }>>([])
  const [blogDocuments, setBlogDocuments] = useState<Array<{ url: string; title: string; description: string; type: string; order: number }>>([])
  const [blogUploadMode, setBlogUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})
  
  // États pour les médias des produits
  const [productAdditionalImages, setProductAdditionalImages] = useState<Array<{ url: string; caption: string; order: number }>>([])
  const [productPdfs, setProductPdfs] = useState<Array<{ url: string; title: string; description: string; order: number }>>([])
  const [productVideos, setProductVideos] = useState<Array<{ url: string; title: string; description: string; type: 'youtube' | 'vimeo' | 'direct'; thumbnail: string; order: number }>>([])
  const [productDocuments, setProductDocuments] = useState<Array<{ url: string; title: string; description: string; type: string; order: number }>>([])
  const [productUploadMode, setProductUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})
  
  // États pour les proverbes
  const [proverbFormData, setProverbFormData] = useState({
    text: '',
    translation: '',
    explanation: '',
    country: '',
    language: '',
    category: 'Sagesse',
    tags: '',
    source: '',
    author: '',
  })
  const [countries, setCountries] = useState<any[]>([])
  const [submittingProverb, setSubmittingProverb] = useState(false)
  const [myProverbs, setMyProverbs] = useState<any[]>([])
  
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: 'Histoire',
    tags: '',
  })
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    currency: 'FCFA' as 'FCFA' | 'EUR' | 'USD',
    images: '',
    category: 'Artisanat',
    stock: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (activeSection === 'myBlogs') {
      fetchMyBlogs()
    } else if (activeSection === 'myProducts') {
      fetchMyProducts()
    } else if (activeSection === 'proverbs') {
      fetchCountries()
      fetchMyProverbs()
    } else if (activeSection === 'bookmarks') {
      fetchBookmarks()
    } else if (activeSection === 'progress') {
      fetchProgress()
    }
  }, [activeSection])

  const fetchCountries = async () => {
    try {
      const response = await countryService.getAll()
      // L'API peut retourner un tableau directement ou un objet avec une propriété countries
      const countriesData = Array.isArray(response.data) 
        ? response.data 
        : response.data.countries || []
      setCountries(countriesData)
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
    }
  }

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true)
      const response = await bookmarkService.getAll({ limit: 100 })
      setBookmarks(response.data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
      showError('Erreur lors du chargement des favoris')
    } finally {
      setBookmarksLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      setProgressLoading(true)
      const response = await progressService.get()
      setUserProgress(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error)
      showError('Erreur lors du chargement de la progression')
    } finally {
      setProgressLoading(false)
    }
  }

  const fetchMyProverbs = async () => {
    try {
      const response = await proverbService.getAll({ limit: 100 })
      const allProverbs = response.data.proverbs || response.data.data?.proverbs || []
      // Filtrer les proverbes créés par l'utilisateur actuel
      const userId = profile?._id || authUser?.id || authUser?._id
      const userProverbs = allProverbs.filter((p: any) => 
        p.createdBy?._id === userId || p.createdBy === userId
      )
      setMyProverbs(userProverbs)
    } catch (error) {
      console.error('Erreur lors du chargement des proverbes:', error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [profileRes, ordersRes] = await Promise.all([
        userService.getProfile(),
        orderService.getMyOrders().catch(() => ({ data: [] })), // Si pas de commandes
      ])

      const userData = profileRes.data
      setProfile(userData)
      setOrders(ordersRes.data || [])
      
      // S'assurer que l'ID est disponible dans authUser si nécessaire
      if (userData._id && !authUser?.id && !authUser?._id) {
        // L'ID sera disponible via profile._id
      }
      
      // Populate form data
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        zipCode: userData.address?.zipCode || '',
        country: userData.address?.country || '',
      })
    } catch (err: any) {
      showError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBlogs = async () => {
    try {
      const response = await blogService.getAll()
      const allBlogs = Array.isArray(response.data) ? response.data : []
      // Filtrer par auteur (nom de l'utilisateur)
      const userBlogs = allBlogs.filter((blog: any) => 
        blog.author === profile?.name || blog.author === authUser?.name
      )
      setMyBlogs(userBlogs)
    } catch (err: any) {
      showError('Erreur lors du chargement de vos articles')
    }
  }

  const fetchMyProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 1000 })
      const allProducts = response.data.products || response.data || []
      // Note: On ne peut pas filtrer par créateur car le modèle Product n'a pas de champ createdBy
      // Pour l'instant, on affiche tous les produits, mais on pourrait ajouter ce champ plus tard
      setMyProducts(Array.isArray(allProducts) ? allProducts : [])
    } catch (err: any) {
      showError('Erreur lors du chargement de vos produits')
    }
  }

  // Fonctions pour gérer les médias des blogs
  const addBlogImage = () => setBlogImages([...blogImages, { url: '', caption: '', order: blogImages.length }])
  const updateBlogImage = (index: number, field: 'url' | 'caption', value: string) => {
    const updated = [...blogImages]
    updated[index] = { ...updated[index], [field]: value }
    setBlogImages(updated)
  }
  const removeBlogImage = (index: number) => {
    setBlogImages(blogImages.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx })))
  }

  const addBlogPDF = () => setBlogPdfs([...blogPdfs, { url: '', title: '', description: '', order: blogPdfs.length }])
  const updateBlogPDF = (index: number, field: 'url' | 'title' | 'description', value: string) => {
    const updated = [...blogPdfs]
    updated[index] = { ...updated[index], [field]: value }
    setBlogPdfs(updated)
  }
  const removeBlogPDF = (index: number) => {
    setBlogPdfs(blogPdfs.filter((_, i) => i !== index).map((pdf, idx) => ({ ...pdf, order: idx })))
  }

  const addBlogVideo = () => setBlogVideos([...blogVideos, { url: '', title: '', description: '', type: 'direct', thumbnail: '', order: blogVideos.length }])
  const updateBlogVideo = (index: number, field: 'url' | 'title' | 'description' | 'type' | 'thumbnail', value: string) => {
    const updated = [...blogVideos]
    updated[index] = { ...updated[index], [field]: value }
    setBlogVideos(updated)
  }
  const removeBlogVideo = (index: number) => {
    setBlogVideos(blogVideos.filter((_, i) => i !== index).map((video, idx) => ({ ...video, order: idx })))
  }

  const addBlogDocument = () => setBlogDocuments([...blogDocuments, { url: '', title: '', description: '', type: 'document', order: blogDocuments.length }])
  const updateBlogDocument = (index: number, field: 'url' | 'title' | 'description' | 'type', value: string) => {
    const updated = [...blogDocuments]
    updated[index] = { ...updated[index], [field]: value }
    setBlogDocuments(updated)
  }
  const removeBlogDocument = (index: number) => {
    setBlogDocuments(blogDocuments.filter((_, i) => i !== index).map((doc, idx) => ({ ...doc, order: idx })))
  }

  // Fonctions pour gérer les médias des produits
  const addProductImage = () => setProductAdditionalImages([...productAdditionalImages, { url: '', caption: '', order: productAdditionalImages.length }])
  const updateProductImage = (index: number, field: 'url' | 'caption', value: string) => {
    const updated = [...productAdditionalImages]
    updated[index] = { ...updated[index], [field]: value }
    setProductAdditionalImages(updated)
  }
  const removeProductImage = (index: number) => {
    setProductAdditionalImages(productAdditionalImages.filter((_, i) => i !== index).map((img, idx) => ({ ...img, order: idx })))
  }

  const addProductPDF = () => setProductPdfs([...productPdfs, { url: '', title: '', description: '', order: productPdfs.length }])
  const updateProductPDF = (index: number, field: 'url' | 'title' | 'description', value: string) => {
    const updated = [...productPdfs]
    updated[index] = { ...updated[index], [field]: value }
    setProductPdfs(updated)
  }
  const removeProductPDF = (index: number) => {
    setProductPdfs(productPdfs.filter((_, i) => i !== index).map((pdf, idx) => ({ ...pdf, order: idx })))
  }

  const addProductVideo = () => setProductVideos([...productVideos, { url: '', title: '', description: '', type: 'direct', thumbnail: '', order: productVideos.length }])
  const updateProductVideo = (index: number, field: 'url' | 'title' | 'description' | 'type' | 'thumbnail', value: string) => {
    const updated = [...productVideos]
    updated[index] = { ...updated[index], [field]: value }
    setProductVideos(updated)
  }
  const removeProductVideo = (index: number) => {
    setProductVideos(productVideos.filter((_, i) => i !== index).map((video, idx) => ({ ...video, order: idx })))
  }

  const addProductDocument = () => setProductDocuments([...productDocuments, { url: '', title: '', description: '', type: 'document', order: productDocuments.length }])
  const updateProductDocument = (index: number, field: 'url' | 'title' | 'description' | 'type', value: string) => {
    const updated = [...productDocuments]
    updated[index] = { ...updated[index], [field]: value }
    setProductDocuments(updated)
  }
  const removeProductDocument = (index: number) => {
    setProductDocuments(productDocuments.filter((_, i) => i !== index).map((doc, idx) => ({ ...doc, order: idx })))
  }

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tagsArray = blogFormData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      // Valider les médias partiellement remplis
      const validPdfs = blogPdfs.filter(pdf => pdf.url && pdf.title)
      const validVideos = blogVideos.filter(video => video.url && video.title)
      const validDocuments = blogDocuments.filter(doc => doc.url && doc.title)

      if (blogPdfs.length > validPdfs.length || blogVideos.length > validVideos.length || blogDocuments.length > validDocuments.length) {
        showError('Veuillez compléter tous les champs des médias ou supprimer les entrées incomplètes')
        return
      }
      
      await blogService.create({
        title: blogFormData.title.trim(),
        content: blogFormData.content.trim(),
        excerpt: blogFormData.excerpt.trim(),
        image: blogFormData.image.trim(),
        images: blogImages.map((img, idx) => ({ ...img, order: idx })),
        pdfs: validPdfs.map((pdf, idx) => ({ ...pdf, order: idx })),
        videos: validVideos.map((video, idx) => ({ ...video, order: idx })),
        documents: validDocuments.map((doc, idx) => ({ ...doc, order: idx })),
        category: blogFormData.category,
        tags: tagsArray,
        published: false, // Par défaut non publié, l'admin valide
      })

      success('Article créé avec succès ! Il sera publié après validation par un administrateur.')
      setBlogFormData({
        title: '',
        content: '',
        excerpt: '',
        image: '',
        category: 'Histoire',
        tags: '',
      })
      setBlogImages([])
      setBlogPdfs([])
      setBlogVideos([])
      setBlogDocuments([])
      setBlogActiveTab('basic')
      setBlogUploadMode({})
      setShowBlogForm(false)
      fetchMyBlogs()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la création de l\'article')
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Valider les médias partiellement remplis
      const validPdfs = productPdfs.filter(pdf => pdf.url && pdf.title)
      const validVideos = productVideos.filter(video => video.url && video.title)
      const validDocuments = productDocuments.filter(doc => doc.url && doc.title)

      if (productPdfs.length > validPdfs.length || productVideos.length > validVideos.length || productDocuments.length > validDocuments.length) {
        showError('Veuillez compléter tous les champs des médias ou supprimer les entrées incomplètes')
        return
      }

      await productService.create({
        name: productFormData.name.trim(),
        description: productFormData.description.trim(),
        shortDescription: productFormData.shortDescription.trim(),
        price: parseFloat(productFormData.price),
        currency: productFormData.currency,
        images: productFormData.images.split(',').map(img => img.trim()).filter(Boolean),
        additionalImages: productAdditionalImages.map((img, idx) => ({ ...img, order: idx })),
        pdfs: validPdfs.map((pdf, idx) => ({ ...pdf, order: idx })),
        videos: validVideos.map((video, idx) => ({ ...video, order: idx })),
        documents: validDocuments.map((doc, idx) => ({ ...doc, order: idx })),
        category: productFormData.category,
        stock: parseInt(productFormData.stock),
        isActive: false, // Par défaut non actif, l'admin valide
      })

      success('Produit créé avec succès ! Il sera activé après validation par un administrateur.')
      setProductFormData({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        currency: 'FCFA',
        images: '',
        category: 'Artisanat',
        stock: '',
      })
      setProductAdditionalImages([])
      setProductPdfs([])
      setProductVideos([])
      setProductDocuments([])
      setProductActiveTab('basic')
      setProductUploadMode({})
      setShowProductForm(false)
      fetchMyProducts()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la création du produit')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData: any = {}
      
      // Ajouter seulement les champs qui ont été modifiés
      if (formData.name && formData.name.trim()) {
        updateData.name = formData.name.trim()
      }
      
      if (formData.phone !== undefined) {
        updateData.phone = formData.phone.trim() || ''
      }
      
      // Construire l'objet address seulement s'il y a au moins un champ rempli
      const addressFields = {
        street: formData.street?.trim() || '',
        city: formData.city?.trim() || '',
        zipCode: formData.zipCode?.trim() || '',
        country: formData.country?.trim() || '',
      }
      
      // Ajouter l'adresse seulement si au moins un champ est rempli
      if (Object.values(addressFields).some(val => val !== '')) {
        updateData.address = addressFields
      }

      // Utiliser l'ID de l'utilisateur connecté (profile._id contient l'ID MongoDB)
      const userId = profile?._id || authUser?.id || authUser?._id
      if (!userId) {
        showError('Utilisateur non identifié')
        return
      }

      console.log('Mise à jour du profil:', { userId, updateData })
      
      await userService.update(userId, updateData)
      await fetchDashboardData()
      setEditingProfile(false)
      success('Profil mis à jour avec succès !')
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      showError(errorMessage)
    }
  }

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const userId = profile?._id || authUser?.id
      if (!userId || !profile) {
        showError('Utilisateur non identifié')
        return
      }

      // Extraire les IDs des favoris (peuvent être des objets ou des IDs)
      const currentFavorites = profile.favorites || []
      const favoriteIds = currentFavorites.map((fav: any) => {
        if (typeof fav === 'string') return fav
        return fav._id || fav
      })
      
      const updatedFavorites = favoriteIds.filter((favId: string) => favId !== productId)
      
      await userService.update(userId, { favorites: updatedFavorites })
      await fetchDashboardData()
      success('Produit retiré des favoris')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
    }
  }

  const handleRemoveWishlist = async (productId: string) => {
    try {
      const userId = profile?._id || authUser?.id
      if (!userId || !profile) {
        showError('Utilisateur non identifié')
        return
      }

      // Extraire les IDs de la wishlist (peuvent être des objets ou des IDs)
      const currentWishlist = profile.wishlist || []
      const wishlistIds = currentWishlist.map((item: any) => {
        if (typeof item === 'string') return item
        return item._id || item
      })
      
      const updatedWishlist = wishlistIds.filter((itemId: string) => itemId !== productId)
      
      await userService.update(userId, { wishlist: updatedWishlist })
      await fetchDashboardData()
      success('Produit retiré de la wishlist')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
    }
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '#f39c12',
      confirmed: '#3498db',
      processing: '#9b59b6',
      shipped: '#3498db',
      delivered: '#27ae60',
      cancelled: '#e74c3c',
      refunded: '#95a5a6',
    }
    return statusMap[status] || '#95a5a6'
  }


  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    }
    return labels[status] || status
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <Layout>
        <div className="dashboard">
          <div className="dashboard-loading">
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    favoritesCount: profile?.favorites?.length || 0,
    wishlistCount: profile?.wishlist?.length || 0,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Tableau de bord</h1>
            <p className="dashboard-welcome">
              Bienvenue, <strong>{profile?.name || authUser?.name}</strong> ! 👋
            </p>
          </div>
          {authUser?.role === 'admin' && (
            <Link to="/admin">
              <Button variant="outline">
                <span className="icon-settings" />
                Administration
              </Button>
            </Link>
          )}
        </div>

        <div className="dashboard-global-search">
          <div className="global-search-bar">
            <span className="icon-search" />
            <Input
              id="dashboard-search"
              name="dashboard-search"
              placeholder="Rechercher dans le dashboard..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="global-search-input"
            />
            {searchTerm && (
              <button
                className="clear-search-btn icon-close"
                onClick={() => setSearchTerm('')}
                title="Effacer la recherche"
                aria-label="Effacer la recherche"
              />
            )}
          </div>
        </div>

        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <nav className="dashboard-nav">
              <button
                className={`dashboard-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                <span className="icon-star" />
                Vue d'ensemble
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveSection('orders')}
              >
                <span className="icon-package" />
                Mes commandes
                {stats.totalOrders > 0 && <span className="nav-badge">{stats.totalOrders}</span>}
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveSection('favorites')}
              >
                <span className="icon-heart" />
                Favoris
                {stats.favoritesCount > 0 && <span className="nav-badge">{stats.favoritesCount}</span>}
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveSection('wishlist')}
              >
                <span className="icon-star" />
                Wishlist
                {stats.wishlistCount > 0 && <span className="nav-badge">{stats.wishlistCount}</span>}
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'myBlogs' ? 'active' : ''}`}
                onClick={() => setActiveSection('myBlogs')}
              >
                <span className="icon-book" />
                Mes articles
                {myBlogs.length > 0 && <span className="nav-badge">{myBlogs.length}</span>}
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'myProducts' ? 'active' : ''}`}
                onClick={() => setActiveSection('myProducts')}
              >
                <span className="icon-shopping" />
                Mes produits
                {myProducts.length > 0 && <span className="nav-badge">{myProducts.length}</span>}
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <span className="icon-user" />
                Mon profil
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'proverbs' ? 'active' : ''}`}
                onClick={() => setActiveSection('proverbs')}
              >
                <span className="icon-book" />
                Proverbes
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'bookmarks' ? 'active' : ''}`}
                onClick={() => setActiveSection('bookmarks')}
              >
                <span className="icon-heart" />
                Mes Favoris
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveSection('progress')}
              >
                <span className="icon-award" />
                Progression
              </button>
              <button
                className={`dashboard-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveSection('settings')}
              >
                <span className="icon-settings" />
                Paramètres
              </button>
            </nav>
          </aside>

          <main className="dashboard-content">
            {activeSection === 'overview' && (
              <div className="dashboard-overview">
                {searchTerm && (
                  <Card className="search-results-info">
                    <p>
                      Recherche: <strong>"{searchTerm}"</strong> - 
                      {(() => {
                        const matchingOrders = orders.filter(o => 
                          o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length
                        const matchingFavorites = profile?.favorites?.filter((f: any) => 
                          f.name?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length || 0
                        const matchingWishlist = profile?.wishlist?.filter((w: any) => 
                          w.name?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length || 0
                        const total = matchingOrders + matchingFavorites + matchingWishlist
                        return ` ${total} résultat${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`
                      })()}
                    </p>
                  </Card>
                )}
                <div className="stats-grid">
                  <Card className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#3498db20', color: '#3498db' }}>
                      <span className="icon-package" />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalOrders}</h3>
                      <p>Commandes</p>
                    </div>
                  </Card>
                  <Card className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#27ae6020', color: '#27ae60' }}>
                      <span className="icon-star" />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalSpent.toFixed(2)} €</h3>
                      <p>Total dépensé</p>
                    </div>
                  </Card>
                  <Card className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e74c3c20', color: '#e74c3c' }}>
                      <span className="icon-heart" />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.favoritesCount}</h3>
                      <p>Favoris</p>
                    </div>
                  </Card>
                  <Card className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f39c1220', color: '#f39c12' }}>
                      <span className="icon-star" />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.wishlistCount}</h3>
                      <p>Wishlist</p>
                    </div>
                  </Card>
                </div>

                {orders.length > 0 && (
                  <Card className="recent-orders-card">
                    <h2>Commandes récentes</h2>
                    <div className="recent-orders-list">
                      {orders
                        .filter(order => {
                          if (!searchTerm) return true
                          return order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
                        })
                        .slice(0, 3)
                        .map((order) => (
                        <Link
                          key={order._id}
                          to={`/orders/${order._id}`}
                          className="recent-order-item"
                        >
                          <div className="order-info">
                            <span className="order-number">{order.orderNumber}</span>
                            <span className="order-date">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="order-meta">
                            <span className="order-total">{order.total.toFixed(2)} €</span>
                            <span
                              className="order-status"
                              style={{ color: getStatusColor(order.status) }}
                            >
                              <span className={getStatusIconClass(order.status)} />
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {orders.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveSection('orders')}
                        className="view-all-btn"
                      >
                        Voir toutes les commandes
                      </Button>
                    )}
                  </Card>
                )}

                {orders.length > 0 && (
                  <Card className="stats-chart-card">
                    <h2>Statistiques mensuelles</h2>
                    <div className="chart-container">
                      {(() => {
                        // Grouper les commandes par mois
                        const monthlyData = orders.reduce((acc: any, order) => {
                          const month = new Date(order.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                          if (!acc[month]) {
                            acc[month] = { count: 0, total: 0 }
                          }
                          acc[month].count++
                          acc[month].total += order.total
                          return acc
                        }, {})

                        const months = Object.keys(monthlyData).slice(-6) // 6 derniers mois
                        const maxCount = Math.max(...months.map(m => monthlyData[m].count), 1)

                        if (months.length === 0) {
                          return (
                            <div className="chart-empty">
                              <p>Aucune donnée disponible</p>
                            </div>
                          )
                        }

                        return (
                          <div className="chart-bars">
                            {months.map((month, idx) => (
                              <div key={idx} className="chart-bar-group">
                                <div className="chart-bar-wrapper">
                                  <div
                                    className="chart-bar"
                                    style={{
                                      height: `${(monthlyData[month].count / maxCount) * 100}%`,
                                      backgroundColor: '#d4af37',
                                    }}
                                    title={`${monthlyData[month].count} commande(s) - ${monthlyData[month].total.toFixed(2)} €`}
                                  />
                                </div>
                                <div className="chart-label">
                                  <span className="chart-month">{month}</span>
                                  <span className="chart-value">{monthlyData[month].count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="dashboard-orders">
                <div className="orders-header">
                  <h2>Mes commandes</h2>
                  {orders.length > 0 && (
                    <div className="orders-controls">
                      <div className="orders-search">
                        <span className="icon-search" />
                        <Input
                          id="order-search"
                          name="order-search"
                          placeholder="Rechercher une commande..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>
                      <div className="orders-filters">
                        <span className="icon-filter" />
                        <label htmlFor="order-filter" className="sr-only">Filtrer par statut</label>
                        <select
                          id="order-filter"
                          name="orderFilter"
                          value={orderFilter}
                          onChange={(e) => setOrderFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="processing">En traitement</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                        <label htmlFor="order-sort" className="sr-only">Trier les commandes</label>
                        <select
                          id="order-sort"
                          name="orderSort"
                          value={orderSort}
                          onChange={(e) => setOrderSort(e.target.value)}
                          className="sort-select"
                        >
                          <option value="newest">Plus récentes</option>
                          <option value="oldest">Plus anciennes</option>
                          <option value="amount-high">Montant décroissant</option>
                          <option value="amount-low">Montant croissant</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                {orders.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-package" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Aucune commande pour le moment</p>
                    <Link to="/shop">
                      <Button>Découvrir la boutique</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="orders-list">
                    {(() => {
                      // Filtrer les commandes
                      let filteredOrders = orders.filter(order => {
                        // Filtre par statut
                        if (orderFilter !== 'all' && order.status !== orderFilter) {
                          return false
                        }
                        // Recherche par numéro de commande
                        if (searchTerm && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
                          return false
                        }
                        return true
                      })

                      // Trier les commandes
                      filteredOrders.sort((a, b) => {
                        switch (orderSort) {
                          case 'newest':
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          case 'oldest':
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                          case 'amount-high':
                            return b.total - a.total
                          case 'amount-low':
                            return a.total - b.total
                          default:
                            return 0
                        }
                      })

                      return filteredOrders.map((order) => (
                      <Card key={order._id} className="order-card">
                        <div className="order-header">
                          <div>
                            <Link to={`/orders/${order._id}`} className="order-link">
                              <h3>Commande {order.orderNumber}</h3>
                            </Link>
                            <p className="order-date">
                              <span className="icon-calendar" />
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="order-status-badge" style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                            <span className={getStatusIconClass(order.status)} />
                            {getStatusLabel(order.status)}
                          </div>
                        </div>
                        <div className="order-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item">
                              <div className="order-item-info">
                                <span className="order-item-name">{item.name}</span>
                                <span className="order-item-quantity">x{item.quantity}</span>
                              </div>
                              <span className="order-item-price">{item.subtotal.toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-footer">
                          <div className="order-total-section">
                            <span>Total: <strong>{order.total.toFixed(2)} €</strong></span>
                            {order.trackingNumber && (
                              <span className="tracking-number">
                                <span className="icon-arrow icon-arrow-right" />
                                Suivi: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                      ))
                    })()}
                    {(() => {
                      const filtered = orders.filter(order => {
                        if (orderFilter !== 'all' && order.status !== orderFilter) return false
                        if (searchTerm && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false
                        return true
                      })
                      return filtered.length === 0 && orders.length > 0 ? (
                        <Card className="empty-state">
                          <span className="icon-package" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                          <p>Aucune commande ne correspond à vos critères</p>
                        </Card>
                      ) : null
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'favorites' && (
              <div className="dashboard-favorites">
                <h2>Mes favoris</h2>
                {!profile?.favorites || profile.favorites.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-heart" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Aucun produit favori pour le moment</p>
                    <Link to="/shop">
                      <Button>Découvrir la boutique</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="favorites-grid">
                    {profile.favorites
                      .filter((product: any) => {
                        if (!searchTerm) return true
                        return product.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      })
                      .map((product: any) => (
                      <Card key={product._id} className="favorite-card">
                        {product.images && product.images.length > 0 && (
                          <div className="favorite-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        )}
                        <div className="favorite-content">
                          <h3>{product.name}</h3>
                          <p className="favorite-price">{product.price?.toFixed(2)} €</p>
                          <div className="favorite-actions">
                            <Link to={`/shop?product=${product._id}`}>
                              <Button size="small">Voir</Button>
                            </Link>
                            <Button
                              size="small"
                              variant="outline"
                              onClick={() => handleRemoveFavorite(product._id)}
                            >
                              <span className="icon-close" />
                              Retirer
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'wishlist' && (
              <div className="dashboard-wishlist">
                <h2>Ma wishlist</h2>
                {!profile?.wishlist || profile.wishlist.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-star" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Aucun produit dans votre wishlist</p>
                    <Link to="/shop">
                      <Button>Découvrir la boutique</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="wishlist-grid">
                    {profile.wishlist
                      .filter((product: any) => {
                        if (!searchTerm) return true
                        return product.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      })
                      .map((product: any) => (
                      <Card key={product._id} className="wishlist-card">
                        {product.images && product.images.length > 0 && (
                          <div className="wishlist-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        )}
                        <div className="wishlist-content">
                          <h3>{product.name}</h3>
                          <p className="wishlist-price">{product.price?.toFixed(2)} €</p>
                          <div className="wishlist-actions">
                            <Link to={`/shop?product=${product._id}`}>
                              <Button size="small">Voir</Button>
                            </Link>
                            <Button
                              size="small"
                              variant="outline"
                              onClick={() => handleRemoveWishlist(product._id)}
                            >
                              <span className="icon-close" />
                              Retirer
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'myBlogs' && (
              <div className="dashboard-my-blogs">
                <div className="section-header">
                  <h2>Mes articles</h2>
                  <Button onClick={() => setShowBlogForm(!showBlogForm)}>
                    <span className="icon-plus" />
                    {showBlogForm ? 'Annuler' : 'Nouvel article'}
                  </Button>
                </div>

                {showBlogForm && (
                  <Card className="blog-form-card">
                    <h3>Créer un nouvel article</h3>
                    
                    {/* Onglets */}
                    <div className="form-tabs">
                      <button
                        type="button"
                        className={`form-tab ${blogActiveTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setBlogActiveTab('basic')}
                      >
                        Informations
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${blogActiveTab === 'images' ? 'active' : ''}`}
                        onClick={() => setBlogActiveTab('images')}
                      >
                        Images ({blogImages.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${blogActiveTab === 'pdfs' ? 'active' : ''}`}
                        onClick={() => setBlogActiveTab('pdfs')}
                      >
                        PDFs ({blogPdfs.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${blogActiveTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setBlogActiveTab('videos')}
                      >
                        Vidéos ({blogVideos.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${blogActiveTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setBlogActiveTab('documents')}
                      >
                        Documents ({blogDocuments.length})
                      </button>
                    </div>

                    <form onSubmit={handleCreateBlog} className="blog-form">
                      {blogActiveTab === 'basic' && (
                        <>
                          <Input
                            label="Titre"
                            value={blogFormData.title}
                            onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                            required
                            placeholder="Titre de l'article"
                          />
                          <div className="form-group">
                            <label htmlFor="blog-content" className="input-label">Contenu</label>
                            <textarea
                              id="blog-content"
                              name="content"
                              className="form-textarea"
                              value={blogFormData.content}
                              onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
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
                              value={blogFormData.excerpt}
                              onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                              placeholder="Court résumé de l'article..."
                              rows={3}
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="blog-category" className="input-label">Catégorie</label>
                              <select
                                id="blog-category"
                                name="category"
                                className="form-select"
                                value={blogFormData.category}
                                onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                              >
                                <option value="Histoire">Histoire</option>
                                <option value="Culture">Culture</option>
                                <option value="Géographie">Géographie</option>
                                <option value="Économie">Économie</option>
                                <option value="Politique">Politique</option>
                                <option value="Autre">Autre</option>
                              </select>
                            </div>
                            <Input
                              label="Image principale (URL)"
                              type="url"
                              value={blogFormData.image}
                              onChange={(e) => setBlogFormData({ ...blogFormData, image: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <Input
                            label="Tags (séparés par des virgules)"
                            value={blogFormData.tags}
                            onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                            placeholder="Afrique, Histoire, Culture"
                          />
                        </>
                      )}

                      {blogActiveTab === 'images' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Images additionnelles</h4>
                            <Button type="button" onClick={addBlogImage} size="small">
                              <span className="icon-plus" />
                              Ajouter une image
                            </Button>
                          </div>
                          {blogImages.map((img, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Image {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeBlogImage(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`image-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`image-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-image" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`image-${idx}`] === 'url' || !blogUploadMode[`image-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`image-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {blogUploadMode[`image-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="image"
                                  onUploadSuccess={(url) => updateBlogImage(idx, 'url', url)}
                                  label="Uploader une image"
                                />
                              ) : (
                                <Input
                                  label="URL de l'image"
                                  type="url"
                                  value={img.url}
                                  onChange={(e) => updateBlogImage(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                />
                              )}
                              <Input
                                label="Légende (optionnel)"
                                value={img.caption}
                                onChange={(e) => updateBlogImage(idx, 'caption', e.target.value)}
                                placeholder="Description de l'image"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {blogActiveTab === 'pdfs' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Documents PDF</h4>
                            <Button type="button" onClick={addBlogPDF} size="small">
                              <span className="icon-plus" />
                              Ajouter un PDF
                            </Button>
                          </div>
                          {blogPdfs.map((pdf, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">PDF {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeBlogPDF(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`pdf-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`pdf-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-file" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`pdf-${idx}`] === 'url' || !blogUploadMode[`pdf-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`pdf-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {blogUploadMode[`pdf-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="pdf"
                                  onUploadSuccess={(url) => updateBlogPDF(idx, 'url', url)}
                                  label="Uploader un PDF"
                                />
                              ) : (
                                <Input
                                  label="URL du PDF"
                                  type="url"
                                  value={pdf.url}
                                  onChange={(e) => updateBlogPDF(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/document.pdf"
                                />
                              )}
                              <Input
                                label="Titre du PDF"
                                value={pdf.title}
                                onChange={(e) => updateBlogPDF(idx, 'title', e.target.value)}
                                placeholder="Titre du document"
                                required
                              />
                              <div className="form-group">
                                <label htmlFor={`blog-pdf-description-${idx}`} className="input-label">Description (optionnel)</label>
                                <textarea
                                  id={`blog-pdf-description-${idx}`}
                                  name={`blog-pdf-description-${idx}`}
                                  className="form-textarea"
                                  value={pdf.description}
                                  onChange={(e) => updateBlogPDF(idx, 'description', e.target.value)}
                                  rows={2}
                                  placeholder="Description du document"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {blogActiveTab === 'videos' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Vidéos</h4>
                            <Button type="button" onClick={addBlogVideo} size="small">
                              <span className="icon-plus" />
                              Ajouter une vidéo
                            </Button>
                          </div>
                          {blogVideos.map((video, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Vidéo {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeBlogVideo(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`video-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`video-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-video" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`video-${idx}`] === 'url' || !blogUploadMode[`video-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`video-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {blogUploadMode[`video-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="video"
                                  onUploadSuccess={(url) => updateBlogVideo(idx, 'url', url)}
                                  label="Uploader une vidéo"
                                />
                              ) : (
                                <Input
                                  label="URL de la vidéo"
                                  type="url"
                                  value={video.url}
                                  onChange={(e) => updateBlogVideo(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/video.mp4 ou lien YouTube/Vimeo"
                                />
                              )}
                              <Input
                                label="Titre de la vidéo"
                                value={video.title}
                                onChange={(e) => updateBlogVideo(idx, 'title', e.target.value)}
                                placeholder="Titre de la vidéo"
                                required
                              />
                              <div className="form-group">
                                <label htmlFor={`blog-video-description-${idx}`} className="input-label">Description (optionnel)</label>
                                <textarea
                                  id={`blog-video-description-${idx}`}
                                  name={`blog-video-description-${idx}`}
                                  className="form-textarea"
                                  value={video.description}
                                  onChange={(e) => updateBlogVideo(idx, 'description', e.target.value)}
                                  rows={2}
                                  placeholder="Description de la vidéo"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor={`blog-video-type-${idx}`} className="input-label">Type de vidéo</label>
                                <select
                                  id={`blog-video-type-${idx}`}
                                  name={`blog-video-type-${idx}`}
                                  className="form-select"
                                  value={video.type}
                                  onChange={(e) => updateBlogVideo(idx, 'type', e.target.value as 'youtube' | 'vimeo' | 'direct')}
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
                                onChange={(e) => updateBlogVideo(idx, 'thumbnail', e.target.value)}
                                placeholder="https://example.com/thumbnail.jpg"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {blogActiveTab === 'documents' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Autres documents</h4>
                            <Button type="button" onClick={addBlogDocument} size="small">
                              <span className="icon-plus" />
                              Ajouter un document
                            </Button>
                          </div>
                          {blogDocuments.map((doc, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Document {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeBlogDocument(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`document-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`document-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-file" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={blogUploadMode[`document-${idx}`] === 'url' || !blogUploadMode[`document-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setBlogUploadMode({ ...blogUploadMode, [`document-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {blogUploadMode[`document-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="document"
                                  onUploadSuccess={(url) => updateBlogDocument(idx, 'url', url)}
                                  label="Uploader un document"
                                />
                              ) : (
                                <Input
                                  label="URL du document"
                                  type="url"
                                  value={doc.url}
                                  onChange={(e) => updateBlogDocument(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/document.docx"
                                />
                              )}
                              <Input
                                label="Titre du document"
                                value={doc.title}
                                onChange={(e) => updateBlogDocument(idx, 'title', e.target.value)}
                                placeholder="Titre du document"
                                required
                              />
                              <div className="form-group">
                                <label htmlFor={`blog-document-description-${idx}`} className="input-label">Description (optionnel)</label>
                                <textarea
                                  id={`blog-document-description-${idx}`}
                                  name={`blog-document-description-${idx}`}
                                  className="form-textarea"
                                  value={doc.description}
                                  onChange={(e) => updateBlogDocument(idx, 'description', e.target.value)}
                                  rows={2}
                                  placeholder="Description du document"
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor={`blog-document-type-${idx}`} className="input-label">Type de document</label>
                                <select
                                  id={`blog-document-type-${idx}`}
                                  name={`blog-document-type-${idx}`}
                                  className="form-select"
                                  value={doc.type}
                                  onChange={(e) => updateBlogDocument(idx, 'type', e.target.value)}
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
                        <Button type="submit">Créer l'article</Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowBlogForm(false)
                          setBlogActiveTab('basic')
                          setBlogImages([])
                          setBlogPdfs([])
                          setBlogVideos([])
                          setBlogDocuments([])
                          setBlogUploadMode({})
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {myBlogs.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-book" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Vous n'avez pas encore créé d'articles</p>
                    <p className="empty-state-hint">Vos articles seront publiés après validation par un administrateur</p>
                  </Card>
                ) : (
                  <div className="my-blogs-grid">
                    {myBlogs.map((blog: any) => (
                      <Card key={blog._id} className="my-blog-card">
                        {blog.image && (
                          <div className="my-blog-image">
                            <img src={blog.image} alt={blog.title} />
                          </div>
                        )}
                        <div className="my-blog-content">
                          <div className="my-blog-header">
                            <span className={`status-badge ${blog.published ? 'published' : 'pending'}`}>
                              {blog.published ? 'Publié' : 'En attente'}
                            </span>
                            <span className="blog-views">{blog.views || 0} vues</span>
                          </div>
                          <h3>{blog.title}</h3>
                          <p className="my-blog-excerpt">{blog.excerpt || blog.content.substring(0, 150)}...</p>
                          <div className="my-blog-meta">
                            <span className="blog-category">{blog.category}</span>
                            <span className="blog-date">
                              {new Date(blog.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <Link to={`/blog/${blog._id}`}>
                            <Button size="small" variant="outline">Voir l'article</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'myProducts' && (
              <div className="dashboard-my-products">
                <div className="section-header">
                  <h2>Mes produits</h2>
                  <Button onClick={() => setShowProductForm(!showProductForm)}>
                    <span className="icon-plus" />
                    {showProductForm ? 'Annuler' : 'Nouveau produit'}
                  </Button>
                </div>

                {showProductForm && (
                  <Card className="product-form-card">
                    <h3>Créer un nouveau produit</h3>
                    
                    {/* Onglets */}
                    <div className="form-tabs">
                      <button
                        type="button"
                        className={`form-tab ${productActiveTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setProductActiveTab('basic')}
                      >
                        Informations
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${productActiveTab === 'images' ? 'active' : ''}`}
                        onClick={() => setProductActiveTab('images')}
                      >
                        Images ({productAdditionalImages.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${productActiveTab === 'pdfs' ? 'active' : ''}`}
                        onClick={() => setProductActiveTab('pdfs')}
                      >
                        PDFs ({productPdfs.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${productActiveTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setProductActiveTab('videos')}
                      >
                        Vidéos ({productVideos.length})
                      </button>
                      <button
                        type="button"
                        className={`form-tab ${productActiveTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setProductActiveTab('documents')}
                      >
                        Documents ({productDocuments.length})
                      </button>
                    </div>

                    <form onSubmit={handleCreateProduct} className="product-form">
                      {productActiveTab === 'basic' && (
                        <>
                          <Input
                            label="Nom du produit"
                            value={productFormData.name}
                            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                            required
                          />
                          <div className="form-group">
                            <label htmlFor="product-description" className="input-label">Description complète</label>
                            <textarea
                              id="product-description"
                              name="description"
                              className="form-textarea"
                              value={productFormData.description}
                              onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
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
                              value={productFormData.shortDescription}
                              onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })}
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
                                  value={productFormData.price}
                                  onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                                  required
                                  style={{ flex: 1 }}
                                />
                                <select
                                  id="product-currency"
                                  name="product-currency"
                                  className="form-select"
                                  value={productFormData.currency}
                                  onChange={(e) => setProductFormData({ ...productFormData, currency: e.target.value as 'FCFA' | 'EUR' | 'USD' })}
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
                              value={productFormData.stock}
                              onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="product-category" className="input-label">Catégorie</label>
                            <select
                              id="product-category"
                              name="category"
                              className="form-select"
                              value={productFormData.category}
                              onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
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
                            <label htmlFor="product-images" className="input-label">Images principales (URLs séparées par des virgules)</label>
                            <textarea
                              id="product-images"
                              name="images"
                              className="form-textarea"
                              value={productFormData.images}
                              onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                              rows={2}
                              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            />
                          </div>
                        </>
                      )}

                      {productActiveTab === 'images' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Images additionnelles</h4>
                            <Button type="button" onClick={addProductImage} size="small">
                              <span className="icon-plus" />
                              Ajouter une image
                            </Button>
                          </div>
                          {productAdditionalImages.map((img, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Image {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeProductImage(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`image-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`image-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-image" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`image-${idx}`] === 'url' || !productUploadMode[`image-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`image-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {productUploadMode[`image-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="image"
                                  onUploadSuccess={(url) => updateProductImage(idx, 'url', url)}
                                  label="Uploader une image"
                                />
                              ) : (
                                <Input
                                  label="URL de l'image"
                                  type="url"
                                  value={img.url}
                                  onChange={(e) => updateProductImage(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                />
                              )}
                              <Input
                                label="Légende (optionnel)"
                                value={img.caption}
                                onChange={(e) => updateProductImage(idx, 'caption', e.target.value)}
                                placeholder="Description de l'image"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {productActiveTab === 'pdfs' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Documents PDF</h4>
                            <Button type="button" onClick={addProductPDF} size="small">
                              <span className="icon-plus" />
                              Ajouter un PDF
                            </Button>
                          </div>
                          {productPdfs.map((pdf, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">PDF {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeProductPDF(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`pdf-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`pdf-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-file" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`pdf-${idx}`] === 'url' || !productUploadMode[`pdf-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`pdf-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {productUploadMode[`pdf-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="pdf"
                                  onUploadSuccess={(url) => updateProductPDF(idx, 'url', url)}
                                  label="Uploader un PDF"
                                />
                              ) : (
                                <Input
                                  label="URL du PDF"
                                  type="url"
                                  value={pdf.url}
                                  onChange={(e) => updateProductPDF(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/document.pdf"
                                />
                              )}
                              <Input
                                label="Titre du PDF"
                                value={pdf.title}
                                onChange={(e) => updateProductPDF(idx, 'title', e.target.value)}
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
                                  onChange={(e) => updateProductPDF(idx, 'description', e.target.value)}
                                  rows={2}
                                  placeholder="Description du document"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {productActiveTab === 'videos' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Vidéos</h4>
                            <Button type="button" onClick={addProductVideo} size="small">
                              <span className="icon-plus" />
                              Ajouter une vidéo
                            </Button>
                          </div>
                          {productVideos.map((video, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Vidéo {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeProductVideo(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`video-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`video-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-video" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`video-${idx}`] === 'url' || !productUploadMode[`video-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`video-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {productUploadMode[`video-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="video"
                                  onUploadSuccess={(url) => updateProductVideo(idx, 'url', url)}
                                  label="Uploader une vidéo"
                                />
                              ) : (
                                <Input
                                  label="URL de la vidéo"
                                  type="url"
                                  value={video.url}
                                  onChange={(e) => updateProductVideo(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/video.mp4 ou lien YouTube/Vimeo"
                                />
                              )}
                              <Input
                                label="Titre de la vidéo"
                                value={video.title}
                                onChange={(e) => updateProductVideo(idx, 'title', e.target.value)}
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
                                  onChange={(e) => updateProductVideo(idx, 'description', e.target.value)}
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
                                  onChange={(e) => updateProductVideo(idx, 'type', e.target.value as 'youtube' | 'vimeo' | 'direct')}
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
                                onChange={(e) => updateProductVideo(idx, 'thumbnail', e.target.value)}
                                placeholder="https://example.com/thumbnail.jpg"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {productActiveTab === 'documents' && (
                        <div className="media-section">
                          <div className="media-section-header">
                            <h4>Autres documents</h4>
                            <Button type="button" onClick={addProductDocument} size="small">
                              <span className="icon-plus" />
                              Ajouter un document
                            </Button>
                          </div>
                          {productDocuments.map((doc, idx) => (
                            <div key={idx} className="media-item">
                              <div className="media-item-header">
                                <span className="media-item-number">Document {idx + 1}</span>
                                <Button type="button" size="small" variant="outline" onClick={() => removeProductDocument(idx)}>
                                  <span className="icon-close" />
                                </Button>
                              </div>
                              <div className="media-upload-mode">
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`document-${idx}`] === 'upload' ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`document-${idx}`]: 'upload' })}
                                >
                                  <span className="icon-file" />
                                  Upload depuis PC
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  variant={productUploadMode[`document-${idx}`] === 'url' || !productUploadMode[`document-${idx}`] ? 'primary' : 'outline'}
                                  onClick={() => setProductUploadMode({ ...productUploadMode, [`document-${idx}`]: 'url' })}
                                >
                                  <span className="icon-link" />
                                  Lien URL
                                </Button>
                              </div>
                              {productUploadMode[`document-${idx}`] === 'upload' ? (
                                <FileUpload
                                  type="document"
                                  onUploadSuccess={(url) => updateProductDocument(idx, 'url', url)}
                                  label="Uploader un document"
                                />
                              ) : (
                                <Input
                                  label="URL du document"
                                  type="url"
                                  value={doc.url}
                                  onChange={(e) => updateProductDocument(idx, 'url', e.target.value)}
                                  placeholder="https://example.com/document.docx"
                                />
                              )}
                              <Input
                                label="Titre du document"
                                value={doc.title}
                                onChange={(e) => updateProductDocument(idx, 'title', e.target.value)}
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
                                  onChange={(e) => updateProductDocument(idx, 'description', e.target.value)}
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
                                  onChange={(e) => updateProductDocument(idx, 'type', e.target.value)}
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
                        <Button type="submit">Créer le produit</Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowProductForm(false)
                          setProductActiveTab('basic')
                          setProductAdditionalImages([])
                          setProductPdfs([])
                          setProductVideos([])
                          setProductDocuments([])
                          setProductUploadMode({})
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {myProducts.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-shopping" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Vous n'avez pas encore créé de produits</p>
                    <p className="empty-state-hint">Vos produits seront activés après validation par un administrateur</p>
                  </Card>
                ) : (
                  <div className="my-products-grid">
                    {myProducts.map((product: any) => (
                      <Card key={product._id} className="my-product-card">
                        {product.images && product.images.length > 0 && (
                          <div className="my-product-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        )}
                        <div className="my-product-content">
                          <div className="my-product-header">
                            <span className={`status-badge ${product.isActive ? 'published' : 'pending'}`}>
                              {product.isActive ? 'Actif' : 'En attente'}
                            </span>
                            {product.views && <span className="product-views">{product.views} vues</span>}
                          </div>
                          <h3>{product.name}</h3>
                          <p className="my-product-category">{product.category}</p>
                          <p className="my-product-price">{product.price?.toFixed(2)} €</p>
                          <p className="my-product-stock">Stock: {product.stock}</p>
                          <Link to={`/shop?product=${product._id}`}>
                            <Button size="small" variant="outline">Voir le produit</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="dashboard-profile">
                <div className="profile-header">
                  <h2>Mon profil</h2>
                  {!editingProfile && (
                    <Button onClick={() => setEditingProfile(true)}>
                      <span className="icon-edit" />
                      Modifier
                    </Button>
                  )}
                </div>
                {editingProfile ? (
                  <Card className="profile-form-card">
                    <form onSubmit={handleUpdateProfile} className="profile-form">
                      <div className="form-row">
                        <Input
                          label="Nom complet"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          autoComplete="name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={formData.email}
                          disabled
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          autoComplete="email"
                        />
                      </div>
                      <Input
                        label="Téléphone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoComplete="tel"
                      />
                      <h3 className="form-section-title">Adresse</h3>
                      <Input
                        label="Rue"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        autoComplete="street-address"
                      />
                      <div className="form-row">
                        <Input
                          label="Ville"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          autoComplete="address-level2"
                        />
                        <Input
                          label="Code postal"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          autoComplete="postal-code"
                        />
                      </div>
                      <Input
                        label="Pays"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        autoComplete="country-name"
                      />
                      <div className="form-actions">
                        <Button type="submit">Enregistrer</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProfile(false)
                            fetchDashboardData()
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Card className="profile-card">
                    <div className="profile-avatar">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt={profile.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="profile-info">
                      <div className="profile-info-item">
                        <span className="icon-user" />
                        <div>
                          <span className="info-label">Nom</span>
                          <span className="info-value">{profile?.name}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <span className="icon-mail" />
                        <div>
                          <span className="info-label">Email</span>
                          <span className="info-value">{profile?.email}</span>
                        </div>
                      </div>
                      {profile?.phone && (
                        <div className="profile-info-item">
                          <span className="icon-phone" />
                          <div>
                            <span className="info-label">Téléphone</span>
                            <span className="info-value">{profile.phone}</span>
                          </div>
                        </div>
                      )}
                      {profile?.address && (
                        <div className="profile-info-item">
                          <span className="icon-location" />
                          <div>
                            <span className="info-label">Adresse</span>
                            <span className="info-value">
                              {[
                                profile.address.street,
                                profile.address.city,
                                profile.address.zipCode,
                                profile.address.country,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="profile-info-item">
                        <span className="icon-calendar" />
                        <div>
                          <span className="info-label">Membre depuis</span>
                          <span className="info-value">
                            {new Date(profile?.createdAt || '').toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'proverbs' && (
              <div className="dashboard-proverbs">
                <div className="section-header">
                  <h2>Proverbes Africains</h2>
                  <p>Partagez votre sagesse et éclairez la communauté avec des proverbes authentiques</p>
                </div>

                <Card className="proverb-form-card">
                  <div className="form-section-title">
                    <span className="icon-plus" />
                    <h3>Ajouter un proverbe</h3>
                  </div>
                  <form
                    className="proverb-form"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!proverbFormData.text || !proverbFormData.explanation || !proverbFormData.country) {
                        showError('Le texte, l\'explication et le pays sont requis')
                        return
                      }

                      try {
                        setSubmittingProverb(true)
                        const tagsArray = proverbFormData.tags
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0)

                        await proverbService.create({
                          text: proverbFormData.text,
                          translation: proverbFormData.translation || '',
                          explanation: proverbFormData.explanation,
                          country: proverbFormData.country,
                          language: proverbFormData.language || '',
                          category: proverbFormData.category,
                          tags: tagsArray,
                          source: proverbFormData.source || '',
                          author: proverbFormData.author || '',
                          isVerified: false, // Les proverbes utilisateurs ne sont pas vérifiés par défaut
                        })

                        success('Proverbe ajouté avec succès ! Il sera vérifié par un administrateur.')
                        setProverbFormData({
                          text: '',
                          translation: '',
                          explanation: '',
                          country: '',
                          language: '',
                          category: 'Sagesse',
                          tags: '',
                          source: '',
                          author: '',
                        })
                        fetchMyProverbs()
                      } catch (err: any) {
                        showError(err.response?.data?.error || 'Erreur lors de l\'ajout du proverbe')
                      } finally {
                        setSubmittingProverb(false)
                      }
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="proverb-text" className="input-label">
                        Proverbe <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        id="proverb-text"
                        className="form-textarea"
                        value={proverbFormData.text}
                        onChange={(e) => setProverbFormData({ ...proverbFormData, text: e.target.value })}
                        placeholder="Entrez le proverbe..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="proverb-translation" className="input-label">Traduction (optionnel)</label>
                      <Input
                        id="proverb-translation"
                        value={proverbFormData.translation}
                        onChange={(e) => setProverbFormData({ ...proverbFormData, translation: e.target.value })}
                        placeholder="Traduction en français..."
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="proverb-explanation" className="input-label">
                        Explication <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        id="proverb-explanation"
                        className="form-textarea"
                        value={proverbFormData.explanation}
                        onChange={(e) => setProverbFormData({ ...proverbFormData, explanation: e.target.value })}
                        placeholder="Expliquez la signification et le contexte du proverbe..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="proverb-country" className="input-label">
                          Pays d'origine <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          id="proverb-country"
                          className="form-select"
                          value={proverbFormData.country}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, country: e.target.value })}
                          required
                        >
                          <option value="">Sélectionner un pays</option>
                          {countries.map((country) => (
                            <option key={country._id || country.id} value={country._id}>
                              {country.nameFr || country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="proverb-language" className="input-label">Langue</label>
                        <Input
                          id="proverb-language"
                          value={proverbFormData.language}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, language: e.target.value })}
                          placeholder="Ex: Wolof, Bambara..."
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="proverb-category" className="input-label">Catégorie</label>
                        <select
                          id="proverb-category"
                          className="form-select"
                          value={proverbFormData.category}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, category: e.target.value })}
                        >
                          <option value="Sagesse">Sagesse</option>
                          <option value="Famille">Famille</option>
                          <option value="Travail">Travail</option>
                          <option value="Nature">Nature</option>
                          <option value="Relations">Relations</option>
                          <option value="Spiritualité">Spiritualité</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="proverb-tags" className="input-label">Tags (séparés par des virgules)</label>
                        <Input
                          id="proverb-tags"
                          value={proverbFormData.tags}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, tags: e.target.value })}
                          placeholder="Ex: sagesse, communauté, unité"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="proverb-source" className="input-label">Source</label>
                        <Input
                          id="proverb-source"
                          value={proverbFormData.source}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, source: e.target.value })}
                          placeholder="Ex: Tradition orale, Livre..."
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="proverb-author" className="input-label">Auteur (si connu)</label>
                        <Input
                          id="proverb-author"
                          value={proverbFormData.author}
                          onChange={(e) => setProverbFormData({ ...proverbFormData, author: e.target.value })}
                          placeholder="Nom de l'auteur..."
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={submittingProverb}>
                      <span className="icon-save" />
                      {submittingProverb ? 'Envoi en cours...' : 'Partager le proverbe'}
                    </Button>
                  </form>
                </Card>

                {myProverbs.length > 0 && (
                  <Card className="my-proverbs-card">
                    <div className="section-header">
                      <h3>Mes proverbes ({myProverbs.length})</h3>
                    </div>
                    <div className="proverbs-list">
                      {myProverbs.map((proverb) => (
                        <div key={proverb._id} className="proverb-item">
                          <div className="proverb-item-header">
                            <blockquote className="proverb-item-text">"{proverb.text}"</blockquote>
                            {proverb.isVerified && (
                              <span className="badge verified-badge">
                                <span className="icon-check" />
                                Vérifié
                              </span>
                            )}
                          </div>
                          {proverb.translation && (
                            <p className="proverb-item-translation">"{proverb.translation}"</p>
                          )}
                          <p className="proverb-item-explanation">{proverb.explanation}</p>
                          <div className="proverb-item-meta">
                            <span>
                              <span className="icon-map-pin" />
                              {proverb.country?.nameFr || proverb.countryName}
                            </span>
                            <span>
                              <span className="icon-folder-open" />
                              {proverb.category}
                            </span>
                            {proverb.views > 0 && (
                              <span>
                                <span className="icon-eye" />
                                {proverb.views} vues
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'bookmarks' && (
              <div className="dashboard-bookmarks">
                <h2>Mes Favoris</h2>
                <div className="bookmarks-filters">
                  <select
                    value={bookmarkFilter}
                    onChange={(e) => setBookmarkFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les types</option>
                    <option value="event">Événements</option>
                    <option value="figure">Personnages</option>
                    <option value="collection">Collections</option>
                    <option value="story">Récits</option>
                    <option value="quiz">Quiz</option>
                    <option value="proverb">Proverbes</option>
                    <option value="blog">Articles</option>
                    <option value="country">Pays</option>
                  </select>
                </div>
                {bookmarksLoading ? (
                  <Card>
                    <p>Chargement des favoris...</p>
                  </Card>
                ) : bookmarks.length === 0 ? (
                  <Card className="empty-state">
                    <span className="icon-heart" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Aucun favori pour le moment</p>
                    <p className="empty-state-subtitle">Explorez le contenu et ajoutez vos favoris pour les retrouver facilement</p>
                  </Card>
                ) : (
                  <div className="bookmarks-grid">
                    {bookmarks
                      .filter(b => bookmarkFilter === 'all' || b.itemType === bookmarkFilter)
                      .map((bookmark) => (
                        <Card key={bookmark._id} className="bookmark-card">
                          <div className="bookmark-header">
                            <span className="bookmark-type-badge">{bookmark.itemType}</span>
                            <button
                              className="bookmark-remove-btn"
                              onClick={async () => {
                                try {
                                  await bookmarkService.delete(bookmark._id)
                                  setBookmarks(bookmarks.filter(b => b._id !== bookmark._id))
                                  success('Favori retiré')
                                } catch (error) {
                                  showError('Erreur lors de la suppression')
                                }
                              }}
                            >
                              <span className="icon-close" />
                            </button>
                          </div>
                          <div className="bookmark-content">
                            <p className="bookmark-item-id">{bookmark.itemId}</p>
                            {bookmark.notes && (
                              <p className="bookmark-notes">{bookmark.notes}</p>
                            )}
                            {bookmark.tags && bookmark.tags.length > 0 && (
                              <div className="bookmark-tags">
                                {bookmark.tags.map((tag: string, index: number) => (
                                  <span key={index} className="tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="bookmark-footer">
                            <span className="bookmark-date">
                              Ajouté le {new Date(bookmark.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'progress' && (
              <div className="dashboard-progress">
                <h2>Ma Progression</h2>
                {progressLoading ? (
                  <Card>
                    <p>Chargement de la progression...</p>
                  </Card>
                ) : userProgress ? (
                  <>
                    <div className="progress-stats-grid">
                      <Card className="progress-stat-card">
                        <div className="progress-stat-icon" style={{ backgroundColor: '#3498db20', color: '#3498db' }}>
                          <span className="icon-star" />
                        </div>
                        <div className="progress-stat-content">
                          <h3>{userProgress.totalPoints}</h3>
                          <p>Points</p>
                        </div>
                      </Card>
                      <Card className="progress-stat-card">
                        <div className="progress-stat-icon" style={{ backgroundColor: '#27ae6020', color: '#27ae60' }}>
                          <span className="icon-award" />
                        </div>
                        <div className="progress-stat-content">
                          <h3>Niveau {userProgress.level}</h3>
                          <p>Niveau actuel</p>
                        </div>
                      </Card>
                      <Card className="progress-stat-card">
                        <div className="progress-stat-icon" style={{ backgroundColor: '#e74c3c20', color: '#e74c3c' }}>
                          <span className="icon-trending-up" />
                        </div>
                        <div className="progress-stat-content">
                          <h3>{userProgress.streaks.daily}</h3>
                          <p>Jours consécutifs</p>
                        </div>
                      </Card>
                    </div>

                    <Card className="progress-achievements">
                      <h3>Badges Obtenus</h3>
                      {userProgress.badges && userProgress.badges.length > 0 ? (
                        <div className="badges-grid">
                          {userProgress.badges.map((badge: any, index: number) => (
                            <div key={index} className="badge-item">
                              <span className="icon-award" />
                              <span className="badge-name">{badge.type}</span>
                              <span className="badge-date">
                                {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Aucun badge obtenu pour le moment</p>
                      )}
                    </Card>

                    <Card className="progress-activities">
                      <h3>Activités</h3>
                      <div className="activities-list">
                        <div className="activity-item">
                          <span className="activity-label">Événements lus:</span>
                          <span className="activity-value">{userProgress.readEvents?.length || 0}</span>
                        </div>
                        <div className="activity-item">
                          <span className="activity-label">Personnages lus:</span>
                          <span className="activity-value">{userProgress.readFigures?.length || 0}</span>
                        </div>
                        <div className="activity-item">
                          <span className="activity-label">Quiz complétés:</span>
                          <span className="activity-value">{userProgress.completedQuizzes?.length || 0}</span>
                        </div>
                        <div className="activity-item">
                          <span className="activity-label">Récits complétés:</span>
                          <span className="activity-value">{userProgress.completedStories?.length || 0}</span>
                        </div>
                        <div className="activity-item">
                          <span className="activity-label">Collections complétées:</span>
                          <span className="activity-value">{userProgress.completedCollections?.length || 0}</span>
                        </div>
                        <div className="activity-item">
                          <span className="activity-label">Proverbes lus:</span>
                          <span className="activity-value">{userProgress.readProverbs?.length || 0}</span>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card className="empty-state">
                    <span className="icon-award" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <p>Aucune progression enregistrée</p>
                    <p className="empty-state-subtitle">Commencez à explorer le contenu pour gagner des points et des badges</p>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="dashboard-settings">
                <h2>Paramètres</h2>
                
                {/* Section Sécurité - Changement de mot de passe */}
                <Card className="settings-card">
                  <div className="settings-header">
                    <span className="icon-shield" />
                    <h3>Sécurité</h3>
                  </div>
                  <form 
                    className="settings-form"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setPasswordError(null)
                      setPasswordSuccess(false)
                      
                      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                        setPasswordError('Tous les champs sont requis')
                        return
                      }
                      
                      if (passwordData.newPassword.length < 6) {
                        setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères')
                        return
                      }
                      
                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        setPasswordError('Les mots de passe ne correspondent pas')
                        return
                      }
                      
                      try {
                        setSavingPassword(true)
                        await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
                        setPasswordSuccess(true)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        })
                        setTimeout(() => setPasswordSuccess(false), 3000)
                      } catch (err: any) {
                        setPasswordError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors du changement de mot de passe')
                      } finally {
                        setSavingPassword(false)
                      }
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="current-password" className="input-label">Mot de passe actuel</label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-password" className="input-label">Nouveau mot de passe</label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirm-password" className="input-label">Confirmer le nouveau mot de passe</label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        autoComplete="new-password"
                      />
                    </div>
                    {passwordError && (
                      <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem' }}>
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="success-message" style={{ color: '#10b981', marginBottom: '1rem' }}>
                        Mot de passe changé avec succès !
                      </div>
                    )}
                    <Button type="submit" disabled={savingPassword}>
                      <span className="icon-save" />
                      {savingPassword ? 'Changement en cours...' : 'Changer le mot de passe'}
                    </Button>
                  </form>
                </Card>

                {/* Section Préférences */}
                <Card className="settings-card">
                  <div className="settings-header">
                    <span className="icon-settings" />
                    <h3>Préférences</h3>
                  </div>
                  <div className="settings-options">
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      Les préférences utilisateur seront disponibles prochainement.
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  )
}
