import { useState } from 'react';
import HeroEditor from './content/HeroEditor';
import AboutEditor from './content/AboutEditor';
import ContactInfoEditor from './content/ContactInfoEditor';
import CertificatesManager from './content/CertificatesManager';
import ProfileImagesManager from './content/ProfileImagesManager';
import PolicyEditor from './content/PolicyEditor';

type ContentCategory = 'general' | 'identity' | 'legal';

export default function ContentTab() {
  const [activeCategory, setActiveCategory] = useState<ContentCategory>('general');

  const tabs: { id: ContentCategory; label: string; icon: string }[] = [
    { id: 'general', label: 'Genel İçerik', icon: 'ri-layout-masonry-line' },
    { id: 'identity', label: 'Kurumsal Kimlik', icon: 'ri-shield-user-line' },
    { id: 'legal', label: 'Hukuki Metinler', icon: 'ri-file-paper-2-line' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeCategory === tab.id
                ? 'bg-[#D4AF37] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#D4AF37]'
              }`}
          >
            <i className={`${tab.icon} text-lg`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeCategory === 'general' && (
          <div className="grid gap-8">
            <HeroEditor />
            <AboutEditor />
            <ContactInfoEditor />
          </div>
        )}

        {activeCategory === 'identity' && (
          <div className="grid gap-8">
            <CertificatesManager />
            <ProfileImagesManager />
          </div>
        )}

        {activeCategory === 'legal' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <i className="ri-information-line text-blue-500 mt-0.5"></i>
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">Bilgi:</span> Bu metinler sitenizin alt kısmında (footer) ve ilgili yasal sayfalarda otomatik olarak gösterilecektir. Hukuki geçerlilik için bir uzmana danışmanız önerilir.
                </div>
              </div>
            </div>

            <PolicyEditor
              type="kvkk"
              title="KVKK Aydınlatma Metni"
              description="Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni."
              placeholder="<h2>1. Veri Sorumlusu</h2>&#10;<p>6698 sayılı KVKK uyarınca...</p>"
            />

            <PolicyEditor
              type="privacy"
              title="Gizlilik Politikası"
              description="Kullanıcı verilerinin nasıl işlendiğini açıklayan metin."
              placeholder="<h2>1. Gizlilik ve Güvenlik</h2>&#10;<p>Gizliliğiniz bizim için önemlidir...</p>"
            />

            <PolicyEditor
              type="cookies"
              title="Çerez Politikası"
              description="Sitede kullanılan çerezler ve amaçları hakkında bilgilendirme."
              placeholder="<h2>1. Çerez Nedir?</h2>&#10;<p>Çerezler, web siteleri tarafından...</p>"
            />
          </div>
        )}
      </div>
    </div>
  );
}
