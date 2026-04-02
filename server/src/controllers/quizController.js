import Quiz from '../models/Quiz.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/quizzes - Récupérer tous les quiz avec filtres
export const getQuizzes = catchAsync(async (req, res) => {
  const {
    difficulty,
    relatedType,
    relatedId,
    search,
    limit = 20,
    page = 1,
    sort = 'createdAt',
  } = req.query

  const query = { isActive: true }

  if (difficulty) {
    query.difficulty = difficulty
  }

  if (relatedType && relatedId) {
    query['relatedContent.type'] = relatedType
    query['relatedContent.itemId'] = relatedId
  }

  if (search) {
    query.$text = { $search: search }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const sortOptions = sort === 'createdAt' ? { createdAt: -1 } : { attempts: -1 }

  const quizzes = await Quiz.find(query)
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .lean()

  const total = await Quiz.countDocuments(query)

  logger.info('Quiz récupérés', { count: quizzes.length, filters: query })

  res.json({
    quizzes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  })
})

// GET /api/quizzes/:id - Récupérer un quiz spécifique
export const getQuizById = catchAsync(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)

  if (!quiz || !quiz.isActive) {
    return res.status(404).json({ error: 'Quiz non trouvé' })
  }

  logger.info('Quiz récupéré', { quizId: quiz._id, title: quiz.title })

  res.json(quiz)
})

// POST /api/quizzes - Créer un nouveau quiz (Admin uniquement)
export const createQuiz = catchAsync(async (req, res) => {
  const quiz = new Quiz(req.body)
  await quiz.save()

  logger.info('Nouveau quiz créé', { quizId: quiz._id, title: quiz.title, userId: req.user._id })

  res.status(201).json(quiz)
})

// PUT /api/quizzes/:id - Mettre à jour un quiz (Admin uniquement)
export const updateQuiz = catchAsync(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' })
  }

  logger.info('Quiz mis à jour', { quizId: quiz._id, userId: req.user._id })

  res.json(quiz)
})

// DELETE /api/quizzes/:id - Supprimer un quiz (Admin uniquement)
export const deleteQuiz = catchAsync(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  )

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' })
  }

  logger.info('Quiz supprimé', { quizId: quiz._id, userId: req.user._id })

  res.json({ message: 'Quiz supprimé avec succès' })
})

// POST /api/quizzes/:id/submit - Soumettre les réponses d'un quiz
export const submitQuiz = catchAsync(async (req, res) => {
  const { answers } = req.body
  const quiz = await Quiz.findById(req.params.id)

  if (!quiz || !quiz.isActive) {
    return res.status(404).json({ error: 'Quiz non trouvé' })
  }

  let score = 0
  let totalPoints = 0
  const results = []

  quiz.questions.forEach((question, index) => {
    totalPoints += question.points
    const userAnswer = answers[index]
    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
    
    if (isCorrect) {
      score += question.points
    }

    results.push({
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      points: isCorrect ? question.points : 0,
    })
  })

  const percentage = (score / totalPoints) * 100
  const passed = percentage >= quiz.passingScore

  // Mettre à jour les statistiques du quiz
  quiz.attempts += 1
  if (quiz.attempts === 1) {
    quiz.averageScore = percentage
  } else {
    quiz.averageScore = ((quiz.averageScore * (quiz.attempts - 1)) + percentage) / quiz.attempts
  }
  await quiz.save()

  logger.info('Quiz soumis', { quizId: quiz._id, score: percentage, userId: req.user?._id })

  res.json({
    score,
    totalPoints,
    percentage: Math.round(percentage),
    passed,
    results,
  })
})

