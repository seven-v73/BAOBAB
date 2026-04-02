import { useState, useEffect } from 'react'
import { Play, Download, X } from 'lucide-react'
import { Button } from '../Button/Button'
import './MediaViewer.css'

interface VideoViewerProps {
  url: string
  title: string
  description?: string
  type?: 'youtube' | 'vimeo' | 'direct' | 'other'
  thumbnail?: string
  onClose?: () => void
}

export const VideoViewer = ({ url, title, description, type = 'direct', thumbnail, onClose }: VideoViewerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    if (type === 'youtube') {
      // Extraire l'ID de la vidéo YouTube
      const youtubeId = extractYouTubeId(url)
      if (youtubeId) {
        setVideoUrl(`https://www.youtube.com/embed/${youtubeId}`)
      } else {
        setVideoUrl(url)
      }
    } else if (type === 'vimeo') {
      // Extraire l'ID de la vidéo Vimeo
      const vimeoId = extractVimeoId(url)
      if (vimeoId) {
        setVideoUrl(`https://player.vimeo.com/video/${vimeoId}`)
      } else {
        setVideoUrl(url)
      }
    } else {
      setVideoUrl(url)
    }
  }, [url, type])

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const extractVimeoId = (url: string): string | null => {
    const regExp = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const handleDownload = () => {
    if (type === 'direct') {
      const link = document.createElement('a')
      link.href = url
      link.download = title
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      window.open(url, '_blank')
    }
  }

  if (!isPlaying && (type === 'youtube' || type === 'vimeo')) {
    return (
      <div className="media-viewer-container video-viewer">
        <div className="video-thumbnail-container">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="video-thumbnail" />
          ) : (
            <div className="video-thumbnail-placeholder">
              <Play size={64} />
            </div>
          )}
          <div className="video-thumbnail-overlay">
            <div className="video-info">
              <h3>{title}</h3>
              {description && <p>{description}</p>}
            </div>
            <Button
              onClick={() => setIsPlaying(true)}
              size="large"
              className="play-button"
            >
              <Play size={24} />
              Lire la vidéo
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="small"
                onClick={onClose}
                className="close-button"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="media-viewer-container video-viewer">
      <div className="media-viewer-header">
        <div className="media-viewer-title">
          <Play size={20} />
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="media-viewer-actions">
          <Button
            variant="outline"
            size="small"
            onClick={handleDownload}
            title="Ouvrir dans un nouvel onglet"
          >
            <Download size={16} />
          </Button>
          {onClose && (
            <Button
              variant="outline"
              size="small"
              onClick={onClose}
              title="Fermer"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="media-viewer-content">
        <div className="video-wrapper">
          <iframe
            src={videoUrl}
            title={title}
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

