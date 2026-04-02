import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBlogStore } from '../../store/blogStore'
import { blogApi } from '../../api/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import './Blog.css'

export const BlogPost = () => {
  const { id } = useParams<{ id: string }>()
  const { selectedPost, setSelectedPost } = useBlogStore()

  useEffect(() => {
    const loadPost = async () => {
      if (id) {
        const post = await blogApi.getById(id)
        if (post) {
          setSelectedPost(post)
        }
      }
    }
    loadPost()
  }, [id, setSelectedPost])

  if (!selectedPost) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        <Link to="/blog">
          <Button variant="outline" size="small">
            ← Retour au blog
          </Button>
        </Link>

        <article className="post-article">
          <div
            className="post-hero-image"
            style={{ backgroundImage: `url(${selectedPost.image})` }}
          />
          <Card className="post-article-content">
            <div className="post-header">
              <span className="post-category">{selectedPost.category}</span>
              <h1 className="post-title">{selectedPost.title}</h1>
              <div className="post-meta">
                <span className="post-author">Par {selectedPost.author}</span>
                <span className="post-date">
                  {new Date(selectedPost.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="post-tags">
              {selectedPost.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="post-body">
              {selectedPost.content.split('\n').map((paragraph, index) => (
                <p key={index} className="post-paragraph">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </Card>
        </article>
      </div>
    </div>
  )
}

