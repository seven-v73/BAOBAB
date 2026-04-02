import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBlogStore } from '../../store/blogStore'
import { blogApi } from '../../api/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import './Blog.css'

export const Blog = () => {
  const { posts } = useBlogStore()
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      const allPosts = await blogApi.getAll()
      useBlogStore.setState({ posts: allPosts })
      setLoading(false)
    }
    if (posts.length === 0) {
      loadPosts()
    } else {
      setLoading(false)
    }
  }, [posts.length])

  const categories = ['all', 'Histoire', 'Culture']
  const filteredPosts =
    selectedCategory === 'all'
      ? posts
      : posts.filter((post) => post.category === selectedCategory)

  if (loading) {
    return (
      <div className="blog-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-page">
      <div className="container">
        <h1 className="page-title">Blog - Histoire Africaine</h1>
        <p className="page-subtitle">
          Découvrez les récits fascinants de l'histoire et de la culture africaine
        </p>

        <div className="category-filter">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="small"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Tous' : category}
            </Button>
          ))}
        </div>

        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="post-card">
              <div
                className="post-image"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <div className="post-content">
                <span className="post-category">{post.category}</span>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-author">Par {post.author}</span>
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <Link to={`/blog/${post.id}`}>
                  <Button variant="primary" size="small">
                    Lire la suite
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

