import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { orderService, paymentService, couponService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { MapPin, CreditCard, Tag } from 'lucide-react'
import './Checkout.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

interface ShippingAddress {
  name: string
  street: string
  city: string
  zipCode: string
  country: string
  phone: string
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const { success, error: showError } = useNotifications()

  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.name || '',
    street: '',
    city: '',
    zipCode: '',
    country: '',
    phone: '',
  })
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const subtotal = getTotal()
  const shipping = subtotal >= 100 ? 0 : 10
  const total = subtotal + shipping - discount

  useEffect(() => {
    if (!isAuthenticated) {
      showError('Vous devez être connecté pour passer une commande')
      navigate('/login?redirect=/checkout')
    }
  }, [isAuthenticated, navigate, showError])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const response = await couponService.validate(couponCode, subtotal)
      setDiscount(response.data.discount || 0)
      success('Code promo appliqué !')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Code promo invalide')
      setDiscount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    // Validation
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.zipCode || !shippingAddress.country || !shippingAddress.phone) {
      showError('Veuillez remplir tous les champs de l\'adresse')
      return
    }

    setLoading(true)

    try {
      // Créer la commande
      const orderResponse = await orderService.create({
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'stripe',
        couponCode: couponCode || undefined,
      })

      const order = orderResponse.data

      // Créer le Payment Intent
      const paymentResponse = await paymentService.createIntent(
        order._id,
        order.total,
        'eur'
      )

      // Confirmer le paiement
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        paymentResponse.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: shippingAddress.name,
              address: {
                line1: shippingAddress.street,
                city: shippingAddress.city,
                postal_code: shippingAddress.zipCode,
                country: shippingAddress.country,
              },
              phone: shippingAddress.phone,
            },
          },
        }
      )

      if (paymentError) {
        showError(paymentError.message || 'Erreur lors du paiement')
        setLoading(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        success('Paiement réussi ! Votre commande est confirmée.')
        clearCart()
        navigate(`/orders/${order._id}`)
      }
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la création de la commande')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-content">
        <div className="checkout-main">
          <Card className="checkout-section">
            <h2>
              <MapPin size={20} />
              Adresse de livraison
            </h2>
            <div className="form-grid">
              <Input
                label="Nom complet"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                required
                autoComplete="name"
              />
              <Input
                label="Téléphone"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                required
                autoComplete="tel"
              />
              <Input
                label="Adresse"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                required
                autoComplete="street-address"
                className="full-width"
              />
              <Input
                label="Ville"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                required
                autoComplete="address-level2"
              />
              <Input
                label="Code postal"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                required
                autoComplete="postal-code"
              />
              <Input
                label="Pays"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                required
                autoComplete="country-name"
              />
            </div>
          </Card>

          <Card className="checkout-section">
            <h2>
              <Tag size={20} />
              Code promo
            </h2>
            <div className="coupon-input">
              <Input
                placeholder="Entrez votre code promo"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button type="button" onClick={handleApplyCoupon} variant="outline">
                Appliquer
              </Button>
            </div>
            {discount > 0 && (
              <p className="discount-applied">
                Réduction de {discount.toFixed(2)}€ appliquée !
              </p>
            )}
          </Card>

          <Card className="checkout-section">
            <h2>
              <CreditCard size={20} />
              Paiement
            </h2>
            <div className="card-element-wrapper">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>

        <Card className="checkout-summary">
          <h2>Résumé de la commande</h2>
          <div className="summary-items">
            {items.map((item) => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-line">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="summary-line">
              <span>Livraison</span>
              <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}</span>
            </div>
            {discount > 0 && (
              <div className="summary-line discount">
                <span>Réduction</span>
                <span>-{discount.toFixed(2)}€</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>
          <Button
            type="submit"
            className="checkout-submit"
            size="large"
            disabled={loading || !stripe}
          >
            {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}€`}
          </Button>
        </Card>
      </div>
    </form>
  )
}

export const Checkout = () => {
  const { items } = useCartStore()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <Layout>
        <div className="checkout">
          <Card className="checkout-empty">
            <h2>Votre panier est vide</h2>
            <p>Ajoutez des produits avant de passer commande</p>
            <Button onClick={() => navigate('/shop')}>Voir la boutique</Button>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="checkout">
        <h1>Finaliser la commande</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </Layout>
  )
}

