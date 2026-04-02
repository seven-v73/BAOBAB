import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const figuresData = [
  {
    name: "Soundiata Keïta",
    nameNative: "Sundiata Keita",
    birthDate: new Date('1190-01-01'),
    deathDate: new Date('1255-01-01'),
    birthPlace: {
      location: "Niani, Mali",
      coordinates: { lat: 12.65, lng: -8.0 }
    },
    role: ['Roi/Reine', 'Guerrier'],
    achievements: [
      "Fondation de l'Empire du Mali",
      "Victoire à la bataille de Kirina",
      "Création de la Charte du Manden"
    ],
    biography: "Soundiata Keïta est le fondateur légendaire de l'Empire du Mali. Né avec un handicap physique, il surmonte tous les obstacles pour unifier les peuples mandingues et créer l'un des plus grands empires de l'Afrique de l'Ouest. Sa victoire contre le roi Soumaoro Kanté à la bataille de Kirina en 1235 marque le début de l'empire. Il est également connu pour avoir établi la Charte du Manden, considérée comme l'une des premières déclarations des droits de l'homme.",
    shortBiography: "Fondateur de l'Empire du Mali, unificateur des peuples mandingues",
    tags: ['Empire du Mali', 'Guerrier', 'Fondateur', 'Mandingue'],
    verified: true,
  },
  {
    name: "Mansa Musa",
    nameNative: "Mansa Musa",
    birthDate: new Date('1280-01-01'),
    deathDate: new Date('1337-01-01'),
    birthPlace: {
      location: "Mali",
      coordinates: { lat: 12.65, lng: -8.0 }
    },
    role: ['Roi/Reine', 'Commerçant'],
    achievements: [
      "Pèlerinage fastueux à La Mecque",
      "Apogée économique de l'Empire du Mali",
      "Construction de mosquées et d'universités"
    ],
    biography: "Mansa Musa, dixième Mansa (empereur) de l'Empire du Mali, est considéré comme l'une des personnes les plus riches de l'histoire. Son pèlerinage à La Mecque en 1324 avec une caravane transportant des tonnes d'or a fait connaître la richesse du Mali dans tout le monde médiéval. Il a investi massivement dans l'éducation, construisant des mosquées et des universités, notamment à Tombouctou.",
    shortBiography: "Empereur du Mali, l'une des personnes les plus riches de l'histoire",
    quotes: [
      {
        text: "Je suis venu pour accomplir mon devoir religieux et pour voir le monde.",
        context: "Lors de son pèlerinage à La Mecque",
        verified: true
      }
    ],
    tags: ['Empire du Mali', 'Richesse', 'Commerce', 'Pèlerinage'],
    verified: true,
  },
  {
    name: "Reine Nzinga Mbande",
    nameNative: "Nzinga Mbande",
    birthDate: new Date('1583-01-01'),
    deathDate: new Date('1663-12-17'),
    birthPlace: {
      location: "Angola",
      coordinates: { lat: -8.83, lng: 13.23 }
    },
    role: ['Roi/Reine', 'Guerrier', 'Diplomate'],
    achievements: [
      "Résistance contre la colonisation portugaise pendant 30 ans",
      "Unification des royaumes de Ndongo et Matamba",
      "Stratégie militaire et diplomatique exceptionnelle"
    ],
    biography: "La Reine Nzinga Mbande est l'une des figures les plus remarquables de la résistance africaine à la colonisation. Reine des royaumes de Ndongo et Matamba (actuel Angola), elle a mené une guerre acharnée contre les Portugais pendant plus de trois décennies. Stratège militaire exceptionnelle, elle a négocié des alliances avec les Néerlandais et d'autres puissances européennes pour défendre l'indépendance de son peuple. Son courage et sa détermination en font une icône de la résistance féminine.",
    shortBiography: "Reine guerrière qui résista 30 ans à la colonisation portugaise",
    legacy: "Symbole de résistance et de leadership féminin en Afrique",
    culturalImpact: "Inspire encore aujourd'hui les mouvements de libération et d'émancipation",
    tags: ['Résistance', 'Angola', 'Femme dirigeante', 'Guerre', 'Diplomatie'],
    verified: true,
  },
  {
    name: "Kwame Nkrumah",
    nameNative: "Kwame Nkrumah",
    birthDate: new Date('1909-09-21'),
    deathDate: new Date('1972-04-27'),
    birthPlace: {
      location: "Ghana",
      coordinates: { lat: 5.56, lng: -0.20 }
    },
    role: ['Diplomate', 'Innovateur'],
    achievements: [
      "Premier président du Ghana indépendant",
      "Père du panafricanisme moderne",
      "Création de l'Organisation de l'unité africaine (OUA)"
    ],
    biography: "Kwame Nkrumah est le père de l'indépendance du Ghana et l'un des principaux architectes du panafricanisme moderne. Premier Premier ministre puis président du Ghana indépendant en 1957, il a été un fervent défenseur de l'unité africaine. Sa vision d'une Afrique unie et libre continue d'inspirer les générations actuelles.",
    shortBiography: "Père de l'indépendance du Ghana et du panafricanisme moderne",
    quotes: [
      {
        text: "L'Afrique doit s'unir !",
        context: "Discours sur l'unité africaine",
        verified: true
      },
      {
        text: "Seek ye first the political kingdom, and all things shall be added unto you.",
        context: "Citation célèbre sur l'indépendance",
        verified: true
      }
    ],
    legacy: "Visionnaire du panafricanisme et de l'unité africaine",
    tags: ['Indépendance', 'Ghana', 'Panafricanisme', 'Politique'],
    verified: true,
  },
  {
    name: "Nelson Mandela",
    nameNative: "Nelson Rolihlahla Mandela",
    birthDate: new Date('1918-07-18'),
    deathDate: new Date('2013-12-05'),
    birthPlace: {
      location: "Afrique du Sud",
      coordinates: { lat: -31.58, lng: 28.78 }
    },
    role: ['Diplomate'],
    achievements: [
      "Premier président noir d'Afrique du Sud",
      "27 ans de prison pour lutter contre l'apartheid",
      "Prix Nobel de la Paix 1993",
      "Réconciliation nationale"
    ],
    biography: "Nelson Mandela est une icône mondiale de la lutte pour la liberté et l'égalité. Emprisonné pendant 27 ans pour son combat contre l'apartheid, il est devenu le premier président noir d'Afrique du Sud démocratique en 1994. Son message de réconciliation et de pardon continue d'inspirer le monde entier.",
    shortBiography: "Icône mondiale de la lutte contre l'apartheid, premier président noir d'Afrique du Sud",
    quotes: [
      {
        text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde.",
        context: "Citation sur l'éducation",
        verified: true
      },
      {
        text: "Il semble toujours impossible jusqu'à ce qu'on le fasse.",
        context: "Citation inspirante",
        verified: true
      }
    ],
    legacy: "Symbole universel de paix, réconciliation et justice",
    culturalImpact: "Inspire les mouvements de libération et de droits humains dans le monde",
    tags: ['Apartheid', 'Afrique du Sud', 'Prix Nobel', 'Réconciliation', 'Droits humains'],
    verified: true,
  },
  {
    name: "Hannibal Barca",
    nameNative: "Hannibal Barca",
    birthDate: new Date('-247-01-01'),
    deathDate: new Date('-183-01-01'),
    birthPlace: {
      location: "Carthage (Tunisie actuelle)",
      coordinates: { lat: 36.85, lng: 10.33 }
    },
    role: ['Guerrier'],
    achievements: [
      "Traversée des Alpes avec des éléphants",
      "Victoires contre Rome pendant la deuxième guerre punique",
      "Considéré comme l'un des plus grands stratèges militaires de l'histoire"
    ],
    biography: "Hannibal Barca est l'un des plus grands généraux de l'Antiquité. Né à Carthage (actuelle Tunisie), il a mené une campagne militaire légendaire contre la République romaine, traversant les Alpes avec une armée et des éléphants. Ses tactiques militaires innovantes continuent d'être étudiées dans les académies militaires.",
    shortBiography: "Général carthaginois, l'un des plus grands stratèges militaires de l'histoire",
    tags: ['Carthage', 'Guerre', 'Stratégie militaire', 'Rome', 'Éléphants'],
    verified: true,
  },
  {
    name: "Yaa Asantewaa",
    nameNative: "Yaa Asantewaa",
    birthDate: new Date('1840-01-01'),
    deathDate: new Date('1921-10-17'),
    birthPlace: {
      location: "Ghana",
      coordinates: { lat: 6.69, lng: -1.62 }
    },
    role: ['Roi/Reine', 'Guerrier'],
    achievements: [
      "Reine mère du peuple Ashanti",
      "Menée de la guerre de l'Âge d'Or contre les Britanniques",
      "Symbole de résistance féminine"
    ],
    biography: "Yaa Asantewaa est la reine mère du peuple Ashanti qui a mené la guerre de l'Âge d'Or contre la colonisation britannique en 1900. Après que les hommes aient hésité à se battre, elle a pris les armes et dirigé la résistance, devenant un symbole de courage et de leadership féminin.",
    shortBiography: "Reine mère Ashanti, héroïne de la résistance contre les Britanniques",
    legacy: "Icône de la résistance féminine et du courage",
    tags: ['Ghana', 'Ashanti', 'Résistance', 'Femme dirigeante', 'Guerre'],
    verified: true,
  },
  {
    name: "Askia Mohammed Ier",
    nameNative: "Askia Muhammad",
    birthDate: new Date('1443-01-01'),
    deathDate: new Date('1538-01-01'),
    birthPlace: {
      location: "Mali",
      coordinates: { lat: 16.77, lng: -3.01 }
    },
    role: ['Roi/Reine', 'Innovateur'],
    achievements: [
      "Apogée de l'Empire Songhaï",
      "Réformes administratives et économiques",
      "Développement de Tombouctou comme centre intellectuel"
    ],
    biography: "Askia Mohammed Ier a porté l'Empire Songhaï à son apogée au XVe siècle. Il a mis en place des réformes administratives et économiques qui ont fait de l'empire une puissance régionale. Sous son règne, Tombouctou est devenue un centre intellectuel majeur avec l'université de Sankoré.",
    shortBiography: "Empereur qui porta l'Empire Songhaï à son apogée",
    tags: ['Empire Songhaï', 'Tombouctou', 'Réformes', 'Éducation'],
    verified: true,
  },
]

const seedFigures = async () => {
  try {
    // Ne pas reconnecter si déjà connecté
    if (mongoose.connection.readyState === 0) {
      await connectDB()
    }
    logger.info('🔄 Début de l\'ajout des personnages historiques...')

    let created = 0
    let ignored = 0
    const errors = []

    for (const figureData of figuresData) {
      try {
        const existingFigure = await HistoricalFigure.findOne({ name: figureData.name })

        if (existingFigure) {
          logger.info(`⏭️  Personnage déjà existant: "${figureData.name}"`)
          ignored++
          continue
        }

        // Chercher le pays pour birthPlace
        if (figureData.birthPlace?.location) {
          const locationParts = figureData.birthPlace.location.split(',')
          const countryName = locationParts[locationParts.length - 1].trim()
          const country = await Country.findOne({
            $or: [
              { nameFr: { $regex: countryName, $options: 'i' } },
              { name: { $regex: countryName, $options: 'i' } }
            ]
          })
          if (country) {
            figureData.birthPlace.country = country._id
            figureData.relatedCountries = [country._id]
          }
        }

        await HistoricalFigure.create(figureData)
        created++
        logger.info(`✅ Personnage créé: "${figureData.name}"`)
      } catch (error) {
        errors.push({ figure: figureData.name, error: error.message })
        logger.error('❌ Erreur lors de l\'ajout du personnage', { figure: figureData.name, error: error.message })
        ignored++
      }
    }

    logger.info(`✨ Ajout terminé: ${created} personnages créés, ${ignored} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach(err => logger.warn(`   - ${err.figure}: ${err.error}`))
    }
    return { created, ignored, errors }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du script de seed', { message: error.message, stack: error.stack })
    throw error
  }
}

// Exporter la fonction
export { seedFigures }

// Exécuter si appelé directement (pas en import)
if (process.argv[1] && process.argv[1].includes('seedFigures.js')) {
  seedFigures().then(() => process.exit(0)).catch(() => process.exit(1))
}

