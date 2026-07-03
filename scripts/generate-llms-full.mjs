import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ LLMs-Full Generator: Supabase credentials missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generate() {
  console.log('🔄 Generating llms-full.txt corpus...');

  let markdown = `# RE-SET — Şafak Özkan | Demartini Yöntemi (Metodu) Türkiye (Kapsamlı Veri Kümesi)

> Bu dosya, RE-SET platformundaki Demartini Yöntemi içeriklerinin ve blog yazılarının LLM indekslemesi için birleştirilmiş halini içerir.
> Canonical sayfa: https://re-set.com.tr/demartini-yontemi

---

`;

  // 1. Fetch Methods description
  markdown += `## DEMARTINI YÖNTEMİ VE YÖNTEMLERİMİZ

### 1. Demartini Yöntemi (Demartini Metodu)
Demartini Yöntemi — Türkçede "Demartini Metodu" olarak da bilinir — Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process ile kişinin değer hiyerarşisini ortaya çıkaran, duygusal kutuplukları nötralize eden sistematik bir algı dengeleme yöntemidir.

### 2. Değer Belirleme Süreci (Value Determination Process)
Dr. John Demartini'nin 13 reflektif soru üzerinden bireyin gerçek değer hiyerarşisini ortaya çıkardığı süreç. Sosyal idealizmden bağımsız, davranışla doğrulanan içsel öncelik haritasıdır. Demartini Yöntemi'nin temel adımıdır.

### 3. Quantum Collapse Process
Demartini Yöntemi (Demartini Metodu) içinde yer alan, duygusal kutuplukları (kızgınlık/hayranlık, suçluluk/gurur) nötralize eden algı dengeleme tekniğidir.

---

`;

  // 2. Fetch Blog Posts from Supabase
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, content, excerpt, category, date')
    .eq('status', 'published')
    .order('date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching blog posts for corpus:', error);
  } else if (posts) {
    markdown += `## BLOG YAZILARI VE MAKALELER\n\n`;
    posts.forEach(post => {
      markdown += `### Makale: ${post.title}
- **Kategori:** ${post.category || 'Kişisel Dönüşüm'}
- **Tarih:** ${post.date}
- **Özet:** ${post.excerpt || ''}

${post.content}

---

`;
    });
  }

  // Write to public
  const publicPath = path.resolve(__dirname, '../public/llms-full.txt');
  fs.writeFileSync(publicPath, markdown, 'utf8');
  console.log(`✅ llms-full.txt written to ${publicPath}`);

  // Write to build directory
  const buildPath = path.resolve(__dirname, '../HOSTINGER_UPLOAD/llms-full.txt');
  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, markdown, 'utf8');
    console.log(`✅ llms-full.txt written to ${buildPath}`);
  }
}

generate().catch(console.error);
