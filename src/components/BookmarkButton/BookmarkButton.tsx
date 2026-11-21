import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { bookmarkService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import './BookmarkButton.css'

interface BookmarkButtonProps {
  itemType: 'event' | 'figure' | 'collection' | 'story' | 'quiz' | 'proverb' | 'blog' | 'country'
  itemId: string
  className?: string
  /** Bouton rond, icône seule (photo de la fiche pays en mobile) */
  iconOnly?: boolean
}

export const BookmarkButton = ({ itemType, itemId, className = '', iconOnly = false }: BookmarkButtonProps) => {
  const { isAuthenticated } = useAuthStore()
  const { success, showError } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      checkBookmark()
    }
  }, [isAuthenticated, itemType, itemId])

  const checkBookmark = async () => {
    try {
      const response = await bookmarkService.check(itemType, itemId)
      setIsBookmarked(response.data.isBookmarked)
      if (response.data.bookmark) {
        setBookmarkId(response.data.bookmark._id)
      }
    } catch {
      // Vérification facultative : en cas d'échec, le bouton reste « Enregistrer »
    }
  }

  const handleToggle = async () => {
    // Un visiteur non connecté est envoyé vers la connexion, puis ramené ici
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }

    setLoading(true)
    try {
      if (isBookmarked && bookmarkId) {
        await bookmarkService.delete(bookmarkId)
        setIsBookmarked(false)
        setBookmarkId(null)
        success('Retiré de vos enregistrements')
      } else {
        const response = await bookmarkService.create({ itemType, itemId, category: 'favorite' })
        setIsBookmarked(true)
        setBookmarkId(response.data._id)
        success('Enregistré dans Mon espace')
      }
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const label = isBookmarked ? 'Enregistré' : 'Enregistrer'

  return (
    <button
      type="button"
      className={`bookmark-btn${isBookmarked ? ' bookmarked' : ''}${iconOnly ? ' bookmark-btn--icon' : ''} ${className}`}
      onClick={handleToggle}
      disabled={loading}
      aria-pressed={isBookmarked}
      aria-label={iconOnly ? label : undefined}
    >
      <Bookmark size={18} strokeWidth={1.6} fill={isBookmarked ? 'currentColor' : 'none'} aria-hidden="true" />
      {!iconOnly && <span>{label}</span>}
    </button>
  )
}
