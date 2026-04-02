import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { communityService } from '../services/api'
import './CreateCommunity.css'

export const CreateCommunity = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
      alert('Le nom et la description sont requis')
      return
    }

    setLoading(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await communityService.createCommunity({
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

      navigate(`/communities/${response.data._id}`)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la création de la communauté')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="create-community-page">
        <div className="create-community-header">
          <h1>Créer une communauté</h1>
          <p>Créez votre propre communauté pour partager votre culture et vos expériences</p>
        </div>

        <form onSubmit={handleSubmit} className="create-community-form">
          <div className="form-section">
            <h2>Informations de base</h2>
            
            <div className="form-group">
              <label htmlFor="name">Nom de la communauté *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Communauté Wolof"
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
                placeholder="Décrivez votre communauté..."
                rows={4}
                required
                maxLength={500}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type de communauté *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="public">Publique - Accessible à tous</option>
                  <option value="private">Privée - Sur invitation uniquement</option>
                </select>
                <p className="form-help">
                  {formData.type === 'public'
                    ? 'Tout le monde peut voir et rejoindre votre communauté'
                    : 'Seuls les membres invités peuvent accéder à votre communauté'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="culture">Culture (optionnel)</label>
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
          </div>

          <div className="form-section">
            <h2>Images</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image">Avatar (URL)</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="coverImage">Image de couverture (URL)</label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Tags</h2>
            <div className="form-group">
              <label htmlFor="tags">Tags (séparés par des virgules)</label>
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
            <h2>Paramètres</h2>
            
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
                <span>Nécessiter une approbation pour les posts</span>
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
              {loading ? 'Création...' : 'Créer la communauté'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

