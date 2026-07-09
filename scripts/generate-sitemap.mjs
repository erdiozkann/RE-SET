import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = 'https://re-set.com.tr';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Sitemap Generator: Supabase credentials missing in env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generate() {
  console.log('🔄 Generating dynamic sitemap...');

  // 1. Static Pages
  const staticPages = [
    { loc: '', changefreq: 'weekly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.9' },
    { loc: '/demartini-yontemi', changefreq: 'monthly', priority: '0.9' },
    { loc: '/primordial-ses-meditasyonu', changefreq: 'monthly', priority: '0.9' },
    { loc: '/demartini-seansi', changefreq: 'monthly', priority: '0.95' },
    { loc: '/deger-belirleme', changefreq: 'monthly', priority: '0.9' },
    { loc: '/breakthrough-experience', changefreq: 'monthly', priority: '0.9' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
    { loc: '/podcast', changefreq: 'weekly', priority: '0.7' },
    { loc: '/youtube', changefreq: 'weekly', priority: '0.7' },
    { loc: '/booking', changefreq: 'monthly', priority: '0.95' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/kvkk', changefreq: 'yearly', priority: '0.3' },
    { loc: '/copyright', changefreq: 'yearly', priority: '0.3' },
    { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
  ];

  // 2. Fetch Dynamic Blog Posts from Supabase
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, date')
    .eq('status', 'published') // only published posts
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching blog posts:', error);
    process.exit(1);
  }

  // Slug, src/lib/slug.ts ile AYNI kural (başlıktan türetilir) — sitemap yalnız
  // yeni slug URL'lerini listeler; eski UUID sayfaları canonical ile devrediyor.
  const TR = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','I':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
  const slugify = (t) => (t || '')
    .split('').map((ch) => TR[ch] ?? ch).join('')
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '');

  const blogPages = posts.map(post => ({
    loc: `/blog/${slugify(post.title)}`,
    lastmod: post.date,
    changefreq: 'monthly',
    priority: '0.8'
  }));

  const allPages = [...staticPages, ...blogPages];
  const today = new Date().toISOString().split('T')[0];

  const xmlEntries = allPages.map(page => {
    // Ana sayfa canonical'ı ile tutarlı olsun: trailing slash'lı (https://re-set.com.tr/)
    const locUrl = page.loc === '' ? `${siteUrl}/` : `${siteUrl}${page.loc}`;
    const lastmod = page.lastmod || today;
    return `
  <url>
    <loc>${locUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;

  // Write to public folder (for local dev and next build step)
  // mode 0o644: restrictive umask (077) altında 600 üretilirse container nginx
  // okuyamaz → canlıda 403. writeFileSync mode'u sadece YENİ dosyaya uygulanır,
  // bu yüzden var olan dosyayı da chmod ile garantiye alıyoruz.
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, sitemapXml, { encoding: 'utf8', mode: 0o644 });
  fs.chmodSync(publicPath, 0o644);
  console.log(`✅ Sitemap written to ${publicPath}`);

  // Write to build directory (if exists)
  const buildPath = path.resolve(__dirname, '../HOSTINGER_UPLOAD/sitemap.xml');
  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, sitemapXml, { encoding: 'utf8', mode: 0o644 });
    fs.chmodSync(buildPath, 0o644);
    console.log(`✅ Sitemap written to ${buildPath}`);
  }
}

generate().catch(console.error);
