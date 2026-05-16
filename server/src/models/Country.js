import mongoose from 'mongoose'

const countrySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  nameFr: {
    type: String,
    required: true,
    index: true,
  },
  capital: {
    type: String,
    required: true,
  },
  population: {
    type: String,
    default: '',
  },
  area: {
    type: String,
    default: '',
  },
  languages: [{
    type: String,
    default: [],
  }],
  currency: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  culture: {
    type: String,
    default: '',
  },
  oneSentenceSummary: {
    type: String,
    default: '',
  },
  keyFacts: [{
    type: String,
    default: [],
  }],
  peoples: [{
    type: String,
    default: [],
  }],
  languageNotes: {
    type: String,
    default: '',
  },
  historyHighlights: [{
    type: String,
    default: [],
  }],
  notableFigures: [{
    type: String,
    default: [],
  }],
  musicAndArts: [{
    type: String,
    default: [],
  }],
  foodCulture: [{
    type: String,
    default: [],
  }],
  oralTraditions: [{
    type: String,
    default: [],
  }],
  knowledgeToPreserve: [{
    type: String,
    default: [],
  }],
  recommendedPaths: [{
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    items: [{
      type: String,
      default: [],
    }],
  }],
  relatedThemes: [{
    type: String,
    default: [],
  }],
  sourceQuality: {
    type: String,
    enum: ['draft', 'community', 'verified', 'official'],
    default: 'draft',
  },
  discoveryIntro: {
    type: String,
    default: '',
  },
  lastUpdated: {
    type: String,
    default: '2026',
  },
  officialName: {
    type: String,
    default: '',
  },
  region: {
    type: String,
    default: '',
  },
  subregion: {
    type: String,
    default: '',
  },
  demonym: {
    type: String,
    default: '',
  },
  timeZone: {
    type: String,
    default: '',
  },
  callingCode: {
    type: String,
    default: '',
  },
  internetTld: {
    type: String,
    default: '',
  },
  drivingSide: {
    type: String,
    default: '',
  },
  independenceDate: {
    type: String,
    default: '',
  },
  governmentType: {
    type: String,
    default: '',
  },
  economicOverview: {
    type: String,
    default: '',
  },
  climate: {
    type: String,
    default: '',
  },
  bestTimeToVisit: {
    type: String,
    default: '',
  },
  safetyNote: {
    type: String,
    default: '',
  },
  etiquette: {
    type: String,
    default: '',
  },
  transport: {
    type: String,
    default: '',
  },
  connectivity: {
    type: String,
    default: '',
  },
  visaNote: {
    type: String,
    default: '',
  },
  healthAdvice: {
    type: String,
    default: '',
  },
  emergencyNumbers: {
    type: String,
    default: '',
  },
  // Support multi-langues
  translations: {
    fr: {
      description: { type: String, default: '' },
      culture: { type: String, default: '' },
    },
    en: {
      description: { type: String, default: '' },
      culture: { type: String, default: '' },
    },
    sw: {
      description: { type: String, default: '' },
      culture: { type: String, default: '' },
    },
    ar: {
      description: { type: String, default: '' },
      culture: { type: String, default: '' },
    },
    pt: {
      description: { type: String, default: '' },
      culture: { type: String, default: '' },
    },
  },
  // Données historiques pour la carte
  historicalBoundaries: [{
    period: {
      type: String,
      required: true,
    },
    boundaries: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    name: {
      type: String,
      required: true, // Nom historique (ex: "Empire du Ghana")
    },
    description: {
      type: String,
      default: '',
    },
  }],
  historicalSites: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['archaeological', 'monument', 'museum', 'natural'],
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    period: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
      default: [],
    }],
    visitInfo: {
      accessible: {
        type: Boolean,
        default: true,
      },
      openingHours: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
    },
  }],
  color: {
    type: String,
    default: '#8E44AD',
  },
  svgPath: {
    type: String,
    default: '',
  },
  center: {
    x: Number,
    y: Number,
  },
  // Informations culturelles détaillées
  rites: [{
    type: String,
    default: [],
  }],
  customs: [{
    type: String,
    default: [],
  }],
  foods: [{
    type: String,
    default: [],
  }],
  traditions: [{
    type: String,
    default: [],
  }],
  festivals: [{
    type: String,
    default: [],
  }],
  arts: [{
    type: String,
    default: [],
  }],
  placesToDiscover: [{
    type: String,
    default: [],
  }],
  experiences: [{
    type: String,
    default: [],
  }],
  practicalTips: [{
    type: String,
    default: [],
  }],
  sourceNotes: [{
    type: String,
    default: [],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  // Sections personnalisées dynamiques
  customSections: [{
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['text', 'html', 'list'],
      default: 'text',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Repères pour la carte interactive de la fiche pays
  mapPlaces: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['capital', 'economic', 'historic', 'cultural', 'natural', 'port'],
      default: 'cultural',
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      default: '',
    },
    highlight: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Images additionnelles
  images: [{
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Documents PDF
  pdfs: [{
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Vidéos
  videos: [{
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['youtube', 'vimeo', 'direct', 'other'],
      default: 'direct',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Documents (DOCX, etc.)
  documents: [{
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'other'],
      default: 'other',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
})

// Index pour recherche (id a déjà un index unique via unique: true)
countrySchema.index({ nameFr: 'text', description: 'text', capital: 'text' })

const Country = mongoose.model('Country', countrySchema)

export default Country
