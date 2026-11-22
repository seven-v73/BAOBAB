import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/Input/Input'
import { FileUpload } from '../../components/FileUpload/FileUpload'
import { MediaUpload } from '../../components/Community/MediaUpload'
import { TypeChips } from '../../components/UX/TypeChips'
import { countryService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { allAfricanCountries } from '../../data/allAfricanCountries'
import { REGION_COLORS, REGION_LABELS, REGION_ORDER, regionOfCode, type Region } from '../../utils/afrique'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Database,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import './AdminCountries.css'

// Pays : la liste des fiches pays (drapeau, capitale, région, complétude) et leur édition dans un
// panneau à onglets. Les rubriques reprennent tous les champs de la fiche publique /country/<code>.

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

interface RecommendedPath {
  title: string
  description: string
  items?: string[]
}

interface Country {
  _id?: string
  id: string
  name: string
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
  isActive?: boolean
}

const EMPTY_FORM = {
  id: '',
  name: '',
  nameFr: '',
  capital: '',
  population: '',
  area: '',
  languages: '',
  currency: '',
  description: '',
  culture: '',
  oneSentenceSummary: '',
  keyFacts: '',
  peoples: '',
  languageNotes: '',
  historyHighlights: '',
  notableFigures: '',
  musicAndArts: '',
  foodCulture: '',
  oralTraditions: '',
  knowledgeToPreserve: '',
  recommendedPaths: '',
  relatedThemes: '',
  sourceQuality: 'draft',
  discoveryIntro: '',
  lastUpdated: '2026',
  officialName: '',
  region: '',
  subregion: '',
  demonym: '',
  timeZone: '',
  callingCode: '',
  internetTld: '',
  drivingSide: '',
  independenceDate: '',
  governmentType: '',
  economicOverview: '',
  climate: '',
  bestTimeToVisit: '',
  safetyNote: '',
  etiquette: '',
  transport: '',
  connectivity: '',
  visaNote: '',
  healthAdvice: '',
  emergencyNumbers: '',
  placesToDiscover: '',
  experiences: '',
  practicalTips: '',
  sourceNotes: '',
  color: '#8E44AD',
  rites: '',
  customs: '',
  foods: '',
  traditions: '',
  festivals: '',
  arts: '',
}

type FormState = typeof EMPTY_FORM
type FieldKey = keyof FormState

/** Valeurs du formulaire d'après une fiche existante (listes jointes par « ; », langues par « , »). */
const formFromCountry = (country: Country): FormState => ({
  id: country.id,
  name: country.name || '',
  nameFr: country.nameFr,
  capital: country.capital,
  population: country.population || '',
  area: country.area || '',
  languages: country.languages?.join(', ') || '',
  currency: country.currency || '',
  description: country.description || '',
  culture: country.culture || '',
  oneSentenceSummary: country.oneSentenceSummary || '',
  keyFacts: country.keyFacts?.join('; ') || '',
  peoples: country.peoples?.join('; ') || '',
  languageNotes: country.languageNotes || '',
  historyHighlights: country.historyHighlights?.join('; ') || '',
  notableFigures: country.notableFigures?.join('; ') || '',
  musicAndArts: country.musicAndArts?.join('; ') || '',
  foodCulture: country.foodCulture?.join('; ') || '',
  oralTraditions: country.oralTraditions?.join('; ') || '',
  knowledgeToPreserve: country.knowledgeToPreserve?.join('; ') || '',
  recommendedPaths: country.recommendedPaths?.map((path) => `${path.title} | ${path.description} | ${(path.items || []).join(', ')}`).join('\n') || '',
  relatedThemes: country.relatedThemes?.join('; ') || '',
  sourceQuality: country.sourceQuality || 'draft',
  discoveryIntro: country.discoveryIntro || '',
  lastUpdated: country.lastUpdated || '2026',
  officialName: country.officialName || '',
  region: country.region || '',
  subregion: country.subregion || '',
  demonym: country.demonym || '',
  timeZone: country.timeZone || '',
  callingCode: country.callingCode || '',
  internetTld: country.internetTld || '',
  drivingSide: country.drivingSide || '',
  independenceDate: country.independenceDate || '',
  governmentType: country.governmentType || '',
  economicOverview: country.economicOverview || '',
  climate: country.climate || '',
  bestTimeToVisit: country.bestTimeToVisit || '',
  safetyNote: country.safetyNote || '',
  etiquette: country.etiquette || '',
  transport: country.transport || '',
  connectivity: country.connectivity || '',
  visaNote: country.visaNote || '',
  healthAdvice: country.healthAdvice || '',
  emergencyNumbers: country.emergencyNumbers || '',
  placesToDiscover: country.placesToDiscover?.join('; ') || '',
  experiences: country.experiences?.join('; ') || '',
  practicalTips: country.practicalTips?.join('; ') || '',
  sourceNotes: country.sourceNotes?.join('; ') || '',
  color: country.color || '#8E44AD',
  rites: country.rites?.join('; ') || '',
  customs: country.customs?.join('; ') || '',
  foods: country.foods?.join('; ') || '',
  traditions: country.traditions?.join('; ') || '',
  festivals: country.festivals?.join('; ') || '',
  arts: country.arts?.join('; ') || '',
})

// ---------- Rubriques du panneau d'édition ----------

const LISTE = 'Séparez les éléments par des point-virgules.'

interface FieldSpec {
  key: FieldKey
  label: string
  /** Zone de texte de n lignes ; sans valeur, champ d'une ligne */
  rows?: number
  placeholder?: string
  required?: boolean
  hint?: string
  /** Zone de texte sur une demi-largeur (deux côte à côte) */
  half?: boolean
}

type TabKey = 'identite' | 'reperes' | 'culture' | 'memoire' | 'decouverte' | 'sections' | 'medias' | 'sources'

interface TabSpec {
  key: TabKey
  label: string
  intro: string
  fields?: FieldSpec[]
}

const ONGLETS: TabSpec[] = [
  {
    key: 'identite',
    label: 'Identité',
    intro: 'Les données de base de la fiche publique. Les champs marqués d’un astérisque sont obligatoires.',
    fields: [
      { key: 'nameFr', label: 'Nom français', required: true, placeholder: 'Maroc' },
      { key: 'id', label: 'Code pays (ISO, deux lettres)', required: true, placeholder: 'MA', hint: 'Non modifiable après création.' },
      { key: 'name', label: 'Nom anglais', placeholder: 'Morocco' },
      { key: 'officialName', label: 'Nom officiel', placeholder: 'République du Sénégal' },
      { key: 'capital', label: 'Capitale', required: true },
      { key: 'demonym', label: 'Gentilé', placeholder: 'Sénégalais, Sénégalaise' },
      { key: 'population', label: 'Population', placeholder: '37M' },
      { key: 'area', label: 'Superficie', placeholder: '447K km²' },
      { key: 'languages', label: 'Langues', placeholder: 'Arabe, Amazigh', hint: 'Séparez les langues par des virgules.' },
      { key: 'currency', label: 'Monnaie', placeholder: 'Dirham' },
      { key: 'region', label: 'Région (texte affiché)', placeholder: 'Afrique de l’Ouest' },
      { key: 'subregion', label: 'Sous-région', placeholder: 'Sahel, Golfe de Guinée...' },
      { key: 'color', label: 'Couleur du pays', hint: 'Accent de la fiche publique.' },
      { key: 'description', label: 'Description', rows: 4, required: true },
    ],
  },
  {
    key: 'reperes',
    label: 'Repères',
    intro: 'Ce qu’il faut savoir en premier : une phrase, quelques faits, les institutions.',
    fields: [
      { key: 'oneSentenceSummary', label: 'Ce pays en une phrase', rows: 2, placeholder: 'Une phrase humaine, précise, qui donne le ton de la fiche.' },
      { key: 'keyFacts', label: 'À retenir avant d’explorer', rows: 3, half: true, hint: LISTE, placeholder: 'Ville clé; Tradition forte; Langue à connaître' },
      { key: 'relatedThemes', label: 'Thèmes reliés', rows: 3, half: true, hint: LISTE, placeholder: 'Textile; Oralité; Royaumes; Ports; Sahel' },
      { key: 'independenceDate', label: 'Date d’indépendance', placeholder: '4 avril 1960' },
      { key: 'governmentType', label: 'Régime / institutions', placeholder: 'République...' },
      { key: 'economicOverview', label: 'Économie en bref', placeholder: 'Services, agriculture, mines...' },
      { key: 'timeZone', label: 'Fuseau horaire', placeholder: 'UTC+0' },
      { key: 'callingCode', label: 'Indicatif', placeholder: '+221' },
      { key: 'internetTld', label: 'Domaine internet', placeholder: '.sn' },
      { key: 'drivingSide', label: 'Conduite', placeholder: 'À droite' },
    ],
  },
  {
    key: 'culture',
    label: 'Culture',
    intro: 'Les personnes, les langues, les gestes et les goûts du quotidien.',
    fields: [
      { key: 'culture', label: 'Culture', rows: 3 },
      { key: 'peoples', label: 'Peuples et identités', rows: 3, half: true, hint: LISTE, placeholder: 'Groupes, communautés, zones culturelles' },
      { key: 'languageNotes', label: 'Notes sur les langues', rows: 3, half: true, placeholder: 'Langues officielles, langues nationales, usages de salutation...' },
      { key: 'rites', label: 'Rites', rows: 2, half: true, hint: LISTE, placeholder: 'Cérémonie du thé; Mariages traditionnels' },
      { key: 'customs', label: 'Coutumes', rows: 2, half: true, hint: LISTE },
      { key: 'traditions', label: 'Traditions', rows: 2, half: true, hint: LISTE },
      { key: 'festivals', label: 'Festivals', rows: 2, half: true, hint: LISTE },
      { key: 'arts', label: 'Arts et artisanat', rows: 2, half: true, hint: LISTE },
      { key: 'musicAndArts', label: 'Arts, sons et gestes', rows: 2, half: true, hint: LISTE, placeholder: 'Musique; danse; textile; instruments; architecture' },
      { key: 'foods', label: 'Spécialités culinaires', rows: 2, half: true, hint: LISTE },
      { key: 'foodCulture', label: 'Cuisine et quotidien', rows: 2, half: true, hint: LISTE, placeholder: 'Plat emblématique; boisson; marché; moment social' },
    ],
  },
  {
    key: 'memoire',
    label: 'Mémoire',
    intro: 'L’histoire, les figures et les savoirs à transmettre.',
    fields: [
      { key: 'historyHighlights', label: 'Mémoire historique', rows: 3, half: true, hint: LISTE, placeholder: 'Royaumes; période coloniale; indépendance; dates récentes' },
      { key: 'notableFigures', label: 'Personnages à relier', rows: 3, half: true, hint: LISTE, placeholder: 'Nom - rôle; Nom - rôle' },
      { key: 'oralTraditions', label: 'Oralité et récits', rows: 3, half: true, hint: LISTE, placeholder: 'Contes; proverbes; récits familiaux; rites de parole' },
      { key: 'knowledgeToPreserve', label: 'Savoirs à préserver', rows: 3, half: true, hint: LISTE, placeholder: 'Métiers; langues; gestes; archives orales; techniques artisanales' },
    ],
  },
  {
    key: 'decouverte',
    label: 'Découverte',
    intro: 'Les lieux, les parcours et les conseils pratiques pour explorer le pays.',
    fields: [
      { key: 'discoveryIntro', label: 'Introduction immersive', rows: 4, placeholder: 'Une entrée courte, sensorielle et concrète pour présenter le pays.' },
      { key: 'placesToDiscover', label: 'Lieux à découvrir', rows: 3, half: true, hint: LISTE },
      { key: 'experiences', label: 'Expériences à vivre', rows: 3, half: true, hint: LISTE },
      {
        key: 'recommendedPaths',
        label: 'Parcours conseillés',
        rows: 4,
        hint: 'Une ligne par parcours : titre | description | étapes séparées par des virgules.',
        placeholder: 'Découverte rapide | Commencer par la capitale et les repères clés | Capitale, cuisine, carte\nMémoire | Relier dates, figures et lieux | Indépendance, musée, proverbes',
      },
      { key: 'climate', label: 'Climat', rows: 2, half: true },
      { key: 'bestTimeToVisit', label: 'Meilleure période', rows: 2, half: true },
      { key: 'visaNote', label: 'Visa / entrée', rows: 3, half: true },
      { key: 'healthAdvice', label: 'Santé', rows: 3, half: true },
      { key: 'etiquette', label: 'Codes sociaux', rows: 3, half: true },
      { key: 'safetyNote', label: 'Note sécurité', rows: 3, half: true },
      { key: 'transport', label: 'Transport', placeholder: 'Aéroports, train, routes, taxis...' },
      { key: 'connectivity', label: 'Connexion', placeholder: 'Réseaux mobiles, internet...' },
      { key: 'emergencyNumbers', label: 'Numéros utiles', placeholder: 'Police, pompiers, urgences...' },
      { key: 'practicalTips', label: 'Conseils pratiques', rows: 3, hint: LISTE },
    ],
  },
  { key: 'sections', label: 'Sections', intro: 'Des sections libres ajoutées à la page du pays, dans l’ordre choisi.' },
  { key: 'medias', label: 'Médias', intro: 'Images, PDF, vidéos et documents proposés sur la page du pays.' },
  {
    key: 'sources',
    label: 'Sources',
    intro: 'D’où viennent les informations, et leur niveau de vérification.',
    fields: [
      { key: 'sourceQuality', label: 'Niveau éditorial' },
      { key: 'lastUpdated', label: 'Mise à jour', placeholder: '2026' },
      {
        key: 'sourceNotes',
        label: 'Sources et notes de vérification',
        rows: 3,
        hint: LISTE,
        placeholder: 'Ex : Données population Banque mondiale 2026; Formalités à confirmer avant voyage',
      },
    ],
  },
]

const NIVEAUX: Record<string, string> = {
  draft: 'À compléter',
  community: 'Communauté',
  verified: 'Vérifié',
  official: 'Officiel',
}

// ---------- Complétude : champs renseignés sur l'ensemble des rubriques ----------

// Les champs toujours pré-remplis (code, couleur, niveau, année) ne comptent pas
const HORS_COMPLETUDE: FieldKey[] = ['id', 'color', 'sourceQuality', 'lastUpdated']
const MEDIAS = ['customSections', 'images', 'pdfs', 'videos', 'documents'] as const
const CHAMPS_COMPLETUDE: string[] = [
  ...ONGLETS.flatMap((tab) => (tab.fields || []).map((field) => field.key)).filter((key) => !HORS_COMPLETUDE.includes(key)),
  ...MEDIAS,
]

const rempli = (value: unknown) => (Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null)

const completudeOf = (get: (key: string) => unknown) => {
  const faits = CHAMPS_COMPLETUDE.filter((key) => rempli(get(key))).length
  return Math.round((faits / CHAMPS_COMPLETUDE.length) * 100)
}

const completudeCountry = (country: Country) => completudeOf((key) => (country as unknown as Record<string, unknown>)[key])

// ---------- Divers ----------

const getFlagUrl = (countryId: string) => {
  const codeMap: Record<string, string> = { EH: 'eh' }
  const code = codeMap[countryId] || countryId.toLowerCase()
  return `https://flagcdn.com/w80/${code}.png`
}

type RegionFiltre = 'tous' | Region

const REGION_OPTIONS: ReadonlyArray<{ key: RegionFiltre; label: string }> = [
  { key: 'tous', label: 'Tout le continent' },
  ...REGION_ORDER.map((region) => ({ key: region, label: REGION_LABELS[region] })),
]

const normaliser = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const regionStyle = (region: Region | null) => (region ? ({ '--mac-region': REGION_COLORS[region] } as CSSProperties) : undefined)

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const AdminCountries = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFiltre, setRegionFiltre] = useState<RegionFiltre>('tous')
  const [showForm, setShowForm] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('identite')
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [images, setImages] = useState<CountryImage[]>([])
  const [pdfs, setPdfs] = useState<CountryPDF[]>([])
  const [videos, setVideos] = useState<CountryVideo[]>([])
  const [documents, setDocuments] = useState<CountryDocument[]>([])
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [drapeauxManquants, setDrapeauxManquants] = useState<string[]>([])
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [initializing, setInitializing] = useState(false)
  const [uploadMode, setUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})

  const panelRef = useRef<HTMLFormElement | null>(null)
  const retourFocusRef = useRef<HTMLElement | null>(null)
  const snapshotRef = useRef('')
  const confirmOuvertRef = useRef(false)
  const fermerRef = useRef<() => void>(() => undefined)

  // Une confirmation ouverte au-dessus du panneau garde la main sur Échap et le focus
  const demander = async (options: Parameters<typeof confirm>[0]) => {
    confirmOuvertRef.current = true
    try {
      return await confirm(options)
    } finally {
      confirmOuvertRef.current = false
    }
  }

  const fetchCountries = async () => {
    try {
      setLoading(true)
      const response = await countryService.getAll()
      // L'API peut retourner { countries: [...], pagination: {...} } ou directement un tableau
      const countriesData = response.data.countries || response.data || []
      setCountries(Array.isArray(countriesData) ? countriesData : [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des pays:', error)
      showError('Erreur lors du chargement des pays')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Liste ----------

  const recherche = normaliser(searchTerm.trim())
  const trouves = useMemo(
    () =>
      countries
        .filter(
          (country) =>
            !recherche ||
            normaliser(country.nameFr || '').includes(recherche) ||
            normaliser(country.capital || '').includes(recherche) ||
            normaliser(country.id || '').includes(recherche),
        )
        .sort((a, b) => (a.nameFr || '').localeCompare(b.nameFr || '', 'fr')),
    [countries, recherche],
  )

  const compteurs = useMemo(() => {
    const counts: Partial<Record<RegionFiltre, number>> = { tous: trouves.length }
    for (const region of REGION_ORDER) counts[region] = 0
    for (const country of trouves) {
      const region = regionOfCode(country.id)
      if (region) counts[region] = (counts[region] || 0) + 1
    }
    return counts
  }, [trouves])

  const groupes = useMemo(() => {
    const regions: Array<Region | null> = regionFiltre === 'tous' ? [...REGION_ORDER, null] : [regionFiltre]
    return regions
      .map((region) => ({ region, pays: trouves.filter((country) => regionOfCode(country.id) === region) }))
      .filter((groupe) => groupe.region !== null || groupe.pays.length > 0)
      .filter((groupe) => !recherche || regionFiltre !== 'tous' || groupe.pays.length > 0)
  }, [trouves, regionFiltre, recherche])

  const chiffres = useMemo(() => {
    const verifies = countries.filter((c) => c.sourceQuality === 'verified' || c.sourceQuality === 'official').length
    const aCompleter = countries.filter((c) => !c.sourceQuality || c.sourceQuality === 'draft').length
    const moyenne = countries.length ? Math.round(countries.reduce((total, c) => total + completudeCountry(c), 0) / countries.length) : 0
    return { verifies, aCompleter, moyenne }
  }, [countries])

  const regionChipsStyle = Object.fromEntries(REGION_ORDER.map((region, index) => [`--mac-r${index + 1}`, REGION_COLORS[region]])) as CSSProperties

  // ---------- Panneau d'édition ----------

  const snapshotOf = (form: FormState, sections: CustomSection[], imgs: CountryImage[], pdfList: CountryPDF[], vids: CountryVideo[], docs: CountryDocument[]) =>
    JSON.stringify([form, sections, imgs, pdfList, vids, docs])

  const ouvrirPanneau = () => {
    retourFocusRef.current = document.activeElement as HTMLElement | null
    setShowForm(true)
  }

  const handleCreate = () => {
    resetForm()
    snapshotRef.current = snapshotOf(EMPTY_FORM, [], [], [], [], [])
    ouvrirPanneau()
  }

  const handleEdit = (country: Country) => {
    const next = formFromCountry(country)
    setEditingCountry(country)
    setFormData(next)
    setCustomSections(country.customSections || [])
    setImages(country.images || [])
    setPdfs(country.pdfs || [])
    setVideos(country.videos || [])
    setDocuments(country.documents || [])
    setUploadMode({})
    setActiveTab('identite')
    snapshotRef.current = snapshotOf(next, country.customSections || [], country.images || [], country.pdfs || [], country.videos || [], country.documents || [])
    ouvrirPanneau()
  }

  const allerAuBloc = (tab: TabKey, blocId?: string) => {
    setActiveTab(tab)
    if (blocId) window.setTimeout(() => document.getElementById(blocId)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    // Champs obligatoires : vérifiés ici car l'onglet Identité n'est pas forcément affiché
    if (!formData.id.trim() || !formData.nameFr.trim() || !formData.capital.trim() || !formData.description.trim()) {
      showError('Renseignez le code, le nom français, la capitale et la description (onglet Identité).')
      allerAuBloc('identite')
      return
    }
    if (customSections.some((section) => !section.title.trim())) {
      showError('Chaque section personnalisée doit avoir un titre.')
      allerAuBloc('sections')
      return
    }

    try {
      // Filtrer les PDFs valides (avec URL et titre)
      // Ignorer ceux qui sont complètement vides (pas de titre et pas d'URL)
      const validPDFs = pdfs
        .filter((pdf) => {
          const hasUrl = pdf.url && pdf.url.trim()
          const hasTitle = pdf.title && pdf.title.trim()
          return hasUrl && hasTitle
        })
        .map((pdf, idx) => ({
          url: pdf.url.trim(),
          title: pdf.title.trim(),
          description: pdf.description?.trim() || '',
          order: idx,
        }))

      // PDFs partiellement remplis (un champ rempli mais pas l'autre) : erreur
      const partiallyFilledPDFs = pdfs.filter((pdf) => {
        const hasUrl = pdf.url && pdf.url.trim()
        const hasTitle = pdf.title && pdf.title.trim()
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledPDFs.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les PDFs (URL et titre). Les PDFs incomplets seront ignorés.')
        allerAuBloc('medias', 'mac-bloc-pdfs')
        return
      }

      const validVideos = videos
        .filter((video) => {
          const hasUrl = video.url && video.url.trim()
          const hasTitle = video.title && video.title.trim()
          return hasUrl && hasTitle
        })
        .map((video, idx) => ({
          url: video.url.trim(),
          title: video.title.trim(),
          description: video.description?.trim() || '',
          type: video.type || 'direct',
          thumbnail: video.thumbnail?.trim() || '',
          order: idx,
        }))

      const partiallyFilledVideos = videos.filter((video) => {
        const hasUrl = video.url && video.url.trim()
        const hasTitle = video.title && video.title.trim()
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledVideos.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les vidéos (URL et titre). Les vidéos incomplètes seront ignorées.')
        allerAuBloc('medias', 'mac-bloc-videos')
        return
      }

      const validDocuments = documents
        .filter((doc) => {
          const hasUrl = doc.url && doc.url.trim()
          const hasTitle = doc.title && doc.title.trim()
          return hasUrl && hasTitle
        })
        .map((doc, idx) => ({
          url: doc.url.trim(),
          title: doc.title.trim(),
          description: doc.description?.trim() || '',
          type: doc.type || 'other',
          order: idx,
        }))

      const partiallyFilledDocuments = documents.filter((doc) => {
        const hasUrl = doc.url && doc.url.trim()
        const hasTitle = doc.title && doc.title.trim()
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledDocuments.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les documents (URL et titre). Les documents incomplets seront ignorés.')
        allerAuBloc('medias', 'mac-bloc-documents')
        return
      }

      const parseList = (value: string) =>
        value
          .split(';')
          .map((item) => item.trim())
          .filter(Boolean)
      const parsedRecommendedPaths = formData.recommendedPaths
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = '', items = ''] = line.split('|').map((part) => part.trim())
          return {
            title,
            description,
            items: items
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          }
        })
        .filter((path) => path.title && path.description)

      const countryData = {
        id: formData.id.toUpperCase(),
        name: formData.name || formData.nameFr,
        nameFr: formData.nameFr,
        capital: formData.capital,
        population: formData.population,
        area: formData.area,
        languages: formData.languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        currency: formData.currency,
        description: formData.description,
        culture: formData.culture,
        oneSentenceSummary: formData.oneSentenceSummary,
        keyFacts: parseList(formData.keyFacts),
        peoples: parseList(formData.peoples),
        languageNotes: formData.languageNotes,
        historyHighlights: parseList(formData.historyHighlights),
        notableFigures: parseList(formData.notableFigures),
        musicAndArts: parseList(formData.musicAndArts),
        foodCulture: parseList(formData.foodCulture),
        oralTraditions: parseList(formData.oralTraditions),
        knowledgeToPreserve: parseList(formData.knowledgeToPreserve),
        recommendedPaths: parsedRecommendedPaths,
        relatedThemes: parseList(formData.relatedThemes),
        sourceQuality: formData.sourceQuality,
        discoveryIntro: formData.discoveryIntro,
        lastUpdated: formData.lastUpdated,
        officialName: formData.officialName,
        region: formData.region,
        subregion: formData.subregion,
        demonym: formData.demonym,
        timeZone: formData.timeZone,
        callingCode: formData.callingCode,
        internetTld: formData.internetTld,
        drivingSide: formData.drivingSide,
        independenceDate: formData.independenceDate,
        governmentType: formData.governmentType,
        economicOverview: formData.economicOverview,
        climate: formData.climate,
        bestTimeToVisit: formData.bestTimeToVisit,
        safetyNote: formData.safetyNote,
        etiquette: formData.etiquette,
        transport: formData.transport,
        connectivity: formData.connectivity,
        visaNote: formData.visaNote,
        healthAdvice: formData.healthAdvice,
        emergencyNumbers: formData.emergencyNumbers,
        color: formData.color,
        rites: parseList(formData.rites),
        customs: parseList(formData.customs),
        foods: parseList(formData.foods),
        traditions: parseList(formData.traditions),
        festivals: parseList(formData.festivals),
        arts: parseList(formData.arts),
        placesToDiscover: parseList(formData.placesToDiscover),
        experiences: parseList(formData.experiences),
        practicalTips: parseList(formData.practicalTips),
        sourceNotes: parseList(formData.sourceNotes),
        customSections: customSections.map((s, idx) => ({ ...s, order: idx })),
        images: images.map((img, idx) => ({ ...img, order: idx })),
        pdfs: validPDFs,
        videos: validVideos,
        documents: validDocuments,
      }

      setSaving(true)
      const pdfCount = validPDFs.length
      if (editingCountry) {
        await countryService.update(editingCountry._id || editingCountry.id, countryData)
        success(`Pays mis à jour. ${pdfCount} PDF enregistré(s).`)
      } else {
        await countryService.create(countryData)
        success(`Pays créé. ${pdfCount} PDF enregistré(s).`)
      }

      resetForm()
      await fetchCountries()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, nom?: string) => {
    const accepted = await demander({
      title: nom ? `Supprimer ${nom} ?` : 'Supprimer ce pays ?',
      message: 'La fiche pays et ses contenus associés seront retirés.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return false

    try {
      await countryService.delete(id)
      success('Pays supprimé.')
      fetchCountries()
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
      return false
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setCustomSections([])
    setImages([])
    setPdfs([])
    setVideos([])
    setDocuments([])
    setUploadMode({})
    setEditingCountry(null)
    setShowForm(false)
    setActiveTab('identite')
  }

  // Fermer (Annuler, Échap, clic sur le voile) : on demande avant de perdre des changements
  const fermer = async () => {
    const modifie = snapshotOf(formData, customSections, images, pdfs, videos, documents) !== snapshotRef.current
    if (modifie) {
      const abandon = await demander({
        title: 'Abandonner les modifications ?',
        message: 'Les changements non enregistrés seront perdus.',
        confirmLabel: 'Abandonner',
        cancelLabel: 'Continuer l’édition',
        tone: 'danger',
      })
      if (!abandon) return
    }
    resetForm()
  }

  useEffect(() => {
    fermerRef.current = () => {
      void fermer()
    }
  })

  // Panneau ouvert : défilement de la page bloqué, focus dans le panneau, Échap ferme, Tab y reste
  useEffect(() => {
    if (!showForm) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      const panel = panelRef.current
      const premier = panel?.querySelector<HTMLElement>('.mac-onglet-panneau input:not([disabled]), .mac-onglet-panneau textarea, .mac-onglet-panneau select')
      ;(premier || panel?.querySelector<HTMLElement>(FOCUSABLES))?.focus()
    }, 30)

    const handleKeydown = (event: KeyboardEvent) => {
      if (confirmOuvertRef.current) return
      if (event.key === 'Escape') {
        event.preventDefault()
        fermerRef.current()
        return
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLES)).filter((el) => el.offsetParent !== null)
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        } else if (!panelRef.current.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = previousOverflow
      const retour = retourFocusRef.current
      if (retour && document.contains(retour)) retour.focus()
    }
  }, [showForm])

  // Onglets : flèches gauche/droite pour passer de l'un à l'autre
  const handleTabsKeydown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const index = ONGLETS.findIndex((tab) => tab.key === activeTab)
    const next = ONGLETS[(index + (event.key === 'ArrowRight' ? 1 : ONGLETS.length - 1)) % ONGLETS.length]
    setActiveTab(next.key)
    window.setTimeout(() => document.getElementById(`mac-onglet-${next.key}`)?.focus(), 0)
  }

  // ---------- Sections personnalisées ----------
  const addCustomSection = () => {
    setCustomSections([...customSections, { title: '', content: '', type: 'text', order: customSections.length }])
  }

  const updateCustomSection = (index: number, field: keyof CustomSection, value: any) => {
    const updated = [...customSections]
    updated[index] = { ...updated[index], [field]: value }
    setCustomSections(updated)
  }

  const removeCustomSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index))
  }

  const moveCustomSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === customSections.length - 1) return
    const updated = [...customSections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    updated[index] = { ...updated[index], order: index }
    updated[newIndex] = { ...updated[newIndex], order: newIndex }
    setCustomSections(updated)
  }

  // ---------- Images ----------
  const addImage = () => {
    setImages([...images, { url: '', caption: '', order: images.length }])
  }

  const updateImage = (index: number, field: keyof CountryImage, value: any) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: value }
    setImages(updated)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // ---------- PDFs ----------
  const addPDF = () => {
    setPdfs([...pdfs, { url: '', title: '', description: '' }])
  }

  const updatePDF = (index: number, field: keyof CountryPDF, value: any) => {
    // Mise à jour fonctionnelle : l'envoi d'un fichier peut se terminer après d'autres saisies
    setPdfs((current) => {
      const updated = [...current]
      if (!updated[index]) updated[index] = { url: '', title: '', description: '', order: index }
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removePDF = (index: number) => {
    setPdfs(pdfs.filter((_, i) => i !== index))
  }

  // ---------- Vidéos ----------
  const addVideo = () => {
    setVideos([...videos, { url: '', title: '', description: '', type: 'direct', thumbnail: '', order: videos.length }])
  }

  const updateVideo = (index: number, field: keyof CountryVideo, value: string | undefined) => {
    setVideos((current) => current.map((video, i) => (i === index ? { ...video, [field]: value } : video)))
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === videos.length - 1) return
    const updated = [...videos]
    const other = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[other]] = [updated[other], updated[index]]
    setVideos(updated.map((v, idx) => ({ ...v, order: idx })))
  }

  // ---------- Documents ----------
  const addDocument = () => {
    setDocuments([...documents, { url: '', title: '', description: '', type: 'other', order: documents.length }])
  }

  const updateDocument = (index: number, field: keyof CountryDocument, value: string | undefined) => {
    setDocuments((current) => current.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc)))
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const moveDocument = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === documents.length - 1) return
    const updated = [...documents]
    const other = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[other]] = [updated[other], updated[index]]
    setDocuments(updated.map((d, idx) => ({ ...d, order: idx })))
  }

  const handleInitializeCountries = async () => {
    const accepted = await demander({
      title: 'Initialiser les pays africains ?',
      message: 'Les 54 pays seront ajoutés ou mis à jour avec les données de base.',
      confirmLabel: 'Initialiser',
    })
    if (!accepted) return

    setInitializing(true)
    try {
      const response = await countryService.initialize(allAfricanCountries)
      const { created, updated, errors } = response.data

      let message = `Initialisation terminée : ${created} pays créés, ${updated} pays mis à jour.`
      if (errors && errors.length > 0) {
        message += `\n${errors.length} erreur(s) : ${errors.map((e: any) => e.country).join(', ')}`
      }

      success(message)
      fetchCountries()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Erreur lors de l'initialisation"
      showError(errorMessage)
    } finally {
      setInitializing(false)
    }
  }

  // ---------- Rendu ----------

  const setChamp = (key: FieldKey, value: string) => setFormData((current) => ({ ...current, [key]: value }))
  const valeurForm = (key: string) => {
    if ((MEDIAS as readonly string[]).includes(key)) return { customSections, images, pdfs, videos, documents }[key as (typeof MEDIAS)[number]]
    return formData[key as FieldKey]
  }
  const scorePanneau = completudeOf(valeurForm)
  const remplisOnglet = (tab: TabSpec) => {
    if (tab.key === 'sections') return customSections.length
    if (tab.key === 'medias') return images.length + pdfs.length + videos.length + documents.length
    const fields = (tab.fields || []).filter((field) => !HORS_COMPLETUDE.includes(field.key))
    return `${fields.filter((field) => rempli(formData[field.key])).length}/${fields.length}`
  }

  const renderChamp = (field: FieldSpec) => {
    const id = `mac-champ-${field.key}`
    const hintId = field.hint ? `${id}-aide` : undefined
    const value = formData[field.key]
    let control
    if (field.key === 'sourceQuality') {
      control = (
        <select id={id} value={value} onChange={(e) => setChamp(field.key, e.target.value)} aria-describedby={hintId}>
          {Object.entries(NIVEAUX).map(([cle, libelle]) => (
            <option key={cle} value={cle}>
              {libelle}
            </option>
          ))}
        </select>
      )
    } else if (field.key === 'color') {
      control = (
        <span className="mac-couleur">
          <input id={id} type="color" value={value} onChange={(e) => setChamp(field.key, e.target.value)} aria-describedby={hintId} />
          <code>{value}</code>
        </span>
      )
    } else if (field.rows) {
      control = (
        <textarea
          id={id}
          value={value}
          rows={field.rows}
          required={field.required}
          placeholder={field.placeholder}
          aria-describedby={hintId}
          onChange={(e) => setChamp(field.key, e.target.value)}
        />
      )
    } else {
      control = (
        <input
          id={id}
          type="text"
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          aria-describedby={hintId}
          disabled={field.key === 'id' && !!editingCountry}
          onChange={(e) => setChamp(field.key, field.key === 'id' ? e.target.value.toUpperCase() : e.target.value)}
        />
      )
    }
    return (
      <div key={field.key} className={`mac-champ${field.rows && !field.half ? ' mac-champ--large' : ''}`}>
        <label htmlFor={id}>
          {field.label}
          {field.required && (
            <span className="mac-requis" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {control}
        {field.hint && (
          <span id={hintId} className="mac-aide">
            {field.hint}
          </span>
        )}
      </div>
    )
  }

  const boutonsOrdre = (index: number, total: number, move: (index: number, direction: 'up' | 'down') => void, remove: (index: number) => void, libelle: string) => (
    <div className="mac-item-actions">
      <button type="button" className="mac-icone" onClick={() => move(index, 'up')} disabled={index === 0} aria-label={`Monter ${libelle}`} title="Déplacer vers le haut">
        <ArrowUp size={16} aria-hidden="true" />
      </button>
      <button type="button" className="mac-icone" onClick={() => move(index, 'down')} disabled={index === total - 1} aria-label={`Descendre ${libelle}`} title="Déplacer vers le bas">
        <ArrowDown size={16} aria-hidden="true" />
      </button>
      <button type="button" className="mac-icone mac-icone--danger" onClick={() => remove(index)} aria-label={`Retirer ${libelle}`} title="Retirer">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )

  const boutonRetirer = (index: number, remove: (index: number) => void, libelle: string) => (
    <div className="mac-item-actions">
      <button type="button" className="mac-icone mac-icone--danger" onClick={() => remove(index)} aria-label={`Retirer ${libelle}`} title="Retirer">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )

  const renderSections = () => (
    <div className="mac-bloc">
      <div className="mac-bloc-tete">
        <h4>Sections personnalisées</h4>
        <button type="button" className="btn btn-outline btn-small" onClick={addCustomSection}>
          <Plus size={16} aria-hidden="true" /> Ajouter une section
        </button>
      </div>
      {customSections.length === 0 ? (
        <p className="mac-vide">Aucune section personnalisée. Ajoutez-en une pour enrichir la page du pays.</p>
      ) : (
        <ol className="mac-items">
          {customSections.map((section, index) => (
            <li key={index} className="mac-item">
              <div className="mac-item-tete">
                <strong>Section {index + 1}</strong>
                {boutonsOrdre(index, customSections.length, moveCustomSection, removeCustomSection, `la section ${index + 1}`)}
              </div>
              <div className="mac-champs">
                <Input label="Titre de la section" value={section.title} onChange={(e) => updateCustomSection(index, 'title', e.target.value)} placeholder="Ex : Histoire du pays" required />
                <div className="mac-champ">
                  <label htmlFor={`section-type-${index}`}>Type de contenu</label>
                  <select
                    id={`section-type-${index}`}
                    value={section.type}
                    onChange={(e) => updateCustomSection(index, 'type', e.target.value as 'text' | 'html' | 'list')}
                  >
                    <option value="text">Texte simple</option>
                    <option value="html">HTML</option>
                    <option value="list">Liste</option>
                  </select>
                </div>
                <div className="mac-champ mac-champ--large">
                  <label htmlFor={`section-content-${index}`}>Contenu</label>
                  <textarea
                    id={`section-content-${index}`}
                    value={section.content}
                    onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                    rows={section.type === 'list' ? 6 : 4}
                    placeholder={section.type === 'list' ? 'Une ligne par élément de la liste' : 'Contenu de la section...'}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )

  const renderMedias = () => (
    <>
      <nav className="mac-sous-nav" aria-label="Types de médias">
        <a href="#mac-bloc-images">Images ({images.length})</a>
        <a href="#mac-bloc-pdfs">PDF ({pdfs.length})</a>
        <a href="#mac-bloc-videos">Vidéos ({videos.length})</a>
        <a href="#mac-bloc-documents">Documents ({documents.length})</a>
      </nav>

      <section className="mac-bloc" id="mac-bloc-images" aria-labelledby="mac-titre-images">
        <div className="mac-bloc-tete">
          <h4 id="mac-titre-images">Galerie d’images</h4>
          <button type="button" className="btn btn-outline btn-small" onClick={addImage}>
            <ImageIcon size={16} aria-hidden="true" /> Ajouter une image
          </button>
        </div>
        {images.length === 0 ? (
          <p className="mac-vide">Aucune image. Ajoutez des images pour enrichir la galerie du pays.</p>
        ) : (
          <ol className="mac-items mac-items--grille">
            {images.map((image, index) => (
              <li key={index} className="mac-item">
                <div className="mac-item-tete">
                  <strong>Image {index + 1}</strong>
                  {boutonRetirer(index, removeImage, `l’image ${index + 1}`)}
                </div>
                <MediaUpload type="image" value={image.url} label={`Image ${index + 1}`} onChange={(url) => updateImage(index, 'url', url)} onRemove={() => updateImage(index, 'url', '')} />
                <Input label="Légende (optionnel)" value={image.caption} onChange={(e) => updateImage(index, 'caption', e.target.value)} placeholder="Description de l’image" />
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mac-bloc" id="mac-bloc-pdfs" aria-labelledby="mac-titre-pdfs">
        <div className="mac-bloc-tete">
          <h4 id="mac-titre-pdfs">Documents PDF</h4>
          <button type="button" className="btn btn-outline btn-small" onClick={addPDF}>
            <FileText size={16} aria-hidden="true" /> Ajouter un PDF
          </button>
        </div>
        {pdfs.length === 0 ? (
          <p className="mac-vide">Aucun document PDF. Ajoutez des documents pour enrichir les ressources du pays.</p>
        ) : (
          <ol className="mac-items">
            {pdfs.map((pdf, index) => {
              const mode = uploadMode[`pdf-${index}`] || 'upload'
              return (
                <li key={index} className="mac-item">
                  <div className="mac-item-tete">
                    <strong>PDF {index + 1}</strong>
                    {boutonRetirer(index, removePDF, `le PDF ${index + 1}`)}
                  </div>
                  <Input label="Titre du document" value={pdf.title} onChange={(e) => updatePDF(index, 'title', e.target.value)} placeholder="Ex : Guide touristique" required />
                  <div className="mac-mode" role="group" aria-label={`Source du PDF ${index + 1}`}>
                    <button type="button" aria-pressed={mode === 'upload'} onClick={() => setUploadMode({ ...uploadMode, [`pdf-${index}`]: 'upload' })}>
                      <FileText size={16} aria-hidden="true" /> Depuis l’ordinateur
                    </button>
                    <button type="button" aria-pressed={mode === 'url'} onClick={() => setUploadMode({ ...uploadMode, [`pdf-${index}`]: 'url' })}>
                      <LinkIcon size={16} aria-hidden="true" /> Lien (Drive, Dropbox…)
                    </button>
                  </div>
                  {mode === 'upload' ? (
                    <>
                      <FileUpload type="pdf" onUploadSuccess={(url) => updatePDF(index, 'url', url)} label="Upload de PDF" />
                      {pdf.url && (
                        <p className="mac-fichier">
                          Fichier enregistré :{' '}
                          <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                            ouvrir le PDF <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <Input
                      label="URL du PDF"
                      value={pdf.url}
                      onChange={(e) => updatePDF(index, 'url', e.target.value)}
                      placeholder="https://exemple.com/document.pdf ou lien Google Drive/Dropbox"
                      required
                    />
                  )}
                  <div className="mac-champ">
                    <label htmlFor={`pdf-description-${index}`}>Description (optionnel)</label>
                    <textarea id={`pdf-description-${index}`} value={pdf.description} onChange={(e) => updatePDF(index, 'description', e.target.value)} rows={2} placeholder="Description du document..." />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="mac-bloc" id="mac-bloc-videos" aria-labelledby="mac-titre-videos">
        <div className="mac-bloc-tete">
          <h4 id="mac-titre-videos">Vidéos</h4>
          <button type="button" className="btn btn-outline btn-small" onClick={addVideo}>
            <Video size={16} aria-hidden="true" /> Ajouter une vidéo
          </button>
        </div>
        {videos.length === 0 ? (
          <p className="mac-vide">Aucune vidéo. Ajoutez des vidéos pour enrichir le contenu du pays.</p>
        ) : (
          <ol className="mac-items">
            {videos.map((video, index) => (
              <li key={index} className="mac-item">
                <div className="mac-item-tete">
                  <strong>Vidéo {index + 1}</strong>
                  {boutonsOrdre(index, videos.length, moveVideo, removeVideo, `la vidéo ${index + 1}`)}
                </div>
                <div className="mac-champs">
                  <Input label="Titre de la vidéo" value={video.title} onChange={(e) => updateVideo(index, 'title', e.target.value)} placeholder="Ex : Présentation du pays" required />
                  <div className="mac-champ">
                    <label htmlFor={`video-type-${index}`}>Type de vidéo</label>
                    <select id={`video-type-${index}`} value={video.type || 'direct'} onChange={(e) => updateVideo(index, 'type', e.target.value as CountryVideo['type'])}>
                      <option value="direct">URL directe</option>
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="mac-champ--large">
                    <Input
                      label="URL de la vidéo"
                      value={video.url}
                      onChange={(e) => updateVideo(index, 'url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                      required
                    />
                  </div>
                </div>
                <MediaUpload type="image" value={video.thumbnail || ''} label="Miniature vidéo" onChange={(url) => updateVideo(index, 'thumbnail', url)} onRemove={() => updateVideo(index, 'thumbnail', '')} />
                <div className="mac-champ">
                  <label htmlFor={`video-description-${index}`}>Description (optionnel)</label>
                  <textarea id={`video-description-${index}`} value={video.description || ''} onChange={(e) => updateVideo(index, 'description', e.target.value)} rows={2} placeholder="Description de la vidéo..." />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mac-bloc" id="mac-bloc-documents" aria-labelledby="mac-titre-documents">
        <div className="mac-bloc-tete">
          <h4 id="mac-titre-documents">Documents (DOCX, XLSX, etc.)</h4>
          <button type="button" className="btn btn-outline btn-small" onClick={addDocument}>
            <FileIcon size={16} aria-hidden="true" /> Ajouter un document
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="mac-vide">Aucun document. Ajoutez des documents pour enrichir les ressources du pays.</p>
        ) : (
          <ol className="mac-items">
            {documents.map((document, index) => (
              <li key={index} className="mac-item">
                <div className="mac-item-tete">
                  <strong>Document {index + 1}</strong>
                  {boutonsOrdre(index, documents.length, moveDocument, removeDocument, `le document ${index + 1}`)}
                </div>
                <div className="mac-champs">
                  <Input label="Titre du document" value={document.title} onChange={(e) => updateDocument(index, 'title', e.target.value)} placeholder="Ex : Rapport économique" required />
                  <div className="mac-champ">
                    <label htmlFor={`document-type-${index}`}>Type de document</label>
                    <select id={`document-type-${index}`} value={document.type || 'other'} onChange={(e) => updateDocument(index, 'type', e.target.value as CountryDocument['type'])}>
                      <option value="docx">Word (DOCX)</option>
                      <option value="doc">Word (DOC)</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="xls">Excel (XLS)</option>
                      <option value="pptx">PowerPoint (PPTX)</option>
                      <option value="ppt">PowerPoint (PPT)</option>
                      <option value="txt">Texte (TXT)</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="mac-champ--large">
                    <Input
                      label="URL du document"
                      value={document.url}
                      onChange={(e) => updateDocument(index, 'url', e.target.value)}
                      placeholder="https://exemple.com/document.docx ou lien Google Drive/Dropbox"
                      required
                    />
                  </div>
                </div>
                <div className="mac-champ">
                  <label htmlFor={`document-description-${index}`}>Description (optionnel)</label>
                  <textarea
                    id={`document-description-${index}`}
                    value={document.description || ''}
                    onChange={(e) => updateDocument(index, 'description', e.target.value)}
                    rows={2}
                    placeholder="Description du document..."
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )

  const ongletActif = ONGLETS.find((tab) => tab.key === activeTab) || ONGLETS[0]
  const regionPanneau = regionOfCode(formData.id)
  const titrePanneau = editingCountry ? editingCountry.nameFr : formData.nameFr.trim() || 'Nouveau pays'

  if (loading && countries.length === 0) {
    return (
      <p className="mac-chargement" role="status">
        Chargement des pays…
      </p>
    )
  }

  return (
    <div className="mac">
      <header className="mac-tete">
        <dl className="mac-chiffres">
          <div>
            <dt>Pays dans la base</dt>
            <dd>
              {countries.length}
              <small> / {allAfricanCountries.length}</small>
            </dd>
          </div>
          <div>
            <dt>Vérifiés ou officiels</dt>
            <dd>{chiffres.verifies}</dd>
          </div>
          <div>
            <dt>À compléter</dt>
            <dd>{chiffres.aCompleter}</dd>
          </div>
          <div>
            <dt>Complétude moyenne</dt>
            <dd>{chiffres.moyenne} %</dd>
          </div>
        </dl>
        <div className="mac-tete-actions">
          {countries.length === 0 && (
            <button type="button" className="btn btn-outline" onClick={handleInitializeCountries} disabled={initializing}>
              <Database size={18} aria-hidden="true" />
              {initializing ? 'Initialisation…' : 'Initialiser tous les pays'}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            <Plus size={18} aria-hidden="true" /> Ajouter un pays
          </button>
        </div>
      </header>

      <div className="mac-filtres">
        <div className="mac-regions" style={regionChipsStyle}>
          <TypeChips label="Région" options={REGION_OPTIONS} counts={compteurs} active={regionFiltre} onChange={setRegionFiltre} />
        </div>
        <label className="mac-recherche">
          <Search size={16} aria-hidden="true" />
          <input type="search" className="mac-recherche-champ" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pays, capitale ou code" aria-label="Rechercher un pays, une capitale ou un code" />
        </label>
      </div>

      <p className="mac-compte" aria-live="polite">
        {regionFiltre === 'tous' ? trouves.length : compteurs[regionFiltre] || 0} pays
        {recherche ? ` pour « ${searchTerm.trim()} »` : ''}
        {recherche && (
          <button type="button" className="mac-lien" onClick={() => setSearchTerm('')}>
            Effacer la recherche
          </button>
        )}
      </p>

      {countries.length === 0 ? (
        <div className="mac-vide-liste">
          <p>Aucun pays dans la base pour l’instant.</p>
          <p>Initialisez les 54 pays avec leurs données de base, ou ajoutez-en un.</p>
        </div>
      ) : (
        groupes.map(({ region, pays }) => (
          <section key={region || 'autre'} className="mac-groupe" style={regionStyle(region)} aria-labelledby={`mac-groupe-${region || 'autre'}`}>
            <h3 id={`mac-groupe-${region || 'autre'}`} className="mac-groupe-titre">
              {region && <i aria-hidden="true" />}
              {region ? REGION_LABELS[region] : 'Hors des cinq régions'}
              <span>{pays.length}</span>
            </h3>
            {pays.length === 0 ? (
              <p className="mac-vide-liste">{recherche ? 'Aucun pays ne correspond à la recherche dans cette région.' : 'Aucun pays de cette région dans la base. Ajoutez-en un pour la faire vivre.'}</p>
            ) : (
              <ul className="mac-liste">
                {pays.map((country) => {
                  const score = completudeCountry(country)
                  const niveau = country.sourceQuality || 'draft'
                  const regionPays = regionOfCode(country.id)
                  const sansDrapeau = drapeauxManquants.includes(country.id)
                  return (
                    <li key={country._id || country.id} className="mac-ligne" style={regionStyle(regionPays)}>
                      <span className="mac-drapeau" aria-hidden="true">
                        {sansDrapeau ? (
                          <span>{country.id}</span>
                        ) : (
                          <img src={getFlagUrl(country.id)} alt="" loading="lazy" onError={() => setDrapeauxManquants((current) => [...current, country.id])} />
                        )}
                      </span>
                      <span className="mac-ligne-nom">
                        <button type="button" className="mac-ouvrir" onClick={() => handleEdit(country)}>
                          {country.nameFr}
                        </button>
                        <span className="mac-meta">
                          <span className="mac-code">{country.id}</span>
                          {country.capital && <span>{country.capital}</span>}
                        </span>
                      </span>
                      <span className="mac-ligne-region">
                        {regionPays && <i aria-hidden="true" />}
                        {regionPays ? REGION_LABELS[regionPays] : country.region || 'Région non définie'}
                      </span>
                      <span className={`mac-niveau mac-niveau--${niveau}`}>{NIVEAUX[niveau] || niveau}</span>
                      <span className="mac-completude" title={`${score} % des champs renseignés`}>
                        <span className="mac-jauge" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={`Complétude de ${country.nameFr}`}>
                          <span style={{ width: `${score}%` }} />
                        </span>
                        <span className="mac-score">{score} %</span>
                      </span>
                      <span className="mac-actions">
                        <button type="button" className="mac-icone" onClick={() => navigate(`/country/${country.id}`)} aria-label={`Voir ${country.nameFr} sur le site`} title="Voir sur le site">
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </button>
                        <button type="button" className="mac-icone" onClick={() => handleEdit(country)} aria-label={`Modifier ${country.nameFr}`} title="Modifier">
                          <Pencil size={18} aria-hidden="true" />
                        </button>
                        <button type="button" className="mac-icone mac-icone--danger" onClick={() => handleDelete(country._id || country.id, country.nameFr)} aria-label={`Supprimer ${country.nameFr}`} title="Supprimer">
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))
      )}

      {showForm && (
        <div className="mac-voile" onMouseDown={(event) => {
            if (event.target === event.currentTarget) fermerRef.current()
          }}>
          <form ref={panelRef} className="mac-panneau" role="dialog" aria-modal="true" aria-labelledby="mac-panneau-titre" onSubmit={handleSubmit}>
            <header className="mac-panneau-tete" style={regionStyle(regionPanneau)}>
              <div className="mac-panneau-titres">
                <p className="mac-kicker">
                  {regionPanneau && <i aria-hidden="true" />}
                  {editingCountry ? 'Modifier la fiche' : 'Nouvelle fiche'}
                  {regionPanneau ? ` · ${REGION_LABELS[regionPanneau]}` : ''}
                  {formData.id ? ` · ${formData.id}` : ''}
                </p>
                <h3 id="mac-panneau-titre">{titrePanneau}</h3>
              </div>
              <div className="mac-panneau-score">
                <span className="mac-jauge" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scorePanneau} aria-label="Complétude de la fiche">
                  <span style={{ width: `${scorePanneau}%` }} />
                </span>
                <span>{scorePanneau} % complétée</span>
              </div>
              <button type="button" className="mac-icone mac-fermer" onClick={() => fermerRef.current()} aria-label="Fermer le panneau">
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="mac-onglets" role="tablist" aria-label="Rubriques de la fiche" onKeyDown={handleTabsKeydown}>
              {ONGLETS.map((tab) => (
                <button
                  key={tab.key}
                  id={`mac-onglet-${tab.key}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls="mac-onglet-contenu"
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  className="mac-onglet"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} <span>{remplisOnglet(tab)}</span>
                </button>
              ))}
            </div>

            <div id="mac-onglet-contenu" className="mac-panneau-corps mac-onglet-panneau" role="tabpanel" aria-labelledby={`mac-onglet-${activeTab}`}>
              <p className="mac-intro">{ongletActif.intro}</p>
              {ongletActif.fields && <div className="mac-champs">{ongletActif.fields.map(renderChamp)}</div>}
              {activeTab === 'sections' && renderSections()}
              {activeTab === 'medias' && renderMedias()}
            </div>

            <footer className="mac-panneau-pied">
              {editingCountry && (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={saving}
                  onClick={async () => {
                    if (await handleDelete(editingCountry._id || editingCountry.id, editingCountry.nameFr)) resetForm()
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" /> Supprimer
                </button>
              )}
              <span className="mac-pied-droite">
                <button type="button" className="btn btn-outline" onClick={() => fermerRef.current()}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement…' : editingCountry ? 'Enregistrer' : 'Créer le pays'}
                </button>
              </span>
            </footer>
          </form>
        </div>
      )}
      {Dialog}
    </div>
  )
}
