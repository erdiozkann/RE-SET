#!/usr/bin/env bash
# RE-SET → VPS deploy (Traefik arkasında nginx:alpine). Manuel adım yok.
# Kullanım: ./deploy.sh   (repo kökünde `npm run build` sonrası çalıştır)
set -euo pipefail
VPS="root@82.29.180.227"
DIR="/docker/reset"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "→ build senkron: HOSTINGER_UPLOAD → deploy/vps/html"
rm -rf "$HERE/html" && cp -R "$HERE/../../HOSTINGER_UPLOAD" "$HERE/html" && rm -f "$HERE/html/.htaccess"

echo "→ VPS klasörü + rsync"
ssh "$VPS" "mkdir -p $DIR"
rsync -az --delete "$HERE/html/" "$VPS:$DIR/html/"
rsync -az "$HERE/nginx.conf" "$HERE/docker-compose.yml" "$VPS:$DIR/"

echo "→ container up (Postiz'e dokunmaz; ayrı servis 'reset')"
ssh "$VPS" "cd $DIR && docker compose up -d && docker ps | grep reset"
echo "✅ deploy bitti. DNS re-set.com.tr → 82.29.180.227 ise Traefik cert'i otomatik alır."
