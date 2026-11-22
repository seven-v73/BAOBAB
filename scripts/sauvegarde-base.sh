#!/usr/bin/env bash
# Sauvegarde quotidienne de la base MonBaobab (contributions, comptes, fiches, articles…).
# Jusqu'ici, la base n'était sauvegardée qu'au déploiement : une panne entre deux déploiements
# faisait perdre tout ce qui avait été saisi entre-temps.
#
#   sudo bash sauvegarde-base.sh --installer   # programme la sauvegarde chaque nuit à 3 h 30
#   sudo bash sauvegarde-base.sh               # fait une sauvegarde maintenant
#   sudo bash sauvegarde-base.sh --liste       # montre les sauvegardes disponibles
#   sudo bash sauvegarde-base.sh --retirer     # arrête la sauvegarde programmée
#
# Les sauvegardes vont dans /www/backup/monbaobab-base/ (lisibles par root seulement).
# On garde les 14 dernières nuits et une sauvegarde par mois sur 6 mois.
#
# Restaurer (après avoir vérifié la date du fichier) :
#   mongorestore --uri="<MONGODB_URI>" --gzip --archive=/www/backup/monbaobab-base/<fichier> --drop
set -euo pipefail

APP=/www/wwwroot/BAOBAB
DEST=/www/backup/monbaobab-base
CRON=/etc/cron.d/monbaobab-sauvegarde
LOG=/var/log/monbaobab-sauvegarde.log

[ "$(id -u)" -eq 0 ] || { echo "Lancez ce script avec sudo."; exit 1; }

case "${1:-}" in
  --installer)
    # Copie hors du dépôt : un déploiement ne modifie pas la tâche programmée en cours de route
    install -d -m 700 /root/monbaobab
    install -m 700 "$0" /root/monbaobab/sauvegarde-base.sh
    cat > "$CRON" <<EOF
# Sauvegarde nocturne de la base MonBaobab (scripts/sauvegarde-base.sh)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
30 3 * * * root bash /root/monbaobab/sauvegarde-base.sh >> $LOG 2>&1
EOF
    chmod 644 "$CRON"
    echo "Sauvegarde programmée chaque nuit à 3 h 30 ($CRON)."
    echo "Première sauvegarde maintenant, pour vérifier que tout marche :"
    exec bash /root/monbaobab/sauvegarde-base.sh
    ;;
  --retirer)
    rm -f "$CRON"
    echo "Sauvegarde programmée retirée (les sauvegardes existantes sont conservées dans $DEST)."
    exit 0
    ;;
  --liste)
    ls -lh "$DEST" 2>/dev/null || echo "Aucune sauvegarde dans $DEST."
    exit 0
    ;;
esac

command -v mongodump >/dev/null || { echo "mongodump introuvable."; exit 1; }
URI=$(grep -E '^MONGODB_URI=' "$APP/server/.env" | head -1 | cut -d= -f2- | tr -d "\"'")
[ -n "$URI" ] || { echo "MONGODB_URI introuvable dans $APP/server/.env"; exit 1; }

install -d -m 700 "$DEST"
JOUR=$(date +%Y-%m-%d)
FICHIER="$DEST/monbaobab-$JOUR.archive.gz"
TMP="$FICHIER.partiel"

echo "[$(date '+%F %T')] Sauvegarde de la base…"
if ! mongodump --uri="$URI" --gzip --archive="$TMP" --quiet; then
  rm -f "$TMP"
  echo "[$(date '+%F %T')] /!\\ ÉCHEC de mongodump : aucune sauvegarde ce jour."
  exit 1
fi

# Une archive vide ou minuscule veut dire que quelque chose s'est mal passé : on garde l'ancienne
TAILLE=$(stat -c %s "$TMP")
if [ "$TAILLE" -lt 10240 ]; then
  rm -f "$TMP"
  echo "[$(date '+%F %T')] /!\\ Archive trop petite ($TAILLE octets) : sauvegarde ignorée."
  exit 1
fi
mv "$TMP" "$FICHIER"
chmod 600 "$FICHIER"

# Une sauvegarde par mois, gardée 6 mois (copie du 1er du mois)
if [ "$(date +%d)" = "01" ]; then cp -p "$FICHIER" "$DEST/mensuelle-$(date +%Y-%m).archive.gz"; fi

# Rotation : 14 nuits, 6 mois
garder() { # garder <nombre> <motif> : supprime les plus anciennes au-delà du nombre
  local n=$1 motif=$2
  find "$DEST" -maxdepth 1 -name "$motif" -printf '%T@ %p\n' | sort -rn | tail -n +"$((n + 1))" | cut -d' ' -f2- | xargs -r rm -f
}
garder 14 'monbaobab-*.archive.gz'
garder 6 'mensuelle-*.archive.gz'

echo "[$(date '+%F %T')] OK  $(basename "$FICHIER") ($(du -h "$FICHIER" | cut -f1)). Sauvegardes conservées : $(find "$DEST" -maxdepth 1 -name '*.archive.gz' | wc -l)."
