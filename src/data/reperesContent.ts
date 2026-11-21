// Repères de la maquette Figma : frise des dates, personnalités et proverbes.
// Le contenu est rédigé ici en attendant les contributions vérifiées de la base.

export interface DateRepere {
  id: string
  annee: string
  titre: string
  pays: string
  /** Couleur du point sur la frise (charte : ambre, désert, terre, turquoise) */
  couleur: string
  epoque: string
}

export interface Personnalite {
  id: string
  nom: string
  dates: string
  role: string
  portrait: string
  pays: string
}

export interface Proverbe {
  id: string
  citation: string
  origine: string
  /** Le premier proverbe de la maquette porte la carte vert forêt */
  sombre?: boolean
}

export const DATES: DateRepere[] = [
  {
    id: 'kheops',
    annee: 'vers 2560 av. J.-C.',
    titre: 'Achèvement de la grande pyramide de Khéops',
    pays: 'Égypte',
    couleur: '#e2b52f',
    epoque: 'Antiquité',
  },
  {
    id: 'kurukan-fuga',
    annee: '1235',
    titre: 'Charte du Kurukan Fuga, empire du Mali',
    pays: 'Mali',
    couleur: '#e87525',
    epoque: 'Moyen Âge',
  },
  {
    id: 'mansa-musa-1324',
    annee: '1324',
    titre: 'Pèlerinage de Mansa Musa vers La Mecque',
    pays: 'Mali',
    couleur: '#e87525',
    epoque: 'Moyen Âge',
  },
  {
    id: 'nzinga-1624',
    annee: '1624',
    titre: 'Nzinga devient reine du Ndongo',
    pays: 'Angola',
    couleur: '#d94a3a',
    epoque: 'Époque moderne',
  },
  {
    id: 'ghana-1957',
    annee: '1957',
    titre: 'Indépendance du Ghana',
    pays: 'Ghana',
    couleur: '#00a39a',
    epoque: 'Époque contemporaine',
  },
]

export const PERSONNALITES: Personnalite[] = [
  {
    id: 'soundiata',
    nom: 'Soundiata Keïta',
    dates: '1190 – 1255',
    role: 'Fondateur de l’empire du Mali',
    portrait: '/content/reperes/soundiata.png',
    pays: 'Mali',
  },
  {
    id: 'nzinga',
    nom: 'Reine Nzinga Mbande',
    dates: '1583 – 1663',
    role: 'Reine du Ndongo et du Matamba',
    portrait: '/content/reperes/nzinga.png',
    pays: 'Angola',
  },
  {
    id: 'yaa-asantewaa',
    nom: 'Yaa Asantewaa',
    dates: '1840 – 1921',
    role: 'Reine-mère d’Edweso, cheffe de guerre ashanti',
    portrait: '/content/reperes/yaa-asantewaa.png',
    pays: 'Ghana',
  },
  {
    id: 'kwame-nkrumah',
    nom: 'Kwame Nkrumah',
    dates: '1909 – 1972',
    role: 'Premier président du Ghana indépendant',
    portrait: '/content/reperes/kwame-nkrumah.png',
    pays: 'Ghana',
  },
]

export const PROVERBES: Proverbe[] = [
  {
    id: 'lions',
    citation: 'Tant que les lions n’auront pas leurs propres historiens, les histoires de chasse glorifieront le chasseur.',
    origine: 'Proverbe africain',
    sombre: true,
  },
  {
    id: 'ensemble',
    citation: 'Seul on va vite, ensemble on va loin.',
    origine: 'Proverbe d’Afrique de l’Est',
  },
  {
    id: 'fleur',
    citation: 'Il faut sortir de sa maison pour savoir où habite la fleur.',
    origine: 'Proverbe d’Afrique de l’Ouest',
  },
]
