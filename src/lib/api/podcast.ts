import { supabase, supabasePublic } from '../supabase';
import type { PodcastEpisode } from '../../types';
import { registerCacheClearer } from './_cache';

let podcastEpisodesCache: PodcastEpisode[] | null = null;
registerCacheClearer(() => {
  podcastEpisodesCache = null;
});

const rowToEpisode = (row: Record<string, unknown>): PodcastEpisode => ({
  id: row.id as string,
  title: row.title as string,
  description: row.description as string,
  audioUrl: row.audio_url as string,
  duration: row.duration as string,
  date: row.date as string,
  episode: row.episode as number,
  category: row.category as string,
  image: row.image as string,
});

export const podcastApi = {
  async getAll(): Promise<PodcastEpisode[]> {
    if (podcastEpisodesCache) return podcastEpisodesCache;

    const { data, error } = await supabasePublic
      .from('podcast_episodes')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Podcast getAll error:', error);
      return [];
    }

    podcastEpisodesCache = (data || []).map(rowToEpisode);
    return podcastEpisodesCache;
  },

  async create(episode: Partial<PodcastEpisode>): Promise<PodcastEpisode> {
    const dbEpisode = {
      title: episode.title,
      description: episode.description,
      audio_url: episode.audioUrl,
      duration: episode.duration,
      date: episode.date,
      episode: episode.episode,
      category: episode.category,
      image: episode.image,
    };

    const { data, error } = await supabase
      .from('podcast_episodes')
      .insert([dbEpisode])
      .select()
      .single();
    if (error) throw error;
    podcastEpisodesCache = null;
    return rowToEpisode(data);
  },

  async update(id: string, updates: Partial<PodcastEpisode>): Promise<PodcastEpisode> {
    const dbUpdates: Record<string, unknown> = {
      title: updates.title,
      description: updates.description,
      audio_url: updates.audioUrl,
      duration: updates.duration,
      date: updates.date,
      episode: updates.episode,
      category: updates.category,
      image: updates.image,
    };
    Object.keys(dbUpdates).forEach(
      (k) => dbUpdates[k] === undefined && delete dbUpdates[k],
    );

    const { data, error } = await supabase
      .from('podcast_episodes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    podcastEpisodesCache = null;
    return rowToEpisode(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('podcast_episodes').delete().eq('id', id);
    if (error) throw error;
    podcastEpisodesCache = null;
    return true;
  },
};
