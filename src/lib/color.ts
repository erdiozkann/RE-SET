// Panelden serbestçe seçilen metin rengi, açık zeminli kart/bölümlerde
// okunmaz olabilir (yaşanmış örnek: hero text_color #e5d9d6 — eski "koyu
// görsel üstüne açık yazı" tasarımından kalma — beyaz kartta görünmezdi).
// Bu guard, rengin göreli parlaklığı açık zemin için fazla yüksekse güvenli
// koyu fallback'e düşer; koyu/okunur renkleri olduğu gibi geçirir.

const linearize = (c: number) =>
  c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function relativeLuminance(hex6: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex6.slice(i, i + 2), 16) / 255);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// Eşik 0.25: beyaz/80 kart üzerinde ~AA kontrastın pragmatik sınırı.
// (AA'nın saf beyazda teorik sınırı ~0.18; kart altındaki görsel zemini
// hafif koyulaştırdığı için küçük bir tolerans bırakıldı.)
const LIGHT_BG_LUMINANCE_MAX = 0.25;

export function readableOnLight(
  input: string | null | undefined,
  fallback: string
): string {
  if (!input) return fallback;
  const m = input.trim().match(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (!m) return fallback; // rgb()/isim gibi formatlar → güvenli varsayılan
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return relativeLuminance(hex) > LIGHT_BG_LUMINANCE_MAX ? fallback : `#${hex}`;
}
