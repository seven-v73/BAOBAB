import mongoose from 'mongoose'

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  relatedContent: {
    type: {
      type: String,
      enum: ['country', 'blog', 'event', 'story', 'figure', 'collection'],
      required: false,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'relatedContent.type',
    },
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'text', 'map', 'chronology'],
      required: true,
    },
    options: [{
      type: String,
      default: [],
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Peut être String, Number, ou Array
      required: true,
    },
    explanation: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    index: true,
  },
  timeLimit: {
    type: Number,
    default: null, // En secondes, null = pas de limite
  },
  passingScore: {
    type: Number,
    default: 70, // Pourcentage
    min: 0,
    max: 100,
  },
  totalPoints: {
    type: Number,
    default: 0, // Calculé automatiquement
  },
  attempts: {
    type: Number,
    default: 0,
  },
  completions: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  tags: [{
    type: String,
    default: [],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Calculer totalPoints avant sauvegarde
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 0), 0)
  }
  next()
})

// Index pour recherche
quizSchema.index({ title: 'text', description: 'text' })
quizSchema.index({ 'relatedContent.type': 1, 'relatedContent.itemId': 1 })
quizSchema.index({ difficulty: 1, isActive: 1 })
quizSchema.index({ attempts: -1, averageScore: -1 })

const Quiz = mongoose.model('Quiz', quizSchema)

export default Quiz

