const BLOG_IMAGE_BASE = '/content/blog'

export const contextualBlogVisuals = [
  {
    match: ['Marchés africains'],
    image: `${BLOG_IMAGE_BASE}/marche-mali.webp`,
    credit: 'Wikimedia Commons - marché local à Madiguibougou, Mali',
  },
  {
    match: ['Griots', 'conteurs', 'mémoire vivante'],
    image: `${BLOG_IMAGE_BASE}/griot-kora.webp`,
    credit: 'Wikimedia Commons - artiste griot mandingue et kora',
  },
  {
    match: ['Les masques'],
    image: `${BLOG_IMAGE_BASE}/masque-africain.webp`,
    credit: 'Wikimedia Commons - masque rituel africain, Museum of African Art',
  },
  {
    match: ['karité'],
    image: `${BLOG_IMAGE_BASE}/karite-burkina.webp`,
    credit: 'Wikimedia Commons - transformation des noix de karité au Burkina Faso',
  },
  {
    match: ['Dakar', 'Abidjan', 'Lagos'],
    image: `${BLOG_IMAGE_BASE}/ville-abidjan.webp`,
    credit: 'Wikimedia Commons - scènes urbaines d’Abidjan',
  },
  {
    match: ['Bogolan'],
    image: `${BLOG_IMAGE_BASE}/bogolan-mali.webp`,
    credit: 'Wikimedia Commons - textile bogolan bamana, Mali',
  },
]

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const getContextualBlogVisual = (title = '') => {
  const normalizedTitle = normalize(title)
  return contextualBlogVisuals.find((visual) =>
    visual.match.some((keyword) => normalizedTitle.includes(normalize(keyword)))
  )
}

export const withContextualBlogVisual = <T extends { title?: string; image?: string; imageCredit?: string }>(post: T): T => {
  const visual = getContextualBlogVisual(post.title)

  if (!visual) {
    return post
  }

  return {
    ...post,
    image: visual.image,
    imageCredit: visual.credit,
  }
}
