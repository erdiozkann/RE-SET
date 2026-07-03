import { marked } from "marked";

// Tek markdown yapılandırması — hem client blog detay render'ı hem prerender
// statik gövdesi bunu kullanır (tutarlı çıktı).
//   gfm    : GitHub-flavored (tablo, liste vb.)
//   breaks : tek satır sonu → <br>. Eski düz-metin yazılar (markdown değil,
//            paragraf içi tek newline kullanan) bozulmadan render olsun diye.
marked.setOptions({ gfm: true, breaks: true });

/** Markdown metnini HTML string'e çevirir (senkron). */
export function mdToHtml(md: string | null | undefined): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
}
