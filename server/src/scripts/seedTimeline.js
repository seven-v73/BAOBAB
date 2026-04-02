import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import TimelineEvent from '../models/TimelineEvent.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const timelineEventsData = [
  {
    title: "Fondation de l'Empire du Mali",
    description: "Soundiata Keïta fonde l'Empire du Mali après sa victoire à la bataille de Kirina contre le roi Soumaoro Kanté du royaume de Sosso. Cet événement marque le début de l'un des plus grands empires de l'Afrique de l'Ouest.",
    shortDescription: "Création de l'Empire du Mali par Soundiata Keïta",
    date: new Date('1235-01-01'),
    period: 'Moyen-Âge',
    location: {
      region: 'Mali actuel',
      coordinates: { lat: 12.65, lng: -8.0 }
    },
    category: ['Politique', 'Guerre'],
    tags: ['Empire du Mali', 'Soundiata Keïta', 'Bataille de Kirina', 'Afrique de l\'Ouest'],
    importance: 5,
    verified: true,
  },
  {
    title: "Pèlerinage de Mansa Musa à La Mecque",
    description: "Mansa Musa, l'empereur du Mali, effectue un pèlerinage fastueux à La Mecque avec une caravane de milliers de personnes transportant des quantités d'or si importantes qu'elles provoquent une inflation dans les régions traversées. Cet événement fait connaître la richesse de l'Empire du Mali dans tout le monde médiéval.",
    shortDescription: "Pèlerinage légendaire de Mansa Musa",
    date: new Date('1324-01-01'),
    period: 'Moyen-Âge',
    location: {
      region: 'Mali actuel',
      coordinates: { lat: 12.65, lng: -8.0 }
    },
    category: ['Religion', 'Commerce', 'Culture'],
    tags: ['Mansa Musa', 'Empire du Mali', 'Pèlerinage', 'Or', 'Commerce transsaharien'],
    importance: 5,
    verified: true,
  },
  {
    title: "Apogée de l'Empire Songhaï",
    description: "Sous le règne de l'Askia Mohammed Ier, l'Empire Songhaï atteint son apogée, contrôlant un vaste territoire et faisant de Tombouctou un centre intellectuel et commercial majeur. L'université de Sankoré attire des savants de tout le monde musulman.",
    shortDescription: "L'Empire Songhaï à son apogée",
    date: new Date('1493-01-01'),
    period: 'Moyen-Âge',
    location: {
      region: 'Mali, Niger, Burkina Faso actuels',
      coordinates: { lat: 16.77, lng: -3.01 }
    },
    category: ['Politique', 'Culture', 'Commerce'],
    tags: ['Empire Songhaï', 'Askia Mohammed', 'Tombouctou', 'Sankoré', 'Éducation'],
    importance: 5,
    verified: true,
  },
  {
    title: "Résistance de la Reine Nzinga Mbande",
    description: "La Reine Nzinga Mbande du royaume de Ndongo et Matamba (actuel Angola) mène une résistance acharnée contre la colonisation portugaise pendant plus de 30 ans. Stratège militaire exceptionnelle, elle négocie des alliances et défend l'indépendance de son peuple.",
    shortDescription: "Résistance de la Reine Nzinga contre les Portugais",
    date: new Date('1624-01-01'),
    period: 'Période Moderne',
    location: {
      region: 'Angola actuel',
      coordinates: { lat: -8.83, lng: 13.23 }
    },
    category: ['Guerre', 'Politique'],
    tags: ['Reine Nzinga', 'Résistance', 'Angola', 'Colonisation', 'Femme dirigeante'],
    importance: 5,
    verified: true,
  },
  {
    title: "Conférence de Berlin",
    description: "Les puissances européennes se réunissent à Berlin pour se partager l'Afrique sans consulter les Africains. Cette conférence marque le début du 'Scramble for Africa' (la course à l'Afrique) et la colonisation systématique du continent.",
    shortDescription: "Partage de l'Afrique par les puissances européennes",
    date: new Date('1884-11-15'),
    endDate: new Date('1885-02-26'),
    period: 'Époque Contemporaine',
    location: {
      region: 'Berlin, Allemagne',
      coordinates: { lat: 52.52, lng: 13.41 }
    },
    category: ['Politique', 'Guerre'],
    tags: ['Colonisation', 'Conférence de Berlin', 'Scramble for Africa', 'Europe'],
    importance: 5,
    verified: true,
  },
  {
    title: "Indépendance du Ghana",
    description: "Le Ghana devient le premier pays d'Afrique subsaharienne à obtenir son indépendance de la domination coloniale britannique, sous la direction de Kwame Nkrumah. Cet événement inspire les mouvements d'indépendance à travers tout le continent.",
    shortDescription: "Première indépendance d'Afrique subsaharienne",
    date: new Date('1957-03-06'),
    period: 'Époque Contemporaine',
    location: {
      region: 'Ghana',
      coordinates: { lat: 5.56, lng: -0.20 }
    },
    category: ['Politique'],
    tags: ['Indépendance', 'Ghana', 'Kwame Nkrumah', 'Décolonisation'],
    importance: 5,
    verified: true,
  },
  {
    title: "L'Année de l'Afrique",
    description: "En 1960, 17 pays africains accèdent à l'indépendance, marquant un tournant majeur dans l'histoire du continent. Cette année est célébrée comme 'l'Année de l'Afrique' et symbolise la fin de la domination coloniale.",
    shortDescription: "17 pays africains obtiennent leur indépendance",
    date: new Date('1960-01-01'),
    period: 'Époque Contemporaine',
    location: {
      region: 'Afrique',
      coordinates: { lat: 8.0, lng: 10.0 }
    },
    category: ['Politique'],
    tags: ['Indépendance', 'Décolonisation', '1960', 'Panafricanisme'],
    importance: 5,
    verified: true,
  },
  {
    title: "Fin de l'apartheid en Afrique du Sud",
    description: "Nelson Mandela est libéré après 27 ans de prison et devient le premier président noir d'Afrique du Sud démocratique. La fin de l'apartheid marque une victoire historique pour les droits humains et la justice raciale.",
    shortDescription: "Fin de l'apartheid et élection de Nelson Mandela",
    date: new Date('1994-04-27'),
    period: 'Époque Contemporaine',
    location: {
      region: 'Afrique du Sud',
      coordinates: { lat: -25.75, lng: 28.19 }
    },
    category: ['Politique'],
    tags: ['Nelson Mandela', 'Apartheid', 'Afrique du Sud', 'Droits humains'],
    importance: 5,
    verified: true,
  },
  {
    title: "Construction des Pyramides de Gizeh",
    description: "Construction de la Grande Pyramide de Khéops, l'une des Sept Merveilles du monde antique. Cette réalisation architecturale exceptionnelle témoigne de l'avancement technologique et de l'organisation sociale de l'Égypte antique.",
    shortDescription: "Construction de la Grande Pyramide",
    date: new Date('-2580-01-01'),
    period: 'Antiquité',
    location: {
      region: 'Égypte',
      coordinates: { lat: 29.98, lng: 31.13 }
    },
    category: ['Art', 'Culture', 'Science'],
    tags: ['Pyramides', 'Égypte antique', 'Khéops', 'Architecture', 'Merveilles du monde'],
    importance: 5,
    verified: true,
  },
  {
    title: "Royaume d'Axoum",
    description: "Le royaume d'Axoum, situé dans l'actuelle Éthiopie et Érythrée, devient une puissance commerciale majeure, contrôlant les routes commerciales entre l'Afrique, l'Arabie et l'Inde. Il adopte le christianisme au IVe siècle.",
    shortDescription: "Apogée du royaume d'Axoum",
    date: new Date('100-01-01'),
    period: 'Antiquité',
    location: {
      region: 'Éthiopie, Érythrée',
      coordinates: { lat: 14.13, lng: 38.72 }
    },
    category: ['Politique', 'Commerce', 'Religion'],
    tags: ['Axoum', 'Éthiopie', 'Commerce', 'Christianisme', 'Royaume'],
    importance: 4,
    verified: true,
  },
]

const seedTimeline = async () => {
  try {
    await connectDB()
    logger.info('🔄 Début de l\'ajout des événements historiques...')

    let created = 0
    let ignored = 0
    const errors = []

    for (const eventData of timelineEventsData) {
      try {
        const existingEvent = await TimelineEvent.findOne({ title: eventData.title })

        if (existingEvent) {
          logger.info(`⏭️  Événement déjà existant: "${eventData.title}"`)
          ignored++
          continue
        }

        // Chercher le pays si une région est spécifiée
        if (eventData.location?.region) {
          const countryName = eventData.location.region.split(' ')[0] // Prendre le premier mot comme nom de pays approximatif
          const country = await Country.findOne({
            $or: [
              { nameFr: { $regex: countryName, $options: 'i' } },
              { name: { $regex: countryName, $options: 'i' } }
            ]
          })
          if (country) {
            eventData.location.country = country._id
          }
        }

        await TimelineEvent.create(eventData)
        created++
        logger.info(`✅ Événement créé: "${eventData.title}" (${eventData.period})`)
      } catch (error) {
        errors.push({ event: eventData.title, error: error.message })
        logger.error('❌ Erreur lors de l\'ajout de l\'événement', { event: eventData.title, error: error.message })
        ignored++
      }
    }

    logger.info(`✨ Ajout terminé: ${created} événements créés, ${ignored} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach(err => logger.warn(`   - ${err.event}: ${err.error}`))
    }
    return { created, ignored, errors }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du script de seed', { message: error.message, stack: error.stack })
    throw error
  }
}

// Exporter la fonction
export { seedTimeline }

// Exécuter si appelé directement (pas en import)
if (process.argv[1] && process.argv[1].includes('seedTimeline.js')) {
  seedTimeline().then(() => process.exit(0)).catch(() => process.exit(1))
}

