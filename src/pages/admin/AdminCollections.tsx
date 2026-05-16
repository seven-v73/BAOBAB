import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { collectionService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { Plus, Edit, Trash2, Search, FolderOpen, Clock, Star } from 'lucide-react'
import './AdminCollections.css'

interface Collection {
  _id: string
  title: string
  description: string
  theme: string[]
  difficulty: string
  estimatedTime: number
  views: number
  isFeatured: boolean
}

export const AdminCollections = () => {
  const { success, showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: [] as string[],
    difficulty: 'beginner',
    estimatedTime: 0,
  })

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await collectionService.getAll({ limit: 100 })
      setCollections(response.data.collections || [])
    } catch (error) {
      showError('Erreur lors du chargement des collections')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCollection) {
        await collectionService.update(editingCollection._id, formData)
        success('Collection mise à jour avec succès')
      } else {
        await collectionService.create(formData)
        success('Collection créée avec succès')
      }
      setShowForm(false)
      setEditingCollection(null)
      resetForm()
      fetchCollections()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Supprimer cette collection ?',
      message: 'La collection ne sera plus visible dans les parcours.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await collectionService.delete(id)
      success('Collection supprimée avec succès')
      fetchCollections()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
    setFormData({
      title: collection.title,
      description: collection.description,
      theme: collection.theme || [],
      difficulty: collection.difficulty,
      estimatedTime: collection.estimatedTime || 0,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      theme: [],
      difficulty: 'beginner',
      estimatedTime: 0,
    })
  }

  const filteredCollections = collections.filter((collection) =>
    collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-collections">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des Collections</h2>
          <p>Créez et gérez les collections thématiques</p>
        </div>
        <Button onClick={() => {
          setShowForm(true)
          setEditingCollection(null)
          resetForm()
        }}>
          <Plus size={20} />
          Nouvelle collection
        </Button>
      </div>

      {showForm && (
        <Card className="form-card">
          <h3>{editingCollection ? 'Modifier' : 'Créer'} une collection</h3>
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
                <label>Difficulté *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
              <div className="form-group">
                <label>Temps estimé (minutes)</label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit">{editingCollection ? 'Mettre à jour' : 'Créer'}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingCollection(null)
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
          placeholder="Rechercher une collection..."
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
                <th>Thèmes</th>
                <th>Difficulté</th>
                <th>Temps</th>
                <th>Vues</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection._id}>
                  <td>
                    <div className="table-cell-with-icon">
                      <FolderOpen size={16} />
                      {collection.title}
                    </div>
                  </td>
                  <td>
                    <div className="theme-tags">
                      {collection.theme.slice(0, 2).map((theme) => (
                        <span key={theme} className="theme-tag">{theme}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`difficulty-badge ${collection.difficulty}`}>
                      {collection.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className="table-cell-with-icon">
                      <Clock size={16} />
                      {collection.estimatedTime} min
                    </div>
                  </td>
                  <td>{collection.views}</td>
                  <td>
                    {collection.isFeatured ? (
                      <span className="featured-badge">
                        <Star size={16} />
                        Featured
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleEdit(collection)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleDelete(collection._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCollections.length === 0 && (
            <div className="admin-empty">
              <p>Aucune collection trouvée</p>
            </div>
          )}
        </div>
      )}
      {Dialog}
    </div>
  )
}
