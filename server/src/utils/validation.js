// Validation simple pour les champs communs
export const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} est requis`)
  }
  return true
}

export const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`${fieldName} doit être un nombre`)
  }
  if (min !== null && num < min) {
    throw new Error(`${fieldName} doit être supérieur ou égal à ${min}`)
  }
  if (max !== null && num > max) {
    throw new Error(`${fieldName} doit être inférieur ou égal à ${max}`)
  }
  return true
}

