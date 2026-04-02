# 🔒 Sécurité Avancée - Guide d'Utilisation

## 📋 Vue d'ensemble

Ce document décrit les fonctionnalités de sécurité avancées implémentées dans BAOBAB :
- Configuration des variables d'environnement pour la production
- Système de monitoring des logs de sécurité
- Authentification à deux facteurs (2FA)
- Détection d'anomalies automatique

---

## 1. ⚙️ Configuration des Variables d'Environnement

### Fichier de Configuration

Un fichier `ENV_EXAMPLE.md` a été créé avec toutes les variables nécessaires. Copiez son contenu dans un fichier `.env` à la racine du dossier `server/`.

### Variables Critiques pour la Production

```env
# ⚠️ OBLIGATOIRE en production
NODE_ENV=production
JWT_SECRET=<générer avec: openssl rand -base64 32>
MONGODB_URI=<votre URI MongoDB sécurisée>
FRONTEND_URL=https://votre-domaine.com

# Sécurité
FORCE_HTTPS=true
CORS_ORIGIN=https://votre-domaine.com

# Monitoring
ENABLE_ANOMALY_ALERTS=true
ANOMALY_ALERT_EMAIL=admin@votre-domaine.com
```

### Validation Automatique

Le système valide automatiquement :
- ✅ Présence des variables requises
- ✅ Force du JWT_SECRET (minimum 32 caractères en production)
- ✅ Configuration email pour les alertes
- ✅ Avertissements pour les configurations manquantes

---

## 2. 📊 Système de Monitoring

### Endpoints Disponibles

Tous les endpoints nécessitent une authentification admin.

#### GET `/api/monitoring/security/stats`
Retourne les statistiques de sécurité.

**Paramètres de requête :**
- `hours` (optionnel) : Nombre d'heures à analyser (défaut: 24)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "uptime": 86400,
    "totalEvents": 150,
    "eventsByType": {
      "LOGIN_SUCCESS": 50,
      "LOGIN_FAILED": 20,
      "2FA_ENABLED": 5
    },
    "eventsBySeverity": {
      "low": 100,
      "medium": 40,
      "high": 10
    },
    "recentEvents": 50,
    "alerts": 5,
    "anomalyStats": {
      "failedLoginAttempts": 3,
      "suspiciousIPs": 1
    }
  }
}
```

#### GET `/api/monitoring/security/events`
Retourne les événements récents.

**Paramètres de requête :**
- `limit` (optionnel) : Nombre d'événements (défaut: 50)
- `severity` (optionnel) : Filtrer par sévérité (low, medium, high, critical)

#### GET `/api/monitoring/security/alerts`
Retourne les alertes récentes.

**Paramètres de requête :**
- `limit` (optionnel) : Nombre d'alertes (défaut: 20)

### Types d'Événements Surveillés

- `LOGIN_SUCCESS` / `LOGIN_FAILED`
- `2FA_ENABLED` / `2FA_DISABLED` / `2FA_VERIFICATION_FAILED`
- `PASSWORD_CHANGE`
- `INJECTION_ATTEMPT`
- `SUSPICIOUS_UPLOAD`
- `UNAUTHORIZED_ACCESS`
- `RATE_LIMIT_EXCEEDED`
- `ANOMALY_DETECTED`

---

## 3. 🔐 Authentification à Deux Facteurs (2FA)

### Fonctionnalités

- ✅ Génération de secrets TOTP
- ✅ QR codes pour configuration
- ✅ Codes de sauvegarde (backup codes)
- ✅ Vérification lors de la connexion
- ✅ Désactivation sécurisée

### Endpoints

#### GET `/api/auth/2fa/setup`
Initialise la 2FA pour l'utilisateur connecté.

**Réponse :**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeURL": "otpauth://totp/BAOBAB:user@example.com?secret=...",
  "message": "Scannez le QR code avec votre application d'authentification"
}
```

#### POST `/api/auth/2fa/verify`
Vérifie et active la 2FA.

**Body :**
```json
{
  "token": "123456"
}
```

**Réponse :**
```json
{
  "message": "2FA activée avec succès",
  "backupCodes": ["ABC12345", "DEF67890", ...]
}
```

⚠️ **IMPORTANT** : Sauvegardez les codes de sauvegarde ! Ils ne seront affichés qu'une seule fois.

#### POST `/api/auth/2fa/disable`
Désactive la 2FA.

**Body :**
```json
{
  "password": "votre-mot-de-passe",
  "token": "123456" // Optionnel si vous avez le mot de passe
}
```

#### POST `/api/auth/2fa/verify-login`
Vérifie le code 2FA lors de la connexion (après authentification par mot de passe).

**Body :**
```json
{
  "email": "user@example.com",
  "token": "123456" // OU "backupCode": "ABC12345"
}
```

#### GET `/api/auth/2fa/status`
Retourne le statut de la 2FA pour l'utilisateur connecté.

**Réponse :**
```json
{
  "enabled": true,
  "verified": true,
  "lastUsed": "2025-01-15T10:30:00.000Z",
  "backupCodesRemaining": 8
}
```

### Applications Compatibles

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Bitwarden

### Intégration dans le Flow de Connexion

1. L'utilisateur se connecte avec email/mot de passe
2. Si la 2FA est activée, le serveur retourne `requires2FA: true`
3. Le client demande le code TOTP
4. L'utilisateur entre le code
5. Le client appelle `/api/auth/2fa/verify-login`
6. Si valide, la connexion est complète

---

## 4. 🚨 Détection d'Anomalies

### Types d'Anomalies Détectées

#### 1. **Tentatives de Connexion Multiples**
- Seuil : 5 tentatives échouées (configurable)
- Fenêtre : 15 minutes (configurable)
- Sévérité : High
- Action : Alerte email automatique

#### 2. **Changement d'IP Suspect**
- Détection : Nouvelle IP différente de la dernière session
- Sévérité : Medium
- Action : Log et alerte si configuré

#### 3. **Changement de Device Suspect**
- Détection : Nouveau user agent différent
- Sévérité : Medium
- Action : Log et alerte si configuré

#### 4. **Tentatives d'Injection**
- Détection : Tentatives NoSQL/XSS
- Sévérité : High
- Action : Blocage et alerte

#### 5. **Rate Limiting Dépassé**
- Détection : Trop de requêtes
- Sévérité : Low
- Action : Blocage temporaire

### Configuration

Variables d'environnement :

```env
MAX_FAILED_LOGIN_ATTEMPTS=5
ANOMALY_DETECTION_WINDOW=15
ENABLE_ANOMALY_ALERTS=true
ANOMALY_ALERT_EMAIL=admin@votre-domaine.com
```

### Alertes Automatiques

Les alertes sont envoyées par email lorsque :
- Une anomalie de sévérité `high` ou `critical` est détectée
- Le cooldown de 15 minutes est respecté (pas de spam)

**Format de l'alerte :**
- Sujet : `[BAOBAB] Alerte de Sécurité - HIGH`
- Contenu : Type d'anomalie, détails, timestamp

### Actions Automatiques

Pour les anomalies de haute sévérité :
- Logging détaillé
- Envoi d'alerte email
- (Optionnel) Désactivation temporaire du compte après 10 tentatives

---

## 5. 📝 Logging de Sécurité

### Types de Logs

Tous les événements de sécurité sont loggés avec :
- Timestamp
- Type d'événement
- Sévérité
- Données contextuelles (IP, user agent, etc.)

### Fichiers de Logs

- `server/logs/combined.log` : Tous les logs
- `server/logs/error.log` : Erreurs uniquement

### Format des Logs

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "message": "[SECURITY] LOGIN_ATTEMPT",
  "event": "LOGIN_ATTEMPT",
  "success": true,
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "severity": "low"
}
```

---

## 6. 🛠️ Utilisation Pratique

### Déploiement en Production

1. **Configurer les variables d'environnement**
   ```bash
   cp ENV_EXAMPLE.md .env
   # Éditer .env avec vos valeurs
   ```

2. **Générer un JWT_SECRET fort**
   ```bash
   openssl rand -base64 32
   ```

3. **Configurer les alertes**
   - Définir `ANOMALY_ALERT_EMAIL`
   - Activer `ENABLE_ANOMALY_ALERTS=true`

4. **Activer HTTPS**
   - Définir `FORCE_HTTPS=true`
   - Configurer votre reverse proxy (Nginx, etc.)

5. **Configurer CORS**
   - Définir `CORS_ORIGIN` avec votre domaine de production

### Monitoring Quotidien

1. Vérifier les alertes : `GET /api/monitoring/security/alerts`
2. Consulter les statistiques : `GET /api/monitoring/security/stats`
3. Analyser les événements récents : `GET /api/monitoring/security/events`

### Recommandations

- ✅ Activer la 2FA pour tous les comptes admin
- ✅ Configurer les alertes email
- ✅ Consulter les logs quotidiennement
- ✅ Configurer un système de rotation des logs
- ✅ Utiliser un service de monitoring externe (Sentry, etc.)

---

## 7. 🔧 Dépannage

### Problème : Les alertes ne sont pas envoyées

**Vérifications :**
1. `ENABLE_ANOMALY_ALERTS=true` dans `.env`
2. `ANOMALY_ALERT_EMAIL` est défini
3. Configuration SMTP correcte
4. Vérifier les logs pour les erreurs d'envoi

### Problème : La 2FA ne fonctionne pas

**Vérifications :**
1. Le secret est correctement stocké en base
2. L'application d'authentification est synchronisée
3. Le code est entré dans les 30 secondes
4. Vérifier la fenêtre de tolérance (`TOTP_WINDOW`)

### Problème : Trop de faux positifs dans les anomalies

**Solutions :**
1. Ajuster `MAX_FAILED_LOGIN_ATTEMPTS`
2. Ajuster `ANOMALY_DETECTION_WINDOW`
3. Ajouter des IPs de confiance (à implémenter)

---

## 8. 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

*Document créé le : 2025*
*Dernière mise à jour : 2025*

