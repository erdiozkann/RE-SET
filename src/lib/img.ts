// Supabase Storage public görselini, on-the-fly image transform ile
// webp'e çevirip yeniden boyutlandırır (Pro plan image transformation açık).
// 411KB JPEG → ~37KB webp. Sadece Supabase public storage URL'lerinde çalışır;
// harici/placeholder URL'ler dokunulmadan döner.
export function optimizedImage(
  url: string | null | undefined,
  opts: { width?: number; quality?: number } = {},
): string {
  if (!url || !url.includes('/storage/v1/object/public/')) return url || '';
  const { width, quality = 75 } = opts;
  const base = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/',
  );
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  params.set('quality', String(quality));
  params.set('format', 'webp');
  return `${base}?${params.toString()}`;
}
