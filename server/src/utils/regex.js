// Construit une expression régulière à partir d'un texte saisi par l'utilisateur, sans
// interpréter ses caractères spéciaux : évite les erreurs 500 (« ( ») et les motifs
// coûteux (ReDoS) envoyés à MongoDB depuis les recherches publiques.
export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Variantes accentuées de chaque lettre : « senegal » trouve « Sénégal », « cote » trouve « Côte ».
// On tape rarement les accents sur téléphone.
const VARIANTES = {
  a: 'aàâäáãå', c: 'cç', e: 'eéèêë', i: 'iîïíì', n: 'nñ', o: 'oôöóòõ', u: 'uùûüú', y: 'yÿý',
}
const LETTRE = Object.fromEntries(
  Object.entries(VARIANTES)
    .filter(([key]) => key.length === 1)
    .flatMap(([, chars]) => [...chars].map((char) => [char, chars])),
)
// Apostrophes et tirets : « d'Ivoire » = « d’Ivoire », « Burkina-Faso » = « Burkina Faso »
const SEPARATEUR = "[-‐–'’ʼ\\s]"
const PONCTUATION = { "'": SEPARATEUR, '’': SEPARATEUR, '-': SEPARATEUR, ' ': SEPARATEUR }

const plierAccents = (text) =>
  [...text.normalize('NFC')]
    .map((char, index, chars) => {
      const lower = char.toLowerCase()
      const next = (chars[index + 1] || '').toLowerCase()
      // « coeur » saisi au clavier trouve « cœur » : la lettre suivante est absorbée
      if ((lower === 'o' || lower === 'a') && next === 'e') {
        chars[index + 1] = ''
        return lower === 'o' ? `(?:[${LETTRE.o}][${LETTRE.e}]|œ)` : `(?:[${LETTRE.a}][${LETTRE.e}]|æ)`
      }
      if (char === '') return ''
      if (PONCTUATION[char]) return PONCTUATION[char]
      if (lower === 'œ') return '(?:œ|oe)'
      if (lower === 'æ') return '(?:æ|ae)'
      if (LETTRE[lower]) return `[${LETTRE[lower]}]`
      return escapeRegExp(char)
    })
    .join('')

export const safeRegExp = (value, { exact = false, maxLength = 100, fold = false } = {}) => {
  const text = String(value).trim().slice(0, maxLength)
  const pattern = fold ? plierAccents(text) : escapeRegExp(text)
  return new RegExp(exact ? `^${pattern}$` : pattern, 'i')
}
