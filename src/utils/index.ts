// Utilitaires généraux

/**
 * Formate une date au format français
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Extrait la liste d'une réponse d'API : selon les routes, elle arrive en tableau brut,
 * sous une clé dédiée ({ stories: [...] }) ou sous { data: [...] }.
 */
export const listFrom = (data: unknown, key: string): any[] => {
  if (Array.isArray(data)) return data
  const record = data as Record<string, unknown> | null
  const list = record?.[key] ?? record?.data
  return Array.isArray(list) ? list : []
}

/**
 * Charge plusieurs listes en parallèle. Une requête en échec donne une liste vide
 * au lieu de faire échouer les autres.
 */
export const fetchLists = async (requests: Array<[Promise<{ data: unknown }>, string]>): Promise<any[][]> => {
  const results = await Promise.allSettled(requests.map(([request]) => request))
  return results.map((result, index) =>
    result.status === 'fulfilled' ? listFrom(result.value.data, requests[index][1]) : []
  )
}

/** « 21M » → « 21 M », « 274K km² » → « 274 000 km² » (formats courts du catalogue des pays) */
export const readableQuantity = (value = '') => value.replace(/(\d)M/, '$1 M').replace(/(\d+)K/, '$1 000')

/**
 * Assemble une ligne de méta (« Mali · Mémoire · 6 min ») en ignorant les parties vides.
 */
export const joinMeta = (...parts: Array<string | number | false | null | undefined>) => parts.filter(Boolean).join(' · ')

/**
 * Débounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

