/**
 * Adresse publique d'un contenu : lisible quand il en a une (/figures/nelson-mandela),
 * sinon par identifiant. Les deux formes fonctionnent ; la lisible est celle qu'on affiche et partage.
 */
export type Section = 'blog' | 'stories' | 'collections' | 'timeline' | 'figures'

export const lienContenu = (section: Section, doc: { _id?: string; slug?: string } | null | undefined) =>
  `/${section}/${doc?.slug || doc?._id || ''}`
