import { useState } from 'react'
import { Heart, MessageCircle, Trash2, User, FileText, ExternalLink } from 'lucide-react'
import { CommentSection } from './CommentSection'
import { communityService } from '../../services/api'
import './PostCard.css'

interface Post {
  _id: string
  author: {
    _id: string
    id?: string
    name: string
    avatar?: string
  }
  content: string
  image?: string
  video?: string
  pdf?: string
  likes: string[]
  comments: any[]
  commentCount?: number
  tags: string[]
  category: string
  createdAt: string
  updatedAt?: string
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onLike: () => void
  onDelete: () => void
}

export const PostCard = ({ post, currentUserId, onLike, onDelete }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const isLiked = currentUserId && post.likes.some((id: string) => id === currentUserId || id.toString() === currentUserId)
  const isAuthor = currentUserId === post.author._id || currentUserId === post.author.id

  const handleShowComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const response = await communityService.getPostComments(post._id)
        setComments(response.data)
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err)
      } finally {
        setLoadingComments(false)
      }
    }
    setShowComments(!showComments)
  }

  const handleCommentAdded = (newComment: any) => {
    setComments(prev => [newComment, ...prev])
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

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.author.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
          ) : (
            <div className="author-avatar-placeholder">
              <User size={20} />
            </div>
          )}
          <div>
            <div className="author-name">{post.author.name}</div>
            <div className="post-meta">
              <span className="post-category">{post.category}</span>
              <span className="post-date">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {isAuthor && (
          <button className="delete-btn" onClick={onDelete} title="Supprimer">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <div className="post-media">
            <img src={post.image} alt="Post" className="post-image" />
          </div>
        )}
        {post.video && (
          <div className="post-media">
            <video controls className="post-video">
              <source src={post.video} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            <a href={post.video} target="_blank" rel="noopener noreferrer" className="media-link">
              <ExternalLink size={16} />
              Ouvrir la vidéo
            </a>
          </div>
        )}
        {post.pdf && (
          <div className="post-media">
            <div className="post-pdf">
              <FileText size={32} />
              <div>
                <p>Document PDF</p>
                <a href={post.pdf} target="_blank" rel="noopener noreferrer" className="pdf-link">
                  <ExternalLink size={16} />
                  Ouvrir le PDF
                </a>
              </div>
            </div>
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
          onClick={onLike}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes.length}</span>
        </button>
        <button
          className="action-btn comment-btn"
          onClick={handleShowComments}
        >
          <MessageCircle size={20} />
          <span>{post.commentCount ?? post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={comments}
          loading={loadingComments}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  )
}
