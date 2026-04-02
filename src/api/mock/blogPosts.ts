import type { BlogPost } from '../../store/blogStore'

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'L\'Empire du Mali : L\'Âge d\'Or de l\'Afrique de l\'Ouest',
    content: `
      L'Empire du Mali, fondé au XIIIe siècle, fut l'un des plus grands empires de l'histoire africaine. 
      Sous le règne de Mansa Musa, l'empire atteignit son apogée, devenant l'un des plus riches du monde.
      
      L'empire contrôlait les routes commerciales transsahariennes, notamment le commerce de l'or, 
      du sel et des esclaves. Tombouctou, la capitale intellectuelle, abritait l'une des plus grandes 
      universités du monde médiéval.
      
      L'héritage du Mali continue d'inspirer aujourd'hui, témoignant de la grandeur de la civilisation 
      africaine et de sa contribution à l'histoire mondiale.
    `,
    excerpt: 'Découvrez l\'histoire fascinante de l\'Empire du Mali, l\'un des plus grands empires de l\'Afrique médiévale.',
    author: 'Dr. Amadou Diallo',
    date: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    category: 'Histoire',
    tags: ['Mali', 'Empire', 'Histoire', 'Afrique de l\'Ouest'],
  },
  {
    id: '2',
    title: 'Les Rois de l\'Égypte Antique : Pharaons et Dynasties',
    content: `
      L'Égypte antique, berceau de l'une des plus anciennes civilisations, a vu défiler de nombreux 
      pharaons légendaires. De Khéops et ses pyramides à Cléopâtre, dernière reine d'Égypte, 
      l'histoire des pharaons est riche et fascinante.
      
      Les pharaons étaient considérés comme des dieux vivants, intermédiaires entre les dieux et 
      les hommes. Leur règne a laissé des monuments impressionnants qui continuent d'émerveiller 
      le monde entier.
    `,
    excerpt: 'Explorez l\'histoire des pharaons égyptiens et leur impact sur la civilisation mondiale.',
    author: 'Prof. Nefertari Mensah',
    date: '2024-12-08',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    category: 'Histoire',
    tags: ['Égypte', 'Pharaons', 'Civilisation', 'Archéologie'],
  },
  {
    id: '3',
    title: 'L\'Art Contemporain Africain : Une Renaissance Culturelle',
    content: `
      L'art contemporain africain connaît une renaissance sans précédent. Des artistes du continent 
      et de la diaspora créent des œuvres qui résonnent dans le monde entier.
      
      Cette nouvelle génération d'artistes explore les thèmes de l'identité, de la diaspora, 
      de la colonisation et de l'afrofuturisme, tout en honorant les traditions ancestrales.
    `,
    excerpt: 'Découvrez comment l\'art contemporain africain transforme le paysage culturel mondial.',
    author: 'Amina Kone',
    date: '2024-12-05',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    category: 'Culture',
    tags: ['Art', 'Culture', 'Contemporain', 'Renaissance'],
  },
  {
    id: '4',
    title: 'La Musique Africaine : Rythmes et Traditions',
    content: `
      La musique africaine est l'une des plus riches et diversifiées au monde. Du jazz aux rythmes 
      traditionnels, l'Afrique a donné naissance à de nombreux genres musicaux qui ont influencé 
      la musique mondiale.
      
      Des percussions du Ghana aux mélodies du Mali, chaque région apporte sa propre couleur 
      musicale unique.
    `,
    excerpt: 'Plongez dans l\'univers riche et varié de la musique africaine.',
    author: 'Koffi Mensah',
    date: '2024-12-03',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    category: 'Culture',
    tags: ['Musique', 'Tradition', 'Rythmes', 'Culture'],
  },
]

