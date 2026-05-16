import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { timelineService } from '../services/api'
import { usePlatformName } from '../hooks/usePlatformName'
import { Link } from 'react-router-dom'
import './Timeline.css'

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
  }
  category: string[]
  verified: boolean
  importance: number
  images: string[]
}

export const Timeline = () => {
  const platformName = usePlatformName()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [periods, setPeriods] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState({
    period: '',
    category: '',
    search: '',
  })

  useEffect(() => {
    fetchPeriods()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchPeriods = async () => {
    try {
      const response = await timelineService.getPeriods()
      setPeriods(response.data.periods || [])
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await timelineService.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filters.period) params.period = filters.period
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search

      const response = await timelineService.getAll(params)
      // La réponse peut être un tableau directement ou un objet avec une propriété events
      const eventsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.events || response.data?.data || []
      setEvents(eventsData)
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      setEvents([])
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

  return (
    <Layout>
      <div className="timeline-page">
        <div className="timeline-header">
          <h1>Chronologie africaine</h1>
          <p>Repères, ruptures et héritages à lire dans le temps</p>
        </div>

        <div className="timeline-filters">
          <div className="filter-group">
            <span className="icon-search" />
            <Input
              placeholder="Rechercher un événement..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <span className="icon-calendar" />
            <select
              id="timeline-period-filter"
              name="timeline-period-filter"
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="filter-select"
            >
              <option value="">Toutes les périodes</option>
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <span className="icon-filter" />
            <select
              id="timeline-category-filter"
              name="timeline-category-filter"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="filter-select"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="timeline-loading">
            <p>Chargement des événements...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="timeline-empty">
            <p>Aucun événement trouvé</p>
          </div>
        ) : (
          <div className="timeline-container">
            {events.map((event) => (
              <Card key={event._id} className="timeline-event-card">
                <div className="event-header">
                  <div className="event-date">
                    <span className="icon-clock" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.verified && (
                    <div className="event-verified">
                      <span className="icon-check" />
                      <span>Vérifié</span>
                    </div>
                  )}
                </div>
                <h3>{event.title}</h3>
                <p className="event-description">
                  {event.shortDescription || event.description.substring(0, 200)}...
                </p>
                <div className="event-meta">
                  <div className="event-period">{event.period}</div>
                  {event.location.country && (
                    <div className="event-location">
                      <span className="icon-location" />
                      <span>{event.location.country.nameFr}</span>
                    </div>
                  )}
                  <div className="event-categories">
                    {event.category.slice(0, 3).map((cat) => (
                      <span key={cat} className="category-tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to={`/timeline/${event._id}`}>
                  <Button variant="outline" size="small">
                    En savoir plus
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

