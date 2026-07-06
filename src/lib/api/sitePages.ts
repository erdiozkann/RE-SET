import { supabase, supabasePublic } from '../supabase';
import type { SitePage } from '../../types';
import { registerCacheClearer } from './_cache';

// Panelden yönetilen içerik sayfaları (site_pages tablosu).
// Public read yalnızca yayınlı sayfalar (RLS); yazma admin.

let cache: SitePage[] | null = null;
registerCacheClearer(() => {
  cache = null;
});

const rowToPage = (r: Record<string, unknown>): SitePage => ({
  id: r.id as string,
  slug: r.slug as string,
  title: r.title as string,
  description: (r.description as string) || '',
  content: (r.content as string) || '',
  isPublished: Boolean(r.is_published),
  sortOrder: (r.sort_order as number) ?? 0,
  updatedAt: r.updated_at as string,
});

export const sitePagesApi = {
  // Yayınlı sayfalar (public liste / prerender).
  async getPublished(): Promise<SitePage[]> {
    if (cache) return cache;
    const { data, error } = await supabasePublic
      .from('site_pages')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('sitePages getPublished:', error);
      return [];
    }
    cache = (data || []).map(rowToPage);
    return cache;
  },

  async getBySlug(slug: string): Promise<SitePage | null> {
    const { data, error } = await supabasePublic
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    if (error || !data) return null;
    return rowToPage(data);
  },

  // --- Admin ---
  async getAllAdmin(): Promise<SitePage[]> {
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(rowToPage);
  },

  async create(p: Partial<SitePage>): Promise<void> {
    const { error } = await supabase.from('site_pages').insert({
      slug: p.slug,
      title: p.title,
      description: p.description || '',
      content: p.content || '',
      is_published: p.isPublished ?? false,
      sort_order: p.sortOrder ?? 0,
    });
    if (error) throw error;
    cache = null;
  },

  async update(id: string, p: Partial<SitePage>): Promise<void> {
    const patch: Record<string, unknown> = {};
    if (p.slug !== undefined) patch.slug = p.slug;
    if (p.title !== undefined) patch.title = p.title;
    if (p.description !== undefined) patch.description = p.description;
    if (p.content !== undefined) patch.content = p.content;
    if (p.isPublished !== undefined) patch.is_published = p.isPublished;
    if (p.sortOrder !== undefined) patch.sort_order = p.sortOrder;
    const { error } = await supabase.from('site_pages').update(patch).eq('id', id);
    if (error) throw error;
    cache = null;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('site_pages').delete().eq('id', id);
    if (error) throw error;
    cache = null;
  },
};
