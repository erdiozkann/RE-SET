import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://re-set.com.tr";

type RouteMeta = {
  title: string;
  description: string;
};

const staticMeta: Record<string, RouteMeta> = {
  "/": {
    title: "RE-SET | Şafak Özkan — Demartini Metodu Türkiye | İstanbul",
    description:
      "Sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan ile İstanbul'da değer belirleme, ilişki dengeleme ve kişisel dönüşüm seansları.",
  },
  "/about": {
    title: "Hakkımda — Şafak Özkan | Demartini Metodu",
    description:
      "Sertifikalı Demartini Metodu uygulayıcısı Şafak Özkan. 15+ yıllık uygulama deneyimi, Nişantaşı / İstanbul.",
  },
  "/methods": {
    title:
      "Demartini Metodu, Değer Belirleme & Breakthrough Experience | Yöntemler",
    description:
      "Şafak Özkan'ın uyguladığı yöntemler: Demartini Metodu, 13 sorulu Değer Belirleme Süreci, Quantum Collapse Process, Breakthrough Experience ve ilişki dengeleme.",
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
  const meta = staticMeta[url] || dynamic.get(url);

  // Per-route head only — body stays empty so React mounts client-side as usual.
  // The point is to give crawlers (including JS-less LLM bots) the right title,
  // description, canonical, OG tags for *this specific* route in the static HTML.
  const canonical = `${siteUrl}${url === "/" ? "/" : url}`;
  const title = meta?.title || staticMeta["/"].title;
  const description = meta?.description || staticMeta["/"].description;

  // The plugin uses these to find more routes to render.
  const links = new Set<string>(Object.keys(staticMeta));
  for (const path of dynamic.keys()) links.add(path);

  return {
    html: "",
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
