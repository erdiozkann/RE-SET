
import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import Sidebar from './layouts/Sidebar';

// Corrected Imports based on actual file locations
import DashboardTab from './modules/system/Dashboard';
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

// Lazy load
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
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Read tab from URL params on mount and when params change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && isValidTab(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const isValidTab = (tab: string): boolean => {
    const validTabs: TabType[] = [
      'dashboard', 'appointments', 'clients', 'services', 'config',
      'pending', 'accounts', 'progress', 'reviews', 'messages',
      'content', 'methods', 'blog', 'podcast', 'youtube',
      'accounting', 'ads', 'account-settings'
    ];
    return validTabs.includes(tab as TabType);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;

      // CRM
      case 'appointments': return <AppointmentsTab />;
      case 'clients': return <ClientsTab />;
      case 'pending': return <PendingUsersTab />;
      case 'progress': return <ProgressTab />;

      // Services
      case 'services': return <ServicesTab />;
      case 'methods': return <MethodsTab />;

      // Content
      case 'content': return <ContentTab />;
      case 'blog': return <BlogTab />;
      case 'podcast': return <PodcastTab />;
      case 'youtube': return <YouTubeTab />;
      case 'ads':
        return (
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Reklam modülü yükleniyor...</div>}>
            <AdsTab />
          </Suspense>
        );

      // Communication
      case 'messages': return <MessagesTab />;
      case 'reviews': return <ReviewsTab />;

      // Finance
      case 'accounting': return <AccountingTab />;

      // System
      case 'config': return <ConfigTab />;
      case 'accounts': return <AccountsTab />;
      case 'account-settings': return <AccountSettingsTab />;

      default: return <div>Tab Content Placeholder: {activeTab}</div>;
    }
  };

  const getPageTitle = (tab: TabType) => {
    const titles: Record<TabType, string> = {
      dashboard: 'Genel Bakış',
      appointments: 'Randevu Yönetimi',
      clients: 'Danışan Listesi',
      services: 'Hizmetler',
      config: 'Sistem Ayarları',
      pending: 'Onay Bekleyen Kullanıcılar',
      accounts: 'Yetkili Hesaplar',
      progress: 'Gelişim Takibi',
      reviews: 'Danışan Yorumları',
      messages: 'Gelen Mesajlar',
      content: 'İçerik Yönetimi',
      methods: 'Yöntemler',
      blog: 'Blog Yazıları',
      podcast: 'Podcast Bölümleri',
      youtube: 'YouTube Videoları',
      accounting: 'Muhasebe & Cari',
      ads: 'Reklam Takibi',
      'account-settings': 'Profil Ayarlarım'
    };
    return titles[tab] || 'Admin Paneli';
  };

  return (
    <>
      <SEO title={`Admin - ${getPageTitle(activeTab)}`} description="RE-SET Yönetim Paneli" />

      <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
        {/* New Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Layout Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">

          {/* Mobile Header Toggle */}
          <header className="bg-white border-b border-gray-100 p-4 flex md:hidden justify-between items-center z-10 sticky top-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B38F1D] flex items-center justify-center text-white font-bold text-sm">RS</div>
              <span className="font-bold text-gray-800">Admin</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <i className="ri-menu-2-line text-2xl"></i>
            </button>
          </header>

          {/* Desktop Header / Top Bar */}
          <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center hidden md:flex sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                {getPageTitle(activeTab)}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Yönetim Paneli</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Date Display */}
              <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <i className="ri-calendar-line mr-2 text-[#D4AF37]"></i>
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Notification Placeholders */}
              <button className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-lg transition-all relative">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F9FAFB] p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full">
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
