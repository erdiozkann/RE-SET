// Shared cache + timeout helpers for all content/media APIs.
//
// Each domain API (methods, blog, podcast, ...) owns its own module-local cache
// variable and registers a clearer here. `clearContentCache()` then resets every
// registered cache at once — the same single entry point consumers used before
// the split, so no callers need to change.

const cacheClearers: Array<() => void> = [];

export function registerCacheClearer(clearFn: () => void): void {
  cacheClearers.push(clearFn);
}

export function clearContentCache(): void {
  for (const clear of cacheClearers) clear();
  // Kept intentionally — used by admin save flows to confirm a refresh happened.
  console.log('Content cache cleared');
}

// Throws if `action` doesn't settle within `ms` milliseconds. Used to keep
// public-facing fetches from hanging when Supabase is slow.
export function withTimeout<T>(
  action: () => Promise<T> | PromiseLike<T>,
  ms = 8000,
  msg = 'Sunucu isteği zaman aşımına uğradı',
): Promise<T> {
  return Promise.race([
    Promise.resolve(action()),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);
}
