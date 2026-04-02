import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { quizService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './Quiz.css'

interface Question {
  question: string
  type: 'multiple-choice' | 'true-false' | 'text' | 'map' | 'chronology'
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
}

interface QuizResult {
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  results: Array<{
    question: string
    userAnswer: any
    correctAnswer: any
    isCorrect: boolean
    explanation: string
    points: number
  }>
}

export const Quiz = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { success, showError } = useNotifications()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [results, setResults] = useState<QuizResult | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuiz()
    }
  }, [id])

  useEffect(() => {
    if (quiz && answers.length > 0) {
      setSelectedOption(answers[currentQuestion])
    }
  }, [currentQuestion, quiz, answers])

  useEffect(() => {
    if (quiz && quiz.timeLimit && !isSubmitted) {
      setTimeRemaining(quiz.timeLimit)
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [quiz, isSubmitted])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await quizService.getById(id!)
      setQuiz(response.data)
      setAnswers(new Array(response.data.questions.length).fill(null))
    } catch (error) {
      console.error('Erreur lors du chargement du quiz:', error)
      showError('Erreur lors du chargement du quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: any) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
    setSelectedOption(value)
    // Effet visuel de sélection
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 300)
  }

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
      setShowFeedback(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedOption(answers[currentQuestion - 1])
      setShowFeedback(false)
    }
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      showError('Vous devez être connecté pour soumettre un quiz')
      return
    }

    if (answers.some(a => a === null)) {
      if (!confirm('Certaines questions n\'ont pas de réponse. Voulez-vous continuer ?')) {
        return
      }
    }

    try {
      const response = await quizService.submit(id!, answers)
      setResults(response.data)
      setIsSubmitted(true)
      
      if (response.data.passed) {
        success(`Félicitations ! Vous avez réussi avec ${response.data.percentage}%`)
      } else {
        showError(`Score: ${response.data.percentage}%. Score minimum requis: ${quiz?.passingScore}%`)
      }
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erreur lors de la soumission')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Layout>
        <div className="quiz-loading">
          <p>Chargement du quiz...</p>
        </div>
      </Layout>
    )
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="quiz-not-found">
          <h1>Quiz non trouvé</h1>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </Layout>
    )
  }

  const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order)
  const currentQuestionData = sortedQuestions[currentQuestion]

  // Fonction pour formater les réponses en texte lisible
  const formatAnswer = (answer: any, questionType: string, options?: string[]) => {
    if (questionType === 'multiple-choice' && options && typeof answer === 'number') {
      return options[answer] || `Option ${answer + 1}`
    }
    if (questionType === 'true-false') {
      return answer === true ? 'Vrai' : answer === false ? 'Faux' : 'Non répondue'
    }
    if (typeof answer === 'string' && answer.trim() !== '') {
      return answer
    }
    return 'Non répondue'
  }

  return (
    <Layout>
      <div className="quiz-page">
        <Link to="/quizzes" className="back-link">
          <span className="icon-arrow-left" />
          Retour à la liste
        </Link>

        <div className="quiz-header">
          <div>
            <h1>{quiz.title}</h1>
            <p>{quiz.description}</p>
          </div>
          {timeRemaining !== null && !isSubmitted && (
            <div className="quiz-timer">
              <span className="icon-clock" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {!isSubmitted ? (
          <div className="quiz-container">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / sortedQuestions.length) * 100}%` }}
                />
              </div>
              <span>
                Question {currentQuestion + 1} sur {sortedQuestions.length}
              </span>
            </div>

            <Card className="question-card">
              <div className="question-header">
                <h2>{currentQuestionData.question}</h2>
                <span className="question-points">{currentQuestionData.points} points</span>
              </div>

              <div className="question-options">
                {currentQuestionData.type === 'multiple-choice' && (
                  <div className="options-list">
                    {currentQuestionData.options.map((option, index) => (
                      <button
                        key={index}
                        className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''} ${showFeedback && selectedOption === index ? 'pulse' : ''}`}
                        onClick={() => handleAnswerChange(index)}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="option-text">{option}</span>
                        {answers[currentQuestion] === index && (
                          <span className="option-check">
                            <span className="icon-check" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestionData.type === 'true-false' && (
                  <div className="options-list true-false-options">
                    <button
                      className={`option-btn true-btn ${answers[currentQuestion] === true ? 'selected' : ''} ${showFeedback && selectedOption === true ? 'pulse' : ''}`}
                      onClick={() => handleAnswerChange(true)}
                    >
                      <span className="icon-check" />
                      <span>Vrai</span>
                    </button>
                    <button
                      className={`option-btn false-btn ${answers[currentQuestion] === false ? 'selected' : ''} ${showFeedback && selectedOption === false ? 'pulse' : ''}`}
                      onClick={() => handleAnswerChange(false)}
                    >
                      <span className="icon-close" />
                      <span>Faux</span>
                    </button>
                  </div>
                )}

                {currentQuestionData.type === 'text' && (
                  <textarea
                    className="text-answer"
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={5}
                  />
                )}
              </div>

              <div className="question-navigation">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <span className="icon-arrow-left" />
                  Précédent
                </Button>
                {currentQuestion < sortedQuestions.length - 1 ? (
                  <Button onClick={handleNext}>
                    Suivant
                    <span className="icon-arrow-right" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    <span className="icon-check" />
                    Soumettre
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="quiz-results">
            <Card className="results-summary">
              <div className={`results-header ${results?.passed ? 'passed' : 'failed'}`}>
                {results?.passed ? (
                  <>
                    <span className="icon-award" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <h2>Félicitations !</h2>
                    <p>Vous avez réussi le quiz</p>
                  </>
                ) : (
                  <>
                    <span className="icon-alert-circle" style={{ fontSize: '48px', width: '48px', height: '48px' }} />
                    <h2>Quiz échoué</h2>
                    <p>Score minimum requis: {quiz.passingScore}%</p>
                  </>
                )}
                <div className="results-score">
                  <div className="score-circle">
                    <svg className="score-svg" viewBox="0 0 120 120">
                      <circle
                        className="score-circle-bg"
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="score-circle-fill"
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - (results?.percentage || 0) / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="score-percentage">{results?.percentage}%</div>
                  </div>
                  <span className="score-details">
                    {results?.score} / {results?.totalPoints} points
                  </span>
                </div>
              </div>
            </Card>

            <div className="results-details">
              <h3>Détails des réponses</h3>
              {results?.results.map((result, index) => {
                const questionData = sortedQuestions[index]
                const userAnswerText = formatAnswer(result.userAnswer, questionData?.type || 'multiple-choice', questionData?.options)
                const correctAnswerText = formatAnswer(result.correctAnswer, questionData?.type || 'multiple-choice', questionData?.options)

                return (
                  <Card key={index} className="result-item">
                    <div className="result-question">
                      <h4>
                        Question {index + 1}: {result.question}
                      </h4>
                      <div className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                        {result.isCorrect ? (
                          <>
                            <span className="icon-check" />
                            <span>Correct ({result.points} points)</span>
                          </>
                        ) : (
                          <>
                            <span className="icon-close" />
                            <span>Incorrect (0 point)</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="result-answers">
                      <div className={`answer-item ${result.isCorrect ? 'answer-correct' : 'answer-incorrect'}`}>
                        <strong>
                          {result.isCorrect ? (
                            <>
                              <span className="icon-check" />
                              Votre réponse (correcte):
                            </>
                          ) : (
                            <>
                              <span className="icon-close" />
                              Votre réponse:
                            </>
                          )}
                        </strong>
                        <span className="answer-text">{userAnswerText}</span>
                      </div>
                      {!result.isCorrect && (
                        <div className="answer-item answer-correct">
                          <strong>
                            <span className="icon-check" />
                            Réponse correcte:
                          </strong>
                          <span className="answer-text">{correctAnswerText}</span>
                        </div>
                      )}
                      {result.explanation && (
                        <div className="result-explanation">
                          <strong>
                            <span className="icon-book" />
                            Explication:
                          </strong>
                          <p>{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

