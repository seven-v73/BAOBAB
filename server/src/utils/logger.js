import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'baobab-api' },
  transports: [
    // Écrire tous les logs d'erreur dans error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Écrire tous les logs dans combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
  ],
})

// En développement, aussi logger dans la console avec un format lisible
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`
        if (Object.keys(meta).length > 0 && meta.stack) {
          msg += `\n${meta.stack}`
        } else if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`
        }
        return msg
      })
    )
  }))
} else {
  // En production, logger en JSON dans la console
  logger.add(new winston.transports.Console({
    format: winston.format.json()
  }))
}

export default logger

