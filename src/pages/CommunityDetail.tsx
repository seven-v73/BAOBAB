import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { PostCard } from '../components/Community/PostCard'
import { PostForm } from '../components/Community/PostForm'
import { MembersTab } from '../components/Community/MembersTab'
import { SettingsTab } from '../components/Community/SettingsTab'
import { communityService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Users, Settings, UserPlus, Mail, Lock, Globe } from 'lucide-react'
import './CommunityDetail.css'

interface Community {
  _id: string
  name: string
  description: string
  type: 'public' | 'private'
  culture: string
  image: string
  coverImage: string
  creator: {
    _id: string
    name: string
    avatar?: string
  }
  memberCount: number
  postCount: number
  tags: string[]
  membership?: {
    role: string
    status: string
  }
}

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
}

export const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'settings'>('posts')

  useEffect(() => {
    if (id) {
      fetchCommunity()
      fetchPosts()
    }
  }, [id])

  const fetchCommunity = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await communityService.getCommunityById(id!)
      setCommunity(response.data)
    } catch (err: any) {
      console.error('Erreur fetchCommunity:', err)
      const errorMessage = err.response?.data?.error || 'Erreur lors du chargement de la communauté'
      setError(errorMessage)
      
      // Si accès refusé, rediriger vers la liste des communautés
      if (err.response?.status === 403) {
        setTimeout(() => {
          navigate('/communities')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    if (!id) return
    try {
      setLoadingPosts(true)
      const response = await communityService.getAllPosts({
        communityId: id,
        page: 1,
        limit: 20,
      })
      setPosts(response.data.posts || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement des posts:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleJoin = async () => {
    if (!id) return
    try {
      await communityService.joinCommunity(id)
      fetchCommunity()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la demande d\'adhésion')
    }
  }

  const handleLeave = async () => {
    if (!id || !confirm('Êtes-vous sûr de vouloir quitter cette communauté ?')) return
    try {
      await communityService.leaveCommunity(id)
      navigate('/communities')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sortie')
    }
  }

  const handleCreatePost = async (postData: { content: string; image?: string; video?: string; pdf?: string; tags?: string[]; category?: string }) => {
    if (!id) return
    try {
      const response = await communityService.createPost({
        ...postData,
        communityId: id,
      })
      setPosts(prev => [response.data, ...prev])
      setShowForm(false)
    } catch (err: any) {
      console.error('Erreur création post:', err)
      alert(err.response?.data?.error || 'Erreur lors de la création du post')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return
    try {
      await communityService.deletePost(postId)
      setPosts(prev => prev.filter(post => post._id !== postId))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  // Le créateur a toujours accès même sans membership (au cas où)
  const isCreator = user && (community?.creator?._id === user.id || community?.creator?._id?.toString() === user.id)
  const isMember = community?.membership?.status === 'active' || isCreator
  const isAdmin = (community?.membership?.role && ['owner', 'admin', 'moderator'].includes(community.membership.role)) || isCreator
  const isOwner = (community?.membership?.role === 'owner') || isCreator
  // Seuls le propriétaire et les admins peuvent accéder aux paramètres
  const canManageSettings = (community?.membership?.role && ['owner', 'admin'].includes(community.membership.role)) || isCreator

  if (loading) {
    return (
      <Layout>
        <div className="loading">Chargement de la communauté...</div>
      </Layout>
    )
  }

  if (error || !community) {
    return (
      <Layout>
        <div className="error-message">{error || 'Communauté non trouvée'}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="community-detail-page">
        {/* Header de la communauté */}
        <div className="community-detail-header">
          {community.coverImage && (
            <div className="community-cover-large">
              <img src={community.coverImage} alt={community.name} />
            </div>
          )}
          <div className="community-header-content">
            <div className="community-header-info">
              {community.image ? (
                <img src={community.image} alt={community.name} className="community-avatar-large" />
              ) : (
                <div className="community-avatar-large-placeholder">
                  {community.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1>{community.name}</h1>
                <div className="community-meta-large">
                  {community.type === 'private' ? (
                    <Lock size={16} />
                  ) : (
                    <Globe size={16} />
                  )}
                  <span>{community.type === 'private' ? 'Privée' : 'Publique'}</span>
                  {community.culture && (
                    <>
                      <span>•</span>
                      <span>{community.culture}</span>
                    </>
                  )}
                  <span>•</span>
                  <Users size={16} />
                  <span>{community.memberCount} membres</span>
                </div>
              </div>
            </div>
            <div className="community-header-actions">
              {isMember ? (
                <>
                  {canManageSettings && (
                    <Link
                      to={`/communities/${id}/settings`}
                      className="btn btn-outline"
                    >
                      <Settings size={18} />
                      Gérer
                    </Link>
                  )}
                  <button
                    className="btn btn-outline"
                    onClick={handleLeave}
                  >
                    Quitter
                  </button>
                </>
              ) : community.type === 'public' ? (
                <button
                  className="btn btn-primary"
                  onClick={handleJoin}
                >
                  Rejoindre
                </button>
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={() => alert('Cette communauté est privée. Une invitation est requise.')}
                >
                  <Mail size={18} />
                  Demander l'accès
                </button>
              )}
            </div>
          </div>
          <p className="community-description-large">{community.description}</p>
          {community.tags.length > 0 && (
            <div className="community-tags-large">
              {community.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="community-tabs">
          <button
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({community.postCount})
          </button>
          {isMember && (
            <>
              <button
                className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                Membres ({community.memberCount})
              </button>
              {canManageSettings && (
                <button
                  className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Paramètres
                </button>
              )}
            </>
          )}
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'posts' && (
          <div className="community-posts-section">
            {isMember && (
              <div className="community-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Annuler' : '+ Nouveau Post'}
                </button>
              </div>
            )}

            {showForm && isMember && (
              <PostForm
                onSubmit={handleCreatePost}
                onCancel={() => setShowForm(false)}
              />
            )}

            {loadingPosts ? (
              <div className="loading">Chargement des posts...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>Aucun post pour le moment. Soyez le premier à partager !</p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {activeTab === 'members' && isMember && id && (
          <MembersTab
            communityId={id}
            currentUserRole={community?.membership?.role as 'owner' | 'admin' | 'moderator' | 'member'}
            isOwner={isOwner}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'settings' && canManageSettings && community && (
          <SettingsTab
            community={community}
            isOwner={isOwner}
            canManageSettings={canManageSettings}
            onUpdate={fetchCommunity}
          />
        )}
      </div>
    </Layout>
  )
}

