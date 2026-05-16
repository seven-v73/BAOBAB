import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout/Layout'
import { PostCard } from '../components/Community/PostCard'
import { PostForm } from '../components/Community/PostForm'
import { communityService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { usePlatformName } from '../hooks/usePlatformName'
import { useNotifications } from '../hooks/useNotifications'
import { EmptyState } from '../components/UX/EmptyState'
import { Skeleton } from '../components/UX/Skeleton'
import { useConfirmDialog } from '../components/UX/ConfirmDialog'
import './Community.css'

interface Post {
  _id: string
  author: {
    _id: string
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
  updatedAt: string
}

export const Community = () => {
  const platformName = usePlatformName()
  const { user } = useAuthStore()
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await communityService.getAllPosts({
        communityId: undefined, // Posts généraux (sans communauté spécifique)
        category: category || undefined,
        page,
        limit: 10,
      })
      const newPosts = response.data.posts || []
      
      if (page === 1) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      setHasMore(newPosts.length === 10)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [category, page])

  const handleCreatePost = async (postData: { content: string; image?: string; video?: string; pdf?: string; tags?: string[]; category?: string; communityId?: string }) => {
    try {
      const response = await communityService.createPost(postData)
      setPosts(prev => [response.data, ...prev])
      success('Votre post est publié.')
    } catch (err: any) {
      console.error('Erreur création post:', err)
      showError(err.response?.data?.error || 'Erreur lors de la création du post')
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await communityService.likePost(postId)
      setPosts(prev =>
        prev.map(post =>
          post._id === postId ? response.data : post
        )
      )
    } catch (err: any) {
      console.error('Erreur lors du like:', err)
    }
  }

  const handleDelete = async (postId: string) => {
    const accepted = await confirm({
      title: 'Supprimer ce post ?',
      message: 'Cette action retire le post du fil communautaire.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await communityService.deletePost(postId)
      setPosts(prev => prev.filter(post => post._id !== postId))
      success('Post supprimé.')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const categories = ['Discussion', 'Question', 'Partage', 'Événement', 'Autre']

  return (
    <Layout>
      <div className="community-page">
        <div className="community-header">
          <h1>Communauté {platformName}</h1>
          <p>Partagez vos expériences, posez des questions et échangez avec la communauté</p>
        </div>

        <div className="community-filters">
          <button
            className={`filter-btn ${category === '' ? 'active' : ''}`}
            onClick={() => {
              setCategory('')
              setPage(1)
            }}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat)
                setPage(1)
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {user && (
          <PostForm
            onSubmit={handleCreatePost}
            placeholder="Écrire à la communauté..."
          />
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && posts.length === 0 ? (
          <Skeleton variant="cards" count={3} label="Chargement des posts" />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Aucun post pour le moment"
            description="Lancez la discussion avec une question, un récit ou une ressource utile."
          />
        ) : (
          <>
            <div className="posts-list">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={() => handleLike(post._id)}
                  onDelete={() => handleDelete(post._id)}
                />
              ))}
            </div>

            {hasMore && !loading && (
              <div className="load-more">
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Charger plus
                </button>
              </div>
            )}

            {loading && posts.length > 0 && (
              <Skeleton variant="cards" count={2} label="Chargement de posts supplémentaires" />
            )}
          </>
        )}
        {Dialog}
      </div>
    </Layout>
  )
}
