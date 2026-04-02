import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import './Home.css'

export const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Découvrez la <span className="highlight">Richesse</span> de l'Afrique
          </h1>
          <p className="hero-subtitle">
            Explorez les valeurs, l'histoire et les produits authentiques du continent africain
          </p>
          <div className="hero-actions">
            <Link to="/blog">
              <Button variant="primary" size="large">
                Découvrir l'Histoire
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="large">
                Voir les Produits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Nos Valeurs</h2>
          <div className="values-grid">
            <Card className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Authenticité</h3>
              <p>Des produits et histoires authentiques directement du continent africain</p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Communauté</h3>
              <p>Unir les peuples autour de la richesse culturelle africaine</p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">✨</div>
              <h3>Excellence</h3>
              <p>Promouvoir l'excellence et la qualité dans tous nos produits</p>
            </Card>
            <Card className="value-card">
              <div className="value-icon">📚</div>
              <h3>Éducation</h3>
              <p>Partager l'histoire et les connaissances du continent</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-content">
              <h2>Retracez l'Histoire Africaine</h2>
              <p>
                Plongez dans les récits fascinants des empires, des royaumes et des civilisations 
                qui ont façonné l'Afrique. Découvrez des articles détaillés sur l'histoire riche 
                et complexe du continent.
              </p>
              <Link to="/blog">
                <Button variant="primary">Explorer le Blog</Button>
              </Link>
            </div>
            <div className="feature-image">
              <div className="image-placeholder">📖</div>
            </div>
          </div>

          <div className="features-grid reverse">
            <div className="feature-image">
              <div className="image-placeholder">🛍️</div>
            </div>
            <div className="feature-content">
              <h2>Produits Africains Authentiques</h2>
              <p>
                Découvrez une sélection soignée de produits artisanaux, cosmétiques naturels, 
                textiles et bien plus encore, tous directement issus du continent africain.
              </p>
              <Link to="/shop">
                <Button variant="primary">Visiter la Boutique</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

