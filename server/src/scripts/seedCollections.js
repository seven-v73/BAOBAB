import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Collection from '../models/Collection.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const seedCollections = async () => {
  try {
    // Ne pas reconnecter si déjà connecté
    if (mongoose.connection.readyState === 0) {
      await connectDB()
    }
    logger.info('🔄 Début de l\'ajout des collections...')

    // Récupérer des événements et personnages existants pour les collections
    const events = await TimelineEvent.find().limit(10)
    const figures = await HistoricalFigure.find().limit(10)
    const countries = await Country.find().limit(5)

    const collectionsData = [
      {
        title: "Les Grands Empires Africains",
        description: "Explorez l'histoire des plus grands empires qui ont marqué le continent africain, de l'Égypte antique aux empires médiévaux de l'Ouest africain. Découvrez comment ces civilisations ont prospéré, échangé, et influencé le monde.",
        shortDescription: "Découvrez les empires qui ont façonné l'Afrique",
        theme: ['Empires', 'Événements'],
        difficulty: 'intermediate',
        estimatedTime: 45,
        tags: ['Empires', 'Histoire', 'Politique', 'Commerce', 'Civilisation'],
        isFeatured: true,
        order: 1,
        items: []
      },
      {
        title: "Figures Féminines de l'Histoire Africaine",
        description: "Découvrez les femmes exceptionnelles qui ont marqué l'histoire de l'Afrique : reines guerrières, diplomates, et leaders visionnaires. Leur courage et leur sagesse continuent d'inspirer les générations actuelles.",
        shortDescription: "Portraits de femmes dirigeantes africaines",
        theme: ['Personnages', 'Culture'],
        difficulty: 'beginner',
        estimatedTime: 30,
        tags: ['Femmes', 'Leadership', 'Résistance', 'Histoire', 'Inspiration'],
        isFeatured: true,
        order: 2,
        items: []
      },
      {
        title: "Résistances et Indépendances",
        description: "Parcourez les mouvements de résistance et les luttes pour l'indépendance qui ont libéré l'Afrique de la domination coloniale. Une histoire de courage, de détermination et de liberté.",
        shortDescription: "Luttes pour la liberté et l'indépendance",
        theme: ['Événements', 'Guerre'],
        difficulty: 'intermediate',
        estimatedTime: 40,
        tags: ['Indépendance', 'Résistance', 'Décolonisation', 'Liberté', 'Courage'],
        isFeatured: true,
        order: 3,
        items: []
      },
      {
        title: "Routes Commerciales Transsahariennes",
        description: "Explorez les routes commerciales qui reliaient l'Afrique du Nord au reste du continent, échangeant or, sel, et savoir. Ces routes ont façonné l'économie et la culture africaine pendant des siècles.",
        shortDescription: "Histoire du commerce transsaharien",
        theme: ['Commerce', 'Géographie'],
        difficulty: 'beginner',
        estimatedTime: 25,
        tags: ['Commerce', 'Routes', 'Or', 'Sel', 'Échanges', 'Économie'],
        isFeatured: false,
        order: 4,
        items: []
      },
      {
        title: "L'Art et la Culture Africaine",
        description: "Plongez dans la richesse artistique et culturelle de l'Afrique : masques, sculptures, textiles, musique, et traditions orales qui témoignent de la créativité et de la diversité du continent.",
        shortDescription: "Exploration de l'art et de la culture africaine",
        theme: ['Art', 'Culture'],
        difficulty: 'beginner',
        estimatedTime: 35,
        tags: ['Art', 'Culture', 'Traditions', 'Créativité', 'Diversité'],
        isFeatured: true,
        order: 5,
        items: []
      },
      {
        title: "Les Rois et Reines Légendaires",
        description: "Découvrez les monarques qui ont gouverné avec sagesse et force : de Soundiata Keïta à Mansa Musa, en passant par la Reine Nzinga. Leurs règnes ont marqué l'histoire.",
        shortDescription: "Portraits des souverains africains",
        theme: ['Personnages', 'Empires'],
        difficulty: 'intermediate',
        estimatedTime: 50,
        tags: ['Rois', 'Reines', 'Monarchie', 'Gouvernance', 'Histoire'],
        isFeatured: true,
        order: 6,
        items: []
      },
      {
        title: "L'Innovation et la Science en Afrique",
        description: "Explorez les contributions scientifiques et technologiques de l'Afrique : mathématiques, astronomie, médecine, architecture. Des savoirs ancestraux qui continuent d'inspirer.",
        shortDescription: "Découvertes et innovations africaines",
        theme: ['Innovation', 'Culture'],
        difficulty: 'advanced',
        estimatedTime: 40,
        tags: ['Science', 'Innovation', 'Technologie', 'Savoir', 'Découvertes'],
        isFeatured: false,
        order: 7,
        items: []
      },
      {
        title: "Religions et Spiritualité Africaine",
        description: "Comprenez la diversité religieuse et spirituelle de l'Afrique : traditions ancestrales, islam, christianisme, et leurs interactions. Une histoire de foi et de tolérance.",
        shortDescription: "Histoire des religions en Afrique",
        theme: ['Religion', 'Culture'],
        difficulty: 'intermediate',
        estimatedTime: 35,
        tags: ['Religion', 'Spiritualité', 'Traditions', 'Foi', 'Tolérance'],
        isFeatured: false,
        order: 8,
        items: []
      },
    ]

    let created = 0
    let ignored = 0
    const errors = []

    for (const collectionData of collectionsData) {
      try {
        const existingCollection = await Collection.findOne({ title: collectionData.title })

        if (existingCollection) {
          logger.info(`⏭️  Collection déjà existante: "${collectionData.title}"`)
          ignored++
          continue
        }

        // Ajouter des items selon le thème de la collection
        if (collectionData.title.includes('Empires')) {
          // Ajouter des événements liés aux empires
          const empireEvents = events.filter(e => 
            e.title.includes('Empire') || e.title.includes('Mali') || e.title.includes('Songhaï') || e.title.includes('Axoum')
          )
          collectionData.items = empireEvents.slice(0, 6).map((event, idx) => ({
            type: 'event',
            itemId: event._id,
            order: idx,
            notes: 'Événement majeur de l\'histoire des empires africains'
          }))
        } else if (collectionData.title.includes('Féminines')) {
          // Ajouter des personnages féminins
          const femaleFigures = figures.filter(f => 
            f.name.includes('Reine') || f.name.includes('Nzinga') || f.name.includes('Yaa') || f.name.includes('Asantewaa')
          )
          collectionData.items = femaleFigures.slice(0, 5).map((figure, idx) => ({
            type: 'figure',
            itemId: figure._id,
            order: idx,
            notes: 'Figure féminine exceptionnelle de l\'histoire africaine'
          }))
        } else if (collectionData.title.includes('Résistances')) {
          // Ajouter des événements et personnages de résistance
          const resistanceEvents = events.filter(e => 
            e.title.includes('Résistance') || e.title.includes('Indépendance') || e.title.includes('apartheid')
          )
          const resistanceFigures = figures.filter(f => 
            f.name.includes('Nzinga') || f.name.includes('Nkrumah') || f.name.includes('Mandela') || f.name.includes('Yaa')
          )
          collectionData.items = [
            ...resistanceEvents.slice(0, 4).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx,
              notes: 'Événement de résistance et d\'indépendance'
            })),
            ...resistanceFigures.slice(0, 4).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx + 4,
              notes: 'Figure emblématique de la résistance'
            }))
          ]
        } else if (collectionData.title.includes('Commerciales')) {
          // Ajouter des événements liés au commerce
          const commerceEvents = events.filter(e => 
            (Array.isArray(e.category) && e.category.includes('Commerce')) || e.title.includes('Mansa Musa') || e.title.includes('Pèlerinage')
          )
          const commerceFigures = figures.filter(f => 
            f.name.includes('Mansa Musa') || f.role.includes('Commerçant')
          )
          collectionData.items = [
            ...commerceEvents.slice(0, 3).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx,
              notes: 'Événement lié au commerce transsaharien'
            })),
            ...commerceFigures.slice(0, 2).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx + 3,
              notes: 'Personnage clé du commerce africain'
            }))
          ]
        } else if (collectionData.title.includes('Art et la Culture')) {
          // Mélange d'événements et de personnages liés à l'art
          const artEvents = events.filter(e => 
            (Array.isArray(e.category) && e.category.includes('Art')) || e.title.includes('Pyramides')
          )
          const artFigures = figures.filter(f => 
            f.role.includes('Artiste')
          )
          collectionData.items = [
            ...artEvents.slice(0, 4).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx,
              notes: 'Événement marquant de l\'art africain'
            })),
            ...artFigures.slice(0, 2).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx + 4,
              notes: 'Artiste et créateur africain'
            }))
          ]
        } else if (collectionData.title.includes('Rois et Reines')) {
          // Personnages royaux
          const royalFigures = figures.filter(f => 
            f.role.includes('Roi/Reine') || f.name.includes('Soundiata') || f.name.includes('Mansa') || f.name.includes('Askia')
          )
          const royalEvents = events.filter(e => 
            e.title.includes('Empire') || e.title.includes('Royaume')
          )
          collectionData.items = [
            ...royalFigures.slice(0, 5).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx,
              notes: 'Souverain légendaire de l\'Afrique'
            })),
            ...royalEvents.slice(0, 3).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx + 5,
              notes: 'Événement marquant des monarchies africaines'
            }))
          ]
        } else if (collectionData.title.includes('Innovation')) {
          // Événements et personnages liés à l'innovation
          const innovationEvents = events.filter(e => 
            (Array.isArray(e.category) && e.category.includes('Science')) || e.title.includes('Pyramides')
          )
          const innovationFigures = figures.filter(f => 
            f.role.includes('Savant') || f.role.includes('Innovateur')
          )
          collectionData.items = [
            ...innovationEvents.slice(0, 3).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx,
              notes: 'Découverte et innovation africaine'
            })),
            ...innovationFigures.slice(0, 3).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx + 3,
              notes: 'Savant et innovateur africain'
            }))
          ]
        } else if (collectionData.title.includes('Religions')) {
          // Événements liés à la religion
          const religionEvents = events.filter(e => 
            (Array.isArray(e.category) && e.category.includes('Religion')) || e.title.includes('Pèlerinage') || e.title.includes('Axoum')
          )
          const religionFigures = figures.filter(f => 
            f.role.includes('Religieux')
          )
          collectionData.items = [
            ...religionEvents.slice(0, 4).map((event, idx) => ({
              type: 'event',
              itemId: event._id,
              order: idx,
              notes: 'Événement religieux et spirituel'
            })),
            ...religionFigures.slice(0, 2).map((figure, idx) => ({
              type: 'figure',
              itemId: figure._id,
              order: idx + 4,
              notes: 'Figure religieuse africaine'
            }))
          ]
        }

        await Collection.create(collectionData)
        created++
        logger.info(`✅ Collection créée: "${collectionData.title}" avec ${collectionData.items.length} items`)
      } catch (error) {
        errors.push({ collection: collectionData.title, error: error.message })
        logger.error('❌ Erreur lors de l\'ajout de la collection', { collection: collectionData.title, error: error.message })
        ignored++
      }
    }

    logger.info(`✨ Ajout terminé: ${created} collections créées, ${ignored} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach(err => logger.warn(`   - ${err.collection}: ${err.error}`))
    }
    return { created, ignored, errors }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du script de seed', { message: error.message, stack: error.stack })
    throw error
  }
}

// Exporter la fonction
export { seedCollections }

// Exécuter si appelé directement (pas en import)
if (process.argv[1] && process.argv[1].includes('seedCollections.js')) {
  seedCollections().then(() => process.exit(0)).catch(() => process.exit(1))
}

