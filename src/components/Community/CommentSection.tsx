import { useState } from 'react'
import { Heart, Send, User } from 'lucide-react'
import { communityService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import './CommentSection.css'

interface Comment {
  _id: string
  user: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  likes: string[]
  replies?: Comment[]
  createdAt: string
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  loading: boolean
  onCommentAdded: (comment: Comment) => void
}

export const CommentSection = ({ postId, comments, loading, onCommentAdded }: CommentSectionProps) => {
  const { user } = useAuthStore()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState<Comment[]>(comments)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    try {
      const response = await communityService.createComment(postId, {
        content: newComment.trim(),
      })
      const comment = response.data
      setLocalComments(prev => [comment, ...prev])
      onCommentAdded(comment)
      setNewComment('')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout du commentaire')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!user) return

    try {
      const response = await communityService.likeComment(commentId)
      setLocalComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? response.data : comment
        )
      )
    } catch (err) {
      console.error('Erreur lors du like:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const isLiked = (comment: Comment) => {
    if (!user || !user.id) return false
    return comment.likes.some((id: string) => id === user.id || id.toString() === user.id)
  }

  return (
    <div className="comment-section">
      {user && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="comment-avatar" />
            ) : (
              <div className="comment-avatar-placeholder">
                <User size={16} />
              </div>
            )}
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="comment-input"
              disabled={submitting}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!newComment.trim() || submitting}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="comments-loading">Chargement des commentaires...</div>
      ) : localComments.length === 0 ? (
        <div className="no-comments">Aucun commentaire pour le moment</div>
      ) : (
        <div className="comments-list">
          {localComments.map(comment => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt={comment.user.name} className="comment-avatar" />
                ) : (
                  <div className="comment-avatar-placeholder">
                    <User size={16} />
                  </div>
                )}
                <div className="comment-info">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
              </div>
              <div className="comment-content">
                <p>{comment.content}</p>
              </div>
              <div className="comment-actions">
                <button
                  className={`comment-like-btn ${isLiked(comment) ? 'liked' : ''}`}
                  onClick={() => handleLike(comment._id)}
                >
                  <Heart size={16} fill={isLiked(comment) ? 'currentColor' : 'none'} />
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

