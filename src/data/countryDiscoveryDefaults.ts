import { countryKnowledgeExpansion } from './countryKnowledgeExpansion'

export interface CountryDiscoveryDefault {
  discoveryIntro?: string
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
  recommendedPaths?: Array<{
    title: string
    description: string
    items?: string[]
  }>
  relatedThemes?: string[]
  sourceQuality?: 'draft' | 'community' | 'verified' | 'official'
  region?: string
  subregion?: string
  economicOverview?: string
  climate?: string
  bestTimeToVisit?: string
  etiquette?: string
  transport?: string
  connectivity?: string
  visaNote?: string
  healthAdvice?: string
  safetyNote?: string
  timeZone?: string
  callingCode?: string
  internetTld?: string
  drivingSide?: string
  lastUpdated?: string
  placesToDiscover?: string[]
  experiences?: string[]
  practicalTips?: string[]
  sourceNotes?: string[]
  rites?: string[]
  customs?: string[]
  foods?: string[]
  traditions?: string[]
  festivals?: string[]
  arts?: string[]
}

export const countryDiscoveryDefaults: Record<string, CountryDiscoveryDefault> = {
  MA: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC',
    callingCode: '+212',
    internetTld: '.ma, المغرب.',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Maroc) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  DZ: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+01:00',
    callingCode: '+213',
    internetTld: '.dz, الجزائر.',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Algérie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  TN: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+01:00',
    callingCode: '+216',
    internetTld: '.tn',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Tunisie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  LY: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+01:00',
    callingCode: '+218',
    internetTld: '.ly',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Libye) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  EG: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+02:00',
    callingCode: '+20',
    internetTld: '.eg, .مصر',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Égypte) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SD: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+03:00',
    callingCode: '+249',
    internetTld: '.sd',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Soudan) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SS: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+03:00',
    callingCode: '+211',
    internetTld: '.ss',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Soudan du Sud) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  EH: {
    region: 'Afrique du Nord',
    subregion: 'Maghreb, vallée du Nil et espaces sahariens',
    timeZone: 'UTC+00:00',
    callingCode: '+2125288',
    internetTld: '.eh',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Sahara occidental) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  MR: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+222',
    internetTld: '.mr',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Mauritanie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SN: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+221',
    internetTld: '.sn',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Sénégal) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GM: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC+00:00',
    callingCode: '+220',
    internetTld: '.gm',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Gambie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GW: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+245',
    internetTld: '.gw',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Guinée-Bissau) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GN: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+224',
    internetTld: '.gn',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Guinée) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SL: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+232',
    internetTld: '.sl',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Sierra Leone) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  LR: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+231',
    internetTld: '.lr',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Libéria) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CI: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+225',
    internetTld: '.ci',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Côte d\\) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GH: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+233',
    internetTld: '.gh',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Ghana) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  TG: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+228',
    internetTld: '.tg',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Togo) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  BJ: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC+01:00',
    callingCode: '+229',
    internetTld: '.bj',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Bénin) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  NG: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC+01:00',
    callingCode: '+234',
    internetTld: '.ng',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Nigeria) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  NE: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC+01:00',
    callingCode: '+227',
    internetTld: '.ne',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Niger) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ML: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+223',
    internetTld: '.ml',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Mali) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  BF: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC',
    callingCode: '+226',
    internetTld: '.bf',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Burkina Faso) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  TD: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+235',
    internetTld: '.td',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Tchad) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CM: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+237',
    internetTld: '.cm',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Cameroun) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CF: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+236',
    internetTld: '.cf',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (République centrafricaine) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GQ: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+240',
    internetTld: '.gq',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Guinée équatoriale) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  GA: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+241',
    internetTld: '.ga',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Gabon) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CG: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+242',
    internetTld: '.cg',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Congo) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CD: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00, UTC+02:00',
    callingCode: '+243',
    internetTld: '.cd',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (RD Congo) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  AO: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC+01:00',
    callingCode: '+244',
    internetTld: '.ao',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Angola) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ST: {
    region: 'Afrique centrale',
    subregion: 'Forêts équatoriales, bassin du Congo et zones sahéliennes',
    timeZone: 'UTC',
    callingCode: '+239',
    internetTld: '.st',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (São Tomé-et-Príncipe) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  CV: {
    region: 'Afrique de l\'Ouest',
    subregion: 'Atlantique, Sahel et Golfe de Guinée',
    timeZone: 'UTC-01:00',
    callingCode: '+238',
    internetTld: '.cv',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Cap-Vert) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ER: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+291',
    internetTld: '.er',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Érythrée) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ET: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+251',
    internetTld: '.et',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Éthiopie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  DJ: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+253',
    internetTld: '.dj',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Djibouti) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SO: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+252',
    internetTld: '.so',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Somalie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  KE: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+254',
    internetTld: '.ke',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Kenya) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  UG: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+256',
    internetTld: '.ug',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Ouganda) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  RW: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+250',
    internetTld: '.rw',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Rwanda) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  BI: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+257',
    internetTld: '.bi',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Burundi) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  TZ: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+255',
    internetTld: '.tz',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Tanzanie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  MW: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+265',
    internetTld: '.mw',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Malawi) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ZM: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+260',
    internetTld: '.zm',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Zambie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ZW: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+263',
    internetTld: '.zw',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Zimbabwe) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  BW: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+267',
    internetTld: '.bw',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Botswana) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  MZ: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+258',
    internetTld: '.mz',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Mozambique) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  MG: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+261',
    internetTld: '.mg',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Madagascar) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  ZA: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+27',
    internetTld: '.za',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Afrique du Sud) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  LS: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+266',
    internetTld: '.ls',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Lesotho) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SZ: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+02:00',
    callingCode: '+268',
    internetTld: '.sz',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Eswatini) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  NA: {
    region: 'Afrique australe',
    subregion: 'Plateaux, littoraux austraux et routes de l\'océan Indien',
    timeZone: 'UTC+01:00',
    callingCode: '+264',
    internetTld: '.na',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Namibie) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  MU: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+04:00',
    callingCode: '+230',
    internetTld: '.mu',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Maurice) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  SC: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+04:00',
    callingCode: '+248',
    internetTld: '.sc',
    drivingSide: 'À gauche',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Seychelles) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
  KM: {
    region: 'Afrique de l\'Est',
    subregion: 'Corne de l\'Afrique, Grands Lacs et océan Indien',
    timeZone: 'UTC+03:00',
    callingCode: '+269',
    internetTld: '.km',
    drivingSide: 'À droite',
    lastUpdated: '2026',
    practicalTips: [
      'Vérifier les formalités d\'entrée, les vaccins recommandés et les consignes officielles avant le départ.',
      'Prévoir une marge pour les déplacements intérieurs: les temps de trajet varient selon la saison, l\'état des routes et les événements locaux.',
      'Demander l\'accord avant de photographier des personnes, lieux de culte, marchés ou cérémonies.',
    ],
    sourceNotes: [
      'Repères techniques (Comores) consolidés depuis REST Countries, consulté le 10 mai 2026.',
      'Les données sensibles au voyage doivent être confirmées auprès des autorités et services consulaires avant déplacement.',
    ],
  },
}

const westAfricaDiscovery: Record<string, CountryDiscoveryDefault> = {
  MR: {
    discoveryIntro: 'Entre dunes, plateaux pierreux et Atlantique, la Mauritanie se découvre par le silence du désert, les bibliothèques anciennes et les haltes nomades.',
    climate: 'Climat désertique à sahélien, avec de fortes chaleurs et des écarts marqués entre côte, intérieur et zones sahariennes.',
    bestTimeToVisit: 'De novembre à février pour des températures plus respirables, surtout dans l’Adrar et les zones désertiques.',
    economicOverview: 'Mines, pêche, élevage, commerce saharien et activités portuaires structurent une économie tournée vers l’Atlantique et le Sahel.',
    etiquette: 'Salutations longues, respect de l’hospitalité et tenue sobre sont essentiels, surtout dans les espaces religieux et familiaux.',
    placesToDiscover: ['Chinguetti et ses bibliothèques anciennes', 'Ouadane et l’Adrar', 'Parc national du Banc d’Arguin', 'Nouakchott côté port de pêche', 'Atar et les routes caravanières'],
    experiences: ['Dormir sous tente dans l’Adrar', 'Lire l’histoire saharienne à travers les ksour', 'Observer les oiseaux migrateurs du Banc d’Arguin', 'Découvrir le thé mauritanien en trois services'],
  },
  SN: {
    discoveryIntro: 'Le Sénégal se raconte par la Teranga, Dakar, Saint-Louis, les îles, les sabars, les luttes et les longues conversations autour du thé.',
    climate: 'Climat sahélien et tropical: saison sèche de novembre à mai, saison des pluies de juin à octobre selon les régions.',
    bestTimeToVisit: 'De novembre à avril pour profiter des villes, du littoral et du nord avec moins d’humidité.',
    economicOverview: 'Services, pêche, agriculture, phosphate, tourisme, culture urbaine et économie numérique animent un pays très connecté à sa diaspora.',
    etiquette: 'Prendre le temps de saluer, demander des nouvelles et respecter les aînés fait partie de la relation quotidienne.',
    placesToDiscover: ['Dakar et l’île de Gorée', 'Saint-Louis et la Langue de Barbarie', 'Lac Rose', 'Delta du Saloum', 'Casamance et ses villages diola', 'Réserve de Bandia'],
    experiences: ['Assister à un combat de lutte sénégalaise', 'Écouter du mbalax à Dakar', 'Goûter un thieboudienne familial', 'Naviguer dans les bolongs du Saloum', 'Découvrir les marchés de tissus et de paniers'],
  },
  GM: {
    discoveryIntro: 'La Gambie suit le fleuve comme une longue scène de villages, mangroves, marchés et mémoires mandingues.',
    climate: 'Climat tropical avec une saison sèche de novembre à mai et une saison des pluies plus marquée entre juin et octobre.',
    bestTimeToVisit: 'De novembre à mars pour l’observation des oiseaux, les balades fluviales et la côte.',
    economicOverview: 'Tourisme, agriculture, pêche, arachide et commerce autour du fleuve soutiennent l’économie locale.',
    etiquette: 'Les salutations et la politesse comptent beaucoup; dans les villages, il est apprécié de passer par les responsables locaux.',
    placesToDiscover: ['Banjul et Albert Market', 'Réserve d’Abuko', 'Makasutu Culture Forest', 'Île de Kunta Kinteh', 'Villages le long du fleuve Gambie'],
    experiences: ['Remonter le fleuve en pirogue', 'Observer les oiseaux au lever du jour', 'Découvrir la kora et les récits mandingues', 'Partager un domoda dans une cour familiale'],
  },
  GW: {
    discoveryIntro: 'La Guinée-Bissau est un pays d’îles, de créole, de rizières, de carnaval et de cultures balantes, mandingues, peules et bijagos.',
    climate: 'Climat tropical humide avec une saison sèche de novembre à mai et de fortes pluies de juin à octobre.',
    bestTimeToVisit: 'De décembre à avril, surtout pour rejoindre l’archipel des Bijagos et circuler plus facilement.',
    economicOverview: 'Noix de cajou, pêche, agriculture, commerce local et activités portuaires composent le cœur économique.',
    etiquette: 'L’accord des communautés est important avant de filmer ou photographier dans les villages et les îles.',
    placesToDiscover: ['Archipel des Bijagos', 'Bissau Velho', 'Cacheu', 'Parc naturel d’Orango', 'Bolama'],
    experiences: ['Explorer les îles Bijagos avec un guide local', 'Vivre l’énergie du carnaval de Bissau', 'Goûter aux plats de poisson et riz', 'Comprendre les liens entre mangrove et rizières'],
  },
  GN: {
    discoveryIntro: 'La Guinée mêle montagnes du Fouta, sources des grands fleuves, rythmes mandingues, forêts du sud et énergie de Conakry.',
    climate: 'Climat tropical avec une côte humide, un Fouta plus frais et des saisons très différentes selon l’altitude.',
    bestTimeToVisit: 'De novembre à avril pour les randonnées, les chutes et les trajets hors saison des pluies.',
    economicOverview: 'Bauxite, or, agriculture, élevage, pêche et marchés urbains structurent un pays riche en ressources et en cultures.',
    etiquette: 'La place des anciens, des griots et des familles élargies est importante; saluer avant toute demande facilite beaucoup les échanges.',
    placesToDiscover: ['Conakry et les îles de Loos', 'Fouta Djallon', 'Chutes de Kambadaga', 'Labé', 'N’Zérékoré et la Guinée forestière'],
    experiences: ['Randonner dans le Fouta Djallon', 'Écouter balafon, kora et djembé', 'Découvrir les marchés de Conakry', 'Suivre les paysages de sources et cascades'],
  },
  SL: {
    discoveryIntro: 'La Sierra Leone associe collines vertes, plages atlantiques, histoire krio, forêts tropicales et une capitale posée entre montagne et mer.',
    climate: 'Climat tropical humide, avec une longue saison des pluies et une saison sèche plus favorable aux déplacements.',
    bestTimeToVisit: 'De novembre à avril pour la côte, Freetown et les parcs.',
    economicOverview: 'Mines, agriculture, pêche, commerce et tourisme côtier composent une économie en reconstruction et en transformation.',
    etiquette: 'La courtoisie, la retenue et les salutations sont appréciées; les communautés locales encadrent souvent l’accès aux sites naturels.',
    placesToDiscover: ['Freetown et Cotton Tree', 'Tacugama Chimpanzee Sanctuary', 'Bunce Island', 'Tiwai Island', 'Plages de la péninsule de Freetown'],
    experiences: ['Comprendre l’histoire krio à Freetown', 'Observer la forêt tropicale à Tiwai', 'Explorer les plages de River Number Two', 'Goûter au cassava leaf et au riz local'],
  },
  LR: {
    discoveryIntro: 'Le Libéria porte une histoire singulière entre Atlantique, forêts, héritage américano-libérien, surf et cultures kru, kpelle, bassa et gio.',
    climate: 'Climat équatorial humide, très pluvieux sur la côte, avec une saison sèche plus pratique de novembre à mars.',
    bestTimeToVisit: 'De décembre à mars pour Monrovia, Robertsport et les routes côtières.',
    economicOverview: 'Caoutchouc, fer, bois, agriculture, services et commerce portuaire structurent l’économie.',
    etiquette: 'Les salutations formelles, la prudence dans les sujets politiques et le respect des chefferies locales sont recommandés.',
    placesToDiscover: ['Monrovia et Providence Island', 'Robertsport', 'Parc national de Sapo', 'Buchanan', 'Plages du Grand Cape Mount'],
    experiences: ['Surfer à Robertsport', 'Découvrir l’histoire de Providence Island', 'Explorer les marchés de Monrovia', 'Goûter au palm butter et au jollof local'],
  },
  CI: {
    discoveryIntro: 'La Côte d’Ivoire passe des lagunes d’Abidjan aux masques de l’ouest, des plantations de cacao aux plages d’Assinie et aux rythmes zouglou.',
    climate: 'Climat tropical, plus humide au sud et plus sec au nord, avec des saisons variables selon les régions.',
    bestTimeToVisit: 'De novembre à mars pour Abidjan, le littoral et les routes vers l’intérieur.',
    economicOverview: 'Cacao, café, noix de cajou, pétrole, services, culture urbaine et port d’Abidjan font du pays un grand pôle économique régional.',
    etiquette: 'La convivialité est forte; dans les villages, on salue les autorités traditionnelles et l’on évite de photographier les masques sans accord.',
    placesToDiscover: ['Abidjan, Plateau et Cocody', 'Grand-Bassam', 'Yamoussoukro', 'Man et les montagnes de l’ouest', 'Parc national de Taï', 'Assinie'],
    experiences: ['Écouter du zouglou ou du coupé-décalé', 'Découvrir Grand-Bassam à pied', 'Goûter attiéké, alloco et poisson braisé', 'Explorer les savoir-faire de tissage et de masques'],
  },
  GH: {
    discoveryIntro: 'Le Ghana relie forts côtiers, royaumes akan, kente, highlife, marchés vivants et une scène créative très présente à Accra et Kumasi.',
    climate: 'Climat tropical, plus humide au sud, plus sec au nord, avec une saison des pluies qui varie selon les zones.',
    bestTimeToVisit: 'De novembre à mars pour les côtes, Accra, Kumasi et le nord.',
    economicOverview: 'Or, cacao, pétrole, services, technologies, culture et tourisme patrimonial soutiennent une économie influente en Afrique de l’Ouest.',
    etiquette: 'La main droite est privilégiée pour donner, recevoir et saluer; les chefferies et cérémonies demandent une tenue respectueuse.',
    placesToDiscover: ['Accra et Jamestown', 'Cape Coast Castle et Elmina', 'Kumasi et le pays ashanti', 'Parc national de Kakum', 'Mole National Park', 'Lac Volta'],
    experiences: ['Voir le tissage du kente', 'Écouter highlife et afrobeats', 'Parcourir les marchés de Kumasi', 'Comprendre l’histoire des forts côtiers', 'Goûter waakye, banku et groundnut soup'],
  },
  TG: {
    discoveryIntro: 'Le Togo est une traversée compacte: littoral, Lomé, marchés, hauts plateaux, traditions vodun et villages tamberma au nord.',
    climate: 'Climat tropical avec une côte humide, des plateaux plus frais et un nord plus sec.',
    bestTimeToVisit: 'De novembre à février pour profiter du littoral, des plateaux et des routes du nord.',
    economicOverview: 'Port de Lomé, phosphate, agriculture, commerce régional, artisanat et services soutiennent l’activité.',
    etiquette: 'Les pratiques vodun et les sites sacrés se visitent avec retenue; demander avant d’entrer, photographier ou filmer.',
    placesToDiscover: ['Lomé et son grand marché', 'Togoville', 'Kpalimé et les plateaux', 'Koutammakou', 'Aného'],
    experiences: ['Découvrir les ateliers de batik de Kpalimé', 'Comprendre les traditions vodun avec un guide', 'Goûter fufu, akoumé et poisson grillé', 'Explorer les villages tamberma'],
  },
  BJ: {
    discoveryIntro: 'Le Bénin donne à voir les palais d’Abomey, les routes vodun, les cités lacustres, les plages et une histoire dense du Dahomey au présent.',
    climate: 'Climat tropical, humide au sud et plus sec au nord, avec des saisons de pluie différentes selon les zones.',
    bestTimeToVisit: 'De novembre à mars pour le sud, Abomey, Ouidah et le parc de la Pendjari selon conditions locales.',
    economicOverview: 'Coton, commerce régional, port de Cotonou, agriculture, artisanat et tourisme patrimonial structurent l’économie.',
    etiquette: 'Les lieux vodun et royaux exigent un accompagnement local, de la discrétion et le respect des interdits signalés.',
    placesToDiscover: ['Ouidah et la Route des Esclaves', 'Palais royaux d’Abomey', 'Ganvié', 'Cotonou et Porto-Novo', 'Parc national de la Pendjari'],
    experiences: ['Découvrir les arts appliqués d’Abomey', 'Parcourir Ganvié en pirogue', 'Comprendre le vodun hors clichés', 'Goûter pâte, sauce arachide, wagashi et poisson fumé'],
  },
  NG: {
    discoveryIntro: 'Le Nigeria est un continent en miniature: mégapoles, Nollywood, afrobeat, cultures yoruba, haoussa, igbo, marchés immenses et paysages du Sahel au delta.',
    climate: 'Climat très varié: sahélien au nord, tropical au centre, humide au sud et dans le delta du Niger.',
    bestTimeToVisit: 'De novembre à février selon les régions, avec une chaleur plus supportable et moins de pluies au sud.',
    economicOverview: 'Pétrole, gaz, agriculture, fintech, cinéma, musique, commerce et industrie font du Nigeria une puissance démographique et culturelle majeure.',
    etiquette: 'Les codes varient fortement selon les régions; tenue, salutations et sujets religieux doivent être adaptés au contexte local.',
    placesToDiscover: ['Lagos et Lekki', 'Abuja', 'Osogbo Sacred Grove', 'Calabar', 'Kano ancienne ville', 'Yankari Game Reserve'],
    experiences: ['Explorer la scène musicale de Lagos', 'Découvrir Nollywood par ses studios et cinémas', 'Goûter jollof rice, suya, egusi et pepper soup', 'Visiter les marchés textiles et artisanaux', 'Comprendre les arts yoruba et haoussa'],
  },
  NE: {
    discoveryIntro: 'Le Niger ouvre sur le Sahel, le fleuve, les cités de commerce, les cultures touarègues, haoussa et songhaï, et les paysages puissants de l’Aïr.',
    climate: 'Climat sahélien à désertique, avec chaleur marquée, saison sèche longue et pluies courtes souvent irrégulières.',
    bestTimeToVisit: 'De novembre à février pour limiter la chaleur, sous réserve des conditions sécuritaires locales.',
    economicOverview: 'Agriculture, élevage, uranium, commerce sahélien et artisanat structurent une économie sensible aux climats et aux routes régionales.',
    etiquette: 'Tenue sobre, salutations patientes et respect des cadres communautaires sont importants, surtout en zone rurale.',
    placesToDiscover: ['Niamey et le fleuve Niger', 'Agadez', 'Massif de l’Aïr', 'Réserve de Termit et Tin-Toumma', 'Marchés de Zinder'],
    experiences: ['Découvrir l’artisanat touareg', 'Suivre les rives du fleuve à Niamey', 'Comprendre les architectures en banco', 'Goûter le dambou et les plats de mil'],
  },
  ML: {
    discoveryIntro: 'Le Mali porte les mémoires de grands empires, les griots, le fleuve Niger, les villes anciennes, les musiques mandingues et les architectures en terre.',
    climate: 'Climat sahélien à désertique, avec une saison sèche longue et une saison des pluies plus courte au sud.',
    bestTimeToVisit: 'De novembre à février, en tenant compte des restrictions et recommandations de sécurité.',
    economicOverview: 'Or, coton, élevage, agriculture, commerce et culture musicale composent l’économie, avec de fortes disparités régionales.',
    etiquette: 'La parole des anciens, des griots et des familles est centrale; les salutations prennent du temps et créent la confiance.',
    placesToDiscover: ['Bamako et le fleuve Niger', 'Ségou', 'Djenné', 'Pays dogon', 'Tombouctou', 'Sikasso'],
    experiences: ['Écouter kora, ngoni et chants mandingues', 'Voir l’architecture en banco', 'Découvrir les teintures bogolan', 'Suivre les marchés au bord du fleuve'],
  },
  BF: {
    discoveryIntro: 'Le Burkina Faso se découvre par le cinéma, les masques, les marchés, le bronze, les villages gourounsi et une hospitalité sobre et directe.',
    climate: 'Climat soudano-sahélien, avec saison sèche longue et saison des pluies de juin à septembre environ.',
    bestTimeToVisit: 'De novembre à février pour la fraîcheur relative et les grands rendez-vous culturels selon calendrier.',
    economicOverview: 'Or, coton, élevage, agriculture, artisanat, cinéma et commerce régional rythment l’activité.',
    etiquette: 'La simplicité, la ponctuation des salutations et le respect des autorités locales sont très appréciés.',
    placesToDiscover: ['Ouagadougou', 'Bobo-Dioulasso', 'Banfora et les Cascades de Karfiguéla', 'Pics de Sindou', 'Tiébélé', 'Ruines de Loropéni'],
    experiences: ['Découvrir le FESPACO et la culture cinéma', 'Voir les bronziers et artisans de Ouagadougou', 'Goûter tô, riz gras et dolo', 'Explorer l’architecture peinte de Tiébélé'],
  },
  CV: {
    discoveryIntro: 'Le Cap-Vert associe îles volcaniques, mornas, ports atlantiques, créole, randonnées et une identité façonnée par la mer et les diasporas.',
    climate: 'Climat sec et océanique, avec vents marqués, faible pluviométrie et variations selon les îles.',
    bestTimeToVisit: 'De novembre à juin pour la randonnée, la musique et les plages, selon les vents et les îles choisies.',
    economicOverview: 'Tourisme, services, pêche, économie maritime, transferts de la diaspora et culture musicale portent l’archipel.',
    etiquette: 'Le rythme insulaire appelle patience et simplicité; la musique, la famille et la conversation ont une grande place.',
    placesToDiscover: ['Praia', 'Cidade Velha', 'Mindelo', 'Santo Antão', 'Fogo et son volcan', 'Sal et Boa Vista'],
    experiences: ['Écouter la morna à Mindelo', 'Randonner à Santo Antão', 'Goûter cachupa et poissons grillés', 'Explorer Cidade Velha', 'Monter vers le Pico do Fogo'],
  },
}

const regionalDiscovery: Record<string, CountryDiscoveryDefault> = {
  north: {
    discoveryIntro: 'Un pays de carrefours entre Méditerranée, Sahara, villes anciennes, routes commerciales et héritages amazighs, arabes, africains et ottomans.',
    climate: 'Climats contrastés: littoraux méditerranéens, zones désertiques et vallées fluviales selon les régions.',
    bestTimeToVisit: 'Printemps et automne sont souvent les périodes les plus confortables pour alterner villes, désert et sites historiques.',
    placesToDiscover: ['Vieilles villes et médinas', 'Sites antiques et musées', 'Oasis et portes du désert', 'Littoraux et ports historiques'],
    experiences: ['Découvrir les marchés anciens', 'Goûter les cuisines de céréales, dattes, épices et poissons', 'Explorer les musiques urbaines et sahariennes'],
  },
  central: {
    discoveryIntro: 'Un pays de forêts, fleuves, villes portuaires ou continentales, langues multiples et cultures façonnées par le bassin du Congo et l’Atlantique.',
    climate: 'Climat souvent équatorial ou tropical humide, avec des saisons de pluies à vérifier selon les régions.',
    bestTimeToVisit: 'Les périodes sèches locales facilitent les routes, les parcs et les déplacements hors des grandes villes.',
    placesToDiscover: ['Fleuves et marchés riverains', 'Parcs forestiers', 'Capitales et scènes musicales', 'Villages d’artisanat'],
    experiences: ['Écouter les musiques urbaines et traditionnelles', 'Découvrir les cuisines à base de manioc, plantain et poissons', 'Comprendre les liens entre forêt, fleuve et ville'],
  },
  east: {
    discoveryIntro: 'Un pays ouvert sur les hauts plateaux, les Grands Lacs, la Corne de l’Afrique ou l’océan Indien, avec des paysages très contrastés.',
    climate: 'Climats d’altitude, savane, littoral ou zones arides selon les régions; les saisons varient fortement.',
    bestTimeToVisit: 'Les saisons sèches sont généralement plus pratiques pour les parcs, les routes et les randonnées.',
    placesToDiscover: ['Parcs et réserves', 'Hauts plateaux ou littoraux', 'Villes historiques', 'Marchés et routes caravanieres'],
    experiences: ['Observer la faune avec des guides qualifiés', 'Découvrir cafés, épices ou cuisines de céréales locales', 'Explorer les musiques et danses régionales'],
  },
  south: {
    discoveryIntro: 'Un pays d’Afrique australe entre grands espaces, villes créatives, mémoires de luttes, parcs, vignobles, mines ou littoraux puissants.',
    climate: 'Climats variés: tempéré, semi-aride, tropical ou montagnard selon les régions.',
    bestTimeToVisit: 'La période idéale dépend fortement des régions: safaris, littoraux, montagnes et villes n’ont pas toujours le même calendrier.',
    placesToDiscover: ['Parcs naturels', 'Quartiers historiques', 'Routes panoramiques', 'Marchés d’artisanat et musées'],
    experiences: ['Découvrir les cuisines de braai, maïs, légumes et épices', 'Explorer les musiques urbaines', 'Comprendre les mémoires politiques et sociales'],
  },
}

const regionalCulture: Record<string, CountryDiscoveryDefault> = {
  west: {
    customs: ['Salutations longues et codifiées', 'Respect des aînés et des médiateurs sociaux', 'Importance des marchés, familles élargies et voisinages'],
    foods: ['Riz sauce', 'Mil, sorgho et fonio', 'Poisson fumé ou grillé', 'Sauces arachide, gombo ou feuilles', 'Bissap, gingembre ou boissons locales'],
    traditions: ['Rôle des griots, conteurs et musiciens', 'Cérémonies familiales autour des baptêmes, mariages et funérailles', 'Transmission orale des lignées et récits'],
    festivals: ['Festivals de musique urbaine et traditionnelle', 'Fêtes religieuses musulmanes et chrétiennes selon les pays', 'Carnavals, biennales, festivals de cinéma ou de masques'],
    arts: ['Tissage et teinture textile', 'Masques et sculpture sur bois', 'Bijouterie, cuir, vannerie et poterie', 'Musiques mandingues, highlife, afrobeat, mbalax ou zouglou selon les pays'],
  },
  north: {
    customs: ['Hospitalité autour du thé ou du café', 'Respect des espaces religieux', 'Importance des souks, médinas et repas partagés'],
    foods: ['Couscous et pains locaux', 'Tajines, ragoûts ou plats de fèves', 'Dattes, olives, poissons et épices', 'Thé à la menthe ou café épicé'],
    traditions: ['Cultures amazighes, arabes, nubiennes ou sahariennes selon les régions', 'Art du récit, poésie, musique urbaine et chants du désert', 'Fêtes religieuses et moussems locaux'],
    festivals: ['Festivals de musique sacrée, raï, gnawa ou cinéma', 'Fêtes des dattes, roses, oasis et patrimoines locaux'],
    arts: ['Zellige, stuc, calligraphie et architecture de terre', 'Tapis, cuir, bijoux et poterie', 'Musiques citadines, sahariennes et populaires'],
  },
  central: {
    customs: ['Hospitalité communautaire', 'Importance des chefferies, clans et autorités locales', 'Présence forte de la musique dans les rites et rassemblements'],
    foods: ['Manioc, plantain et igname', 'Poissons de fleuve ou de côte', 'Sauces feuilles, arachide ou graines', 'Poulet, chèvre et plats fumés selon les régions'],
    traditions: ['Danses masquées et sociétés initiatiques selon les peuples', 'Récits liés au fleuve, à la forêt et aux ancêtres', 'Cérémonies familiales et fêtes de saison'],
    festivals: ['Festivals de rumba, bikutsi, makossa ou musiques locales', 'Fêtes de récoltes et événements communautaires'],
    arts: ['Masques, reliquaires et sculpture', 'Vannerie, tissus, perles et objets rituels', 'Musiques de guitare, polyrythmies et percussions'],
  },
  east: {
    customs: ['Café, thé ou repas comme moments de lien social', 'Respect des anciens, guides et communautés locales', 'Tenues et comportements adaptés aux lieux religieux'],
    foods: ['Injera, ugali, riz pilaf ou bananes plantain selon les régions', 'Épices côtières, cafés, thés et poissons', 'Ragoûts de légumes, viande ou légumineuses'],
    traditions: ['Cultures pastorales, montagnardes, swahilies ou insulaires', 'Danses de célébration et chants polyphoniques', 'Marchés de bétail, de café, d’épices ou de tissus'],
    festivals: ['Festivals swahilis, culturels, religieux ou de musique', 'Célébrations liées aux récoltes, au café ou aux calendriers religieux'],
    arts: ['Perlage, tissage, sculpture et vannerie', 'Architecture swahilie, maisons de pierre ou villages de montagne', 'Musiques taarab, benga, eskista ou styles urbains'],
  },
  south: {
    customs: ['Accueil par la conversation et le repas', 'Respect des mémoires historiques et des communautés locales', 'Importance du sport, de la musique et des espaces publics'],
    foods: ['Maïs, sorgho et légumes locaux', 'Viandes grillées, poissons ou fruits de mer', 'Ragoûts, chutneys, pains et influences indiennes ou portugaises selon les pays'],
    traditions: ['Cérémonies de passage et fêtes communautaires', 'Mémoires des luttes politiques, migrations et royaumes anciens', 'Musique chorale, percussions, jazz, kwaito ou styles urbains'],
    festivals: ['Festivals de jazz, arts visuels, danse ou cinéma', 'Fêtes culturelles régionales et événements sportifs'],
    arts: ['Perles, textiles, sculpture et poterie', 'Peinture murale, design urbain et photographie', 'Musiques chorales, jazz austral et scènes électroniques'],
  },
}

const countryCultureHighlights: Record<string, CountryDiscoveryDefault> = {
  SN: {
    rites: ['Baptêmes avec nomination et repas communautaire', 'Cérémonies de mariage avec griots, tissus et dons familiaux', 'Rituels de lutte mêlant préparation physique et protection symbolique'],
    foods: ['Thieboudienne', 'Yassa', 'Mafé', 'Pastels', 'Bissap', 'Thiakry'],
    festivals: ['Jazz de Saint-Louis', 'Dak’Art', 'Festival de Gorée', 'Fêtes religieuses confrériques'],
    arts: ['Peinture sous verre', 'Sabar et danse', 'Tissus bazin et wax', 'Sculpture, vannerie et bijoux'],
  },
  CI: {
    rites: ['Sorties de masques dans l’ouest et le centre', 'Cérémonies de générations chez certains peuples lagunaires', 'Fêtes de village autour des récoltes et alliances familiales'],
    foods: ['Attiéké poisson', 'Alloco', 'Garba', 'Kedjenou', 'Sauce graine', 'Placali'],
    festivals: ['MASA à Abidjan', 'Festival des musiques urbaines', 'Fêtes de masques dans l’ouest', 'Abissa à Grand-Bassam'],
    arts: ['Masques dan, baoulé et sénoufo', 'Tissage kita', 'Sculpture sur bois', 'Bijoux, poterie et peinture contemporaine'],
  },
  GH: {
    rites: ['Cérémonies de chefferie akan', 'Naming ceremonies', 'Funérailles très codifiées avec tissus, musique et annonces publiques'],
    foods: ['Waakye', 'Banku et tilapia', 'Fufu et light soup', 'Jollof ghanéen', 'Red-red', 'Kelewele'],
    festivals: ['Homowo', 'Aboakyir', 'Chale Wote Street Art Festival', 'PANAFEST'],
    arts: ['Kente', 'Adinkra', 'Perles krobo', 'Highlife, hiplife et arts visuels d’Accra'],
  },
  NG: {
    rites: ['Mariages traditionnels yoruba, igbo et haoussa selon les régions', 'Durbar dans le nord', 'Festivals d’egungun et célébrations communautaires'],
    foods: ['Jollof rice', 'Suya', 'Egusi soup', 'Pounded yam', 'Moi moi', 'Pepper soup'],
    festivals: ['Eyo Festival', 'Osun-Osogbo', 'Calabar Carnival', 'Lagos Theatre Festival'],
    arts: ['Bronzes du Bénin', 'Textiles adire', 'Nollywood', 'Afrobeats, fuji, juju et scènes contemporaines'],
  },
  ML: {
    rites: ['Paroles de griots lors des grands passages familiaux', 'Cérémonies liées aux sociétés de masques selon les régions', 'Rencontres musicales autour du fleuve'],
    foods: ['Tô', 'Riz sauce arachide', 'Fakoye', 'Poisson du fleuve', 'Dégué', 'Thé fort en trois temps'],
    festivals: ['Festival sur le Niger à Ségou', 'Rencontres de musique mandingue', 'Fêtes locales de masques et récoltes'],
    arts: ['Bogolan', 'Kora et ngoni', 'Architecture de terre', 'Bijouterie touarègue et cuir'],
  },
  BF: {
    rites: ['Sorties de masques bwa, bobo ou gourounsi selon les régions', 'Cérémonies de funérailles traditionnelles', 'Fêtes de récoltes et rassemblements de villages'],
    foods: ['Tô sauce gombo', 'Riz gras', 'Babenda', 'Poulet bicyclette', 'Dolo', 'Gonré'],
    festivals: ['FESPACO', 'SIAO', 'Nuits atypiques de Koudougou', 'Festival des masques de Dédougou'],
    arts: ['Bronze de Ouagadougou', 'Masques et sculptures', 'Architecture peinte de Tiébélé', 'Textiles, cuir et calebasses gravées'],
  },
  BJ: {
    rites: ['Cérémonies vodun encadrées par les dignitaires', 'Rituels royaux liés au Dahomey', 'Fêtes familiales autour des ancêtres et lignages'],
    foods: ['Pâte rouge ou blanche', 'Sauce arachide', 'Wagashi', 'Amiwo', 'Poisson fumé', 'Akassa'],
    festivals: ['Fête du Vodun à Ouidah', 'Festival des masques Gèlèdé', 'Événements culturels d’Abomey et Porto-Novo'],
    arts: ['Bas-reliefs d’Abomey', 'Appliqués sur tissu', 'Sculpture vodun', 'Bronze, perles et calebasses'],
  },
  TG: {
    rites: ['Cérémonies vodun dans le sud', 'Rites communautaires kabyè et tem', 'Fêtes de récoltes et rites agraires'],
    foods: ['Fufu', 'Akoumé', 'Djenkoumé', 'Poisson grillé', 'Ablo', 'Sauces feuilles'],
    festivals: ['Evala en pays kabyè', 'Fêtes traditionnelles de Glidji', 'Festivals de danse et musique à Lomé'],
    arts: ['Batik de Kpalimé', 'Sculpture et vannerie', 'Architecture tamberma', 'Percussions et danses du sud au nord'],
  },
  MA: {
    placesToDiscover: ['Médina de Fès', 'Marrakech et ses jardins', 'Chefchaouen', 'Essaouira', 'Merzouga et le désert', 'Atlas et villages amazighs'],
    experiences: ['Partager un thé à la menthe', 'Découvrir les zelliges et médersas', 'Écouter gnawa à Essaouira', 'Marcher dans les souks avec un artisan'],
    foods: ['Couscous', 'Tajine', 'Harira', 'Pastilla', 'Msemen', 'Thé à la menthe'],
    festivals: ['Festival Gnaoua d’Essaouira', 'Musiques sacrées de Fès', 'Moussem de Tan-Tan', 'Festival des roses'],
    arts: ['Zellige', 'Tapis amazighs', 'Cuir de Fès', 'Poterie de Safi', 'Bijoux en argent'],
  },
  EG: {
    placesToDiscover: ['Le Caire islamique', 'Pyramides de Gizeh', 'Louxor', 'Assouan', 'Alexandrie', 'Oasis du désert occidental'],
    experiences: ['Lire l’histoire pharaonique dans les temples', 'Naviguer sur le Nil', 'Explorer les cafés du Caire', 'Goûter la cuisine populaire égyptienne'],
    foods: ['Koshari', 'Ful medames', 'Taameya', 'Molokhia', 'Mahshi', 'Thé et jus de canne'],
    festivals: ['Moulids locaux', 'Festivals de cinéma et musique au Caire', 'Célébrations coptes et musulmanes'],
    arts: ['Calligraphie', 'Moucharabieh', 'Musique shaabi', 'Cinéma égyptien', 'Art copte et islamique'],
  },
  ET: {
    placesToDiscover: ['Addis-Abeba', 'Lalibela', 'Gondar', 'Axoum', 'Simien Mountains', 'Vallée de l’Omo'],
    experiences: ['Participer à une cérémonie du café', 'Découvrir les églises taillées dans la roche', 'Goûter injera et wot', 'Explorer les hauts plateaux'],
    foods: ['Injera', 'Doro wot', 'Shiro', 'Tibs', 'Kitfo', 'Café éthiopien'],
    festivals: ['Timkat', 'Meskel', 'Genna', 'Festivals orthodoxes locaux'],
    arts: ['Peinture d’église', 'Croix éthiopiennes', 'Tissage shemma', 'Danses eskista'],
  },
  KE: {
    placesToDiscover: ['Nairobi', 'Maasai Mara', 'Lamu', 'Mombasa', 'Mont Kenya', 'Lac Nakuru'],
    experiences: ['Safari avec guides locaux', 'Découvrir la culture swahilie à Lamu', 'Goûter nyama choma et ugali', 'Explorer les cafés et galeries de Nairobi'],
    foods: ['Ugali', 'Nyama choma', 'Sukuma wiki', 'Pilau', 'Chapati', 'Mandazi'],
    festivals: ['Lamu Cultural Festival', 'Blankets and Wine', 'Festival du film de Nairobi'],
    arts: ['Perlage maasaï', 'Sculpture kisii', 'Musique benga', 'Art contemporain de Nairobi'],
  },
  TZ: {
    placesToDiscover: ['Zanzibar Stone Town', 'Serengeti', 'Ngorongoro', 'Kilimandjaro', 'Dar es Salaam', 'Bagamoyo'],
    experiences: ['Découvrir les épices de Zanzibar', 'Observer la grande migration selon saison', 'Explorer Stone Town', 'Goûter pilau, urojo et poissons grillés'],
    foods: ['Pilau', 'Urojo', 'Ugali', 'Mishkaki', 'Ndizi nyama', 'Poissons et fruits de mer'],
    festivals: ['Sauti za Busara', 'Zanzibar International Film Festival', 'Festivals culturels swahilis'],
    arts: ['Tinga Tinga', 'Sculpture makonde', 'Taarab', 'Architecture swahilie'],
  },
  ZA: {
    placesToDiscover: ['Le Cap', 'Johannesburg et Soweto', 'Kruger National Park', 'Durban', 'Route des Jardins', 'Drakensberg'],
    experiences: ['Comprendre l’histoire de l’apartheid dans les musées', 'Découvrir jazz, amapiano et scènes urbaines', 'Goûter braai, bunny chow et bobotie', 'Explorer les routes côtières'],
    foods: ['Braai', 'Bobotie', 'Bunny chow', 'Pap et chakalaka', 'Biltong', 'Malva pudding'],
    festivals: ['Cape Town Jazz Festival', 'National Arts Festival', 'AfrikaBurn', 'Festivals amapiano et scènes urbaines'],
    arts: ['Perlage ndebele', 'Jazz sud-africain', 'Art mural et photographie', 'Design et mode de Johannesburg et du Cap'],
  },
}

const westAfricaIds = new Set(['MR', 'SN', 'GM', 'GW', 'GN', 'SL', 'LR', 'CI', 'GH', 'TG', 'BJ', 'NG', 'NE', 'ML', 'BF', 'CV'])
const northAfricaIds = new Set(['MA', 'DZ', 'TN', 'LY', 'EG', 'SD', 'EH'])
const centralAfricaIds = new Set(['CM', 'CF', 'TD', 'GQ', 'GA', 'CG', 'CD', 'AO', 'ST'])
const eastAfricaIds = new Set(['SS', 'ER', 'DJ', 'ET', 'SO', 'KE', 'UG', 'RW', 'BI', 'TZ', 'SC', 'KM', 'MG', 'MU'])

const getRegionalDiscovery = (id: string) => {
  if (westAfricaIds.has(id)) return undefined
  if (northAfricaIds.has(id)) return regionalDiscovery.north
  if (centralAfricaIds.has(id)) return regionalDiscovery.central
  if (eastAfricaIds.has(id)) return regionalDiscovery.east
  return regionalDiscovery.south
}

const getRegionalCulture = (id: string) => {
  if (westAfricaIds.has(id)) return regionalCulture.west
  if (northAfricaIds.has(id)) return regionalCulture.north
  if (centralAfricaIds.has(id)) return regionalCulture.central
  if (eastAfricaIds.has(id)) return regionalCulture.east
  return regionalCulture.south
}

const mergeDiscovery = (...parts: Array<CountryDiscoveryDefault | undefined>) => {
  return parts.reduce<CountryDiscoveryDefault>((acc, part) => {
    if (!part) return acc
    return {
      ...acc,
      ...part,
      practicalTips: part.practicalTips || acc.practicalTips,
      sourceNotes: part.sourceNotes || acc.sourceNotes,
      placesToDiscover: part.placesToDiscover || acc.placesToDiscover,
      experiences: part.experiences || acc.experiences,
      rites: part.rites || acc.rites,
      customs: part.customs || acc.customs,
      foods: part.foods || acc.foods,
      traditions: part.traditions || acc.traditions,
      festivals: part.festivals || acc.festivals,
      arts: part.arts || acc.arts,
      keyFacts: part.keyFacts || acc.keyFacts,
      peoples: part.peoples || acc.peoples,
      historyHighlights: part.historyHighlights || acc.historyHighlights,
      notableFigures: part.notableFigures || acc.notableFigures,
      musicAndArts: part.musicAndArts || acc.musicAndArts,
      foodCulture: part.foodCulture || acc.foodCulture,
      oralTraditions: part.oralTraditions || acc.oralTraditions,
      knowledgeToPreserve: part.knowledgeToPreserve || acc.knowledgeToPreserve,
      recommendedPaths: part.recommendedPaths || acc.recommendedPaths,
      relatedThemes: part.relatedThemes || acc.relatedThemes,
    }
  }, {})
}

export const getCountryDiscoveryDefault = (id: string) => {
  const code = id.toUpperCase()
  return mergeDiscovery(
    getRegionalDiscovery(code),
    getRegionalCulture(code),
    countryDiscoveryDefaults[code],
    westAfricaDiscovery[code],
    countryCultureHighlights[code],
    countryKnowledgeExpansion[code]
  )
}
