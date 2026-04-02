import { FileText, Download, ExternalLink, X } from 'lucide-react'
import { Button } from '../Button/Button'
import './MediaViewer.css'

interface DocumentViewerProps {
  url: string
  title: string
  description?: string
  type: 'docx' | 'doc' | 'xlsx' | 'xls' | 'pptx' | 'ppt' | 'txt' | 'other'
  onClose?: () => void
}

export const DocumentViewer = ({ url, title, description, type, onClose }: DocumentViewerProps) => {
  const getTypeIcon = () => {
    return <FileText size={20} />
  }

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      docx: 'Document Word',
      doc: 'Document Word',
      xlsx: 'Tableur Excel',
      xls: 'Tableur Excel',
      pptx: 'Présentation PowerPoint',
      ppt: 'Présentation PowerPoint',
      txt: 'Fichier texte',
      other: 'Document',
    }
    return labels[type] || 'Document'
  }

  const handleOpen = () => {
    // Pour les documents Office, utiliser Office Online Viewer ou Google Docs Viewer
    if (type === 'docx' || type === 'doc' || type === 'xlsx' || type === 'xls' || type === 'pptx' || type === 'ppt') {
      // Utiliser Google Docs Viewer
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
      window.open(viewerUrl, '_blank')
    } else {
      window.open(url, '_blank')
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="media-viewer-container document-viewer">
      <div className="media-viewer-header">
        <div className="media-viewer-title">
          {getTypeIcon()}
          <div>
            <h3>{title}</h3>
            <p className="document-type">{getTypeLabel()}</p>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="media-viewer-actions">
          <Button
            variant="outline"
            size="small"
            onClick={handleOpen}
            title="Ouvrir dans un viewer en ligne"
          >
            <ExternalLink size={16} />
            Ouvrir
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={handleDownload}
            title="Télécharger"
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
      <div className="document-preview">
        <div className="document-preview-content">
          <FileText size={64} />
          <p>Ce document ne peut pas être prévisualisé directement.</p>
          <p className="document-preview-hint">Cliquez sur "Ouvrir" pour le visualiser dans un viewer en ligne ou téléchargez-le.</p>
        </div>
      </div>
    </div>
  )
}

