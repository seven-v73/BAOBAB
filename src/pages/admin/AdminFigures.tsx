import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { figureService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { Plus, Edit, Trash2, Search, User, Calendar, MapPin, CheckCircle } from 'lucide-react'
import './AdminFigures.css'

interface HistoricalFigure {
  _id: string
  name: string
  nameNative: string
  birthDate?: string
  deathDate?: string
  role: string[]
  verified: boolean
  birthPlace: {
    country?: {
      nameFr: string
    }
  }
}

export const AdminFigures = () => {
  const { success, showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [figures, setFigures] = useState<HistoricalFigure[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFigure, setEditingFigure] = useState<HistoricalFigure | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameNative: '',
    birthDate: '',
    deathDate: '',
    role: [] as string[],
    biography: '',
  })

  useEffect(() => {
    fetchFigures()
  }, [])

  const fetchFigures = async () => {
    try {
      setLoading(true)
      const response = await figureService.getAll({ limit: 100 })
      setFigures(response.data.figures || [])
    } catch (error) {
      showError('Erreur lors du chargement des figures')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingFigure) {
        await figureService.update(editingFigure._id, formData)
        success('Figure mise à jour avec succès')
      } else {
        await figureService.create(formData)
        success('Figure créée avec succès')
      }
      setShowForm(false)
      setEditingFigure(null)
      resetForm()
      fetchFigures()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Supprimer cette figure ?',
      message: 'La fiche ne sera plus visible dans la découverte historique.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await figureService.delete(id)
      success('Figure supprimée avec succès')
      fetchFigures()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (figure: HistoricalFigure) => {
    setEditingFigure(figure)
    setFormData({
      name: figure.name,
      nameNative: figure.nameNative || '',
      birthDate: figure.birthDate ? figure.birthDate.split('T')[0] : '',
      deathDate: figure.deathDate ? figure.deathDate.split('T')[0] : '',
      role: figure.role || [],
      biography: '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameNative: '',
      birthDate: '',
      deathDate: '',
      role: [],
      biography: '',
    })
  }

  const filteredFigures = figures.filter((figure) =>
    figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    figure.nameNative.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-figures">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des Personnages Historiques</h2>
          <p>Créez et gérez les figures historiques africaines</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingFigure(null)
          resetForm()
        }}>
          <Plus size={20} />
          Nouvelle figure
        </Button>
      </div>

      {showForm && (
        <Card className="form-card">
          <h3>{editingFigure ? 'Modifier' : 'Créer'} une figure</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom natif</label>
                <Input
                  value={formData.nameNative}
                  onChange={(e) => setFormData({ ...formData, nameNative: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date de naissance</label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date de décès</label>
                <Input
                  type="date"
                  value={formData.deathDate}
                  onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Biographie *</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                required
                rows={5}
                className="form-textarea"
              />
            </div>
            <div className="form-actions">
              <Button type="submit">{editingFigure ? 'Mettre à jour' : 'Créer'}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingFigure(null)
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
          placeholder="Rechercher une figure..."
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
                <th>Nom</th>
                <th>Nom natif</th>
                <th>Dates</th>
                <th>Rôles</th>
                <th>Vérifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFigures.map((figure) => (
                <tr key={figure._id}>
                  <td>
                    <div className="table-cell-with-icon">
                      <User size={16} />
                      {figure.name}
                    </div>
                  </td>
                  <td>{figure.nameNative || '-'}</td>
                  <td>
                    <div className="table-cell-with-icon">
                      <Calendar size={16} />
                      {figure.birthDate ? new Date(figure.birthDate).getFullYear() : '?'}
                      {figure.deathDate && ` - ${new Date(figure.deathDate).getFullYear()}`}
                    </div>
                  </td>
                  <td>
                    <div className="role-tags">
                      {figure.role.slice(0, 2).map((role) => (
                        <span key={role} className="role-tag">{role}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {figure.verified ? (
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
                        onClick={() => handleEdit(figure)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleDelete(figure._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFigures.length === 0 && (
            <div className="admin-empty">
              <p>Aucune figure trouvée</p>
            </div>
          )}
        </div>
      )}
      {Dialog}
    </div>
  )
}
