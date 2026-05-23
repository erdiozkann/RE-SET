import { supabase } from '../supabase';
import type { YouTubeVideo } from '../../types';
import type {
  CreateYouTubeVideoInput,
  UpdateYouTubeVideoInput,
} from '../../types/api';
import { registerCacheClearer } from './_cache';

let youtubeVideosCache: YouTubeVideo[] | null = null;
let publishedYoutubeVideosCache: YouTubeVideo[] | null = null;

registerCacheClearer(() => {
  youtubeVideosCache = null;
  publishedYoutubeVideosCache = null;
});

const rowToVideo = (v: Record<string, unknown>): YouTubeVideo => ({
  id: v.id as string,
  youtubeId: v.youtube_id as string,
  title: v.title as string,
  description: v.description as string,
  thumbnail: v.thumbnail as string,
  publishedAt: v.published_at as string,
  isPublished: (v.is_published as boolean | null) ?? true,
  viewCount: (v.view_count as number) || 0,
  duration: (v.duration as string) || '',
  category: (v.category as string) || 'Genel',
});

export const youtubeApi = {
  async getAll() {
    if (youtubeVideosCache) return youtubeVideosCache;
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) throw error;
    youtubeVideosCache = (data || []).map(rowToVideo);
    return youtubeVideosCache;
  },

  async getPublished() {
    if (publishedYoutubeVideosCache) return publishedYoutubeVideosCache;
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error) throw error;
    publishedYoutubeVideosCache = (data || []).map(rowToVideo);
    return publishedYoutubeVideosCache;
  },

  async create(video: CreateYouTubeVideoInput) {
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([
        {
          youtube_id: video.youtubeId,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          published_at: video.publishedAt,
          is_published: video.isPublished ?? true,
          duration: video.duration,
          category: video.category,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    youtubeVideosCache = null;
    publishedYoutubeVideosCache = null;
    return data;
  },

  async update(id: string, updates: UpdateYouTubeVideoInput) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.youtubeId) dbUpdates.youtube_id = updates.youtubeId;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail;
    if (updates.publishedAt) dbUpdates.published_at = updates.publishedAt;
    if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.category) dbUpdates.category = updates.category;

    const { data, error } = await supabase
      .from('youtube_videos')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    youtubeVideosCache = null;
    publishedYoutubeVideosCache = null;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
    if (error) throw error;
    youtubeVideosCache = null;
    publishedYoutubeVideosCache = null;
    return true;
  },
};
