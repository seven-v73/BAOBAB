// Bornes communes de pagination pour les listes de l'API.
// Avant : une page négative faisait planter MongoDB (500) et limit=100000 renvoyait toute la collection.
export const MAX_PAGE_SIZE = 200

export const boundPagination = (req, res, next) => {
  // /api/products garde son propre validateur (jusqu'à 1000, pour l'écran d'administration)
  if (req.path.startsWith('/products')) return next()
  const { page, limit } = req.query
  if (page !== undefined) {
    const value = parseInt(page, 10)
    req.query.page = String(Number.isFinite(value) && value >= 1 ? value : 1)
  }
  if (limit !== undefined) {
    const value = parseInt(limit, 10)
    req.query.limit = String(Number.isFinite(value) && value >= 1 ? Math.min(value, MAX_PAGE_SIZE) : 20)
  }
  next()
}
