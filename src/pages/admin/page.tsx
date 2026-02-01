
import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO';

// Tabs
import DashboardTab from './components/DashboardTab';
import AppointmentsTab from './components/AppointmentsTab';
import ClientsTab from './components/ClientsTab';
import ServicesTab from './components/ServicesTab';
import ConfigTab from './components/ConfigTab';
import PendingUsersTab from './components/PendingUsersTab';
import AccountsTab from './components/AccountsTab';
import ProgressTab from './components/ProgressTab';
import ReviewsTab from './components/ReviewsTab';
import MessagesTab from './components/MessagesTab';
import ContentTab from './components/ContentTab';
import MethodsTab from './components/MethodsTab';
import AccountSettingsTab from './components/AccountSettingsTab';
import BlogTab from './components/BlogTab';
import PodcastTab from './components/PodcastTab';
import YouTubeTab from './components/YouTubeTab';
import AccountingTab from './components/AccountingTab';

// Lazy load AdsTab
const AdsTab = lazy(() => import('./components/AdsTab'));

type TabType =
  | 'dashboard'
  | 'appointments'
  | 'clients'
  | 'services'
  | 'config'
  | 'pending'
  | 'accounts'
  | 'progress'
  | 'reviews'
  | 'messages'
  | 'content'
  | 'methods'
  | 'blog'
  | 'podcast'
  | 'youtube'
  | 'accounting'
  | 'ads'
  | 'account-settings';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  // ProtectedRoute zaten admin kontrolünü yapıyor, bu yüzden burada tekrar kontrol etmeye gerek yok
  // Ancak sayfa ilk yüklendiğinde loading durumunu yönetmek iyi bir pratik
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'pending', label: 'Onay Bekleyenler', icon: 'ri-user-add-line' },
    { id: 'appointments', label: 'Randevular', icon: 'ri-calendar-line' },
    { id: 'clients', label: 'Danışanlar', icon: 'ri-user-line' },
    { id: 'accounting', label: 'Muhasebe & Cari', icon: 'ri-wallet-3-line' },
    { id: 'progress', label: 'Gelişim Takibi', icon: 'ri-line-chart-line' },
    { id: 'services', label: 'Hizmetler', icon: 'ri-service-line' },
    { id: 'methods', label: 'Yöntemler', icon: 'ri-lightbulb-line' },
    { id: 'reviews', label: 'Yorumlar', icon: 'ri-star-line' },
    { id: 'messages', label: 'Mesajlar', icon: 'ri-mail-line' },
    { id: 'content', label: 'İçerik Yönetimi', icon: 'ri-file-text-line' },
    { id: 'blog', label: 'Blog', icon: 'ri-article-line' },
    { id: 'podcast', label: 'Podcast', icon: 'ri-mic-line' },
    { id: 'youtube', label: 'YouTube', icon: 'ri-youtube-line' },
    { id: 'ads', label: 'Reklam Takibi', icon: 'ri-advertisement-line' },
    { id: 'accounts', label: 'Hesaplar', icon: 'ri-team-line' },
    { id: 'config', label: 'Ayarlar', icon: 'ri-settings-line' },
    { id: 'account-settings', label: 'Hesap Ayarları', icon: 'ri-user-settings-line' }
  ];

  return (
    <>
      <SEO
        title="Admin Panel - Reset Danışmanlık"
        description="Reset Danışmanlık yönetim paneli"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Reset Admin
                </h1>
                <p className="text-sm text-gray-600 mt-1">Hoş geldiniz, {user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line"></i>
                Çıkış Yap
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <i className={`${tab.icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'pending' && <PendingUsersTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'accounting' && <AccountingTab />}
            {activeTab === 'progress' && <ProgressTab />}
            {activeTab === 'services' && <ServicesTab />}
            {activeTab === 'methods' && <MethodsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'content' && <ContentTab />}
            {activeTab === 'blog' && <BlogTab />}
            {activeTab === 'podcast' && <PodcastTab />}
            {activeTab === 'youtube' && <YouTubeTab />}
            {activeTab === 'ads' && (
              <Suspense fallback={<div className="p-4 text-gray-600">Yükleniyor...</div>}>
                <AdsTab />
              </Suspense>
            )}
            {activeTab === 'accounts' && <AccountsTab />}
            {activeTab === 'config' && <ConfigTab />}
            {activeTab === 'account-settings' && <AccountSettingsTab />}
          </main>
        </div>
      </div>
    </>
  );
}
