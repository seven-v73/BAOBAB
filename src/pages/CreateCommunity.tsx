import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { communityService } from '../services/api'
import { MediaUpload } from '../components/Community/MediaUpload'
import { Breadcrumbs } from '../components/UX/Breadcrumbs'
import { useNotifications } from '../hooks/useNotifications'
import './CreateCommunity.css'

export const CreateCommunity = () => {
  const navigate = useNavigate()
  const { success, error: showError, warning } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    culture: '',
    image: '',
    coverImage: '',
    tags: '',
    allowMemberPosts: true,
    requireApproval: false,
    allowInvitations: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.description.trim()) {
      warning('Ajoutez un nom et une description avant d’envoyer la demande.')
      return
    }

    setLoading(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await communityService.createCommunityRequest({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        culture: formData.culture.trim() || undefined,
        image: formData.image.trim() || undefined,
        coverImage: formData.coverImage.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        settings: {
          allowMemberPosts: formData.allowMemberPosts,
          requireApproval: formData.requireApproval,
          allowInvitations: formData.allowInvitations,
        },
      })

      success('Votre demande a été envoyée à l’administration.')
      navigate('/communities')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de l’envoi de la demande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="create-community-page">
        <Breadcrumbs items={[{ label: 'Communautés', to: '/communities' }, { label: 'Proposer un groupe' }]} />
        <div className="create-community-header">
          <h1>Proposer un groupe</h1>
          <p>Décrivez le cercle que vous souhaitez ouvrir. L’administration vérifie la demande avant publication pour garder un espace clair, utile et respectueux.</p>
        </div>

        <form onSubmit={handleSubmit} className="create-community-form">
          <div className="form-section">
            <h2>L'essentiel</h2>
            
            <div className="form-group">
              <label htmlFor="name">Nom du groupe *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cercle Wolof"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Expliquez le sujet, les personnes concernées et ce que ce groupe apportera..."
                rows={4}
                required
                maxLength={500}
              />
            </div>
          </div>

          <button
            type="button"
            className={`advanced-toggle ${showAdvanced ? 'open' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? 'Masquer les détails' : 'Ajouter des détails optionnels'}</span>
            <small>Images, tags, visibilité et règles du groupe</small>
          </button>

          {showAdvanced && (
            <>
              <div className="form-section">
                <h2>Repères</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Visibilité souhaitée</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="public">Publique - visible et accessible à tous</option>
                  <option value="private">Privée - sur invitation uniquement</option>
                </select>
                <p className="form-help">
                  {formData.type === 'public'
                    ? 'Tout le monde pourra voir et rejoindre ce groupe après validation.'
                    : 'Seuls les membres invités pourront accéder à ce groupe après validation.'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="culture">Culture</label>
                <input
                  type="text"
                  id="culture"
                  name="culture"
                  value={formData.culture}
                  onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                  placeholder="Ex: Wolof, Bambara, Peul..."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="culture, tradition, langue..."
              />
            </div>
              </div>

              <div className="form-section">
                <h2>Images</h2>
            
            <div className="form-row">
              <div className="form-group">
                <MediaUpload
                  type="image"
                  value={formData.image}
                  label="Avatar du groupe"
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                />
              </div>

              <div className="form-group">
                <MediaUpload
                  type="image"
                  value={formData.coverImage}
                  label="Image de couverture"
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                  onRemove={() => setFormData({ ...formData, coverImage: '' })}
                />
              </div>
            </div>
              </div>

              <div className="form-section">
                <h2>Fonctionnement souhaité</h2>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  id="allowMemberPosts"
                  name="allowMemberPosts"
                  checked={formData.allowMemberPosts}
                  onChange={(e) => setFormData({ ...formData, allowMemberPosts: e.target.checked })}
                />
                <span>Permettre aux membres de publier</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  id="requireApproval"
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                />
                <span>Valider les publications avant affichage</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  id="allowInvitations"
                  name="allowInvitations"
                  checked={formData.allowInvitations}
                  onChange={(e) => setFormData({ ...formData, allowInvitations: e.target.checked })}
                />
                <span>Permettre les invitations</span>
              </label>
            </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/communities')}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
