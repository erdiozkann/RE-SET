# RE-SET — VPS deploy (manuel)

Statik SPA. VPS'te Traefik (proxy ağı + letsencrypt) arkasında `nginx:alpine`.
Postiz'e dokunmaz — ayrı container.

**VPS:** `root@82.29.180.227` · **Hedef klasör:** `/docker/reset/`

Bu klasördekiler:
- `html/`            → built statik site (62 dosya)
- `nginx.conf`       → .htaccess'in nginx karşılığı (SPA + güvenlik başlıkları + 301 + gzip)
- `docker-compose.yml` → nginx:alpine + Traefik label'ları

---

## 1) DNS (önce bunu at — cert bunu bekliyor)
Registrar/DNS panelinde iki A kaydı:
```
re-set.com.tr        A   82.29.180.227
www.re-set.com.tr    A   82.29.180.227
```
(Cloudflare kullanıyorsan proxy KAPALI / "DNS only" — Traefik'in Let's Encrypt HTTP-01
challenge'ı için turuncu bulut gri olmalı. Sonra açabilirsin.)

## 2) Dosyaları VPS'e gönder (Mac terminalinden)
```bash
cd ~/dev/RE-SET/deploy/vps
ssh root@82.29.180.227 'mkdir -p /docker/reset'
rsync -avz --delete html/ nginx.conf docker-compose.yml root@82.29.180.227:/docker/reset/
```
> `rsync` yoksa: `scp -r html nginx.conf docker-compose.yml root@82.29.180.227:/docker/reset/`

## 3) Traefik label'larını doğrula (BİR KERELİK)
`docker-compose.yml` içinde `entrypoints=websecure` ve `certresolver=letsencrypt` varsaydım.
Seninkiyle aynı mı diye çalışan referansa bak:
```bash
ssh root@82.29.180.227 "grep -A2 -i 'entrypoints\|certresolver' /docker/postiz/docker-compose.yml"
```
Farklıysa `/docker/reset/docker-compose.yml`'de o iki değeri eşitle.

## 4) Ayağa kaldır
```bash
ssh root@82.29.180.227 'cd /docker/reset && docker compose up -d'
ssh root@82.29.180.227 'docker ps | grep reset'
```

## 5) Doğrula
- DNS propage olunca: https://re-set.com.tr → açılmalı, cert geçerli (Traefik otomatik aldı)
- DNS'ten ÖNCE test (VPS içinden, cert'siz):
  ```bash
  ssh root@82.29.180.227 "curl -s -H 'Host: re-set.com.tr' http://localhost/ | grep -o '<h1[^>]*>[^<]*' | head -1"
  ```
- `/methods` → `/demartini-yontemi` 301 dönmeli
- view-source: H1 + FAQPage JSON-LD statik HTML'de (AI botları için ana fix)

---

## Gelecekte redeploy (tek komut)
Yeni build sonrası (`npm run build`):
```bash
cd ~/dev/RE-SET/deploy/vps && rm -rf html && cp -R ../../HOSTINGER_UPLOAD html && rm -f html/.htaccess
rsync -avz --delete html/ root@82.29.180.227:/docker/reset/html/
# nginx dosyaları değişmediyse container'ı restart etmene gerek yok; değiştiyse:
ssh root@82.29.180.227 'cd /docker/reset && docker compose up -d --force-recreate'
```

## Rollback
`docker compose down` → container gider. DNS'i eski Hostinger IP'sine geri al.
Eski Hostinger kurulumu duruyor (dokunulmadı).
