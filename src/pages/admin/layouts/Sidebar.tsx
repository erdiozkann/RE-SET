import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

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

interface SidebarProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

interface MenuItem {
    id: string; // Unique ID for submenu toggle
    label: string;
    icon: string;
    items?: { id: TabType; label: string; icon: string }[];
    single?: { id: TabType; label: string; icon: string }; // For items without submenus
}

export default function Sidebar({ activeTab, setActiveTab, isOpen = true, onClose }: SidebarProps) {
    const { user, signOut } = useAuth();
    // Expanded menus state - default expand CRM and Content
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['crm', 'content']);

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev =>
            prev.includes(menuId)
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const handleTabClick = (tabId: TabType) => {
        setActiveTab(tabId);
        if (window.innerWidth < 768 && onClose) {
            onClose();
        }
    };

    const menuStructure: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'ri-dashboard-line',
            single: { id: 'dashboard', label: 'Genel Bakış', icon: 'ri-dashboard-line' }
        },
        {
            id: 'crm',
            label: 'CRM & Yönetim',
            icon: 'ri-group-line',
            items: [
                { id: 'appointments', label: 'Randevular', icon: 'ri-calendar-line' },
                { id: 'clients', label: 'Danışanlar', icon: 'ri-user-heart-line' },
                { id: 'pending', label: 'Onay Bekleyenler', icon: 'ri-user-add-line' },
                { id: 'progress', label: 'Gelişim Takibi', icon: 'ri-line-chart-line' },
            ]
        },
        {
            id: 'content',
            label: 'İçerik Stüdyosu',
            icon: 'ri-movie-line',
            items: [
                { id: 'blog', label: 'Blog', icon: 'ri-article-line' },
                { id: 'podcast', label: 'Podcast', icon: 'ri-mic-line' },
                { id: 'youtube', label: 'YouTube', icon: 'ri-youtube-line' },
                { id: 'content', label: 'İçerik Yönetimi', icon: 'ri-file-text-line' },
                { id: 'ads', label: 'Reklam Takibi', icon: 'ri-advertisement-line' },
            ]
        },
        {
            id: 'services',
            label: 'Hizmetler',
            icon: 'ri-service-line',
            items: [
                { id: 'services', label: 'Hizmetler', icon: 'ri-service-line' },
                { id: 'methods', label: 'Yöntemler', icon: 'ri-lightbulb-line' },
            ]
        },
        {
            id: 'finance',
            label: 'Finans',
            icon: 'ri-wallet-3-line',
            items: [
                { id: 'accounting', label: 'Muhasebe & Cari', icon: 'ri-money-dollar-circle-line' },
            ]
        },
        {
            id: 'communication',
            label: 'İletişim',
            icon: 'ri-message-2-line',
            items: [
                { id: 'messages', label: 'Mesajlar', icon: 'ri-mail-line' },
                { id: 'reviews', label: 'Yorumlar', icon: 'ri-star-line' },
            ]
        },
        {
            id: 'system',
            label: 'Sistem',
            icon: 'ri-settings-3-line',
            items: [
                { id: 'accounts', label: 'Yetkili Hesaplar', icon: 'ri-shield-user-line' },
                { id: 'config', label: 'Genel Ayarlar', icon: 'ri-settings-line' },
                { id: 'account-settings', label: 'Profilim', icon: 'ri-user-settings-line' },
            ]
        }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                {/* Brand */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B38F1D] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            RS
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#B38F1D]">
                            RE-SET
                        </span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* User Profile Mini */}
                <div className="px-4 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold border border-[#D4AF37]/20">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'Admin'}</div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase() || 'admin'}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                    {menuStructure.map((menu) => (
                        <div key={menu.id}>
                            {menu.single ? (
                                <button
                                    onClick={() => handleTabClick(menu.single!.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === menu.single.id
                                            ? 'bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <i className={`${menu.single.icon} text-lg w-6 text-center transition-colors`}></i>
                                    <span className="text-sm">{menu.single.label}</span>
                                </button>
                            ) : (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(menu.id)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider text-xs font-semibold group mb-1"
                                    >
                                        <span className="group-hover:text-[#D4AF37] transition-colors">{menu.label}</span>
                                        <i className={`ri-arrow-down-s-line text-lg transition-transform duration-300 ${expandedMenus.includes(menu.id) ? 'rotate-180 text-[#D4AF37]' : ''}`}></i>
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${expandedMenus.includes(menu.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                        {menu.items?.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleTabClick(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${activeTab === item.id
                                                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium border-r-2 border-[#D4AF37]'
                                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <i className={`${item.icon} text-lg w-6 text-center opacity-70 group-hover:opacity-100 transition-opacity`}></i>
                                                <span className="text-sm">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm font-medium text-sm group"
                    >
                        <i className="ri-logout-box-line group-hover:scale-110 transition-transform"></i>
                        Çıkış Yap
                    </button>
                </div>
            </aside>
        </>
    );
}
