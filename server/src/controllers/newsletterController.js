import Newsletter from '../models/Newsletter.js'

// POST /api/newsletter/subscribe - S'abonner
export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email requis' })
    }

    // Vérifier si déjà abonné
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() })

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({ error: 'Vous êtes déjà abonné' })
      } else {
        // Réactiver l'abonnement
        subscriber.isActive = true
        subscriber.unsubscribedAt = null
        if (name) subscriber.name = name
        await subscriber.save()
        return res.json({ message: 'Réabonnement réussi', subscriber })
      }
    }

    // Nouvel abonnement
    subscriber = new Newsletter({
      email: email.toLowerCase(),
      name: name || '',
    })

    await subscriber.save()

    res.status(201).json({ message: 'Abonnement réussi', subscriber })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// POST /api/newsletter/unsubscribe - Se désabonner
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() })
    if (!subscriber) {
      return res.status(404).json({ error: 'Email non trouvé' })
    }

    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()

    res.json({ message: 'Désabonnement réussi' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/newsletter/subscribers (Admin)
export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, active } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {}
    if (active !== undefined) query.isActive = active === 'true'

    const subscribers = await Newsletter.find(query)
      .sort('-subscribedAt')
      .skip(skip)
      .limit(Number(limit))

    const total = await Newsletter.countDocuments(query)

    res.json({
      subscribers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

