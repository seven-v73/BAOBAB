import { useState, useEffect } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { orderService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { useConfirmDialog } from '../components/UX/ConfirmDialog'
import {
  Package,
  Calendar,
  Phone,
  Truck,
  CheckCircle,
  X,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  Download
} from 'lucide-react'
import './OrderDetail.css'

interface OrderItem {
  product: any
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  shippingAddress: {
    name: string
    street: string
    city: string
    zipCode: string
    country: string
    phone: string
  }
  billingAddress?: {
    name: string
    street: string
    city: string
    zipCode: string
    country: string
  }
  trackingNumber?: string
  notes?: string
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
}

export const OrderDetail = () => {
  const platformName = usePlatformName()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const { error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/orders/${id || ''}`)}`)
      return
    }

    if (id) {
      fetchOrder()
    }
  }, [id, isAuthenticated, navigate])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await orderService.getById(id!)
      setOrder(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors du chargement de la commande'
      showError(errorMessage)
      navigate('/dashboard?section=orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    const accepted = await confirm({
      title: 'Annuler cette commande ?',
      message: 'Cette action demandera l’annulation de la commande. Le support pourra confirmer selon son état.',
      confirmLabel: 'Demander l’annulation',
      tone: 'danger',
    })
    if (!accepted) return

    setCancelling(true)
    try {
      // Pour l'instant, on ne peut pas annuler via l'API utilisateur
      // Il faudrait ajouter une route PUT /api/orders/:id/cancel pour les utilisateurs
      // Pour l'instant, on affiche juste un message
      showError('L\'annulation de commande sera disponible prochainement. Contactez le support.')
      // await orderService.cancel(id!)
      // success('Commande annulée avec succès')
      // fetchOrder()
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de l\'annulation'
      showError(errorMessage)
    } finally {
      setCancelling(false)
    }
  }

  const handleDownloadInvoice = () => {
    if (!order) return

    // Créer un document HTML pour la facture
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Facture ${order.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #d4af37;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #d4af37;
              margin: 0;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-box {
              flex: 1;
            }
            .info-box h3 {
              color: #d4af37;
              margin-top: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #d4af37;
              color: white;
            }
            .total-row {
              font-weight: bold;
              font-size: 1.1em;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${platformName}</h1>
            <h2>Facture ${order.orderNumber}</h2>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Adresse de livraison</h3>
              <p>${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.zipCode} ${order.shippingAddress.city}<br>
              ${order.shippingAddress.country}</p>
            </div>
            <div class="info-box">
              <h3>Informations</h3>
              <p><strong>Statut:</strong> ${getStatusLabel(order.status)}<br>
              <strong>Paiement:</strong> ${getPaymentStatusLabel(order.paymentStatus)}<br>
              ${order.trackingNumber ? `<strong>Suivi:</strong> ${order.trackingNumber}` : ''}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} €</td>
                  <td>${item.subtotal.toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Sous-total:</strong></td>
                <td><strong>${order.subtotal.toFixed(2)} €</strong></td>
              </tr>
              ${order.shipping > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Livraison:</strong></td>
                  <td><strong>${order.shipping.toFixed(2)} €</strong></td>
                </tr>
              ` : ''}
              ${order.discount > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Remise:</strong></td>
                  <td><strong>-${order.discount.toFixed(2)} €</strong></td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>${order.total.toFixed(2)} €</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>Merci pour votre commande !</p>
            <p>${platformName} - Découvrez la richesse de l'Afrique</p>
          </div>
        </body>
      </html>
    `

    // Ouvrir une nouvelle fenêtre avec la facture et permettre l'impression
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.focus()
      // Attendre que le contenu soit chargé avant d'imprimer
      setTimeout(() => {
        printWindow.print()
      }, 250)
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

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échec',
      refunded: 'Remboursé',
    }
    return labels[status] || status
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      stripe: 'Carte bancaire (Stripe)',
      paypal: 'PayPal',
      bank_transfer: 'Virement bancaire',
      cash: 'Espèces',
    }
    return labels[method] || method
  }

  const canCancel = order && (order.status === 'pending' || order.status === 'confirmed')

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <Layout>
        <div className="order-detail">
          <div className="order-loading">
            <p>Chargement de la commande...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="order-detail">
          <Card className="order-error">
            <AlertCircle size={48} />
            <h2>Commande non trouvée</h2>
            <Link to="/dashboard?section=orders">
              <Button>Retour au dashboard</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="order-detail">
        <div className="order-header-nav">
          <Link to="/dashboard?section=orders" className="back-link">
            <ArrowLeft size={20} />
            Retour aux commandes
          </Link>
        </div>

        <div className="order-detail-header">
          <div>
            <h1>Commande {order.orderNumber}</h1>
            <p className="order-date">
              <Calendar size={18} />
              Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="order-status-badge-large" style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
            {getStatusLabel(order.status)}
          </div>
        </div>

        <div className="order-detail-grid">
          <div className="order-detail-main">
            <Card className="order-items-card">
              <h2>Articles commandés</h2>
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-detail-item">
                    <div className="order-item-image">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.name} />
                      ) : (
                        <div className="order-item-placeholder">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="order-item-details">
                      <h3>{item.name}</h3>
                      <p className="order-item-meta">
                        Quantité: {item.quantity} × {item.price.toFixed(2)} €
                      </p>
                    </div>
                    <div className="order-item-total">
                      {item.subtotal.toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="order-addresses-card">
              <h2>Adresses</h2>
              <div className="addresses-grid">
                <div className="address-section">
                  <h3>
                    <Truck size={18} />
                    Adresse de livraison
                  </h3>
                  <div className="address-content">
                    <p><strong>{order.shippingAddress.name}</strong></p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.zipCode} {order.shippingAddress.city}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p>
                        <Phone size={16} />
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
                {order.billingAddress && (
                  <div className="address-section">
                    <h3>
                      <CreditCard size={18} />
                      Adresse de facturation
                    </h3>
                    <div className="address-content">
                      <p><strong>{order.billingAddress.name}</strong></p>
                      <p>{order.billingAddress.street}</p>
                      <p>
                        {order.billingAddress.zipCode} {order.billingAddress.city}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {order.notes && (
              <Card className="order-notes-card">
                <h2>Notes</h2>
                <p>{order.notes}</p>
              </Card>
            )}
          </div>

          <div className="order-detail-sidebar">
            <Card className="order-summary-card">
              <h2>Résumé</h2>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Sous-total</span>
                  <span>{order.subtotal.toFixed(2)} €</span>
                </div>
                {order.shipping > 0 && (
                  <div className="summary-row">
                    <span>Livraison</span>
                    <span>{order.shipping.toFixed(2)} €</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Remise</span>
                    <span>-{order.discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </div>
            </Card>

            <Card className="order-info-card">
              <h2>Informations</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Statut</span>
                  <span className="info-value" style={{ color: getStatusColor(order.status) }}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Paiement</span>
                  <span className="info-value">
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Méthode de paiement</span>
                  <span className="info-value">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="info-item">
                    <span className="info-label">Numéro de suivi</span>
                    <span className="info-value tracking">
                      <Truck size={16} />
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="info-item">
                    <span className="info-label">Expédiée le</span>
                    <span className="info-value">
                      {new Date(order.shippedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="info-item">
                    <span className="info-label">Livrée le</span>
                    <span className="info-value">
                      <CheckCircle size={16} />
                      {new Date(order.deliveredAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="order-actions-card">
              <h2>Actions</h2>
              <div className="order-actions-list">
                <Button
                  onClick={handleDownloadInvoice}
                  className="download-invoice-btn"
                >
                  <Download size={18} />
                  Télécharger la facture
                </Button>
                {canCancel && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="cancel-order-btn"
                    >
                      <X size={18} />
                      {cancelling ? 'Annulation...' : 'Annuler la commande'}
                    </Button>
                    <p className="action-note">
                      Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée.
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      {Dialog}
    </Layout>
  )
}
