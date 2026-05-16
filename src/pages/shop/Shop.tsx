import { useEffect, useState } from 'react'
import { useProductStore } from '../../store/productStore'
import { productApi } from '../../api/api'
import { ProductCard } from '../../components/shop/ProductCard'
import { Button } from '../../components/ui/Button'
import './Shop.css'

export const Shop = () => {
  const { products, addToCart, setProducts } = useProductStore()
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      const allProducts = await productApi.getAll()
      setProducts(allProducts)
      setLoading(false)
    }
    loadProducts()
  }, [setProducts])

  const categories = ['all', 'Boissons', 'Textile', 'Cosmétique', 'Alimentaire', 'Artisanat']
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory)

  if (loading) {
    return (
      <div className="shop-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      <div className="container">
        <h1 className="page-title">Boutique Africaine</h1>
        <p className="page-subtitle">
          Une sélection claire d’objets, de matières et de savoir-faire africains
        </p>

        <div className="category-filter">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Tous' : category}
            </Button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

