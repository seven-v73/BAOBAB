import { generateSecret, generateQRCodeURL, generateTOTP, verifyTOTP } from '../src/utils/totp.js'

// Configuration TOTP pour les tests (sans charger env.js qui nécessite MongoDB)
const TOTP_ISSUER = process.env.TOTP_ISSUER || 'BAOBAB'
const TOTP_WINDOW = parseInt(process.env.TOTP_WINDOW) || 2

/**
 * Script de test pour vérifier le fonctionnement du TOTP
 * Usage: node scripts/test-2fa.js
 */

const test2FA = async () => {
  console.log('🔐 Test du système 2FA (TOTP)...\n')

  // Test 1: Génération de secret
  console.log('1. Génération d\'un secret...')
  const secret = generateSecret()
  console.log(`   ✅ Secret généré: ${secret}\n`)

  // Test 2: Génération de QR Code URL
  console.log('2. Génération de QR Code URL...')
  const qrCodeURL = generateQRCodeURL(secret, 'test@example.com', TOTP_ISSUER)
  console.log(`   ✅ QR Code URL: ${qrCodeURL}\n`)
  console.log('   💡 Scannez ce QR code avec votre application d\'authentification\n')

  // Test 3: Génération de code TOTP
  console.log('3. Génération de code TOTP...')
  const code = generateTOTP(secret)
  console.log(`   ✅ Code généré: ${code}\n`)
  console.log('   ⏱️  Ce code est valide pendant 30 secondes\n')

  // Test 4: Vérification du code
  console.log('4. Vérification du code...')
  const isValid = verifyTOTP(secret, code)
  if (isValid) {
    console.log('   ✅ Code vérifié avec succès !\n')
  } else {
    console.log('   ❌ Code invalide\n')
    process.exit(1)
  }

  // Test 5: Vérification avec fenêtre de tolérance
  console.log('5. Test de la fenêtre de tolérance...')
  console.log(`   Fenêtre configurée: ${TOTP_WINDOW} périodes (±${TOTP_WINDOW * 30} secondes)`)
  
  // Générer un nouveau code et le vérifier
  const newCode = generateTOTP(secret)
  const isValidWithWindow = verifyTOTP(secret, newCode, TOTP_WINDOW)
  
  if (isValidWithWindow) {
    console.log('   ✅ Vérification avec fenêtre de tolérance réussie !\n')
  } else {
    console.log('   ❌ Échec de la vérification avec fenêtre de tolérance\n')
    process.exit(1)
  }

  // Test 6: Test avec code invalide
  console.log('6. Test avec code invalide...')
  const invalidCode = '000000'
  const isInvalid = verifyTOTP(secret, invalidCode)
  if (!isInvalid) {
    console.log('   ✅ Code invalide correctement rejeté !\n')
  } else {
    console.log('   ❌ Code invalide accepté (problème de sécurité !)\n')
    process.exit(1)
  }

  console.log('✅ Tous les tests sont passés avec succès !')
  console.log('\n📝 Prochaines étapes:')
  console.log('   1. Scannez le QR code avec votre application d\'authentification')
  console.log('   2. Utilisez le code généré pour tester la 2FA via l\'API')
  console.log('   3. Vérifiez que les codes changent toutes les 30 secondes')
  
  process.exit(0)
}

test2FA().catch(error => {
  console.error('❌ Erreur lors du test:', error.message)
  process.exit(1)
})

