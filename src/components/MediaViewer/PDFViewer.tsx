import { useState, useEffect } from 'react'
import { FileText, Download, X, Maximize2, Minimize2, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '../Button/Button'
import './MediaViewer.css'

interface PDFViewerProps {
  url: string
  title: string
  description?: string
  onClose?: () => void
}

export const PDFViewer = ({ url, title, description, onClose }: PDFViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Vérifier si l'URL est valide
  useEffect(() => {
    setLoading(true)
    setError(null)
    setUseFallback(false)

    if (!url || url.trim() === '') {
      setError('URL du PDF invalide')
      setLoading(false)
      return
    }

    // Vérifier si c'est une URL valide
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      setError('URL du PDF invalide')
      setLoading(false)
      return
    }

    // Vérifier si l'URL pointe vers localhost (problème courant)
    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === '0.0.0.0') {
      setError('L\'URL du PDF pointe vers localhost et ne peut pas être chargée dans l\'iframe. Veuillez utiliser le bouton "Ouvrir dans un nouvel onglet" pour le visualiser ou télécharger le document.')
      setUseFallback(true)
      setLoading(false)
      return
    }

    // Vérifier si c'est une URL relative ou file:// (doit être convertie en URL absolue)
    if (!parsedUrl.protocol || parsedUrl.protocol === 'file:') {
      setError('URL du PDF invalide ou locale. Veuillez utiliser une URL publique (http:// ou https://).')
      setUseFallback(true)
      setLoading(false)
      return
    }

    // Vérifier que c'est bien http ou https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      setError('Le protocole de l\'URL n\'est pas supporté. Veuillez utiliser une URL http:// ou https://.')
      setUseFallback(true)
      setLoading(false)
      return
    }

    // Timeout pour détecter si le PDF ne charge pas
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Le PDF prend trop de temps à charger. Utilisez le bouton "Ouvrir dans un nouvel onglet" pour le visualiser.')
        setUseFallback(true)
        setLoading(false)
      }
    }, 10000) // 10 secondes

    return () => clearTimeout(timeout)
  }, [url])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleIframeError = () => {
    setError('Impossible de charger le PDF dans l\'iframe. Cela peut être dû à des restrictions CORS, une URL invalide, ou une connexion refusée. Utilisez le bouton "Ouvrir dans un nouvel onglet" pour le visualiser.')
    setUseFallback(true)
    setLoading(false)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const viewer = document.getElementById(`pdf-viewer-${title}`)
      if (viewer?.requestFullscreen) {
        viewer.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="media-viewer-container pdf-viewer" id={`pdf-viewer-${title}`}>
      <div className="media-viewer-header">
        <div className="media-viewer-title">
          <FileText size={20} />
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="media-viewer-actions">
          <Button
            variant="outline"
            size="small"
            onClick={handleOpenInNewTab}
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={16} />
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={handleDownload}
            title="Télécharger"
          >
            <Download size={16} />
          </Button>
          {!useFallback && (
            <Button
              variant="outline"
              size="small"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          )}
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
        {loading && !error && (
          <div className="media-loading">
            <FileText size={48} className="spinning" />
            <p>Chargement du document...</p>
          </div>
        )}
        {error && (
          <div className="media-error">
            <AlertCircle size={48} />
            <p>{error}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
              <Button onClick={handleOpenInNewTab} variant="outline">
                <ExternalLink size={16} />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download size={16} />
                Télécharger
              </Button>
            </div>
          </div>
        )}
        {!error && !useFallback && (
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            title={title}
            className="pdf-iframe"
            onLoad={() => {
              setLoading(false)
              setError(null)
            }}
            onError={handleIframeError}
            style={{ display: loading ? 'none' : 'block' }}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
        {useFallback && !error && (
          <div className="media-fallback">
            <FileText size={64} />
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button onClick={handleOpenInNewTab}>
                <ExternalLink size={16} />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download size={16} />
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

