import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Story from '../models/Story.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const storiesData = [
  {
    title: "L'Épopée de Soundiata",
    subtitle: "Le Lion du Manding",
    description: "Découvrez l'histoire épique de Soundiata Keïta, de son enfance difficile à sa victoire légendaire qui fonda l'Empire du Mali.",
    category: 'Épopée',
    difficulty: 'beginner',
    author: 'BAOBAB Team',
    tags: ['Soundiata', 'Empire du Mali', 'Épopée', 'Légende'],
    chapters: [
      {
        title: "L'Enfance du Lion",
        content: "Soundiata naquit dans le royaume du Manding, mais une malédiction le frappa dès sa naissance. Il ne pouvait ni marcher ni se tenir debout. Sa mère, Sogolon, l'éleva avec amour malgré les moqueries du royaume. Personne ne pouvait imaginer que cet enfant handicapé deviendrait un jour le plus grand roi de l'Afrique de l'Ouest.\n\nLes années passèrent, et Soundiata grandit en observant, en apprenant, en développant sa force intérieure. Un jour, alors qu'il avait sept ans, sa mère fut humiliée par la première épouse du roi. La colère de Soundiata fut si grande qu'il se leva pour la première fois, brisant les barres de fer qui soutenaient sa maison.",
        order: 1,
      },
      {
        title: "L'Exil",
        content: "Après la mort de son père, Soundiata et sa famille furent contraints à l'exil. Ils errèrent de royaume en royaume, cherchant refuge. Pendant ces années difficiles, Soundiata apprit les arts de la guerre, la diplomatie, et forgea des alliances avec les peuples qu'il rencontrait.\n\nIl devint un guerrier redoutable et un leader charismatique. Les récits de ses exploits commencèrent à se répandre, et les peuples opprimés du Manding commencèrent à voir en lui leur libérateur.",
        order: 2,
      },
      {
        title: "La Bataille de Kirina",
        content: "Le moment décisif arriva. Soumaoro Kanté, le roi tyran de Sosso, avait asservi tout le Manding. Soundiata rassembla une grande armée et marcha contre lui.\n\nLa bataille de Kirina fut légendaire. Les deux armées s'affrontèrent avec férocité. Soundiata, monté sur son cheval, chargea directement Soumaoro. Leurs lances se croisèrent, et dans un combat épique, Soundiata triompha.\n\nAvec cette victoire, Soundiata unifia tous les peuples mandingues et fonda l'Empire du Mali, qui deviendrait l'un des plus grands empires de l'histoire africaine.",
        order: 3,
      },
    ],
    readingTime: 15,
    tags: ['Soundiata', 'Empire du Mali', 'Épopée', 'Légende', 'Guerre'],
    isFeatured: true,
    published: true,
  },
  {
    title: "Le Pèlerinage de Mansa Musa",
    subtitle: "L'Or du Mali",
    description: "Suivez le voyage extraordinaire de Mansa Musa, l'empereur le plus riche de l'histoire, lors de son pèlerinage à La Mecque.",
    category: 'Histoire',
    difficulty: 'beginner',
    author: 'BAOBAB Team',
    tags: ['Mansa Musa', 'Empire du Mali', 'Pèlerinage', 'Commerce', 'Or'],
    chapters: [
      {
        title: "La Décision",
        content: "En 1324, Mansa Musa, dixième empereur du Mali, décida d'accomplir le hajj, le pèlerinage à La Mecque. Mais ce ne serait pas un pèlerinage ordinaire. Mansa Musa voulait montrer au monde la grandeur et la richesse de son empire.\n\nIl prépara une caravane comme jamais on n'en avait vu : 60 000 hommes, 12 000 esclaves portant des bâtons d'or, 80 chameaux chargés chacun de 300 livres d'or. La caravane s'étendait sur des kilomètres.",
        order: 1,
      },
      {
        title: "Le Voyage",
        content: "La caravane traversa le désert du Sahara, puis l'Égypte. Partout où elle passait, Mansa Musa distribuait de l'or avec une générosité sans précédent. À chaque ville, il construisait une mosquée.\n\nEn Égypte, il distribua tant d'or que le prix de l'or chuta et provoqua une inflation qui dura des années. Les marchands égyptiens racontèrent cette histoire dans tout le monde médiéval, faisant connaître la richesse du Mali jusqu'en Europe.",
        order: 2,
      },
      {
        title: "L'Héritage",
        content: "Le pèlerinage de Mansa Musa transforma la perception du monde sur l'Afrique. Pour la première fois, les cartes européennes montrèrent l'Empire du Mali avec un roi assis sur un trône d'or.\n\nMansa Musa investit massivement dans l'éducation à son retour, construisant des mosquées et des universités. Tombouctou devint un centre intellectuel majeur, attirant des savants de tout le monde musulman. L'héritage de Mansa Musa continue d'inspirer aujourd'hui.",
        order: 3,
      },
    ],
    readingTime: 12,
    tags: ['Mansa Musa', 'Pèlerinage', 'Or', 'Commerce', 'Éducation'],
    isFeatured: true,
    published: true,
  },
  {
    title: "La Résistance de la Reine Nzinga",
    subtitle: "La Guerrière Intrépide",
    description: "Découvrez comment la Reine Nzinga Mbande défendit son royaume contre la colonisation portugaise pendant plus de 30 ans.",
    category: 'Biographie',
    difficulty: 'intermediate',
    author: 'BAOBAB Team',
    tags: ['Reine Nzinga', 'Résistance', 'Angola', 'Colonisation', 'Femme dirigeante'],
    chapters: [
      {
        title: "La Jeune Diplomate",
        content: "Nzinga naquit en 1583 dans le royaume de Ndongo, en Angola. Dès son jeune âge, elle montra une intelligence exceptionnelle et un talent pour la diplomatie. Son frère, le roi, l'envoya négocier avec les Portugais.\n\nLors d'une célèbre rencontre, les Portugais ne lui offrirent qu'un tapis par terre pour s'asseoir, refusant de lui donner une chaise. Nzinga ordonna à une de ses servantes de s'agenouiller et s'assit sur son dos, montrant qu'elle était l'égale de n'importe quel roi.",
        order: 1,
      },
      {
        title: "La Reine Guerrière",
        content: "Devenue reine après la mort de son frère, Nzinga refusa de se soumettre aux Portugais. Elle unifia les royaumes de Ndongo et Matamba et mena une guerre de résistance acharnée.\n\nPendant plus de 30 ans, elle combattit les Portugais avec une stratégie militaire brillante. Elle forma des alliances avec les Néerlandais, utilisa la guérilla, et défendit farouchement l'indépendance de son peuple. Même à 60 ans, elle menait encore ses troupes au combat.",
        order: 2,
      },
      {
        title: "L'Héritage",
        content: "La Reine Nzinga est devenue un symbole de résistance et de leadership féminin. Son courage et sa détermination continuent d'inspirer les générations actuelles. Elle prouva qu'une femme pouvait être un leader exceptionnel et défendre son peuple contre les plus grandes puissances.\n\nSon histoire rappelle que l'Afrique a toujours eu des dirigeantes fortes et que la résistance à l'oppression est un droit fondamental.",
        order: 3,
      },
    ],
    readingTime: 18,
    tags: ['Reine Nzinga', 'Résistance', 'Angola', 'Femme dirigeante', 'Guerre'],
    isFeatured: true,
    published: true,
  },
]

const seedStories = async () => {
  try {
    // Ne pas reconnecter si déjà connecté
    if (mongoose.connection.readyState === 0) {
      await connectDB()
    }
    logger.info('🔄 Début de l\'ajout des récits historiques...')

    let created = 0
    let ignored = 0
    const errors = []

    for (const storyData of storiesData) {
      try {
        const existingStory = await Story.findOne({ title: storyData.title })

        if (existingStory) {
          logger.info(`⏭️  Récit déjà existant: "${storyData.title}"`)
          ignored++
          continue
        }

        await Story.create(storyData)
        created++
        logger.info(`✅ Récit créé: "${storyData.title}"`)
      } catch (error) {
        errors.push({ story: storyData.title, error: error.message })
        logger.error('❌ Erreur lors de l\'ajout du récit', { story: storyData.title, error: error.message })
        ignored++
      }
    }

    logger.info(`✨ Ajout terminé: ${created} récits créés, ${ignored} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach(err => logger.warn(`   - ${err.story}: ${err.error}`))
    }
    return { created, ignored, errors }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'exécution du script de seed', { message: error.message, stack: error.stack })
    throw error
  }
}

// Exporter la fonction
export { seedStories }

// Exécuter si appelé directement (pas en import)
if (process.argv[1] && process.argv[1].includes('seedStories.js')) {
  seedStories().then(() => process.exit(0)).catch(() => process.exit(1))
}

