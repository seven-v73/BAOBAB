import { useState } from 'react'
import { X } from 'lucide-react'
import { MediaUpload } from './MediaUpload'
import './PostForm.css'

interface PostFormProps {
  onSubmit: (data: { content: string; image?: string; video?: string; pdf?: string; tags?: string[]; category?: string }) => void
  onCancel: () => void
}

export const PostForm = ({ onSubmit, onCancel }: PostFormProps) => {
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [video, setVideo] = useState('')
  const [pdf, setPdf] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('Discussion')
  const [loading, setLoading] = useState(false)

  const categories = ['Discussion', 'Question', 'Partage', 'Événement', 'Autre']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      alert('Le contenu est requis')
      return
    }

    setLoading(true)
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await onSubmit({
        content: content.trim(),
        image: image.trim() || undefined,
        video: video.trim() || undefined,
        pdf: pdf.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        category: category || undefined,
      })

      // Reset form
      setContent('')
      setImage('')
      setVideo('')
      setPdf('')
      setTags('')
      setCategory('Discussion')
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="post-form-container">
      <div className="post-form">
        <div className="post-form-header">
          <h3>Nouveau Post</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenu *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez vos pensées..."
              rows={6}
              className="form-textarea"
              required
            />
          </div>

          <MediaUpload
            type="image"
            value={image}
            onChange={setImage}
            label="Image (optionnel)"
          />

          <MediaUpload
            type="video"
            value={video}
            onChange={setVideo}
            label="Vidéo (optionnel)"
          />

          <MediaUpload
            type="pdf"
            value={pdf}
            onChange={setPdf}
            label="PDF (optionnel)"
          />

          <div className="form-group">
            <label htmlFor="tags">Tags (séparés par des virgules)</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

