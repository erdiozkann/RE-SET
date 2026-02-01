import { supabase } from './supabase';
import { handleSupabaseError, ApiError } from './errors';
import type {
  User,
  ServiceType,
  Client,
  WorkingConfig,
  ContactMessage,
  Certificate,
  ProfileImage,
  HeroContent,
  AboutContent,
  ContactInfo,
  Method,
  BlogPost,
  PodcastEpisode,
  ProgressRecord,
  ProgressMetric
} from '../types';
import type {
  CreateAppointmentInput,
  CreateProgressRecordInput,
  CreateProgressMetricInput,
  CreateClientResourceInput,
  CreateReviewInput,
  CreateBlogPostInput,
  CreatePodcastEpisodeInput,
  CreateContactMessageInput,
  UpdateContentInput
} from '../types/api';

// Storage API - Dosya yükleme işlemleri
export const storageApi = {
  async uploadFile(
    bucket: string,
    file: File,
    folder: string = ''
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new ApiError(`Dosya yüklenemedi: ${error.message}`, 'UPLOAD_FAILED', 500);
    }

    // Public URL oluştur
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    return true;
  }
};

// Helper function for query execution
const executeQuery = async <T>(
  queryPromise: Promise<{ data: T | null; error: any }> | any,
  errorMsg?: string
): Promise<T> => {
  const resolved = queryPromise.then ? await queryPromise : queryPromise;
  const { data, error } = resolved;
  if (error) {
    console.error('Supabase error:', error);
    handleSupabaseError(error);
  }
  if (!data) {
    throw new ApiError(errorMsg || 'Veri bulunamadı', 'NO_DATA', 404);
  }
  return data;
};

// Users API
export const usersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(({ password, ...user }) => user);
  },

  async getPending() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'CLIENT')
      .eq('approved', false)
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return data.map(({ password, ...user }) => user);
  },

  async approve(email: string) {
    // Önce kullanıcıyı al
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) throw fetchError;

    // Kullanıcıyı onayla
    const { data, error } = await supabase
      .from('users')
      .update({ approved: true })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;

    // Clients tablosunda bu email var mı kontrol et
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single();

    // Eğer clients tablosunda yoksa ekle
    if (!existingClient) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          is_active: true
        }]);

      if (clientError) {
        console.error('Client oluşturma hatası:', clientError);
        // Hata olsa bile devam et, kullanıcı onaylandı
      }
    }

    const { password, ...user } = data;
    return user;
  },

  async reject(email: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', email);

    if (error) throw error;
    return true;
  },

  async update(email: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    const { password, ...user } = data;
    return user;
  },

  async delete(email: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', email);

    if (error) throw error;
    return true;
  }
};

// Services API
export const servicesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async create(service: Omit<ServiceType, 'id'>) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id: string, updates: Partial<ServiceType>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Appointments API
export const appointmentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case DB fields to camelCase for frontend
    return (data || []).map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      date: row.date,
      time: row.time,
      serviceType: row.service_type,
      serviceTitle: row.service_title,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at
    }));
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case DB fields to camelCase for frontend
    return (data || []).map(row => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      date: row.date,
      time: row.time,
      serviceType: row.service_type,
      serviceTitle: row.service_title,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at
    }));
  },

  async create(appointment: CreateAppointmentInput) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        client_id: appointment.clientId || null,
        client_name: appointment.clientName,
        client_email: appointment.clientEmail,
        client_phone: appointment.clientPhone || null,
        date: appointment.date,
        time: appointment.time,
        service_type: appointment.serviceType,
        service_title: appointment.serviceTitle,
        notes: appointment.notes || null,
        status: appointment.status || 'PENDING'
      }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id: string, updates: Partial<CreateAppointmentInput & { status: string }>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Clients API
export const clientsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Bakiye hesapla ve field'ları map'le
    return (data || []).map(client => ({
      ...client,
      name: client.name || client.full_name,
      fullName: client.full_name || client.name,
      totalDebt: client.total_debt || 0,
      totalPaid: client.total_paid || 0,
      balance: (client.total_debt || 0) - (client.total_paid || 0),
      isActive: client.is_active !== false,
      createdAt: client.created_at
    }));
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  },

  async create(client: { name: string; email: string; phone?: string; notes?: string }) {
    // Supabase için snake_case dönüşümü
    const clientData = {
      name: client.name,
      email: client.email,
      phone: client.phone || null,
      notes: client.notes || null
    };

    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Progress API
const clampProgressValue = (value: number | null | undefined): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value as number)));
};

const mapProgressRecord = (row: any): ProgressRecord => {
  // JSONB metrics varsa onu kullan, yoksa eski kolonlardan oluştur
  let metrics: Record<string, number> = {};

  if (row.metrics && typeof row.metrics === 'object') {
    // JSONB'den metrikleri al
    metrics = row.metrics;
  } else {
    // Geriye dönük uyumluluk: eski kolonlardan metrics oluştur
    metrics = {
      emotional_clarity: clampProgressValue(row.emotional_clarity),
      mental_clarity: clampProgressValue(row.mental_clarity),
      centeredness: clampProgressValue(row.centeredness)
    };
  }

  return {
    id: row.id,
    clientId: row.client_id,
    sessionDate: row.session_date,
    metrics,
    summary: row.summary || row.notes || '',
    // Geriye dönük uyumluluk
    emotionalClarity: clampProgressValue(row.emotional_clarity || metrics.emotional_clarity),
    mentalClarity: clampProgressValue(row.mental_clarity || metrics.mental_clarity),
    centeredness: clampProgressValue(row.centeredness || metrics.centeredness)
  };
};

// Progress Metrics API
export const progressMetricsApi = {
  async getAll(): Promise<ProgressMetric[]> {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      description: row.description,
      icon: row.icon,
      color: row.color,
      orderIndex: row.order_index,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async create(metric: CreateProgressMetricInput): Promise<ProgressMetric> {
    const { data, error } = await supabase
      .from('progress_metrics')
      .insert([{
        key: metric.key,
        label: metric.label,
        description: metric.description,
        icon: metric.icon,
        color: metric.color || 'blue',
        order_index: metric.orderIndex,
        is_active: metric.isActive ?? true
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      key: data.key,
      label: data.label,
      description: data.description,
      icon: data.icon,
      color: data.color,
      orderIndex: data.order_index,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async update(id: string, updates: Partial<CreateProgressMetricInput>): Promise<ProgressMetric> {
    const payload: any = {};

    if (updates.label !== undefined) payload.label = updates.label;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('progress_metrics')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      key: data.key,
      label: data.label,
      description: data.description,
      icon: data.icon,
      color: data.color,
      orderIndex: data.order_index,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('progress_metrics')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export const progressApi = {
  async getByClient(clientId: string): Promise<ProgressRecord[]> {
    const { data, error } = await supabase
      .from('progress_records')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProgressRecord);
  },

  async create(record: CreateProgressRecordInput): Promise<ProgressRecord> {
    const payload: any = {
      client_id: record.clientId,
      session_date: record.sessionDate,
      metrics: record.metrics || {},
      summary: record.summary || null
    };

    // Geriye dönük uyumluluk: eski kolonları da doldur
    if (record.metrics) {
      payload.emotional_clarity = record.metrics.emotional_clarity || record.metrics.clarity || 0;
      payload.mental_clarity = record.metrics.mental_clarity || record.metrics.awareness || 0;
      payload.centeredness = record.metrics.centeredness || record.metrics.balance || 0;
    }

    const { data, error } = await supabase
      .from('progress_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return mapProgressRecord(data);
  },

  async update(id: string, record: Partial<CreateProgressRecordInput>): Promise<ProgressRecord> {
    const payload: any = {};

    if (record.sessionDate !== undefined) payload.session_date = record.sessionDate;
    if (record.metrics !== undefined) payload.metrics = record.metrics;
    if (record.summary !== undefined) payload.summary = record.summary || null;

    // Geriye dönük uyumluluk
    if (record.metrics) {
      payload.emotional_clarity = record.metrics.emotional_clarity || record.metrics.clarity || 0;
      payload.mental_clarity = record.metrics.mental_clarity || record.metrics.awareness || 0;
      payload.centeredness = record.metrics.centeredness || record.metrics.balance || 0;
    }

    const { data, error } = await supabase
      .from('progress_records')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapProgressRecord(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('progress_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Resources API
export const resourcesApi = {
  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('client_resources')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(resource: CreateClientResourceInput) {
    const { data, error } = await supabase
      .from('client_resources')
      .insert([{
        client_id: resource.clientId,
        type: resource.type,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        date: resource.date
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('client_resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Reviews API
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
    const { data: review } = await supabase
      .from('reviews')
      .select('approved')
      .eq('id', id)
      .single();

    if (!review) throw new Error('Review not found');

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

// Messages API
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

    if (error) {
      handleSupabaseError(error);
    }
    return true;
  }
};

// Config API
export const configApi = {
  async get() {
    const { data, error } = await supabase
      .from('working_config')
      .select('*')
      .single();

    if (error) throw error;
    return {
      startHour: data.start_hour,
      endHour: data.end_hour,
      slotDuration: data.slot_duration,
      offDays: data.off_days
    };
  },

  async update(config: WorkingConfig) {
    const { data, error } = await supabase
      .from('working_config')
      .update({
        start_hour: config.startHour,
        end_hour: config.endHour,
        slot_duration: config.slotDuration,
        off_days: config.offDays
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Certificates API
export const certificatesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('certificates')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async create(cert: Omit<Certificate, 'id'>) {
    const { data, error } = await supabase
      .from('certificates')
      .insert([cert])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id: string, updates: Partial<Certificate>) {
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Content API
export const contentApi = {
  async getHeroContents(): Promise<HeroContent[]> {
    return executeQuery<HeroContent[]>(
      supabase.from('hero_contents').select('*'),
      'Hero içerikleri alınırken hata oluştu'
    );
  },

  async updateHeroContent(id: string, updates: UpdateContentInput): Promise<HeroContent> {
    return executeQuery<HeroContent>(
      supabase
        .from('hero_contents')
        .update(updates)
        .eq('id', id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Hero içeriği güncellenirken hata oluştu'
    );
  },

  async getAboutContents(): Promise<AboutContent[]> {
    return executeQuery<AboutContent[]>(
      supabase.from('about_contents').select('*'),
      'Hakkımızda içerikleri alınırken hata oluştu'
    );
  },

  async updateAboutContent(id: string, updates: UpdateContentInput): Promise<AboutContent> {
    return executeQuery<AboutContent>(
      supabase
        .from('about_contents')
        .update(updates)
        .eq('id', id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Hakkımızda içeriği güncellenirken hata oluştu'
    );
  },

  async getContactInfo(): Promise<ContactInfo> {
    return executeQuery<ContactInfo>(
      supabase.from('contact_info').select('*').then((res) => ({ data: res.data?.[0], error: res.error })),
      'İletişim bilgileri alınırken hata oluştu'
    );
  },

  async updateContactInfo(updates: UpdateContentInput): Promise<ContactInfo> {
    // Önce mevcut kaydı al
    const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();

    if (!existing?.id) {
      throw new ApiError('İletişim bilgisi bulunamadı', 'NOT_FOUND', 404);
    }

    return executeQuery<ContactInfo>(
      supabase
        .from('contact_info')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'İletişim bilgileri güncellenirken hata oluştu'
    );
  },

  async getProfileImages(): Promise<ProfileImage[]> {
    return executeQuery<ProfileImage[]>(
      supabase.from('profile_images').select('*'),
      'Profil görselleri alınırken hata oluştu'
    );
  },

  async updateProfileImage(id: string, url: string): Promise<ProfileImage> {
    return executeQuery<ProfileImage>(
      supabase
        .from('profile_images')
        .update({ url })
        .eq('id', id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Profil görseli güncellenirken hata oluştu'
    );
  },

  // KVKK içerik yönetimi
  async getKvkkContent(): Promise<{ id: string; content: string } | null> {
    const { data, error } = await supabase
      .from('legal_contents')
      .select('*')
      .eq('type', 'kvkk')
      .single();

    if (error && error.code !== 'PGRST116') {
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
      .single();

    if (error && error.code !== 'PGRST116') {
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
      .single();

    if (error && error.code !== 'PGRST116') {
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

// Methods API
export const methodsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('methods')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async create(method: Omit<Method, 'id'>) {
    const { data, error } = await supabase
      .from('methods')
      .insert([method])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id: string, updates: Partial<Method>) {
    const { data, error } = await supabase
      .from('methods')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('methods')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Blog API
export const blogApi = {
  async getAll(): Promise<BlogPost[]> {
    try {
      return await executeQuery<BlogPost[]>(
        supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false }),
        'Blog yazıları alınırken hata oluştu'
      );
    } catch (error) {
      console.error('Blog getAll error:', error);
      return [];
    }
  },

  async create(post: CreateBlogPostInput): Promise<BlogPost> {
    return executeQuery<BlogPost>(
      supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Blog yazısı oluşturulurken hata oluştu'
    );
  },

  async update(id: string, updates: Partial<CreateBlogPostInput>): Promise<BlogPost> {
    return executeQuery<BlogPost>(
      supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Blog yazısı güncellenirken hata oluştu'
    );
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error);
    }
    return true;
  }
};

// Podcast API
export const podcastApi = {
  async getAll(): Promise<PodcastEpisode[]> {
    try {
      return await executeQuery<PodcastEpisode[]>(
        supabase
          .from('podcast_episodes')
          .select('*')
          .order('date', { ascending: false }),
        'Podcast bölümleri alınırken hata oluştu'
      );
    } catch (error) {
      console.error('Podcast getAll error:', error);
      return [];
    }
  },

  async create(episode: CreatePodcastEpisodeInput): Promise<PodcastEpisode> {
    return executeQuery<PodcastEpisode>(
      supabase
        .from('podcast_episodes')
        .insert([episode])
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Podcast bölümü oluşturulurken hata oluştu'
    );
  },

  async update(id: string, updates: Partial<CreatePodcastEpisodeInput>): Promise<PodcastEpisode> {
    return executeQuery<PodcastEpisode>(
      supabase
        .from('podcast_episodes')
        .update(updates)
        .eq('id', id)
        .select()
        .then((res) => ({ data: res.data?.[0], error: res.error })),
      'Podcast bölümü güncellenirken hata oluştu'
    );
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('podcast_episodes')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error);
    }
    return true;
  }
};

// Helper: PDF oluşturma
export const createPdfForClient = async (clientId: string, summaryText: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('name')
    .eq('id', clientId)
    .single();

  if (error) throw error;

  const clientName = data?.name || 'Danışan';
  const date = new Date().toISOString().split('T')[0];

  const pdfContent = `
RESET - ŞAFAK ÖZKAN DANIŞMANLIK
Gelişim Raporu

Danışan: ${clientName}
Tarih: ${date}

${summaryText}

Bu rapor Reset - Şafak Özkan Danışmanlık tarafından oluşturulmuştur.
  `.trim();

  // Fix Base64 encoding
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(pdfContent);
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64Content = btoa(binaryString);
  const dataUrl = `data:text/plain;base64,${base64Content}`;

  return await resourcesApi.create({
    clientId,
    type: 'PDF',
    title: `Gelişim Raporu - ${date}`,
    description: 'Seans özeti ve gelişim değerlendirmesi',
    url: dataUrl,
    date
  });
};

// Helper: AI Ödev Önerisi
const homeworkSuggestions = [
  'Bu hafta her gün 10 dakika sessizlik meditasyonu yapın. Sabah uyanır uyanmak veya akşam yatmadan önce kendinize bu zamanı ayırın.',
  'Günlük tutmaya başlayın. Her akşam günün en anlamlı 3 anını ve bunların size hissettirdiklerini yazın.',
  'Hafta içi her gün 15 dakika doğada yürüyüş yapın. Yürürken telefonunuzu kapalı tutun ve çevrenizi gözlemleyin.',
  'Nefes farkındalığı egzersizi: Günde 3 kez, 5 dakika boyunca sadece nefesinize odaklanın. Derin ve yavaş nefes alıp verin.',
  'Minnettarlık listesi oluşturun. Her gün 5 şey yazın, bunlar için minnettar olduğunuz şeyler olsun.',
  'Dijital detoks: Her gün en az 2 saat tüm dijital cihazlardan uzak durun. Bu süreyi kendinize ayırın.',
  'Beden taraması meditasyonu yapın. Yatmadan önce başınızdan ayaklarınıza kadar tüm bedeninizi tarayın ve gevşetin.',
  'Haftalık hedef belirleyin: Kendiniz için küçük ama anlamlı bir hedef koyun ve her gün bu hedefe doğru bir adım atın.'
];

export const getHomeworkSuggestion = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * homeworkSuggestions.length);
  await new Promise(resolve => setTimeout(resolve, 500));
  return homeworkSuggestions[randomIndex];
};

// YouTube API
export const youtubeApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(v => ({
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
  },

  async getPublished() {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(v => ({
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
  },

  async create(video: any) {
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
    return data;
  },

  async update(id: string, updates: any) {
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
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('youtube_videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Ads Tracking APIs
export const adAccountsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('ad_accounts sorgusu:', error);
      return [];
    }
    return data || [];
  },

  async create(account: any) {
    const { data, error } = await supabase
      .from('ad_accounts')
      .insert([account])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('ad_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('ad_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export const adCampaignsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('ad_campaigns sorgusu:', error);
      return [];
    }
    return data || [];
  },

  async getByAccount(accountId: string) {
    const { data, error } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('account_id', accountId);

    if (error) return [];
    return data || [];
  }
};

export const adMetricsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('ad_metrics')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('ad_metrics sorgusu:', error);
      return [];
    }
    return data || [];
  }
};

export const adConversionsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('ad_conversions')
      .select('*')
      .order('conversion_date', { ascending: false });

    if (error) {
      console.warn('ad_conversions sorgusu:', error);
      return [];
    }
    return data || [];
  }
};

export const adROISummaryApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('ad_roi_summary')
      .select('*');

    if (error) {
      console.warn('ad_roi_summary sorgusu:', error);
      return [];
    }
    return data || [];
  }
};
