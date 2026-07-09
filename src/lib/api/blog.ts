import { supabase, supabasePublic } from '../supabase';
import type { BlogPost } from '../../types';
import { registerCacheClearer, withTimeout } from './_cache';
import { slugify } from '../slug';

let blogPostsCache: BlogPost[] | null = null;
registerCacheClearer(() => {
  blogPostsCache = null;
});

const rowToPost = (row: Record<string, unknown>): BlogPost => ({
  id: row.id as string,
  slug: slugify(row.title as string),
  title: row.title as string,
  excerpt: row.excerpt as string,
  content: row.content as string,
  category: row.category as string,
  // Bazı satırlarda görsel `featured_image` kolonunda; ikisini de kabul et
  // (önceki hâlde featured_image düşürülüyordu → o satırların görseli boştu).
  image: (row.image as string) || (row.featured_image as string) || '',
  date: row.date as string,
  readTime: row.read_time as string,
  featured: row.featured as boolean,
  status: row.status as BlogPost['status'],
});

export const blogApi = {
  async getAll(): Promise<BlogPost[]> {
    if (blogPostsCache) return blogPostsCache;
    const { data, error } = await withTimeout(
      () =>
        supabasePublic
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false }),
      8000,
    );

    if (error) {
      console.error('Blog getAll error:', error);
      return [];
    }

    blogPostsCache = (data || []).map(rowToPost);
    return blogPostsCache;
  },

  async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const dbPost = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      image: post.image,
      date: post.date,
      read_time: post.readTime,
      featured: post.featured,
      status: post.status,
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([dbPost])
      .select()
      .single();
    if (error) throw error;
    blogPostsCache = null;
    return rowToPost(data);
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const dbUpdates: Record<string, unknown> = {
      title: updates.title,
      excerpt: updates.excerpt,
      content: updates.content,
      category: updates.category,
      image: updates.image,
      date: updates.date,
      read_time: updates.readTime,
      featured: updates.featured,
      status: updates.status,
    };
    Object.keys(dbUpdates).forEach(
      (k) => dbUpdates[k] === undefined && delete dbUpdates[k],
    );

    const { data, error } = await supabase
      .from('blog_posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    blogPostsCache = null;
    return rowToPost(data);
  },

  async getById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabasePublic
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('Blog getById error:', error);
      return null;
    }
    if (!data) return null;
    return rowToPost(data);
  },

  // Slug başlıktan türetildiği için DB'de slug kolonu yok → yayınlanmış
  // yazıları çekip slug eşleşmesi ararız (liste zaten cache'li, ucuz).
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const all = await this.getAll();
    return all.find((p) => p.slug === slug) || null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    blogPostsCache = null;
    return true;
  },
};
