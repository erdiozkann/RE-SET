import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://re-set.com.tr";

type RouteMeta = {
  title: string;
  description: string;
};

const staticMeta: Record<string, RouteMeta> = {
  "/": {
    title: "RE-SET | Şafak Özkan — Demartini Yöntemi ve Metodu Türkiye",
    description:
      "Demartini Yöntemi (Demartini Metodu) Türkiye uygulayıcısı Şafak Özkan ile İstanbul/Nişantaşı'da değer belirleme, ilişki dengeleme ve kişisel dönüşüm seansları.",
  },
  "/about": {
    title: "Hakkımda — Şafak Özkan | Demartini Yöntemi (Metodu)",
    description:
      "Sertifikalı Demartini Yöntemi (Metodu) uygulayıcısı Şafak Özkan. 15+ yıllık uygulama deneyimi, Nişantaşı / İstanbul.",
  },
  "/demartini-yontemi": {
    title: "Demartini Yöntemi — Şafak Özkan | RE-SET Türkiye",
    description:
      "Demartini Yöntemi (Demartini Metodu): Sertifikalı uygulayıcı Şafak Özkan ile İstanbul/Nişantaşı'da değer belirleme, Breakthrough Experience, Quantum Collapse Process ve ilişki dengeleme seansları.",
  },
  "/blog": {
    title: "Blog | RE-SET — Şafak Özkan",
    description:
      "Demartini Metodu, değer belirleme, ilişki dengeleme ve kişisel dönüşüm üzerine güncel yazılar.",
  },
  "/podcast": {
    title: "Podcast | RE-SET — Şafak Özkan",
    description:
      "Şafak Özkan'ın Demartini Metodu ve kişisel dönüşüm üzerine podcast bölümleri.",
  },
  "/youtube": {
    title: "YouTube | RE-SET — Şafak Özkan",
    description:
      "Demartini Metodu, ilişki dengeleme ve değer belirleme üzerine YouTube içerikleri.",
  },
  "/booking": {
    title: "Randevu Al | Şafak Özkan — Demartini Metodu",
    description:
      "Şafak Özkan ile Demartini Metodu seansı için online veya yüz yüze randevu alın.",
  },
  "/contact": {
    title: "İletişim | RE-SET — Şafak Özkan",
    description:
      "RE-SET ve Şafak Özkan ile iletişime geçin: Nişantaşı İstanbul, online ve yüz yüze danışmanlık.",
  },
  "/privacy": {
    title: "Gizlilik Politikası | RE-SET",
    description: "RE-SET gizlilik politikası ve kişisel verilerin işlenmesi.",
  },
  "/kvkk": {
    title: "KVKK Aydınlatma Metni | RE-SET",
    description:
      "Kişisel Verilerin Korunması Kanunu kapsamında RE-SET aydınlatma metni.",
  },
  "/copyright": {
    title: "Telif Hakkı | RE-SET",
    description: "RE-SET telif hakları ve içerik kullanım koşulları.",
  },
  "/cookies": {
    title: "Çerez Politikası | RE-SET",
    description: "RE-SET web sitesi çerez politikası.",
  },
};

// Görünür sayfa başlıkları (H1). Prerender statik gövdesi için.
const routeHeading: Record<string, string> = {
  "/": "Demartini Yöntemi (Metodu) — Şafak Özkan · İstanbul",
  "/about": "Hakkımda — Şafak Özkan | Demartini Metodu Uygulayıcısı",
  "/demartini-yontemi": "Demartini Yöntemi (Demartini Metodu) Nedir?",
  "/blog": "Blog — Demartini Metodu ve Kişisel Dönüşüm",
  "/podcast": "Podcast — Demartini Metodu ile Kişisel Dönüşüm",
  "/youtube": "YouTube — Demartini Metodu İçerikleri",
  "/booking": "Randevu Al — Demartini Metodu Seansı",
  "/contact": "İletişim — RE-SET, Şafak Özkan",
  "/privacy": "Gizlilik Politikası",
  "/kvkk": "KVKK Aydınlatma Metni",
  "/copyright": "Telif Hakkı",
  "/cookies": "Çerez Politikası",
};

// Sitede görünen (hardcoded) entity tanımı — birebir yansıtılır (cloaking yok).
const DEMARTINI_INTRO: string[] = [
  "Demartini Yöntemi (Türkçede Demartini Metodu olarak da bilinir), Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process'in birleşiminden oluşan sistematik bir algı dengeleme yöntemidir. Kişinin gerçek değer hiyerarşisini ortaya çıkarmayı; kızgınlık–hayranlık, suçluluk–gurur gibi duygusal kutuplukları nötralize ederek minnet, ilham ve sevgi alanına geçişi sağlamayı hedefler.",
  "Yöntem; psikoloji, davranış bilimi, nöroplastisite ve felsefe alanlarındaki araştırmalardan beslenir. Tıbbi tedavinin yerine geçmez; danışanın kendi farkındalığıyla algı yapısını dengelediği bütüncül bir araçtır.",
];

// Sitede görünen (hardcoded) FAQ — birebir yansıtılır.
const FAQ: { q: string; a: string }[] = [
  {
    q: "Demartini Metodu nedir?",
    a: "Demartini Metodu, Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process'ten oluşan sistematik bir algı dengeleme yöntemidir. Kişinin gerçek değer hiyerarşisini ortaya çıkarmak, duygusal yükleri nötralize etmek ve ilham, sevgi, minnet alanına geçişi sağlamak için kullanılır.",
  },
  {
    q: "Demartini Metodu kimler için uygundur?",
    a: "Kaygı, depresyon, ilişki çatışmaları, travma, bağımlılık, kariyer kararsızlığı, öz değer ve hayat yönü arayışı yaşayan herkes için uygundur. Tıbbi tedavinin yerine geçmez; tamamlayıcı bir farkındalık aracıdır.",
  },
  {
    q: "Bir Demartini seansı ne kadar sürer?",
    a: "Birebir seanslar genellikle 60–90 dakikadır. Konunun yoğunluğuna göre 2–6 seanslık bir süreç önerilebilir. Breakthrough Experience programı ise 2 tam günlük bir grup çalışmasıdır.",
  },
  {
    q: "Demartini Metodu NLP veya koçluktan farklı mıdır?",
    a: "Evet. NLP davranış kalıplarını yeniden çerçevelerken, Demartini Metodu kişinin değer hiyerarşisini ve duygusal kutuplukları tek tek dengeleyerek nöroplastik bir farkındalık değişimi hedefler. 13 soruluk Değer Belirleme Süreci yöntemin temelidir.",
  },
  {
    q: "Online Demartini seansı yapıyor musunuz?",
    a: "Evet. Zoom veya Google Meet üzerinden yüz yüze seansla eşdeğer Demartini Metodu seansları sunuyoruz. Türkiye dışındaki danışanlar da online seansa katılabilir.",
  },
  {
    q: "Şafak Özkan kimdir?",
    a: "Şafak Özkan, İstanbul Nişantaşı merkezli, sertifikalı Demartini Method Facilitator'dır. 15 yılı aşkın uygulama deneyimiyle Türkiye'de binlerce danışana Demartini Metodu ile rehberlik etmiştir.",
  },
  {
    q: "Ücretsiz keşif görüşmesi mümkün mü?",
    a: "30 dakikalık ücretsiz keşif görüşmesi sunuyoruz. Bu görüşme, ihtiyacınızın yöntemle örtüşüp örtüşmediğini değerlendirmek ve doğru programı seçmek içindir. Randevu sayfasından planlayabilirsiniz.",
  },
  {
    q: "Demartini Metodu bilimsel midir?",
    a: "Demartini Metodu; psikoloji, davranış bilimi, nöroplastisite ve felsefe alanlarındaki araştırmalardan beslenen bütüncül bir farkındalık ve algı dengeleme yöntemidir. Tıbbi/psikiyatrik tedavinin yerine geçmez ancak terapötik süreçlerle birlikte kullanılabilir.",
  },
];

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/demartini-yontemi", label: "Demartini Yöntemi" },
  { href: "/about", label: "Hakkımda" },
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcast" },
  { href: "/youtube", label: "YouTube" },
  { href: "/booking", label: "Randevu Al" },
  { href: "/contact", label: "İletişim" },
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function navHtml(): string {
  return (
    `<nav aria-label="Site haritası"><ul>` +
    NAV_LINKS.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("") +
    `</ul></nav>`
  );
}

function faqHtml(): string {
  return (
    `<section aria-labelledby="sss"><h2 id="sss">Sıkça Sorulan Sorular</h2>` +
    FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("") +
    `</section>`
  );
}

function introHtml(): string {
  return (
    `<section aria-labelledby="nedir"><h2 id="nedir">Demartini Yöntemi Nedir?</h2>` +
    DEMARTINI_INTRO.map((p) => `<p>${esc(p)}</p>`).join("") +
    `</section>`
  );
}

// FAQPage JSON-LD — JS çalıştırmayan botlar için statik gövdeye gömülür.
function faqJsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// Route'a göre statik, taranabilir gövde. React (createRoot) mount olunca değişir.
function bodyFor(url: string, meta: RouteMeta): string {
  const h1 = routeHeading[url] || meta.title;
  const lead = `<p>${esc(meta.description)}</p>`;
  const richFaqRoutes = url === "/" || url === "/demartini-yontemi";

  let inner = `<h1>${esc(h1)}</h1>${lead}`;
  if (richFaqRoutes) {
    inner += introHtml() + faqHtml() + faqJsonLd();
  }
  inner += navHtml();

  return `<main id="prerender-content">${inner}</main>`;
}

let dynamicMetaCache: Map<string, RouteMeta> | null = null;

async function loadDynamicMeta(): Promise<Map<string, RouteMeta>> {
  if (dynamicMetaCache) return dynamicMetaCache;

  const meta = new Map<string, RouteMeta>();
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    dynamicMetaCache = meta;
    return meta;
  }

  try {
    const supabase = createClient(url, key);
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt")
      .eq("status", "published");

    if (posts) {
      for (const post of posts) {
        meta.set(`/blog/${post.id}`, {
          title: `${post.title} | RE-SET Blog`,
          description:
            post.excerpt ||
            "Demartini Metodu ve kişisel dönüşüm üzerine RE-SET blog yazısı.",
        });
      }
    }
  } catch (err) {
    console.warn("[prerender] dynamic blog meta fetch failed:", err);
  }

  dynamicMetaCache = meta;
  return meta;
}

export async function prerender({ ssr, url }: { ssr: boolean; url: string }) {
  void ssr;
  const dynamic = await loadDynamicMeta();
  const meta = staticMeta[url] || dynamic.get(url) || staticMeta["/"];

  const canonical = `${siteUrl}${url === "/" ? "/" : url}`;
  const title = meta.title;
  const description = meta.description;

  // The plugin uses these to find more routes to render.
  const links = new Set<string>(Object.keys(staticMeta));
  for (const path of dynamic.keys()) links.add(path);

  return {
    // Gerçek, taranabilir HTML — JS çalıştırmayan botlar (GPTBot, ClaudeBot,
    // PerplexityBot) ve ilk-dalga Googlebot artık içeriği görür. createRoot
    // (hydrate DEĞİL) mount olunca bu içerik client tarafından değiştirilir,
    // dolayısıyla hydration-mismatch riski yoktur.
    html: bodyFor(url, meta),
    links,
    head: {
      lang: "tr-TR",
      title,
      elements: new Set([
        { type: "meta", props: { name: "description", content: description } },
        { type: "link", props: { rel: "canonical", href: canonical } },
        { type: "meta", props: { property: "og:title", content: title } },
        {
          type: "meta",
          props: { property: "og:description", content: description },
        },
        { type: "meta", props: { property: "og:url", content: canonical } },
        { type: "meta", props: { property: "og:type", content: "website" } },
        { type: "meta", props: { property: "og:locale", content: "tr_TR" } },
        {
          type: "meta",
          props: { name: "twitter:card", content: "summary_large_image" },
        },
        { type: "meta", props: { name: "twitter:title", content: title } },
        {
          type: "meta",
          props: { name: "twitter:description", content: description },
        },
      ]),
    },
  };
}
