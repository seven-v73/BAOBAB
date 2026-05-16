import { useAuthStore } from '../../stores/authStore'
import { useProductStore } from '../../store/productStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import './Dashboard.css'

export const Dashboard = () => {
  const { user } = useAuthStore()
  const cartItemCount = useProductStore((state) => state.getCartItemCount())
  const totalPrice = useProductStore((state) => state.getTotalPrice())
  const formatFCFA = (amount: number) => `${Math.round(amount || 0).toLocaleString('fr-FR')} FCFA`

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        <p className="welcome-message">
          Bienvenue, <span className="user-name">{user?.name}</span> !
        </p>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <div className="card-icon"><span className="icon-shopping" aria-hidden="true" /></div>
            <h3>Panier</h3>
            <p className="card-value">{cartItemCount} articles</p>
            <Link to="/shop/cart">
              <Button variant="primary" size="small">
                Voir le panier
              </Button>
            </Link>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon"><span className="icon-package" aria-hidden="true" /></div>
            <h3>Total panier</h3>
            <p className="card-value">{formatFCFA(totalPrice)}</p>
            <Link to="/shop/cart">
              <Button variant="primary" size="small">
                Finaliser
              </Button>
            </Link>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon"><span className="icon-book" aria-hidden="true" /></div>
            <h3>Blog</h3>
            <p className="card-value">Découvrir</p>
            <Link to="/blog">
              <Button variant="primary" size="small">
                Lire les articles
              </Button>
            </Link>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon"><span className="icon-shopping" aria-hidden="true" /></div>
            <h3>Boutique</h3>
            <p className="card-value">Explorer</p>
            <Link to="/shop">
              <Button variant="primary" size="small">
                Voir les produits
              </Button>
            </Link>
          </Card>
        </div>

        <Card className="profile-card">
          <h2>Informations du profil</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Nom :</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email :</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rôle :</span>
              <span className="info-value">{user?.role}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
