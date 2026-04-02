# 📘 Guide de Configuration Complète - BAOBAB

## 🎯 Vue d'ensemble

Ce guide vous accompagne étape par étape pour configurer toutes les fonctionnalités de sécurité avancées de BAOBAB.

---

## 1. 📦 Installation des Dépendances

### Vérification des Dépendances

Toutes les dépendances nécessaires sont déjà dans `package.json`. Le système TOTP est implémenté en natif avec Node.js (crypto), donc aucune dépendance supplémentaire n'est requise.

### Installation

```bash
cd server
npm install
```

### Vérification

```bash
# Vérifier que toutes les dépendances sont installées
npm list --depth=0
```

**Dépendances critiques pour la sécurité :**
- ✅ `bcryptjs` - Hashage des mots de passe
- ✅ `jsonwebtoken` - Tokens JWT
- ✅ `helmet` - Headers de sécurité
- ✅ `express-rate-limit` - Rate limiting
- ✅ `express-validator` - Validation des entrées
- ✅ `winston` - Logging

---

## 2. ⚙️ Configuration du Fichier .env

### Étape 1 : Créer le fichier .env

```bash
cd server
cp ENV_EXAMPLE.md .env
# Ou créez un fichier .env vide et copiez le contenu de ENV_EXAMPLE.md
```

### Étape 2 : Générer un JWT_SECRET Fort

**⚠️ CRITIQUE pour la production**

```bash
# Option 1 : Avec OpenSSL (recommandé)
openssl rand -base64 32

# Option 2 : Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3 : En ligne (moins sécurisé)
# https://www.grc.com/passwords.htm
```

**Exemple de sortie :**
```
K8j3mN9pQ2rT5vX7zA1bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
```

### Étape 3 : Configuration Complète pour la Production

```env
# ============================================
# ENVIRONNEMENT
# ============================================
NODE_ENV=production

# ============================================
# SERVEUR
# ============================================
PORT=3000
FRONTEND_URL=https://votre-domaine.com

# ============================================
# BASE DE DONNÉES
# ============================================
# MongoDB Atlas (recommandé pour la production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baobab?retryWrites=true&w=majority

# ============================================
# SÉCURITÉ - JWT
# ============================================
# ⚠️ Utilisez la valeur générée à l'étape 2
JWT_SECRET=K8j3mN9pQ2rT5vX7zA1bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# SÉCURITÉ - 2FA
# ============================================
TOTP_ISSUER=BAOBAB
TOTP_WINDOW=2

# ============================================
# REDIS (Optionnel mais recommandé)
# ============================================
# Pour le cache et le rate limiting distribué
REDIS_URL=redis://username:password@your-redis-host:6379

# ============================================
# CLOUDINARY (Stockage de fichiers)
# ============================================
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# ============================================
# STRIPE (Paiements)
# ============================================
# Utilisez les clés de PRODUCTION (sk_live_...)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# ============================================
# EMAIL (SMTP) - CRITIQUE pour les alertes
# ============================================
# Gmail (avec App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password
EMAIL_FROM=noreply@votre-domaine.com

# Ou avec SendGrid
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=votre-api-key-sendgrid

# Ou avec Mailgun
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_USER=postmaster@votre-domaine.mailgun.org
# SMTP_PASS=votre-api-key-mailgun

# ============================================
# MONITORING & LOGGING
# ============================================
LOG_LEVEL=warn
# Production: error, warn
# Développement: info, debug

# Sentry DSN (Optionnel mais recommandé)
SENTRY_DSN=https://votre-dsn@sentry.io/project-id

# ============================================
# DÉTECTION D'ANOMALIES
# ============================================
MAX_FAILED_LOGIN_ATTEMPTS=5
ANOMALY_DETECTION_WINDOW=15
ENABLE_ANOMALY_ALERTS=true
ANOMALY_ALERT_EMAIL=admin@votre-domaine.com

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_AUTH_MAX=5

# ============================================
# SÉCURITÉ SUPPLÉMENTAIRE
# ============================================
CORS_ORIGIN=https://votre-domaine.com
FORCE_HTTPS=true
```

### Étape 4 : Vérification de la Configuration

```bash
# Démarrer le serveur pour vérifier
npm run dev

# Le serveur devrait :
# ✅ Se connecter à MongoDB
# ✅ Valider toutes les variables requises
# ✅ Afficher des avertissements pour les configurations manquantes
```

---

## 3. 📧 Configuration des Alertes Email

### Option 1 : Gmail (Recommandé pour débuter)

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail
2. **Générer un App Password** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Other (Custom name)"
   - Entrez "BAOBAB" comme nom
   - Copiez le mot de passe généré (16 caractères)

3. **Configurer dans .env** :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe généré (sans espaces)
EMAIL_FROM=noreply@votre-domaine.com
```

### Option 2 : SendGrid

1. **Créer un compte** sur https://sendgrid.com
2. **Générer une API Key** :
   - Settings > API Keys > Create API Key
   - Donnez-lui les permissions "Mail Send"
   - Copiez la clé

3. **Configurer dans .env** :
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
EMAIL_FROM=noreply@votre-domaine.com
```

### Option 3 : Mailgun

1. **Créer un compte** sur https://mailgun.com
2. **Récupérer les credentials** :
   - Dashboard > Sending > SMTP credentials
   - Copiez le username et password

3. **Configurer dans .env** :
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-api-key-mailgun
EMAIL_FROM=noreply@votre-domaine.com
```

### Test de Configuration Email

Créez un fichier de test :

```javascript
// server/test-email.js
import { sendEmail } from './src/utils/emailService.js'
import env from './src/config/env.js'

const testEmail = async () => {
  try {
    await sendEmail({
      to: env.ANOMALY_ALERT_EMAIL,
      subject: 'Test Email - BAOBAB',
      html: '<h1>Test réussi !</h1><p>Votre configuration email fonctionne correctement.</p>'
    })
    console.log('✅ Email envoyé avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message)
  }
  process.exit(0)
}

testEmail()
```

Exécutez le test :
```bash
node server/test-email.js
```

---

## 4. 🔐 Test de la 2FA

### Étape 1 : Installer une Application d'Authentification

**Applications recommandées :**
- **Google Authenticator** (iOS/Android)
- **Microsoft Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **1Password** (iOS/Android/Desktop)
- **Bitwarden** (iOS/Android/Desktop)

### Étape 2 : Initialiser la 2FA via l'API

**1. Se connecter et obtenir un token :**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre-email@example.com",
    "password": "votre-mot-de-passe"
  }'
```

**2. Initialiser la 2FA :**
```bash
curl -X GET http://localhost:3000/api/auth/2fa/setup \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Réponse :**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeURL": "otpauth://totp/BAOBAB:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=BAOBAB",
  "message": "Scannez le QR code avec votre application d'authentification"
}
```

**3. Scanner le QR Code :**
- Ouvrez votre application d'authentification
- Ajoutez un nouveau compte
- Scannez le QR code (ou entrez le secret manuellement)
- Notez le code à 6 chiffres généré

**4. Vérifier et activer la 2FA :**
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

**Réponse :**
```json
{
  "message": "2FA activée avec succès",
  "backupCodes": ["ABC12345", "DEF67890", ...]
}
```

⚠️ **IMPORTANT** : Sauvegardez les codes de sauvegarde dans un endroit sûr !

### Étape 3 : Tester la Connexion avec 2FA

**1. Se connecter avec email/mot de passe :**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre-email@example.com",
    "password": "votre-mot-de-passe"
  }'
```

**2. Si la 2FA est activée, vous devrez vérifier le code :**
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "votre-email@example.com",
    "token": "123456"
  }'
```

### Étape 4 : Vérifier le Statut

```bash
curl -X GET http://localhost:3000/api/auth/2fa/status \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 5. 📊 Monitoring de Sécurité

### Consultation des Statistiques

**1. Statistiques globales :**
```bash
curl -X GET http://localhost:3000/api/monitoring/security/stats?hours=24 \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

**2. Événements récents :**
```bash
curl -X GET http://localhost:3000/api/monitoring/security/events?limit=50 \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

**3. Alertes récentes :**
```bash
curl -X GET http://localhost:3000/api/monitoring/security/alerts?limit=20 \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

### Dashboard Recommandé

Créez un dashboard simple pour visualiser les métriques :

```html
<!-- dashboard.html -->
<!DOCTYPE html>
<html>
<head>
  <title>BAOBAB Security Monitoring</title>
</head>
<body>
  <h1>Security Monitoring Dashboard</h1>
  <div id="stats"></div>
  <div id="events"></div>
  <div id="alerts"></div>
  
  <script>
    const token = 'VOTRE_TOKEN_ADMIN'
    
    // Charger les statistiques
    fetch('/api/monitoring/security/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      document.getElementById('stats').innerHTML = 
        `<pre>${JSON.stringify(data, null, 2)}</pre>`
    })
    
    // Charger les événements
    fetch('/api/monitoring/security/events?limit=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      document.getElementById('events').innerHTML = 
        `<pre>${JSON.stringify(data, null, 2)}</pre>`
    })
    
    // Charger les alertes
    fetch('/api/monitoring/security/alerts?limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      document.getElementById('alerts').innerHTML = 
        `<pre>${JSON.stringify(data, null, 2)}</pre>`
    })
  </script>
</body>
</html>
```

### Surveillance Quotidienne

**Checklist quotidienne :**
- [ ] Vérifier les alertes de sécurité
- [ ] Consulter les tentatives de connexion échouées
- [ ] Vérifier les anomalies détectées
- [ ] Examiner les logs d'erreur
- [ ] Vérifier les statistiques de rate limiting

**Checklist hebdomadaire :**
- [ ] Analyser les tendances de sécurité
- [ ] Vérifier les comptes avec 2FA activée
- [ ] Examiner les sessions suspectes
- [ ] Réviser les configurations de sécurité

---

## 6. ✅ Checklist de Déploiement

### Avant le Déploiement

- [ ] Fichier `.env` configuré avec toutes les variables
- [ ] `JWT_SECRET` généré et fort (32+ caractères)
- [ ] `MONGODB_URI` pointant vers une base de données sécurisée
- [ ] Configuration email testée et fonctionnelle
- [ ] `FRONTEND_URL` configuré avec le domaine de production
- [ ] `CORS_ORIGIN` configuré correctement
- [ ] `FORCE_HTTPS=true` activé
- [ ] `ENABLE_ANOMALY_ALERTS=true` activé
- [ ] `ANOMALY_ALERT_EMAIL` configuré
- [ ] `LOG_LEVEL=warn` ou `error` pour la production

### Après le Déploiement

- [ ] Tester la connexion
- [ ] Tester la 2FA
- [ ] Vérifier l'envoi d'alertes email
- [ ] Consulter le monitoring de sécurité
- [ ] Vérifier les logs
- [ ] Tester le rate limiting
- [ ] Vérifier les headers de sécurité (Helmet)

---

## 7. 🆘 Dépannage

### Problème : Erreur "Variable d'environnement manquante"

**Solution :**
1. Vérifiez que le fichier `.env` existe dans `server/`
2. Vérifiez que toutes les variables requises sont présentes
3. Redémarrez le serveur après modification

### Problème : Email non envoyé

**Solution :**
1. Vérifiez les credentials SMTP
2. Testez avec le script `test-email.js`
3. Vérifiez les logs pour les erreurs
4. Pour Gmail, assurez-vous d'utiliser un App Password

### Problème : 2FA ne fonctionne pas

**Solution :**
1. Vérifiez que le secret est correctement stocké
2. Assurez-vous que l'application d'authentification est synchronisée
3. Vérifiez que le code est entré dans les 30 secondes
4. Vérifiez la fenêtre de tolérance (`TOTP_WINDOW`)

### Problème : Monitoring inaccessible

**Solution :**
1. Vérifiez que vous êtes authentifié avec un compte admin
2. Vérifiez que le token JWT est valide
3. Consultez les logs pour les erreurs d'autorisation

---

## 8. 📚 Ressources Supplémentaires

- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Documentation SendGrid](https://docs.sendgrid.com/)
- [Documentation Mailgun](https://documentation.mailgun.com/)
- [Guide OWASP](https://owasp.org/www-project-top-ten/)

---

*Guide créé le : 2025*
*Dernière mise à jour : 2025*

