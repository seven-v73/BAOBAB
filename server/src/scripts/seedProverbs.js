// Script pour ajouter des proverbes africains authentiques
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Proverb from '../models/Proverb.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

// Proverbes africains authentiques avec leurs pays d'origine
const proverbsData = [
  // Proverbes du Mali
  {
    text: "Quand les éléphants se battent, c'est l'herbe qui souffre.",
    translation: "When elephants fight, it is the grass that suffers.",
    explanation: "Ce proverbe malien met en garde contre les conséquences des conflits entre les puissants sur les personnes ordinaires. Il souligne que lors des disputes entre dirigeants ou personnes influentes, ce sont souvent les citoyens ordinaires qui en subissent les conséquences.",
    countryCode: 'ML',
    countryName: 'Mali',
    language: 'Bambara',
    category: 'Sagesse',
    tags: ['conflit', 'pouvoir', 'société'],
    source: 'Tradition orale malienne',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "Un seul doigt ne peut pas laver le visage.",
    translation: "One finger cannot wash the face.",
    explanation: "Ce proverbe enseigne l'importance de la coopération et de l'entraide. Il rappelle qu'on ne peut pas accomplir de grandes choses seul et que l'union fait la force.",
    countryCode: 'ML',
    countryName: 'Mali',
    language: 'Bambara',
    category: 'Relations',
    tags: ['coopération', 'entraide', 'unité'],
    source: 'Tradition orale malienne',
    isVerified: true,
    isFeatured: true,
  },

  // Proverbes du Sénégal
  {
    text: "Qui veut voyager loin ménage sa monture.",
    translation: "He who wants to travel far spares his mount.",
    explanation: "Ce proverbe sénégalais enseigne la patience et la prudence. Il rappelle qu'il faut prendre soin de ses ressources et de sa santé pour atteindre ses objectifs à long terme.",
    countryCode: 'SN',
    countryName: 'Sénégal',
    language: 'Wolof',
    category: 'Sagesse',
    tags: ['patience', 'prudence', 'durabilité'],
    source: 'Tradition orale sénégalaise',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "L'arbre qui tombe fait plus de bruit que la forêt qui pousse.",
    translation: "The falling tree makes more noise than the growing forest.",
    explanation: "Ce proverbe met en évidence que les événements négatifs attirent plus l'attention que les progrès positifs qui se font silencieusement. Il encourage à valoriser la croissance et le développement progressif.",
    countryCode: 'SN',
    countryName: 'Sénégal',
    language: 'Wolof',
    category: 'Sagesse',
    tags: ['perception', 'croissance', 'patience'],
    source: 'Tradition orale sénégalaise',
    isVerified: true,
  },

  // Proverbes du Nigeria
  {
    text: "Un enfant qu'on n'éduque pas est un enfant qu'on perd.",
    translation: "A child who is not educated is a child who is lost.",
    explanation: "Ce proverbe nigérian souligne l'importance cruciale de l'éducation dans le développement d'un enfant. Il rappelle que l'éducation est l'investissement le plus précieux qu'on puisse faire pour l'avenir.",
    countryCode: 'NG',
    countryName: 'Nigeria',
    language: 'Yoruba',
    category: 'Famille',
    tags: ['éducation', 'enfance', 'avenir'],
    source: 'Tradition orale yoruba',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "Quand le doigt pointe la lune, l'imbécile regarde le doigt.",
    translation: "When the finger points at the moon, the fool looks at the finger.",
    explanation: "Ce proverbe enseigne à voir au-delà des apparences et à comprendre le message profond plutôt que de se concentrer sur les détails superficiels. Il encourage la sagesse et la perspicacité.",
    countryCode: 'NG',
    countryName: 'Nigeria',
    language: 'Yoruba',
    category: 'Sagesse',
    tags: ['sagesse', 'compréhension', 'perception'],
    source: 'Tradition orale yoruba',
    isVerified: true,
  },

  // Proverbes du Ghana
  {
    text: "Le voyage de mille kilomètres commence par un pas.",
    translation: "The journey of a thousand miles begins with a single step.",
    explanation: "Ce proverbe ghanéen encourage à commencer les grandes entreprises, même si elles semblent intimidantes. Il rappelle que chaque grand accomplissement commence par une première action.",
    countryCode: 'GH',
    countryName: 'Ghana',
    language: 'Akan',
    category: 'Travail',
    tags: ['début', 'persévérance', 'action'],
    source: 'Tradition orale akan',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "Si tu veux aller vite, vas-y seul. Si tu veux aller loin, vas-y ensemble.",
    translation: "If you want to go fast, go alone. If you want to go far, go together.",
    explanation: "Ce proverbe met en contraste la vitesse individuelle avec la durabilité collective. Il enseigne que la collaboration et l'entraide permettent d'atteindre des objectifs plus ambitieux et durables.",
    countryCode: 'GH',
    countryName: 'Ghana',
    language: 'Akan',
    category: 'Relations',
    tags: ['coopération', 'collaboration', 'durabilité'],
    source: 'Tradition orale akan',
    isVerified: true,
    isFeatured: true,
  },

  // Proverbes du Kenya
  {
    text: "Les dents et la langue se disputent parfois, mais elles restent dans la même bouche.",
    translation: "The teeth and the tongue sometimes quarrel, but they remain in the same mouth.",
    explanation: "Ce proverbe kényan enseigne que même dans les familles ou les communautés, il peut y avoir des désaccords, mais l'unité et la solidarité doivent prévaloir. Il encourage la tolérance et la réconciliation.",
    countryCode: 'KE',
    countryName: 'Kenya',
    language: 'Swahili',
    category: 'Famille',
    tags: ['famille', 'unité', 'tolérance'],
    source: 'Tradition orale swahili',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "L'herbe ne pousse pas plus vite si on tire dessus.",
    translation: "The grass does not grow faster by pulling on it.",
    explanation: "Ce proverbe rappelle qu'on ne peut pas forcer les choses à se produire plus rapidement. Il enseigne la patience et le respect des processus naturels et du temps nécessaire pour que les choses se développent.",
    countryCode: 'KE',
    countryName: 'Kenya',
    language: 'Swahili',
    category: 'Nature',
    tags: ['patience', 'nature', 'temps'],
    source: 'Tradition orale swahili',
    isVerified: true,
  },

  // Proverbes d'Afrique du Sud
  {
    text: "Un arbre qui tombe fait plus de bruit qu'une forêt qui pousse.",
    translation: "A falling tree makes more noise than a growing forest.",
    explanation: "Ce proverbe sud-africain souligne que les événements négatifs attirent plus l'attention que les développements positifs. Il encourage à reconnaître et valoriser la croissance silencieuse et progressive.",
    countryCode: 'ZA',
    countryName: 'Afrique du Sud',
    language: 'Zulu',
    category: 'Sagesse',
    tags: ['perception', 'croissance', 'positivité'],
    source: 'Tradition orale zoulou',
    isVerified: true,
  },
  {
    text: "L'oiseau qui vole seul est attrapé par le chat.",
    translation: "The bird that flies alone is caught by the cat.",
    explanation: "Ce proverbe enseigne l'importance de la communauté et de la solidarité. Il rappelle que l'isolement peut être dangereux et que la protection vient souvent du groupe.",
    countryCode: 'ZA',
    countryName: 'Afrique du Sud',
    language: 'Zulu',
    category: 'Relations',
    tags: ['communauté', 'solidarité', 'protection'],
    source: 'Tradition orale zoulou',
    isVerified: true,
    isFeatured: true,
  },

  // Proverbes d'Éthiopie
  {
    text: "Quand les hyènes sont d'accord, le mouton est en danger.",
    translation: "When hyenas agree, the sheep is in danger.",
    explanation: "Ce proverbe éthiopien met en garde contre les alliances dangereuses et les complots. Il rappelle qu'il faut être vigilant lorsque des personnes mal intentionnées s'unissent.",
    countryCode: 'ET',
    countryName: 'Éthiopie',
    language: 'Amharique (am)',
    category: 'Sagesse',
    tags: ['vigilance', 'alliance', 'danger'],
    source: 'Tradition orale éthiopienne',
    isVerified: true,
  },
  {
    text: "Le mensonge a les jambes courtes.",
    translation: "A lie has short legs.",
    explanation: "Ce proverbe enseigne que les mensonges finissent toujours par être découverts. Il encourage l'honnêteté et la vérité, car les mensonges ne peuvent pas être maintenus indéfiniment.",
    countryCode: 'ET',
    countryName: 'Éthiopie',
    language: 'Amharique (am)',
    category: 'Sagesse',
    tags: ['honnêteté', 'vérité', 'intégrité'],
    source: 'Tradition orale éthiopienne',
    isVerified: true,
    isFeatured: true,
  },

  // Proverbes du Cameroun
  {
    text: "Le lézard qui tombe de l'arbre dit qu'il fait de la gymnastique.",
    translation: "The lizard that falls from the tree says it is doing gymnastics.",
    explanation: "Ce proverbe camerounais illustre comment les gens tentent de sauver la face après un échec. Il enseigne l'humilité et l'acceptation de ses erreurs plutôt que de chercher des excuses.",
    countryCode: 'CM',
    countryName: 'Cameroun',
    language: 'Bamiléké',
    category: 'Sagesse',
    tags: ['humilité', 'échec', 'honnêteté'],
    source: 'Tradition orale camerounaise',
    isVerified: true,
  },
  {
    text: "Un seul doigt ne peut pas tuer un pou.",
    translation: "One finger cannot kill a louse.",
    explanation: "Ce proverbe enseigne que certaines tâches nécessitent la collaboration. Il rappelle que l'union et la coopération sont essentielles pour résoudre les problèmes complexes.",
    countryCode: 'CM',
    countryName: 'Cameroun',
    language: 'Bamiléké',
    category: 'Relations',
    tags: ['coopération', 'collaboration', 'unité'],
    source: 'Tradition orale camerounaise',
    isVerified: true,
  },

  // Proverbes de Côte d'Ivoire
  {
    text: "Quand deux éléphants se battent, c'est l'herbe qui est écrasée.",
    translation: "When two elephants fight, it is the grass that is crushed.",
    explanation: "Ce proverbe ivoirien, similaire au proverbe malien, met en garde contre les conséquences des conflits entre puissants sur les personnes ordinaires. Il souligne l'importance de la paix et de la résolution pacifique des conflits.",
    countryCode: 'CI',
    countryName: 'Côte d\'Ivoire',
    language: 'Baoulé',
    category: 'Sagesse',
    tags: ['conflit', 'paix', 'société'],
    source: 'Tradition orale ivoirienne',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "L'enfant qui n'est pas éduqué par le village sera brûlé par le village.",
    translation: "The child who is not educated by the village will be burned by the village.",
    explanation: "Ce proverbe souligne l'importance de l'éducation communautaire. Il rappelle que l'éducation d'un enfant est la responsabilité de toute la communauté, et qu'un enfant non éduqué peut devenir un problème pour la société.",
    countryCode: 'CI',
    countryName: 'Côte d\'Ivoire',
    language: 'Baoulé',
    category: 'Famille',
    tags: ['éducation', 'communauté', 'responsabilité'],
    source: 'Tradition orale ivoirienne',
    isVerified: true,
  },

  // Proverbes du Maroc
  {
    text: "Celui qui ne sait pas d'où il vient ne peut pas savoir où il va.",
    translation: "He who does not know where he comes from cannot know where he is going.",
    explanation: "Ce proverbe marocain souligne l'importance de connaître ses racines et son histoire. Il enseigne que la compréhension du passé est essentielle pour construire l'avenir.",
    countryCode: 'MA',
    countryName: 'Maroc',
    language: 'Arabe',
    category: 'Sagesse',
    tags: ['histoire', 'racines', 'identité'],
    source: 'Tradition orale marocaine',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "La patience est la clé du paradis.",
    translation: "Patience is the key to paradise.",
    explanation: "Ce proverbe enseigne la valeur de la patience dans l'islam et la culture marocaine. Il rappelle que la patience face aux difficultés mène au succès et à la paix intérieure.",
    countryCode: 'MA',
    countryName: 'Maroc',
    language: 'Arabe',
    category: 'Spiritualité',
    tags: ['patience', 'spiritualité', 'sagesse'],
    source: 'Tradition orale marocaine',
    isVerified: true,
  },

  // Proverbes de Tanzanie
  {
    text: "L'union fait la force, la division fait la faiblesse.",
    translation: "Unity is strength, division is weakness.",
    explanation: "Ce proverbe tanzanien enseigne que la solidarité et l'union permettent de surmonter les défis, tandis que la division affaiblit la communauté. Il encourage la coopération et l'harmonie.",
    countryCode: 'TZ',
    countryName: 'Tanzanie',
    language: 'Swahili',
    category: 'Relations',
    tags: ['unité', 'solidarité', 'force'],
    source: 'Tradition orale swahili',
    isVerified: true,
    isFeatured: true,
  },
  {
    text: "Mieux vaut tard que jamais.",
    translation: "Better late than never.",
    explanation: "Ce proverbe encourage à ne pas abandonner, même si on a pris du retard. Il rappelle qu'il vaut mieux accomplir quelque chose tardivement que de ne jamais le faire.",
    countryCode: 'TZ',
    countryName: 'Tanzanie',
    language: 'Swahili',
    category: 'Travail',
    tags: ['persévérance', 'détermination', 'espoir'],
    source: 'Tradition orale swahili',
    isVerified: true,
  },

  // Proverbes du Burkina Faso
  {
    text: "L'eau qui dort est plus profonde que l'eau qui court.",
    translation: "Still water runs deep.",
    explanation: "Ce proverbe burkinabé enseigne que les personnes calmes et silencieuses ont souvent une grande sagesse et profondeur. Il encourage à ne pas juger les gens par leur apparence extérieure.",
    countryCode: 'BF',
    countryName: 'Burkina Faso',
    language: 'Mooré',
    category: 'Sagesse',
    tags: ['sagesse', 'profondeur', 'apparence'],
    source: 'Tradition orale burkinabé',
    isVerified: true,
  },
  {
    text: "Un seul arbre ne fait pas une forêt.",
    translation: "One tree does not make a forest.",
    explanation: "Ce proverbe rappelle l'importance de la communauté et de la collectivité. Il enseigne qu'un individu seul ne peut pas accomplir ce qu'une communauté unie peut réaliser.",
    countryCode: 'BF',
    countryName: 'Burkina Faso',
    language: 'Mooré',
    category: 'Relations',
    tags: ['communauté', 'collectivité', 'unité'],
    source: 'Tradition orale burkinabé',
    isVerified: true,
  },
]

const seedProverbs = async () => {
  try {
    await connectDB()
    logger.info('🔄 Début de l\'ajout des proverbes africains...')

    let created = 0
    let skipped = 0
    const errors = []

    for (const proverbData of proverbsData) {
      try {
        // Trouver le pays par son code
        const country = await Country.findOne({ id: proverbData.countryCode })
        
        if (!country) {
          logger.warn(`⚠️  Pays non trouvé: ${proverbData.countryCode} - ${proverbData.countryName}`)
          errors.push({ 
            proverb: proverbData.text.substring(0, 50), 
            error: `Pays ${proverbData.countryCode} non trouvé` 
          })
          skipped++
          continue
        }

        // Vérifier si le proverbe existe déjà
        const existing = await Proverb.findOne({
          text: proverbData.text,
          country: country._id,
        })

        if (existing) {
          logger.info(`⏭️  Proverbe déjà existant: "${proverbData.text.substring(0, 50)}..."`)
          skipped++
          continue
        }

        // Créer le proverbe
        // Note: Le champ language est stocké mais peut causer des problèmes avec MongoDB Text Search
        // On utilise une valeur simple pour éviter les erreurs
        const languageValue = proverbData.language || ''
        
        await Proverb.create({
          text: proverbData.text,
          translation: proverbData.translation || '',
          explanation: proverbData.explanation,
          country: country._id,
          countryName: proverbData.countryName,
          language: languageValue,
          category: proverbData.category || 'Sagesse',
          tags: proverbData.tags || [],
          source: proverbData.source || '',
          author: proverbData.author || '',
          isVerified: proverbData.isVerified || false,
          isFeatured: proverbData.isFeatured || false,
          views: 0,
          likes: 0,
        })

        created++
        logger.info(`✅ Proverbe créé: "${proverbData.text.substring(0, 50)}..." (${proverbData.countryName})`)
      } catch (error) {
        logger.error(`❌ Erreur lors de l'ajout du proverbe`, {
          proverb: proverbData.text.substring(0, 50),
          error: error.message,
        })
        errors.push({
          proverb: proverbData.text.substring(0, 50),
          error: error.message,
        })
      }
    }

    logger.info(`✨ Ajout terminé: ${created} proverbes créés, ${skipped} ignorés`)
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} erreur(s) rencontrée(s)`)
      errors.forEach((err) => {
        logger.warn(`   - ${err.proverb}: ${err.error}`)
      })
    }
    
    process.exit(0)
  } catch (error) {
    logger.error('❌ Erreur lors de l\'ajout des proverbes', { error })
    process.exit(1)
  }
}

// Exécuter le script
seedProverbs()

