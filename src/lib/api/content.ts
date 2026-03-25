import { supabase, supabasePublic } from '../supabase';
import { ApiError } from '../errors';
import type {
    HeroContent,
    AboutContent,
    ContactInfo,
    ProfileImage,
    Method,
    Certificate,
    ContactMessage,
    BlogPost,
    PodcastEpisode,
    YouTubeVideo
} from '../../types';
import type {
    UpdateContentInput,
    CreateReviewInput,
    CreateContactMessageInput,
    CreateBlogPostInput,
    CreatePodcastEpisodeInput,
    CreateYouTubeVideoInput,
    UpdateYouTubeVideoInput
} from '../../types/api';

// Content API coverage: Hero, About, Contact, ProfileImages, Legal, Methods, Certificates, Reviews, Messages, Blog, Podcast, YouTube

// Helper: Tıkanmaları önlemek için istek zaman aşımı (Timeout) sarmalayıcısı
const withTimeout = <T,>(action: () => Promise<T> | PromiseLike<T>, ms = 8000, msg = 'Sunucu isteği zaman aşımına uğradı'): Promise<T> => {
    return Promise.race([
        Promise.resolve(action()),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
    ]);
};

// --- Static Content ---

// In-memory cache
let heroContentsCache: HeroContent[] | null = null;
let aboutContentsCache: AboutContent[] | null = null;
let contactInfoCache: ContactInfo | null = null;
let profileImagesCache: ProfileImage[] | null = null;
let methodsCache: Method[] | null = null;
let certificatesCache: Certificate[] | null = null;
let blogPostsCache: BlogPost[] | null = null;
let podcastEpisodesCache: PodcastEpisode[] | null = null;
let youtubeVideosCache: YouTubeVideo[] | null = null;
let publishedYoutubeVideosCache: YouTubeVideo[] | null = null;

export const clearContentCache = () => {
    heroContentsCache = null;
    aboutContentsCache = null;
    contactInfoCache = null;
    profileImagesCache = null;
    methodsCache = null;
    certificatesCache = null;
    blogPostsCache = null;
    podcastEpisodesCache = null;
    youtubeVideosCache = null;
    publishedYoutubeVideosCache = null;
    console.log('Content cache cleared');
};

export const contentApi = {
    async getHeroContents(): Promise<HeroContent[]> {
        if (heroContentsCache) return heroContentsCache;
        const { data, error } = await supabasePublic
            .from('hero_contents')
            .select('*');

        if (error) {
            console.error('Hero içerikleri alınırken hata:', error);
            throw error;
        }

        heroContentsCache = data || [];
        return heroContentsCache;
    },

    async updateHeroContent(id: string, updates: UpdateContentInput): Promise<HeroContent> {
        const { data, error } = await supabase
            .from('hero_contents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        heroContentsCache = null; // Invalidate cache
        return data;
    },

    async getAboutContents(): Promise<AboutContent[]> {
        if (aboutContentsCache) return aboutContentsCache;
        const { data, error } = await supabasePublic
            .from('about_contents')
            .select('*');

        if (error) {
            console.error('Hakkımızda içerikleri alınırken hata:', error);
            throw error;
        }

        aboutContentsCache = data || [];
        return aboutContentsCache;
    },

    async updateAboutContent(id: string, updates: UpdateContentInput): Promise<AboutContent> {
        const { data, error } = await supabase
            .from('about_contents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        aboutContentsCache = null; // Invalidate cache
        return data;
    },

    async getContactInfo(): Promise<ContactInfo> {
        if (contactInfoCache) return contactInfoCache;

        const { data, error } = await supabasePublic
            .from('contact_info')
            .select('*')
            .limit(1)
            .maybeSingle();

        // Fallback object matching ContactInfo interface
        const fallback: ContactInfo = {
            id: 'fallback',
            email: '',
            phone: '',
            address: '',
            workingHours: '',
            instagram: '',
            youtube: '',
            logo_url: ''
        };

        if (error) {
            console.error('[ContentAPI] Contact Info error:', error);
            // Return fallback on error to prevent crash
            return fallback;
        }

        if (!data) {
            return fallback;
        }

        contactInfoCache = data as ContactInfo;
        return contactInfoCache;
    },

    async updateContactInfo(updates: UpdateContentInput): Promise<ContactInfo> {
        // Önce mevcut kaydı al
        const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();

        if (!existing?.id) {
            throw new ApiError('İletişim bilgisi bulunamadı', 'NOT_FOUND', 404);
        }

        const { data, error } = await supabase
            .from('contact_info')
            .update(updates)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        contactInfoCache = null; // Invalidate cache
        return data;
    },

    async getProfileImages(): Promise<ProfileImage[]> {
        if (profileImagesCache) return profileImagesCache;
        const { data, error } = await supabasePublic
            .from('profile_images')
            .select('*');

        if (error) throw error;
        profileImagesCache = data || [];
        return profileImagesCache;
    },

    async updateProfileImage(id: string, url: string): Promise<ProfileImage> {
        const { data, error } = await supabase
            .from('profile_images')
            .update({ url })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        profileImagesCache = null; // Invalidate cache
        return data;
    },

    // KVKK içerik yönetimi
    async getKvkkContent(): Promise<{ id: string; content: string } | null> {
        const { data, error } = await supabase
            .from('legal_contents')
            .select('*')
            .eq('type', 'kvkk')
            .maybeSingle(); // Use maybeSingle to avoid error on empty

        if (error) {
            console.error('KVKK içeriği alınırken hata:', error);
        }
        return data;
    },

    async updateKvkkContent(content: string): Promise<void> {
        const existing = await this.getKvkkContent();

        if (existing) {
            const { error } = await supabase
                .from('legal_contents')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', existing.id);

            if (error) throw new ApiError('KVKK içeriği güncellenemedi', 'UPDATE_FAILED', 500);
        } else {
            const { error } = await supabase
                .from('legal_contents')
                .insert({ type: 'kvkk', content });

            if (error) throw new ApiError('KVKK içeriği oluşturulamadı', 'CREATE_FAILED', 500);
        }
    },

    // Gizlilik Politikası
    async getPrivacyContent(): Promise<{ id: string; content: string } | null> {
        const { data, error } = await supabase
            .from('legal_contents')
            .select('*')
            .eq('type', 'privacy')
            .maybeSingle();

        if (error) {
            console.error('Gizlilik içeriği alınırken hata:', error);
        }
        return data;
    },

    async updatePrivacyContent(content: string): Promise<void> {
        const existing = await this.getPrivacyContent();

        if (existing) {
            const { error } = await supabase
                .from('legal_contents')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', existing.id);

            if (error) throw new ApiError('Gizlilik içeriği güncellenemedi', 'UPDATE_FAILED', 500);
        } else {
            const { error } = await supabase
                .from('legal_contents')
                .insert({ type: 'privacy', content });

            if (error) throw new ApiError('Gizlilik içeriği oluşturulamadı', 'CREATE_FAILED', 500);
        }
    },

    // Çerez Politikası
    async getCookiesContent(): Promise<{ id: string; content: string } | null> {
        const { data, error } = await supabase
            .from('legal_contents')
            .select('*')
            .eq('type', 'cookies')
            .maybeSingle();

        if (error) {
            console.error('Çerez politikası içeriği alınırken hata:', error);
        }
        return data;
    },

    async updateCookiesContent(content: string): Promise<void> {
        const existing = await this.getCookiesContent();

        if (existing) {
            const { error } = await supabase
                .from('legal_contents')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', existing.id);

            if (error) throw new ApiError('Çerez politikası içeriği güncellenemedi', 'UPDATE_FAILED', 500);
        } else {
            const { error } = await supabase
                .from('legal_contents')
                .insert({ type: 'cookies', content });

            if (error) throw new ApiError('Çerez politikası içeriği oluşturulamadı', 'CREATE_FAILED', 500);
        }
    }
};

// --- Methods & Certificates ---

export const methodsApi = {
    async getAll() {
        if (methodsCache) return methodsCache;
        const { data, error } = await supabasePublic
            .from('methods')
            .select('*');

        if (error) throw error;
        methodsCache = data || [];
        return methodsCache;
    },

    async create(method: Omit<Method, 'id'>) {
        const { data, error } = await supabase
            .from('methods')
            .insert([method])
            .select() // .single()? returns array by default unless .single() called
            .single();

        if (error) throw error;
        methodsCache = null; // Invalidate cache
        return data;
    },

    async update(id: string, updates: Partial<Method>) {
        const { data, error } = await supabase
            .from('methods')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        methodsCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('methods')
            .delete()
            .eq('id', id);

        if (error) throw error;
        methodsCache = null; // Invalidate cache
        return true;
    }
};

export const certificatesApi = {
    async getAll() {
        if (certificatesCache) return certificatesCache;
        const { data, error } = await supabasePublic
            .from('certificates')
            .select('*');

        if (error) throw error;
        certificatesCache = data || [];
        return certificatesCache;
    },

    async create(cert: Omit<Certificate, 'id'>) {
        const { data, error } = await supabase
            .from('certificates')
            .insert([cert])
            .select()
            .single();

        if (error) throw error;
        certificatesCache = null; // Invalidate cache
        return data;
    },

    async update(id: string, updates: Partial<Certificate>) {
        const { data, error } = await supabase
            .from('certificates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        certificatesCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('certificates')
            .delete()
            .eq('id', id);

        if (error) throw error;
        certificatesCache = null; // Invalidate cache
        return true;
    }
};

// --- User Interaction (Reviews, Messages) ---

export const reviewsApi = {
    async getAll(adminView = false) {
        let query = supabase.from('reviews').select('*');

        if (!adminView) {
            query = query.eq('approved', true);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(review: CreateReviewInput) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([review])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggleApproval(id: string) {
        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('approved')
            .eq('id', id)
            .single();

        if (fetchError || !review) throw new Error('Review not found');

        const { data, error } = await supabase
            .from('reviews')
            .update({ approved: !review.approved })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

export const messagesApi = {
    async getAll(): Promise<ContactMessage[]> {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(message: CreateContactMessageInput): Promise<ContactMessage> {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{
                name: message.name,
                email: message.email,
                phone: message.phone || null,
                subject: message.subject || 'İletişim Formu',
                message: message.message,
                date: new Date().toISOString().split('T')[0],
                read: false
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async markRead(id: string): Promise<ContactMessage> {
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error; // Replaced handleSupabaseError with throw to simplify imports/deps
        return true;
    }
};

// --- Media Content (Blog, Podcast, YouTube) ---

export const blogApi = {
    async getAll(): Promise<BlogPost[]> {
        if (blogPostsCache) return blogPostsCache;
        const { data, error } = await withTimeout(() => supabase
            .from('blog_posts')
            .select('*')
            .order('date', { ascending: false }), 8000);

        if (error) {
            console.error('Blog getAll error:', error);
            // Don't throw, return empty array to avoid crashing UI
            return [];
        }

        blogPostsCache = data || [];
        return blogPostsCache;
    },

    async create(post: CreateBlogPostInput): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([post])
            .select()
            .single();

        if (error) throw error;
        blogPostsCache = null; // Invalidate cache
        return data;
    },

    async update(id: string, updates: Partial<CreateBlogPostInput>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        blogPostsCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        blogPostsCache = null; // Invalidate cache
        return true;
    }
};

export const podcastApi = {
    async getAll(): Promise<PodcastEpisode[]> {
        if (podcastEpisodesCache) return podcastEpisodesCache;

        const { data, error } = await supabase
            .from('podcast_episodes')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Podcast getAll error:', error);
            return [];
        }

        podcastEpisodesCache = data || [];
        return podcastEpisodesCache;
    },

    async create(episode: CreatePodcastEpisodeInput): Promise<PodcastEpisode> {
        const { data, error } = await supabase
            .from('podcast_episodes')
            .insert([episode])
            .select()
            .single();

        if (error) throw error;
        podcastEpisodesCache = null; // Invalidate cache
        return data;
    },

    async update(id: string, updates: Partial<CreatePodcastEpisodeInput>): Promise<PodcastEpisode> {
        const { data, error } = await supabase
            .from('podcast_episodes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        podcastEpisodesCache = null; // Invalidate cache
        return data;
    },

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('podcast_episodes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        podcastEpisodesCache = null; // Invalidate cache
        return true;
    }
};

export const youtubeApi = {
    async getAll() {
        if (youtubeVideosCache) return youtubeVideosCache;
        const { data, error } = await supabase
            .from('youtube_videos')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;
        const mappedData = (data || []).map(v => ({
            id: v.id,
            youtubeId: v.youtube_id,
            title: v.title,
            description: v.description,
            thumbnail: v.thumbnail,
            publishedAt: v.published_at,
            isPublished: v.is_published ?? true,
            viewCount: v.view_count || 0,
            duration: v.duration || '',
            category: v.category || 'Genel'
        }));
        youtubeVideosCache = mappedData;
        return mappedData;
    },

    async getPublished() {
        if (publishedYoutubeVideosCache) return publishedYoutubeVideosCache;
        const { data, error } = await supabase
            .from('youtube_videos')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (error) throw error;
        const mappedData = (data || []).map(v => ({
            id: v.id,
            youtubeId: v.youtube_id,
            title: v.title,
            description: v.description,
            thumbnail: v.thumbnail,
            publishedAt: v.published_at,
            isPublished: v.is_published ?? true,
            viewCount: v.view_count || 0,
            duration: v.duration || '',
            category: v.category || 'Genel'
        }));
        publishedYoutubeVideosCache = mappedData;
        return mappedData;
    },

    async create(video: CreateYouTubeVideoInput) {
        const { data, error } = await supabase
            .from('youtube_videos')
            .insert([{
                youtube_id: video.youtubeId,
                title: video.title,
                description: video.description,
                thumbnail: video.thumbnail,
                published_at: video.publishedAt,
                is_published: video.isPublished ?? true,
                duration: video.duration,
                category: video.category
            }])
            .select()
            .single();

        if (error) throw error;
        youtubeVideosCache = null; // Invalidate cache
        publishedYoutubeVideosCache = null;
        return data;
    },

    async update(id: string, updates: UpdateYouTubeVideoInput) {
        const dbUpdates: any = {};
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
        youtubeVideosCache = null; // Invalidate cache
        publishedYoutubeVideosCache = null;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('youtube_videos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        youtubeVideosCache = null; // Invalidate cache
        publishedYoutubeVideosCache = null;
        return true;
    }
};
