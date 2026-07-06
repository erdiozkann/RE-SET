import { createClient } from "@supabase/supabase-js";
import { FAQ } from "./data/faq";
import { mdToHtml } from "./lib/markdown";
import { optimizedImage } from "./lib/img";

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
      "Eğitimli Demartini Yöntemi (Metodu) uygulayıcısı Şafak Özkan. 15+ yıllık uygulama deneyimi, Nişantaşı / İstanbul.",
  },
  "/demartini-yontemi": {
    title: "Demartini Yöntemi — Şafak Özkan | RE-SET Türkiye",
    description:
      "Demartini Yöntemi (Demartini Metodu): Eğitimli uygulayıcı Şafak Özkan ile İstanbul/Nişantaşı'da değer belirleme, Breakthrough Experience, Quantum Collapse Process ve ilişki dengeleme seansları.",
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
        `<article><h3><a href="/blog/${esc(p.id)}">${esc(p.title)}</a></h3>` +
        (p.excerpt ? `<p>${esc(p.excerpt)}</p>` : "") +
        `</article>`,
    )
    .join("");
  return `<section aria-labelledby="yazilar"><h2 id="yazilar">Yazılar</h2>${items}</section>`;
}

// --- Tek gerçek yorum: dürüst Review JSON-LD (AggregateRating YOK: self-serving) ---
function reviewSection(reviews: Review[]): string {
  const r = reviews.find((x) => x.text && (x.rating ?? 0) > 0);
  if (!r) return "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Person",
      name: "Şafak Özkan",
      url: `${siteUrl}/about`,
    },
    author: { "@type": "Person", name: r.name },
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    reviewBody: r.text,
    datePublished: r.date || undefined,
  };
  const html =
    `<section aria-labelledby="yorum"><h2 id="yorum">Danışan Deneyimi</h2>` +
    `<blockquote><p>${esc(r.text || "")}</p><cite>${esc(r.name)}</cite></blockquote></section>`;
  return html + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

// Route'a göre statik, taranabilir gövde. React (createRoot) mount olunca değişir.
function bodyFor(url: string, meta: RouteMeta, data: DynData): string {
  const h1 = routeHeading[url] || meta.title;
  const lead = `<p>${esc(meta.description)}</p>`;
  const richFaqRoutes = url === "/" || url === "/demartini-yontemi";

  let inner = `<h1>${esc(h1)}</h1>${lead}`;
  if (richFaqRoutes) {
    inner += introHtml() + faqHtml() + faqJsonLd() + reviewSection(data.reviews);
  }
  if (url === "/youtube") inner += videoSection(data.videos);
  if (url === "/podcast") inner += podcastSection(data.podcasts);
  if (url === "/blog") inner += blogSection(data.posts);
  if (url.startsWith("/blog/")) {
    const post = data.postByPath.get(url);
    if (post?.content) {
      inner += `<article>${mdToHtml(post.content)}</article>`;
    }
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
};

let dynamicCache: DynData | null = null;

async function loadDynamicData(): Promise<DynData> {
  if (dynamicCache) return dynamicCache;

  const data: DynData = { meta: new Map(), posts: [], postByPath: new Map(), videos: [], podcasts: [], reviews: [], heroImage: null };
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
    const [postsRes, videosRes, podcastsRes, reviewsRes, heroRes] = await Promise.all([
      supabase.from("blog_posts").select("id, title, excerpt, content").eq("status", "published"),
      supabase
        .from("youtube_videos")
        .select("title, youtube_id, category, published_at, description")
        .eq("is_published", true)
        .order("published_at", { ascending: false }),
      supabase.from("podcast_episodes").select("title, description, audio_url, date, episode"),
      supabase.from("reviews").select("name, rating, text, date").eq("approved", true),
      supabase.from("hero_contents").select("image").limit(1),
    ]);

    if (postsRes.data) {
      data.posts = postsRes.data as BlogPost[];
      for (const post of data.posts) {
        const path = `/blog/${post.id}`;
        data.postByPath.set(path, post);
        data.meta.set(path, {
          title: `${post.title} | RE-SET Blog`,
          description:
            post.excerpt ||
            "Demartini Metodu ve kişisel dönüşüm üzerine RE-SET blog yazısı.",
        });
      }
    }
    if (videosRes.data) data.videos = videosRes.data as Video[];
    if (podcastsRes.data) data.podcasts = podcastsRes.data as Podcast[];
    if (reviewsRes.data) data.reviews = reviewsRes.data as Review[];
    if (heroRes.data && heroRes.data[0]) data.heroImage = (heroRes.data[0] as { image?: string }).image || null;
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

  const canonical = `${siteUrl}${url === "/" ? "/" : url}`;
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
