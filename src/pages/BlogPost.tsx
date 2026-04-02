import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { blogService } from '../services/api'
import { ArrowLeft, Calendar, User, Eye, Image as ImageIcon, FileText, Video, X } from 'lucide-react'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import './BlogPost.css'

interface BlogImage {
  url: string
  caption: string
  order: number
}

interface BlogPDF {
  url: string
  title: string
  description: string
  order: number
}

interface BlogVideo {
  url: string
  title: string
  description: string
  type: 'youtube' | 'vimeo' | 'direct'
  thumbnail: string
  order: number
}

interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt: string
  author: string
  image?: string
  images?: BlogImage[]
  pdfs?: BlogPDF[]
  videos?: BlogVideo[]
  category: string
  tags: string[]
  views: number
  createdAt: string
  updatedAt: string
}

export const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPDF, setSelectedPDF] = useState<BlogPDF | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<BlogVideo | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return

      try {
        const response = await blogService.getById(id)
        setPost(response.data)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="blog-post-page">
          <div className="loading">Chargement de l'article...</div>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="blog-post-page">
          <div className="error">
            <h2>Article non trouvé</h2>
            <Link to="/blog">
              <button>Retour au blog</button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="blog-post-page">
        <Link to="/blog" className="back-link">
          <ArrowLeft size={20} />
          Retour au blog
        </Link>

        <article className="blog-post">
          {post.image && (
            <div className="blog-post-image">
              <img src={post.image} alt={post.title} />
            </div>
          )}

          <div className="blog-post-header">
            <div className="blog-post-category">{post.category}</div>
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <div className="meta-item">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="meta-item">
                <Calendar size={16} />
                <span>{new Date(post.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="meta-item">
                <Eye size={16} />
                <span>{post.views} vues</span>
              </div>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="blog-post-tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="blog-post-content">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Images additionnelles */}
          {post.images && post.images.length > 0 && (
            <div className="blog-post-media-section">
              <h3 className="blog-post-media-title">
                <ImageIcon size={20} />
                Images
              </h3>
              <div className="blog-post-images-grid">
                {post.images
                  .sort((a, b) => a.order - b.order)
                  .map((img, idx) => (
                    <div
                      key={idx}
                      className="blog-post-image-card"
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img src={img.url} alt={img.caption || `Image ${idx + 1}`} />
                      {img.caption && (
                        <p className="blog-post-image-caption">{img.caption}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* PDFs */}
          {post.pdfs && post.pdfs.length > 0 && (
            <div className="blog-post-media-section">
              <h3 className="blog-post-media-title">
                <FileText size={20} />
                Documents PDF
              </h3>
              <div className="blog-post-pdfs-grid">
                {post.pdfs
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((pdf, idx) => (
                    <div
                      key={idx}
                      className="blog-post-pdf-card"
                      onClick={() => setSelectedPDF(pdf)}
                    >
                      <FileText size={32} />
                      <h4>{pdf.title}</h4>
                      {pdf.description && <p>{pdf.description}</p>}
                      <button className="blog-post-view-button">Voir le PDF</button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Vidéos */}
          {post.videos && post.videos.length > 0 && (
            <div className="blog-post-media-section">
              <h3 className="blog-post-media-title">
                <Video size={20} />
                Vidéos
              </h3>
              <div className="blog-post-videos-grid">
                {post.videos
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((video, idx) => (
                    <div
                      key={idx}
                      className="blog-post-video-card"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="blog-post-video-thumbnail" />
                      ) : (
                        <div className="blog-post-video-placeholder">
                          <Video size={48} />
                        </div>
                      )}
                      <div className="blog-post-video-overlay">
                        <Video size={24} />
                      </div>
                      <div className="blog-post-video-info">
                        <h4>{video.title}</h4>
                        {video.description && <p>{video.description}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </article>

        {/* Modal pour l'image en plein écran */}
        {selectedImage && (
          <div className="blog-post-modal" onClick={() => setSelectedImage(null)}>
            <div className="blog-post-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="blog-post-modal-close"
                onClick={() => setSelectedImage(null)}
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
              <img src={selectedImage} alt="Image en plein écran" />
            </div>
          </div>
        )}

        {/* Modal pour le PDF */}
        {selectedPDF && (
          <div className="blog-post-modal" onClick={() => setSelectedPDF(null)}>
            <div className="blog-post-modal-content pdf-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="blog-post-modal-close"
                onClick={() => setSelectedPDF(null)}
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
              <PDFViewer
                url={selectedPDF.url}
                title={selectedPDF.title}
                description={selectedPDF.description}
                onClose={() => setSelectedPDF(null)}
              />
            </div>
          </div>
        )}

        {/* Modal pour la vidéo */}
        {selectedVideo && (
          <div className="blog-post-modal" onClick={() => setSelectedVideo(null)}>
            <div className="blog-post-modal-content video-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="blog-post-modal-close"
                onClick={() => setSelectedVideo(null)}
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
              <VideoViewer
                url={selectedVideo.url}
                title={selectedVideo.title}
                description={selectedVideo.description}
                type={selectedVideo.type}
                thumbnail={selectedVideo.thumbnail}
                onClose={() => setSelectedVideo(null)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

