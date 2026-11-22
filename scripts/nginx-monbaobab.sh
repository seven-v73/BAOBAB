#!/usr/bin/env bash
# Configuration nginx de monbaobab.com : sécurité, cache, vraies pages 404, redirection de www.
#
#   sudo bash nginx-monbaobab.sh             # applique (sauvegarde, test, vérifications, retour arrière auto)
#   sudo bash nginx-monbaobab.sh --annuler   # remet la configuration d'avant
#
# Ce qui change par rapport à la configuration d'origine (aaPanel) :
#   - en-têtes de sécurité sur les pages (HSTS, CSP, anti-iframe, nosniff, referrer, permissions) ;
#     les réponses de l'API gardent les leurs (posés par l'API elle-même) ;
#   - fichiers JS/CSS gardés un an par le navigateur (leur nom change à chaque version), images 7 jours,
#     pages HTML revalidées à chaque visite ;
#   - www.monbaobab.com et http:// redirigent en une fois vers https://monbaobab.com ;
#   - une adresse inconnue répond 404 avec la page « Page introuvable » (au lieu de la page d'accueil) ;
#     les pages de l'application non pré-générées (connexion, recherche…) reçoivent la coquille du site ;
#   - /favicon.ico sert le symbole de la marque.
# Les blocs /api, /api/ et /api-docs sont repris à l'identique.
set -euo pipefail

VHOST=/www/server/panel/vhost/nginx/www.monbaobab.com.conf
ENTETES=/www/server/nginx/conf/monbaobab-entetes.conf
NGINX=/www/server/nginx/sbin/nginx
NGINX_CONF=/www/server/nginx/conf/nginx.conf
DIST=/www/wwwroot/BAOBAB/dist
SAUVEGARDE_DIR=/root/monbaobab/nginx
SITE=https://monbaobab.com

[ "$(id -u)" -eq 0 ] || { echo "Lancez ce script avec sudo."; exit 1; }
[ -x "$NGINX" ] || { echo "nginx d'aaPanel introuvable ($NGINX)."; exit 1; }
[ -f "$VHOST" ] || { echo "Configuration du site introuvable ($VHOST)."; exit 1; }

ok() { printf '\033[1;32mOK\033[0m  %s\n' "$*"; }
ko() { printf '\033[1;31mKO\033[0m  %s\n' "$*"; }

recharger() { "$NGINX" -t -c "$NGINX_CONF" && "$NGINX" -s reload -c "$NGINX_CONF"; }

if [ "${1:-}" = "--annuler" ]; then
  DERNIERE=$(ls -1t "$SAUVEGARDE_DIR"/www.monbaobab.com.conf.* 2>/dev/null | head -1 || true)
  [ -n "$DERNIERE" ] || { echo "Aucune sauvegarde dans $SAUVEGARDE_DIR."; exit 1; }
  cp -p "$DERNIERE" "$VHOST"
  recharger
  echo "Configuration d'avant remise en place ($DERNIERE)."
  exit 0
fi

# La nouvelle configuration s'appuie sur des pages produites par le déploiement
for f in _shell.html 404.html index.html; do
  [ -f "$DIST/$f" ] || { echo "$DIST/$f manquant : lancez d'abord le déploiement (deploy-monbaobab.sh)."; exit 1; }
done

# ------------------------------------------------------------------ sauvegarde
install -d -m 700 "$SAUVEGARDE_DIR"
SAUVEGARDE="$SAUVEGARDE_DIR/www.monbaobab.com.conf.$(date +%Y%m%d-%H%M%S)"
cp -p "$VHOST" "$SAUVEGARDE"
ENTETES_AVANT=""
[ -f "$ENTETES" ] && { ENTETES_AVANT="$SAUVEGARDE.entetes"; cp -p "$ENTETES" "$ENTETES_AVANT"; }
echo "Sauvegarde : $SAUVEGARDE"

EXT_DIR=/www/server/panel/vhost/nginx/extension/www.monbaobab.com
if ls "$EXT_DIR"/*.conf >/dev/null 2>&1; then
  echo "Note : $EXT_DIR contient des fichiers inclus dans le site (conservés tels quels) :"
  ls -1 "$EXT_DIR"/*.conf
fi

retour_arriere() {
  ko "$1 — retour à la configuration d'avant"
  cp -p "$SAUVEGARDE" "$VHOST"
  if [ -n "$ENTETES_AVANT" ]; then cp -p "$ENTETES_AVANT" "$ENTETES"; else rm -f "$ENTETES"; fi
  recharger >/dev/null 2>&1 && echo "Configuration d'avant rechargée." || echo "/!\\ Rechargement impossible : vérifier nginx (sauvegarde : $SAUVEGARDE)."
  exit 1
}

# ------------------------------------------------------------------ en-têtes de sécurité
# Fichier hors du dossier vhost : aaPanel inclut vhost/nginx/*.conf pour TOUS les sites.
cat > "$ENTETES" <<'CONF'
# En-têtes de sécurité des pages de monbaobab.com (inclus par le vhost, généré par scripts/nginx-monbaobab.sh)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self'; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests" always;
CONF

# ------------------------------------------------------------------ site
cat > "$VHOST" <<'CONF'
# monbaobab.com — généré par scripts/nginx-monbaobab.sh (sauvegardes : /root/monbaobab/nginx/)
server {
    listen 80;
    listen 443 ssl http2;
    server_name monbaobab.com www.monbaobab.com;
    index index.html;
    root /www/wwwroot/BAOBAB/dist;
    include /www/server/panel/vhost/nginx/extension/www.monbaobab.com/*.conf;

    # Certificats générés par Certbot
    ssl_certificate /etc/letsencrypt/live/monbaobab.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monbaobab.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Une seule adresse : https://monbaobab.com (http:// et www. redirigent en une fois)
    set $vers_principal 0;
    if ($server_port !~ 443) { set $vers_principal 1; }
    if ($host != "monbaobab.com") { set $vers_principal 1; }
    if ($vers_principal) { return 301 https://monbaobab.com$request_uri; }

    # Adresse inconnue : vraie 404, avec la page « Page introuvable » du site
    error_page 404 /404.html;

    # BACKEND NODE.JS (API) — inchangé ; ^~ : jamais intercepté par les règles de fichiers ci-dessous
    location = /api {
        rewrite ^ / break;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # DOCUMENTATION API — inchangé
    location ^~ /api-docs {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Fichiers JS/CSS du build : leur nom change à chaque version, on les garde un an
    location ^~ /assets/ {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        try_files $uri =404;
    }

    # Images, polices, documents : 7 jours
    location ~* \.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|pdf|mp4|webm)$ {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "public, max-age=604800" always;
        try_files $uri =404;
    }

    location = /favicon.ico {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "public, max-age=604800" always;
        try_files /monbaobab-mark.svg =404;
    }

    # Accueil
    location = / {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "no-cache" always;
        try_files /index.html =404;
    }

    # Pages de l'application : la page pré-générée si elle existe, sinon la coquille du site
    # (contenu publié depuis la dernière génération, connexion, recherche, espace membre, admin…)
    location ~ ^/(?:country|fiche|recit|blog|stories|collections|timeline|figures|quizzes|orders|communities)/[^/]+/?$ {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "no-cache" always;
        try_files $uri $uri.html /_shell.html;
    }
    location ~ ^/(?:map|recits|reperes|sources|contribute|search|login|register|mot-de-passe-oublie|dashboard|admin|blog|stories|collections|timeline|figures|proverbs|quizzes|shop|cart|checkout|community|communities|auth/login|auth/register|blog/admin|blog/ecrire(?:/[^/]+)?|communities/create)(?:/.*)?$ {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "no-cache" always;
        try_files $uri $uri.html /_shell.html;
    }

    # Le reste : fichier s'il existe (robots.txt, sitemap.xml…), sinon 404
    location / {
        include /www/server/nginx/conf/monbaobab-entetes.conf;
        add_header Cache-Control "no-cache" always;
        try_files $uri $uri.html =404;
    }

    access_log  /www/wwwlogs/monbaobab.com.log;
    error_log  /www/wwwlogs/monbaobab.com.error.log;
}
CONF

"$NGINX" -t -c "$NGINX_CONF" 2>&1 | tail -2 || true
"$NGINX" -t -c "$NGINX_CONF" >/dev/null 2>&1 || retour_arriere "La nouvelle configuration ne passe pas le test de nginx"
"$NGINX" -s reload -c "$NGINX_CONF" || retour_arriere "Rechargement de nginx impossible"
sleep 2

# ------------------------------------------------------------------ vérifications
ECHECS=0
code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$@"; }
verifier() { # verifier <description> <attendu> <obtenu>
  if [ "$2" = "$3" ]; then ok "$1 ($3)"; else ko "$1 : attendu $2, obtenu $3"; ECHECS=$((ECHECS + 1)); fi
}

verifier "Accueil" 200 "$(code "$SITE/")"
verifier "API" 1 "$(curl -s --max-time 15 "$SITE/api/health" | grep -c '"OK"' || true)"
verifier "Fiche pays pré-générée" 200 "$(code "$SITE/country/sn")"
verifier "Page de l'application (connexion)" 200 "$(code "$SITE/login")"
verifier "Recherche" 200 "$(code "$SITE/search?q=mali")"
verifier "Ancienne rubrique (redirigée par le site)" 200 "$(code "$SITE/figures")"
verifier "Adresse inconnue" 404 "$(code "$SITE/page-qui-n-existe-pas-$(date +%s)")"
verifier "sitemap.xml" 200 "$(code "$SITE/sitemap.xml")"
verifier "robots.txt" 200 "$(code "$SITE/robots.txt")"
verifier "www → monbaobab.com" "301 https://monbaobab.com/" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 15 https://www.monbaobab.com/)"
verifier "http → https" "301 https://monbaobab.com/" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 15 http://monbaobab.com/)"
verifier "En-tête CSP sur les pages" 1 "$(curl -sI --max-time 15 "$SITE/" | grep -ci '^content-security-policy:' || true)"
verifier "HSTS sur les pages" 1 "$(curl -sI --max-time 15 "$SITE/" | grep -ci '^strict-transport-security:' || true)"
ASSET=$(curl -s --max-time 15 "$SITE/" | grep -oE '/assets/[^"]+\.js' | head -1)
verifier "Fichier JS gardé en cache un an" 1 "$(curl -sI --max-time 15 "$SITE$ASSET" | grep -ci 'immutable' || true)"
verifier "API : un seul en-tête CSP (pas de doublon)" 1 "$(curl -sI --max-time 15 "$SITE/api/health" | grep -ci '^content-security-policy:' || true)"

if [ "$ECHECS" -gt 0 ]; then
  retour_arriere "$ECHECS vérification(s) en échec"
fi

echo
echo "Configuration appliquée. Pour revenir en arrière : sudo bash $0 --annuler"
