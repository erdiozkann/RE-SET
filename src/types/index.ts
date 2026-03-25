// ============================================
// 🎯 ANA TİP TANIMLARI
// ============================================

export interface ServiceType {
  id: string;
  title: string;
  description: string;
  duration: string;
  price?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  time: string;
  serviceType: string;
  serviceTitle: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

// ============================================
// 👤 DANIŞAN (CLIENT) TİPLERİ
// ============================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  // Muhasebe alanları
  fullName?: string;
  totalDebt?: number;
  totalPaid?: number;
  balance?: number;
  isActive?: boolean;
}

// ============================================
// 💰 MUHASEBE TİPLERİ
// ============================================

export interface Invoice {
  id: string;
  client_id: string;
  invoice_no: string;
  description: string;
  amount: number;
  paid_amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: 'unpaid' | 'partial' | 'paid' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface Payment {
  id: string;
  client_id: string;
  invoice_id?: string;
  receipt_no: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'other';
  description?: string;
  payment_date: string;
  created_at: string;
  client_name?: string;
  invoice_no?: string;
}

export interface ClientBalance {
  client_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  total_debt: number;
  total_paid: number;
  balance: number;
  is_active: boolean;
  balance_status: string;
  unpaid_invoice_count: number;
}

export interface Transaction {
  id: string;
  client_id: string;
  client_name: string;
  transaction_date: string;
  reference_no: string;
  description: string;
  debit: number;
  credit: number;
  transaction_type: 'invoice' | 'payment';
  status: string;
  created_at: string;
}

export interface UnpaidInvoice {
  id: string;
  invoice_no: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  description: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'unpaid' | 'partial';
  invoice_date: string;
  due_date?: string;
  due_status: 'overdue' | 'due_today' | 'upcoming';
  days_overdue: number;
}

export interface MonthlyRevenue {
  month: string;
  payment_count: number;
  total_revenue: number;
  cash_revenue: number;
  card_revenue: number;
  transfer_revenue: number;
}

// ============================================
// ⚙️ KONFİGÜRASYON TİPLERİ
// ============================================

export interface WorkingConfig {
  startHour: string;
  endHour: string;
  slotDuration: number;
  offDays: number[];
}

export interface AdminUser {
  email: string;
  role: 'ADMIN';
}

export interface User {
  id?: string; // Supabase Auth ID
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  approved?: boolean;
  phone?: string;
  registeredAt?: string;
}

// ============================================
// 📊 İLERLEME VE KAYNAK TİPLERİ
// ============================================

export interface ProgressMetric {
  id: string;
  key: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressRecord {
  id: string;
  clientId: string;
  sessionDate: string;
  metrics: Record<string, number>; // Dinamik metrikler { clarity: 75, awareness: 80, ... }
  summary: string;
  // Geriye dönük uyumluluk için
  emotionalClarity?: number;
  mentalClarity?: number;
  centeredness?: number;
}

export interface ClientResource {
  id: string;
  clientId: string;
  type: 'NOTE' | 'PDF' | 'AUDIO' | 'LINK';
  title: string;
  description: string;
  url?: string;
  date: string;
}

// ============================================
// 📝 İÇERİK TİPLERİ
// ============================================

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  organization: string;
  year: string;
}

export interface ProfileImage {
  id: string;
  name: string;
  url: string;
  location: 'about-hero' | 'home-about' | 'logo' | 'other';
  type?: 'logo' | 'profile' | 'hero' | 'other';
}

export interface HeroContent {
  id: string;
  title: string;
  description: string;
  location: string;
  titleSize?: string;
  descriptionSize?: string;
  image?: string;
  text_color?: string;
}

export interface AboutContent {
  id: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  story?: string;
  location: string;
  image?: string;
  text_color?: string;
}

export interface ContactInfo {
  id: string;
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  instagram?: string;
  youtube?: string;
  logo_url?: string;
}

export interface Method {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  featured: boolean;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  episode: string;
  duration: string;
  category: string;
  image: string;
  audioUrl: string;
  date: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail?: string;
  duration: string;
  publishedAt: string;
  isPublished: boolean;
  viewCount: number;
  category: string;
}

// ============================================
// 📱 SOSYAL MEDYA TİPLERİ
// ============================================

export interface InstagramAccount {
  id: string;
  username: string;
  bio?: string;
  profileImageUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaCampaign {
  id: string;
  title: string;
  description?: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin';
  content: string;
  mediaUrls?: string[];
  startDate: string;
  endDate?: string;
  status: 'draft' | 'published' | 'scheduled' | 'completed';
  engagementCount: number;
  reach: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaAnalytics {
  id: string;
  platform: string;
  metricName: string;
  metricValue: number;
  dateRecorded: string;
  createdAt: string;
}

// ============================================
// 📊 REKLAM TAKIP TİPLERİ (Google Ads & Meta)
// ============================================

export interface AdAccount {
  id: string;
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads';
  accountName: string;
  accountId?: string;
  apiKey?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads';
  campaignId?: string;
  campaignName: string;
  campaignType?: string;
  status?: 'active' | 'paused' | 'ended';
  budget?: number;
  spent: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdMetrics {
  id: string;
  campaignId: string;
  platform: string;
  dateRecorded: string;

  impressions: number;
  clicks: number;
  ctr?: number;

  conversions: number;
  conversionValue?: number;
  costPerConversion?: number;

  cost: number;
  cpc?: number;
  cpm?: number;

  views?: number;
  watchTimeMinutes?: number;
  engagements?: number;

  createdAt: string;
}

export interface AdConversion {
  id: string;
  campaignId: string;
  platform: string;
  conversionType?: string;
  conversionName?: string;

  conversionCount: number;
  conversionValue?: number;
  costPerAcquisition?: number;

  dateRecorded: string;
  createdAt: string;
}

export interface AdROISummary {
  id: string;
  platform: string;
  month: string;

  totalSpend: number;
  totalRevenue?: number;
  roiPercentage?: number;

  createdAt: string;
  updatedAt: string;
}
