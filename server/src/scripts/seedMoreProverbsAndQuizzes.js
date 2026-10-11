import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import Proverb from '../models/Proverb.js'
import Quiz from '../models/Quiz.js'
import logger from '../utils/logger.js'

dotenv.config()

const proverbs = [
  ['DZ', 'La patience est un arbre dont la racine est amère et le fruit très doux.', 'La patience demande un effort au départ, mais finit par porter des résultats précieux.', 'Sagesse', 'Arabe/Amazigh', ['patience', 'temps', 'effort']],
  ['EG', 'La parole est comme une flèche: une fois lancée, elle ne revient pas.', 'Il faut parler avec mesure, car les mots peuvent produire des effets durables.', 'Relations', 'Arabe égyptien', ['parole', 'prudence', 'relation']],
  ['TN', 'Celui qui veut le miel doit supporter les piqûres.', 'Toute réussite demande d’accepter une part d’effort ou de difficulté.', 'Travail', 'Arabe tunisien', ['effort', 'courage', 'réussite']],
  ['MR', 'Le désert enseigne la valeur d’une goutte d’eau.', 'Le manque apprend à reconnaître la valeur des choses simples et vitales.', 'Nature', 'Hassaniya', ['désert', 'eau', 'sobriété']],
  ['GM', 'La rivière ne se moque pas de la source.', 'On ne doit pas mépriser ses origines, même lorsqu’on avance loin.', 'Famille', 'Mandingue', ['origine', 'respect', 'mémoire']],
  ['GN', 'La parole du vieux baobab garde l’ombre du village.', 'Les anciens conservent une mémoire qui protège et oriente la communauté.', 'Sagesse', 'Malinké', ['anciens', 'village', 'mémoire']],
  ['SL', 'La main qui donne garde toujours une lumière.', 'La générosité laisse une trace positive chez celui qui aide et chez celui qui reçoit.', 'Relations', 'Krio', ['générosité', 'solidarité', 'lumière']],
  ['LR', 'Le pont se souvient de tous les pas.', 'Les lieux et les liens gardent la mémoire des passages humains.', 'Sagesse', 'Anglais libérien', ['mémoire', 'chemin', 'lien']],
  ['BJ', 'Le tambour ne parle bien que si la peau est tendue.', 'Une parole ou un travail juste demande préparation, soin et discipline.', 'Travail', 'Fon', ['tambour', 'discipline', 'préparation']],
  ['TG', 'La calebasse fissurée sert encore à mesurer le grain.', 'Une personne ou un objet imparfait peut continuer à être utile.', 'Sagesse', 'Ewe', ['utilité', 'imperfection', 'grain']],
  ['NE', 'Celui qui connaît le puits ne craint pas la longue route.', 'La connaissance des ressources rend le voyage moins fragile.', 'Nature', 'Haoussa', ['route', 'puits', 'connaissance']],
  ['TD', 'Quand le vent change, le berger ajuste sa marche.', 'La sagesse consiste à s’adapter sans perdre son objectif.', 'Nature', 'Arabe tchadien', ['adaptation', 'berger', 'vent']],
  ['CF', 'La forêt a plusieurs voix, mais elle garde un seul souffle.', 'La diversité peut former une unité profonde.', 'Relations', 'Sango', ['forêt', 'diversité', 'unité']],
  ['GQ', 'La petite île connaît la force des vagues.', 'Même les petits territoires ou groupes développent une grande intelligence de leur environnement.', 'Nature', 'Fang', ['île', 'vague', 'résilience']],
  ['GA', 'La forêt ne livre ses chemins qu’aux pas attentifs.', 'Il faut avancer avec attention pour comprendre un milieu ou une personne.', 'Sagesse', 'Fang', ['forêt', 'attention', 'chemin']],
  ['CG', 'La rumba naît quand deux cœurs acceptent le même rythme.', 'La relation et la communauté se construisent par écoute et accord.', 'Relations', 'Lingala', ['musique', 'écoute', 'communauté']],
  ['CD', 'Le fleuve puissant commence par des sources discrètes.', 'Les grandes œuvres commencent souvent par de petits gestes invisibles.', 'Travail', 'Lingala', ['fleuve', 'commencement', 'patience']],
  ['AO', 'La danse apprend au pied ce que la bouche ne sait pas dire.', 'Le corps, l’art et le geste transmettent aussi des vérités.', 'Sagesse', 'Kimbundu', ['danse', 'corps', 'expression']],
  ['ST', 'La mer rapproche ceux qui savent lire les vents.', 'Les liens naissent quand on comprend les conditions et les signes du voyage.', 'Nature', 'Créole forro', ['mer', 'vent', 'voyage']],
  ['CV', 'La saudade garde la maison dans le cœur du voyageur.', 'La mémoire du pays accompagne celui qui part loin.', 'Famille', 'Créole capverdien', ['diaspora', 'maison', 'mémoire']],
  ['ER', 'La montagne ne court pas, pourtant elle arrive jusqu’au ciel.', 'La constance peut mener très haut sans agitation.', 'Sagesse', 'Tigrinya', ['montagne', 'constance', 'hauteur']],
  ['DJ', 'Qui traverse le sel apprend le prix de l’eau douce.', 'L’épreuve révèle la valeur du repos et des ressources essentielles.', 'Nature', 'Afar/Somali', ['sel', 'eau', 'épreuve']],
  ['SO', 'Un chameau chargé de sagesse marche sans bruit.', 'La vraie connaissance n’a pas besoin de se vanter.', 'Sagesse', 'Somali', ['chameau', 'humilité', 'savoir']],
  ['UG', 'La colline paraît haute jusqu’au premier pas.', 'Une difficulté devient plus accessible dès qu’on commence.', 'Travail', 'Luganda', ['courage', 'début', 'colline']],
  ['RW', 'Les mille collines se saluent par les chemins.', 'Les communautés restent liées par les passages, les échanges et les visites.', 'Relations', 'Kinyarwanda', ['collines', 'chemins', 'lien']],
  ['BI', 'Le tambour ne bat pas pour lui-même.', 'La parole publique et l’art existent pour relier une communauté.', 'Relations', 'Kirundi', ['tambour', 'communauté', 'partage']],
  ['MW', 'Le lac enseigne le calme sans cacher sa profondeur.', 'La tranquillité peut contenir une grande force intérieure.', 'Sagesse', 'Chichewa', ['lac', 'calme', 'profondeur']],
  ['ZM', 'Celui qui écoute la rivière comprend la saison.', 'L’observation attentive aide à prendre de meilleures décisions.', 'Nature', 'Bemba', ['rivière', 'écoute', 'saison']],
  ['ZW', 'La pierre ancienne connaît le poids des royaumes.', 'Les monuments et les traces anciennes portent une mémoire politique et culturelle.', 'Sagesse', 'Shona', ['pierre', 'royaume', 'mémoire']],
  ['BW', 'La pluie appartient au ciel, mais la jarre appartient aux mains.', 'On ne contrôle pas tout, mais on peut se préparer à recevoir ce qui vient.', 'Travail', 'Setswana', ['pluie', 'préparation', 'responsabilité']],
  ['MZ', 'La marée ne demande pas la permission au rivage.', 'Certaines forces arrivent naturellement; il faut apprendre à vivre avec elles.', 'Nature', 'Portugais/Makua', ['mer', 'marée', 'adaptation']],
  ['MG', 'Le riz partagé rend la maison plus grande.', 'Le partage augmente la valeur du foyer et de la relation.', 'Famille', 'Malgache', ['riz', 'maison', 'partage']],
  ['LS', 'La couverture garde la chaleur du peuple.', 'Les objets du quotidien peuvent porter une identité collective.', 'Famille', 'Sesotho', ['couverture', 'identité', 'foyer']],
  ['SZ', 'La danse du village commence par un seul battement.', 'Les grands rassemblements naissent d’un premier geste collectif.', 'Relations', 'Swati', ['danse', 'village', 'commencement']],
  ['NA', 'La dune avance grain par grain.', 'Les grandes transformations se construisent par accumulation patiente.', 'Nature', 'Khoekhoe/Oshiwambo', ['dune', 'patience', 'transformation']],
  ['MU', 'Plusieurs épices font une même marmite.', 'La diversité peut former une harmonie commune.', 'Relations', 'Créole mauricien', ['diversité', 'cuisine', 'harmonie']],
  ['SC', 'Le corail grandit lentement, mais il protège l’île.', 'Ce qui prend du temps peut devenir une protection durable.', 'Nature', 'Créole seychellois', ['corail', 'temps', 'protection']],
  ['KM', 'Une île seule écoute toujours les autres îles.', 'Même isolée, une communauté vit par ses relations.', 'Relations', 'Comorien', ['île', 'écoute', 'relation']],
]

const quizzes = [
  {
    title: 'Repères des capitales africaines',
    description: 'Un quiz rapide pour vérifier les capitales et créer de bons réflexes de recherche.',
    difficulty: 'beginner',
    timeLimit: 420,
    tags: ['capitales', 'géographie', 'pays'],
    questions: [
      ['Quelle est la capitale du Sénégal ?', ['Dakar', 'Bamako', 'Accra', 'Lomé'], 'Dakar', 'Dakar est la capitale du Sénégal.'],
      ['Quelle est la capitale du Ghana ?', ['Kumasi', 'Accra', 'Abuja', 'Banjul'], 'Accra', 'Accra est la capitale du Ghana.'],
      ['Quelle est la capitale du Rwanda ?', ['Kigali', 'Gitega', 'Kampala', 'Dodoma'], 'Kigali', 'Kigali est la capitale du Rwanda.'],
      ['Quelle est la capitale du Mozambique ?', ['Maputo', 'Luanda', 'Harare', 'Lusaka'], 'Maputo', 'Maputo est la capitale du Mozambique.'],
    ],
  },
  {
    title: 'Langues et circulations',
    description: 'Identifier quelques langues majeures et leurs espaces de circulation.',
    difficulty: 'beginner',
    timeLimit: 480,
    tags: ['langues', 'swahili', 'wolof', 'amharique'],
    questions: [
      ['Le swahili est particulièrement associé à quelle région ?', ['Afrique de l’Est', 'Afrique australe seulement', 'Maghreb', 'Sahel occidental seulement'], 'Afrique de l’Est', 'Le swahili circule fortement en Afrique de l’Est et sur la côte de l’océan Indien.'],
      ['Le wolof est très présent dans quel pays ?', ['Sénégal', 'Égypte', 'Botswana', 'Érythrée'], 'Sénégal', 'Le wolof est une langue très visible au Sénégal.'],
      ['L’amharique est associé à quel pays ?', ['Éthiopie', 'Ghana', 'Namibie', 'Togo'], 'Éthiopie', 'L’amharique est une langue importante en Éthiopie.'],
      ['Le créole capverdien est lié à quel archipel ?', ['Cap-Vert', 'Comores', 'Seychelles', 'Maurice'], 'Cap-Vert', 'Le Cap-Vert possède une forte culture créole atlantique.'],
    ],
  },
  {
    title: 'Arts, textiles et symboles',
    description: 'Un parcours court sur les objets culturels qui transmettent une mémoire.',
    difficulty: 'intermediate',
    timeLimit: 540,
    tags: ['arts', 'textile', 'symboles', 'transmission'],
    questions: [
      ['Le kente est fortement associé à quel pays ?', ['Ghana', 'Maroc', 'Kenya', 'Soudan'], 'Ghana', 'Le kente est un textile emblématique lié notamment aux cultures akan et ashanti.'],
      ['Le bogolan est souvent relié à quel pays ?', ['Mali', 'Seychelles', 'Libye', 'Gabon'], 'Mali', 'Le bogolan est associé à des savoir-faire textiles maliens.'],
      ['Les symboles adinkra sont souvent liés à quelle aire culturelle ?', ['Akan', 'Swahili', 'Afar', 'Basotho'], 'Akan', 'Les adinkra sont des symboles associés aux cultures akan.'],
      ['Les sculptures shona sont associées à quel pays ?', ['Zimbabwe', 'Tunisie', 'Niger', 'Somalie'], 'Zimbabwe', 'La sculpture shona est un repère artistique du Zimbabwe.'],
    ],
  },
  {
    title: 'Mémoire et souverainetés',
    description: 'Comprendre quelques événements et figures liés aux résistances et souverainetés africaines.',
    difficulty: 'intermediate',
    timeLimit: 600,
    tags: ['histoire', 'souveraineté', 'résistance'],
    questions: [
      ['La bataille d’Adwa est fortement associée à quel pays ?', ['Éthiopie', 'Algérie', 'Angola', 'Ghana'], 'Éthiopie', 'Adwa est un symbole majeur de souveraineté éthiopienne.'],
      ['Samori Touré est lié à quelle résistance ?', ['Wassoulou face à la conquête française', 'Apartheid sud-africain', 'Révolution du jasmin', 'Route swahilie'], 'Wassoulou face à la conquête française', 'Samori Touré organisa une résistance en Afrique de l’Ouest.'],
      ['Behanzin est associé à quel royaume ?', ['Dahomey', 'Koush', 'Kongo', 'Axoum'], 'Dahomey', 'Behanzin fut roi du Dahomey.'],
      ['Nelson Mandela est lié à quelle lutte ?', ['Anti-apartheid', 'Empire du Mali', 'Cités swahilies', 'Royaume du Bénin antique'], 'Anti-apartheid', 'Mandela est une figure centrale de la lutte contre l’apartheid.'],
    ],
  },
  {
    title: 'Côte swahilie et océan Indien',
    description: 'Relier villes, langues, échanges et cultures de l’océan Indien africain.',
    difficulty: 'intermediate',
    timeLimit: 540,
    tags: ['swahili', 'océan indien', 'commerce'],
    questions: [
      ['Zanzibar appartient à quel pays ?', ['Tanzanie', 'Kenya', 'Somalie', 'Comores'], 'Tanzanie', 'Zanzibar fait partie de la République-Unie de Tanzanie.'],
      ['Quelle langue est un repère majeur de la côte swahilie ?', ['Swahili', 'Wolof', 'Tamasheq', 'Sesotho'], 'Swahili', 'Le swahili est central dans cette aire culturelle.'],
      ['Kilwa est associée à quelle dynamique historique ?', ['Commerce de l’océan Indien', 'Empire songhaï', 'Apartheid', 'Route du cacao'], 'Commerce de l’océan Indien', 'Kilwa fut une cité importante des réseaux de l’océan Indien.'],
      ['Le taarab est fortement associé à quel espace ?', ['Zanzibar et côte swahilie', 'Sahel central', 'Afrique australe intérieure', 'Maghreb uniquement'], 'Zanzibar et côte swahilie', 'Le taarab est une musique importante à Zanzibar et sur la côte.'],
    ],
  },
  {
    title: 'Cuisine et quotidien',
    description: 'Associer plats, produits et pays pour comprendre les cultures par le quotidien.',
    difficulty: 'beginner',
    timeLimit: 420,
    tags: ['cuisine', 'quotidien', 'marchés'],
    questions: [
      ['Le ceebu jën est un plat emblématique de quel pays ?', ['Sénégal', 'Namibie', 'Égypte', 'Érythrée'], 'Sénégal', 'Le ceebu jën est un plat sénégalais majeur.'],
      ['L’injera est très associée à quel pays ?', ['Éthiopie', 'Botswana', 'Bénin', 'Maurice'], 'Éthiopie', 'L’injera est un repère fort de la cuisine éthiopienne.'],
      ['Le ndolé est lié à quel pays ?', ['Cameroun', 'Gambie', 'Lesotho', 'Libye'], 'Cameroun', 'Le ndolé est un plat très connu au Cameroun.'],
      ['Le thé à la menthe est un rituel fort de quel pays du Maghreb ?', ['Maroc', 'Zimbabwe', 'Rwanda', 'Malawi'], 'Maroc', 'Le thé à la menthe est un symbole d’accueil au Maroc.'],
    ],
  },
  {
    title: 'Îles africaines',
    description: 'Découvrir les archipels et îles du continent africain.',
    difficulty: 'beginner',
    timeLimit: 420,
    tags: ['îles', 'océan indien', 'atlantique'],
    questions: [
      ['Quelle est la capitale du Cap-Vert ?', ['Praia', 'Moroni', 'Victoria', 'Port Louis'], 'Praia', 'Praia est la capitale du Cap-Vert.'],
      ['Moroni est la capitale de quel pays ?', ['Comores', 'Seychelles', 'Maurice', 'São Tomé-et-Príncipe'], 'Comores', 'Moroni est la capitale des Comores.'],
      ['Victoria est la capitale de quel archipel ?', ['Seychelles', 'Cap-Vert', 'Madagascar', 'Guinée-Bissau'], 'Seychelles', 'Victoria est la capitale des Seychelles.'],
      ['Antananarivo est la capitale de quel pays insulaire ?', ['Madagascar', 'Maurice', 'Comores', 'Cap-Vert'], 'Madagascar', 'Antananarivo est la capitale de Madagascar.'],
    ],
  },
  {
    title: 'Afrique centrale en repères',
    description: 'Pays, capitales et expressions culturelles d’Afrique centrale.',
    difficulty: 'intermediate',
    timeLimit: 540,
    tags: ['afrique centrale', 'capitales', 'culture'],
    questions: [
      ['Brazzaville est la capitale de quel pays ?', ['Congo', 'RD Congo', 'Gabon', 'Tchad'], 'Congo', 'Brazzaville est la capitale de la République du Congo.'],
      ['Kinshasa est la capitale de quel pays ?', ['RD Congo', 'Congo', 'Angola', 'Cameroun'], 'RD Congo', 'Kinshasa est la capitale de la République démocratique du Congo.'],
      ['Le makossa est associé à quel pays ?', ['Cameroun', 'Soudan', 'Niger', 'Érythrée'], 'Cameroun', 'Le makossa est une musique camerounaise connue.'],
      ['Libreville est la capitale de quel pays ?', ['Gabon', 'Guinée équatoriale', 'Togo', 'Malawi'], 'Gabon', 'Libreville est la capitale du Gabon.'],
    ],
  },
  {
    title: 'Savoirs de nature',
    description: 'Comprendre comment milieux, saisons et ressources inspirent les savoirs.',
    difficulty: 'intermediate',
    timeLimit: 540,
    tags: ['nature', 'saisons', 'savoirs'],
    questions: [
      ['Le delta de l’Okavango est associé à quel pays ?', ['Botswana', 'Maroc', 'Libéria', 'Togo'], 'Botswana', 'Le delta de l’Okavango est un repère majeur du Botswana.'],
      ['Le Kilimandjaro est situé en grande partie dans quel pays ?', ['Tanzanie', 'Sénégal', 'Tunisie', 'Angola'], 'Tanzanie', 'Le Kilimandjaro est en Tanzanie.'],
      ['Le lac Malawi est associé à quel pays ?', ['Malawi', 'Mauritanie', 'Cap-Vert', 'Égypte'], 'Malawi', 'Le lac Malawi marque fortement ce pays.'],
      ['Le désert du Namib est associé à quel pays ?', ['Namibie', 'Rwanda', 'Bénin', 'Ghana'], 'Namibie', 'Le désert du Namib est un repère naturel de la Namibie.'],
    ],
  },
  {
    title: 'Communauté MonBaobab',
    description: 'Un quiz pour apprendre à contribuer avec soin dans une plateforme culturelle.',
    difficulty: 'beginner',
    timeLimit: 360,
    tags: ['communauté', 'sources', 'contribution'],
    questions: [
      ['Quel est le meilleur réflexe quand on ajoute une information culturelle ?', ['Indiquer le contexte et la source', 'Écrire sans vérifier', 'Copier une rumeur', 'Supprimer les nuances'], 'Indiquer le contexte et la source', 'Le contexte et la source rendent l’information plus utile.'],
      ['Pourquoi éviter de réduire une culture à un seul objet ?', ['Parce qu’une culture est vivante et diverse', 'Parce que les objets sont inutiles', 'Parce que les images suffisent', 'Parce que les pays n’ont pas d’histoire'], 'Parce qu’une culture est vivante et diverse', 'Une culture est faite de langues, personnes, lieux, gestes, mémoires et évolutions.'],
      ['Que peut partager un membre dans un cercle ?', ['Question, souvenir, ressource ou correction', 'Uniquement une publicité', 'Uniquement une commande', 'Rien'], 'Question, souvenir, ressource ou correction', 'La communauté sert à transmettre et améliorer les contenus.'],
      ['Quelle attitude aide le plus une communauté ?', ['Respect et précision', 'Moquerie', 'Vitesse sans relecture', 'Silence imposé'], 'Respect et précision', 'Respect et précision créent un espace durable.'],
    ],
  },
]

const seedMoreProverbsAndQuizzes = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  let proverbsCreated = 0
  let proverbsIgnored = 0
  let proverbsSkipped = 0

  for (const [countryCode, text, explanation, category, language, tags] of proverbs) {
    const country = await Country.findOne({ id: countryCode })
    if (!country) {
      proverbsSkipped++
      continue
    }

    const existing = await Proverb.findOne({ text, country: country._id })
    if (existing) {
      proverbsIgnored++
      continue
    }

    await Proverb.create({
      text,
      explanation,
      country: country._id,
      countryName: country.nameFr,
      language,
      category,
      tags,
      source: 'Tradition orale à contextualiser par la communauté MonBaobab',
      isVerified: false,
      isFeatured: proverbsCreated < 8,
    })
    proverbsCreated++
  }

  let quizzesCreated = 0
  let quizzesUpdated = 0
  for (const quiz of quizzes) {
    const questions = quiz.questions.map(([question, options, correctAnswer, explanation], index) => ({
      question,
      type: 'multiple-choice',
      options,
      correctAnswer,
      explanation,
      points: 10,
      order: index + 1,
    }))

    const payload = {
      ...quiz,
      questions,
      passingScore: 70,
      isActive: true,
    }

    const existing = await Quiz.findOne({ title: quiz.title })
    if (existing) {
      Object.assign(existing, payload)
      await existing.save()
      quizzesUpdated++
    } else {
      await Quiz.create(payload)
      quizzesCreated++
    }
  }

  logger.info(`Proverbes supplémentaires: ${proverbsCreated} créé(s), ${proverbsIgnored} déjà présents, ${proverbsSkipped} sans pays`)
  logger.info(`Quiz supplémentaires: ${quizzesCreated} créé(s), ${quizzesUpdated} mis à jour`)
  return {
    proverbs: { created: proverbsCreated, ignored: proverbsIgnored, skipped: proverbsSkipped },
    quizzes: { created: quizzesCreated, updated: quizzesUpdated },
  }
}

export { seedMoreProverbsAndQuizzes }

if (process.argv[1] && process.argv[1].includes('seedMoreProverbsAndQuizzes.js')) {
  seedMoreProverbsAndQuizzes()
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant le seed proverbes/quiz', { message: error.message, stack: error.stack })
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
