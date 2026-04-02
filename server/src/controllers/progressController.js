import UserProgress from '../models/UserProgress.js'
import { catchAsync } from '../utils/errorHandler.js'
import logger from '../utils/logger.js'

// GET /api/progress - Récupérer la progression de l'utilisateur
export const getProgress = catchAsync(async (req, res) => {
  const userId = req.user._id

  let progress = await UserProgress.findOne({ user: userId })

  if (!progress) {
    // Créer une progression initiale
    progress = new UserProgress({
      user: userId,
    })
    await progress.save()
  }

  // Calculer le niveau actuel
  progress.calculateLevel()

  logger.info('Progression récupérée', { userId, level: progress.level, points: progress.totalPoints })

  res.json(progress)
})

// POST /api/progress/activity - Enregistrer une activité
export const recordActivity = catchAsync(async (req, res) => {
  const { activityType, itemType, itemId, points = 0 } = req.body
  const userId = req.user._id

  let progress = await UserProgress.findOne({ user: userId })

  if (!progress) {
    progress = new UserProgress({ user: userId })
  }

  // Enregistrer l'activité selon le type
  switch (activityType) {
    case 'read-event':
      if (!progress.readEvents.includes(itemId)) {
        progress.readEvents.push(itemId)
        progress.addPoints(10) // 10 points pour lire un événement
      }
      break
    case 'read-figure':
      if (!progress.readFigures.includes(itemId)) {
        progress.readFigures.push(itemId)
        progress.addPoints(10)
      }
      break
    case 'read-proverb':
      if (!progress.readProverbs.includes(itemId)) {
        progress.readProverbs.push(itemId)
        progress.addPoints(5)
      }
      break
    case 'read-blog':
      if (!progress.readBlogs.includes(itemId)) {
        progress.readBlogs.push(itemId)
        progress.addPoints(5)
      }
      break
    case 'complete-quiz':
      if (!progress.completedQuizzes.includes(itemId)) {
        progress.completedQuizzes.push(itemId)
        progress.addPoints(points || 50) // Points basés sur le score
      }
      break
    case 'complete-story':
      if (!progress.completedStories.includes(itemId)) {
        progress.completedStories.push(itemId)
        progress.addPoints(30)
      }
      break
    case 'complete-collection':
      if (!progress.completedCollections.includes(itemId)) {
        progress.completedCollections.push(itemId)
        progress.addPoints(50)
      }
      break
    default:
      if (points > 0) {
        progress.addPoints(points)
      }
  }

  // Mettre à jour les streaks
  const now = new Date()
  const lastActivity = new Date(progress.streaks.lastActivity)
  const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) {
    // Même jour, pas de changement
  } else if (daysDiff === 1) {
    // Jour consécutif
    progress.streaks.daily += 1
    if (progress.streaks.daily > progress.streaks.longest) {
      progress.streaks.longest = progress.streaks.daily
    }
  } else {
    // Streak rompu
    progress.streaks.daily = 1
  }

  progress.streaks.lastActivity = now

  // Vérifier et attribuer des badges
  await checkAndAwardBadges(progress)

  await progress.save()

  logger.info('Activité enregistrée', { userId, activityType, points: progress.totalPoints })

  res.json(progress)
})

// Fonction pour vérifier et attribuer des badges
async function checkAndAwardBadges(progress) {
  const badges = progress.badges.map(b => b.type)
  const newBadges = []

  // Badge Explorer (10 pays visités)
  if (!badges.includes('explorer') && progress.readEvents.length >= 10) {
    newBadges.push({ type: 'explorer', earnedAt: new Date() })
  }

  // Badge Scholar (50 articles lus)
  if (!badges.includes('scholar') && progress.readBlogs.length >= 50) {
    newBadges.push({ type: 'scholar', earnedAt: new Date() })
  }

  // Badge Historian (20 événements)
  if (!badges.includes('historian') && progress.readEvents.length >= 20) {
    newBadges.push({ type: 'historian', earnedAt: new Date() })
  }

  // Badge Quiz Master (5 quiz complétés)
  if (!badges.includes('quiz-master') && progress.completedQuizzes.length >= 5) {
    newBadges.push({ type: 'quiz-master', earnedAt: new Date() })
  }

  // Badge Reader (10 récits)
  if (!badges.includes('reader') && progress.completedStories.length >= 10) {
    newBadges.push({ type: 'reader', earnedAt: new Date() })
  }

  // Badge Collector (5 collections)
  if (!badges.includes('collector') && progress.completedCollections.length >= 5) {
    newBadges.push({ type: 'collector', earnedAt: new Date() })
  }

  // Badge Dedicated (7 jours consécutifs)
  if (!badges.includes('dedicated') && progress.streaks.daily >= 7) {
    newBadges.push({ type: 'dedicated', earnedAt: new Date() })
  }

  // Badge Expert (Niveau 10)
  if (!badges.includes('expert') && progress.level >= 10) {
    newBadges.push({ type: 'expert', earnedAt: new Date() })
  }

  if (newBadges.length > 0) {
    progress.badges.push(...newBadges)
  }

  return newBadges
}

// GET /api/progress/leaderboard - Classement des utilisateurs
export const getLeaderboard = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query

  const topUsers = await UserProgress.find()
    .populate('user', 'name email avatar')
    .sort({ totalPoints: -1 })
    .limit(parseInt(limit))
    .lean()

  logger.info('Classement récupéré', { count: topUsers.length })

  res.json({ data: topUsers })
})

