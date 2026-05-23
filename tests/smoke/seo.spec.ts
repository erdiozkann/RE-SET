import { test, expect } from '@playwright/test';

test.describe('SEO / GEO surfaces', () => {
  test('/sitemap.xml is served and lists key routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    for (const path of ['/about', '/methods', '/blog', '/contact']) {
      expect(body).toContain(path);
    }
  });

  test('/llms.txt and /llms-full.txt are served for LLM crawlers', async ({ request }) => {
    const llms = await request.get('/llms.txt');
    expect(llms.status()).toBe(200);

    const llmsFull = await request.get('/llms-full.txt');
    expect(llmsFull.status()).toBe(200);
    const body = await llmsFull.text();
    expect(body).toContain('Demartini');
  });

  test('robots.txt allows indexing and references sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/sitemap/i);
  });
});
