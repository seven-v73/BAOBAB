const PRODUCT_IMAGE_BASE = '/content/products'

export const contextualProductVisuals = [
  {
    match: ['Écharpe bogolan', 'Bogolan'],
    image: `${PRODUCT_IMAGE_BASE}/bogolan-mali.webp`,
  },
  {
    match: ['Beurre de karité', 'Karité'],
    image: `${PRODUCT_IMAGE_BASE}/karite-burkina.webp`,
  },
  {
    match: ['Panier tressé', 'Panier'],
    image: `${PRODUCT_IMAGE_BASE}/panier-africain.webp`,
  },
  {
    match: ['Collier perles Akan', 'Perles Akan', 'Akan'],
    image: `${PRODUCT_IMAGE_BASE}/perles-akan.webp`,
  },
  {
    match: ['Carnet de proverbes', 'Proverbes'],
    image: `${PRODUCT_IMAGE_BASE}/carnet-transmission.webp`,
  },
  {
    match: ['Set épices', 'Épices', 'Cuisine ouest-africaine'],
    image: `${PRODUCT_IMAGE_BASE}/epices-nigeria.webp`,
  },
  {
    match: ['Mini djembé', 'Djembé'],
    image: `${PRODUCT_IMAGE_BASE}/djembe-guinee.webp`,
  },
  {
    match: ['Affiche carte', 'Carte culturelle'],
    image: `${PRODUCT_IMAGE_BASE}/carte-afrique-culturelle.webp`,
  },
]

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const getContextualProductVisual = (name = '') => {
  const normalizedName = normalize(name)
  return contextualProductVisuals.find((visual) =>
    visual.match.some((keyword) => normalizedName.includes(normalize(keyword)))
  )
}

export const withContextualProductVisual = <
  T extends { name?: string; image?: string; images?: string[] }
>(product: T): T => {
  const visual = getContextualProductVisual(product.name)

  if (!visual) {
    return product
  }

  return {
    ...product,
    image: visual.image,
    images: [visual.image, ...(product.images || []).filter((image) => image !== visual.image)],
  }
}
