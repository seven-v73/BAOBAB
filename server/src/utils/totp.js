import crypto from 'crypto'

// Valeurs par défaut pour TOTP
const DEFAULT_TOTP_ISSUER = 'MonBaobab'
const DEFAULT_TOTP_WINDOW = 2

// Charger env.js de manière conditionnelle
let env = null
let envLoaded = false

const loadEnv = () => {
  if (envLoaded) return env
  
  try {
    // Essayer de charger env.js (synchronisé pour éviter les problèmes)
    const envModule = require('../config/env.js')
    env = envModule.default || envModule
    envLoaded = true
  } catch (error) {
    // Si env.js ne peut pas être chargé, utiliser des valeurs par défaut
    env = {
      TOTP_ISSUER: process.env.TOTP_ISSUER || DEFAULT_TOTP_ISSUER,
      TOTP_WINDOW: parseInt(process.env.TOTP_WINDOW) || DEFAULT_TOTP_WINDOW
    }
    envLoaded = true
  }
  
  return env
}

/**
 * Encode un buffer en base32
 * @param {Buffer} buffer - Buffer à encoder
 * @returns {string} - Chaîne base32
 */
const base32Encode = (buffer) => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  let output = ''
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    
    while (bits >= 5) {
      output += base32Chars[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  
  if (bits > 0) {
    output += base32Chars[(value << (5 - bits)) & 31]
  }
  
  return output
}

/**
 * Génère un secret TOTP pour un utilisateur
 * @returns {string} - Secret base32 encodé
 */
export const generateSecret = () => {
  const secret = crypto.randomBytes(20)
  return base32Encode(secret)
}

/**
 * Génère une URL QR code pour l'authentification 2FA
 * @param {string} secret - Secret base32
 * @param {string} email - Email de l'utilisateur
 * @param {string} issuerOverride - Nom de l'application (optionnel)
 * @returns {string} - URL pour QR code
 */
export const generateQRCodeURL = (secret, email, issuerOverride = null) => {
  const currentEnv = loadEnv()
  const issuer = issuerOverride || currentEnv.TOTP_ISSUER || DEFAULT_TOTP_ISSUER
  const encodedIssuer = encodeURIComponent(issuer)
  const accountName = encodeURIComponent(email)
  const otpAuthURL = `otpauth://totp/${encodedIssuer}:${accountName}?secret=${secret}&issuer=${encodedIssuer}`
  return otpAuthURL
}

/**
 * Génère un code TOTP à partir d'un secret
 * @param {string} secret - Secret base32
 * @returns {string} - Code TOTP à 6 chiffres
 */
export const generateTOTP = (secret) => {
  const timeStep = Math.floor(Date.now() / 1000 / 30) // Fenêtre de 30 secondes
  
  // Décoder le secret base32
  const decodedSecret = base32Decode(secret)
  
  // Créer un buffer pour le temps
  const timeBuffer = Buffer.allocUnsafe(8)
  timeBuffer.writeUInt32BE(timeStep, 4)
  
  // Calculer HMAC-SHA1
  const hmac = crypto.createHmac('sha1', decodedSecret)
  hmac.update(timeBuffer)
  const hash = hmac.digest()
  
  // Extraire le code dynamique
  const offset = hash[hash.length - 1] & 0x0f
  const code = ((hash[offset] & 0x7f) << 24 |
                (hash[offset + 1] & 0xff) << 16 |
                (hash[offset + 2] & 0xff) << 8 |
                (hash[offset + 3] & 0xff)) % 1000000
  
  // Formater en 6 chiffres avec zéros à gauche
  return code.toString().padStart(6, '0')
}

/**
 * Vérifie un code TOTP
 * @param {string} secret - Secret base32
 * @param {string} token - Code à vérifier
 * @param {number} window - Fenêtre de tolérance (défaut: depuis env ou 2)
 * @returns {boolean} - True si le code est valide
 */
export const verifyTOTP = (secret, token, window = null) => {
  const currentEnv = loadEnv()
  const effectiveWindow = window !== null ? window : (currentEnv.TOTP_WINDOW || DEFAULT_TOTP_WINDOW)
  const timeStep = Math.floor(Date.now() / 1000 / 30)
  
  // Vérifier dans la fenêtre de tolérance
  for (let i = -effectiveWindow; i <= effectiveWindow; i++) {
    const testTimeStep = timeStep + i
    const testCode = generateTOTPForTimeStep(secret, testTimeStep)
    if (testCode === token) {
      return true
    }
  }
  
  return false
}

/**
 * Génère un code TOTP pour un time step spécifique
 * @param {string} secret - Secret base32
 * @param {number} timeStep - Time step
 * @returns {string} - Code TOTP
 */
const generateTOTPForTimeStep = (secret, timeStep) => {
  const decodedSecret = base32Decode(secret)
  const timeBuffer = Buffer.allocUnsafe(8)
  timeBuffer.writeUInt32BE(timeStep, 4)
  
  const hmac = crypto.createHmac('sha1', decodedSecret)
  hmac.update(timeBuffer)
  const hash = hmac.digest()
  
  const offset = hash[hash.length - 1] & 0x0f
  const code = ((hash[offset] & 0x7f) << 24 |
                (hash[offset + 1] & 0xff) << 16 |
                (hash[offset + 2] & 0xff) << 8 |
                (hash[offset + 3] & 0xff)) % 1000000
  
  return code.toString().padStart(6, '0')
}

/**
 * Décode une chaîne base32
 * @param {string} str - Chaîne base32
 * @returns {Buffer} - Buffer décodé
 */
const base32Decode = (str) => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  let index = 0
  const output = []
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase()
    if (char === ' ') continue
    
    const charIndex = base32Chars.indexOf(char)
    if (charIndex === -1) continue // Ignorer les caractères invalides
    
    value = (value << 5) | charIndex
    bits += 5
    
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff
      bits -= 8
    }
  }
  
  return Buffer.from(output)
}

/**
 * Génère des codes de sauvegarde (backup codes)
 * @param {number} count - Nombre de codes à générer (défaut: 10)
 * @returns {string[]} - Tableau de codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = []
  for (let i = 0; i < count; i++) {
    // Générer un code aléatoire de 8 caractères
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}
