import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Post-build temizlik: vite-prerender-plugin, build-only `prerender` entry'si için
// her prerendered HTML'e bir `<link rel="modulepreload" ...prerender-*.js>` bırakıyor.
// prerender.tsx yalnızca build zamanında (Node SSG) çalışır; tarayıcıya ASLA gerekmez.
// Ayrıca prerender → lib/markdown → marked (~140KB) zinciri yüzünden vendor-marked
// de kritik yola preload ediliyordu. marked yalnız lazy blog/cms route'larında lazım
// (onlar mount olunca dinamik import eder), bu yüzden statik preload gereksiz.
// Bu iki modulepreload'u tüm çıktı HTML'lerinden çıkarıyoruz → home kritik yolu küçülür.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '../HOSTINGER_UPLOAD');

// Çıkarılacak modulepreload href kalıpları (hash'li dosya adları).
const STRIP = /<link\s+rel="modulepreload"[^>]*href="[^"]*\/(?:prerender|vendor-marked)-[^"]*"[^>]*>\s*/g;

function walk(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = fs.readFileSync(full, 'utf8');
      const stripped = html.replace(STRIP, '');
      if (stripped !== html) {
        fs.writeFileSync(full, stripped, 'utf8');
        count++;
      }
    }
  }
  return count;
}

if (!fs.existsSync(buildDir)) {
  console.warn('⚠️  strip-build-preloads: HOSTINGER_UPLOAD yok, atlanıyor.');
  process.exit(0);
}

const n = walk(buildDir);
console.log(`✅ strip-build-preloads: ${n} HTML'den prerender/marked modulepreload çıkarıldı.`);
