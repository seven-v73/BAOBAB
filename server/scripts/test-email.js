import { sendEmail } from '../src/utils/emailService.js'
import env from '../src/config/env.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script de test pour vérifier la configuration email
 * Usage: node scripts/test-email.js
 */

const testEmail = async () => {
  console.log('📧 Test de configuration email...\n')

  // Vérifier la configuration
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.error('❌ Configuration email incomplète !')
    console.error('Vérifiez les variables suivantes dans .env:')
    console.error('  - SMTP_HOST')
    console.error('  - SMTP_USER')
    console.error('  - SMTP_PASS')
    process.exit(1)
  }

  if (!env.ANOMALY_ALERT_EMAIL) {
    console.error('❌ ANOMALY_ALERT_EMAIL non configuré !')
    console.error('Définissez cette variable dans .env pour recevoir les alertes.')
    process.exit(1)
  }

  console.log('Configuration détectée:')
  console.log(`  Host: ${env.SMTP_HOST}`)
  console.log(`  Port: ${env.SMTP_PORT}`)
  console.log(`  User: ${env.SMTP_USER}`)
  console.log(`  From: ${env.EMAIL_FROM}`)
  console.log(`  To: ${env.ANOMALY_ALERT_EMAIL}\n`)

  try {
    console.log('Envoi de l\'email de test...')
    
    const html = `
      <h1>✅ Test de Configuration Email Réussi</h1>
      <p>Votre configuration email fonctionne correctement !</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Serveur:</strong> ${env.SMTP_HOST}:${env.SMTP_PORT}</p>
      <hr>
      <p><small>Cet email confirme que les alertes de sécurité seront correctement envoyées.</small></p>
    `
    
    await sendEmail(
      env.ANOMALY_ALERT_EMAIL,
      '[BAOBAB] Test de Configuration Email',
      html
    )

    console.log('✅ Email envoyé avec succès !')
    console.log(`📬 Vérifiez votre boîte de réception: ${env.ANOMALY_ALERT_EMAIL}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:')
    console.error(`   ${error.message}`)
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Suggestion: Vérifiez vos identifiants SMTP')
      console.error('   Pour Gmail, utilisez un App Password:')
      console.error('   https://myaccount.google.com/apppasswords')
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Suggestion: Vérifiez la connexion réseau et le SMTP_HOST')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Suggestion: Vérifiez que le port SMTP est correct et accessible')
    }
    
    process.exit(1)
  }
}

testEmail()

