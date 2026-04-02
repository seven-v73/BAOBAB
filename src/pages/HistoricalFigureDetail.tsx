import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { figureService } from '../services/api'
import './HistoricalFigureDetail.css'

interface HistoricalFigure {
  _id: string
  name: string
  nameNative: string
  birthDate?: string
  deathDate?: string
  role: string[]
  achievements: string[]
  biography: string
  shortBiography: string
  image: string
  images: Array<{ url: string; caption: string }>
  birthPlace: {
    country?: { _id: string; nameFr: string; id: string }
    location: string
  }
  quotes: Array<{ text: string; context: string; source: string; verified: boolean }>
  legacy: string
  culturalImpact: string
  verified: boolean
  relatedCountries: Array<{ _id: string; nameFr: string; id: string }>
  relatedEvents: Array<{ _id: string; title: string; date: string }>
}

export const HistoricalFigureDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [figure, setFigure] = useState<HistoricalFigure | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchFigure()
    }
  }, [id])

  const fetchFigure = async () => {
    try {
      setLoading(true)
      const response = await figureService.getById(id!)
      setFigure(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de la figure:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="figure-detail-loading">
          <p>Chargement...</p>
        </div>
      </Layout>
    )
  }

  if (!figure) {
    return (
      <Layout>
        <div className="figure-detail-not-found">
          <h1>Figure historique non trouvée</h1>
          <Link to="/figures">
            <Button>Retour aux figures</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="figure-detail-page">
        <Link to="/figures" className="back-link">
          <span className="icon-arrow-left" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
          Retour aux figures historiques
        </Link>

        <div className="figure-detail-hero">
          <div className="figure-hero-image">
            {figure.image ? (
              <img src={figure.image} alt={figure.name} />
            ) : (
              <div className="figure-hero-placeholder">
                <span>{figure.name.charAt(0)}</span>
              </div>
            )}
            {figure.verified && (
              <div className="figure-verified-label">
                <span className="icon-check" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
                <span>Vérifié par des experts</span>
              </div>
            )}
          </div>
          <div className="figure-hero-info">
            <h1>{figure.name}</h1>
            {figure.nameNative && (
              <p className="figure-native-name">{figure.nameNative}</p>
            )}
            <div className="figure-hero-meta">
              {figure.birthDate && (
                <div className="meta-item">
                  <span className="icon-calendar" />
                  <div>
                    <strong>Naissance:</strong> {formatDate(figure.birthDate)}
                    {figure.deathDate && (
                      <>
                        <br />
                        <strong>Décès:</strong> {formatDate(figure.deathDate)}
                      </>
                    )}
                  </div>
                </div>
              )}
              {figure.birthPlace.country && (
                <div className="meta-item">
                  <span className="icon-location" />
                  <div>
                    <strong>Lieu de naissance:</strong> {figure.birthPlace.location}
                    {figure.birthPlace.country && (
                      <>
                        <br />
                        <span>{figure.birthPlace.country.nameFr}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="figure-roles-list">
              {figure.role.map((role) => (
                <span key={role} className="role-badge">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="figure-detail-content">
          <Card className="biography-card">
            <h2>Biographie</h2>
            <div className="biography-text">
              {figure.biography.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Card>

          {figure.achievements.length > 0 && (
            <Card className="achievements-card">
              <h2>
                <span className="icon-award" style={{ fontSize: '24px', width: '24px', height: '24px', display: 'inline-block' }} />
                Réalisations
              </h2>
              <ul className="achievements-list">
                {figure.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </Card>
          )}

          {figure.quotes.length > 0 && (
            <Card className="quotes-card">
              <h2>
                <span className="icon-quote" style={{ fontSize: '24px', width: '24px', height: '24px', display: 'inline-block' }} />
                Citations
              </h2>
              <div className="quotes-list">
                {figure.quotes.map((quote, index) => (
                  <div key={index} className="quote-item">
                    <blockquote>"{quote.text}"</blockquote>
                    {quote.context && <p className="quote-context">{quote.context}</p>}
                    {quote.source && <p className="quote-source">— {quote.source}</p>}
                    {quote.verified && (
                      <span className="quote-verified">
                        <span className="icon-check" style={{ fontSize: '14px', width: '14px', height: '14px', display: 'inline-block' }} />
                        Vérifié
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {figure.legacy && (
            <Card className="legacy-card">
              <h2>Héritage</h2>
              <p>{figure.legacy}</p>
            </Card>
          )}

          {figure.culturalImpact && (
            <Card className="impact-card">
              <h2>Impact Culturel</h2>
              <p>{figure.culturalImpact}</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

