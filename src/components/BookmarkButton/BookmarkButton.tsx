import { useState, useEffect } from 'react'
import { bookmarkService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import './BookmarkButton.css'

interface BookmarkButtonProps {
  itemType: 'event' | 'figure' | 'collection' | 'story' | 'quiz' | 'proverb' | 'blog' | 'country'
  itemId: string
  className?: string
}

export const BookmarkButton = ({ itemType, itemId, className = '' }: BookmarkButtonProps) => {
  const { isAuthenticated } = useAuthStore()
  const { success, showError } = useNotifications()
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
    } catch (error) {
      // Ignore errors for check
    }
  }

  const handleToggle = async () => {
    if (!isAuthenticated) {
      showError('Connectez-vous pour ajouter aux favoris')
      return
    }

    setLoading(true)
    try {
      if (isBookmarked && bookmarkId) {
        await bookmarkService.delete(bookmarkId)
        setIsBookmarked(false)
        setBookmarkId(null)
        success('Retiré des favoris')
      } else {
        const response = await bookmarkService.create({
          itemType,
          itemId,
          category: 'favorite',
        })
        setIsBookmarked(true)
        setBookmarkId(response.data._id)
        success('Ajouté aux favoris')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <button
      className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''} ${className}`}
      onClick={handleToggle}
      disabled={loading}
      title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <span className={`icon-heart ${isBookmarked ? 'filled' : ''}`} />
      <span className="bookmark-text">
        {isBookmarked ? 'Favori' : 'Ajouter'}
      </span>
    </button>
  )
}

