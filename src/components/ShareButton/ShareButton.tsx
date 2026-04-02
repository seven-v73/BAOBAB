import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import './ShareButton.css'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  className?: string
}

export const ShareButton = ({ url, title, description = '', className = '' }: ShareButtonProps) => {
  const { success, showError } = useNotifications()
  const [showMenu, setShowMenu] = useState(false)

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : url

  const shareData = {
    title,
    text: description || title,
    url: fullUrl,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        success('Contenu partagé !')
        setShowMenu(false)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          showError('Erreur lors du partage')
        }
      }
    } else {
      setShowMenu(!showMenu)
    }
  }

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setShowMenu(false)
  }

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setShowMenu(false)
  }

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`
    window.open(whatsappUrl, '_blank')
    setShowMenu(false)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description}\n\n${fullUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShowMenu(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      success('Lien copié dans le presse-papiers !')
      setShowMenu(false)
    } catch (error) {
      showError('Erreur lors de la copie')
    }
  }

  const handleQRCode = () => {
    // TODO: Implémenter génération QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`
    window.open(qrUrl, '_blank')
    setShowMenu(false)
  }

  return (
    <div className={`share-button-container ${className}`}>
      <button
        className="share-btn"
        onClick={handleNativeShare}
        title="Partager"
        aria-label="Partager"
      >
        <span className="icon-share" />
        <span>Partager</span>
      </button>

      {showMenu && (
        <>
          <div className="share-menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="share-menu">
            <div className="share-menu-header">
              <h3>Partager</h3>
              <button
                className="share-menu-close"
                onClick={() => setShowMenu(false)}
                aria-label="Fermer"
              >
                <span className="icon-close" />
              </button>
            </div>
            <div className="share-menu-options">
              {navigator.share && (
                <button className="share-option" onClick={handleNativeShare}>
                  <span className="icon-share" />
                  <span>Partager via...</span>
                </button>
              )}
              <button className="share-option" onClick={handleFacebook}>
                <span className="icon-facebook" />
                <span>Facebook</span>
              </button>
              <button className="share-option" onClick={handleTwitter}>
                <span className="icon-twitter" />
                <span>Twitter</span>
              </button>
              <button className="share-option" onClick={handleWhatsApp}>
                <span className="icon-whatsapp" />
                <span>WhatsApp</span>
              </button>
              <button className="share-option" onClick={handleEmail}>
                <span className="icon-mail" />
                <span>Email</span>
              </button>
              <button className="share-option" onClick={handleCopyLink}>
                <span className="icon-copy" />
                <span>Copier le lien</span>
              </button>
              <button className="share-option" onClick={handleQRCode}>
                <span className="icon-qr" />
                <span>Code QR</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

