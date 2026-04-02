import * as Sentry from '@sentry/node'
import env from '../config/env.js'

/**
 * Initialise Sentry pour le monitoring d'erreurs
 */
export const initSentry = () => {
  if (!env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN non configuré - Monitoring désactivé')
    return
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined }),
    ],
  })

  console.log('✅ Sentry initialisé')
}

/**
 * Wrapper pour capturer les erreurs
 */
export const captureException = (error, context = {}) => {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context
    })
  }
}

/**
 * Capture un message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context
    })
  }
}

export default {
  initSentry,
  captureException,
  captureMessage
}

