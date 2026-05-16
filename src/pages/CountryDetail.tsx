import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import { DocumentViewer } from '../components/MediaViewer/DocumentViewer'
import { CountryImmersive } from '../components/Country/CountryImmersive'
import { CountryInteractiveMap } from '../components/Country/CountryInteractiveMap'
import { countryService, searchService } from '../services/api'
import { getCountryById as getStaticCountryById } from '../data/allAfricanCountries'
import { getCountryDiscoveryDefault } from '../data/countryDiscoveryDefaults'
import './CountryDetail.css'

// Fonction pour obtenir l'URL du drapeau d'un pays
const getFlagUrl = (countryId: string, size: 'w40' | 'w80' | 'w160' | 'w320' = 'w160') => {
  const codeMap: Record<string, string> = {
    'EH': 'eh', // Sahara occidental
  }
  
  const code = codeMap[countryId] || countryId.toLowerCase()
  return `https://flagcdn.com/${size}/${code}.png`
}

interface CustomSection {
  title: string
  content: string
  type: 'text' | 'html' | 'list'
  order: number
}

interface CountryImage {
  url: string
  caption: string
  order: number
}

interface CountryPDF {
  url: string
  title: string
  description: string
  order?: number
}

interface CountryVideo {
  url: string
  title: string
  description?: string
  type?: 'youtube' | 'vimeo' | 'direct' | 'other'
  thumbnail?: string
  order?: number
}

interface CountryDocument {
  url: string
  title: string
  description?: string
  type?: 'docx' | 'doc' | 'xlsx' | 'xls' | 'pptx' | 'ppt' | 'txt' | 'other'
  order?: number
}

interface CountryMapPlace {
  name?: string
  type?: 'capital' | 'economic' | 'historic' | 'cultural' | 'natural' | 'port'
  description?: string
  highlight?: string
  coordinates?: {
    lat?: number
    lng?: number
  }
}

type RelatedContentType = 'proverbs' | 'figures' | 'events' | 'stories' | 'collections' | 'quizzes'

interface RelatedContentItem {
  _id?: string
  id?: string
  title?: string
  name?: string
  text?: string
  translation?: string
  shortDescription?: string
  shortBiography?: string
  subtitle?: string
  description?: string
  period?: string
  category?: string
  difficulty?: string
  totalPoints?: number
}

type RelatedContentResults = Partial<Record<RelatedContentType, RelatedContentItem[]>>

interface RecommendedPath {
  title: string
  description: string
  items?: string[]
}

interface Country {
  _id: string
  id: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  culture: string
  oneSentenceSummary?: string
  keyFacts?: string[]
  peoples?: string[]
  languageNotes?: string
  historyHighlights?: string[]
  notableFigures?: string[]
  musicAndArts?: string[]
  foodCulture?: string[]
  oralTraditions?: string[]
  knowledgeToPreserve?: string[]
  recommendedPaths?: RecommendedPath[]
  relatedThemes?: string[]
  sourceQuality?: 'draft' | 'community' | 'verified' | 'official'
  discoveryIntro?: string
  lastUpdated?: string
  officialName?: string
  region?: string
  subregion?: string
  demonym?: string
  timeZone?: string
  callingCode?: string
  internetTld?: string
  drivingSide?: string
  independenceDate?: string
  governmentType?: string
  economicOverview?: string
  climate?: string
  bestTimeToVisit?: string
  safetyNote?: string
  etiquette?: string
  transport?: string
  connectivity?: string
  visaNote?: string
  healthAdvice?: string
  emergencyNumbers?: string
  color: string
  rites?: string[]
  customs?: string[]
  foods?: string[]
  traditions?: string[]
  festivals?: string[]
  arts?: string[]
  placesToDiscover?: string[]
  experiences?: string[]
  practicalTips?: string[]
  sourceNotes?: string[]
  customSections?: CustomSection[]
  images?: CountryImage[]
  pdfs?: CountryPDF[]
  videos?: CountryVideo[]
  documents?: CountryDocument[]
  mapPlaces?: CountryMapPlace[]
  historicalSites?: CountryMapPlace[]
}

const applyDiscoveryDefaults = (country: Country): Country => {
  const defaults = getCountryDiscoveryDefault(country.id)
  return {
    ...defaults,
    ...country,
    oneSentenceSummary: country.oneSentenceSummary || defaults.oneSentenceSummary,
    keyFacts: country.keyFacts?.length ? country.keyFacts : defaults.keyFacts,
    peoples: country.peoples?.length ? country.peoples : defaults.peoples,
    languageNotes: country.languageNotes || defaults.languageNotes,
    historyHighlights: country.historyHighlights?.length ? country.historyHighlights : defaults.historyHighlights,
    notableFigures: country.notableFigures?.length ? country.notableFigures : defaults.notableFigures,
    musicAndArts: country.musicAndArts?.length ? country.musicAndArts : defaults.musicAndArts,
    foodCulture: country.foodCulture?.length ? country.foodCulture : defaults.foodCulture,
    oralTraditions: country.oralTraditions?.length ? country.oralTraditions : defaults.oralTraditions,
    knowledgeToPreserve: country.knowledgeToPreserve?.length ? country.knowledgeToPreserve : defaults.knowledgeToPreserve,
    recommendedPaths: country.recommendedPaths?.length ? country.recommendedPaths : defaults.recommendedPaths,
    relatedThemes: country.relatedThemes?.length ? country.relatedThemes : defaults.relatedThemes,
    sourceQuality: country.sourceQuality || defaults.sourceQuality || 'draft',
    discoveryIntro: country.discoveryIntro || defaults.discoveryIntro || country.description,
    economicOverview: country.economicOverview || defaults.economicOverview,
    climate: country.climate || defaults.climate,
    bestTimeToVisit: country.bestTimeToVisit || defaults.bestTimeToVisit,
    etiquette: country.etiquette || defaults.etiquette,
    transport: country.transport || defaults.transport,
    connectivity: country.connectivity || defaults.connectivity,
    visaNote: country.visaNote || defaults.visaNote,
    healthAdvice: country.healthAdvice || defaults.healthAdvice,
    safetyNote: country.safetyNote || defaults.safetyNote,
    placesToDiscover: country.placesToDiscover?.length ? country.placesToDiscover : defaults.placesToDiscover,
    experiences: country.experiences?.length ? country.experiences : defaults.experiences,
    practicalTips: country.practicalTips?.length ? country.practicalTips : defaults.practicalTips,
    sourceNotes: country.sourceNotes?.length ? country.sourceNotes : defaults.sourceNotes,
    rites: country.rites?.length ? country.rites : defaults.rites,
    customs: country.customs?.length ? country.customs : defaults.customs,
    foods: country.foods?.length ? country.foods : defaults.foods,
    traditions: country.traditions?.length ? country.traditions : defaults.traditions,
    festivals: country.festivals?.length ? country.festivals : defaults.festivals,
    arts: country.arts?.length ? country.arts : defaults.arts,
    lastUpdated: country.lastUpdated || defaults.lastUpdated || '2026',
  }
}

const splitReadable = (value?: string) => {
  if (!value) return []
  return value
    .split(/[,;•]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const uniq = (items: Array<string | undefined | null>) => {
  const seen = new Set<string>()
  return items
    .filter(Boolean)
    .map((item) => item!.trim())
    .filter((item) => {
      const key = item.toLowerCase()
      if (!item || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const relatedContentConfig: Array<{
  key: RelatedContentType
  title: string
  label: string
  emptyAction: string
}> = [
  { key: 'proverbs', title: 'Proverbes', label: 'Parole', emptyAction: 'Lire les proverbes' },
  { key: 'stories', title: 'Récits', label: 'Récit', emptyAction: 'Lire les récits' },
  { key: 'figures', title: 'Personnages', label: 'Figure', emptyAction: 'Voir les personnages' },
  { key: 'events', title: 'Chronologie', label: 'Date', emptyAction: 'Voir la chronologie' },
  { key: 'collections', title: 'Collections', label: 'Parcours', emptyAction: 'Ouvrir les collections' },
  { key: 'quizzes', title: 'Quiz', label: 'Quiz', emptyAction: 'Tester ses repères' },
]

const getRelatedItemTitle = (item: RelatedContentItem) => (
  item.title || item.name || item.text || 'Contenu MonBaobab'
)

const getRelatedItemText = (item: RelatedContentItem) => (
  item.shortDescription ||
  item.shortBiography ||
  item.subtitle ||
  item.translation ||
  item.description ||
  item.period ||
  item.category ||
  (item.difficulty ? `${item.difficulty}${item.totalPoints ? ` · ${item.totalPoints} points` : ''}` : '')
)

const getRelatedItemPath = (type: RelatedContentType, item: RelatedContentItem, countryQuery: string) => {
  const id = item._id || item.id
  if (type === 'proverbs') return `/proverbs?search=${countryQuery}`
  if (!id) return `/search?q=${countryQuery}&type=${type}`
  if (type === 'figures') return `/figures/${id}`
  if (type === 'events') return `/timeline/${id}`
  if (type === 'stories') return `/stories/${id}`
  if (type === 'collections') return `/collections/${id}`
  if (type === 'quizzes') return `/quizzes/${id}`
  return `/search?q=${countryQuery}&type=${type}`
}

export const CountryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingMode, setReadingMode] = useState<'essential' | 'deep'>('deep')
  const [relatedContent, setRelatedContent] = useState<RelatedContentResults | null>(null)
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPDF, setSelectedPDF] = useState<CountryPDF | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<CountryVideo | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<CountryDocument | null>(null)

  useEffect(() => {
    if (id) {
      fetchCountry()
    }
  }, [id])

  // Debug: Afficher les PDFs dans la console
  useEffect(() => {
    if (country?.pdfs && country.pdfs.length > 0) {
      const validPDFs = country.pdfs.filter(pdf => pdf && pdf.url && pdf.title)
      if (validPDFs.length > 0) {
        console.log('PDFs disponibles:', validPDFs)
      }
    }
  }, [country?.pdfs])

  useEffect(() => {
    if (!country?.nameFr) {
      setRelatedContent(null)
      return
    }

    let cancelled = false
    setRelatedLoading(true)

    searchService.search({ q: country.nameFr, limit: 3 })
      .then((response) => {
        if (!cancelled) {
          setRelatedContent(response.data || null)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Erreur lors du chargement des contenus liés:', error)
          setRelatedContent(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRelatedLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [country?.nameFr])

  const fetchCountry = async () => {
    try {
      setLoading(true)
      // Essayer d'abord de charger depuis l'API
      try {
        const response = await countryService.getById(id!)
        if (response.data) {
          console.log('Pays chargé depuis l\'API:', {
            id: response.data.id,
            name: response.data.nameFr,
            pdfsCount: response.data.pdfs?.length || 0,
            pdfs: response.data.pdfs
          })
          setCountry(applyDiscoveryDefaults(response.data))
          return
        }
      } catch (apiError: any) {
        // Si l'API retourne 404, c'est normal si le pays n'est pas encore en base
        // On utilisera les données statiques comme fallback
        if (apiError.response?.status !== 404) {
          console.error('Erreur API:', apiError)
        }
      }
      
      // Fallback vers les données statiques
      const countryIdUpper = id!.toUpperCase()
      const staticCountry = getStaticCountryById(countryIdUpper)
      if (staticCountry) {
        // Convertir le format statique au format attendu
        setCountry(applyDiscoveryDefaults({
          _id: staticCountry.id,
          id: staticCountry.id,
          nameFr: staticCountry.nameFr,
          capital: staticCountry.capital,
          population: staticCountry.population,
          area: staticCountry.area,
          languages: staticCountry.languages || [],
          currency: staticCountry.currency || '',
          description: staticCountry.description,
          culture: staticCountry.culture || '',
          discoveryIntro: staticCountry.description,
          lastUpdated: '2026',
          officialName: staticCountry.nameFr,
          region: '',
          subregion: '',
          color: staticCountry.color,
          rites: staticCountry.rites,
          customs: staticCountry.customs,
          foods: staticCountry.foods,
          traditions: staticCountry.traditions,
          festivals: staticCountry.festivals,
          arts: staticCountry.arts,
          placesToDiscover: [],
          experiences: [],
          practicalTips: [],
          sourceNotes: ['Données de base issues du catalogue MonBaobab. À compléter depuis l’administration avec les sources 2026.'],
          customSections: [],
          images: [],
          pdfs: [],
        }))
      } else {
        // Aucun pays trouvé ni dans l'API ni dans les données statiques
        console.error(`Pays avec l'ID "${id}" non trouvé`)
        setCountry(null)
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du pays:', err)
      // Essayer quand même le fallback statique en cas d'erreur
      try {
        const countryIdUpper = id!.toUpperCase()
        const staticCountry = getStaticCountryById(countryIdUpper)
        if (staticCountry) {
          setCountry(applyDiscoveryDefaults({
            _id: staticCountry.id,
            id: staticCountry.id,
            nameFr: staticCountry.nameFr,
            capital: staticCountry.capital,
            population: staticCountry.population,
            area: staticCountry.area,
            languages: staticCountry.languages || [],
            currency: staticCountry.currency || '',
            description: staticCountry.description,
            culture: staticCountry.culture || '',
            discoveryIntro: staticCountry.description,
            lastUpdated: '2026',
            officialName: staticCountry.nameFr,
            region: '',
            subregion: '',
            color: staticCountry.color,
            rites: staticCountry.rites,
            customs: staticCountry.customs,
            foods: staticCountry.foods,
            traditions: staticCountry.traditions,
            festivals: staticCountry.festivals,
            arts: staticCountry.arts,
            placesToDiscover: [],
            experiences: [],
            practicalTips: [],
            sourceNotes: ['Données de base issues du catalogue MonBaobab. À compléter depuis l’administration avec les sources 2026.'],
            customSections: [],
            images: [],
            pdfs: [],
          }))
          return
        }
      } catch (fallbackError) {
        console.error('Erreur lors du fallback:', fallbackError)
      }
      setCountry(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="country-detail-loading" aria-live="polite">
          <div className="country-skeleton-hero">
            <span />
            <strong />
            <p />
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="country-skeleton-grid">
            <span />
            <span />
            <span />
          </div>
        </div>
      </Layout>
    )
  }

  if (!country) {
    return (
      <Layout>
        <div className="country-detail-not-found">
          <h1>Pays non trouvé</h1>
          <p>Le pays que vous recherchez n'existe pas.</p>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  // Trier les sections personnalisées par ordre
  const sortedCustomSections = country.customSections
    ? [...country.customSections].sort((a, b) => a.order - b.order)
    : []

  // Trier les images par ordre
  const sortedImages = country.images
    ? [...country.images].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  // Trier les PDFs par ordre
  const sortedPDFs = country.pdfs
    ? [...country.pdfs]
        .filter(pdf => pdf && pdf.url && pdf.title) // Filtrer les PDFs valides
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  // Trier les vidéos par ordre
  const sortedVideos = country.videos
    ? [...country.videos].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  // Trier les documents par ordre
  const sortedDocuments = country.documents
    ? [...country.documents].sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const discoveryIntro = country.discoveryIntro || country.description
  const identityFacts = [
    ['Capitale', country.capital],
    ['Population', country.population],
    ['Superficie', country.area],
    ['Langues', country.languages?.join(', ')],
    ['Monnaie', country.currency],
    ['Nom officiel', country.officialName],
    ['Région', country.region],
    ['Sous-région', country.subregion],
    ['Gentilé', country.demonym],
    ['Indépendance', country.independenceDate],
  ].filter(([, value]) => Boolean(value))

  const practicalFacts = [
    ['Fuseau horaire', country.timeZone],
    ['Indicatif', country.callingCode],
    ['Domaine internet', country.internetTld],
    ['Conduite', country.drivingSide],
    ['Numéros utiles', country.emergencyNumbers],
  ].filter(([, value]) => Boolean(value))

  const contextBlocks = [
    ['Institutions', country.governmentType],
    ['Économie', country.economicOverview],
    ['Climat', country.climate],
    ['Meilleure période', country.bestTimeToVisit],
  ].filter(([, value]) => Boolean(value))

  const travelBlocks = [
    ['Visa et entrée', country.visaNote],
    ['Santé', country.healthAdvice],
    ['Sécurité', country.safetyNote],
    ['Transport', country.transport],
    ['Connexion', country.connectivity],
    ['Codes sociaux', country.etiquette],
  ].filter(([, value]) => Boolean(value))

  const discoveryLists = [
    ['Lieux à découvrir', country.placesToDiscover || []],
    ['Expériences à vivre', country.experiences || []],
    ['Conseils pratiques', country.practicalTips || []],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0) as [string, string[]][]

  const cultureLists = [
    ['Rites et cérémonies', country.rites || []],
    ['Coutumes', country.customs || []],
    ['Gastronomie', country.foods || []],
    ['Festivals', country.festivals || []],
    ['Arts et artisanat', country.arts || []],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0) as [string, string[]][]

  const startHereItems = [
    country.placesToDiscover?.[0] ? ['Voir', country.placesToDiscover[0], 'Un premier repère pour sentir le territoire.'] : null,
    country.foods?.[0] ? ['Goûter', country.foods[0], 'Une entrée simple dans les goûts et les gestes du quotidien.'] : null,
    country.experiences?.[0] ? ['Vivre', country.experiences[0], 'Une expérience qui donne du relief à la découverte.'] : null,
  ].filter(Boolean) as [string, string, string][]

  const keyTakeaways = [
    ...(country.keyFacts || []),
    country.capital ? `Capitale : ${country.capital}.` : null,
    country.languages?.length ? `Langues à repérer : ${country.languages.slice(0, 3).join(', ')}.` : null,
    country.subregion || country.region ? `Ancrage : ${country.subregion || country.region}.` : null,
    country.arts?.[0] ? `Savoir-faire marquant : ${country.arts[0]}.` : null,
  ].filter(Boolean).slice(0, 6) as string[]

  const oneSentenceSummary = country.oneSentenceSummary || `${country.nameFr} se découvre par ${uniq([
    country.placesToDiscover?.[0],
    country.foods?.[0],
    country.arts?.[0],
    country.languages?.[0],
  ]).join(', ') || 'ses lieux, ses voix et ses savoir-faire'}.`

  const peopleItems = uniq([
    ...(country.peoples || []),
    ...(country.demonym ? splitReadable(country.demonym) : []),
    ...(country.languages || []).slice(0, 4).map((language) => `Langue repère : ${language}`),
  ]).slice(0, 8)

  const historyItems = uniq([
    ...(country.historyHighlights || []),
    country.independenceDate ? `Indépendance : ${country.independenceDate}.` : undefined,
    country.governmentType ? `Institutions : ${country.governmentType}.` : undefined,
    ...(country.historicalSites || []).slice(0, 3).map((site) => site.name ? `${site.name} : ${site.description || 'lieu de mémoire à documenter.'}` : undefined),
  ]).slice(0, 8)

  const artsAndSoundsItems = uniq([
    ...(country.musicAndArts || []),
    ...(country.arts || []),
    ...(country.festivals || []).slice(0, 3).map((festival) => `Moment culturel : ${festival}`),
  ]).slice(0, 10)

  const foodCultureItems = uniq([
    ...(country.foodCulture || []),
    ...(country.foods || []).map((food) => `À goûter : ${food}`),
    ...(country.etiquette ? [`À table et en société : ${country.etiquette}`] : []),
  ]).slice(0, 10)

  const oralKnowledgeItems = uniq([
    ...(country.oralTraditions || []),
    ...(country.traditions || []),
    ...(country.rites || []).slice(0, 4).map((rite) => `Rite ou cérémonie : ${rite}`),
  ]).slice(0, 10)

  const preservationItems = uniq([
    ...(country.knowledgeToPreserve || []),
    ...(country.customs || []).slice(0, 3).map((custom) => `Documenter les usages : ${custom}`),
    ...(country.arts || []).slice(0, 3).map((art) => `Préserver le savoir-faire : ${art}`),
    country.languages?.length ? `Collecter les mots, expressions et proverbes en ${country.languages.slice(0, 3).join(', ')}.` : undefined,
  ]).slice(0, 8)

  const relatedThemes = uniq([
    ...(country.relatedThemes || []),
    country.region,
    country.subregion,
    ...(country.arts || []).slice(0, 3),
    ...(country.foods || []).slice(0, 2),
  ]).slice(0, 10)

  const sourceQualityLabels = {
    draft: 'À compléter',
    community: 'Communauté',
    verified: 'Vérifié',
    official: 'Officiel',
  }

  const countryQuery = encodeURIComponent(country.nameFr)
  const countryIdQuery = encodeURIComponent(country.id)
  const isDeepReading = readingMode === 'deep'
  const relatedContentGroups = relatedContentConfig
    .map((config) => ({
      ...config,
      items: relatedContent?.[config.key]?.slice(0, 3) || [],
    }))
    .filter((group) => group.items.length > 0)
  const relatedContentCount = relatedContentGroups.reduce((total, group) => total + group.items.length, 0)

  const recommendedDiscoveryPaths = country.recommendedPaths?.length ? country.recommendedPaths : [
    {
      title: 'Découverte rapide',
      description: `Partir de ${country.capital}, retenir les repères essentiels, puis ouvrir la carte.`,
      items: [country.capital, country.placesToDiscover?.[0], country.foods?.[0]].filter(Boolean) as string[],
    },
    {
      title: 'Mémoire et transmission',
      description: 'Relier les dates, les lieux de mémoire, les figures et les récits.',
      items: [historyItems[0], country.notableFigures?.[0], oralKnowledgeItems[0]].filter(Boolean) as string[],
    },
    {
      title: 'Culture vivante',
      description: 'Entrer par les sons, les gestes, la cuisine et les savoir-faire.',
      items: [artsAndSoundsItems[0], foodCultureItems[0], preservationItems[0]].filter(Boolean) as string[],
    },
  ]

  const discoveryMoments = [
    {
      label: 'Regarder',
      title: country.placesToDiscover?.[0] || country.capital,
      text: country.placesToDiscover?.[1]
        ? `Commencer par ${country.placesToDiscover[0]}, puis élargir vers ${country.placesToDiscover[1]}.`
        : `Commencer par ${country.capital} pour poser les premiers repères.`,
    },
    {
      label: 'Écouter',
      title: artsAndSoundsItems[0] || country.languages?.[0] || 'Les voix du pays',
      text: country.languages?.length
        ? `Repérer les langues et les sons du quotidien : ${country.languages.slice(0, 3).join(', ')}.`
        : 'Prêter attention aux musiques, aux récits et aux paroles transmises.',
    },
    {
      label: 'Goûter',
      title: country.foods?.[0] || foodCultureItems[0] || 'La table quotidienne',
      text: country.foods?.length
        ? `Entrer par les goûts : ${country.foods.slice(0, 3).join(', ')}.`
        : 'Observer les marchés, les repas et les gestes autour de la table.',
    },
    {
      label: 'Transmettre',
      title: preservationItems[0] || 'Un savoir à garder',
      text: 'Ajouter une source, corriger un détail, proposer un proverbe ou documenter une mémoire familiale.',
    },
  ].filter((item) => item.title)

  const fieldQuestions = [
    country.languages?.length ? `Comment salue-t-on dans une langue locale comme ${country.languages[0]} ?` : null,
    country.foods?.[0] ? `Dans quel moment partage-t-on ${country.foods[0]} ?` : null,
    country.arts?.[0] ? `Qui transmet aujourd'hui le savoir-faire ${country.arts[0]} ?` : null,
    country.historicalSites?.[0]?.name ? `Quelle mémoire locale entoure ${country.historicalSites[0].name} ?` : null,
    country.festivals?.[0] ? `Que faut-il comprendre avant d'assister à ${country.festivals[0]} ?` : null,
  ].filter(Boolean) as string[]

  const contributionPrompts = [
    { to: `/dashboard`, label: 'Proposer un récit', text: 'Raconter une mémoire familiale, un lieu ou une pratique.' },
    { to: `/dashboard`, label: 'Ajouter un proverbe', text: 'Partager une parole, sa traduction et son contexte.' },
    { to: `/communities?search=${countryQuery}`, label: 'Demander à la communauté', text: 'Vérifier une information avec des personnes liées au pays.' },
    { to: `/search?q=${countryQuery}&type=collections`, label: 'Créer un parcours', text: 'Relier pays, figures, dates, objets et récits.' },
  ]

  const contentSignals = [
    { label: 'Repères', count: identityFacts.length, href: '#repères' },
    { label: 'Carte', count: (country.mapPlaces?.length || 0) + (country.historicalSites?.length || 0), href: '#carte' },
    { label: 'Culture', count: cultureLists.reduce((total, [, items]) => total + items.length, 0), href: '#culture' },
    { label: 'Mémoire', count: peopleItems.length + historyItems.length + preservationItems.length, href: '#memoire' },
    { label: 'Liens', count: relatedContentCount, href: '#echos' },
    { label: 'Médias', count: sortedImages.length + sortedPDFs.length + sortedVideos.length + sortedDocuments.length, href: '#medias' },
    { label: 'Sources', count: country.sourceNotes?.length || 0, href: '#savoirs' },
  ]
  const completedSignals = contentSignals.filter((signal) => signal.count > 0).length
  const editorialScore = Math.round((completedSignals / contentSignals.length) * 100)
  const discoveryDepth = editorialScore >= 75 ? 'Riche' : editorialScore >= 45 ? 'En construction' : 'À enrichir'
  const quickActions = [
    { to: '#carte', label: 'Explorer la carte' },
    { to: '#memoire', label: 'Comprendre la mémoire' },
    { to: `/search?q=${countryQuery}&type=proverbs`, label: 'Lire les proverbes' },
    { to: `/communities?search=${countryQuery}`, label: 'Échanger' },
  ]

  const readingJourney = [
    {
      step: '01',
      href: '#commencer',
      label: 'Sentir le pays',
      text: startHereItems[0]?.[1] || oneSentenceSummary,
      meta: '2 min',
    },
    {
      step: '02',
      href: '#carte',
      label: 'Situer les repères',
      text: country.capital ? `Partir de ${country.capital}, puis suivre les villes et lieux liés.` : 'Lire le territoire par ses villes et ses lieux.',
      meta: `${contentSignals[1].count || 'Plusieurs'} repères`,
    },
    {
      step: '03',
      href: '#memoire',
      label: 'Comprendre la mémoire',
      text: historyItems[0] || preservationItems[0] || 'Relier langues, récits, figures et savoirs à préserver.',
      meta: `${peopleItems.length + historyItems.length + preservationItems.length} pistes`,
    },
    {
      step: '04',
      href: '#savoirs',
      label: 'Relier MonBaobab',
      text: 'Continuer vers les proverbes, récits, collections, quiz et communautés.',
      meta: 'Aller plus loin',
    },
  ]

  const discoveryDay = [
    {
      time: 'Matin',
      title: country.capital || country.placesToDiscover?.[0] || 'Premier repère',
      text: country.capital
        ? `Commencer par ${country.capital}, observer les rythmes urbains, les langues entendues et les premiers repères administratifs.`
        : 'Commencer par un lieu central, prendre le temps d’observer les déplacements, les langues et les premières habitudes.',
    },
    {
      time: 'Midi',
      title: country.foods?.[0] || 'La table comme porte d’entrée',
      text: country.foods?.length
        ? `Approcher le pays par la cuisine : ${country.foods.slice(0, 3).join(', ')}. Les plats disent souvent les saisons, les échanges et les gestes quotidiens.`
        : 'Lire le quotidien par les marchés, les repas, les ingrédients et la manière de partager.',
    },
    {
      time: 'Après-midi',
      title: country.placesToDiscover?.[1] || historyItems[0] || 'Mémoire et territoire',
      text: historyItems[0]
        ? `Relier le territoire à la mémoire : ${historyItems[0]}`
        : 'Visiter un lieu, interroger sa mémoire, puis le relier aux récits et aux figures du pays.',
    },
    {
      time: 'Soir',
      title: artsAndSoundsItems[0] || oralKnowledgeItems[0] || 'Voix, sons et transmission',
      text: artsAndSoundsItems[0]
        ? `Terminer par la culture vivante : ${artsAndSoundsItems[0]}. Les sons et les gestes donnent souvent une autre lecture du pays.`
        : 'Finir par une parole, une musique, un proverbe ou une histoire transmise.',
    },
  ]

  const insightPillars = [
    {
      label: 'Territoire',
      title: country.subregion || country.region || 'Repères géographiques',
      text: country.placesToDiscover?.length
        ? `À lire par ${country.placesToDiscover.slice(0, 3).join(', ')}.`
        : `À situer depuis ${country.capital || 'ses villes principales'}.`,
    },
    {
      label: 'Mémoire',
      title: historyItems[0] || country.independenceDate || 'Histoire à relier',
      text: historyItems[1] || 'Relier les dates, lieux, figures et récits avant de conclure trop vite.',
    },
    {
      label: 'Langues',
      title: country.languages?.slice(0, 3).join(', ') || 'Voix du quotidien',
      text: country.languageNotes || 'Les langues donnent accès aux salutations, proverbes, récits et manières de nommer le monde.',
    },
    {
      label: 'Gestes',
      title: artsAndSoundsItems[0] || country.arts?.[0] || 'Culture vivante',
      text: artsAndSoundsItems[1] || 'Observer les sons, les matières, les danses, les textiles et les gestes transmis.',
    },
    {
      label: 'Transmission',
      title: preservationItems[0] || 'Savoirs à préserver',
      text: preservationItems[1] || 'Documenter ce qui risque de disparaître : mots, pratiques, archives familiales, métiers et récits.',
    },
  ]

  const knowledgeWorkshop = [
    {
      label: 'Mots à retenir',
      title: country.languages?.length ? country.languages.slice(0, 3).join(', ') : 'Langues et expressions',
      items: uniq([
        ...(country.languages || []).slice(0, 3).map((language) => `Chercher une salutation en ${language}`),
        ...(country.relatedThemes || []).slice(0, 2).map((theme) => `Relier au thème : ${theme}`),
        'Noter un proverbe avec son contexte',
      ]).slice(0, 4),
    },
    {
      label: 'Gestes à observer',
      title: country.arts?.[0] || country.customs?.[0] || 'Pratiques vivantes',
      items: uniq([
        ...(country.arts || []).slice(0, 2),
        ...(country.customs || []).slice(0, 2),
        ...(country.rites || []).slice(0, 1),
      ]).slice(0, 4),
    },
    {
      label: 'Sources à vérifier',
      title: sourceQualityLabels[country.sourceQuality || 'draft'],
      items: uniq([
        ...(country.sourceNotes || []).slice(0, 3),
        'Comparer les données sensibles avec une source officielle récente',
      ]).slice(0, 4),
    },
    {
      label: 'À transmettre',
      title: preservationItems[0] || oralKnowledgeItems[0] || 'Mémoire locale',
      items: uniq([
        ...(preservationItems || []).slice(0, 2),
        ...(oralKnowledgeItems || []).slice(0, 2),
        'Ajouter une correction ou un récit depuis la communauté',
      ]).slice(0, 4),
    },
  ].filter((block) => block.items.length > 0)

  const ecosystemLinks = [
    { to: `/search?q=${countryQuery}&type=proverbs`, label: 'Proverbes', text: 'Paroles, images et sagesses rattachées au pays.' },
    { to: `/search?q=${countryQuery}&type=figures`, label: 'Personnages', text: 'Trajectoires, résistances, artistes et bâtisseurs.' },
    { to: `/search?q=${countryQuery}&type=events`, label: 'Chronologie', text: 'Dates, ruptures et continuités à replacer.' },
    { to: `/search?q=${countryQuery}&type=stories`, label: 'Récits', text: 'Histoires courtes, mémoire familiale et oralité.' },
    { to: `/search?q=${countryQuery}&type=collections`, label: 'Collections', text: 'Parcours thématiques pour approfondir sans se perdre.' },
    { to: `/search?q=${countryQuery}&type=products`, label: 'Boutique', text: 'Objets, matières et savoir-faire reliés au territoire.' },
    { to: `/search?q=${countryQuery}&type=communities`, label: 'Communauté', text: 'Échanger, compléter, corriger et transmettre ensemble.' },
    { to: `/search?q=${countryQuery}&type=quizzes`, label: 'Quiz', text: 'Tester ce que l’on retient après la découverte.' },
  ]

  const guidedPaths = [
    {
      title: 'Découvrir le pays',
      text: 'Commencer par les repères, puis ouvrir les récits et la chronologie.',
      links: [
        { to: '#repères', label: 'Repères' },
        { to: `/search?q=${countryQuery}&type=stories`, label: 'Récits' },
        { to: `/search?q=${countryQuery}&type=events`, label: 'Chronologie' },
      ],
    },
    {
      title: 'Préserver un savoir',
      text: 'Ajouter une source, proposer un proverbe ou rejoindre l’espace communautaire.',
      links: [
        { to: `/dashboard`, label: 'Proposer' },
        { to: `/communities?search=${countryQuery}`, label: 'Communauté' },
        { to: `/search?q=${countryQuery}&type=proverbs`, label: 'Proverbes' },
      ],
    },
    {
      title: 'Relier culture et économie',
      text: 'Passer des pratiques culturelles aux objets, artisans et matières.',
      links: [
        { to: '#culture', label: 'Culture' },
        { to: `/shop?country=${countryIdQuery}`, label: 'Boutique' },
        { to: `/search?q=${countryQuery}&type=collections`, label: 'Collections' },
      ],
    },
  ]

  return (
    <Layout>
      <div className="country-detail-page">
        <section className="country-detail-hero">
          <Link to="/map" className="back-button">Retour à la carte</Link>
          <div className="country-hero-content">
            <div className="country-hero-copy">
              <span className="country-kicker">Fiche pays · mise à jour {country.lastUpdated || '2026'}</span>
              <h1>{country.nameFr}</h1>
              <p className="country-subtitle">{discoveryIntro}</p>
              <div className="country-basic-info">
                {identityFacts.slice(0, 5).map(([label, value]) => (
                  <div className="info-badge" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="country-flag-large">
              <img
                src={getFlagUrl(country.id, 'w320')}
                alt={`Drapeau de ${country.nameFr}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.style.backgroundColor = country.color || '#8E44AD'
                }}
              />
            </div>
          </div>
        </section>

        <nav className="country-discovery-nav" aria-label="Navigation de la fiche pays">
          <a href="#repères">Vue</a>
          <a href="#carte">Carte</a>
          <a href="#commencer">Départ</a>
          <a href="#culture">Culture</a>
          <a href="#memoire">Mémoire</a>
          <a href="#pratique">Pratique</a>
          <a href="#savoirs">Savoirs</a>
        </nav>

        <section className="country-section country-compass-section" aria-label={`Boussole de découverte de ${country.nameFr}`}>
          <Card className="country-compass-card">
            <div className="country-compass-score">
              <span className="section-kicker">Boussole MonBaobab</span>
              <strong>{editorialScore}%</strong>
              <p>{discoveryDepth}</p>
            </div>
            <div className="country-compass-content">
              <h2>Choisir quoi explorer maintenant</h2>
              <div className="country-reading-mode" role="group" aria-label="Mode de lecture">
                <button
                  type="button"
                  className={readingMode === 'essential' ? 'active' : ''}
                  onClick={() => setReadingMode('essential')}
                >
                  Essentiel
                </button>
                <button
                  type="button"
                  className={readingMode === 'deep' ? 'active' : ''}
                  onClick={() => setReadingMode('deep')}
                >
                  Exploration complète
                </button>
              </div>
              <div className="country-signal-grid">
                {contentSignals.map((signal) => (
                  <a href={signal.href} className={signal.count > 0 ? 'ready' : ''} key={signal.label}>
                    <span>{signal.label}</span>
                    <strong>{signal.count}</strong>
                  </a>
                ))}
              </div>
            </div>
            <div className="country-quick-actions">
              {quickActions.map((action) => (
                <Link to={action.to} key={action.label}>{action.label}</Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="country-section country-reading-journey" aria-label={`Parcours de lecture de ${country.nameFr}`}>
          <div className="section-header-detailed">
            <span className="section-kicker">Fil de visite</span>
            <h2>Un parcours simple pour ne pas se perdre dans la richesse de la fiche</h2>
          </div>
          <div className="country-journey-rail">
            {readingJourney.map((item) => (
              <a href={item.href} className="country-journey-step" key={item.step}>
                <strong>{item.step}</strong>
                <div>
                  <span>{item.meta}</span>
                  <h3>{item.label}</h3>
                  <p>{item.text}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {startHereItems.length > 0 && (
          <section className="country-section country-start-section" id="commencer">
            <div className="section-header-detailed">
              <span className="section-kicker">Commencer par</span>
              <h2>Trois portes d'entrée pour découvrir {country.nameFr}</h2>
            </div>
            <div className="country-start-grid">
              {startHereItems.map(([label, title, text]) => (
                <Card className="country-start-card" key={`${label}-${title}`}>
                  <span>{label}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="country-section country-editorial-section">
          <Card className="country-one-line-card">
            <span className="section-kicker">Ce pays en une phrase</span>
            <p>{oneSentenceSummary}</p>
            {relatedThemes.length > 0 && (
              <div className="country-theme-strip">
                {relatedThemes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
            )}
          </Card>
          {keyTakeaways.length > 0 && (
            <Card className="country-retain-card">
              <span className="section-kicker">À retenir avant d'explorer</span>
              <div className="retain-grid">
                {keyTakeaways.map((item, index) => (
                  <div key={`${item}-${index}`}>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        {isDeepReading && (
          <>
            <section className="country-section country-field-guide-section">
              <div className="section-header-detailed">
                <span className="section-kicker">Carnet de découverte</span>
                <h2>Entrer dans {country.nameFr} par les sens, les gestes et les questions</h2>
              </div>
              <div className="country-field-guide">
                <Card className="country-field-main">
                  <span>{country.nameFr}</span>
                  <h3>Explorer sans rester spectateur</h3>
                  <p>
                    Une bonne fiche pays ne donne pas seulement des réponses. Elle aide à regarder mieux,
                    poser de bonnes questions et relier les savoirs aux personnes qui les portent.
                  </p>
                  <div>
                    <Link to={`/search?q=${countryQuery}&type=stories`}>Lire les récits</Link>
                    <Link to={`/search?q=${countryQuery}&type=proverbs`}>Voir les proverbes</Link>
                  </div>
                </Card>
                <div className="country-moment-grid">
                  {discoveryMoments.map((moment) => (
                    <Card className="country-moment-card" key={moment.label}>
                      <span>{moment.label}</span>
                      <h3>{moment.title}</h3>
                      <p>{moment.text}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            <section className="country-section country-day-section">
              <div className="section-header-detailed">
                <span className="section-kicker">Une journée imaginaire</span>
                <h2>Suivre {country.nameFr} du matin au soir, comme un carnet de terrain</h2>
              </div>
              <div className="country-day-board">
                <Card className="country-day-intro">
                  <span>{country.nameFr}</span>
                  <h3>Une lecture par moments</h3>
                  <p>
                    Ce parcours ne remplace pas le voyage. Il aide à organiser la découverte :
                    regarder, goûter, situer, écouter, puis transmettre ce qui mérite d’être gardé.
                  </p>
                </Card>
                <div className="country-day-timeline">
                  {discoveryDay.map((moment) => (
                    <article key={moment.time}>
                      <strong>{moment.time}</strong>
                      <h3>{moment.title}</h3>
                      <p>{moment.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="country-section country-insight-section">
              <div className="section-header-detailed">
                <span className="section-kicker">Carte mentale</span>
                <h2>Cinq axes pour retenir {country.nameFr} sans réduire sa complexité</h2>
              </div>
              <div className="country-insight-grid">
                {insightPillars.map((pillar, index) => (
                  <Card className="country-insight-card" key={pillar.label}>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <span>{pillar.label}</span>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.text}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="country-section country-workshop-section">
              <div className="section-header-detailed">
                <span className="section-kicker">Atelier du savoir</span>
                <h2>Observer, vérifier, transmettre : les détails qui donnent de la profondeur</h2>
              </div>
              <div className="country-workshop-grid">
                {knowledgeWorkshop.map((block) => (
                  <Card className="country-workshop-card" key={block.label}>
                    <span>{block.label}</span>
                    <h3>{block.title}</h3>
                    <ul>
                      {block.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>

            <CountryImmersive countryId={country.id} country={country} />
          </>
        )}

        {(relatedLoading || relatedContentGroups.length > 0) && (
          <section className="country-section country-related-section" id="echos">
            <div className="section-header-detailed">
              <span className="section-kicker">Échos MonBaobab</span>
              <h2>Les contenus déjà reliés à {country.nameFr}</h2>
            </div>
            {relatedLoading ? (
              <div className="country-related-loading" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <div className="country-related-grid">
                {relatedContentGroups.map((group) => (
                  <Card className="country-related-card" key={group.key}>
                    <div className="country-related-card-header">
                      <span>{group.label}</span>
                      <Link to={`/search?q=${countryQuery}&type=${group.key}`}>{group.emptyAction}</Link>
                    </div>
                    <h3>{group.title}</h3>
                    <div className="country-related-items">
                      {group.items.map((item) => (
                        <Link
                          to={getRelatedItemPath(group.key, item, countryQuery)}
                          key={item._id || item.id || getRelatedItemTitle(item)}
                        >
                          <strong>{getRelatedItemTitle(item)}</strong>
                          {getRelatedItemText(item) && <span>{getRelatedItemText(item)}</span>}
                        </Link>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="country-section country-map-section" id="carte">
          <div className="section-header-detailed">
            <span className="section-kicker">Territoire</span>
            <h2>Explorer {country.nameFr} par ses villes et repères</h2>
          </div>
          <CountryInteractiveMap country={country} />
        </section>

        <section className="country-section country-overview-grid" id="repères">
          <Card className="country-portrait-card">
            <span className="section-kicker">Portrait</span>
            <h2>Comprendre {country.nameFr} en quelques repères</h2>
            {country.description && <p>{country.description}</p>}
            {country.culture && <p>{country.culture}</p>}
          </Card>
          <Card className="country-facts-card">
            <span className="section-kicker">Identité</span>
            <div className="facts-list">
              {identityFacts.map(([label, value]) => (
                <div className="fact-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </Card>
          {keyTakeaways.length > 0 && (
            <Card className="country-takeaways-card">
              <span className="section-kicker">Ce qu'on retient</span>
              <ul>
                {keyTakeaways.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </Card>
          )}
        </section>

        {contextBlocks.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <span className="section-kicker">Contexte 2026</span>
              <h2>Ce qu'il faut situer</h2>
            </div>
            <div className="country-context-grid">
              {contextBlocks.map(([label, value]) => (
                <Card className="context-card" key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {discoveryLists.length > 0 && (
          <section className="country-section" id="decouvrir">
            <div className="section-header-detailed">
              <span className="section-kicker">Découverte</span>
              <h2>Entrer dans le pays par ses lieux, ses gestes et ses rythmes</h2>
            </div>
            <div className="discovery-list-grid">
              {discoveryLists.map(([title, items]) => (
                <Card className="discovery-list-card" key={title}>
                  <h3>{title}</h3>
                  <ul>
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        )}

        {cultureLists.length > 0 && (
          <section className="country-section" id="culture">
            <div className="section-header-detailed">
              <span className="section-kicker">Culture vivante</span>
              <h2>Traditions, saveurs et savoir-faire</h2>
            </div>
            <div className="culture-mosaic">
              {cultureLists.map(([title, items]) => (
                <Card className="culture-mosaic-card" key={title}>
                  <h3>{title}</h3>
                  <div className="culture-chip-list">
                    {items.map((item, index) => <span key={index}>{item}</span>)}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="country-section country-memory-section" id="memoire">
          <div className="section-header-detailed">
            <span className="section-kicker">Mémoire et identités</span>
            <h2>Peuples, langues, histoire et savoirs à transmettre</h2>
          </div>
          <div className="country-memory-grid">
            {(peopleItems.length > 0 || country.languageNotes) && (
              <Card className="country-memory-card highlight">
                <span>Peuples et langues</span>
                <h3>Les voix du territoire</h3>
                {country.languageNotes && <p>{country.languageNotes}</p>}
                <ul>
                  {peopleItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Card>
            )}
            {historyItems.length > 0 && (
              <Card className="country-memory-card">
                <span>Mémoire historique</span>
                <h3>Repères pour comprendre</h3>
                <ul>
                  {historyItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Card>
            )}
            {artsAndSoundsItems.length > 0 && (
              <Card className="country-memory-card">
                <span>Arts, sons et gestes</span>
                <h3>Culture vivante</h3>
                <div className="country-memory-tags">
                  {artsAndSoundsItems.map((item) => <span key={item}>{item}</span>)}
                </div>
              </Card>
            )}
            {foodCultureItems.length > 0 && (
              <Card className="country-memory-card">
                <span>Cuisine et quotidien</span>
                <h3>Goûts, marchés, hospitalité</h3>
                <ul>
                  {foodCultureItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Card>
            )}
            {oralKnowledgeItems.length > 0 && (
              <Card className="country-memory-card">
                <span>Oralité</span>
                <h3>Paroles, rites, récits</h3>
                <div className="country-memory-tags">
                  {oralKnowledgeItems.map((item) => <span key={item}>{item}</span>)}
                </div>
              </Card>
            )}
            {preservationItems.length > 0 && (
              <Card className="country-memory-card preserve">
                <span>Savoirs à préserver</span>
                <h3>Ce que MonBaobab doit aider à garder</h3>
                <ul>
                  {preservationItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Card>
            )}
          </div>
        </section>

        {isDeepReading && (
          <section className="country-section country-recommended-section">
          <div className="section-header-detailed">
            <span className="section-kicker">Parcours conseillé</span>
            <h2>Choisir une porte d'entrée et avancer naturellement</h2>
          </div>
          <div className="country-recommended-grid">
            {recommendedDiscoveryPaths.map((path, index) => (
              <Card className="country-recommended-card" key={`${path.title}-${index}`}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                {path.items && path.items.length > 0 && (
                  <div>
                    {path.items.map((item) => <span key={item}>{item}</span>)}
                  </div>
                )}
              </Card>
            ))}
          </div>
          </section>
        )}

        {isDeepReading && (fieldQuestions.length > 0 || contributionPrompts.length > 0) && (
          <section className="country-section country-contribution-section">
            <div className="country-question-panel">
              <span className="section-kicker">Questions à ouvrir</span>
              <h2>Ce que la communauté peut enrichir</h2>
              <div className="country-question-list">
                {fieldQuestions.map((question) => (
                  <p key={question}>{question}</p>
                ))}
              </div>
            </div>
            <div className="country-contribution-grid">
              {contributionPrompts.map((prompt) => (
                <Link to={prompt.to} className="country-contribution-card" key={prompt.label}>
                  <strong>{prompt.label}</strong>
                  <span>{prompt.text}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(travelBlocks.length > 0 || practicalFacts.length > 0) && (
          <section className="country-section country-practical-section" id="pratique">
            <div className="section-header-detailed">
              <span className="section-kicker">Avant de partir</span>
              <h2>Repères utiles, à vérifier avant tout déplacement</h2>
            </div>
            <div className="country-practical-grid">
              <Card className="country-facts-card">
                <span className="section-kicker">Pratique</span>
                <div className="facts-list">
                  {practicalFacts.map(([label, value]) => (
                    <div className="fact-row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="travel-note-grid">
                {travelBlocks.map(([label, value]) => (
                  <Card className="travel-note-card" key={label}>
                    <h3>{label}</h3>
                    <p>{value}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="country-section" id="savoirs">
          <div className="section-header-detailed">
            <span className="section-kicker">Continuer l'exploration</span>
            <h2>Tout MonBaobab relié à {country.nameFr}</h2>
          </div>
          <div className="country-ecosystem-grid">
            {ecosystemLinks.map((link) => (
              <Link to={link.to} className="country-crosslink-card" key={link.to}>
                <strong>{link.label}</strong>
                <span>{link.text}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="country-section country-journey-section">
          <div className="section-header-detailed">
            <span className="section-kicker">Parcours guidés</span>
            <h2>Choisir une intention et continuer sans friction</h2>
          </div>
          <div className="country-journey-grid">
            {guidedPaths.map((path) => (
              <Card className="country-journey-card" key={path.title}>
                <h3>{path.title}</h3>
                <p>{path.text}</p>
                <div className="country-journey-actions">
                  {path.links.map((link) => (
                    <Link to={link.to} key={link.to}>{link.label}</Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {sortedCustomSections.map((section, index) => (
          <section key={index} className="country-section">
            <div className="section-header-detailed">
              <span className="section-kicker">Carnet MonBaobab</span>
              <h2>{section.title}</h2>
            </div>
            <Card className="culture-card-detailed">
              {section.type === 'list' ? (
                <ul className="custom-section-list">
                  {section.content.split('\n').filter(line => line.trim()).map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              ) : section.type === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              ) : (
                <p style={{ whiteSpace: 'pre-line' }}>{section.content}</p>
              )}
            </Card>
          </section>
        ))}

        {(sortedImages.length > 0 || sortedPDFs.length > 0 || sortedVideos.length > 0 || sortedDocuments.length > 0) && (
          <section className="country-section" id="medias">
            <div className="section-header-detailed">
              <span className="section-kicker">Médias</span>
              <h2>Voir, écouter, approfondir</h2>
            </div>

            {sortedImages.length > 0 && (
              <div className="images-gallery">
                {sortedImages.map((image, index) => (
                  <Card key={index} className="image-gallery-item" onClick={() => setSelectedImage(image.url)}>
                    <div className="gallery-image-wrapper">
                      <img src={image.url} alt={image.caption || `Image ${index + 1}`} />
                      {image.caption && <div className="gallery-image-caption">{image.caption}</div>}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="media-grid">
              {sortedPDFs.map((pdf, index) => (
                <Card key={`pdf-${index}`} className="media-card" onClick={() => setSelectedPDF(pdf)}>
                  <span className="media-type">PDF</span>
                  <div className="media-card-content">
                    <h3>{pdf.title}</h3>
                    {pdf.description && <p>{pdf.description}</p>}
                  </div>
                  <Button variant="outline" size="small">Lire</Button>
                </Card>
              ))}
              {sortedVideos.map((video, index) => (
                <Card key={`video-${index}`} className="media-card video-card" onClick={() => setSelectedVideo(video)}>
                  {video.thumbnail && (
                    <div className="media-card-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-play-overlay">Lecture</div>
                    </div>
                  )}
                  <span className="media-type">Vidéo</span>
                  <div className="media-card-content">
                    <h3>{video.title}</h3>
                    {video.description && <p>{video.description}</p>}
                  </div>
                  <Button variant="outline" size="small">Regarder</Button>
                </Card>
              ))}
              {sortedDocuments.map((document, index) => (
                <Card key={`document-${index}`} className="media-card" onClick={() => setSelectedDocument(document)}>
                  <span className="media-type">{document.type?.toUpperCase() || 'DOC'}</span>
                  <div className="media-card-content">
                    <h3>{document.title}</h3>
                    {document.description && <p>{document.description}</p>}
                  </div>
                  <Button variant="outline" size="small">Ouvrir</Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {country.sourceNotes && country.sourceNotes.length > 0 && (
          <section className="country-section">
            <Card className="country-sources-card">
              <span className="section-kicker">Sources et suivi</span>
              <h2>Données à maintenir</h2>
              <p className="country-source-quality">Niveau éditorial : {sourceQualityLabels[country.sourceQuality || 'draft']}</p>
              <ul>
                {country.sourceNotes.map((note, index) => <li key={index}>{note}</li>)}
              </ul>
            </Card>
          </section>
        )}

        <div className="country-detail-footer">
          <Link to="/map">
            <Button variant="outline" size="large">Retour à la carte</Button>
          </Link>
        </div>
      </div>

      {/* Modal pour afficher l'image en grand */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              Fermer
            </button>
            <img src={selectedImage} alt="Vue agrandie" />
          </div>
        </div>
      )}

      {/* Modal PDF */}
      {selectedPDF && (
        <div className="media-modal" onClick={() => setSelectedPDF(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedPDF.url ? (
              <PDFViewer
                url={selectedPDF.url}
                title={selectedPDF.title || 'Document PDF'}
                description={selectedPDF.description}
                onClose={() => setSelectedPDF(null)}
              />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text)' }}>
                <h3>URL du PDF manquante</h3>
                <p>Ce document PDF n'a pas d'URL valide.</p>
                <Button onClick={() => setSelectedPDF(null)} style={{ marginTop: '1rem' }}>
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Vidéo */}
      {selectedVideo && (
        <div className="media-modal" onClick={() => setSelectedVideo(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <VideoViewer
              url={selectedVideo.url}
              title={selectedVideo.title}
              description={selectedVideo.description}
              type={selectedVideo.type}
              thumbnail={selectedVideo.thumbnail}
              onClose={() => setSelectedVideo(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Document */}
      {selectedDocument && (
        <div className="media-modal" onClick={() => setSelectedDocument(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <DocumentViewer
              url={selectedDocument.url}
              title={selectedDocument.title}
              description={selectedDocument.description}
              type={selectedDocument.type || 'other'}
              onClose={() => setSelectedDocument(null)}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}
