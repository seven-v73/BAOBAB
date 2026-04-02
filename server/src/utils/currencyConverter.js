/**
 * Utilitaire de conversion de devises
 * Taux de change approximatifs (à mettre à jour régulièrement ou utiliser une API)
 */

// Taux de change de base (1 EUR = ?)
const EXCHANGE_RATES = {
  EUR: {
    FCFA: 655.957, // 1 EUR = ~656 FCFA
    USD: 1.10,     // 1 EUR = ~1.10 USD
    EUR: 1,        // 1 EUR = 1 EUR
  },
  USD: {
    FCFA: 596.32,  // 1 USD = ~596 FCFA
    EUR: 0.91,     // 1 USD = ~0.91 EUR
    USD: 1,        // 1 USD = 1 USD
  },
  FCFA: {
    EUR: 0.001524, // 1 FCFA = ~0.001524 EUR
    USD: 0.001677, // 1 FCFA = ~0.001677 USD
    FCFA: 1,       // 1 FCFA = 1 FCFA
  },
}

/**
 * Convertit un montant d'une devise à une autre
 * @param {number} amount - Montant à convertir
 * @param {string} fromCurrency - Devise source (FCFA, EUR, USD)
 * @param {string} toCurrency - Devise cible (FCFA, EUR, USD)
 * @returns {number} Montant converti
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount <= 0) return 0
  if (fromCurrency === toCurrency) return amount

  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency]
  if (!rate) {
    throw new Error(`Taux de change non disponible de ${fromCurrency} vers ${toCurrency}`)
  }

  return Math.round(amount * rate * 100) / 100 // Arrondir à 2 décimales
}

/**
 * Convertit un prix dans toutes les devises disponibles
 * @param {number} amount - Montant à convertir
 * @param {string} fromCurrency - Devise source
 * @returns {object} Objet avec les prix dans toutes les devises
 */
export const convertToAllCurrencies = (amount, fromCurrency) => {
  return {
    FCFA: convertCurrency(amount, fromCurrency, 'FCFA'),
    EUR: convertCurrency(amount, fromCurrency, 'EUR'),
    USD: convertCurrency(amount, fromCurrency, 'USD'),
  }
}

/**
 * Formate un prix avec le symbole de la devise
 * @param {number} amount - Montant à formater
 * @param {string} currency - Devise (FCFA, EUR, USD)
 * @returns {string} Prix formaté
 */
export const formatPrice = (amount, currency) => {
  const symbols = {
    FCFA: 'FCFA',
    EUR: '€',
    USD: '$',
  }

  const symbol = symbols[currency] || currency
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return currency === 'FCFA' 
    ? `${formattedAmount} ${symbol}` 
    : `${symbol}${formattedAmount}`
}

export default {
  convertCurrency,
  convertToAllCurrencies,
  formatPrice,
  EXCHANGE_RATES,
}

