#!/usr/bin/env bash
# RE-SET → VPS tek-komut deploy. `./deploy/vps/deploy.sh` (repo kökünden de çalışır)
# build + rsync + container recreate. Manuel adım yok.
set -euo pipefail
VPS="root@82.29.180.227"; DIR="/docker/reset"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; HERE="$ROOT/deploy/vps"

echo "→ 1/3 build"; ( cd "$ROOT" && npm run build >/dev/null 2>&1 ) && echo "  ✓ build"
echo "→ 2/3 sync"
rm -rf "$HERE/html" && cp -R "$ROOT/HOSTINGER_UPLOAD" "$HERE/html" && rm -f "$HERE/html/.htaccess"
# Container nginx farklı uid ile çalışır: tüm dosyalar dünya-okunur olmalı yoksa 403.
# (sitemap.xml/robots.txt/llms-full.txt kaynakta 600 gelebiliyor → SEO dosyaları 403 verdi.)
chmod -R a+rX "$HERE/html"
ssh "$VPS" "mkdir -p $DIR/html"
rsync -az --delete "$HERE/html/" "$VPS:$DIR/html/"
# --inplace: tek-dosya bind mount inode'a bağlı; rsync'in yeni-inode yazması
# container'ı ESKİ conf'ta bırakıyordu. inplace aynı inode'a yazar.
rsync -az --inplace "$HERE/nginx.conf" "$HERE/docker-compose.yml" "$VPS:$DIR/"
echo "→ 3/3 container"
# force-recreate: mount + conf her deploy'da garantili taze (1-2sn kesinti, kabul).
ssh "$VPS" "cd $DIR && docker compose up -d --force-recreate 2>&1 | tail -1"
echo "✅ deploy tamam → https://re-set.com.tr (nginx VPS, Traefik+LE cert)"
