import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDB } from '../config/database.js'
import Blog from '../models/Blog.js'
import Product from '../models/Product.js'
import logger from '../utils/logger.js'

dotenv.config()

const blogImageBase = '/content/blog'

const articleImages = {
  bogolan: `${blogImageBase}/bogolan-mali.webp`,
  cities: `${blogImageBase}/ville-abidjan.webp`,
  karite: `${blogImageBase}/karite-burkina.webp`,
  masks: `${blogImageBase}/masque-africain.webp`,
  griots: `${blogImageBase}/griot-kora.webp`,
  markets: `${blogImageBase}/marche-mali.webp`,
}

const productImageBase = '/content/products'

const productImages = {
  bogolan: `${productImageBase}/bogolan-mali.webp`,
  karite: `${productImageBase}/karite-burkina.webp`,
  panier: `${productImageBase}/panier-africain.webp`,
  perlesAkan: `${productImageBase}/perles-akan.webp`,
  carnet: `${productImageBase}/carnet-transmission.webp`,
  epices: `${productImageBase}/epices-nigeria.webp`,
  djembe: `${productImageBase}/djembe-guinee.webp`,
  carte: `${productImageBase}/carte-afrique-culturelle.webp`,
}

const demoBlogs = [
  {
    title: 'Bogolan : lire le Mali dans un tissu',
    excerpt: 'Le bogolan raconte une manière de travailler la terre, les plantes, les signes et la mémoire familiale.',
    content: `Le bogolan n'est pas seulement un textile décoratif. Il relie la terre, les plantes tinctoriales, les gestes d'atelier et les récits transmis dans plusieurs régions du Mali.

Chaque motif peut devenir un repère : protection, passage, famille, appartenance ou souvenir. Pour MonBaobab, ce type de savoir est précieux parce qu'il permet de comprendre comment un objet peut porter une histoire sans avoir besoin d'un long discours.

Dans une fiche ou une collection, le bogolan peut être relié au Mali, aux traditions mandingues, aux ateliers de teinture, à la transmission féminine et aux routes culturelles d'Afrique de l'Ouest.`,
    author: 'Équipe MonBaobab',
    image: articleImages.bogolan,
    category: 'Culture',
    tags: ['Mali', 'Bogolan', 'Textile', 'Savoir-faire', 'Transmission'],
    published: true,
    verified: false,
    views: 128,
  },
  {
    title: 'Dakar, Abidjan, Lagos : trois villes qui font circuler les idées',
    excerpt: 'Ces villes ne sont pas seulement grandes : elles produisent des sons, des images, des styles et des manières nouvelles de raconter l’Afrique.',
    content: `Dakar, Abidjan et Lagos sont des carrefours urbains majeurs. On y croise des entrepreneurs, des artistes, des étudiants, des artisans, des journalistes, des développeurs et des familles venues de plusieurs régions.

Leur importance ne tient pas seulement à leur taille. Ces villes fabriquent des imaginaires : musique, mode, cinéma, design, médias, gastronomie, langues urbaines et nouvelles formes de communauté.

Pour une plateforme de découverte, les villes servent de portes d'entrée. Elles permettent de relier les pays aux récits contemporains, aux produits créatifs, aux figures publiques, aux communautés et aux parcours de visite.`,
    author: 'Équipe MonBaobab',
    image: articleImages.cities,
    category: 'Géographie',
    tags: ['Sénégal', 'Côte d’Ivoire', 'Nigeria', 'Villes', 'Créativité'],
    published: true,
    verified: false,
    views: 214,
  },
  {
    title: 'Le karité : un savoir du quotidien devenu ressource mondiale',
    excerpt: 'Du soin familial aux marchés internationaux, le karité montre comment un savoir local peut devenir économie, identité et transmission.',
    content: `Le karité occupe une place importante dans plusieurs pays d'Afrique de l'Ouest. Il est utilisé dans les soins, la cuisine, les rituels du quotidien et les activités économiques, souvent avec une forte présence des femmes dans la transformation.

Un produit au karité ne devrait pas être présenté seulement comme un cosmétique. Il peut raconter les arbres, les saisons, les coopératives, les gestes de transformation, la valeur du travail local et les questions de commerce équitable.

Sur MonBaobab, ce type de contenu peut connecter boutique, pays, récits, figures économiques, communautés et savoirs à préserver.`,
    author: 'Équipe MonBaobab',
    image: articleImages.karite,
    category: 'Économie',
    tags: ['Karité', 'Burkina Faso', 'Mali', 'Femmes', 'Économie locale'],
    published: true,
    verified: false,
    views: 96,
  },
  {
    title: 'Les masques : regarder sans réduire',
    excerpt: 'Un masque ne se comprend pas seulement par sa forme. Il faut aussi regarder le contexte, le moment, la communauté et la parole qui l’accompagne.',
    content: `Les masques africains sont souvent regardés comme des objets d'art isolés. Pourtant, dans de nombreux contextes, ils prennent sens dans une cérémonie, une danse, une saison, une initiation, une fête ou une mémoire collective.

Leur valeur n'est donc pas seulement visuelle. Elle est sociale, spirituelle, pédagogique et parfois politique. Les documenter demande prudence, respect et contextualisation.

Pour MonBaobab, un masque peut être relié à un pays, une région, un peuple, une cérémonie, un récit, un proverbe et une collection dédiée aux arts vivants.`,
    author: 'Équipe MonBaobab',
    image: articleImages.masks,
    category: 'Culture',
    tags: ['Masques', 'Rituels', 'Art', 'Transmission', 'Mémoire'],
    published: true,
    verified: false,
    views: 172,
  },
  {
    title: 'Griots, conteurs et mémoire vivante',
    excerpt: 'La mémoire orale ne se limite pas au passé. Elle aide encore à nommer, conseiller, relier et transmettre.',
    content: `Dans plusieurs sociétés d'Afrique de l'Ouest, les griots, conteurs et détenteurs de mémoire jouent un rôle essentiel. Ils conservent des généalogies, racontent les parcours, accompagnent les moments sociaux et transmettent des leçons de vie.

La parole orale n'est pas moins sérieuse qu'une archive écrite. Elle obéit à ses propres règles : contexte, relation, responsabilité, rythme, public et mémoire.

MonBaobab peut aider à préserver ces savoirs en reliant proverbes, récits, langues, figures, familles, lieux et sources vérifiées.`,
    author: 'Équipe MonBaobab',
    image: articleImages.griots,
    category: 'Histoire',
    tags: ['Griots', 'Oralité', 'Proverbes', 'Récits', 'Afrique de l’Ouest'],
    published: true,
    verified: false,
    views: 188,
  },
  {
    title: 'Marchés africains : lieux d’achat, lieux de savoir',
    excerpt: 'Dans un marché, on découvre des produits, mais aussi des langues, des saisons, des réseaux et des gestes.',
    content: `Un marché est souvent l'un des meilleurs endroits pour comprendre un pays. On y observe les produits de saison, les langues parlées, les prix, les négociations, les matières, les odeurs et les liens entre ville et campagne.

Les marchés racontent l'économie quotidienne. Ils montrent comment circulent les céréales, les tissus, les épices, les paniers, les bijoux, les plantes, les outils et les informations.

Dans MonBaobab, les marchés peuvent servir de pont naturel entre fiche pays, boutique, cuisine, artisanat, récits et conseils pratiques.`,
    author: 'Équipe MonBaobab',
    image: articleImages.markets,
    category: 'Économie',
    tags: ['Marchés', 'Cuisine', 'Artisanat', 'Économie', 'Quotidien'],
    published: true,
    verified: false,
    views: 143,
  },
]

const demoProducts = [
  {
    name: 'Écharpe bogolan artisanale',
    description: 'Écharpe inspirée du bogolan malien, pensée comme une pièce de test pour relier textile, histoire et pays dans la boutique MonBaobab.',
    shortDescription: 'Textile inspiré du bogolan, idéal pour tester les fiches produit.',
    price: 18500,
    comparePrice: 22000,
    prices: { FCFA: 18500, EUR: 28, USD: 30 },
    currency: 'FCFA',
    images: [productImages.bogolan],
    additionalImages: [],
    category: 'Textile',
    tags: ['Mali', 'Bogolan', 'Textile', 'Artisanat'],
    stock: 18,
    sku: 'DEMO-MB-BOGOLAN-001',
    country: 'Mali',
    rating: { average: 4.7, count: 12 },
    isActive: true,
    isFeatured: true,
    views: 340,
  },
  {
    name: 'Beurre de karité brut',
    description: 'Beurre de karité de test pour présenter les savoirs du soin, les coopératives féminines et les usages quotidiens en Afrique de l’Ouest.',
    shortDescription: 'Karité brut pour tester une fiche produit bien contextualisée.',
    price: 6500,
    prices: { FCFA: 6500, EUR: 10, USD: 11 },
    currency: 'FCFA',
    images: [productImages.karite],
    category: 'Cuisine',
    tags: ['Karité', 'Soin', 'Burkina Faso', 'Coopératives'],
    stock: 42,
    sku: 'DEMO-MB-KARITE-001',
    country: 'Burkina Faso',
    rating: { average: 4.8, count: 25 },
    isActive: true,
    isFeatured: true,
    views: 410,
  },
  {
    name: 'Panier tressé sahélien',
    description: 'Panier tressé décoratif et utile, ajouté pour tester les catégories artisanales, les images, le stock et les filtres par pays.',
    shortDescription: 'Panier de test pour valoriser le tressage et les usages du quotidien.',
    price: 14500,
    prices: { FCFA: 14500, EUR: 22, USD: 24 },
    currency: 'FCFA',
    images: [productImages.panier],
    category: 'Artisanat',
    tags: ['Tressage', 'Sahel', 'Maison', 'Artisanat'],
    stock: 15,
    sku: 'DEMO-MB-PANIER-001',
    country: 'Sénégal',
    rating: { average: 4.5, count: 9 },
    isActive: true,
    isFeatured: false,
    views: 210,
  },
  {
    name: 'Collier perles Akan',
    description: 'Collier inspiré des perles et parures d’Afrique de l’Ouest, utile pour tester les favoris, la wishlist et les produits liés à la Côte d’Ivoire.',
    shortDescription: 'Bijou de test inspiré des parures Akan.',
    price: 12000,
    prices: { FCFA: 12000, EUR: 18, USD: 20 },
    currency: 'FCFA',
    images: [productImages.perlesAkan],
    category: 'Bijoux',
    tags: ['Akan', 'Perles', 'Côte d’Ivoire', 'Bijoux'],
    stock: 30,
    sku: 'DEMO-MB-AKAN-001',
    country: "Côte d’Ivoire",
    rating: { average: 4.4, count: 16 },
    isActive: true,
    isFeatured: true,
    views: 287,
  },
  {
    name: 'Carnet de proverbes',
    description: 'Carnet papier fictif pour tester un produit éditorial relié aux proverbes, aux récits et à la transmission orale.',
    shortDescription: 'Carnet de test pour notes, proverbes et récits familiaux.',
    price: 4500,
    prices: { FCFA: 4500, EUR: 7, USD: 8 },
    currency: 'FCFA',
    images: [productImages.carnet],
    category: 'Autre',
    tags: ['Proverbes', 'Écriture', 'Transmission', 'Carnet'],
    stock: 55,
    sku: 'DEMO-MB-CARNET-001',
    country: 'Ghana',
    rating: { average: 4.2, count: 7 },
    isActive: true,
    isFeatured: false,
    views: 130,
  },
  {
    name: 'Set épices cuisine ouest-africaine',
    description: 'Set de test pour représenter les goûts, marchés et pratiques culinaires. Les administrateurs pourront le retirer après validation de l’interface.',
    shortDescription: 'Épices de test pour cuisine, marchés et découverte.',
    price: 9000,
    prices: { FCFA: 9000, EUR: 14, USD: 15 },
    currency: 'FCFA',
    images: [productImages.epices],
    category: 'Cuisine',
    tags: ['Cuisine', 'Épices', 'Marchés', 'Afrique de l’Ouest'],
    stock: 24,
    sku: 'DEMO-MB-EPICES-001',
    country: 'Nigeria',
    rating: { average: 4.6, count: 11 },
    isActive: true,
    isFeatured: true,
    views: 366,
  },
  {
    name: 'Mini djembé décoratif',
    description: 'Instrument décoratif de test pour vérifier l’affichage des produits musique, des prix et des interactions panier.',
    shortDescription: 'Mini djembé pour tester la catégorie musique.',
    price: 23500,
    prices: { FCFA: 23500, EUR: 36, USD: 39 },
    currency: 'FCFA',
    images: [productImages.djembe],
    category: 'Musique',
    tags: ['Djembé', 'Musique', 'Mandé', 'Instrument'],
    stock: 10,
    sku: 'DEMO-MB-DJEMBE-001',
    country: 'Guinée',
    rating: { average: 4.3, count: 8 },
    isActive: true,
    isFeatured: false,
    views: 178,
  },
  {
    name: 'Affiche carte culturelle Afrique',
    description: 'Affiche de test pour relier décoration, pays, carte et découverte. Utile pour tester les images verticales et la présentation boutique.',
    shortDescription: 'Affiche décorative de test autour de la carte culturelle.',
    price: 11000,
    prices: { FCFA: 11000, EUR: 17, USD: 18 },
    currency: 'FCFA',
    images: [productImages.carte],
    category: 'Artisanat',
    tags: ['Carte', 'Décoration', 'Afrique', 'Culture'],
    stock: 20,
    sku: 'DEMO-MB-AFFICHE-001',
    country: 'Afrique',
    rating: { average: 4.1, count: 5 },
    isActive: true,
    isFeatured: false,
    views: 122,
  },
]

const upsertByUniqueField = async (Model, items, field, label) => {
  let created = 0
  let updated = 0

  for (const item of items) {
    const existing = await Model.findOne({ [field]: item[field] })
    if (existing) {
      await Model.updateOne({ _id: existing._id }, { $set: item })
      updated++
    } else {
      await Model.create(item)
      created++
    }
  }

  logger.info(`${label}: ${created} créé(s), ${updated} mis à jour`)
  return { created, updated }
}

export const seedDemoCommerceBlog = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB()
  }

  logger.info('Ajout des blogs et produits de démonstration...')
  const blogs = await upsertByUniqueField(Blog, demoBlogs, 'title', 'Blogs de démonstration')
  const products = await upsertByUniqueField(Product, demoProducts, 'sku', 'Produits de démonstration')

  return { blogs, products }
}

if (process.argv[1] && process.argv[1].includes('seedDemoCommerceBlog.js')) {
  seedDemoCommerceBlog()
    .then((result) => {
      logger.info('Seed de démonstration terminé', result)
      return mongoose.connection.close()
    })
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error('Erreur pendant le seed de démonstration:', error)
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
      process.exit(1)
    })
}
