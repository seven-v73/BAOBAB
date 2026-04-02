import env from '../src/config/env.js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

/**
 * Script de vérification de la configuration de sécurité
 * Usage: node scripts/check-security.js
 */

const checkSecurity = () => {
  console.log('🔒 Vérification de la Configuration de Sécurité\n')
  console.log('=' .repeat(50))

  let issues = []
  let warnings = []
  let passed = []

  // Vérification 1: NODE_ENV
  console.log('\n1. Environnement...')
  if (env.NODE_ENV === 'production') {
    passed.push('NODE_ENV est défini sur production')
    console.log('   ✅ NODE_ENV: production')
  } else {
    warnings.push('NODE_ENV n\'est pas en production')
    console.log(`   ⚠️  NODE_ENV: ${env.NODE_ENV} (devrait être 'production')`)
  }

  // Vérification 2: JWT_SECRET
  console.log('\n2. JWT_SECRET...')
  if (!env.JWT_SECRET) {
    issues.push('JWT_SECRET est manquant')
    console.log('   ❌ JWT_SECRET: MANQUANT')
  } else if (env.JWT_SECRET.length < 32) {
    issues.push('JWT_SECRET est trop court (minimum 32 caractères)')
    console.log(`   ❌ JWT_SECRET: Trop court (${env.JWT_SECRET.length} caractères)`)
  } else if (env.JWT_SECRET.includes('your-secret') || env.JWT_SECRET.includes('change-in-production')) {
    issues.push('JWT_SECRET utilise une valeur par défaut non sécurisée')
    console.log('   ❌ JWT_SECRET: Valeur par défaut détectée')
  } else {
    passed.push('JWT_SECRET est configuré et sécurisé')
    console.log(`   ✅ JWT_SECRET: Configuré (${env.JWT_SECRET.length} caractères)`)
  }

  // Vérification 3: MONGODB_URI
  console.log('\n3. MongoDB...')
  if (!env.MONGODB_URI) {
    issues.push('MONGODB_URI est manquant')
    console.log('   ❌ MONGODB_URI: MANQUANT')
  } else if (env.MONGODB_URI.includes('localhost') && env.NODE_ENV === 'production') {
    warnings.push('MONGODB_URI pointe vers localhost en production')
    console.log('   ⚠️  MONGODB_URI: Pointe vers localhost (non recommandé en production)')
  } else {
    passed.push('MONGODB_URI est configuré')
    console.log('   ✅ MONGODB_URI: Configuré')
  }

  // Vérification 4: Email
  console.log('\n4. Configuration Email...')
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    warnings.push('Configuration email incomplète')
    console.log('   ⚠️  Configuration email: Incomplète')
  } else {
    passed.push('Configuration email complète')
    console.log('   ✅ Configuration email: Complète')
  }

  if (!env.ANOMALY_ALERT_EMAIL) {
    warnings.push('ANOMALY_ALERT_EMAIL non configuré')
    console.log('   ⚠️  ANOMALY_ALERT_EMAIL: Non configuré')
  } else {
    passed.push('ANOMALY_ALERT_EMAIL configuré')
    console.log(`   ✅ ANOMALY_ALERT_EMAIL: ${env.ANOMALY_ALERT_EMAIL}`)
  }

  // Vérification 5: HTTPS
  console.log('\n5. HTTPS...')
  if (env.NODE_ENV === 'production' && !env.FORCE_HTTPS) {
    warnings.push('FORCE_HTTPS n\'est pas activé en production')
    console.log('   ⚠️  FORCE_HTTPS: Non activé')
  } else if (env.FORCE_HTTPS) {
    passed.push('FORCE_HTTPS est activé')
    console.log('   ✅ FORCE_HTTPS: Activé')
  } else {
    console.log('   ℹ️  FORCE_HTTPS: Non nécessaire en développement')
  }

  // Vérification 6: CORS
  console.log('\n6. CORS...')
  if (env.NODE_ENV === 'production' && !env.CORS_ORIGIN) {
    warnings.push('CORS_ORIGIN non configuré en production')
    console.log('   ⚠️  CORS_ORIGIN: Non configuré')
  } else if (env.CORS_ORIGIN) {
    passed.push('CORS_ORIGIN est configuré')
    console.log(`   ✅ CORS_ORIGIN: ${env.CORS_ORIGIN}`)
  } else {
    console.log('   ℹ️  CORS_ORIGIN: Utilise la valeur par défaut')
  }

  // Vérification 7: Détection d'anomalies
  console.log('\n7. Détection d\'Anomalies...')
  if (!env.ENABLE_ANOMALY_ALERTS) {
    warnings.push('ENABLE_ANOMALY_ALERTS n\'est pas activé')
    console.log('   ⚠️  ENABLE_ANOMALY_ALERTS: Non activé')
  } else {
    passed.push('ENABLE_ANOMALY_ALERTS est activé')
    console.log('   ✅ ENABLE_ANOMALY_ALERTS: Activé')
  }

  // Vérification 8: Rate Limiting
  console.log('\n8. Rate Limiting...')
  if (env.RATE_LIMIT_MAX_REQUESTS > 1000 && env.NODE_ENV === 'production') {
    warnings.push('RATE_LIMIT_MAX_REQUESTS est très élevé en production')
    console.log(`   ⚠️  RATE_LIMIT_MAX_REQUESTS: ${env.RATE_LIMIT_MAX_REQUESTS} (élevé)`)
  } else {
    passed.push('Rate limiting configuré')
    console.log(`   ✅ RATE_LIMIT_MAX_REQUESTS: ${env.RATE_LIMIT_MAX_REQUESTS}`)
  }

  // Résumé
  console.log('\n' + '='.repeat(50))
  console.log('\n📊 RÉSUMÉ\n')
  
  console.log(`✅ Tests réussis: ${passed.length}`)
  console.log(`⚠️  Avertissements: ${warnings.length}`)
  console.log(`❌ Problèmes critiques: ${issues.length}\n`)

  if (issues.length > 0) {
    console.log('❌ PROBLÈMES CRITIQUES À CORRIGER:')
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`)
    })
    console.log('')
  }

  if (warnings.length > 0) {
    console.log('⚠️  AVERTISSEMENTS (recommandés pour la production):')
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`)
    })
    console.log('')
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('🎉 Configuration parfaite ! Tous les tests sont passés.\n')
    process.exit(0)
  } else if (issues.length === 0) {
    console.log('✅ Configuration acceptable. Corrigez les avertissements pour une sécurité optimale.\n')
    process.exit(0)
  } else {
    console.log('❌ Veuillez corriger les problèmes critiques avant le déploiement.\n')
    process.exit(1)
  }
}

checkSecurity()

