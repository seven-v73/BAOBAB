import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { BookmarkButton } from '../components/BookmarkButton/BookmarkButton'
import { ShareButton } from '../components/ShareButton/ShareButton'
import { timelineService, progressService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import './TimelineDetail.css'

interface TimelineEvent {
  _id: string
  title: string
  description: string
  shortDescription: string
  date: string
  endDate?: string
  period: string
  location: {
    country?: {
      _id: string
      nameFr: string
      id: string
      color: string
    }
    region: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  category: string[]
  sources: Array<{
    type: string
    title: string
    url: string
    author: string
    year: number
  }>
  images: string[]
  videos: Array<{
    url: string
    title: string
    type: string
  }>
  relatedEvents: Array<{
    _id: string
    title: string
    date: string
    shortDescription: string
  }>
  relatedCountries: Array<{
    _id: string
    nameFr: string
    id: string
  }>
  relatedFigures: Array<{
    _id: string
    name: string
    nameNative: string
  }>
  verified: boolean
  importance: number
}

export const TimelineDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<TimelineEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  useEffect(() => {
    // Enregistrer l'activité de lecture pour la progression
    if (event && isAuthenticated && id) {
      progressService.recordActivity({
        activityType: 'read-event',
        itemType: 'event',
        itemId: id,
      }).catch(console.error)
    }
  }, [event, isAuthenticated, id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await timelineService.getById(id!)
      setEvent(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
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
        <div className="timeline-detail-loading">
          <p>Chargement...</p>
        </div>
      </Layout>
    )
  }

  if (!event) {
    return (
      <Layout>
        <div className="timeline-detail-not-found">
          <h1>Événement non trouvé</h1>
          <Link to="/timeline">
            <Button>Retour à la chronologie</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="timeline-detail-page">
        <Link to="/timeline" className="back-link">
          <span className="icon-arrow-left" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
          Retour à la chronologie
        </Link>

        <div className="event-header">
          <div className="event-header-content">
            <div className="event-period-badge">{event.period}</div>
            <h1>{event.title}</h1>
            <div className="event-date-info">
              <span className="icon-calendar" />
              <div>
                <strong>{formatDate(event.date)}</strong>
                {event.endDate && (
                  <>
                    {' - '}
                    <strong>{formatDate(event.endDate)}</strong>
                  </>
                )}
              </div>
            </div>
            {event.location.country && (
              <div className="event-location-info">
                <span className="icon-location" />
                <span>
                  {event.location.region && `${event.location.region}, `}
                  {event.location.country.nameFr}
                </span>
              </div>
            )}
            {event.verified && (
              <div className="event-verified-badge">
                <span className="icon-check" />
                <span>Vérifié par des experts</span>
              </div>
            )}
            <div className="event-actions">
              <BookmarkButton itemType="event" itemId={event._id} />
              <ShareButton 
                url={`/timeline/${event._id}`}
                title={event.title}
                description={event.shortDescription}
              />
            </div>
          </div>
        </div>

        <div className="event-content">
          <Card className="event-description-card">
            <h2>Description</h2>
            <div className="event-description-text">
              {event.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Card>

          {event.category.length > 0 && (
            <Card className="event-categories-card">
              <h3>Catégories</h3>
              <div className="categories-list">
                {event.category.map((cat) => (
                  <span key={cat} className="category-badge">
                    {cat}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {event.images.length > 0 && (
            <Card className="event-images-card">
              <h3>Images</h3>
              <div className="images-gallery">
                {event.images.map((image, index) => (
                  <img key={index} src={image} alt={`${event.title} - Image ${index + 1}`} />
                ))}
              </div>
            </Card>
          )}

          {event.sources.length > 0 && (
            <Card className="event-sources-card">
              <h3>Sources</h3>
              <ul className="sources-list">
                {event.sources.map((source, index) => (
                  <li key={index} className="source-item">
                    <span className="icon-external-link" style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-block' }} />
                    <div>
                      <strong>{source.title}</strong>
                      {source.author && <p>Par {source.author}</p>}
                      {source.year && <p>Année: {source.year}</p>}
                      {source.url && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          Voir la source
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {event.relatedEvents.length > 0 && (
            <Card className="event-related-card">
              <h3>Événements liés</h3>
              <div className="related-events-list">
                {event.relatedEvents.map((relatedEvent) => (
                  <Link
                    key={relatedEvent._id}
                    to={`/timeline/${relatedEvent._id}`}
                    className="related-event-link"
                  >
                    <div>
                      <strong>{relatedEvent.title}</strong>
                      <p>{formatDate(relatedEvent.date)}</p>
                    </div>
                    <span className="icon-arrow-right" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

