import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { quizService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import './AdminQuiz.css'

interface Question {
  question: string
  type: 'multiple-choice' | 'true-false' | 'text'
  options: string[]
  correctAnswer: any
  explanation: string
  points: number
  order: number
}

interface Quiz {
  _id: string
  title: string
  description: string
  questions: Question[]
  difficulty: string
  timeLimit?: number
  passingScore: number
  totalPoints: number
  tags?: string[]
  isActive: boolean
}

export const AdminQuiz = () => {
  const { success, showError } = useNotifications()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    timeLimit: '',
    passingScore: 70,
    tags: '',
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null)
  const [questionForm, setQuestionForm] = useState<Question>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10,
    order: 0,
  })

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await quizService.getAll({ limit: 100 })
      setQuizzes(response.data.quizzes || [])
    } catch (error) {
      console.error('Erreur lors du chargement des quiz:', error)
      showError('Erreur lors du chargement des quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    if (!questionForm.question.trim()) {
      showError('La question est requise')
      return
    }

    if (questionForm.type === 'multiple-choice' && questionForm.options.some(opt => !opt.trim())) {
      showError('Toutes les options sont requises pour les questions à choix multiples')
      return
    }

    if (questionForm.type === 'multiple-choice' && typeof questionForm.correctAnswer !== 'number') {
      showError('Veuillez sélectionner la réponse correcte')
      return
    }

    if (!questionForm.explanation.trim()) {
      showError('L\'explication est requise')
      return
    }

    const newQuestion: Question = {
      ...questionForm,
      order: questions.length,
    }

    if (currentQuestionIndex !== null) {
      // Modifier une question existante
      const updatedQuestions = [...questions]
      updatedQuestions[currentQuestionIndex] = newQuestion
      setQuestions(updatedQuestions)
      setCurrentQuestionIndex(null)
    } else {
      // Ajouter une nouvelle question
      setQuestions([...questions, newQuestion])
    }

    // Réinitialiser le formulaire
    setQuestionForm({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10,
      order: 0,
    })
    success(currentQuestionIndex !== null ? 'Question modifiée' : 'Question ajoutée')
  }

  const handleEditQuestion = (index: number) => {
    setQuestionForm(questions[index])
    setCurrentQuestionIndex(index)
  }

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      setQuestions(updatedQuestions.map((q, i) => ({ ...q, order: i })))
    }
  }

  const handleSaveQuiz = async () => {
    if (!formData.title.trim()) {
      showError('Le titre est requis')
      return
    }

    if (questions.length === 0) {
      showError('Au moins une question est requise')
      return
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const quizData = {
        title: formData.title,
        description: formData.description || '',
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        passingScore: formData.passingScore,
        questions: questions,
        tags: tagsArray,
        isActive: true,
      }

      if (editingQuiz) {
        await quizService.update(editingQuiz._id, quizData)
        success('Quiz mis à jour avec succès')
      } else {
        await quizService.create(quizData)
        success('Quiz créé avec succès')
      }

      setShowForm(false)
      setEditingQuiz(null)
      setFormData({
        title: '',
        description: '',
        difficulty: 'beginner',
        timeLimit: '',
        passingScore: 70,
        tags: '',
      })
      setQuestions([])
      fetchQuizzes()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la sauvegarde du quiz')
    }
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit?.toString() || '',
      passingScore: quiz.passingScore,
      tags: quiz.tags?.join(', ') || '',
    })
    setQuestions(quiz.questions)
    setShowForm(true)
  }

  const handleDeleteQuiz = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      try {
        await quizService.delete(id)
        success('Quiz supprimé avec succès')
        fetchQuizzes()
      } catch (error: any) {
        showError(error.response?.data?.error || 'Erreur lors de la suppression')
      }
    }
  }

  if (loading) {
    return <div className="admin-quiz-loading">Chargement des quiz...</div>
  }

  return (
    <div className="admin-quiz">
      <div className="admin-section-header">
        <h2>Gestion des Quiz</h2>
        <p>Créez et gérez les quiz interactifs sur l'histoire de l'Afrique</p>
      </div>

      {!showForm ? (
        <>
          <div className="admin-quiz-actions">
            <Button onClick={() => setShowForm(true)}>
              <span className="icon-plus" />
              Créer un nouveau quiz
            </Button>
          </div>

          <div className="admin-quiz-grid">
            {quizzes.length === 0 ? (
              <Card className="empty-state">
                <p>Aucun quiz trouvé. Créez votre premier quiz !</p>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card key={quiz._id} className="quiz-admin-card">
                  <div className="quiz-admin-header">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-admin-badges">
                      <span className={`difficulty-badge ${quiz.difficulty}`}>
                        {quiz.difficulty === 'beginner' ? 'Débutant' : quiz.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                      </span>
                      {quiz.isActive && <span className="active-badge">Actif</span>}
                    </div>
                  </div>
                  <p className="quiz-admin-description">{quiz.description}</p>
                  <div className="quiz-admin-stats">
                    <span>
                      <span className="icon-book" />
                      {quiz.questions.length} questions
                    </span>
                    <span>
                      <span className="icon-award" />
                      {quiz.totalPoints} points
                    </span>
                    {quiz.timeLimit && (
                      <span>
                        <span className="icon-clock" />
                        {Math.floor(quiz.timeLimit / 60)} min
                      </span>
                    )}
                  </div>
                  <div className="quiz-admin-actions">
                    <Button variant="outline" size="small" onClick={() => handleEditQuiz(quiz)}>
                      <span className="icon-edit" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="small" onClick={() => handleDeleteQuiz(quiz._id)}>
                      <span className="icon-trash" />
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <Card className="quiz-form-card">
          <div className="quiz-form-header">
            <h3>{editingQuiz ? 'Modifier le quiz' : 'Nouveau quiz'}</h3>
            <Button variant="outline" size="small" onClick={() => {
              setShowForm(false)
              setEditingQuiz(null)
              setFormData({
                title: '',
                description: '',
                difficulty: 'beginner',
                timeLimit: '',
                passingScore: 70,
                tags: '',
              })
              setQuestions([])
            }}>
              <span className="icon-close" />
              Annuler
            </Button>
          </div>

          <div className="quiz-form-content">
            <div className="form-section">
              <h4>Informations générales</h4>
              <div className="form-group">
                <label className="input-label">Titre <span style={{ color: '#ef4444' }}>*</span></label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Histoire de l'Afrique - Les Grands Empires"
                />
              </div>
              <div className="form-group">
                <label className="input-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du quiz..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Difficulté</label>
                  <select
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Temps limite (secondes, optionnel)</label>
                  <Input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    placeholder="Ex: 600 (10 minutes)"
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Score minimum (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Tags (séparés par des virgules)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: Histoire, Empires, Afrique"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Questions ({questions.length})</h4>
              
              <div className="question-form">
                <div className="form-group">
                  <label className="input-label">Question <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    className="form-textarea"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    placeholder="Entrez la question..."
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Type</label>
                    <select
                      className="form-select"
                      value={questionForm.type}
                      onChange={(e) => {
                        const newType = e.target.value as 'multiple-choice' | 'true-false' | 'text'
                        setQuestionForm({
                          ...questionForm,
                          type: newType,
                          options: newType === 'multiple-choice' ? ['', '', '', ''] : [],
                          correctAnswer: newType === 'true-false' ? true : newType === 'multiple-choice' ? 0 : '',
                        })
                      }}
                    >
                      <option value="multiple-choice">Choix multiples</option>
                      <option value="true-false">Vrai/Faux</option>
                      <option value="text">Texte libre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Points</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </div>

                {questionForm.type === 'multiple-choice' && (
                  <div className="form-group">
                    <label className="input-label">Options <span style={{ color: '#ef4444' }}>*</span></label>
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="option-input-group">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswer === index}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                          className="correct-answer-radio"
                        />
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options]
                            newOptions[index] = e.target.value
                            setQuestionForm({ ...questionForm, options: newOptions })
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {questionForm.type === 'true-false' && (
                  <div className="form-group">
                    <label className="input-label">Réponse correcte</label>
                    <div className="true-false-options">
                      <button
                        type="button"
                        className={`tf-option ${questionForm.correctAnswer === true ? 'selected' : ''}`}
                        onClick={() => setQuestionForm({ ...questionForm, correctAnswer: true })}
                      >
                        Vrai
                      </button>
                      <button
                        type="button"
                        className={`tf-option ${questionForm.correctAnswer === false ? 'selected' : ''}`}
                        onClick={() => setQuestionForm({ ...questionForm, correctAnswer: false })}
                      >
                        Faux
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="input-label">Explication <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    className="form-textarea"
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    placeholder="Expliquez pourquoi cette réponse est correcte..."
                    rows={3}
                  />
                </div>

                <div className="question-form-actions">
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    variant={currentQuestionIndex !== null ? 'primary' : 'secondary'}
                  >
                    <span className="icon-save" />
                    {currentQuestionIndex !== null ? 'Modifier la question' : 'Ajouter la question'}
                  </Button>
                  {currentQuestionIndex !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCurrentQuestionIndex(null)
                        setQuestionForm({
                          question: '',
                          type: 'multiple-choice',
                          options: ['', '', '', ''],
                          correctAnswer: 0,
                          explanation: '',
                          points: 10,
                          order: 0,
                        })
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </div>

              {questions.length > 0 && (
                <div className="questions-list">
                  <h5>Questions ajoutées ({questions.length})</h5>
                  {questions.map((q, index) => (
                    <div key={index} className="question-item">
                      <div className="question-item-header">
                        <span className="question-number">Q{index + 1}</span>
                        <div className="question-item-actions">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleEditQuestion(index)}
                          >
                            <span className="icon-edit" />
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleDeleteQuestion(index)}
                          >
                            <span className="icon-trash" />
                          </Button>
                        </div>
                      </div>
                      <p className="question-item-text">{q.question}</p>
                      <div className="question-item-meta">
                        <span>{q.type === 'multiple-choice' ? 'Choix multiples' : q.type === 'true-false' ? 'Vrai/Faux' : 'Texte'}</span>
                        <span>{q.points} points</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quiz-form-footer">
              <Button onClick={handleSaveQuiz} disabled={questions.length === 0}>
                <span className="icon-save" />
                {editingQuiz ? 'Mettre à jour le quiz' : 'Créer le quiz'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

