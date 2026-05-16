import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { blogService } from '../services/api'
import './Blog.css'

interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt: string
  author: string
  image?: string
  category: string
  tags: string[]
  published: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.getAll()
        // Filtrer uniquement les articles publiés
        const publishedPosts = response.data.filter((post: BlogPost) => post.published)
        setPosts(publishedPosts)
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <Layout>
      <div className="blog">
        <div className="blog-header">
          <h1>Récits et mémoire</h1>
          <p className="blog-subtitle">
            Articles, repères et lectures pour comprendre les lieux, les époques et les héritages.
          </p>
        </div>

        {loading ? (
          <div className="blog-loading">Chargement des articles...</div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>Aucun article disponible pour le moment.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Card key={post._id} className="blog-card">
                {post.image && (
                  <div className="blog-image">
                    <img src={post.image} alt={post.title} />
                  </div>
                )}
                <div className="blog-category">{post.category}</div>
                <h3>{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt || post.content.substring(0, 200) + '...'}</p>
                <div className="blog-meta">
                  <span className="blog-author">{post.author}</span>
                  <span className="blog-date">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="blog-views">{post.views} vues</span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="blog-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <Link to={`/blog/${post._id}`} className="blog-link">
                  Lire
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
