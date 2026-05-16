import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { userService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { Calendar, Shield, Search, Edit, Trash2, User, Ban, CheckCircle } from 'lucide-react'
import './AdminUsers.css'

interface UserData {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  phone?: string
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    phone: '',
  })
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (roleFilter !== 'all') params.role = roleFilter

      const response = await userService.getAll(params)
      setUsers(response.data.users || response.data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      showError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, roleFilter])

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await userService.update(editingUser._id, formData)
        success('Utilisateur mis à jour avec succès !')
      }
      resetForm()
      fetchUsers()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde'
      showError(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Désactiver cet utilisateur ?',
      message: 'Son accès sera suspendu jusqu’à réactivation.',
      confirmLabel: 'Désactiver',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await userService.delete(id)
      success('Utilisateur désactivé avec succès !')
      fetchUsers()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    try {
      await userService.update(user._id, { isActive: !user.isActive })
      success(`Utilisateur ${user.isActive ? 'désactivé' : 'activé'} avec succès !`)
      fetchUsers()
    } catch (error: any) {
      showError('Erreur lors de la modification')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      phone: '',
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const activeUsers = users.filter(u => u.isActive).length
  const totalUsers = users.length

  if (loading) {
    return <div className="admin-loading">Chargement des utilisateurs...</div>
  }

  return (
    <div className="admin-users">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des Utilisateurs</h2>
          <p>Gérez les utilisateurs de la plateforme</p>
        </div>
        <div className="users-stats">
          <div className="stat-item">
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{activeUsers}</span>
            <span className="stat-label">Actifs</span>
          </div>
        </div>
      </div>

      <div className="users-filters">
        <div className="search-bar">
          <Search size={20} />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <Button
            size="small"
            variant={roleFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setRoleFilter('all')}
          >
            Tous
          </Button>
          <Button
            size="small"
            variant={roleFilter === 'user' ? 'primary' : 'outline'}
            onClick={() => setRoleFilter('user')}
          >
            Utilisateurs
          </Button>
          <Button
            size="small"
            variant={roleFilter === 'admin' ? 'primary' : 'outline'}
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </Button>
        </div>
      </div>

      {showForm && editingUser && (
        <Card className="user-form-card">
          <h3>Modifier {editingUser.name}</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <Input
              label="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled
              autoComplete="email"
            />
            <div className="form-group">
              <label htmlFor="user-role" className="input-label">Rôle</label>
              <select
                id="user-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              autoComplete="tel"
            />
            <div className="form-actions">
              <Button type="submit">Enregistrer</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <Card className="empty-state">
            <User size={48} />
            <p>Aucun utilisateur trouvé.</p>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user._id} className="user-card-admin">
              <div className="user-header">
                <div className="user-avatar" style={{
                  background: user.role === 'admin' 
                    ? 'linear-gradient(135deg, #d4af37, #f4d03f)'
                    : 'linear-gradient(135deg, #3498db, #2980b9)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="user-details">
                <div className="user-detail-item">
                  <Shield size={16} />
                  <span className={user.role === 'admin' ? 'role-admin' : 'role-user'}>
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
                <div className="user-detail-item">
                  <Calendar size={16} />
                  <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? (
                    <>
                      <CheckCircle size={14} />
                      Actif
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      Inactif
                    </>
                  )}
                </div>
              </div>
              <div className="user-actions">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleEdit(user)}
                >
                  <Edit size={16} />
                  Modifier
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleToggleActive(user)}
                >
                  {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                  {user.isActive ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleDelete(user._id)}
                >
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {Dialog}
    </div>
  )
}
