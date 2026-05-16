import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { FileUpload } from '../../components/FileUpload/FileUpload'
import { countryService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { allAfricanCountries } from '../../data/allAfricanCountries'
import { Plus, Edit, Trash2, Search, Globe, MapPin, Users, Globe2, Image as ImageIcon, FileText, X, ArrowUp, ArrowDown, Database, Link as LinkIcon, Video, File as FileIcon } from 'lucide-react'
import './AdminCountries.css'

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

export const AdminCountries = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'discovery' | 'sections' | 'images' | 'pdfs' | 'videos' | 'documents'>('basic')
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [images, setImages] = useState<CountryImage[]>([])
  const [pdfs, setPdfs] = useState<CountryPDF[]>([])
  const [videos, setVideos] = useState<CountryVideo[]>([])
  const [documents, setDocuments] = useState<CountryDocument[]>([])
  const [formData, setFormData] = useState({
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
  })
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [initializing, setInitializing] = useState(false)
  const [uploadMode, setUploadMode] = useState<{ [key: string]: 'upload' | 'url' }>({})

  useEffect(() => {
    fetchCountries()
  }, [])

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

  const filteredCountries = countries.filter(country =>
    country.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormData({
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
    setCustomSections(country.customSections || [])
    setImages(country.images || [])
    setPdfs(country.pdfs || [])
    setVideos(country.videos || [])
    setDocuments(country.documents || [])
    setShowForm(true)
    setActiveTab('basic')
    console.log('Pays chargé pour édition - PDFs:', country.pdfs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Soumission du formulaire - PDFs:', pdfs)
      console.log('Soumission du formulaire - Videos:', videos)
      console.log('Soumission du formulaire - Documents:', documents)
      // Filtrer les PDFs valides (avec URL et titre)
      // Ignorer ceux qui sont complètement vides (pas de titre et pas d'URL)
      const validPDFs = pdfs
        .filter(pdf => {
          const hasUrl = pdf.url && pdf.url.trim()
          const hasTitle = pdf.title && pdf.title.trim()
          // Garder seulement ceux qui ont les deux (URL et titre)
          return hasUrl && hasTitle
        })
        .map((pdf, idx) => ({ 
          url: pdf.url.trim(), 
          title: pdf.title.trim(), 
          description: pdf.description?.trim() || '', 
          order: idx 
        }))
      
      // Vérifier s'il y a des PDFs partiellement remplis (un champ rempli mais pas l'autre)
      const partiallyFilledPDFs = pdfs.filter(pdf => {
        const hasUrl = pdf.url && pdf.url.trim()
        const hasTitle = pdf.title && pdf.title.trim()
        // Si un champ est rempli mais pas l'autre, c'est une erreur
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledPDFs.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les PDFs (URL et titre). Les PDFs incomplets seront ignorés.')
        setActiveTab('pdfs')
        return
      }

      const validVideos = videos
        .filter(video => {
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
          order: idx 
        }))
      
      const partiallyFilledVideos = videos.filter(video => {
        const hasUrl = video.url && video.url.trim()
        const hasTitle = video.title && video.title.trim()
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledVideos.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les vidéos (URL et titre). Les vidéos incomplètes seront ignorées.')
        setActiveTab('videos')
        return
      }

      const validDocuments = documents
        .filter(doc => {
          const hasUrl = doc.url && doc.url.trim()
          const hasTitle = doc.title && doc.title.trim()
          return hasUrl && hasTitle
        })
        .map((doc, idx) => ({ 
          url: doc.url.trim(), 
          title: doc.title.trim(), 
          description: doc.description?.trim() || '', 
          type: doc.type || 'other',
          order: idx 
        }))
      
      const partiallyFilledDocuments = documents.filter(doc => {
        const hasUrl = doc.url && doc.url.trim()
        const hasTitle = doc.title && doc.title.trim()
        return (hasUrl && !hasTitle) || (!hasUrl && hasTitle)
      })
      if (partiallyFilledDocuments.length > 0) {
        showError('Veuillez remplir tous les champs requis pour les documents (URL et titre). Les documents incomplets seront ignorés.')
        setActiveTab('documents')
        return
      }

      const parseList = (value: string) => value.split(';').map((item) => item.trim()).filter(Boolean)
      const parsedRecommendedPaths = formData.recommendedPaths
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = '', items = ''] = line.split('|').map((part) => part.trim())
          return {
            title,
            description,
            items: items.split(',').map((item) => item.trim()).filter(Boolean),
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
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
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

      console.log('Données à envoyer:', JSON.stringify(countryData, null, 2))
      console.log('PDFs valides à envoyer:', validPDFs)
      
      if (editingCountry) {
        const response = await countryService.update(editingCountry._id || editingCountry.id, countryData)
        console.log('Réponse de mise à jour:', response.data)
        console.log('PDFs dans la réponse:', response.data.pdfs)
        const pdfCount = validPDFs.length
        success(`Pays mis à jour avec succès ! ${pdfCount} PDF(s) sauvegardé(s).`)
      } else {
        const response = await countryService.create(countryData)
        console.log('Réponse de création:', response.data)
        console.log('PDFs dans la réponse:', response.data.pdfs)
        const pdfCount = validPDFs.length
        success(`Pays créé avec succès ! ${pdfCount} PDF(s) sauvegardé(s).`)
      }

      resetForm()
      await fetchCountries()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la sauvegarde'
      showError(errorMessage)
    }
  }

  const handleDelete = async (id: string) => {
    const accepted = await confirm({
      title: 'Supprimer ce pays ?',
      message: 'La fiche pays et ses contenus associés seront retirés.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await countryService.delete(id)
      success('Pays supprimé avec succès !')
      fetchCountries()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
      showError(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
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
    })
    setCustomSections([])
    setImages([])
    setPdfs([])
    setVideos([])
    setDocuments([])
    setEditingCountry(null)
    setShowForm(false)
    setActiveTab('basic')
  }

  // Gestion des sections personnalisées
  const addCustomSection = () => {
    setCustomSections([...customSections, {
      title: '',
      content: '',
      type: 'text',
      order: customSections.length,
    }])
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
    updated[index].order = index
    updated[newIndex].order = newIndex
    setCustomSections(updated)
  }

  // Gestion des images
  const addImage = () => {
    setImages([...images, {
      url: '',
      caption: '',
      order: images.length,
    }])
  }

  const updateImage = (index: number, field: keyof CountryImage, value: any) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: value }
    setImages(updated)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // Gestion des PDFs
  const addPDF = () => {
    setPdfs([...pdfs, {
      url: '',
      title: '',
      description: '',
    }])
  }

  const updatePDF = (index: number, field: keyof CountryPDF, value: any) => {
    const updated = [...pdfs]
    if (!updated[index]) {
      // Si l'index n'existe pas, créer un nouveau PDF
      updated[index] = { url: '', title: '', description: '', order: index }
    }
    updated[index] = { ...updated[index], [field]: value }
    setPdfs(updated)
    console.log(`PDF ${index} mis à jour - ${field}:`, value, 'PDFs complets:', updated)
  }

  const removePDF = (index: number) => {
    setPdfs(pdfs.filter((_, i) => i !== index))
  }

  // Gestion des vidéos
  const addVideo = () => {
    setVideos([...videos, {
      url: '',
      title: '',
      description: '',
      type: 'direct',
      thumbnail: '',
      order: videos.length,
    }])
  }

  const updateVideo = (index: number, field: keyof CountryVideo, value: string | undefined) => {
    const updated = [...videos]
    ;(updated[index] as any)[field] = value
    setVideos(updated)
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === videos.length - 1) return
    
    const updated = [...videos]
    if (direction === 'up') {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]]
    } else {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    }
    setVideos(updated.map((v, idx) => ({ ...v, order: idx })))
  }

  // Gestion des documents
  const addDocument = () => {
    setDocuments([...documents, {
      url: '',
      title: '',
      description: '',
      type: 'other',
      order: documents.length,
    }])
  }

  const updateDocument = (index: number, field: keyof CountryDocument, value: string | undefined) => {
    const updated = [...documents]
    ;(updated[index] as any)[field] = value
    setDocuments(updated)
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const moveDocument = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === documents.length - 1) return
    
    const updated = [...documents]
    if (direction === 'up') {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]]
    } else {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    }
    setDocuments(updated.map((d, idx) => ({ ...d, order: idx })))
  }

  const handleInitializeCountries = async () => {
    const accepted = await confirm({
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
      fetchCountries() // Recharger la liste
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'initialisation'
      showError(errorMessage)
    } finally {
      setInitializing(false)
    }
  }

  const getFlagUrl = (countryId: string) => {
    const codeMap: Record<string, string> = { 'EH': 'eh' }
    const code = codeMap[countryId] || countryId.toLowerCase()
    return `https://flagcdn.com/w80/${code}.png`
  }

  const hasText = (value?: string) => Boolean(value && value.trim().length > 0)
  const completionItems = [
    {
      label: 'Base',
      done: hasText(formData.id) && hasText(formData.nameFr) && hasText(formData.capital) && hasText(formData.description),
    },
    {
      label: 'Culture',
      done: hasText(formData.culture) || hasText(formData.foods) || hasText(formData.arts) || hasText(formData.festivals),
    },
    {
      label: 'Découverte',
      done: hasText(formData.discoveryIntro) || hasText(formData.placesToDiscover) || hasText(formData.experiences),
    },
    {
      label: 'Transmission',
      done: hasText(formData.oneSentenceSummary) || hasText(formData.keyFacts) || hasText(formData.knowledgeToPreserve),
    },
    {
      label: 'Pratique',
      done: hasText(formData.climate) || hasText(formData.bestTimeToVisit) || hasText(formData.visaNote) || hasText(formData.healthAdvice),
    },
    {
      label: 'Médias',
      done: images.length + pdfs.length + videos.length + documents.length > 0,
    },
    {
      label: 'Sources',
      done: hasText(formData.sourceNotes),
    },
  ]
  const completionScore = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100)

  if (loading) {
    return <div className="admin-loading">Chargement des pays...</div>
  }

  return (
    <div className="admin-countries">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des Pays</h2>
          <p>Gérez les informations des 54 pays africains</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {countries.length === 0 && (
            <Button 
              onClick={handleInitializeCountries}
              disabled={initializing}
              variant="secondary"
            >
              <Database size={20} />
              {initializing ? 'Initialisation...' : 'Initialiser tous les pays'}
            </Button>
          )}
          <Button onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}>
            <Plus size={20} />
            {showForm ? 'Annuler' : 'Nouveau Pays'}
          </Button>
        </div>
      </div>

      <div className="countries-search-bar">
        <Search size={20} />
        <Input
          id="country-search"
          name="country-search"
          placeholder="Rechercher un pays, une capitale ou un code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <Card className="country-form-card">
          <div className="country-form-header">
            <div>
              <span className="form-eyebrow">Fiche éditoriale</span>
              <h3>{editingCountry ? `Modifier ${editingCountry.nameFr}` : 'Nouveau pays'}</h3>
              <p>Avancez section par section. Les champs MonBaobab complètent la page publique sans remplacer les données officielles.</p>
            </div>
            <div className="completion-meter" aria-label={`Complétion ${completionScore}%`}>
              <strong>{completionScore}%</strong>
              <span>complété</span>
              <div className="completion-track">
                <i style={{ width: `${completionScore}%` }} />
              </div>
            </div>
          </div>

          <div className="completion-chips" aria-label="État des sections">
            {completionItems.map((item) => (
              <span className={item.done ? 'done' : ''} key={item.label}>
                {item.label}
              </span>
            ))}
          </div>
          
          {/* Onglets */}
          <div className="form-tabs">
            <button
              type="button"
              className={`form-tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Informations de base
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'discovery' ? 'active' : ''}`}
              onClick={() => setActiveTab('discovery')}
            >
              Découverte 2026
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              Sections personnalisées
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Images ({images.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'pdfs' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdfs')}
            >
              PDFs ({pdfs.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Vidéos ({videos.length})
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({documents.length})
            </button>
          </div>

          <form onSubmit={handleSubmit} className="country-form">
            {/* Contenu des onglets */}
            {activeTab === 'basic' && (
              <>
                <div className="form-row">
                  <Input
                    label="Code pays (ex: MA, SN)"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                    required
                    placeholder="MA"
                    disabled={!!editingCountry}
                  />
                  <Input
                    label="Nom français"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    required
                    placeholder="Maroc"
                  />
                </div>
                <Input
                  label="Nom anglais"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morocco"
                />
                <Input
                  label="Capitale"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  required
                />
                <div className="form-row">
                  <Input
                    label="Population"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    placeholder="37M"
                  />
                  <Input
                    label="Superficie"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="447K km²"
                  />
                </div>
                <div className="form-row">
                  <Input
                    label="Langues (séparées par des virgules)"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="Arabe, Amazigh"
                  />
                  <Input
                    label="Monnaie"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="Dirham"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-description" className="input-label">Description</label>
                  <textarea
                    id="country-description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-culture" className="input-label">Culture</label>
                  <textarea
                    id="country-culture"
                    name="culture"
                    className="form-textarea"
                    value={formData.culture}
                    onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-rites" className="input-label">Rites (séparés par des point-virgules)</label>
                  <textarea
                    id="country-rites"
                    name="rites"
                    className="form-textarea"
                    value={formData.rites}
                    onChange={(e) => setFormData({ ...formData, rites: e.target.value })}
                    rows={2}
                    placeholder="Cérémonie du thé; Mariages traditionnels"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-customs" className="input-label">Coutumes (séparées par des point-virgules)</label>
                  <textarea
                    id="country-customs"
                    name="customs"
                    className="form-textarea"
                    value={formData.customs}
                    onChange={(e) => setFormData({ ...formData, customs: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-foods" className="input-label">Spécialités culinaires (séparées par des point-virgules)</label>
                  <textarea
                    id="country-foods"
                    name="foods"
                    className="form-textarea"
                    value={formData.foods}
                    onChange={(e) => setFormData({ ...formData, foods: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-festivals" className="input-label">Festivals (séparés par des point-virgules)</label>
                  <textarea
                    id="country-festivals"
                    name="festivals"
                    className="form-textarea"
                    value={formData.festivals}
                    onChange={(e) => setFormData({ ...formData, festivals: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country-arts" className="input-label">Arts & Artisanat (séparés par des point-virgules)</label>
                  <textarea
                    id="country-arts"
                    name="arts"
                    className="form-textarea"
                    value={formData.arts}
                    onChange={(e) => setFormData({ ...formData, arts: e.target.value })}
                    rows={2}
                  />
                </div>
                <Input
                  label="Couleur (hex)"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </>
            )}

            {activeTab === 'discovery' && (
              <div className="tab-content discovery-admin-content">
                <div className="section-header-tab">
                  <div>
                    <h4>Fiche découverte du pays</h4>
                    <p className="empty-message">Ajoutez ici les repères à jour, les conseils pratiques et les éléments qui donnent envie d'explorer le pays.</p>
                  </div>
                </div>

                <div className="form-row">
                  <Input
                    label="Nom officiel"
                    value={formData.officialName}
                    onChange={(e) => setFormData({ ...formData, officialName: e.target.value })}
                    placeholder="République du Sénégal"
                  />
                  <Input
                    label="Mise à jour"
                    value={formData.lastUpdated}
                    onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                    placeholder="2026"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country-discovery-intro" className="input-label">Introduction immersive</label>
                  <textarea
                    id="country-discovery-intro"
                    name="discoveryIntro"
                    className="form-textarea"
                    value={formData.discoveryIntro}
                    onChange={(e) => setFormData({ ...formData, discoveryIntro: e.target.value })}
                    rows={4}
                    placeholder="Une entrée courte, sensorielle et concrète pour présenter le pays."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country-one-sentence" className="input-label">Ce pays en une phrase</label>
                  <textarea
                    id="country-one-sentence"
                    className="form-textarea"
                    value={formData.oneSentenceSummary}
                    onChange={(e) => setFormData({ ...formData, oneSentenceSummary: e.target.value })}
                    rows={2}
                    placeholder="Une phrase humaine, précise, qui donne le ton de la fiche."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-key-facts" className="input-label">À retenir avant d'explorer</label>
                    <textarea id="country-key-facts" className="form-textarea" value={formData.keyFacts} onChange={(e) => setFormData({ ...formData, keyFacts: e.target.value })} rows={3} placeholder="Ville clé; Tradition forte; Langue à connaître" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-related-themes" className="input-label">Thèmes reliés</label>
                    <textarea id="country-related-themes" className="form-textarea" value={formData.relatedThemes} onChange={(e) => setFormData({ ...formData, relatedThemes: e.target.value })} rows={3} placeholder="Textile; Oralité; Royaumes; Ports; Sahel" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-peoples" className="input-label">Peuples et identités</label>
                    <textarea id="country-peoples" className="form-textarea" value={formData.peoples} onChange={(e) => setFormData({ ...formData, peoples: e.target.value })} rows={3} placeholder="Groupes, communautés, zones culturelles; séparés par des point-virgules" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-language-notes" className="input-label">Notes sur les langues</label>
                    <textarea id="country-language-notes" className="form-textarea" value={formData.languageNotes} onChange={(e) => setFormData({ ...formData, languageNotes: e.target.value })} rows={3} placeholder="Langues officielles, langues nationales, usages de salutation..." />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-history-highlights" className="input-label">Mémoire historique</label>
                    <textarea id="country-history-highlights" className="form-textarea" value={formData.historyHighlights} onChange={(e) => setFormData({ ...formData, historyHighlights: e.target.value })} rows={3} placeholder="Royaumes; période coloniale; indépendance; dates récentes" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-notable-figures" className="input-label">Personnages à relier</label>
                    <textarea id="country-notable-figures" className="form-textarea" value={formData.notableFigures} onChange={(e) => setFormData({ ...formData, notableFigures: e.target.value })} rows={3} placeholder="Nom - rôle; Nom - rôle" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-music-arts" className="input-label">Arts, sons et gestes</label>
                    <textarea id="country-music-arts" className="form-textarea" value={formData.musicAndArts} onChange={(e) => setFormData({ ...formData, musicAndArts: e.target.value })} rows={3} placeholder="Musique; danse; textile; instruments; architecture" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-food-culture" className="input-label">Cuisine et quotidien</label>
                    <textarea id="country-food-culture" className="form-textarea" value={formData.foodCulture} onChange={(e) => setFormData({ ...formData, foodCulture: e.target.value })} rows={3} placeholder="Plat emblématique; boisson; marché; moment social" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-oral-traditions" className="input-label">Oralité et récits</label>
                    <textarea id="country-oral-traditions" className="form-textarea" value={formData.oralTraditions} onChange={(e) => setFormData({ ...formData, oralTraditions: e.target.value })} rows={3} placeholder="Contes; proverbes; récits familiaux; rites de parole" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-knowledge-preserve" className="input-label">Savoirs à préserver</label>
                    <textarea id="country-knowledge-preserve" className="form-textarea" value={formData.knowledgeToPreserve} onChange={(e) => setFormData({ ...formData, knowledgeToPreserve: e.target.value })} rows={3} placeholder="Métiers; langues; gestes; archives orales; techniques artisanales" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="country-recommended-paths" className="input-label">Parcours conseillés</label>
                  <textarea
                    id="country-recommended-paths"
                    className="form-textarea"
                    value={formData.recommendedPaths}
                    onChange={(e) => setFormData({ ...formData, recommendedPaths: e.target.value })}
                    rows={4}
                    placeholder="Découverte rapide | Commencer par la capitale et les repères clés | Capitale, cuisine, carte&#10;Mémoire | Relier dates, figures et lieux | Indépendance, musée, proverbes"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country-source-quality" className="input-label">Niveau éditorial</label>
                  <select
                    id="country-source-quality"
                    className="form-select"
                    value={formData.sourceQuality}
                    onChange={(e) => setFormData({ ...formData, sourceQuality: e.target.value })}
                  >
                    <option value="draft">À compléter</option>
                    <option value="community">Communauté</option>
                    <option value="verified">Vérifié</option>
                    <option value="official">Officiel</option>
                  </select>
                </div>

                <div className="form-row">
                  <Input label="Région" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} placeholder="Afrique de l'Ouest" />
                  <Input label="Sous-région" value={formData.subregion} onChange={(e) => setFormData({ ...formData, subregion: e.target.value })} placeholder="Sahel, Golfe de Guinée..." />
                </div>
                <div className="form-row">
                  <Input label="Gentilé" value={formData.demonym} onChange={(e) => setFormData({ ...formData, demonym: e.target.value })} placeholder="Sénégalais, Sénégalaise" />
                  <Input label="Date d'indépendance" value={formData.independenceDate} onChange={(e) => setFormData({ ...formData, independenceDate: e.target.value })} placeholder="4 avril 1960" />
                </div>
                <div className="form-row">
                  <Input label="Régime / institutions" value={formData.governmentType} onChange={(e) => setFormData({ ...formData, governmentType: e.target.value })} placeholder="République..." />
                  <Input label="Économie en bref" value={formData.economicOverview} onChange={(e) => setFormData({ ...formData, economicOverview: e.target.value })} placeholder="Services, agriculture, mines..." />
                </div>
                <div className="form-row">
                  <Input label="Fuseau horaire" value={formData.timeZone} onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })} placeholder="UTC+0" />
                  <Input label="Indicatif" value={formData.callingCode} onChange={(e) => setFormData({ ...formData, callingCode: e.target.value })} placeholder="+221" />
                </div>
                <div className="form-row">
                  <Input label="Domaine internet" value={formData.internetTld} onChange={(e) => setFormData({ ...formData, internetTld: e.target.value })} placeholder=".sn" />
                  <Input label="Conduite" value={formData.drivingSide} onChange={(e) => setFormData({ ...formData, drivingSide: e.target.value })} placeholder="À droite" />
                </div>

                <div className="form-group">
                  <label htmlFor="country-climate" className="input-label">Climat</label>
                  <textarea id="country-climate" className="form-textarea" value={formData.climate} onChange={(e) => setFormData({ ...formData, climate: e.target.value })} rows={2} />
                </div>
                <div className="form-group">
                  <label htmlFor="country-best-time" className="input-label">Meilleure période</label>
                  <textarea id="country-best-time" className="form-textarea" value={formData.bestTimeToVisit} onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })} rows={2} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-visa" className="input-label">Visa / entrée</label>
                    <textarea id="country-visa" className="form-textarea" value={formData.visaNote} onChange={(e) => setFormData({ ...formData, visaNote: e.target.value })} rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-health" className="input-label">Santé</label>
                    <textarea id="country-health" className="form-textarea" value={formData.healthAdvice} onChange={(e) => setFormData({ ...formData, healthAdvice: e.target.value })} rows={3} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country-etiquette" className="input-label">Codes sociaux</label>
                    <textarea id="country-etiquette" className="form-textarea" value={formData.etiquette} onChange={(e) => setFormData({ ...formData, etiquette: e.target.value })} rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country-safety" className="input-label">Note sécurité</label>
                    <textarea id="country-safety" className="form-textarea" value={formData.safetyNote} onChange={(e) => setFormData({ ...formData, safetyNote: e.target.value })} rows={3} />
                  </div>
                </div>

                <div className="form-row">
                  <Input label="Transport" value={formData.transport} onChange={(e) => setFormData({ ...formData, transport: e.target.value })} placeholder="Aéroports, train, routes, taxis..." />
                  <Input label="Connexion" value={formData.connectivity} onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })} placeholder="Réseaux mobiles, internet..." />
                </div>
                <Input label="Numéros utiles" value={formData.emergencyNumbers} onChange={(e) => setFormData({ ...formData, emergencyNumbers: e.target.value })} placeholder="Police, pompiers, urgences..." />

                <div className="form-group">
                  <label htmlFor="country-places" className="input-label">Lieux à découvrir (séparés par des point-virgules)</label>
                  <textarea id="country-places" className="form-textarea" value={formData.placesToDiscover} onChange={(e) => setFormData({ ...formData, placesToDiscover: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label htmlFor="country-experiences" className="input-label">Expériences à vivre (séparées par des point-virgules)</label>
                  <textarea id="country-experiences" className="form-textarea" value={formData.experiences} onChange={(e) => setFormData({ ...formData, experiences: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label htmlFor="country-practical" className="input-label">Conseils pratiques (séparés par des point-virgules)</label>
                  <textarea id="country-practical" className="form-textarea" value={formData.practicalTips} onChange={(e) => setFormData({ ...formData, practicalTips: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label htmlFor="country-sources" className="input-label">Sources et notes de vérification (séparées par des point-virgules)</label>
                  <textarea id="country-sources" className="form-textarea" value={formData.sourceNotes} onChange={(e) => setFormData({ ...formData, sourceNotes: e.target.value })} rows={3} placeholder="Ex: Données population Banque mondiale 2026; Formalités à confirmer avant voyage" />
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="tab-content">
                <div className="section-header-tab">
                  <h4>Sections personnalisées</h4>
                  <Button type="button" onClick={addCustomSection} size="small">
                    <Plus size={16} />
                    Ajouter une section
                  </Button>
                </div>
                {customSections.length === 0 ? (
                  <p className="empty-message">Aucune section personnalisée. Ajoutez-en une pour enrichir la page du pays.</p>
                ) : (
                  <div className="sections-list">
                    {customSections.map((section, index) => (
                      <Card key={index} className="section-item-card">
                        <div className="section-item-header">
                          <Input
                            label="Titre de la section"
                            value={section.title}
                            onChange={(e) => updateCustomSection(index, 'title', e.target.value)}
                            placeholder="Ex: Histoire du pays"
                            required
                          />
                          <div className="section-item-controls">
                            <button
                              type="button"
                              onClick={() => moveCustomSection(index, 'up')}
                              disabled={index === 0}
                              className="move-btn"
                              title="Déplacer vers le haut"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveCustomSection(index, 'down')}
                              disabled={index === customSections.length - 1}
                              className="move-btn"
                              title="Déplacer vers le bas"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomSection(index)}
                              className="remove-btn"
                              title="Supprimer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`section-type-${index}`} className="input-label">Type de contenu</label>
                          <select
                            id={`section-type-${index}`}
                            name={`section-type-${index}`}
                            className="form-select"
                            value={section.type}
                            onChange={(e) => updateCustomSection(index, 'type', e.target.value as 'text' | 'html' | 'list')}
                          >
                            <option value="text">Texte simple</option>
                            <option value="html">HTML</option>
                            <option value="list">Liste</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor={`section-content-${index}`} className="input-label">Contenu</label>
                          <textarea
                            id={`section-content-${index}`}
                            name={`section-content-${index}`}
                            className="form-textarea"
                            value={section.content}
                            onChange={(e) => updateCustomSection(index, 'content', e.target.value)}
                            rows={section.type === 'list' ? 6 : 4}
                            placeholder={section.type === 'list' ? 'Une ligne par élément de la liste' : 'Contenu de la section...'}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="tab-content">
                <div className="section-header-tab">
                  <h4>Galerie d'images</h4>
                  <Button type="button" onClick={addImage} size="small">
                    <ImageIcon size={16} />
                    Ajouter une image
                  </Button>
                </div>
                {images.length === 0 ? (
                  <p className="empty-message">Aucune image. Ajoutez des images pour enrichir la galerie du pays.</p>
                ) : (
                  <div className="images-list">
                    {images.map((image, index) => (
                      <Card key={index} className="image-item-card">
                        <div className="image-item-header">
                          <h5>Image {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="remove-btn"
                            title="Supprimer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="upload-mode-selector">
                          <button
                            type="button"
                            className={`mode-btn ${(uploadMode[`image-${index}`] || 'upload') === 'upload' ? 'active' : ''}`}
                            onClick={() => setUploadMode({ ...uploadMode, [`image-${index}`]: 'upload' })}
                          >
                            <ImageIcon size={16} />
                            Upload depuis votre ordinateur
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${uploadMode[`image-${index}`] === 'url' ? 'active' : ''}`}
                            onClick={() => setUploadMode({ ...uploadMode, [`image-${index}`]: 'url' })}
                          >
                            <LinkIcon size={16} />
                            Lien URL (Drive, Dropbox, etc.)
                          </button>
                        </div>
                        
                        {(uploadMode[`image-${index}`] || 'upload') === 'upload' ? (
                          <FileUpload
                            type="image"
                            onUploadSuccess={(url) => updateImage(index, 'url', url)}
                            label="Upload d'image"
                          />
                        ) : (
                          <Input
                            label="URL de l'image"
                            value={image.url}
                            onChange={(e) => updateImage(index, 'url', e.target.value)}
                            placeholder="https://exemple.com/image.jpg ou lien Google Drive/Dropbox"
                            required
                          />
                        )}
                        <Input
                          label="Légende (optionnel)"
                          value={image.caption}
                          onChange={(e) => updateImage(index, 'caption', e.target.value)}
                          placeholder="Description de l'image"
                        />
                        {image.url && (
                          <div className="image-preview">
                            <img src={image.url} alt="Aperçu" onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }} />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pdfs' && (
              <div className="tab-content">
                <div className="section-header-tab">
                  <h4>Documents PDF</h4>
                  <Button type="button" onClick={addPDF} size="small">
                    <FileText size={16} />
                    Ajouter un PDF
                  </Button>
                </div>
                {pdfs.length === 0 ? (
                  <p className="empty-message">Aucun document PDF. Ajoutez des documents pour enrichir les ressources du pays.</p>
                ) : (
                  <div className="pdfs-list-admin">
                    {pdfs.map((pdf, index) => (
                      <Card key={index} className="pdf-item-card">
                        <div className="pdf-item-header">
                          <h5>Document {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removePDF(index)}
                            className="remove-btn"
                            title="Supprimer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <Input
                          label="Titre du document"
                          value={pdf.title}
                          onChange={(e) => updatePDF(index, 'title', e.target.value)}
                          placeholder="Ex: Guide touristique"
                          required
                        />
                        <div className="upload-mode-selector">
                          <button
                            type="button"
                            className={`mode-btn ${(uploadMode[`pdf-${index}`] || 'upload') === 'upload' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setUploadMode({ ...uploadMode, [`pdf-${index}`]: 'upload' })
                            }}
                          >
                            <FileText size={16} />
                            Upload depuis votre ordinateur
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${uploadMode[`pdf-${index}`] === 'url' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setUploadMode({ ...uploadMode, [`pdf-${index}`]: 'url' })
                            }}
                          >
                            <LinkIcon size={16} />
                            Lien URL (Drive, Dropbox, etc.)
                          </button>
                        </div>
                        
                        {(uploadMode[`pdf-${index}`] || 'upload') === 'upload' ? (
                          <FileUpload
                            type="pdf"
                            onUploadSuccess={(url) => {
                              console.log('Callback onUploadSuccess appelé avec URL:', url)
                              updatePDF(index, 'url', url)
                            }}
                            label="Upload de PDF"
                          />
                        ) : (
                          <Input
                            label="URL du PDF"
                            value={pdf.url}
                            onChange={(e) => updatePDF(index, 'url', e.target.value)}
                            placeholder="https://exemple.com/document.pdf ou lien Google Drive/Dropbox"
                            required
                          />
                        )}
                        <div className="form-group">
                          <label htmlFor={`pdf-description-${index}`} className="input-label">Description (optionnel)</label>
                          <textarea
                            id={`pdf-description-${index}`}
                            name={`pdf-description-${index}`}
                            className="form-textarea"
                            value={pdf.description}
                            onChange={(e) => updatePDF(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Description du document..."
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="tab-content">
                <div className="section-header-tab">
                  <h4>Vidéos</h4>
                  <Button type="button" onClick={addVideo} size="small">
                    <Video size={16} />
                    Ajouter une vidéo
                  </Button>
                </div>
                {videos.length === 0 ? (
                  <p className="empty-message">Aucune vidéo. Ajoutez des vidéos pour enrichir le contenu du pays.</p>
                ) : (
                  <div className="videos-list-admin">
                    {videos.map((video, index) => (
                      <Card key={index} className="video-item-card">
                        <div className="video-item-header">
                          <h5>Vidéo {index + 1}</h5>
                          <div className="item-controls">
                            <button
                              type="button"
                              onClick={() => moveVideo(index, 'up')}
                              disabled={index === 0}
                              className="move-btn"
                              title="Déplacer vers le haut"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVideo(index, 'down')}
                              disabled={index === videos.length - 1}
                              className="move-btn"
                              title="Déplacer vers le bas"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="remove-btn"
                              title="Supprimer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <Input
                          label="Titre de la vidéo"
                          value={video.title}
                          onChange={(e) => updateVideo(index, 'title', e.target.value)}
                          placeholder="Ex: Présentation du pays"
                          required
                        />
                        <div className="form-group">
                          <label htmlFor={`video-type-${index}`} className="input-label">Type de vidéo</label>
                          <select
                            id={`video-type-${index}`}
                            name={`video-type-${index}`}
                            className="form-select"
                            value={video.type || 'direct'}
                            onChange={(e) => updateVideo(index, 'type', e.target.value as CountryVideo['type'])}
                          >
                            <option value="direct">URL directe</option>
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                        <Input
                          label="URL de la vidéo"
                          value={video.url}
                          onChange={(e) => updateVideo(index, 'url', e.target.value)}
                          placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                          required
                        />
                        <Input
                          label="URL de la miniature (optionnel)"
                          value={video.thumbnail || ''}
                          onChange={(e) => updateVideo(index, 'thumbnail', e.target.value)}
                          placeholder="https://exemple.com/thumbnail.jpg"
                        />
                        <div className="form-group">
                          <label htmlFor={`video-description-${index}`} className="input-label">Description (optionnel)</label>
                          <textarea
                            id={`video-description-${index}`}
                            name={`video-description-${index}`}
                            className="form-textarea"
                            value={video.description || ''}
                            onChange={(e) => updateVideo(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Description de la vidéo..."
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-content">
                <div className="section-header-tab">
                  <h4>Documents (DOCX, XLSX, etc.)</h4>
                  <Button type="button" onClick={addDocument} size="small">
                    <FileIcon size={16} />
                    Ajouter un document
                  </Button>
                </div>
                {documents.length === 0 ? (
                  <p className="empty-message">Aucun document. Ajoutez des documents pour enrichir les ressources du pays.</p>
                ) : (
                  <div className="documents-list-admin">
                    {documents.map((document, index) => (
                      <Card key={index} className="document-item-card">
                        <div className="document-item-header">
                          <h5>Document {index + 1}</h5>
                          <div className="item-controls">
                            <button
                              type="button"
                              onClick={() => moveDocument(index, 'up')}
                              disabled={index === 0}
                              className="move-btn"
                              title="Déplacer vers le haut"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDocument(index, 'down')}
                              disabled={index === documents.length - 1}
                              className="move-btn"
                              title="Déplacer vers le bas"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="remove-btn"
                              title="Supprimer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <Input
                          label="Titre du document"
                          value={document.title}
                          onChange={(e) => updateDocument(index, 'title', e.target.value)}
                          placeholder="Ex: Rapport économique"
                          required
                        />
                        <div className="form-group">
                          <label htmlFor={`document-type-${index}`} className="input-label">Type de document</label>
                          <select
                            id={`document-type-${index}`}
                            name={`document-type-${index}`}
                            className="form-select"
                            value={document.type || 'other'}
                            onChange={(e) => updateDocument(index, 'type', e.target.value as CountryDocument['type'])}
                          >
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
                        <Input
                          label="URL du document"
                          value={document.url}
                          onChange={(e) => updateDocument(index, 'url', e.target.value)}
                          placeholder="https://exemple.com/document.docx ou lien Google Drive/Dropbox"
                          required
                        />
                        <div className="form-group">
                          <label htmlFor={`document-description-${index}`} className="input-label">Description (optionnel)</label>
                          <textarea
                            id={`document-description-${index}`}
                            name={`document-description-${index}`}
                            className="form-textarea"
                            value={document.description || ''}
                            onChange={(e) => updateDocument(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Description du document..."
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <Button type="submit">
                {editingCountry ? 'Mettre à jour' : 'Créer le pays'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="countries-grid-admin">
        {filteredCountries.length === 0 ? (
          <Card className="empty-state">
            <Globe2 size={48} />
            <p>Aucun pays trouvé.</p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')} variant="outline" size="small">
                Effacer la recherche
              </Button>
            )}
          </Card>
        ) : (
          filteredCountries.map((country) => (
            <Card key={country._id || country.id} className="country-card-admin">
              <div className="country-card-header-admin">
                <div className="country-flag-small-admin">
                  <img 
                    src={getFlagUrl(country.id)} 
                    alt={`Drapeau de ${country.nameFr}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.style.backgroundColor = country.color
                    }}
                  />
                </div>
                <div className="country-title-group">
                  <h4>{country.nameFr}</h4>
                  <span className="country-code">{country.id}</span>
                </div>
                <div className="country-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => navigate(`/country/${country.id}`)}
                    title="Voir la page publique"
                  >
                    <Globe size={16} />
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(country)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleDelete(country._id || country.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="country-info-admin">
                <div className="info-item-admin">
                  <MapPin size={16} />
                  <span><strong>Capitale:</strong> {country.capital}</span>
                </div>
                <div className="info-item-admin">
                  <Users size={16} />
                  <span><strong>Population:</strong> {country.population}</span>
                </div>
                <div className="info-item-admin">
                  <Globe2 size={16} />
                  <span><strong>Superficie:</strong> {country.area}</span>
                </div>
              </div>
              <p className="country-description-admin">{country.description}</p>
            </Card>
          ))
        )}
      </div>
      {Dialog}
    </div>
  )
}
