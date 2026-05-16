import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Quiz from '../models/Quiz.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const quizzesData = [
  {
    title: 'Histoire de l\'Afrique - Les Grands Empires',
    description: 'Testez vos connaissances sur les grands empires africains qui ont marqué l\'histoire du continent.',
    difficulty: 'beginner',
    timeLimit: 600, // 10 minutes
    passingScore: 60,
    tags: ['Histoire', 'Empires', 'Afrique'],
    questions: [
      {
        question: 'Quel était le nom de l\'empire qui a dominé l\'Afrique de l\'Ouest du XIIIe au XVIe siècle ?',
        type: 'multiple-choice',
        options: [
          'Empire du Ghana',
          'Empire du Mali',
          'Empire Songhaï',
          'Empire du Kanem-Bornou'
        ],
        correctAnswer: 1,
        explanation: 'L\'Empire du Mali, fondé par Soundiata Keïta, était l\'un des plus grands empires d\'Afrique de l\'Ouest. Il a prospéré grâce au commerce de l\'or et du sel.',
        points: 20,
        order: 0
      },
      {
        question: 'Qui était le souverain le plus célèbre de l\'Empire du Mali, connu pour son pèlerinage à La Mecque ?',
        type: 'multiple-choice',
        options: [
          'Soundiata Keïta',
          'Mansa Moussa',
          'Askia Mohammed',
          'Sundiata Keita'
        ],
        correctAnswer: 1,
        explanation: 'Mansa Moussa (1280-1337) était l\'empereur du Mali. Son pèlerinage à La Mecque en 1324 était si fastueux qu\'il a fait chuter le prix de l\'or en Égypte pendant plusieurs années.',
        points: 25,
        order: 1
      },
      {
        question: 'L\'Empire du Ghana était situé dans l\'actuel Mali.',
        type: 'true-false',
        options: [],
        correctAnswer: false,
        explanation: 'L\'Empire du Ghana était situé dans l\'actuel Ghana et sud-est de la Mauritanie, pas dans le Mali actuel.',
        points: 15,
        order: 2
      },
      {
        question: 'Quel empire a succédé à l\'Empire du Mali en Afrique de l\'Ouest ?',
        type: 'multiple-choice',
        options: [
          'Empire du Ghana',
          'Empire Songhaï',
          'Empire du Kanem-Bornou',
          'Empire Ashanti'
        ],
        correctAnswer: 1,
        explanation: 'L\'Empire Songhaï a succédé au Mali et est devenu le plus grand empire de l\'Afrique de l\'Ouest au XVe et XVIe siècle.',
        points: 20,
        order: 3
      },
      {
        question: 'Quelle était la capitale de l\'Empire Songhaï ?',
        type: 'multiple-choice',
        options: [
          'Tombouctou',
          'Gao',
          'Djenné',
          'Koumbi Saleh'
        ],
        correctAnswer: 1,
        explanation: 'Gao était la capitale de l\'Empire Songhaï, tandis que Tombouctou était un important centre commercial et culturel.',
        points: 20,
        order: 4
      }
    ]
  },
  {
    title: 'Géographie de l\'Afrique',
    description: 'Découvrez les merveilles géographiques du continent africain.',
    difficulty: 'beginner',
    timeLimit: 480, // 8 minutes
    passingScore: 70,
    tags: ['Géographie', 'Afrique', 'Nature'],
    questions: [
      {
        question: 'Quel est le plus long fleuve d\'Afrique ?',
        type: 'multiple-choice',
        options: [
          'Le Nil',
          'Le Congo',
          'Le Niger',
          'Le Zambèze'
        ],
        correctAnswer: 0,
        explanation: 'Le Nil est le plus long fleuve d\'Afrique (6 650 km) et l\'un des plus longs au monde. Il traverse 11 pays africains.',
        points: 20,
        order: 0
      },
      {
        question: 'Quel est le plus haut sommet d\'Afrique ?',
        type: 'multiple-choice',
        options: [
          'Mont Kilimandjaro',
          'Mont Kenya',
          'Mont Elgon',
          'Mont Toubkal'
        ],
        correctAnswer: 0,
        explanation: 'Le Mont Kilimandjaro en Tanzanie est le plus haut sommet d\'Afrique avec 5 895 mètres d\'altitude.',
        points: 20,
        order: 1
      },
      {
        question: 'Le désert du Sahara est le plus grand désert chaud du monde.',
        type: 'true-false',
        options: [],
        correctAnswer: true,
        explanation: 'Le Sahara est effectivement le plus grand désert chaud du monde, couvrant environ 9,2 millions de km².',
        points: 15,
        order: 2
      },
      {
        question: 'Quel lac africain est le deuxième plus grand lac d\'eau douce au monde ?',
        type: 'multiple-choice',
        options: [
          'Lac Victoria',
          'Lac Tanganyika',
          'Lac Malawi',
          'Lac Tchad'
        ],
        correctAnswer: 0,
        explanation: 'Le Lac Victoria est le deuxième plus grand lac d\'eau douce au monde après le Lac Supérieur en Amérique du Nord.',
        points: 25,
        order: 3
      },
      {
        question: 'Combien de pays composent l\'Afrique ?',
        type: 'multiple-choice',
        options: [
          '52',
          '54',
          '56',
          '58'
        ],
        correctAnswer: 1,
        explanation: 'L\'Afrique compte 54 pays reconnus internationalement, plus le Sahara occidental (territoire disputé).',
        points: 20,
        order: 4
      }
    ]
  },
  {
    title: 'Cultures et Traditions Africaines',
    description: 'Explorez la richesse culturelle et les traditions du continent africain.',
    difficulty: 'intermediate',
    timeLimit: 600, // 10 minutes
    passingScore: 65,
    tags: ['Culture', 'Traditions', 'Afrique'],
    questions: [
      {
        question: 'Quelle est la langue la plus parlée en Afrique ?',
        type: 'multiple-choice',
        options: [
          'Arabe',
          'Swahili',
          'Hausa',
          'Yoruba'
        ],
        correctAnswer: 0,
        explanation: 'L\'arabe est la langue la plus parlée en Afrique avec environ 150 millions de locuteurs, principalement en Afrique du Nord.',
        points: 20,
        order: 0
      },
      {
        question: 'Quel instrument de musique est traditionnellement associé à l\'Afrique de l\'Ouest ?',
        type: 'multiple-choice',
        options: [
          'Kora',
          'Djembe',
          'Balafon',
          'Tous les trois'
        ],
        correctAnswer: 3,
        explanation: 'La kora, le djembe et le balafon sont tous des instruments traditionnels de l\'Afrique de l\'Ouest.',
        points: 25,
        order: 1
      },
      {
        question: 'Le griot est un musicien et conteur traditionnel en Afrique de l\'Ouest.',
        type: 'true-false',
        options: [],
        correctAnswer: true,
        explanation: 'Les griots sont des gardiens de la tradition orale en Afrique de l\'Ouest, transmettant l\'histoire et la culture à travers la musique et la parole.',
        points: 15,
        order: 2
      },
      {
        question: 'Quelle danse traditionnelle est originaire d\'Afrique du Sud ?',
        type: 'multiple-choice',
        options: [
          'Soukous',
          'Gumboot',
          'Kizomba',
          'Makossa'
        ],
        correctAnswer: 1,
        explanation: 'La danse Gumboot est originaire d\'Afrique du Sud, créée par les mineurs noirs comme forme d\'expression et de communication.',
        points: 20,
        order: 3
      },
      {
        question: 'Quel pays africain est connu pour ses masques traditionnels et sa sculpture sur bois ?',
        type: 'multiple-choice',
        options: [
          'Nigeria',
          'Côte d\'Ivoire',
          'Cameroun',
          'Tous les trois'
        ],
        correctAnswer: 3,
        explanation: 'Le Nigeria, la Côte d\'Ivoire et le Cameroun sont tous réputés pour leurs masques traditionnels et leur sculpture sur bois.',
        points: 20,
        order: 4
      }
    ]
  },
  {
    title: 'Personnages Historiques Africains',
    description: 'Testez vos connaissances sur les grandes figures qui ont marqué l\'histoire de l\'Afrique.',
    difficulty: 'intermediate',
    timeLimit: 600, // 10 minutes
    passingScore: 70,
    tags: ['Histoire', 'Personnages', 'Afrique'],
    questions: [
      {
        question: 'Qui était la reine guerrière du royaume du Dahomey (actuel Bénin) ?',
        type: 'multiple-choice',
        options: [
          'Reine Nzinga',
          'Reine Amina',
          'Reine Hangbe',
          'Reine Yaa Asantewaa'
        ],
        correctAnswer: 2,
        explanation: 'La Reine Hangbe (ou Hangbè) était une reine guerrière du royaume du Dahomey au début du XVIIIe siècle.',
        points: 25,
        order: 0
      },
      {
        question: 'Quel leader africain a dirigé la résistance contre la colonisation française en Algérie ?',
        type: 'multiple-choice',
        options: [
          'Samori Touré',
          'Abd el-Kader',
          'Behanzin',
          'Menelik II'
        ],
        correctAnswer: 1,
        explanation: 'Abd el-Kader (1808-1883) était un leader algérien qui a résisté à la colonisation française pendant 15 ans.',
        points: 25,
        order: 1
      },
      {
        question: 'Nelson Mandela a été le premier président noir d\'Afrique du Sud.',
        type: 'true-false',
        options: [],
        correctAnswer: true,
        explanation: 'Nelson Mandela est effectivement devenu le premier président noir d\'Afrique du Sud en 1994, après la fin de l\'apartheid.',
        points: 20,
        order: 2
      },
      {
        question: 'Quel empereur éthiopien a vaincu les Italiens à la bataille d\'Adwa en 1896 ?',
        type: 'multiple-choice',
        options: [
          'Tewodros II',
          'Yohannes IV',
          'Menelik II',
          'Haile Selassie'
        ],
        correctAnswer: 2,
        explanation: 'Menelik II a mené l\'Éthiopie à la victoire contre l\'Italie à la bataille d\'Adwa, préservant l\'indépendance du pays.',
        points: 30,
        order: 3
      }
    ]
  },
  {
    title: 'Indépendances Africaines',
    description: 'Connaissez-vous les dates et les événements clés des indépendances africaines ?',
    difficulty: 'advanced',
    timeLimit: 720, // 12 minutes
    passingScore: 75,
    tags: ['Histoire', 'Indépendance', 'Politique'],
    questions: [
      {
        question: 'Quel pays africain a été le premier à obtenir son indépendance en 1957 ?',
        type: 'multiple-choice',
        options: [
          'Ghana',
          'Guinée',
          'Sénégal',
          'Mali'
        ],
        correctAnswer: 0,
        explanation: 'Le Ghana, sous la direction de Kwame Nkrumah, a été le premier pays d\'Afrique subsaharienne à obtenir son indépendance en 1957.',
        points: 25,
        order: 0
      },
      {
        question: 'En quelle année la plupart des pays d\'Afrique de l\'Ouest ont-ils obtenu leur indépendance ?',
        type: 'multiple-choice',
        options: [
          '1958',
          '1960',
          '1962',
          '1964'
        ],
        correctAnswer: 1,
        explanation: '1960 est connue comme "l\'année de l\'Afrique" car 17 pays africains ont obtenu leur indépendance cette année-là.',
        points: 30,
        order: 1
      },
      {
        question: 'L\'Algérie a obtenu son indépendance en 1962.',
        type: 'true-false',
        options: [],
        correctAnswer: true,
        explanation: 'L\'Algérie a effectivement obtenu son indépendance de la France en 1962 après une guerre de libération de 8 ans.',
        points: 20,
        order: 2
      },
      {
        question: 'Quel leader a dirigé la lutte pour l\'indépendance du Kenya ?',
        type: 'multiple-choice',
        options: [
          'Jomo Kenyatta',
          'Kwame Nkrumah',
          'Léopold Sédar Senghor',
          'Julius Nyerere'
        ],
        correctAnswer: 0,
        explanation: 'Jomo Kenyatta a dirigé la lutte pour l\'indépendance du Kenya et est devenu le premier président du pays en 1964.',
        points: 25,
        order: 3
      }
    ]
  },
  {
    title: 'Faune et Flore Africaines',
    description: 'Découvrez la biodiversité exceptionnelle du continent africain.',
    difficulty: 'beginner',
    timeLimit: 480, // 8 minutes
    passingScore: 65,
    tags: ['Nature', 'Faune', 'Flore', 'Biodiversité'],
    questions: [
      {
        question: 'Quel est le plus grand mammifère terrestre d\'Afrique ?',
        type: 'multiple-choice',
        options: [
          'Lion',
          'Éléphant d\'Afrique',
          'Rhinocéros',
          'Hippopotame'
        ],
        correctAnswer: 1,
        explanation: 'L\'éléphant d\'Afrique est le plus grand mammifère terrestre, pouvant peser jusqu\'à 6 tonnes.',
        points: 20,
        order: 0
      },
      {
        question: 'Quel animal est connu comme le "roi de la jungle" en Afrique ?',
        type: 'multiple-choice',
        options: [
          'Lion',
          'Léopard',
          'Guépard',
          'Hyène'
        ],
        correctAnswer: 0,
        explanation: 'Le lion est souvent appelé le "roi de la jungle" bien qu\'il vive principalement dans la savane.',
        points: 15,
        order: 1
      },
      {
        question: 'Le baobab est un arbre emblématique de l\'Afrique.',
        type: 'true-false',
        options: [],
        correctAnswer: true,
        explanation: 'Le baobab est effectivement un arbre emblématique de l\'Afrique, pouvant vivre plus de 1000 ans.',
        points: 15,
        order: 2
      },
      {
        question: 'Quelle région d\'Afrique abrite le plus grand nombre d\'espèces animales ?',
        type: 'multiple-choice',
        options: [
          'Sahara',
          'Savane',
          'Forêt tropicale',
          'Désert du Kalahari'
        ],
        correctAnswer: 2,
        explanation: 'Les forêts tropicales africaines, notamment le bassin du Congo, abritent une biodiversité exceptionnelle.',
        points: 25,
        order: 3
      },
      {
        question: 'Quel est le plus rapide des animaux terrestres, présent en Afrique ?',
        type: 'multiple-choice',
        options: [
          'Lion',
          'Guépard',
          'Antilope',
          'Zèbre'
        ],
        correctAnswer: 1,
        explanation: 'Le guépard est l\'animal terrestre le plus rapide, capable d\'atteindre 110 km/h en quelques secondes.',
        points: 25,
        order: 4
      }
    ]
  }
]

const seedQuizzes = async () => {
  try {
    await connectDB()
    logger.info('🔄 Début de l\'ajout des quiz africains...')

    let created = 0
    let ignored = 0
    const errors = []

    for (const quizData of quizzesData) {
      try {
        // Vérifier si le quiz existe déjà
        const existingQuiz = await Quiz.findOne({ title: quizData.title })

        if (existingQuiz) {
          logger.info(`⏭️  Quiz déjà existant: "${quizData.title}"`)
          ignored++
          continue
        }

        // Créer le quiz
        await Quiz.create(quizData)
        created++
        logger.info(`✅ Quiz créé: "${quizData.title}" (${quizData.difficulty})`)
      } catch (error) {
        errors.push({ quiz: quizData.title, error: error.message })
        logger.error('❌ Erreur lors de l\'ajout du quiz', { quiz: quizData.title, error: error.message })
        ignored++
      }
    }

    logger.info(`✨ Ajout terminé: ${created} quiz créés, ${ignored} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach(err => logger.warn(`   - ${err.quiz}: ${err.error}`))
    }
    return { created, ignored, errors }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du script de seed', { message: error.message, stack: error.stack })
    throw error
  }
}

export { seedQuizzes }

if (process.argv[1] && process.argv[1].includes('seedQuizzes.js')) {
  seedQuizzes().then(() => process.exit(0)).catch(() => process.exit(1))
}
