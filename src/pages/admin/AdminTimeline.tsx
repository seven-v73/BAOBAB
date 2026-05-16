import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { timelineService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { Plus, Edit, Trash2, Search, Calendar, MapPin, CheckCircle } from 'lucide-react'
import './AdminTimeline.css'

interface TimelineEvent {
  _id: string
  title: string
  description: string
  date: string
  period: string
  location: {
    country?: {
      nameFr: string
    }
  }
  category: string[]
  verified: boolean
}

export const AdminTimeline = () => {
  const { success, showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    period: '',
    category: [] as string[],
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await timelineService.getAll({ limit: 100 })
      setEvents(response.data.events || [])
    } catch (error) {
      showError('Erreur lors du chargement des événements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        await timelineService.update(editingEvent._id, formData)
        success('Événement mis à jour avec succès')
      } else {
        await timelineService.create(formData)
        success('Événement créé avec succès')
      }
      setShowForm(false)
      setEditingEvent(null)
      resetForm()
      fetchEvents()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Supprimer cet événement ?',
      message: 'L’événement sera retiré de la chronologie.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await timelineService.delete(id)
      success('Événement supprimé avec succès')
      fetchEvents()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      period: event.period,
      category: event.category,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      period: '',
      category: [],
    })
  }

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-timeline">
      <div className="admin-section-header">
        <div>
          <h2>Gestion de la Chronologie</h2>
          <p>Créez et gérez les événements historiques</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingEvent(null)
          resetForm()
        }}>
          <Plus size={20} />
          Nouvel événement
        </Button>
      </div>

      {showForm && (
        <Card className="form-card">
          <h3>{editingEvent ? 'Modifier' : 'Créer'} un événement</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                className="form-textarea"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Période *</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Sélectionner</option>
                  <option value="Préhistoire">Préhistoire</option>
                  <option value="Antiquité">Antiquité</option>
                  <option value="Moyen-Âge">Moyen-Âge</option>
                  <option value="Période Moderne">Période Moderne</option>
                  <option value="Époque Contemporaine">Époque Contemporaine</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit">{editingEvent ? 'Mettre à jour' : 'Créer'}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingEvent(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="admin-search">
        <Search size={20} />
        <Input
          placeholder="Rechercher un événement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Chargement...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Date</th>
                <th>Période</th>
                <th>Localisation</th>
                <th>Vérifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>
                    <div className="table-cell-with-icon">
                      <Calendar size={16} />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td>{event.period}</td>
                  <td>
                    {event.location.country ? (
                      <div className="table-cell-with-icon">
                        <MapPin size={16} />
                        {event.location.country.nameFr}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {event.verified ? (
                      <span className="verified-badge">
                        <CheckCircle size={16} />
                        Vérifié
                      </span>
                    ) : (
                      <span className="not-verified">Non vérifié</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="admin-empty">
              <p>Aucun événement trouvé</p>
            </div>
          )}
        </div>
      )}
      {Dialog}
    </div>
  )
}
