// Récits de la maquette Figma : liste de la page Récits et articles complets
// des pages de lecture (/recit/:id). Le contenu est rédigé ici en attendant
// les contributions vérifiées de la base.

export type RecitType = 'articles' | 'temoignages' | 'dossiers'

export interface RecitCard {
  id: string
  type: RecitType
  title: string
  excerpt: string
  image: string
  meta: string
  to: string
  pays?: string
  theme?: string
}

export interface StoryBlock {
  kind: 'para' | 'quote' | 'fact'
  text: string
}

export interface StorySection {
  id: string
  /** Le premier bloc de la maquette commence sans intertitre */
  title?: string
  blocks: StoryBlock[]
}

export interface StorySource {
  type: string
  label: string
}

export interface StoryArticle {
  id: string
  title: string
  meta: string
  chapeau: string
  image: string
  caption: string
  author: string
  date: string
  country: { code: string; name: string; text: string }
  sections: StorySection[]
  sources: StorySource[]
}

/* ---------- Liste (page Récits) ---------- */

export const RECITS: RecitCard[] = [
  {
    id: 'faso-dan-fani',
    type: 'articles',
    pays: 'Burkina Faso',
    theme: 'Savoir-faire',
    meta: 'Savoir-faire · 7 min',
    title: 'Le Faso Dan Fani, un pagne tissé d’histoires',
    excerpt: 'Sur le métier à tisser, chaque bande de coton porte un motif, un message, une fierté.',
    image: '/content/recits/faso-dan-fani.webp',
    to: '/recit/faso-dan-fani',
  },
  {
    id: 'tiebele',
    type: 'articles',
    pays: 'Burkina Faso',
    theme: 'Patrimoine',
    meta: 'Patrimoine · 9 min',
    title: 'Tiébélé, les maisons peintes des femmes kasséna',
    excerpt: 'Dans la cour royale, les murs de terre se couvrent de motifs transmis de mère en fille.',
    image: '/content/recits/tiebele.webp',
    to: '/recit/tiebele',
  },
  {
    id: 'calebasse',
    type: 'temoignages',
    pays: 'Mali',
    theme: 'Savoir-faire',
    meta: 'Savoir-faire · 5 min',
    title: 'La calebasse, du champ à l’atelier',
    excerpt: 'Séchée, gravée puis peinte, elle devient bol, instrument ou objet de fête.',
    image: '/content/recits/calebasse.webp',
    to: '/recit/calebasse',
  },
  {
    id: 'mansa-musa',
    type: 'articles',
    pays: 'Mali',
    theme: 'Mémoire',
    meta: 'Mémoire · 6 min',
    title: 'Le pèlerinage de Mansa Musa',
    excerpt: 'En 1324, le voyage du souverain vers La Mecque distribue tant d’or que les cours s’en souviennent encore.',
    image: '/content/recits/mansa-musa.webp',
    to: '/recit/mansa-musa',
  },
]

export const DOSSIERS: RecitCard[] = [
  {
    id: 'dossier-savoir-faire-bf',
    type: 'dossiers',
    pays: 'Burkina Faso',
    theme: 'Savoir-faire',
    meta: 'Dossier · Burkina Faso',
    title: 'Savoir-faire du Burkina Faso',
    excerpt: 'Tissage, bronze et pagne : les gestes qui portent l’économie domestique.',
    image: '/content/recits/faso-dan-fani.webp',
    to: '/recits?type=dossiers',
  },
  {
    id: 'dossier-empires-sahel',
    type: 'dossiers',
    pays: 'Mali',
    theme: 'Mémoire',
    meta: 'Dossier · Mémoire',
    title: 'Les grands empires du Sahel',
    excerpt: 'Ghana, Mali, Songhaï : trois siècles de routes, de sels et de mémoires.',
    image: '/content/recits/empire-sahel.webp',
    to: '/recits?type=dossiers',
  },
]

/* ---------- Articles complets (pages de lecture) ---------- */

const STORIES: StoryArticle[] = [
  {
    id: 'faso-dan-fani',
    title: 'Le Faso Dan Fani, un pagne tissé d’histoires',
    meta: 'Savoir-faire · Burkina Faso · 7 min',
    chapeau:
      'Tissé bande après bande sur des métiers de bois, le Faso Dan Fani est aujourd’hui porté comme un vêtement national au Burkina Faso.',
    image: '/content/recits/faso-dan-fani.webp',
    caption: 'Tisserandes au travail dans un village du Burkina Faso. Photo : Btwien, CC BY-SA 4.0, Wikimedia Commons.',
    author: 'La rédaction MonBaobab',
    date: 'Publié le 12 novembre 2026 · 7 minutes de lecture',
    country: {
      code: 'bf',
      name: 'Burkina Faso',
      text: 'Pays des Hommes intègres, ses ateliers de tissage rythment les marchés de Ouagadougou à Bobo-Dioulasso.',
    },
    sections: [
      {
        id: 'introduction',
        blocks: [
          {
            kind: 'para',
            text: 'Au Burkina Faso, le Faso Dan Fani (littéralement « le pagne tissé du pays ») fait partie de la vie quotidienne. On le porte aux fêtes, on l’offre aux mariages, on le tisse au village comme en ville. Sa particularité : il naît de bandes étroites de coton filé, assemblées une à une sur des métiers à pédale, ce qui donne ces rayures et ces damiers que rien ne peut confondre.',
          },
        ],
      },
      {
        id: 'un-geste-transmis',
        title: 'Un geste transmis',
        blocks: [
          {
            kind: 'para',
            text: 'Le savoir-faire se transmet surtout entre femmes, de mère en fille, au rythme des récoltes de coton. Apprendre à tendre la chaîne, à croiser la navette, à régler la tension : il faut des années avant de maîtriser les motifs qui portent un nom, un proverbe, parfois un message codé destiné à celui qui saura le lire.',
          },
          {
            kind: 'quote',
            text: 'Chaque motif a un nom, chaque bande un sens : le tissu parle pour celle ou celui qui le porte.',
          },
          {
            kind: 'para',
            text: 'Dans les ateliers de Saaba, à la sortie de Ouagadougou, les tisserandes travaillent souvent en couronne, les unes à côté des autres. La pièce avance d’autant plus vite que la conversation va son train : un pagne complet demande une à deux semaines de travail selon la finesse demandée.',
          },
        ],
      },
      {
        id: 'un-tissu-devenu-symbole',
        title: 'Un tissu devenu symbole',
        blocks: [
          {
            kind: 'para',
            text: 'Porté par les agriculteurs comme par les ministres, le Faso Dan Fani est devenu un marqueur d’identité nationale. On le porte en tenue de cérémonie comme au quotidien, et de plus jeunes créateurs le déclinent aujourd’hui en chemises, robes ou accessoires, entre coutume et mode.',
          },
          {
            kind: 'fact',
            text: 'Sous la Révolution de 1983-1987, Thomas Sankara faisait du port du Faso Dan Fani un acte politique : habiller le pays avec ce que le pays produit.',
          },
          {
            kind: 'para',
            text: 'Cette dimension politique n’a jamais disparu : choisir un vêtement en Faso Dan Fani reste, au Burkina Faso, une manière tranquille de dire d’où l’on vient et en quoi l’on croit.',
          },
        ],
      },
    ],
    sources: [
      { type: 'Référence écrite', label: 'Ministère de la Culture, des Arts et du Tourisme du Burkina Faso' },
      { type: 'Témoignage', label: 'Tisserandes de Saaba, entretiens recueillis à Ouagadougou' },
    ],
  },
  {
    id: 'tiebele',
    title: 'Tiébélé, les maisons peintes des femmes kasséna',
    meta: 'Patrimoine · Burkina Faso · 9 min',
    chapeau:
      'Dans le sud du Burkina Faso, la cour royale de Tiébélé garde une tradition : des murs de terre peints à la main par les femmes.',
    image: '/content/recits/tiebele.webp',
    caption: 'Maison peinte de la cour royale de Tiébélé, Burkina Faso. Photo : Alexander Leisser, CC BY-SA 4.0, Wikimedia Commons.',
    author: 'La rédaction MonBaobab',
    date: 'Publié le 5 novembre 2026 · 9 minutes de lecture',
    country: {
      code: 'bf',
      name: 'Burkina Faso',
      text: 'Aux portes du Ghana, le village de Tiébélé perpétue l’art architectural des Kasséna.',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        blocks: [
          {
            kind: 'para',
            text: 'Posé sur la plaine du Nahouri, Tiébélé semble d’abord un village comme les autres. Puis les murs changent : frises géométriques, points, vagues et silhouettes couvrent les façades de terre, tracés à la main avec des pigments tirés de la pierre et du charbon.',
          },
        ],
      },
      {
        id: 'des-murs-qui-parlent',
        title: 'Des murs qui parlent',
        blocks: [
          {
            kind: 'para',
            text: 'Chez les Kasséna, la décoration des maisons revient aux femmes. Après la saison des pluies, quand les murs sont refaits, elles repaintent les façades au tas de pisé lissé. Chaque motif raconte quelque chose : la fécondité, la bravoure, la vie de la maison.',
          },
          {
            kind: 'para',
            text: 'La cour royale, avec ses cases aux silos intégrés et ses enceintes basses, forme un ensemble que les habitants entretiennent ensemble : un patrimoine vivant, classé sur la liste indicative de l’UNESCO, où l’on visite autant qu’on accueille.',
          },
        ],
      },
    ],
    sources: [
      { type: 'Référence écrite', label: 'Liste indicative du patrimoine mondial de l’UNESCO, « Cour royale de Tiébélé »' },
      { type: 'Témoignage', label: 'Femmes peintres de la cour royale, récits de village' },
    ],
  },
  {
    id: 'calebasse',
    title: 'La calebasse, du champ à l’atelier',
    meta: 'Savoir-faire · Mali · 5 min',
    chapeau:
      'Elle pousse au champ, sèche au soleil, puis se grave, se peint et se sculpte jusqu’à devenir bol, tasse ou instrument.',
    image: '/content/recits/calebasse.webp',
    caption: 'Calebasse décorée au village artisanal de Wadata, Niamey, Niger. Photo : Habibou Souley Hajara, CC BY-SA 4.0, Wikimedia Commons.',
    author: 'La rédaction MonBaobab',
    date: 'Publié le 28 octobre 2026 · 5 minutes de lecture',
    country: {
      code: 'ml',
      name: 'Mali',
      text: 'Du fleuve Niger aux marchés de Bamako, la calebasse accompagne tous les gestes du quotidien.',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        blocks: [
          {
            kind: 'para',
            text: 'La calebasse est la courge que l’on ne mange presque pas : cultivée pour sa coque, elle devient objet une fois vidée, séchée et séchée encore. Au Mali comme dans une grande partie du Sahel, elle sert de bol, de cuillère, de tamis, de récipiendaire de bois de café.',
          },
        ],
      },
      {
        id: 'du-champ-a-l-atelier',
        title: 'Du champ à l’atelier',
        blocks: [
          {
            kind: 'para',
            text: 'Récoltée à maturité, la calebasse passe des semaines au soleil. Sa chair se vide, sa paroi durcit : c’est seulement alors que l’artisan la grave au canif, la polit à la pierre et, pour les plus belles, la peint de motifs simples au feu ou au pigment.',
          },
          {
            kind: 'para',
            text: 'Dans les ateliers de Bamako, la même matière se décline désormais en lampes, en bijoux, en boîtes : la tradition ne se garde pas sous verre, elle se retravaille.',
          },
        ],
      },
    ],
    sources: [{ type: 'Témoignage', label: 'Artisans calebassiers du marché de Ségou' }],
  },
  {
    id: 'mansa-musa',
    title: 'Le pèlerinage de Mansa Musa',
    meta: 'Mémoire · Mali · 6 min',
    chapeau:
      'En 1324, le souverain du Mali part pour La Mecque. Son passage au Caire, raconté par al-Umari, a marqué les chroniqueurs.',
    image: '/content/recits/mansa-musa.webp',
    caption: 'Mansa Musa sur son trône, détail de l’Atlas catalan (1375), Bibliothèque nationale de France. Domaine public, Wikimedia Commons.',
    author: 'La rédaction MonBaobab',
    date: 'Publié le 15 octobre 2026 · 6 minutes de lecture',
    country: {
      code: 'ml',
      name: 'Mali',
      text: 'Cœur de l’empire du Mali aux XIIIe-XVe siècles, entre Niger, sel et or.',
    },
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        blocks: [
          {
            kind: 'para',
            text: 'Mansa Kankan Musa règne au XIVe siècle sur l’empire du Mali, qui couvre alors une part immense de l’Afrique de l’Ouest, du fleuve Sénégal aux rives du Niger. Sa richesse repose sur l’or du Bambouk et du Bouré et sur le commerce du sel, dont Tombouctou est la plaque tournante.',
          },
        ],
      },
      {
        id: 'la-caravane-de-1324',
        title: 'La caravane de 1324',
        blocks: [
          {
            kind: 'para',
            text: 'En 1324, il entreprend le hajj, le pèlerinage de La Mecque. Les chroniqueurs arabes, dont Al-Omari qui recueille les récits au Caire, décrivent une caravane de milliers de personnes, de chameaux chargés d’or et de vivres, précédée de serviteurs portant des bâtons d’or. Leurs chiffres varient d’un auteur à l’autre.',
          },
          {
            kind: 'para',
            text: 'De retour, le souverain ramène des savants et des architectes, dont Abou Ishaq es-Sahéli, à qui la tradition attribue la mosquée Djingareyber de Tombouctou. Le voyage de piété devient un geste de politique culturelle.',
          },
        ],
      },
    ],
    sources: [
      { type: 'Référence écrite', label: 'Al-Omari, « Masalik al-absar » (récits recueillis au Caire, XIVe siècle)' },
      { type: 'Référence écrite', label: 'UNESCO, vieux centres de Tombouctou et Djenné' },
    ],
  },
]

export const getStory = (id?: string) => STORIES.find((story) => story.id === id)
