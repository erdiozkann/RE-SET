// Başlıktan URL slug'ı — Türkçe karakter dönüşümlü, deterministik.
// Blog URL'leri yazı adından TÜRETİLİR (DB'de slug kolonu yok): başlık neyse
// link o olur, ikisi asla ayrışamaz. Aynı fonksiyon prerender + client +
// sitemap tarafından kullanılır; üçü daima aynı URL'i üretir.
const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
};

export function slugify(title: string): string {
  return (title || '')
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // kalan aksanlar
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

// UUID mi? (eski /blog/<uuid> linklerini tanıyıp slug'a yönlendirmek için)
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
