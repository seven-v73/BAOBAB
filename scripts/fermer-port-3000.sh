#!/usr/bin/env bash
# Ferme le port 3000 (API MonBaobab) depuis Internet, sans couper nginx.
#
#   sudo bash fermer-port-3000.sh            # ferme
#   sudo bash fermer-port-3000.sh --rouvrir  # annule
#
# nginx joint l'API par l'adresse publique du serveur, mais depuis la machine elle-même : ce trafic
# passe par l'interface locale (lo). La règle ne vise que l'interface Internet (IPv4 et IPv6), donc
# nginx continue de fonctionner. Si le site ne répond plus après l'ajout, la règle est retirée.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Lancez ce script avec sudo."; exit 1; }
command -v ufw >/dev/null || { echo "ufw introuvable."; exit 1; }
ufw status | grep -q "Status: active" || { echo "ufw n'est pas actif : rien à faire ici (passer par le pare-feu d'aaPanel)."; exit 1; }

IFACE=$(ip route show default | awk '/default/ {print $5; exit}')
[ -n "$IFACE" ] || { echo "Interface Internet introuvable."; exit 1; }
RULE=(deny in on "$IFACE" to any port 3000 proto tcp)

health() { curl -fsS --max-time 10 https://monbaobab.com/api/health | grep -q OK; }

if [ "${1:-}" = "--rouvrir" ]; then
  ufw delete "${RULE[@]}"
  echo "Port 3000 rouvert sur $IFACE."
  exit 0
fi

if ufw status | grep -qE "^3000/tcp on $IFACE +DENY IN"; then
  echo "Règle déjà en place sur $IFACE."
else
  # En tête de liste : passe avant une éventuelle autorisation du port 3000 ajoutée par le panneau
  ufw insert 1 "${RULE[@]}" || ufw "${RULE[@]}"
fi

sleep 2
if health; then
  echo "OK  le site et l'API répondent toujours via https://monbaobab.com"
  echo "Port 3000 fermé depuis Internet sur $IFACE (IPv4 et IPv6)."
  echo "Vérification depuis un téléphone en 4G : http://$(ip -4 -o addr show "$IFACE" | awk '{print $4}' | cut -d/ -f1):3000/api/health ne doit plus répondre."
else
  echo "/!\\ L'API ne répond plus via nginx : retrait de la règle."
  ufw delete "${RULE[@]}"
  health && echo "Site rétabli." || echo "/!\\ Le site ne répond toujours pas : vérifier pm2 et nginx."
  exit 1
fi
