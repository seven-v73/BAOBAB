import { useId, useState, useRef } from 'react'
import type { DragEvent } from 'react'
import { X, Image as ImageIcon, FileText, Loader, Video, File as FileIcon } from 'lucide-react'
import { uploadService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import './FileUpload.css'

interface FileUploadProps {
  type: 'image' | 'pdf' | 'video' | 'document'
  onUploadSuccess: (url: string) => void
  accept?: string
  maxSize?: number // en MB
  label?: string
}

export const FileUpload = ({ 
  type, 
  onUploadSuccess, 
  accept,
  maxSize = type === 'image' ? 5 : type === 'pdf' ? 10 : type === 'video' ? 50 : 20,
  label
}: FileUploadProps) => {
  const reactId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useNotifications()
  
  // Générer un ID unique pour l'input
  const inputId = `file-upload-${type}-${reactId.replace(/:/g, '')}`

  const handleFileSelect = async (file: File) => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      error(`Le fichier est trop volumineux. Taille maximale : ${maxSize}MB`)
      return
    }

    // Vérifier le type
    if (type === 'image') {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!imageTypes.includes(file.type)) {
        error('Format d\'image non supporté. Utilisez JPEG, PNG, GIF ou WebP.')
        return
      }
    } else if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        error('Format de fichier non supporté. Utilisez un fichier PDF.')
        return
      }
    } else if (type === 'video') {
      const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
      if (!videoTypes.includes(file.type)) {
        error('Format de vidéo non supporté. Utilisez MP4, WebM, OGG, MOV ou AVI.')
        return
      }
    } else if (type === 'document') {
      const documentTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.presentation'
      ]
      if (!documentTypes.includes(file.type)) {
        error('Format de document non supporté. Utilisez DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, ODS ou ODP.')
        return
      }
    }

    // Aperçu pour les images et vidéos
    if (type === 'image' || type === 'video') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Upload
    setUploading(true)
    try {
      let response
      if (type === 'image') {
        response = await uploadService.uploadImage(file)
      } else if (type === 'pdf') {
        response = await uploadService.uploadPDF(file)
      } else if (type === 'video') {
        response = await uploadService.uploadVideo(file)
      } else {
        response = await uploadService.uploadDocument(file)
      }
      
      const url = response.data.url
      
      if (!url) {
        throw new Error('Aucune URL retournée par le serveur')
      }
      
      onUploadSuccess(url)
      const typeNames = {
        image: 'Image',
        pdf: 'PDF',
        video: 'Vidéo',
        document: 'Document'
      }
      success(`${typeNames[type]} uploadé avec succès !`)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de l\'upload'
      error(errorMessage)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="file-upload-container">
      {label && <label htmlFor={inputId} className="file-upload-label">{label}</label>}
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={`Zone de dépôt pour ${type === 'image' ? 'une image' : type === 'pdf' ? 'un PDF' : type === 'video' ? 'une vidéo' : 'un document'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (fileInputRef.current && !uploading) {
              fileInputRef.current.click()
            }
          }
        }}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          name={type === 'image' ? 'image' : type === 'pdf' ? 'pdf' : type === 'video' ? 'video' : 'document'}
          type="file"
          accept={accept || (type === 'image' ? 'image/*' : type === 'pdf' ? 'application/pdf' : type === 'video' ? 'video/*' : '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp')}
          onChange={handleFileInputChange}
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10,
          }}
          disabled={uploading}
          aria-label={`Sélectionner un ${type === 'image' ? 'fichier image' : type === 'pdf' ? 'fichier PDF' : type === 'video' ? 'fichier vidéo' : 'fichier document'}`}
          onClick={(e) => {
            // Permettre le clic direct sur l'input
            e.stopPropagation()
          }}
        />
        
        {uploading ? (
          <div className="file-upload-content">
            <Loader size={32} className="spinning" />
            <p>Upload en cours...</p>
          </div>
        ) : (
          <div className="file-upload-content">
            {type === 'image' ? (
              <>
                {preview ? (
                  <div className="file-upload-preview">
                    <img src={preview} alt="Aperçu" />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} />
                    <p>Glissez-déposez une image ici</p>
                    <p className="file-upload-hint">ou cliquez pour sélectionner</p>
                    <p className="file-upload-size">Taille max : {maxSize}MB</p>
                  </>
                )}
              </>
            ) : type === 'pdf' ? (
              <>
                <FileText size={32} />
                <p>Glissez-déposez un PDF ici</p>
                <p className="file-upload-hint">ou cliquez pour sélectionner</p>
                <p className="file-upload-size">Taille max : {maxSize}MB</p>
              </>
            ) : type === 'video' ? (
              <>
                {preview ? (
                  <div className="file-upload-preview">
                    <video src={preview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video size={32} />
                    <p>Glissez-déposez une vidéo ici</p>
                    <p className="file-upload-hint">ou cliquez pour sélectionner</p>
                    <p className="file-upload-size">Taille max : {maxSize}MB</p>
                  </>
                )}
              </>
            ) : (
              <>
                <FileIcon size={32} />
                <p>Glissez-déposez un document ici</p>
                <p className="file-upload-hint">ou cliquez pour sélectionner</p>
                <p className="file-upload-size">Taille max : {maxSize}MB</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
