import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { collectionService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './CollectionDetail.css'

interface CollectionItem {
  type: string
  itemId: any
  order: number
  notes: string
}

interface Collection {
  _id: string
  title: string
  description: string
  coverImage: string
  theme: string[]
  difficulty: string
  estimatedTime: number
  items: CollectionItem[]
  curator: {
    _id: string
    name: string
  }
}

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const { success, showError } = useNotifications()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  useEffect(() => {
    if (id) {
      fetchCollection()
    }
  }, [id])

  const fetchCollection = async () => {
    try {
      setLoading(true)
      const response = await collectionService.getById(id!)
      setCollection(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error)
      showError('Erreur lors du chargement de la collection')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!isAuthenticated) {
      showError('Vous devez être connecté pour compléter une collection')
      return
    }

    try {
      await collectionService.complete(id!)
      success('Collection complétée avec succès !')
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la complétion')
    }
  }

  const getItemLink = (item: CollectionItem) => {
    switch (item.type) {
      case 'country':
        return `/country/${item.itemId.id || item.itemId._id}`
      case 'blog':
        return `/blog/${item.itemId._id}`
      case 'event':
        return `/timeline/${item.itemId._id}`
      case 'figure':
        return `/figures/${item.itemId._id}`
      case 'story':
        return `/stories/${item.itemId._id}`
      default:
        return '#'
    }
  }

  const getItemTitle = (item: CollectionItem) => {
    if (!item.itemId) return 'Contenu non disponible'
    switch (item.type) {
      case 'country':
        return item.itemId.nameFr || item.itemId.name
      case 'blog':
        return item.itemId.title
      case 'event':
        return item.itemId.title
      case 'figure':
        return item.itemId.name
      case 'story':
        return item.itemId.title
      default:
        return 'Titre non disponible'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="collection-detail-loading">
          <p>Chargement...</p>
        </div>
      </Layout>
    )
  }

  if (!collection) {
    return (
      <Layout>
        <div className="collection-detail-not-found">
          <h1>Collection non trouvée</h1>
          <Link to="/collections">
            <Button>Retour aux collections</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const sortedItems = [...collection.items].sort((a, b) => a.order - b.order)
  const currentItem = sortedItems[currentItemIndex]

  return (
    <Layout>
      <div className="collection-detail-page">
        <Link to="/collections" className="back-link">
          <span className="icon-arrow-left" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
          Retour aux collections
        </Link>

        <div className="collection-detail-hero">
          <div className="collection-hero-cover">
            {collection.coverImage ? (
              <img src={collection.coverImage} alt={collection.title} />
            ) : (
              <div className="collection-hero-placeholder">
                <span className="icon-book" style={{ fontSize: '64px', width: '64px', height: '64px', display: 'inline-block' }} />
              </div>
            )}
          </div>
          <div className="collection-hero-info">
            <div className="collection-themes">
              {collection.theme.map((theme) => (
                <span key={theme} className="theme-badge">
                  {theme}
                </span>
              ))}
            </div>
            <h1>{collection.title}</h1>
            <p className="collection-description">{collection.description}</p>
            <div className="collection-hero-meta">
              <div className="meta-item">
                <span className="icon-clock" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                <span>{collection.estimatedTime} minutes de lecture</span>
              </div>
              <div className="meta-item">
                <span>Niveau: {collection.difficulty}</span>
              </div>
              {collection.curator && (
                <div className="meta-item">
                  <span>Curateur: {collection.curator.name}</span>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <Button onClick={handleComplete} style={{ marginTop: '1rem' }}>
                <span className="icon-check" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                Marquer comme complété
              </Button>
            )}
          </div>
        </div>

        <div className="collection-items-section">
          <h2>Contenu de la collection ({sortedItems.length} éléments)</h2>
          <div className="collection-items-list">
            {sortedItems.map((item, index) => (
              <Card
                key={index}
                className={`collection-item-card ${index === currentItemIndex ? 'active' : ''}`}
                onClick={() => setCurrentItemIndex(index)}
              >
                <div className="item-number">{index + 1}</div>
                <div className="item-content">
                  <h3>{getItemTitle(item)}</h3>
                  {item.notes && <p className="item-notes">{item.notes}</p>}
                </div>
                <Link to={getItemLink(item)} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="small">
                    Voir <span className="icon-arrow-right" style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-block' }} />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {currentItem && (
          <div className="collection-current-item">
            <Card>
              <h3>Élément {currentItemIndex + 1} sur {sortedItems.length}</h3>
              <h4>{getItemTitle(currentItem)}</h4>
              {currentItem.notes && <p>{currentItem.notes}</p>}
              <div className="navigation-buttons">
                {currentItemIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentItemIndex(currentItemIndex - 1)}
                  >
                    <span className="icon-arrow-left" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                    Précédent
                  </Button>
                )}
                <Link to={getItemLink(currentItem)}>
                  <Button>
                    Voir le contenu <span className="icon-arrow-right" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                  </Button>
                </Link>
                {currentItemIndex < sortedItems.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                  >
                    Suivant
                    <span className="icon-arrow-right" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

