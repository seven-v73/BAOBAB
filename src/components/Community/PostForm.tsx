import { useState } from 'react'
import { FileText, Hash, Image, Paperclip, Send, User, Video, X } from 'lucide-react'
import { MediaUpload } from './MediaUpload'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuthStore } from '../../stores/authStore'
import './PostForm.css'

interface PostFormProps {
  onSubmit: (data: { content: string; image?: string; video?: string; pdf?: string; tags?: string[]; category?: string }) => void
  onCancel?: () => void
  placeholder?: string
}

export const PostForm = ({ onSubmit, onCancel, placeholder = 'Écrire un message...' }: PostFormProps) => {
  const { user } = useAuthStore()
  const { warning } = useNotifications()
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [video, setVideo] = useState('')
  const [pdf, setPdf] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('Discussion')
  const [loading, setLoading] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [showTags, setShowTags] = useState(false)

  const categories = ['Discussion', 'Question', 'Partage', 'Événement', 'Autre']
  const hasMedia = Boolean(image || video || pdf)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      warning('Ajoutez un contenu avant de publier.')
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
      setShowTools(false)
      setShowTags(false)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const handleCancel = () => {
    setContent('')
    setImage('')
    setVideo('')
    setPdf('')
    setTags('')
    setShowTools(false)
    setShowTags(false)
    onCancel?.()
  }

  return (
    <div className="post-composer" aria-label="Composer un message communautaire">
      <div className="post-composer-avatar" aria-hidden="true">
        {user?.avatar ? (
          <img src={user.avatar} alt="" />
        ) : (
          <User size={18} />
        )}
      </div>

      <form onSubmit={handleSubmit} className="post-composer-form">
        <div className="post-composer-main">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="post-composer-input"
            disabled={loading}
            aria-label="Message"
          />

          <div className="post-composer-actions">
            <button
              type="button"
              className={`composer-icon-btn ${showTools || hasMedia ? 'active' : ''}`}
              onClick={() => setShowTools(!showTools)}
              title="Ajouter un média"
              aria-label="Ajouter un média"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              className={`composer-icon-btn ${showTags ? 'active' : ''}`}
              onClick={() => setShowTags(!showTags)}
              title="Ajouter des tags"
              aria-label="Ajouter des tags"
            >
              <Hash size={18} />
            </button>
            {(content || hasMedia || tags) && (
              <button
                type="button"
                className="composer-icon-btn"
                onClick={handleCancel}
                title="Effacer"
                aria-label="Effacer"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              className="composer-send-btn"
              disabled={loading || !content.trim()}
              title="Envoyer"
              aria-label="Envoyer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="post-composer-meta">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`composer-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {showTags && (
          <div className="post-composer-tags">
            <Hash size={16} />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="culture, langue, souvenir..."
              aria-label="Tags séparés par des virgules"
            />
          </div>
        )}

        {showTools && (
          <div className="post-composer-tools">
            <div className="composer-tool-title">
              <Paperclip size={16} />
              <span>Ajouter une pièce jointe</span>
            </div>
            <div className="composer-media-grid">
              <div className="composer-media-item">
                <div className="composer-media-label"><Image size={16} /> Image</div>
                <MediaUpload type="image" value={image} onChange={setImage} onRemove={() => setImage('')} label="Image" />
              </div>
              <div className="composer-media-item">
                <div className="composer-media-label"><Video size={16} /> Vidéo</div>
                <MediaUpload type="video" value={video} onChange={setVideo} onRemove={() => setVideo('')} label="Vidéo" />
              </div>
              <div className="composer-media-item">
                <div className="composer-media-label"><FileText size={16} /> PDF</div>
                <MediaUpload type="pdf" value={pdf} onChange={setPdf} onRemove={() => setPdf('')} label="PDF" />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
