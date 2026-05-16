import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import TimelineEvent from '../models/TimelineEvent.js'
import HistoricalFigure from '../models/HistoricalFigure.js'
import Story from '../models/Story.js'
import Quiz from '../models/Quiz.js'
import Proverb from '../models/Proverb.js'
import Collection from '../models/Collection.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const source = (title, author = '', year = null, type = 'book') => ({ type, title, author, year })

const richTimelineEvents = [
  {
    title: 'Apparition de la civilisation de Kerma',
    description: 'Kerma, dans l’actuel Soudan, devient l’un des premiers grands centres politiques de la vallée du Nil. Son architecture monumentale, ses tombes royales et ses échanges avec l’Égypte témoignent d’une puissance africaine ancienne et autonome.',
    shortDescription: 'Kerma affirme une puissance nubienne ancienne dans la vallée du Nil.',
    date: new Date('-2500-01-01'),
    period: 'Antiquité',
    location: { region: 'Soudan', coordinates: { lat: 19.63, lng: 30.41 } },
    category: ['Politique', 'Culture', 'Commerce'],
    tags: ['Kerma', 'Nubie', 'Soudan', 'Nil', 'Antiquité'],
    importance: 5,
    verified: true,
    sources: [source('The Kingdom of Kush: Handbook of the Napatan-Meroitic Civilization', 'László Török', 1997)],
  },
  {
    title: 'Essor du royaume de Koush à Napata',
    description: 'Après l’affaiblissement de l’Égypte pharaonique, le royaume de Koush installe un pouvoir fort autour de Napata. Les souverains koushites s’inscrivent dans une tradition nilotique propre et rayonnent jusqu’en Égypte.',
    shortDescription: 'Koush rayonne depuis Napata et marque l’histoire du Nil.',
    date: new Date('-800-01-01'),
    period: 'Antiquité',
    location: { region: 'Soudan', coordinates: { lat: 18.53, lng: 31.84 } },
    category: ['Politique', 'Culture', 'Religion'],
    tags: ['Koush', 'Napata', 'Nubie', 'Égypte', 'Soudan'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Fondation et expansion de Carthage',
    description: 'Carthage devient une cité majeure de Méditerranée depuis l’actuelle Tunisie. Sa puissance maritime, commerciale et diplomatique relie l’Afrique du Nord, l’Europe du Sud et le Proche-Orient.',
    shortDescription: 'Carthage s’impose comme carrefour commercial méditerranéen.',
    date: new Date('-814-01-01'),
    period: 'Antiquité',
    location: { region: 'Tunisie', coordinates: { lat: 36.85, lng: 10.33 } },
    category: ['Commerce', 'Politique', 'Guerre'],
    tags: ['Carthage', 'Tunisie', 'Méditerranée', 'Commerce'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Victoire d’Hannibal à Cannes',
    description: 'Hannibal Barca remporte à Cannes l’une des plus célèbres victoires tactiques de l’histoire militaire. Cette victoire montre la capacité stratégique de Carthage face à Rome.',
    shortDescription: 'Hannibal inflige à Rome une défaite militaire majeure.',
    date: new Date('-216-08-02'),
    period: 'Antiquité',
    location: { region: 'Italie', coordinates: { lat: 41.30, lng: 16.13 } },
    category: ['Guerre', 'Politique'],
    tags: ['Hannibal', 'Carthage', 'Rome', 'Cannes', 'Stratégie'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Méroé, capitale du royaume de Koush',
    description: 'Méroé devient un centre politique, religieux et métallurgique majeur. Ses pyramides, ses ateliers de fer et son écriture méroïtique rappellent la profondeur des savoirs africains anciens.',
    shortDescription: 'Méroé incarne une Nubie inventive, urbaine et savante.',
    date: new Date('-300-01-01'),
    period: 'Antiquité',
    location: { region: 'Soudan', coordinates: { lat: 16.94, lng: 33.75 } },
    category: ['Science', 'Art', 'Culture'],
    tags: ['Méroé', 'Koush', 'Nubie', 'Métallurgie', 'Pyramides'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Adoption du christianisme par Axoum',
    description: 'Sous le règne du roi Ezana, Axoum adopte le christianisme. Ce choix inscrit l’Éthiopie et l’Érythrée dans une histoire religieuse ancienne et durable, liée aux échanges de la mer Rouge.',
    shortDescription: 'Axoum adopte le christianisme au IVe siècle.',
    date: new Date('0330-01-01'),
    period: 'Antiquité',
    location: { region: 'Éthiopie, Érythrée', coordinates: { lat: 14.13, lng: 38.72 } },
    category: ['Religion', 'Politique', 'Commerce'],
    tags: ['Axoum', 'Ezana', 'Éthiopie', 'Érythrée', 'Christianisme'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Développement de la ville de Djenné-Djenno',
    description: 'Djenné-Djenno devient l’un des anciens centres urbains les plus importants d’Afrique de l’Ouest. Les recherches archéologiques montrent une urbanisation locale ancienne, connectée aux réseaux d’échanges régionaux.',
    shortDescription: 'Djenné-Djenno témoigne d’une urbanisation ouest-africaine ancienne.',
    date: new Date('0800-01-01'),
    period: 'Moyen-Âge',
    location: { region: 'Mali', coordinates: { lat: 13.91, lng: -4.55 } },
    category: ['Commerce', 'Culture', 'Science'],
    tags: ['Djenné-Djenno', 'Mali', 'Archéologie', 'Urbanisation'],
    importance: 4,
    verified: true,
    sources: [source('Ancient Middle Niger: Urbanism and the Self-Organizing Landscape', 'Roderick J. McIntosh', 2005)],
  },
  {
    title: 'Apogée du Grand Zimbabwe',
    description: 'Le Grand Zimbabwe devient un centre politique et commercial majeur d’Afrique australe. Ses enceintes en pierre sèche et ses échanges avec l’océan Indien témoignent d’une civilisation urbaine sophistiquée.',
    shortDescription: 'Le Grand Zimbabwe rayonne en Afrique australe.',
    date: new Date('1250-01-01'),
    period: 'Moyen-Âge',
    location: { region: 'Zimbabwe', coordinates: { lat: -20.27, lng: 30.93 } },
    category: ['Politique', 'Commerce', 'Art'],
    tags: ['Grand Zimbabwe', 'Architecture', 'Commerce', 'Afrique australe'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Fondation du royaume du Kongo',
    description: 'Le royaume du Kongo s’affirme dans l’actuelle région du Congo et de l’Angola. Son organisation politique, ses capitales et ses réseaux diplomatiques en font une puissance majeure d’Afrique centrale.',
    shortDescription: 'Le royaume du Kongo structure une puissance d’Afrique centrale.',
    date: new Date('1390-01-01'),
    period: 'Moyen-Âge',
    location: { region: 'Angola, République démocratique du Congo', coordinates: { lat: -6.27, lng: 14.24 } },
    category: ['Politique', 'Commerce', 'Culture'],
    tags: ['Kongo', 'Afrique centrale', 'Mbanza Kongo', 'Royaume'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Développement des cités swahilies',
    description: 'Kilwa, Mombasa, Lamu, Zanzibar et d’autres cités de la côte swahilie deviennent des carrefours marchands reliant l’Afrique de l’Est, l’Arabie, la Perse, l’Inde et la Chine.',
    shortDescription: 'Les cités swahilies connectent l’Afrique de l’Est à l’océan Indien.',
    date: new Date('1200-01-01'),
    period: 'Moyen-Âge',
    location: { region: 'Kenya, Tanzanie', coordinates: { lat: -6.16, lng: 39.19 } },
    category: ['Commerce', 'Culture', 'Art'],
    tags: ['Swahili', 'Kilwa', 'Zanzibar', 'Océan Indien', 'Commerce'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Fondation du royaume du Dahomey',
    description: 'Le Dahomey devient une puissance politique majeure dans l’actuel Bénin. Son organisation, ses palais royaux et ses corps militaires féminins marquent durablement l’histoire régionale.',
    shortDescription: 'Le Dahomey s’impose comme royaume structuré du golfe du Bénin.',
    date: new Date('1600-01-01'),
    period: 'Période Moderne',
    location: { region: 'Bénin', coordinates: { lat: 7.19, lng: 1.99 } },
    category: ['Politique', 'Guerre', 'Culture'],
    tags: ['Dahomey', 'Bénin', 'Amazones', 'Abomey'],
    importance: 4,
    verified: true,
  },
  {
    title: 'Bataille d’Adwa',
    description: 'L’Éthiopie de Menelik II remporte une victoire décisive contre l’Italie à Adwa. Cette victoire devient un symbole mondial de souveraineté africaine face à l’impérialisme européen.',
    shortDescription: 'L’Éthiopie préserve son indépendance à Adwa.',
    date: new Date('1896-03-01'),
    period: 'Époque Contemporaine',
    location: { region: 'Éthiopie', coordinates: { lat: 14.16, lng: 38.90 } },
    category: ['Guerre', 'Politique'],
    tags: ['Adwa', 'Éthiopie', 'Menelik II', 'Impérialisme', 'Souveraineté'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Résistance de Samori Touré',
    description: 'Samori Touré organise l’empire wassoulou et mène une résistance prolongée à la conquête française en Afrique de l’Ouest. Son parcours rappelle la force des stratégies africaines face à l’expansion coloniale.',
    shortDescription: 'Samori Touré résiste à la conquête française.',
    date: new Date('1882-01-01'),
    endDate: new Date('1898-09-29'),
    period: 'Époque Contemporaine',
    location: { region: 'Guinée, Mali, Côte d’Ivoire', coordinates: { lat: 9.64, lng: -9.45 } },
    category: ['Guerre', 'Politique'],
    tags: ['Samori Touré', 'Wassoulou', 'Résistance', 'Afrique de l’Ouest'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Création de l’Organisation de l’unité africaine',
    description: 'À Addis-Abeba, les États africains indépendants fondent l’OUA pour soutenir la décolonisation, défendre la souveraineté et encourager l’unité continentale. Elle deviendra l’Union africaine en 2002.',
    shortDescription: 'L’OUA pose une base institutionnelle pour l’unité africaine.',
    date: new Date('1963-05-25'),
    period: 'Époque Contemporaine',
    location: { region: 'Éthiopie', coordinates: { lat: 9.03, lng: 38.74 } },
    category: ['Politique', 'Culture'],
    tags: ['OUA', 'Union africaine', 'Addis-Abeba', 'Panafricanisme'],
    importance: 5,
    verified: true,
  },
  {
    title: 'Indépendance de l’Algérie',
    description: 'Après une guerre longue et douloureuse, l’Algérie devient indépendante. Cet événement reste central dans l’histoire des luttes anticoloniales africaines et mondiales.',
    shortDescription: 'L’Algérie accède à l’indépendance en 1962.',
    date: new Date('1962-07-05'),
    period: 'Époque Contemporaine',
    location: { region: 'Algérie', coordinates: { lat: 36.75, lng: 3.06 } },
    category: ['Politique', 'Guerre'],
    tags: ['Algérie', 'Indépendance', 'Décolonisation', 'FLN'],
    importance: 5,
    verified: true,
  },
]

const richFigures = [
  {
    name: 'Amanirenas',
    birthDate: new Date('-060-01-01'),
    deathDate: new Date('-010-01-01'),
    birthPlace: { location: 'Royaume de Koush, Soudan', coordinates: { lat: 18.53, lng: 31.84 } },
    role: ['Roi/Reine', 'Guerrier', 'Diplomate'],
    achievements: ['Résistance nubienne face à Rome', 'Négociation d’un traité favorable avec Auguste', 'Leadership koushite dans la vallée du Nil'],
    biography: 'Amanirenas, kandake du royaume de Koush, dirigea une résistance contre l’Empire romain à la fin du Ier siècle avant notre ère. Son action militaire et diplomatique rappelle la puissance politique des reines nubiennes.',
    shortBiography: 'Kandake de Koush, résistante face à Rome.',
    legacy: 'Symbole ancien du leadership féminin africain.',
    tags: ['Koush', 'Nubie', 'Soudan', 'Rome', 'Kandake'],
    verified: true,
  },
  {
    name: 'Amina de Zazzau',
    birthDate: new Date('1533-01-01'),
    deathDate: new Date('1610-01-01'),
    birthPlace: { location: 'Zaria, Nigeria', coordinates: { lat: 11.08, lng: 7.72 } },
    role: ['Roi/Reine', 'Guerrier'],
    achievements: ['Expansion de Zazzau', 'Renforcement des routes commerciales haoussa', 'Mémoire durable du leadership féminin'],
    biography: 'Amina de Zazzau est associée à la puissance militaire et commerciale des cités haoussa. Sa mémoire traverse les récits historiques et oraux comme celle d’une dirigeante capable d’étendre l’influence de son royaume.',
    shortBiography: 'Reine guerrière associée à Zazzau, dans le nord du Nigeria.',
    legacy: 'Inspiration pour les femmes dirigeantes et stratèges.',
    tags: ['Nigeria', 'Haoussa', 'Zazzau', 'Leadership féminin'],
    verified: true,
  },
  {
    name: 'Menelik II',
    birthDate: new Date('1844-08-17'),
    deathDate: new Date('1913-12-12'),
    birthPlace: { location: 'Ankober, Éthiopie', coordinates: { lat: 9.57, lng: 39.73 } },
    role: ['Roi/Reine', 'Diplomate', 'Guerrier'],
    achievements: ['Victoire d’Adwa en 1896', 'Modernisation de l’État éthiopien', 'Défense de la souveraineté éthiopienne'],
    biography: 'Menelik II, empereur d’Éthiopie, dirigea la victoire d’Adwa contre l’Italie. Son règne incarne une souveraineté africaine défendue par la diplomatie, l’organisation militaire et la modernisation.',
    shortBiography: 'Empereur éthiopien vainqueur à Adwa.',
    tags: ['Éthiopie', 'Adwa', 'Souveraineté', 'Impérialisme'],
    verified: true,
  },
  {
    name: 'Samori Touré',
    birthDate: new Date('1830-01-01'),
    deathDate: new Date('1900-06-02'),
    birthPlace: { location: 'Manyambaladugu, Guinée', coordinates: { lat: 9.64, lng: -9.45 } },
    role: ['Guerrier', 'Diplomate', 'Roi/Reine'],
    achievements: ['Fondation de l’empire wassoulou', 'Résistance à la conquête française', 'Organisation d’un État militaire et commercial'],
    biography: 'Samori Touré bâtit l’empire wassoulou et résista pendant des années à l’avancée coloniale française. Son parcours met en lumière la stratégie, la mobilité et la diplomatie des résistances africaines.',
    shortBiography: 'Fondateur du Wassoulou et figure majeure de résistance.',
    tags: ['Guinée', 'Wassoulou', 'Résistance', 'Colonisation'],
    verified: true,
  },
  {
    name: 'Behanzin',
    birthDate: new Date('1845-01-01'),
    deathDate: new Date('1906-12-10'),
    birthPlace: { location: 'Abomey, Bénin', coordinates: { lat: 7.19, lng: 1.99 } },
    role: ['Roi/Reine', 'Guerrier'],
    achievements: ['Dernier roi indépendant du Dahomey', 'Résistance à la conquête française', 'Défense d’Abomey'],
    biography: 'Behanzin, roi du Dahomey, incarne la résistance du royaume face à l’expansion coloniale française. Sa mémoire reste liée à la souveraineté, à Abomey et à la dignité politique.',
    shortBiography: 'Roi du Dahomey, résistant à la conquête française.',
    tags: ['Bénin', 'Dahomey', 'Abomey', 'Résistance'],
    verified: true,
  },
  {
    name: 'Thomas Sankara',
    birthDate: new Date('1949-12-21'),
    deathDate: new Date('1987-10-15'),
    birthPlace: { location: 'Yako, Burkina Faso', coordinates: { lat: 12.96, lng: -2.26 } },
    role: ['Diplomate', 'Innovateur'],
    achievements: ['Renommage de la Haute-Volta en Burkina Faso', 'Campagnes de vaccination et d’alphabétisation', 'Promotion de la souveraineté et de l’intégrité'],
    biography: 'Thomas Sankara dirigea le Burkina Faso de 1983 à 1987 avec un projet centré sur l’intégrité, l’autonomie, l’éducation, la santé publique et la participation populaire.',
    shortBiography: 'Président burkinabè, symbole d’intégrité et de souveraineté.',
    legacy: 'Figure forte de motivation pour la jeunesse africaine.',
    tags: ['Burkina Faso', 'Panafricanisme', 'Intégrité', 'Jeunesse'],
    verified: true,
  },
  {
    name: 'Cheikh Anta Diop',
    birthDate: new Date('1923-12-29'),
    deathDate: new Date('1986-02-07'),
    birthPlace: { location: 'Thieytou, Sénégal', coordinates: { lat: 14.68, lng: -16.05 } },
    role: ['Savant', 'Innovateur'],
    achievements: ['Travaux sur l’histoire africaine ancienne', 'Recherche sur l’Égypte antique et les langues africaines', 'Influence durable sur la pensée panafricaine'],
    biography: 'Cheikh Anta Diop fut historien, anthropologue, physicien et penseur majeur. Ses travaux ont encouragé des générations à réexaminer l’histoire africaine avec rigueur et confiance intellectuelle.',
    shortBiography: 'Savant sénégalais, penseur majeur de l’histoire africaine.',
    tags: ['Sénégal', 'Histoire', 'Science', 'Panafricanisme'],
    verified: true,
  },
  {
    name: 'Wangari Maathai',
    birthDate: new Date('1940-04-01'),
    deathDate: new Date('2011-09-25'),
    birthPlace: { location: 'Nyeri, Kenya', coordinates: { lat: -0.42, lng: 36.95 } },
    role: ['Innovateur', 'Diplomate'],
    achievements: ['Fondation du Green Belt Movement', 'Prix Nobel de la paix 2004', 'Mobilisation pour l’environnement et les droits civiques'],
    biography: 'Wangari Maathai relia écologie, dignité, démocratie et action communautaire. Avec le Green Belt Movement, elle montra qu’un arbre planté peut devenir un acte politique et social.',
    shortBiography: 'Militante kényane, prix Nobel de la paix.',
    tags: ['Kenya', 'Environnement', 'Femmes', 'Prix Nobel'],
    verified: true,
  },
  {
    name: 'Miriam Makeba',
    birthDate: new Date('1932-03-04'),
    deathDate: new Date('2008-11-09'),
    birthPlace: { location: 'Johannesburg, Afrique du Sud', coordinates: { lat: -26.20, lng: 28.04 } },
    role: ['Artiste', 'Diplomate'],
    achievements: ['Voix internationale contre l’apartheid', 'Diffusion mondiale des musiques sud-africaines', 'Surnom Mama Africa'],
    biography: 'Miriam Makeba porta la musique sud-africaine sur les scènes du monde et utilisa sa voix pour dénoncer l’apartheid. Son art fut aussi une diplomatie de la dignité.',
    shortBiography: 'Artiste sud-africaine, voix mondiale contre l’apartheid.',
    tags: ['Afrique du Sud', 'Musique', 'Apartheid', 'Culture'],
    verified: true,
  },
  {
    name: 'Wole Soyinka',
    birthDate: new Date('1934-07-13'),
    birthPlace: { location: 'Abeokuta, Nigeria', coordinates: { lat: 7.15, lng: 3.35 } },
    role: ['Artiste', 'Savant'],
    achievements: ['Prix Nobel de littérature 1986', 'Œuvre théâtrale et essayistique majeure', 'Engagement pour la liberté d’expression'],
    biography: 'Wole Soyinka est écrivain, dramaturge et intellectuel nigérian. Premier Africain prix Nobel de littérature, il rappelle la puissance des mots face aux abus de pouvoir.',
    shortBiography: 'Écrivain nigérian, prix Nobel de littérature.',
    tags: ['Nigeria', 'Littérature', 'Théâtre', 'Liberté'],
    verified: true,
  },
  {
    name: 'Ellen Johnson Sirleaf',
    birthDate: new Date('1938-10-29'),
    birthPlace: { location: 'Monrovia, Liberia', coordinates: { lat: 6.30, lng: -10.80 } },
    role: ['Diplomate', 'Innovateur'],
    achievements: ['Première femme élue présidente en Afrique', 'Prix Nobel de la paix 2011', 'Reconstruction institutionnelle du Liberia'],
    biography: 'Ellen Johnson Sirleaf a dirigé le Liberia après des années de guerre civile. Son parcours ouvre une page importante sur le leadership féminin démocratique en Afrique.',
    shortBiography: 'Première femme élue présidente sur le continent africain.',
    tags: ['Liberia', 'Femmes', 'Démocratie', 'Prix Nobel'],
    verified: true,
  },
]

const richStories = [
  {
    title: 'Adwa, le jour où l’Afrique tint debout',
    subtitle: 'Souveraineté, stratégie et mémoire éthiopienne',
    description: 'Un récit en trois temps sur la bataille d’Adwa et la force symbolique qu’elle garde pour l’Afrique.',
    category: 'Documentaire',
    difficulty: 'intermediate',
    readingTime: 13,
    tags: ['Éthiopie', 'Adwa', 'Souveraineté', 'Résistance'],
    isFeatured: true,
    chapters: [
      { title: 'Avant la bataille', content: 'À la fin du XIXe siècle, l’Europe coloniale avance partout sur le continent. En Éthiopie, Menelik II comprend que la souveraineté se défend par la diplomatie, l’information et l’organisation. Les alliances internes deviennent essentielles.', order: 1 },
      { title: 'La victoire', content: 'Le 1er mars 1896, les forces éthiopiennes remportent une victoire décisive contre l’armée italienne. Adwa devient plus qu’un fait militaire : c’est une affirmation politique, une preuve que la conquête n’est pas une fatalité.', order: 2 },
      { title: 'Ce que cela inspire', content: 'Adwa reste une source de motivation pour les peuples qui défendent leur dignité. Elle rappelle qu’un projet collectif, préparé avec sérieux, peut modifier le cours de l’histoire.', order: 3 },
    ],
  },
  {
    title: 'Kerma et Méroé, les royaumes du Nil africain',
    subtitle: 'Nubie, pyramides et savoirs anciens',
    description: 'Un parcours pour redécouvrir les puissances nubiennes au-delà des récits centrés uniquement sur l’Égypte.',
    category: 'Histoire',
    difficulty: 'intermediate',
    readingTime: 14,
    tags: ['Nubie', 'Soudan', 'Kerma', 'Méroé', 'Koush'],
    isFeatured: true,
    chapters: [
      { title: 'Kerma, une puissance ancienne', content: 'Kerma montre que la vallée du Nil africain fut traversée par plusieurs centres de pouvoir. Ses monuments et ses tombes royales révèlent une société organisée, riche et connectée.', order: 1 },
      { title: 'Koush et la continuité', content: 'Le royaume de Koush développe ses propres institutions, ses souverains et ses lieux sacrés. Il dialogue avec l’Égypte, mais ne se réduit pas à elle.', order: 2 },
      { title: 'Méroé, ville de pierre et de fer', content: 'À Méroé, les pyramides, la métallurgie et l’écriture méroïtique rappellent que l’Afrique ancienne a produit des savoirs techniques, politiques et spirituels puissants.', order: 3 },
    ],
  },
  {
    title: 'Les cités swahilies, portes de l’océan Indien',
    subtitle: 'Commerce, langues et horizons maritimes',
    description: 'De Kilwa à Zanzibar, découvrez une Afrique ouverte, marchande et cosmopolite.',
    category: 'Documentaire',
    difficulty: 'beginner',
    readingTime: 12,
    tags: ['Swahili', 'Océan Indien', 'Tanzanie', 'Kenya', 'Commerce'],
    isFeatured: false,
    chapters: [
      { title: 'Une côte en mouvement', content: 'La côte swahilie relie l’Afrique de l’Est à l’Arabie, à l’Inde et au-delà. Les ports deviennent des lieux de commerce, de langues mêlées et d’architectures de corail.', order: 1 },
      { title: 'La force d’une langue', content: 'Le swahili naît dans ces échanges et devient une langue de circulation, de culture et d’identité. Il rappelle que les langues africaines sont aussi des ponts internationaux.', order: 2 },
      { title: 'Une leçon pour aujourd’hui', content: 'Les cités swahilies montrent qu’une société peut rester enracinée tout en parlant au monde. C’est une leçon d’ouverture sans effacement.', order: 3 },
    ],
  },
  {
    title: 'Thomas Sankara, agir avec intégrité',
    subtitle: 'Une boussole pour la jeunesse',
    description: 'Un récit de motivation autour de la discipline, de la dignité et du service public.',
    category: 'Biographie',
    difficulty: 'beginner',
    readingTime: 10,
    tags: ['Burkina Faso', 'Sankara', 'Jeunesse', 'Intégrité'],
    isFeatured: true,
    chapters: [
      { title: 'Nommer le pays', content: 'Renommer la Haute-Volta en Burkina Faso, “pays des hommes intègres”, n’est pas un détail symbolique. C’est une invitation à faire correspondre les mots, les actes et la responsabilité.', order: 1 },
      { title: 'Servir plutôt que paraître', content: 'Sankara reste dans les mémoires pour son refus du luxe politique et son appel à la sobriété. Son message parle encore à ceux qui veulent construire sans tricher.', order: 2 },
      { title: 'Ce que chacun peut retenir', content: 'L’intégrité commence dans les gestes quotidiens : apprendre, travailler, tenir parole, protéger le bien commun. Une révolution durable commence souvent par une discipline personnelle.', order: 3 },
    ],
  },
  {
    title: 'La parole des griots',
    subtitle: 'Mémoire, musique et transmission',
    description: 'Un récit sur les gardiens de la parole en Afrique de l’Ouest.',
    category: 'Documentaire',
    difficulty: 'beginner',
    readingTime: 11,
    tags: ['Griots', 'Oralité', 'Afrique de l’Ouest', 'Transmission'],
    isFeatured: false,
    chapters: [
      { title: 'La mémoire vivante', content: 'Le griot n’est pas seulement un musicien. Il garde des lignées, des récits, des leçons de conduite et des mémoires collectives qui aident une communauté à se comprendre.', order: 1 },
      { title: 'Dire pour relier', content: 'La parole chantée relie les générations. Elle transmet les victoires, les erreurs, les alliances et les valeurs sans enfermer le savoir dans un seul support.', order: 2 },
      { title: 'Préserver sans figer', content: 'Préserver l’oralité, ce n’est pas la transformer en musée. C’est donner aux jeunes les moyens de l’écouter, de la documenter et de la continuer.', order: 3 },
    ],
  },
]

const richQuizzes = [
  {
    title: 'Afrique ancienne - Nubie, Koush et Méroé',
    description: 'Un quiz pour réviser les royaumes africains de la vallée du Nil.',
    difficulty: 'intermediate',
    timeLimit: 540,
    passingScore: 70,
    tags: ['Nubie', 'Koush', 'Méroé', 'Antiquité'],
    questions: [
      { question: 'Dans quel pays actuel se trouvent Kerma et Méroé ?', type: 'multiple-choice', options: ['Soudan', 'Maroc', 'Ghana', 'Angola'], correctAnswer: 0, explanation: 'Kerma et Méroé sont situées dans l’actuel Soudan.', points: 20, order: 0 },
      { question: 'Quel titre est associé à certaines reines nubiennes ?', type: 'multiple-choice', options: ['Kandake', 'Mansa', 'Askia', 'Oba'], correctAnswer: 0, explanation: 'Le titre kandake désigne des reines ou reines mères de Koush.', points: 20, order: 1 },
      { question: 'Méroé est connue notamment pour ses pyramides et sa métallurgie.', type: 'true-false', options: [], correctAnswer: true, explanation: 'Méroé est célèbre pour ses pyramides et son activité métallurgique.', points: 20, order: 2 },
      { question: 'Quel fleuve structure fortement l’histoire de Kerma, Koush et Méroé ?', type: 'multiple-choice', options: ['Nil', 'Niger', 'Congo', 'Zambèze'], correctAnswer: 0, explanation: 'Le Nil est central dans l’histoire des royaumes nubiens.', points: 20, order: 3 },
    ],
  },
  {
    title: 'Femmes qui ont marqué l’Afrique',
    description: 'Testez vos connaissances sur des figures féminines de pouvoir, de résistance et de création.',
    difficulty: 'beginner',
    timeLimit: 480,
    passingScore: 65,
    tags: ['Femmes', 'Leadership', 'Résistance'],
    questions: [
      { question: 'Quelle reine angolaise résista aux Portugais ?', type: 'multiple-choice', options: ['Nzinga Mbande', 'Amina de Zazzau', 'Amanirenas', 'Wangari Maathai'], correctAnswer: 0, explanation: 'Nzinga Mbande dirigea les royaumes de Ndongo et Matamba.', points: 20, order: 0 },
      { question: 'Qui a fondé le Green Belt Movement ?', type: 'multiple-choice', options: ['Miriam Makeba', 'Wangari Maathai', 'Yaa Asantewaa', 'Ellen Johnson Sirleaf'], correctAnswer: 1, explanation: 'Wangari Maathai a fondé le Green Belt Movement au Kenya.', points: 20, order: 1 },
      { question: 'Yaa Asantewaa est associée à la résistance ashanti.', type: 'true-false', options: [], correctAnswer: true, explanation: 'Elle mena la guerre de l’Âge d’Or contre les Britanniques.', points: 20, order: 2 },
      { question: 'Ellen Johnson Sirleaf a été présidente du Liberia.', type: 'true-false', options: [], correctAnswer: true, explanation: 'Elle fut la première femme élue présidente sur le continent africain.', points: 20, order: 3 },
    ],
  },
  {
    title: 'Panafricanisme et indépendances',
    description: 'Un quiz pour comprendre les repères politiques de l’unité africaine.',
    difficulty: 'advanced',
    timeLimit: 660,
    passingScore: 75,
    tags: ['Panafricanisme', 'Indépendance', 'OUA'],
    questions: [
      { question: 'En quelle année l’OUA est-elle créée ?', type: 'multiple-choice', options: ['1957', '1960', '1963', '2002'], correctAnswer: 2, explanation: 'L’Organisation de l’unité africaine est créée le 25 mai 1963.', points: 25, order: 0 },
      { question: 'Quelle ville accueille la création de l’OUA ?', type: 'multiple-choice', options: ['Accra', 'Addis-Abeba', 'Dakar', 'Alger'], correctAnswer: 1, explanation: 'L’OUA est fondée à Addis-Abeba, en Éthiopie.', points: 20, order: 1 },
      { question: 'Le Ghana devient indépendant en 1957.', type: 'true-false', options: [], correctAnswer: true, explanation: 'Le Ghana obtient son indépendance le 6 mars 1957.', points: 15, order: 2 },
      { question: 'Quel pays est associé à la victoire d’Adwa ?', type: 'multiple-choice', options: ['Éthiopie', 'Mali', 'Algérie', 'Bénin'], correctAnswer: 0, explanation: 'Adwa est une victoire éthiopienne contre l’Italie.', points: 20, order: 3 },
    ],
  },
  {
    title: 'Savoirs, arts et oralité',
    description: 'Un quiz pour valoriser les formes africaines de transmission.',
    difficulty: 'beginner',
    timeLimit: 420,
    passingScore: 60,
    tags: ['Culture', 'Oralité', 'Arts'],
    questions: [
      { question: 'Quel rôle est associé aux griots en Afrique de l’Ouest ?', type: 'multiple-choice', options: ['Gardiens de la mémoire orale', 'Navigateurs du désert uniquement', 'Architectes de pyramides', 'Chefs militaires romains'], correctAnswer: 0, explanation: 'Les griots transmettent récits, généalogies, chants et enseignements.', points: 20, order: 0 },
      { question: 'La kora est un instrument associé à l’Afrique de l’Ouest.', type: 'true-false', options: [], correctAnswer: true, explanation: 'La kora est un instrument à cordes très présent dans les traditions mandingues.', points: 20, order: 1 },
      { question: 'Le swahili est lié à quelle zone ?', type: 'multiple-choice', options: ['Côte est-africaine', 'Désert du Namib', 'Forêt du Congo uniquement', 'Maghreb uniquement'], correctAnswer: 0, explanation: 'Le swahili s’est développé sur la côte de l’Afrique de l’Est.', points: 20, order: 2 },
      { question: 'Les traditions orales peuvent transmettre de l’histoire.', type: 'true-false', options: [], correctAnswer: true, explanation: 'Elles transmettent des mémoires, des valeurs et des repères historiques.', points: 20, order: 3 },
    ],
  },
]

const richProverbs = [
  ['BF', 'Burkina Faso', 'Mooré', 'La parole est comme l’eau : quand elle est versée, on ne la ramasse plus.', 'Une parole prononcée engage celui qui la dit. Elle invite à parler avec mesure.', 'Sagesse', ['parole', 'responsabilité']],
  ['BF', 'Burkina Faso', 'Dioula', 'Celui qui veut du miel doit accepter les piqûres des abeilles.', 'Toute réussite demande effort, patience et courage.', 'Travail', ['effort', 'courage']],
  ['CI', 'Côte d’Ivoire', 'Baoulé', 'On ne montre pas le chemin à celui qui refuse de marcher.', 'Le conseil ne sert que si la personne accepte d’agir.', 'Travail', ['action', 'conseil']],
  ['CI', 'Côte d’Ivoire', 'Akan', 'Le tam-tam ne résonne pas pour celui qui dort debout.', 'Il faut être attentif aux messages de la communauté.', 'Sagesse', ['écoute', 'communauté']],
  ['SN', 'Sénégal', 'Wolof', 'L’homme est le remède de l’homme.', 'La solidarité humaine est une force de guérison et de survie.', 'Relations', ['solidarité', 'humanité']],
  ['SN', 'Sénégal', 'Wolof', 'Celui qui apprend, grandit même assis.', 'Le savoir élève sans forcément déplacer le corps.', 'Sagesse', ['apprentissage', 'savoir']],
  ['ML', 'Mali', 'Bambara', 'La vérité peut marcher lentement, elle arrive toujours.', 'La vérité finit par se révéler malgré les retards.', 'Sagesse', ['vérité', 'patience']],
  ['ML', 'Mali', 'Soninké', 'Le vieux baobab a vu beaucoup de saisons.', 'Les anciens portent une mémoire qu’il faut écouter.', 'Famille', ['anciens', 'mémoire']],
  ['GN', 'Guinée', 'Malinké', 'Le fleuve ne devient pas grand sans recevoir des ruisseaux.', 'Les grandes œuvres naissent de petites contributions.', 'Relations', ['coopération', 'humilité']],
  ['GH', 'Ghana', 'Akan', 'Le bois déjà touché par le feu n’a pas peur de la fumée.', 'L’expérience rend plus fort face aux épreuves.', 'Sagesse', ['expérience', 'résilience']],
  ['GH', 'Ghana', 'Akan', 'Quand tu suis les traces de ton père, tu apprends où sont les pierres.', 'La mémoire familiale aide à éviter certaines erreurs.', 'Famille', ['transmission', 'famille']],
  ['NG', 'Nigeria', 'Yoruba', 'La main qui donne est toujours au-dessus de celle qui reçoit.', 'La générosité élève celui qui la pratique.', 'Relations', ['générosité', 'dignité']],
  ['NG', 'Nigeria', 'Igbo', 'Quand la lune brille, le boiteux oublie sa douleur.', 'La joie collective peut alléger les peines individuelles.', 'Spiritualité', ['joie', 'communauté']],
  ['BJ', 'Bénin', 'Fon', 'Le palmier ne porte pas ses fruits pour lui-même.', 'La vraie richesse sert aussi aux autres.', 'Relations', ['partage', 'communauté']],
  ['TG', 'Togo', 'Ewe', 'Une seule corde ne peut attacher le fagot.', 'La cohésion demande plusieurs forces réunies.', 'Relations', ['unité', 'coopération']],
  ['NE', 'Niger', 'Haoussa', 'Le puits profond ne se moque pas de la petite calebasse.', 'La grandeur doit rester humble devant les petits moyens.', 'Sagesse', ['humilité', 'respect']],
  ['DZ', 'Algérie', 'Arabe', 'Celui qui ne sait pas d’où il vient ne sait pas où il va.', 'La mémoire donne une direction à l’avenir.', 'Sagesse', ['mémoire', 'identité']],
  ['MA', 'Maroc', 'Amazigh', 'La montagne ne rencontre pas la montagne, mais les hommes se rencontrent.', 'Les chemins humains finissent par se croiser.', 'Relations', ['rencontre', 'destin']],
  ['ET', 'Éthiopie', 'Amharique', 'Quand les araignées s’unissent, elles peuvent attacher un lion.', 'L’union des plus modestes peut vaincre une grande force.', 'Relations', ['unité', 'courage']],
  ['KE', 'Kenya', 'Kikuyu', 'On ne coupe pas l’arbre qui donne de l’ombre.', 'Il faut protéger ce qui nourrit et protège la communauté.', 'Nature', ['protection', 'gratitude']],
  ['TZ', 'Tanzanie', 'Swahili', 'Petit à petit, on remplit la mesure.', 'La constance permet d’atteindre un grand résultat.', 'Travail', ['patience', 'discipline']],
  ['ZA', 'Afrique du Sud', 'Zulu', 'Une personne devient une personne par les autres.', 'L’identité se construit dans la relation et la communauté.', 'Relations', ['ubuntu', 'humanité']],
  ['ZW', 'Zimbabwe', 'Shona', 'Celui qui bâtit seul fatigue vite.', 'Les projets durables demandent entraide et organisation.', 'Travail', ['construction', 'entraide']],
  ['CD', 'République démocratique du Congo', 'Lingala', 'La rivière connaît le chemin même dans la nuit.', 'L’expérience guide quand la visibilité manque.', 'Sagesse', ['expérience', 'confiance']],
  ['CM', 'Cameroun', 'Bamiléké', 'Le chef ne mange pas avant d’avoir vu son peuple.', 'Le leadership commence par la responsabilité envers les autres.', 'Sagesse', ['leadership', 'service']],
].map(([countryCode, countryName, language, text, explanation, category, tags], index) => ({
  countryCode,
  countryName,
  language,
  text,
  explanation,
  category,
  tags,
  translation: '',
  source: `Tradition orale ${countryName}`,
  isVerified: true,
  isFeatured: index < 10,
}))

const proverbCountryBasics = {
  BF: ['Burkina Faso', 'Burkina Faso', 'Ouagadougou'],
  CI: ['Côte d’Ivoire', 'Côte d’Ivoire', 'Yamoussoukro'],
  SN: ['Senegal', 'Sénégal', 'Dakar'],
  ML: ['Mali', 'Mali', 'Bamako'],
  GN: ['Guinea', 'Guinée', 'Conakry'],
  GH: ['Ghana', 'Ghana', 'Accra'],
  NG: ['Nigeria', 'Nigeria', 'Abuja'],
  BJ: ['Benin', 'Bénin', 'Porto-Novo'],
  TG: ['Togo', 'Togo', 'Lomé'],
  NE: ['Niger', 'Niger', 'Niamey'],
  DZ: ['Algeria', 'Algérie', 'Alger'],
  MA: ['Morocco', 'Maroc', 'Rabat'],
  ET: ['Ethiopia', 'Éthiopie', 'Addis-Abeba'],
  KE: ['Kenya', 'Kenya', 'Nairobi'],
  TZ: ['Tanzania', 'Tanzanie', 'Dodoma'],
  ZA: ['South Africa', 'Afrique du Sud', 'Pretoria'],
  ZW: ['Zimbabwe', 'Zimbabwe', 'Harare'],
  CD: ['DR Congo', 'République démocratique du Congo', 'Kinshasa'],
  CM: ['Cameroon', 'Cameroun', 'Yaoundé'],
}

const insertUnique = async (Model, items, key, label) => {
  let created = 0
  let ignored = 0
  for (const item of items) {
    const existing = await Model.findOne({ [key]: item[key] })
    if (existing) {
      ignored++
      continue
    }
    await Model.create(item)
    created++
  }
  logger.info(`${label}: ${created} créés, ${ignored} déjà présents`)
  return { created, ignored }
}

const seedRichKnowledge = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  logger.info('🌍 Enrichissement MonBaobab: chronologie, figures, récits, quiz, proverbes et collections')

  const timeline = await insertUnique(TimelineEvent, richTimelineEvents, 'title', 'Chronologie enrichie')
  const figures = await insertUnique(HistoricalFigure, richFigures, 'name', 'Personnages enrichis')
  const stories = await insertUnique(Story, richStories, 'title', 'Récits enrichis')
  const quizzes = await insertUnique(Quiz, richQuizzes, 'title', 'Quiz enrichis')

  let proverbsCreated = 0
  let proverbsIgnored = 0
  let proverbsSkipped = 0
  const proverbIndexes = await Proverb.collection.indexes()
  const legacyTextIndex = proverbIndexes.find(
    (index) => index.name === 'text_text_translation_text_explanation_text_tags_text' && index.language_override === 'language'
  )
  if (legacyTextIndex) {
    await Proverb.collection.dropIndex(legacyTextIndex.name)
  }
  await Proverb.syncIndexes()
  for (const proverb of richProverbs) {
    let country = await Country.findOne({
      $or: [
        { id: proverb.countryCode },
        { nameFr: proverb.countryName },
        { name: proverb.countryName },
      ],
    })
    if (!country && proverbCountryBasics[proverb.countryCode]) {
      const [name, nameFr, capital] = proverbCountryBasics[proverb.countryCode]
      country = await Country.create({
        id: proverb.countryCode,
        name,
        nameFr,
        capital,
        description: `${nameFr} est ajouté comme repère minimal pour relier les proverbes et contenus MonBaobab. La fiche pays peut être enrichie depuis l’administration.`,
        culture: 'Fiche à compléter avec les langues, mémoires, arts, cuisines et sources locales.',
        lastUpdated: '2026',
        isActive: true,
      })
    }
    if (!country) {
      proverbsSkipped++
      continue
    }
    const existing = await Proverb.findOne({ text: proverb.text, country: country._id })
    if (existing) {
      proverbsIgnored++
      continue
    }
    await Proverb.create({
      ...proverb,
      country: country._id,
      views: 0,
      likes: 0,
    })
    proverbsCreated++
  }
  logger.info(`Proverbes enrichis: ${proverbsCreated} créés, ${proverbsIgnored} déjà présents, ${proverbsSkipped} sans pays`)

  const eventDocs = await TimelineEvent.find({ title: { $in: richTimelineEvents.map((item) => item.title) } })
  const figureDocs = await HistoricalFigure.find({ name: { $in: richFigures.map((item) => item.name) } })
  const storyDocs = await Story.find({ title: { $in: richStories.map((item) => item.title) } })

  const item = (type, doc, order, notes) => ({ type, itemId: doc._id, order, notes })
  const byText = (docs, text) => docs.filter((doc) => doc.title?.includes(text) || doc.name?.includes(text))

  const richCollections = [
    {
      title: 'Souverainetés africaines',
      description: 'Une collection pour comprendre comment des royaumes, empires, États et leaders ont défendu leur autonomie politique.',
      shortDescription: 'Adwa, Koush, Kongo, Dahomey, Wassoulou et autres repères de souveraineté.',
      theme: ['Guerre', 'Personnages'],
      difficulty: 'intermediate',
      estimatedTime: 55,
      order: 20,
      tags: ['Souveraineté', 'Résistance', 'Leadership', 'Motivation'],
      isFeatured: true,
      items: [
        ...byText(eventDocs, 'Adwa').map((doc, index) => item('event', doc, index, 'Victoire politique et militaire majeure')),
        ...byText(figureDocs, 'Menelik').map((doc, index) => item('figure', doc, index + 2, 'Leadership souverain')),
        ...byText(figureDocs, 'Samori').map((doc, index) => item('figure', doc, index + 4, 'Résistance organisée')),
      ],
    },
    {
      title: 'Femmes, courage et transmission',
      description: 'Des kandakes nubiennes aux militantes contemporaines, une collection pour puiser de la force dans des parcours de femmes africaines.',
      shortDescription: 'Leadership féminin, résistance, création et engagement.',
      theme: ['Personnages', 'Culture'],
      difficulty: 'beginner',
      estimatedTime: 45,
      order: 21,
      tags: ['Femmes', 'Courage', 'Transmission', 'Inspiration'],
      isFeatured: true,
      items: figureDocs
        .filter((doc) => ['Amanirenas', 'Amina', 'Wangari', 'Miriam', 'Ellen'].some((name) => doc.name.includes(name)))
        .map((doc, index) => item('figure', doc, index, 'Parcours à lire comme source de courage')),
    },
    {
      title: 'Savoirs anciens et villes africaines',
      description: 'Kerma, Méroé, Djenné-Djenno, Grand Zimbabwe et les cités swahilies racontent une Afrique urbaine, savante et connectée.',
      shortDescription: 'Archéologie, architecture, commerce et sciences africaines.',
      theme: ['Innovation', 'Culture', 'Commerce'],
      difficulty: 'intermediate',
      estimatedTime: 50,
      order: 22,
      tags: ['Savoirs', 'Villes', 'Architecture', 'Commerce'],
      isFeatured: true,
      items: eventDocs
        .filter((doc) => ['Kerma', 'Méroé', 'Djenné', 'Grand Zimbabwe', 'swahilies'].some((name) => doc.title.includes(name)))
        .map((doc, index) => item('event', doc, index, 'Repère de civilisation et de savoir')),
    },
    {
      title: 'Lire pour se relever',
      description: 'Une sélection de récits courts, motivants et documentaires pour comprendre, apprendre et garder confiance dans la mémoire africaine.',
      shortDescription: 'Récits de dignité, intégrité, oralité et transmission.',
      theme: ['Culture', 'Personnages', 'Événements'],
      difficulty: 'beginner',
      estimatedTime: 60,
      order: 23,
      tags: ['Motivation', 'Récits', 'Jeunesse', 'Mémoire'],
      isFeatured: true,
      items: storyDocs.map((doc, index) => item('story', doc, index, 'Récit recommandé pour nourrir la découverte')),
    },
  ]

  const collections = await insertUnique(Collection, richCollections, 'title', 'Collections enrichies')

  return {
    timeline,
    figures,
    stories,
    quizzes,
    proverbs: { created: proverbsCreated, ignored: proverbsIgnored, skipped: proverbsSkipped },
    collections,
  }
}

export { seedRichKnowledge }

if (process.argv[1] && process.argv[1].includes('seedRichKnowledge.js')) {
  seedRichKnowledge()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('❌ Erreur lors du seed enrichi', { message: error.message, stack: error.stack })
      process.exit(1)
    })
}
