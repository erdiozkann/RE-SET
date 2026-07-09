import { createClient } from "@supabase/supabase-js";
import { FAQ } from "./data/faq";
import { PRIMORDIAL_FAQ } from "./data/primordialFaq";
import {
  SEANS_INTRO, SEANS_FAQ,
  DEGER_INTRO, DEGER_FAQ,
  BREAKTHROUGH_INTRO, BREAKTHROUGH_FAQ,
} from "./data/serviceFaqs";
import { mdToHtml } from "./lib/markdown";
import { optimizedImage } from "./lib/img";
import { ROUTE_META, ROUTE_HEADING, SITE_URL, type RouteMeta } from "./lib/routeMeta";
import { slugify } from "./lib/slug";

const siteUrl = SITE_URL;

// Meta/H1 tek kaynak → src/lib/routeMeta.ts (client SEO ile birebir aynı).
const staticMeta = ROUTE_META;
const routeHeading = ROUTE_HEADING;

// Sitede görünen (hardcoded) entity tanımı — birebir yansıtılır (cloaking yok).
const DEMARTINI_INTRO: string[] = [
  "Demartini Yöntemi (Türkçede Demartini Metodu olarak da bilinir), Dr. John Demartini tarafından geliştirilen, 13 sorulu Değer Belirleme Süreci ve Quantum Collapse Process'in birleşiminden oluşan sistematik bir algı dengeleme yöntemidir. Kişinin gerçek değer hiyerarşisini ortaya çıkarmayı; kızgınlık–hayranlık, suçluluk–gurur gibi duygusal kutuplukları nötralize ederek minnet, ilham ve sevgi alanına geçişi sağlamayı hedefler.",
  "Yöntem; psikoloji, davranış bilimi, nöroplastisite ve felsefe alanlarındaki araştırmalardan beslenir. Tıbbi tedavinin yerine geçmez; danışanın kendi farkındalığıyla algı yapısını dengelediği bütüncül bir araçtır.",
];

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/demartini-yontemi", label: "Demartini Yöntemi" },
  { href: "/demartini-seansi", label: "Demartini Seansı" },
  { href: "/deger-belirleme", label: "Değer Belirleme" },
  { href: "/breakthrough-experience", label: "Breakthrough Experience" },
  { href: "/primordial-ses-meditasyonu", label: "Primordial Ses Meditasyonu" },
  { href: "/about", label: "Hakkımda" },
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcast" },
  { href: "/youtube", label: "YouTube" },
  { href: "/booking", label: "Randevu Al" },
  { href: "/contact", label: "İletişim" },
];

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Supabase'ten build zamanında çekilen gerçek içerik (uydurma yok).
type Video = { title: string; youtube_id: string; category?: string; published_at?: string; description?: string };
type Podcast = { title: string; description?: string; audio_url?: string; date?: string; episode?: string };
type BlogPost = { id: string; title: string; excerpt?: string; content?: string };
type Review = { name: string; rating?: number; text?: string; date?: string };
type SitePageRow = { slug: string; title: string; description?: string; content?: string };

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

// --- Primordial Ses Meditasyonu: taranabilir intro + FAQ + FAQPage/Service JSON-LD ---
const PRIMORDIAL_INTRO: string[] = [
  "Primordial Ses (Sound) Meditasyonu, Vedik gelenekten gelen ve kişiye özel bir mantranın (ses) sessizce tekrar edildiği bir meditasyon uygulamasıdır. Mantra, kişinin doğum zamanı ve yerine göre belirlenen, anlamı olmayan nötr bir sestir; amacı zihni düşünce akışından zorlamadan uzaklaştırıp bir sükûnet alanına getirmektir.",
  "Şafak Özkan, Demartini Yöntemi'nin yanı sıra Primordial Ses Meditasyonu eğitimi de almıştır ve bu iki yaklaşımı danışanın ihtiyacına göre birlikte kullanır. Primordial Ses Meditasyonu bir sağlık hizmeti, psikoterapi veya tıbbi tedavi değildir.",
];

// --- Hizmet (para) sayfaları: taranabilir intro + FAQ + Service/FAQPage JSON-LD ---
const SERVICE_SECTIONS: Record<string, { name: string; intro: string[]; faq: { q: string; a: string }[] }> = {
  "/demartini-seansi": { name: "Demartini Seansı (Birebir)", intro: SEANS_INTRO, faq: SEANS_FAQ },
  "/deger-belirleme": { name: "Değer Belirleme Süreci", intro: DEGER_INTRO, faq: DEGER_FAQ },
  "/breakthrough-experience": { name: "Breakthrough Experience", intro: BREAKTHROUGH_INTRO, faq: BREAKTHROUGH_FAQ },
};

function serviceSection(url: string): string {
  const cfg = SERVICE_SECTIONS[url];
  if (!cfg) return "";
  const intro =
    `<section aria-labelledby="snedir"><h2 id="snedir">${esc(cfg.name)} Nedir?</h2>` +
    cfg.intro.map((p) => `<p>${esc(p)}</p>`).join("") +
    `</section>`;
  const faq =
    `<section aria-labelledby="ssss"><h2 id="ssss">Sıkça Sorulan Sorular</h2>` +
    cfg.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("") +
    `</section>`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cfg.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cfg.name,
    serviceType: "Kişisel gelişim danışmanlığı (Demartini Yöntemi)",
    url: `${siteUrl}${url}`,
    areaServed: [{ "@type": "City", name: "İstanbul" }, { "@type": "Country", name: "Türkiye" }],
    provider: {
      "@type": "Person",
      name: "Şafak Özkan",
      url: `${siteUrl}/about`,
      jobTitle: "Eğitimli Demartini Yöntemi Uygulayıcısı",
    },
  };
  return (
    intro + faq +
    `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` +
    `<script type="application/ld+json">${JSON.stringify(serviceLd)}</script>`
  );
}

function primordialSection(): string {
  const intro =
    `<section aria-labelledby="pnedir"><h2 id="pnedir">Primordial Ses Meditasyonu Nedir?</h2>` +
    PRIMORDIAL_INTRO.map((p) => `<p>${esc(p)}</p>`).join("") +
    `</section>`;
  const faq =
    `<section aria-labelledby="psss"><h2 id="psss">Sıkça Sorulan Sorular</h2>` +
    PRIMORDIAL_FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("") +
    `</section>`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRIMORDIAL_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Primordial Ses (Sound) Meditasyonu",
    alternateName: ["Mantra Meditasyonu", "Primordial Sound Meditation"],
    serviceType: "Meditasyon eğitimi ve uygulaması",
    url: `${siteUrl}/primordial-ses-meditasyonu`,
    areaServed: { "@type": "Country", name: "Türkiye" },
    provider: {
      "@type": "Person",
      name: "Şafak Özkan",
      url: `${siteUrl}/about`,
      jobTitle: "Primordial Ses Meditasyonu Eğitmeni",
    },
  };
  return (
    intro +
    faq +
    `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` +
    `<script type="application/ld+json">${JSON.stringify(serviceLd)}</script>`
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

// --- YouTube: taranabilir liste + VideoObject (ItemList) JSON-LD ---
function videoSection(videos: Video[]): string {
  if (!videos.length) return "";
  const items = videos
    .map(
      (v) =>
        `<article><h3><a href="https://www.youtube.com/watch?v=${esc(v.youtube_id)}" rel="noopener">${esc(v.title)}</a></h3>` +
        (v.category ? `<p>${esc(v.category)}</p>` : "") +
        `</article>`,
    )
    .join("");
  const html = `<section aria-labelledby="videolar"><h2 id="videolar">Videolar</h2>${items}</section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoObject",
        name: v.title,
        description: v.description?.trim() || `Şafak Özkan — Demartini Metodu üzerine video: ${v.title}`,
        thumbnailUrl: `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`,
        uploadDate: v.published_at || undefined,
        contentUrl: `https://www.youtube.com/watch?v=${v.youtube_id}`,
        embedUrl: `https://www.youtube.com/embed/${v.youtube_id}`,
      },
    })),
  };
  return html + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

// --- Podcast: taranabilir liste + PodcastEpisode (PodcastSeries) JSON-LD ---
function podcastSection(eps: Podcast[]): string {
  if (!eps.length) return "";
  const items = eps
    .map(
      (e) =>
        `<article><h3>${e.episode ? esc(e.episode) + " · " : ""}${esc(e.title)}</h3>` +
        (e.description ? `<p>${esc(e.description.slice(0, 300))}</p>` : "") +
        (e.audio_url ? `<p><a href="${esc(e.audio_url)}" rel="noopener">Dinle</a></p>` : "") +
        `</article>`,
    )
    .join("");
  const html = `<section aria-labelledby="bolumler"><h2 id="bolumler">Bölümler</h2>${items}</section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "RE-SET Podcast — Şafak Özkan",
    url: `${siteUrl}/podcast`,
    author: { "@type": "Person", name: "Şafak Özkan" },
    episode: eps.map((e) => ({
      "@type": "PodcastEpisode",
      name: e.title,
      description: e.description?.trim() || undefined,
      datePublished: e.date || undefined,
      ...(e.audio_url
        ? { associatedMedia: { "@type": "MediaObject", contentUrl: e.audio_url } }
        : {}),
    })),
  };
  return html + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

// --- Blog: taranabilir yazı listesi (link + excerpt) ---
function blogSection(posts: BlogPost[]): string {
  if (!posts.length) return "";
  const items = posts
    .map(
      (p) =>
        `<article><h3><a href="/blog/${slugify(p.title)}">${esc(p.title)}</a></h3>` +
        (p.excerpt ? `<p>${esc(p.excerpt)}</p>` : "") +
        `</article>`,
    )
    .join("");
  return `<section aria-labelledby="yazilar"><h2 id="yazilar">Yazılar</h2>${items}</section>`;
}

// --- Tek gerçek yorum: yalnız GÖRÜNÜR HTML, Review JSON-LD YOK.
// Search Console kritik hatası (2026-07-09): itemReviewed=Person, yorum
// snippet'i için geçersiz tür; ayrıca kendi sitesindeki kendi hizmetine Review
// işaretlemesi Google'da "self-serving" sayılır ve zaten gösterilmez. Görünür
// testimonial SEO/GEO değerini korur; schema'sız bırakmak tek doğru çözüm. ---
function reviewSection(reviews: Review[]): string {
  const r = reviews.find((x) => x.text && (x.rating ?? 0) > 0);
  if (!r) return "";
  return (
    `<section aria-labelledby="yorum"><h2 id="yorum">Danışan Deneyimi</h2>` +
    `<blockquote><p>${esc(r.text || "")}</p><cite>${esc(r.name)}</cite></blockquote></section>`
  );
}

// Route'a göre statik, taranabilir gövde. React (createRoot) mount olunca değişir.
function bodyFor(url: string, meta: RouteMeta, data: DynData): string {
  const h1 = data.pageByPath.get(url)?.title || routeHeading[url] || meta.title;
  const lead = `<p>${esc(meta.description)}</p>`;
  const richFaqRoutes = url === "/" || url === "/demartini-yontemi";

  let inner = `<h1>${esc(h1)}</h1>${lead}`;
  if (richFaqRoutes) {
    inner += introHtml() + faqHtml() + faqJsonLd() + reviewSection(data.reviews);
  }
  if (url === "/primordial-ses-meditasyonu") inner += primordialSection();
  if (SERVICE_SECTIONS[url]) inner += serviceSection(url);
  if (url === "/youtube") inner += videoSection(data.videos);
  if (url === "/podcast") inner += podcastSection(data.podcasts);
  if (url === "/blog") inner += blogSection(data.posts);
  if (url.startsWith("/blog/")) {
    const post = data.postByPath.get(url);
    if (post?.content) {
      inner += `<article>${mdToHtml(post.content)}</article>`;
    }
  }
  const cmsPage = data.pageByPath.get(url);
  if (cmsPage?.content) {
    inner += `<article>${mdToHtml(cmsPage.content)}</article>`;
  }
  inner += navHtml();

  return `<main id="prerender-content">${inner}</main>`;
}

type DynData = {
  meta: Map<string, RouteMeta>;
  posts: BlogPost[];
  postByPath: Map<string, BlogPost>;
  videos: Video[];
  podcasts: Podcast[];
  reviews: Review[];
  heroImage: string | null;
  pageByPath: Map<string, SitePageRow>;
  // Eski UUID blog path'i → yeni slug path'i (canonical devri için)
  canonicalOverride: Map<string, string>;
};

let dynamicCache: DynData | null = null;

async function loadDynamicData(): Promise<DynData> {
  if (dynamicCache) return dynamicCache;

  const data: DynData = { meta: new Map(), posts: [], postByPath: new Map(), videos: [], podcasts: [], reviews: [], heroImage: null, pageByPath: new Map(), canonicalOverride: new Map() };
  // vite build sırasında import.meta.env değerleri statik olarak gömülür;
  // process.env prerender SSR bağlamında boş olduğu için ona güvenilmez.
  const url = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    dynamicCache = data;
    return data;
  }

  try {
    const supabase = createClient(url, key);
    const [postsRes, videosRes, podcastsRes, reviewsRes, heroRes, pagesRes] = await Promise.all([
      supabase.from("blog_posts").select("id, title, excerpt, content").eq("status", "published"),
      supabase
        .from("youtube_videos")
        .select("title, youtube_id, category, published_at, description")
        .eq("is_published", true)
        .order("published_at", { ascending: false }),
      supabase.from("podcast_episodes").select("title, description, audio_url, date, episode"),
      supabase.from("reviews").select("name, rating, text, date").eq("approved", true),
      supabase.from("hero_contents").select("image").limit(1),
      supabase.from("site_pages").select("slug, title, description, content").eq("is_published", true),
    ]);

    if (postsRes.data) {
      data.posts = postsRes.data as BlogPost[];
      for (const post of data.posts) {
        const meta = {
          title: `${post.title} | RE-SET Blog`,
          description:
            post.excerpt ||
            "Demartini Metodu ve kişisel dönüşüm üzerine RE-SET blog yazısı.",
        };
        // YENİ kanonik URL: başlıktan türeyen slug (/blog/john-demartini-kimdir...)
        const slugPath = `/blog/${slugify(post.title)}`;
        data.postByPath.set(slugPath, post);
        data.meta.set(slugPath, meta);
        // ESKİ UUID URL'leri de prerender edilir (10 yazı Google'da indeksli) ama
        // canonical'ları slug'a işaret eder → Google indeksi yeni URL'e devreder,
        // eski linkler kırılmaz. Client tarafı da UUID'yi slug'a replace-redirect eder.
        const uuidPath = `/blog/${post.id}`;
        data.postByPath.set(uuidPath, post);
        data.meta.set(uuidPath, meta);
        data.canonicalOverride.set(uuidPath, slugPath);
      }
    }
    if (videosRes.data) data.videos = videosRes.data as Video[];
    if (podcastsRes.data) data.podcasts = podcastsRes.data as Podcast[];
    if (reviewsRes.data) data.reviews = reviewsRes.data as Review[];
    if (heroRes.data && heroRes.data[0]) data.heroImage = (heroRes.data[0] as { image?: string }).image || null;
    if (pagesRes.data) {
      for (const row of pagesRes.data as SitePageRow[]) {
        const path = `/${row.slug}`;
        data.pageByPath.set(path, row);
        data.meta.set(path, {
          title: `${row.title} | Şafak Özkan — RE-SET`,
          description: row.description || row.title,
        });
      }
    }
  } catch (err) {
    console.warn("[prerender] dynamic data fetch failed:", err);
  }

  dynamicCache = data;
  return data;
}

export async function prerender({ ssr, url }: { ssr: boolean; url: string }) {
  void ssr;
  const dynamic = await loadDynamicData();
  const meta = staticMeta[url] || dynamic.meta.get(url) || staticMeta["/"];

  // Eski UUID blog URL'lerinde canonical yeni slug URL'ine işaret eder
  // (indeks devri); diğer tüm sayfalarda kendi URL'i.
  const canonicalPath = dynamic.canonicalOverride.get(url) || url;
  const canonical = `${siteUrl}${canonicalPath === "/" ? "/" : canonicalPath}`;
  const title = meta.title;
  const description = meta.description;

  // The plugin uses these to find more routes to render.
  const links = new Set<string>(Object.keys(staticMeta));
  for (const path of dynamic.meta.keys()) links.add(path);

  const headElements: Array<{ type: string; props: Record<string, string> }> = [
    { type: "meta", props: { name: "description", content: description } },
    { type: "link", props: { rel: "canonical", href: canonical } },
    { type: "meta", props: { property: "og:title", content: title } },
    { type: "meta", props: { property: "og:description", content: description } },
    { type: "meta", props: { property: "og:url", content: canonical } },
    { type: "meta", props: { property: "og:type", content: "website" } },
    { type: "meta", props: { property: "og:locale", content: "tr_TR" } },
    { type: "meta", props: { name: "twitter:card", content: "summary_large_image" } },
    { type: "meta", props: { name: "twitter:title", content: title } },
    { type: "meta", props: { name: "twitter:description", content: description } },
  ];

  // LCP: ana sayfada hero görselini JS/Supabase turunu beklemeden önden indir.
  // client-fetch zinciri (JS→hero_contents→img) yerine tarayıcı paralel başlar.
  if (url === "/" && dynamic.heroImage) {
    headElements.push({
      type: "link",
      props: {
        rel: "preload",
        as: "image",
        href: optimizedImage(dynamic.heroImage, { width: 1400 }),
        fetchpriority: "high",
      },
    });
  }

  return {
    // Gerçek, taranabilir HTML — JS çalıştırmayan botlar (GPTBot, ClaudeBot,
    // PerplexityBot) ve ilk-dalga Googlebot artık içeriği görür. createRoot
    // (hydrate DEĞİL) mount olunca bu içerik client tarafından değiştirilir,
    // dolayısıyla hydration-mismatch riski yoktur.
    html: bodyFor(url, meta, dynamic),
    links,
    head: {
      lang: "tr-TR",
      title,
      elements: new Set(headElements),
    },
  };
}
