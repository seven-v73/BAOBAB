import { Link } from 'react-router-dom'
import { useProductStore } from '../../store/productStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import './Cart.css'

export const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getTotalPrice, clearCart } =
    useProductStore()

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <Card className="empty-cart">
            <h2>Votre panier est vide</h2>
            <p>Retrouvez votre sélection et finalisez votre commande</p>
            <Link to="/shop">
              <Button variant="primary">Voir les produits</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Panier</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <Card key={item.product.id} className="cart-item">
                <div
                  className="cart-item-image"
                  style={{ backgroundImage: `url(${item.product.image})` }}
                />
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-origin">{item.product.origin}</p>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="quantity">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    <div className="cart-item-price">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </div>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="cart-summary">
            <h2>Résumé</h2>
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{getTotalPrice().toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{getTotalPrice().toFixed(2)} €</span>
            </div>
            <Button variant="primary" size="large" className="checkout-btn">
              Passer la commande
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={clearCart}
              className="clear-btn"
            >
              Vider le panier
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

