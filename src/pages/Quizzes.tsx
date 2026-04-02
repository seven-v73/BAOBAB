import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { Input } from '../components/Input/Input'
import { quizService } from '../services/api'
import { usePlatformName } from '../hooks/usePlatformName'
import './Quizzes.css'

interface Quiz {
  _id: string
  title: string
  description: string
  difficulty: string
  timeLimit?: number
  passingScore: number
  totalPoints: number
  questions: Array<{
    question: string
    points: number
  }>
  attempts: number
  completions: number
  averageScore: number
  relatedContent?: {
    type: string
    itemId: string
  }
  tags?: string[]
}

export const Quizzes = () => {
  const platformName = usePlatformName()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  useEffect(() => {
    fetchQuizzes()
  }, [selectedDifficulty, searchTerm])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: 1,
        limit: 50,
      }

      if (selectedDifficulty) {
        params.difficulty = selectedDifficulty
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await quizService.getAll(params)
      setQuizzes(response.data.quizzes || [])
    } catch (error) {
      console.error('Erreur lors du chargement des quiz:', error)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Débutant'
      case 'intermediate':
        return 'Intermédiaire'
      case 'advanced':
        return 'Avancé'
      default:
        return difficulty
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981'
      case 'intermediate':
        return '#f59e0b'
      case 'advanced':
        return '#ef4444'
      default:
        return '#d4af37'
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return 'Illimité'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && quizzes.length === 0) {
    return (
      <Layout>
        <div className="quizzes-page">
          <div className="quizzes-loading">
            <p>Chargement des quiz...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="quizzes-page">
        <div className="quizzes-header">
          <h1>Quiz Interactifs</h1>
          <p className="quizzes-subtitle">
            Testez vos connaissances sur l'histoire et la culture africaine
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="quizzes-filters">
          <div className="search-bar">
            <span className="icon-search" />
            <Input
              id="quiz-search"
              name="quiz-search"
              placeholder="Rechercher un quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-row">
            <select
              className="filter-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
        </div>

        {/* Liste des quiz */}
        <div className="quizzes-grid">
          {quizzes.length === 0 ? (
            <Card className="empty-state">
              <span className="icon-book" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
              <p>Aucun quiz trouvé.</p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline" size="small">
                  Effacer la recherche
                </Button>
              )}
            </Card>
          ) : (
            quizzes.map((quiz) => (
              <Card key={quiz._id} className="quiz-card">
                <div className="quiz-card-header">
                  <div className="quiz-difficulty-badge" style={{ color: getDifficultyColor(quiz.difficulty) }}>
                    {getDifficultyLabel(quiz.difficulty)}
                  </div>
                  {quiz.timeLimit && (
                    <div className="quiz-time-badge">
                      <span className="icon-clock" />
                      <span>{formatTime(quiz.timeLimit)}</span>
                    </div>
                  )}
                </div>
                <div className="quiz-card-content">
                  <h3>{quiz.title}</h3>
                  {quiz.description && (
                    <p className="quiz-description">{quiz.description}</p>
                  )}
                  <div className="quiz-stats">
                    <div className="quiz-stat-item">
                      <span className="icon-book" />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                    <div className="quiz-stat-item">
                      <span className="icon-award" />
                      <span>{quiz.totalPoints} points</span>
                    </div>
                    {quiz.attempts > 0 && (
                      <div className="quiz-stat-item">
                        <span className="icon-eye" />
                        <span>{quiz.attempts} tentatives</span>
                      </div>
                    )}
                    {quiz.averageScore > 0 && (
                      <div className="quiz-stat-item">
                        <span className="icon-trending-up" />
                        <span>Moyenne: {Math.round(quiz.averageScore)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="quiz-requirements">
                    <div className="requirement-item">
                      <span className="icon-check" />
                      <span>Score minimum: {quiz.passingScore}%</span>
                    </div>
                  </div>
                  {quiz.tags && quiz.tags.length > 0 && (
                    <div className="quiz-tags">
                      {quiz.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="quiz-card-footer">
                  <Link to={`/quizzes/${quiz._id}`}>
                    <Button variant="primary" size="small" className="start-quiz-btn">
                      <span className="icon-play" />
                      Commencer le quiz
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

