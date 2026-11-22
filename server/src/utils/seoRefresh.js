import logger from './logger.js'

/**
 * Régénère les pages SEO peu après une publication (ou un retrait), au lieu d'attendre le passage
 * des 30 minutes : une fiche publiée par l'équipe est visible des moteurs presque tout de suite.
 * Plusieurs publications rapprochées ne déclenchent qu'une génération.
 */
let timer = null

export const demanderRegenerationSeo = (delai = 60_000) => {
  if (!process.env.SEO_DIST_DIR || process.env.NODE_ENV === 'test') return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      const { buildSeo } = await import('../scripts/buildSeo.js')
      const count = await buildSeo()
      logger.info(`SEO : ${count} pages régénérées après publication`)
    } catch (error) {
      logger.warn(`SEO : régénération impossible : ${error.message}`)
    }
  }, delai)
  timer.unref?.()
}
