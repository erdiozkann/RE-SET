#!/usr/bin/env bash
# RE-SET → VPS tek-komut deploy. `./deploy/vps/deploy.sh` (repo kökünden de çalışır)
# build + rsync + container recreate. Manuel adım yok.
set -euo pipefail
VPS="root@82.29.180.227"; DIR="/docker/reset"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; HERE="$ROOT/deploy/vps"

echo "→ 1/3 build"; ( cd "$ROOT" && npm run build >/dev/null 2>&1 ) && echo "  ✓ build"
echo "→ 2/3 sync"
rm -rf "$HERE/html" && cp -R "$ROOT/HOSTINGER_UPLOAD" "$HERE/html" && rm -f "$HERE/html/.htaccess"
ssh "$VPS" "mkdir -p $DIR/html"
rsync -az --delete "$HERE/html/" "$VPS:$DIR/html/"
rsync -az "$HERE/nginx.conf" "$HERE/docker-compose.yml" "$VPS:$DIR/"
echo "→ 3/3 container"
ssh "$VPS" "cd $DIR && docker compose up -d 2>&1 | tail -1"
echo "✅ deploy tamam → https://re-set.com.tr (nginx VPS, Traefik+LE cert)"
