// Construit une expression régulière à partir d'un texte saisi par l'utilisateur, sans
// interpréter ses caractères spéciaux : évite les erreurs 500 (« ( ») et les motifs
// coûteux (ReDoS) envoyés à MongoDB depuis les recherches publiques.
export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const safeRegExp = (value, { exact = false, maxLength = 100 } = {}) => {
  const escaped = escapeRegExp(String(value).trim().slice(0, maxLength))
  return new RegExp(exact ? `^${escaped}$` : escaped, 'i')
}
