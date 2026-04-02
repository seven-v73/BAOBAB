import type { Product } from '../../store/productStore'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="product-card">
      <div
        className="product-image"
        style={{ backgroundImage: `url(${product.image})` }}
      />
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-origin">📍 {product.origin}</span>
        </div>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-amount">{product.price.toFixed(2)}</span>
            <span className="price-currency">€</span>
          </div>
          <Button variant="primary" size="small" onClick={onAddToCart}>
            Ajouter au panier
          </Button>
        </div>
      </div>
    </Card>
  )
}

