import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, Globe, Calendar, UtensilsCrossed, Sparkles, Music, Palette, Image as ImageIcon, FileText, X, Video, File } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import { DocumentViewer } from '../components/MediaViewer/DocumentViewer'
import { CountryImmersive } from '../components/Country/CountryImmersive'
import { countryService } from '../services/api'
import { getCountryById as getStaticCountryById } from '../data/allAfricanCountries'
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
  color: string
  rites?: string[]
  customs?: string[]
  foods?: string[]
  traditions?: string[]
  festivals?: string[]
  arts?: string[]
  customSections?: CustomSection[]
  images?: CountryImage[]
  pdfs?: CountryPDF[]
  videos?: CountryVideo[]
  documents?: CountryDocument[]
}

export const CountryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
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
          setCountry(response.data)
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
        setCountry({
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
          color: staticCountry.color,
          rites: staticCountry.rites,
          customs: staticCountry.customs,
          foods: staticCountry.foods,
          traditions: staticCountry.traditions,
          festivals: staticCountry.festivals,
          arts: staticCountry.arts,
          customSections: [],
          images: [],
          pdfs: [],
        })
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
          setCountry({
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
            color: staticCountry.color,
            rites: staticCountry.rites,
            customs: staticCountry.customs,
            foods: staticCountry.foods,
            traditions: staticCountry.traditions,
            festivals: staticCountry.festivals,
            arts: staticCountry.arts,
            customSections: [],
            images: [],
            pdfs: [],
          })
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
        <div className="country-detail-loading">
          <p>Chargement...</p>
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

  return (
    <Layout>
      <div className="country-detail-page">
        {/* Header avec drapeau */}
        <div className="country-detail-hero">
          <Link to="/" className="back-button">
            <ArrowLeft size={20} />
            Retour
          </Link>
          <div className="country-hero-content">
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
            <div className="country-hero-info">
              <h1>{country.nameFr}</h1>
              <p className="country-subtitle">{country.description}</p>
              <div className="country-basic-info">
                <div className="info-badge">
                  <MapPin size={18} />
                  <span>{country.capital}</span>
                </div>
                <div className="info-badge">
                  <Users size={18} />
                  <span>{country.population}</span>
                </div>
                <div className="info-badge">
                  <Globe size={18} />
                  <span>{country.area}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expérience Immersive - Contenu lié au pays */}
        <CountryImmersive countryId={country.id} country={country} />

        {/* Section Culture & Traditions */}
        {country.culture && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Sparkles className="section-icon" size={32} />
              <h2>Culture & Traditions</h2>
            </div>
            <Card className="culture-card-detailed">
              <p>{country.culture}</p>
            </Card>
          </section>
        )}

        {/* Sections personnalisées dynamiques */}
        {sortedCustomSections.map((section, index) => (
          <section key={index} className="country-section">
            <div className="section-header-detailed">
              <Sparkles className="section-icon" size={32} />
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

        {/* Galerie d'images */}
        {sortedImages.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <ImageIcon className="section-icon" size={32} />
              <h2>Galerie d'images</h2>
            </div>
            <div className="images-gallery">
              {sortedImages.map((image, index) => (
                <Card 
                  key={index} 
                  className="image-gallery-item"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <div className="gallery-image-wrapper">
                    <img src={image.url} alt={image.caption || `Image ${index + 1}`} />
                    {image.caption && (
                      <div className="gallery-image-caption">{image.caption}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Documents PDF */}
        {sortedPDFs.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <FileText className="section-icon" size={32} />
              <h2>Documents PDF</h2>
            </div>
            <div className="media-grid">
              {sortedPDFs.map((pdf, index) => (
                <Card 
                  key={index} 
                  className="media-card"
                  onClick={() => setSelectedPDF(pdf)}
                >
                  <div className="media-card-icon">
                    <FileText size={32} />
                  </div>
                  <div className="media-card-content">
                    <h3>{pdf.title}</h3>
                    {pdf.description && <p>{pdf.description}</p>}
                  </div>
                  <div className="media-card-action">
                    <Button variant="outline" size="small">
                      Voir le document
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Vidéos */}
        {sortedVideos.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Video className="section-icon" size={32} />
              <h2>Vidéos</h2>
            </div>
            <div className="media-grid">
              {sortedVideos.map((video, index) => (
                <Card 
                  key={index} 
                  className="media-card video-card"
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.thumbnail ? (
                    <div className="media-card-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-play-overlay">
                        <Video size={48} />
                      </div>
                    </div>
                  ) : (
                    <div className="media-card-icon">
                      <Video size={32} />
                    </div>
                  )}
                  <div className="media-card-content">
                    <h3>{video.title}</h3>
                    {video.description && <p>{video.description}</p>}
                  </div>
                  <div className="media-card-action">
                    <Button variant="outline" size="small">
                      Regarder
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Documents (DOCX, etc.) */}
        {sortedDocuments.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <File className="section-icon" size={32} />
              <h2>Documents</h2>
            </div>
            <div className="media-grid">
              {sortedDocuments.map((document, index) => (
                <Card 
                  key={index} 
                  className="media-card"
                  onClick={() => setSelectedDocument(document)}
                >
                  <div className="media-card-icon">
                    <File size={32} />
                  </div>
                  <div className="media-card-content">
                    <h3>{document.title}</h3>
                    {document.description && <p>{document.description}</p>}
                    {document.type && (
                      <span className="document-type-badge">{document.type.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="media-card-action">
                    <Button variant="outline" size="small">
                      Ouvrir
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Rites */}
        {country.rites && country.rites.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Sparkles className="section-icon" size={32} />
              <h2>Rites & Cérémonies</h2>
            </div>
            <div className="items-grid">
              {country.rites.map((rite, index) => (
                <Card key={index} className="item-card">
                  <div className="item-icon">
                    <Sparkles size={24} />
                  </div>
                  <p>{rite}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Coutumes */}
        {country.customs && country.customs.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Music className="section-icon" size={32} />
              <h2>Coutumes & Traditions</h2>
            </div>
            <div className="items-grid">
              {country.customs.map((custom, index) => (
                <Card key={index} className="item-card">
                  <div className="item-icon">
                    <Music size={24} />
                  </div>
                  <p>{custom}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Nourritures */}
        {country.foods && country.foods.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <UtensilsCrossed className="section-icon" size={32} />
              <h2>Gastronomie & Spécialités</h2>
            </div>
            <div className="items-grid">
              {country.foods.map((food, index) => (
                <Card key={index} className="item-card">
                  <div className="item-icon">
                    <UtensilsCrossed size={24} />
                  </div>
                  <p>{food}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Festivals */}
        {country.festivals && country.festivals.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Calendar className="section-icon" size={32} />
              <h2>Festivals & Célébrations</h2>
            </div>
            <div className="items-grid">
              {country.festivals.map((festival, index) => (
                <Card key={index} className="item-card">
                  <div className="item-icon">
                    <Calendar size={24} />
                  </div>
                  <p>{festival}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Arts */}
        {country.arts && country.arts.length > 0 && (
          <section className="country-section">
            <div className="section-header-detailed">
              <Palette className="section-icon" size={32} />
              <h2>Arts & Artisanat</h2>
            </div>
            <div className="items-grid">
              {country.arts.map((art, index) => (
                <Card key={index} className="item-card">
                  <div className="item-icon">
                    <Palette size={24} />
                  </div>
                  <p>{art}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section Informations Générales */}
        <section className="country-section">
          <div className="section-header-detailed">
            <Globe className="section-icon" size={32} />
            <h2>Informations Générales</h2>
          </div>
          <Card className="info-card-detailed">
            {country.languages && country.languages.length > 0 && (
              <div className="info-row-detailed">
                <span className="info-label">Langues</span>
                <span className="info-value">{country.languages.join(', ')}</span>
              </div>
            )}
            {country.currency && (
              <div className="info-row-detailed">
                <span className="info-label">Monnaie</span>
                <span className="info-value">{country.currency}</span>
              </div>
            )}
            <div className="info-row-detailed">
              <span className="info-label">Capitale</span>
              <span className="info-value">{country.capital}</span>
            </div>
            {country.population && (
              <div className="info-row-detailed">
                <span className="info-label">Population</span>
                <span className="info-value">{country.population}</span>
              </div>
            )}
            {country.area && (
              <div className="info-row-detailed">
                <span className="info-label">Superficie</span>
                <span className="info-value">{country.area}</span>
              </div>
            )}
          </Card>
        </section>

        {/* Bouton retour */}
        <div className="country-detail-footer">
          <Link to="/">
            <Button variant="outline" size="large">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal pour afficher l'image en grand */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
              <X size={24} />
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
                <FileText size={48} />
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
