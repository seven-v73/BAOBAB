import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { productService, userService, countryService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { Heart, Star, ShoppingCart, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import './Shop.css'

interface Product {
  _id?: string
  id?: string
  name: string
  description: string
  shortDescription?: string
  price: number
  currency?: string
  images?: string[]
  image?: string
  category: string
  country?: string
  rating?: {
    average: number
    count: number
  }
  views?: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export const Shop = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [userWishlist, setUserWishlist] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Filtres et tri
  const [filters, setFilters] = useState({
    category: '',
    country: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: 'newest' as 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'popularity' | 'rating',
    page: 1,
    limit: 12,
  })

  const { isAuthenticated, user } = useAuthStore()
  const addItem = useCartStore((state) => state.addItem)
  const { success, error: showError } = useNotifications()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
    fetchCountries()
    fetchTrendingProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchUserData()
  }, [filters, isAuthenticated, user])

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await countryService.getAll()
      const countriesData = Array.isArray(response.data) ? response.data : response.data?.countries || []
      setCountries(countriesData)
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
    }
  }

  const fetchTrendingProducts = async () => {
    try {
      const response = await productService.getTrending({ limit: 5 })
      setTrendingProducts(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des produits tendance:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      }

      if (filters.category) params.category = filters.category
      if (filters.country) params.country = filters.country
      if (filters.search) params.search = filters.search
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.minRating) params.minRating = filters.minRating

      const response = await productService.getAll(params)
      const productsData = response.data.products || []
      setProducts(Array.isArray(productsData) ? productsData : [])
      setPagination(response.data.pagination || null)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    if (isAuthenticated && user?.id) {
      try {
        const profileRes = await userService.getProfile()
        const profile = profileRes.data
        const favorites = profile.favorites?.map((fav: any) => fav._id || fav) || []
        const wishlist = profile.wishlist?.map((item: any) => item._id || item) || []
        setUserFavorites(favorites)
        setUserWishlist(wishlist)
      } catch (err) {
        // Ignore si erreur de chargement du profil
      }
    }
  }

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated || !user?.id) {
      showError('Connectez-vous pour ajouter un produit au panier')
      navigate('/login')
      return
    }

    addItem({
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || '',
    })
    success('Produit ajouté au panier !')
  }

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated || !user?.id) {
      showError('Connectez-vous pour ajouter aux favoris')
      return
    }

    try {
      const isFavorite = userFavorites.includes(productId)
      let updatedFavorites: string[]

      if (isFavorite) {
        updatedFavorites = userFavorites.filter(id => id !== productId)
        success('Produit retiré des favoris')
      } else {
        updatedFavorites = [...userFavorites, productId]
        success('Produit ajouté aux favoris')
      }

      await userService.update(user.id, { favorites: updatedFavorites })
      setUserFavorites(updatedFavorites)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la mise à jour'
      showError(errorMessage)
    }
  }

  const handleToggleWishlist = async (productId: string) => {
    if (!isAuthenticated || !user?.id) {
      showError('Connectez-vous pour ajouter à la wishlist')
      return
    }

    try {
      const isInWishlist = userWishlist.includes(productId)
      let updatedWishlist: string[]

      if (isInWishlist) {
        updatedWishlist = userWishlist.filter(id => id !== productId)
        success('Produit retiré de la wishlist')
      } else {
        updatedWishlist = [...userWishlist, productId]
        success('Produit ajouté à la wishlist')
      }

      await userService.update(user.id, { wishlist: updatedWishlist })
      setUserWishlist(updatedWishlist)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la mise à jour'
      showError(errorMessage)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      country: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    })
  }

  const formatPrice = (price: number, currency: string = 'FCFA') => {
    return `${price.toLocaleString()} ${currency}`
  }

  const activeFilters = [
    filters.search && { key: 'search', label: `Recherche: ${filters.search}` },
    filters.category && { key: 'category', label: filters.category },
    filters.country && { key: 'country', label: filters.country },
    filters.minPrice && { key: 'minPrice', label: `Min. ${formatPrice(Number(filters.minPrice))}` },
    filters.maxPrice && { key: 'maxPrice', label: `Max. ${formatPrice(Number(filters.maxPrice))}` },
    filters.minRating && { key: 'minRating', label: `${filters.minRating}+ étoiles` },
  ].filter(Boolean) as Array<{ key: keyof typeof filters; label: string }>

  return (
    <Layout>
      <div className="shop">
        <div className="shop-header">
          <h1>Boutique Africaine</h1>
          <p className="shop-subtitle">
            Objets, matières et créations choisis pour leur usage et leur histoire
          </p>
        </div>

        {/* Produits tendance */}
        {trendingProducts.length > 0 && (
          <section className="shop-trending">
            <h2>Produits en mouvement</h2>
            <div className="trending-products-grid">
              {trendingProducts.map((product) => {
                const productId = product._id || product.id || ''
                const productImage = product.image || (product.images && product.images[0]) || ''
                return (
                  <Link key={productId} to={`/shop`} className="trending-product-card">
                    {productImage && <img src={productImage} alt={product.name} />}
                    <div className="trending-product-info">
                      <h4>{product.name}</h4>
                      <p className="trending-price">{formatPrice(product.price, product.currency)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Filtres et tri */}
        <div className="shop-controls">
          <div className="shop-controls-left">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} />
              Filtres
            </button>
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="shop-search"
            />
          </div>
          <div className="shop-controls-right">
            <select
              id="shop-sort"
              name="shop-sort"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="shop-sort"
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="popularity">Plus populaire</option>
              <option value="rating">Mieux noté</option>
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filter-chips" aria-label="Filtres actifs">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="active-filter-chip"
                onClick={() => handleFilterChange(filter.key, '')}
              >
                <span>{filter.label}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="active-filter-clear" onClick={clearFilters}>
              Tout effacer
            </button>
          </div>
        )}

        {/* Panneau de filtres */}
        {showFilters && (
          <Card className="shop-filters-panel">
            <div className="filters-header">
              <h3>Filtres</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
                Réinitialiser
              </button>
            </div>
            <div className="filters-content">
              <div className="filter-group">
                <label htmlFor="filter-category">Catégorie</label>
                <select
                  id="filter-category"
                  name="filter-category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filter-country">Pays d'origine</label>
                <select
                  id="filter-country"
                  name="filter-country"
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country._id || country.id} value={country.nameFr}>
                      {country.nameFr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Prix minimum</label>
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="filter-group">
                <label>Prix maximum</label>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="∞"
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filter-min-rating">Note minimale</label>
                <select
                  id="filter-min-rating"
                  name="filter-min-rating"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                >
                  <option value="">Toutes les notes</option>
                  <option value="4">4 étoiles et plus</option>
                  <option value="3">3 étoiles et plus</option>
                  <option value="2">2 étoiles et plus</option>
                  <option value="1">1 étoile et plus</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Liste des produits */}
        {loading ? (
          <div className="shop-loading">Chargement des produits...</div>
        ) : (
          <>
            <div className="shop-grid">
              {products.length === 0 ? (
                <div className="shop-empty">
                  <p>Aucun produit disponible pour le moment.</p>
                </div>
              ) : (
                products.map((product) => {
                  const productId = product._id || product.id || ''
                  const productImage = product.image || (product.images && product.images[0]) || ''
                  
                  const isFavorite = userFavorites.includes(productId)
                  const isInWishlist = userWishlist.includes(productId)

                  return (
                    <Card key={productId} className="product-card">
                      <div className="product-header">
                        {productImage && (
                          <div className="product-image">
                            <img src={productImage} alt={product.name} />
                          </div>
                        )}
                        {isAuthenticated && (
                          <div className="product-actions-overlay">
                            <button
                              className={`product-action-btn ${isFavorite ? 'active' : ''}`}
                              onClick={() => handleToggleFavorite(productId)}
                              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            >
                              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              className={`product-action-btn ${isInWishlist ? 'active' : ''}`}
                              onClick={() => handleToggleWishlist(productId)}
                              title={isInWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                            >
                              <Star size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        )}
                        {product.rating && product.rating.average > 0 && (
                          <div className="product-rating-badge">
                            <Star size={14} fill="currentColor" />
                            {product.rating.average.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">
                          {product.shortDescription || product.description?.substring(0, 100)}...
                        </p>
                        {product.country && (
                          <p className="product-country">{product.country}</p>
                        )}
                        <div className="product-footer">
                          <span className="product-price">
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <Button onClick={() => handleAddToCart(product)} size="small">
                            <ShoppingCart size={16} />
                            {isAuthenticated ? 'Panier' : 'Connexion'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="shop-pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Précédent
                </button>
                <span className="pagination-info">
                  Page {pagination.page} sur {pagination.pages} ({pagination.total} produits)
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="pagination-btn"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
