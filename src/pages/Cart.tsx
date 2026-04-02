import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { useCartStore } from '../stores/cartStore'
import type { CartItem } from '../stores/cartStore'
import './Cart.css'

export const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <Layout>
        <div className="cart">
          <h1>Panier</h1>
          <Card className="cart-empty">
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits africains authentiques</p>
            <Link to="/shop">
              <Button>Voir la boutique</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="cart">
        <h1>Panier</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {items.map((item: CartItem) => (
              <Card key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{item.price.toFixed(2)} €</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="quantity">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => removeItem(item.id)}
                  >
                    Supprimer
                  </Button>
                </div>
                <div className="cart-item-total">
                  {(item.price * item.quantity).toFixed(2)} €
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="cart-summary">
            <h2>Résumé</h2>
            <div className="summary-line">
              <span>Sous-total</span>
              <span>{getTotal().toFixed(2)} €</span>
            </div>
            <div className="summary-line">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{getTotal().toFixed(2)} €</span>
            </div>
            <Button 
              className="checkout-button" 
              size="large"
              onClick={() => navigate('/checkout')}
            >
              Passer la commande
            </Button>
            <Button
              variant="outline"
              onClick={clearCart}
              className="clear-button"
            >
              Vider le panier
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

