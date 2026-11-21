#!/usr/bin/env bash
# Déploiement de MonBaobab (monbaobab.com) sur ce serveur.
#
#   sudo bash deploy-monbaobab.sh            # déploie la branche stability
#   sudo BRANCH=autre bash deploy-monbaobab.sh
#
# Étapes : sauvegarde (site, code, base) → code GitHub → dépendances → build + pages SEO
# → index MongoDB → redémarrage de l'API → vérifications. En cas d'échec après la
# sauvegarde, retour automatique à la version précédente.
set -Eeuo pipefail

APP=/www/wwwroot/BAOBAB
BRANCH=${BRANCH:-stability}
STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP=/www/wwwroot/BAOBAB-backup-$STAMP
API_SCRIPT=$APP/server/src/index.js
export PM2_HOME=${PM2_HOME:-/root/.pm2}
AS_WWW=(sudo -u www -H env npm_config_cache=/tmp/npm-cache-www)
GIT=(sudo -u www -H git -C "$APP")

[ "$(id -u)" -eq 0 ] || { echo "Lancez ce script avec sudo."; exit 1; }

step() { printf '\n\033[1;32m== %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m/!\\ %s\033[0m\n' "$*"; }

pm2_id() {
  pm2 jlist 2>/dev/null | node -e '
    let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
      const app = JSON.parse(s || "[]").find((p) => p.pm2_env?.pm_exec_path === process.argv[1])
      process.stdout.write(app ? String(app.pm_id) : "")
    })' "$API_SCRIPT"
}

ID=$(pm2_id)
[ -n "$ID" ] || { echo "Processus PM2 de l'API introuvable ($API_SCRIPT)."; exit 1; }
echo "API MonBaobab : processus PM2 n°$ID"

# ------------------------------------------------------------------ 1. sauvegarde
step "1. Sauvegarde dans $BACKUP"
mkdir -p "$BACKUP"
PREV=$("${GIT[@]}" rev-parse HEAD)
echo "$PREV" > "$BACKUP/commit.txt"
cp -a "$APP/dist" "$BACKUP/dist"
tar -C "$APP" --exclude=node_modules --exclude=dist --exclude=.git -czf "$BACKUP/code.tgz" .
URI=$(grep -E '^MONGODB_URI=' "$APP/server/.env" | head -1 | cut -d= -f2- | tr -d "\"'")
if mongodump --uri="$URI" --out="$BACKUP/mongo" --quiet; then echo "Base MongoDB sauvegardée."; else warn "Sauvegarde MongoDB impossible (on continue)."; fi
chmod 700 "$BACKUP"

rollback() {
  warn "ÉCHEC — retour à la version précédente ($PREV)"
  set +e
  "${GIT[@]}" reset -q --hard "$PREV"
  rm -rf "$APP/dist" && cp -a "$BACKUP/dist" "$APP/dist"
  (cd "$APP" && "${AS_WWW[@]}" npm ci --no-audit --no-fund --loglevel=error)
  pm2 restart "$ID" --update-env
  warn "Version précédente restaurée. Sauvegarde conservée : $BACKUP"
  exit 1
}
trap rollback ERR

# ------------------------------------------------------------------ 2. code
step "2. Récupération de origin/$BRANCH"
# Les modifications locales non commitées sont mises de côté (git stash list pour les revoir)
sudo -u www -H git -C "$APP" -c user.name=deploiement -c user.email=deploiement@localhost stash push -u -m "avant-deploiement-$STAMP" >/dev/null 2>&1 || true
"${GIT[@]}" fetch -q origin "$BRANCH"
"${GIT[@]}" checkout -q -f -B "$BRANCH" "origin/$BRANCH"
"${GIT[@]}" log -1 --format='Version : %h %s'

# ------------------------------------------------------------------ 3. dépendances
step "3. Dépendances"
(cd "$APP" && "${AS_WWW[@]}" npm ci --no-audit --no-fund --loglevel=error)
if ! "${GIT[@]}" diff --quiet "$PREV" HEAD -- server/package-lock.json; then
  (cd "$APP/server" && "${AS_WWW[@]}" npm ci --no-audit --no-fund --loglevel=error)
else
  echo "Dépendances du serveur inchangées."
fi

# ------------------------------------------------------------------ 4. build
step "4. Arrêt de l'API pendant le build (le site statique reste en ligne)"
# Sinon l'ancienne API régénère ses pages SEO (anciennes rubriques) dans dist pendant le build
pm2 stop "$ID" >/dev/null
chown -R www:www "$APP/dist"

step "5. Build du site et des pages SEO"
(cd "$APP" && "${AS_WWW[@]}" npm run build)
[ -f "$APP/dist/sitemap.xml" ] || { warn "sitemap.xml absent : pages SEO non générées"; false; }
echo "Pages SEO : $(grep -c '<loc>' "$APP/dist/sitemap.xml") URL dans le sitemap"

step "6. Index MongoDB des contributions"
(cd "$APP/server" && "${AS_WWW[@]}" node src/scripts/syncContributionIndexes.js)

# ------------------------------------------------------------------ 5. redémarrage
step "7. Redémarrage de l'API"
pm2 restart "$ID" --update-env >/dev/null
pm2 save >/dev/null
sleep 6

# ------------------------------------------------------------------ 6. vérifications
step "8. Vérifications"
check() { # libellé, commande
  if eval "$2"; then echo "OK  $1"; else warn "$1 : échec"; return 1; fi
}
check "API via https://monbaobab.com" "curl -fsS --max-time 10 https://monbaobab.com/api/health | grep -q OK"
check "nouvelle version en ligne (Récits dans le sitemap)" "curl -fsS --max-time 10 https://monbaobab.com/sitemap.xml | grep -q /recits"
check "page d'accueil" "curl -fsS --max-time 10 https://monbaobab.com/ | grep -q /assets/index-"
for page in /recits /reperes /country/sn /login; do
  check "$page" "[ \"\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://monbaobab.com$page)\" = 200 ]"
done
trap - ERR

PUBLIC_IP=$(hostname -I | awk '{print $1}')
if [ -n "$PUBLIC_IP" ] && curl -s -o /dev/null --max-time 5 "http://$PUBLIC_IP:3000/api/health"; then
  warn "Le port 3000 répond encore depuis l'extérieur : vérifiez HOST dans server/.env"
else
  echo "OK  port 3000 fermé depuis l'extérieur"
fi

step "Déploiement terminé"
echo "Sauvegarde : $BACKUP  (retour arrière : git reset --hard \$(cat $BACKUP/commit.txt) + dist de la sauvegarde)"
