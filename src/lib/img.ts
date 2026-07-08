// Supabase Storage public görselini, on-the-fly image transform ile
// webp'e çevirip yeniden boyutlandırır (Pro plan image transformation açık).
// 411KB JPEG → ~37KB webp. Sadece Supabase public storage URL'lerinde çalışır;
// harici/placeholder URL'ler dokunulmadan döner.
export function optimizedImage(
  url: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' } = {},
): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url || '';
  const { width, height, quality = 75, resize } = opts;
  const base = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/',
  );
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  // resize=cover → sunucu tarafında sabit en-boy oranına ORTALAYARAK kırpar.
  // Böylece aynı görsel her yerde (liste + detay) birebir aynı çerçevede görünür;
  // farklı native oranlar CSS'e bırakılınca tutarsız kırpma oluyordu.
  if (resize) params.set('resize', resize);
  params.set('quality', String(quality));
  params.set('format', 'webp');
  return `${base}?${params.toString()}`;
}
