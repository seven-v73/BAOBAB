import { useEffect, useState } from 'react'
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Video, FileText, File } from 'lucide-react'
import { FileUpload } from '../FileUpload/FileUpload'
import './MediaUpload.css'

interface MediaUploadProps {
  type: 'image' | 'video' | 'pdf' | 'document'
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
}

export const MediaUpload = ({ type, value, onChange, onRemove, label }: MediaUploadProps) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState(value || '')

  useEffect(() => {
    setUrl(value || '')
  }, [value])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    onChange(newUrl)
  }

  const handleUploadSuccess = (uploadedUrl: string) => {
    onChange(uploadedUrl)
    setUrl(uploadedUrl)
  }

  const handleRemove = () => {
    setUrl('')
    onChange('')
    if (onRemove) onRemove()
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'image': return 'Image'
      case 'video': return 'Vidéo'
      case 'pdf': return 'PDF'
      case 'document': return 'Document'
      default: return 'Fichier'
    }
  }

  const getAcceptTypes = () => {
    switch (type) {
      case 'image': return 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
      case 'video': return 'video/mp4,video/webm,video/ogg'
      case 'pdf': return 'application/pdf'
      case 'document': return '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp'
      default: return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon size={20} />
      case 'video': return <Video size={20} />
      case 'pdf': return <FileText size={20} />
      case 'document': return <File size={20} />
      default: return <File size={20} />
    }
  }

  return (
    <div className="media-upload">
      <div className="media-upload-header">
        <label>{label || `${getTypeLabel()} (optionnel)`}</label>
        {value && (
          <button type="button" className="remove-btn" onClick={handleRemove}>
            <X size={16} />
            Supprimer
          </button>
        )}
      </div>

      {value ? (
        <div className="media-preview">
          {type === 'image' ? (
            <img src={value} alt="Preview" className="preview-image" />
          ) : (
            <div className="preview-file">
              {getIcon()}
              <span>{getTypeLabel()} ajouté</span>
              <a href={value} target="_blank" rel="noopener noreferrer" className="preview-link">
                Voir le fichier
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="media-mode-selector">
            <button
              type="button"
              className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              <Upload size={18} />
              Uploader depuis l'ordinateur
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'url' ? 'active' : ''}`}
              onClick={() => setMode('url')}
            >
              <LinkIcon size={18} />
              Ajouter via URL
            </button>
          </div>

          {mode === 'upload' ? (
            <FileUpload
              type={type === 'pdf' ? 'pdf' : type === 'video' ? 'video' : type === 'image' ? 'image' : 'document'}
              onUploadSuccess={handleUploadSuccess}
              accept={getAcceptTypes()}
              label={`Uploader un ${getTypeLabel().toLowerCase()}`}
            />
          ) : (
            <div className="url-input-group">
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder={`https://example.com/${type === 'image' ? 'image.jpg' : type === 'video' ? 'video.mp4' : 'file.pdf'}`}
                className="url-input"
              />
              {url && (
                <button
                  type="button"
                  className="validate-url-btn"
                  onClick={() => onChange(url)}
                >
                  Valider
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
