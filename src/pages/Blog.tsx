import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Input } from '../components/Input/Input'
import { blogService } from '../services/api'
import { foundationBlogPosts } from '../data/foundationContent'
import { withContextualBlogVisual } from '../data/blogVisuals'
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
  const [posts, setPosts] = useState<BlogPost[]>(foundationBlogPosts)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.getAll()
        const responsePosts = Array.isArray(response.data)
          ? response.data
          : response.data.blogs || response.data.data || response.data.posts || []
        // Filtrer uniquement les articles publiés
        const publishedPosts = responsePosts
          .filter((post: BlogPost) => post.published !== false)
          .map(withContextualBlogVisual)
        setPosts(publishedPosts.length > 0 ? publishedPosts : foundationBlogPosts)
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
        setPosts(foundationBlogPosts)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))
  const filteredPosts = posts.filter((post) => {
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch = !query ||
      post.title.toLowerCase().includes(query) ||
      (post.excerpt || '').toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(query))
    const matchesCategory = !categoryFilter || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <Layout>
      <div className="blog">
        <div className="blog-header">
          <h1>Récits et mémoire</h1>
          <p className="blog-subtitle">
            Articles, repères et lectures pour comprendre les lieux, les époques et les héritages.
          </p>
        </div>

        <div className="blog-controls" aria-label="Filtres des articles">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un article, un thème, un tag..."
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="blog-category-filter"
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {(searchTerm || categoryFilter) && (
            <button type="button" className="blog-clear-filters" onClick={() => {
              setSearchTerm('')
              setCategoryFilter('')
            }}>
              Effacer
            </button>
          )}
        </div>

        {loading ? (
          <div className="blog-loading">Chargement des articles...</div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>Aucun article disponible pour le moment.</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="blog-empty">
            <p>Aucun article ne correspond à votre recherche.</p>
            <button type="button" className="blog-clear-filters" onClick={() => {
              setSearchTerm('')
              setCategoryFilter('')
            }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
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
