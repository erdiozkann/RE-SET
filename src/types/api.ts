export type CreateAppointmentInput = {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  /** Supabase column: service_type */
  serviceType: string;
  serviceTitle: string;
  notes?: string;
  /** Appointment status in Supabase (PENDING, CONFIRMED, CANCELLED, etc.) */
  status?: string;
};

export type CreateProgressRecordInput = {
  clientId: string;
  sessionDate: string;
  metrics?: Record<string, number>; // Dinamik metrikler (optional - geriye dönük uyumluluk)
  summary: string;
  // Geriye dönük uyumluluk
  emotionalClarity?: number;
  mentalClarity?: number;
  centeredness?: number;
};

export type CreateProgressMetricInput = {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
  isActive?: boolean;
};

export type CreateClientResourceInput = {
  clientId: string;
  type: string;
  title: string;
  description: string;
  url: string;
  date: string;
};

export type CreateReviewInput = {
  name: string;
  rating: number;
  text: string;
  date?: string;
  approved?: boolean;
};

export type CreateBlogPostInput = {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category?: string;
  readTime?: string;
  featured?: boolean;
};

export type CreatePodcastEpisodeInput = {
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  date: string;
  episode?: string;
  category?: string;
  image?: string;
};

export type CreateContactMessageInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type UpdateUserInput = Partial<{
  name: string;
  phone: string;
  approved: boolean;
  role: 'ADMIN' | 'CLIENT';
}>;

export type UpdateServiceInput = Partial<{
  title: string;
  description: string;
  duration: string;
  price: string;
}>;

export type UpdateCertificateInput = Partial<{
  title: string;
  organization: string;
  year: string;
}>;

export type UpdateMethodInput = Partial<{
  title: string;
  description: string;
  icon: string;
  details: string;
}>;

export type UpdateContentInput = {
  title?: string;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  url?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  instagram?: string;
  youtube?: string;
  image?: string;
  story?: string;
  text_color?: string;
};
