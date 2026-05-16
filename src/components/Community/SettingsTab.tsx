import { useState } from 'react'
import { Trash2, Save, AlertTriangle } from 'lucide-react'
import { communityService } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { MediaUpload } from './MediaUpload'
import './SettingsTab.css'

interface Community {
  _id: string
  name: string
  description: string
  type: 'public' | 'private'
  culture: string
  image: string
  coverImage: string
  tags: string[]
  settings: {
    allowMemberPosts: boolean
    requireApproval: boolean
    allowInvitations: boolean
  }
}

interface SettingsTabProps {
  community: Community
  isOwner: boolean
  canManageSettings: boolean
  onUpdate: () => void
}

export const SettingsTab = ({ community, isOwner, canManageSettings, onUpdate }: SettingsTabProps) => {
  const navigate = useNavigate()
  const { success, error: showError, warning } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    type: community.type,
    culture: community.culture || '',
    image: community.image || '',
    coverImage: community.coverImage || '',
    tags: community.tags.join(', '),
    settings: {
      allowMemberPosts: community.settings.allowMemberPosts,
      requireApproval: community.settings.requireApproval,
      allowInvitations: community.settings.allowInvitations,
    },
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await communityService.updateCommunity(community._id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        culture: formData.culture,
        image: formData.image,
        coverImage: formData.coverImage,
        tags: tagsArray,
        settings: formData.settings,
      })

      success('Paramètres mis à jour.')
      onUpdate()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== community.name) {
      warning('Le nom saisi ne correspond pas.')
      return
    }

    try {
      setLoading(true)
      await communityService.deleteCommunity(community._id)
      success('Communauté supprimée.')
      navigate('/communities')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!canManageSettings) {
    return (
      <div className="settings-tab">
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>Seuls le propriétaire et les administrateurs peuvent modifier les paramètres</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-tab">
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3>Informations générales</h3>
          <div className="form-group">
            <label>Nom de la communauté *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              maxLength={500}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Type de communauté</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'public' | 'private' })}
            >
              <option value="public">Publique</option>
              <option value="private">Privée</option>
            </select>
          </div>

          <div className="form-group">
            <label>Culture (optionnel)</label>
            <input
              type="text"
              value={formData.culture}
              onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
              placeholder="Ex: Bénin, Togo, etc."
            />
          </div>

          <div className="form-group">
            <label>Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Ex: culture, tradition, art"
            />
          </div>

          <div className="settings-media-grid">
            <MediaUpload
              type="image"
              value={formData.image}
              label="Avatar du groupe"
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: '' })}
            />

            <MediaUpload
              type="image"
              value={formData.coverImage}
              label="Image de couverture"
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              onRemove={() => setFormData({ ...formData, coverImage: '' })}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Paramètres de publication</h3>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.allowMemberPosts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowMemberPosts: e.target.checked },
                  })
                }
              />
              <span>Autoriser les membres à publier</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.requireApproval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, requireApproval: e.target.checked },
                  })
                }
              />
              <span>Exiger l'approbation pour les publications</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.settings.allowInvitations}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    settings: { ...formData.settings, allowInvitations: e.target.checked },
                  })
                }
              />
              <span>Autoriser les invitations</span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {isOwner && (
        <div className="settings-section danger-zone">
          <h3>Zone dangereuse</h3>
          <div className="danger-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} />
              Supprimer la communauté
            </button>
          </div>

        {showDeleteConfirm && (
          <div className="delete-confirm">
            <AlertTriangle size={24} className="warning-icon" />
            <p>
              <strong>Attention !</strong> Cette action est irréversible. Tous les posts, membres et
              données associées seront supprimés.
            </p>
            <p>Pour confirmer, tapez le nom de la communauté :</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={community.name}
              className="delete-input"
            />
            <div className="delete-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteConfirmText !== community.name || loading}
              >
                Supprimer définitivement
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  )
}
