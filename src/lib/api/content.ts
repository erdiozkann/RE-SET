import { supabase, supabasePublic } from '../supabase';
import { ApiError } from '../errors';
import type {
  HeroContent,
  AboutContent,
  ContactInfo,
  ProfileImage,
} from '../../types';
import { registerCacheClearer } from './_cache';

// Site-content API: hero, about, contact info, profile images, legal pages.
// The remaining content domains (methods, certificates, reviews, messages,
// blog, podcast, youtube) live in their own files for maintainability.
// All eight files share `clearContentCache()` from ./_cache.

let heroContentsCache: HeroContent[] | null = null;
let aboutContentsCache: AboutContent[] | null = null;
let contactInfoCache: ContactInfo | null = null;
let profileImagesCache: ProfileImage[] | null = null;

// In-flight istek paylaşımı: Header + Footer + sayfa aynı anda getContactInfo()
// çağırdığında, ilk yanıt gelmeden hepsi cache'i boş görüp AYRI ağ turu
// atıyordu (contact_info 3×). Süren promise'i paylaşınca tek tur kalır.
const inflight = new Map<string, Promise<unknown>>();
function dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fetcher().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

registerCacheClearer(() => {
  heroContentsCache = null;
  aboutContentsCache = null;
  contactInfoCache = null;
  profileImagesCache = null;
  inflight.clear();
});

// Re-export `clearContentCache` from the central module so admin save flows
// that previously imported it from this file keep working.
export { clearContentCache } from './_cache';

export const contentApi = {
  async getHeroContents(): Promise<HeroContent[]> {
    if (heroContentsCache) return heroContentsCache;
    return dedupe('hero_contents', async () => {
      if (heroContentsCache) return heroContentsCache;
      // ORDER BY şart: birden fazla satır varsa, ORDER'sız [0] her sorguda/rolde
      // farklı satır dönebilir → home ile panel farklı hero gösterir. En eski satırı
      // kanonik kabul et (home, prerender ve panel aynı satırı okur/düzenler).
      const { data, error } = await supabasePublic
        .from('hero_contents')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Hero içerikleri alınırken hata:', error);
        throw error;
      }

      const mapped = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        location: item.location,
        titleSize: item.title_size,
        descriptionSize: item.description_size,
        image: item.image,
        text_color: item.text_color,
      }));

      heroContentsCache = mapped;
      return heroContentsCache;
    });
  },

  async updateHeroContent(
    id: string,
    updates: Partial<HeroContent>,
  ): Promise<HeroContent> {
    const dbUpdates: Record<string, unknown> = {
      title: updates.title,
      description: updates.description,
      image: updates.image,
      text_color: updates.text_color,
      title_size: updates.titleSize,
      description_size: updates.descriptionSize,
      location: updates.location,
    };
    Object.keys(dbUpdates).forEach(
      (key) => dbUpdates[key] === undefined && delete dbUpdates[key],
    );

    const { data, error } = await supabase
      .from('hero_contents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    heroContentsCache = null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      location: data.location,
      titleSize: data.title_size,
      descriptionSize: data.description_size,
      image: data.image,
      text_color: data.text_color,
    };
  },

  async getAboutContents(): Promise<AboutContent[]> {
    if (aboutContentsCache) return aboutContentsCache;
    return dedupe('about_contents', async () => {
      if (aboutContentsCache) return aboutContentsCache;
      const { data, error } = await supabasePublic.from('about_contents').select('*');

      if (error) {
        console.error('Hakkımızda içerikleri alınırken hata:', error);
        throw error;
      }

      const mapped = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        paragraph1: item.paragraph1,
        paragraph2: item.paragraph2,
        location: item.location,
        image: item.image,
        story: item.story,
        text_color: item.text_color,
      }));

      aboutContentsCache = mapped;
      return aboutContentsCache;
    });
  },

  async updateAboutContent(
    id: string,
    updates: Partial<AboutContent>,
  ): Promise<AboutContent> {
    const { data, error } = await supabase
      .from('about_contents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    aboutContentsCache = null;
    return data;
  },

  async getContactInfo(): Promise<ContactInfo> {
    if (contactInfoCache) return contactInfoCache;
    return dedupe('contact_info', async () => {
      if (contactInfoCache) return contactInfoCache;

      const { data, error } = await supabasePublic
        .from('contact_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      const fallback: ContactInfo = {
        id: 'fallback',
        email: '',
        phone: '',
        address: '',
        workingHours: '',
        instagram: '',
        youtube: '',
        logo_url: '',
      };

      if (error) {
        console.error('[ContentAPI] Contact Info error:', error);
        return fallback;
      }
      if (!data) return fallback;

      contactInfoCache = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        address: data.address,
        workingHours: data.working_hours,
        instagram: data.instagram,
        youtube: data.youtube,
        logo_url: data.logo_url,
      };
      return contactInfoCache;
    });
  },

  async updateContactInfo(updates: Partial<ContactInfo>): Promise<ContactInfo> {
    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .single();

    if (!existing?.id) {
      throw new ApiError('İletişim bilgisi bulunamadı', 'NOT_FOUND', 404);
    }

    const dbUpdates = {
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      working_hours: updates.workingHours,
      instagram: updates.instagram,
      youtube: updates.youtube,
      logo_url: updates.logo_url,
    };

    const { data, error } = await supabase
      .from('contact_info')
      .update(dbUpdates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    contactInfoCache = null;
    return {
      id: data.id,
      email: data.email,
      phone: data.phone,
      address: data.address,
      workingHours: data.working_hours,
      instagram: data.instagram,
      youtube: data.youtube,
      logo_url: data.logo_url,
    };
  },

  async getProfileImages(): Promise<ProfileImage[]> {
    if (profileImagesCache) return profileImagesCache;
    const { data, error } = await supabasePublic.from('profile_images').select('*');
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
    profileImagesCache = null;

    // SENKRON: "Ana Sayfa Resmi" (location='hero-main') profil-resimleri
    // sekmesinden değiştirilince ana sayfa hero'su da güncellenmeli. Ana sayfa
    // hero_contents tablosundan okur; burası senkron yazmayınca panel "kayıtlı"
    // gösterip site eski görselde kalıyordu (iki-tablo tuzağı).
    if (data?.location === 'hero-main') {
      const { error: heroErr } = await supabase
        .from('hero_contents')
        .update({ image: url })
        .neq('image', url); // idempotent: zaten aynıysa dokunma
      if (heroErr) {
        console.error('hero_contents senkron hatası:', heroErr);
        throw new Error('Görsel kaydedildi ama ana sayfa hero eşitlenemedi. Tekrar deneyin.');
      }
      heroContentsCache = null;
    }

    return data;
  },

  // --- Legal content (KVKK / Privacy / Cookies) ---
  // All three share the `legal_contents` table; only the `type` column differs.

  async getKvkkContent(): Promise<{ id: string; content: string } | null> {
    const { data, error } = await supabase
      .from('legal_contents')
      .select('*')
      .eq('type', 'kvkk')
      .maybeSingle();
    if (error) console.error('KVKK içeriği alınırken hata:', error);
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

  async getPrivacyContent(): Promise<{ id: string; content: string } | null> {
    const { data, error } = await supabase
      .from('legal_contents')
      .select('*')
      .eq('type', 'privacy')
      .maybeSingle();
    if (error) console.error('Gizlilik içeriği alınırken hata:', error);
    return data;
  },

  async updatePrivacyContent(content: string): Promise<void> {
    const existing = await this.getPrivacyContent();
    if (existing) {
      const { error } = await supabase
        .from('legal_contents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error)
        throw new ApiError('Gizlilik içeriği güncellenemedi', 'UPDATE_FAILED', 500);
    } else {
      const { error } = await supabase
        .from('legal_contents')
        .insert({ type: 'privacy', content });
      if (error)
        throw new ApiError('Gizlilik içeriği oluşturulamadı', 'CREATE_FAILED', 500);
    }
  },

  async getCookiesContent(): Promise<{ id: string; content: string } | null> {
    const { data, error } = await supabase
      .from('legal_contents')
      .select('*')
      .eq('type', 'cookies')
      .maybeSingle();
    if (error) console.error('Çerez politikası içeriği alınırken hata:', error);
    return data;
  },

  async updateCookiesContent(content: string): Promise<void> {
    const existing = await this.getCookiesContent();
    if (existing) {
      const { error } = await supabase
        .from('legal_contents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error)
        throw new ApiError(
          'Çerez politikası içeriği güncellenemedi',
          'UPDATE_FAILED',
          500,
        );
    } else {
      const { error } = await supabase
        .from('legal_contents')
        .insert({ type: 'cookies', content });
      if (error)
        throw new ApiError(
          'Çerez politikası içeriği oluşturulamadı',
          'CREATE_FAILED',
          500,
        );
    }
  },
};
