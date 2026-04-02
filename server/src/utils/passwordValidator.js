import logger from './logger.js'

/**
 * Liste des mots de passe courants à éviter
 * En production, utiliser une base de données complète (top 10000)
 */
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', 'password1',
  'Password', 'PASSWORD', 'Password123', 'admin', 'letmein',
  'welcome', 'monkey', '1234567890', 'qwerty123', 'iloveyou'
]

/**
 * Vérifie si le mot de passe respecte les critères de sécurité
 * @param {string} password - Le mot de passe à valider
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = []

  // Longueur minimale : 12 caractères
  if (!password || password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères')
  }

  // Maximum : 128 caractères (pour éviter les attaques DoS)
  if (password && password.length > 128) {
    errors.push('Le mot de passe ne doit pas dépasser 128 caractères')
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule (A-Z)')
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule (a-z)')
  }

  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre (0-9)')
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)')
  }

  // Vérifier les séquences communes
  const commonSequences = ['123', 'abc', 'qwerty', 'asdf', 'password']
  const lowerPassword = password.toLowerCase()
  for (const seq of commonSequences) {
    if (lowerPassword.includes(seq)) {
      errors.push(`Le mot de passe ne doit pas contenir de séquences communes comme "${seq}"`)
      break
    }
  }

  // Vérifier les mots de passe courants
  if (COMMON_PASSWORDS.includes(password) || COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop commun. Veuillez en choisir un autre')
  }

  // Vérifier les répétitions excessives (ex: aaa, 111)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir de caractères répétés plus de 2 fois consécutivement')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calcule la force du mot de passe (score de 0 à 100)
 * @param {string} password - Le mot de passe à évaluer
 * @returns {number} - Score de 0 à 100
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0

  let score = 0

  // Longueur (max 40 points)
  if (password.length >= 12) score += 20
  if (password.length >= 16) score += 10
  if (password.length >= 20) score += 10

  // Complexité (max 40 points)
  if (/[a-z]/.test(password)) score += 8
  if (/[A-Z]/.test(password)) score += 8
  if (/[0-9]/.test(password)) score += 8
  if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?]/.test(password)) score += 8
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:',.<>?]/.test(password)) score += 8

  // Diversité (max 20 points)
  const uniqueChars = new Set(password).size
  const diversityRatio = uniqueChars / password.length
  score += Math.min(20, diversityRatio * 20)

  // Pénalités
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(0, score - 50)
  }

  if (/(.)\1{3,}/.test(password)) {
    score = Math.max(0, score - 20)
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Génère un message de force du mot de passe
 * @param {number} strength - Score de force (0-100)
 * @returns {string} - Message descriptif
 */
export const getPasswordStrengthMessage = (strength) => {
  if (strength < 30) return 'Très faible'
  if (strength < 50) return 'Faible'
  if (strength < 70) return 'Moyen'
  if (strength < 90) return 'Fort'
  return 'Très fort'
}

