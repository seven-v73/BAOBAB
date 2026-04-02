import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { storyService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './StoryDetail.css'

interface Chapter {
  title: string
  content: string
  images: Array<{ url: string; caption: string }>
  audio?: string
  interactiveElements: Array<{ type: string; data: any }>
  order: number
}

interface Story {
  _id: string
  title: string
  subtitle: string
  coverImage: string
  description: string
  chapters: Chapter[]
  readingTime: number
  difficulty: string
  category: string
}

export const StoryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const { success, showError } = useNotifications()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  useEffect(() => {
    if (id) {
      fetchStory()
    }
  }, [id])

  const fetchStory = async () => {
    try {
      setLoading(true)
      const response = await storyService.getById(id!)
      setStory(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement du récit:', error)
      showError('Erreur lors du chargement du récit')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!isAuthenticated) {
      showError('Vous devez être connecté pour compléter un récit')
      return
    }

    try {
      await storyService.complete(id!)
      success('Récit complété avec succès !')
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la complétion')
    }
  }

  const sortedChapters = story?.chapters ? [...story.chapters].sort((a, b) => a.order - b.order) : []
  const currentChapterData = sortedChapters[currentChapter]

  if (loading) {
    return (
      <Layout>
        <div className="story-detail-loading">
          <p>Chargement...</p>
        </div>
      </Layout>
    )
  }

  if (!story) {
    return (
      <Layout>
        <div className="story-detail-not-found">
          <h1>Récit non trouvé</h1>
          <Link to="/stories">
            <Button>Retour aux récits</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="story-detail-page">
        <Link to="/stories" className="back-link">
          <span className="icon-arrow-left" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
          Retour aux récits
        </Link>

        <div className="story-detail-hero">
          <div className="story-hero-cover">
            {story.coverImage ? (
              <img src={story.coverImage} alt={story.title} />
            ) : (
              <div className="story-hero-placeholder">
                <span className="icon-book" style={{ fontSize: '64px', width: '64px', height: '64px' }} />
              </div>
            )}
          </div>
          <div className="story-hero-info">
            <div className="story-category-badge">{story.category}</div>
            <h1>{story.title}</h1>
            {story.subtitle && <p className="story-subtitle">{story.subtitle}</p>}
            <p className="story-description">{story.description}</p>
            <div className="story-hero-meta">
              <span>Temps de lecture: {story.readingTime} minutes</span>
              <span>Niveau: {story.difficulty}</span>
            </div>
            {isAuthenticated && (
              <Button onClick={handleComplete} style={{ marginTop: '1rem' }}>
                <span className="icon-check" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                Marquer comme complété
              </Button>
            )}
          </div>
        </div>

        <div className="story-chapters">
          <div className="chapters-sidebar">
            <h3>Chapitres ({sortedChapters.length})</h3>
            <div className="chapters-list">
              {sortedChapters.map((chapter, index) => (
                <button
                  key={index}
                  className={`chapter-item ${index === currentChapter ? 'active' : ''}`}
                  onClick={() => setCurrentChapter(index)}
                >
                  <span className="chapter-number">{index + 1}</span>
                  <span className="chapter-title">{chapter.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="story-reader">
            {currentChapterData && (
              <Card className="chapter-card">
                <div className="chapter-header">
                  <h2>
                    Chapitre {currentChapter + 1}: {currentChapterData.title}
                  </h2>
                  {currentChapterData.audio && (
                    <div className="audio-player">
                      <button
                        className="audio-control"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <span className="icon-pause" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
                        ) : (
                          <span className="icon-play" style={{ fontSize: '20px', width: '20px', height: '20px', display: 'inline-block' }} />
                        )}
                      </button>
                      <audio
                        src={currentChapterData.audio}
                        onTimeUpdate={(e) => {
                          const audio = e.currentTarget
                          setAudioProgress((audio.currentTime / audio.duration) * 100)
                        }}
                        onEnded={() => setIsPlaying(false)}
                        style={{ display: 'none' }}
                        autoPlay={isPlaying}
                      />
                    </div>
                  )}
                </div>
                <div className="chapter-content">
                  {currentChapterData.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                {currentChapterData.images.length > 0 && (
                  <div className="chapter-images">
                    {currentChapterData.images.map((image, index) => (
                      <div key={index} className="chapter-image">
                        <img src={image.url} alt={image.caption || `Image ${index + 1}`} />
                        {image.caption && <p className="image-caption">{image.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="chapter-navigation">
                  {currentChapter > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentChapter(currentChapter - 1)}
                    >
                      <span className="icon-arrow-left" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                      Chapitre précédent
                    </Button>
                  )}
                  {currentChapter < sortedChapters.length - 1 && (
                    <Button
                      onClick={() => setCurrentChapter(currentChapter + 1)}
                    >
                      Chapitre suivant
                      <span className="icon-arrow-right" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                    </Button>
                  )}
                  {currentChapter === sortedChapters.length - 1 && isAuthenticated && (
                    <Button onClick={handleComplete}>
                      <span className="icon-check" style={{ fontSize: '18px', width: '18px', height: '18px', display: 'inline-block' }} />
                      Compléter le récit
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

