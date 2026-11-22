/** Libellé français du type d'une source (les types sont stockés en anglais dans la base) */
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  book: 'Livre',
  article: 'Article',
  document: 'Document',
  archive: 'Archive',
  testimony: 'Témoignage',
  museum: 'Musée',
  video: 'Audio et vidéo',
  website: 'Site',
}

export const sourceTypeLabel = (type?: string) => (type && SOURCE_TYPE_LABELS[type]) || 'Source'
