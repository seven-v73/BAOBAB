import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  completedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
  }],
  completedStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
  completedCollections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  }],
  readEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimelineEvent',
  }],
  readFigures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalFigure',
  }],
  readProverbs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proverb',
  }],
  readBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  }],
  totalPoints: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: [{
    type: {
      type: String,
      enum: [
        'explorer',      // Visiter 10 pays
        'scholar',       // Lire 50 articles
        'historian',     // Compléter 20 événements
        'quiz-master',   // Obtenir 100% à 5 quiz
        'reader',        // Compléter 10 récits
        'contributor',   // Créer 10 proverbes
        'geographer',    // Explorer 20 sites
        'collector',     // Compléter 5 collections
        'dedicated',     // 7 jours consécutifs
        'expert',        // Niveau 10
      ],
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  streaks: {
    daily: {
      type: Number,
      default: 0,
    },
    weekly: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  statistics: {
    totalTimeSpent: {
      type: Number,
      default: 0, // en minutes
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalShares: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
})

// Méthode pour calculer le niveau basé sur les points
userProgressSchema.methods.calculateLevel = function() {
  // Niveau = floor(sqrt(points / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.totalPoints / 100)) + 1
  return this.level
}

// Méthode pour ajouter des points
userProgressSchema.methods.addPoints = function(points) {
  this.totalPoints += points
  this.calculateLevel()
  return this.totalPoints
}

const UserProgress = mongoose.model('UserProgress', userProgressSchema)

export default UserProgress
