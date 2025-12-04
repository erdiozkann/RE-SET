import { useState, useEffect, useRef } from 'react';
import { certificatesApi, contentApi, storageApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Certificate, ProfileImage, HeroContent } from '../../../types';

export default function ContentTab() {
  const toast = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [profileImages, setProfileImages] = useState<ProfileImage[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certForm, setCertForm] = useState({
    title: '',
    organization: '',
    year: ''
  });
  const [editingImage, setEditingImage] = useState<ProfileImage | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingHero, setEditingHero] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [heroForm, setHeroForm] = useState({
    title: '',
    description: '',
    titleSize: 'text-5xl md:text-6xl',
    descriptionSize: 'text-xl',
    image: ''
  });
  const [aboutForm, setAboutForm] = useState({
    title: '',
    paragraph1: '',
    paragraph2: '',
    image: ''
  });
  const [heroImageUploadMethod, setHeroImageUploadMethod] = useState<'url' | 'file'>('url');
  const [aboutImageUploadMethod, setAboutImageUploadMethod] = useState<'url' | 'file'>('url');
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const aboutImageInputRef = useRef<HTMLInputElement>(null);

  const [contactInfo, setContactInfo] = useState<any>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    address: '',
    instagram: '',
    youtube: ''
  });

  // KVKK State
  const [kvkkContent, setKvkkContent] = useState('');
  const [editingKvkk, setEditingKvkk] = useState(false);
  const [savingKvkk, setSavingKvkk] = useState(false);

  // Çerez Politikası State
  const [cookiesContent, setCookiesContent] = useState('');
  const [editingCookies, setEditingCookies] = useState(false);
  const [savingCookies, setSavingCookies] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Sertifikaları yükle
      const certs = await certificatesApi.getAll();
      setCertificates(certs);

      // Profil resimlerini yükle
      const images = await contentApi.getProfileImages();
      setProfileImages(images);

      // Hero içeriğini yükle
      const heroData = await contentApi.getHeroContents();
      if (heroData.length > 0) {
        setHeroContent(heroData[0]);
        setHeroForm({
          title: heroData[0].title,
          description: heroData[0].description,
          titleSize: heroData[0].titleSize || 'text-5xl md:text-6xl',
          descriptionSize: heroData[0].descriptionSize || 'text-xl',
          image: heroData[0].image || ''
        });
      }

      // Hakkımda içeriğini yükle
      const aboutData = await contentApi.getAboutContents();
      if (aboutData.length > 0) {
        setAboutContent(aboutData[0]);
        setAboutForm({
          title: aboutData[0].title,
          paragraph1: aboutData[0].paragraph1,
          paragraph2: aboutData[0].paragraph2,
          image: aboutData[0].image || ''
        });
      }

      // İletişim bilgilerini yükle
      const contactData = await contentApi.getContactInfo();
      setContactInfo(contactData);
      setContactForm({
        email: contactData.email,
        phone: contactData.phone,
        address: contactData.address,
        instagram: contactData.instagram || '',
        youtube: contactData.youtube || ''
      });

      // KVKK içeriğini yükle
      const kvkkData = await contentApi.getKvkkContent();
      if (kvkkData) {
        setKvkkContent(kvkkData.content);
      }

      // Çerez politikası içeriğini yükle
      const cookiesData = await contentApi.getCookiesContent();
      if (cookiesData) {
        setCookiesContent(cookiesData.content);
      }
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Veriler yüklenirken hata: ${message}`);
    }
  };

  const handleSaveKvkk = async () => {
    setSavingKvkk(true);
    try {
      await contentApi.updateKvkkContent(kvkkContent);
      toast.success('KVKK metni başarıyla güncellendi');
      setEditingKvkk(false);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`KVKK metni kaydedilemedi: ${message}`);
    } finally {
      setSavingKvkk(false);
    }
  };

  const handleSaveCookies = async () => {
    setSavingCookies(true);
    try {
      await contentApi.updateCookiesContent(cookiesContent);
      toast.success('Çerez politikası başarıyla güncellendi');
      setEditingCookies(false);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Çerez politikası kaydedilemedi: ${message}`);
    } finally {
      setSavingCookies(false);
    }
  };

  const handleAddCert = () => {
    setEditingCert(null);
    setCertForm({ title: '', organization: '', year: '' });
    setShowCertModal(true);
  };

  const handleEditCert = (cert: Certificate) => {
    setEditingCert(cert);
    setCertForm({
      title: cert.title,
      organization: cert.organization,
      year: cert.year
    });
    setShowCertModal(true);
  };

  const handleSaveCert = async () => {
    if (!certForm.title || !certForm.organization || !certForm.year) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      if (editingCert) {
        await certificatesApi.update(editingCert.id, certForm);
        toast.success('Sertifika başarıyla güncellendi');
      } else {
        await certificatesApi.create(certForm);
        toast.success('Sertifika başarıyla eklendi');
      }

      await loadData();
      setShowCertModal(false);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Sertifika kaydedilirken hata: ${message}`);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) {
      try {
        await certificatesApi.delete(id);
        await loadData();
        toast.success('Sertifika başarıyla silindi');
      } catch (error) {
        const message = getUserFriendlyErrorMessage(error);
        toast.error(`Sertifika silinirken hata: ${message}`);
      }
    }
  };

  const handleEditImage = (image: ProfileImage) => {
    setEditingImage(image);
    setImageUrl(image.url);
    setUploadMethod('url');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    setUploadingImage(true);
    try {
      const url = await storageApi.uploadFile('profile-images', file);
      setImageUrl(url);
      toast.success('Görsel yüklendi');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Görsel yüklenemedi. Supabase Storage bucket kontrol edin.');
      // Fallback: Base64 kullan
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveImage = async () => {
    if (!imageUrl || !editingImage) return;
    
    try {
      await contentApi.updateProfileImage(editingImage.id, imageUrl);
      await loadData();
      setEditingImage(null);
      setImageUrl('');
      setUploadMethod('url');
      toast.success('Resim başarıyla güncellendi');
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Resim kaydedilirken hata: ${message}`);
    }
  };

  const handleEditHero = () => {
    setEditingHero(true);
  };

  const handleHeroSave = async () => {
    if (!heroForm.title || !heroForm.description) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      if (heroContent) {
        await contentApi.updateHeroContent(heroContent.id, {
          title: heroForm.title,
          description: heroForm.description,
          image: heroForm.image
        });
        
        await loadData();
        setEditingHero(false);
        toast.success('Hero içeriği başarıyla güncellendi');
      }
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Hero içeriği kaydedilirken hata: ${message}`);
    }
  };

  const handleHeroCancel = () => {
    if (heroContent) {
      setHeroForm({
        title: heroContent.title,
        description: heroContent.description,
        titleSize: heroContent.titleSize || 'text-5xl md:text-6xl',
        descriptionSize: heroContent.descriptionSize || 'text-xl',
        image: heroContent.image || ''
      });
    }
    setEditingHero(false);
  };

  const handleEditAbout = () => {
    setEditingAbout(true);
  };

  const handleAboutSave = async () => {
    try {
      if (aboutContent) {
        await contentApi.updateAboutContent(aboutContent.id, {
          ...aboutForm,
          image: aboutForm.image
        });
        await loadData();
        setEditingAbout(false);
        toast.success('Hakkımda içeriği başarıyla güncellendi');
      }
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Hakkımda içeriği kaydedilirken hata: ${message}`);
    }
  };

  const handleEditContact = () => {
    setEditingContact(true);
  };

  const handleContactSave = async () => {
    if (!contactForm.email || !contactForm.phone || !contactForm.address) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      await contentApi.updateContactInfo({
        email: contactForm.email,
        phone: contactForm.phone,
        address: contactForm.address,
        instagram: contactForm.instagram,
        youtube: contactForm.youtube
      });
      
      await loadData();
      setEditingContact(false);
      toast.success('İletişim bilgileri başarıyla güncellendi');
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`İletişim bilgileri kaydedilirken hata: ${message}`);
    }
  };

  const handleContactCancel = () => {
    if (contactInfo) {
      setContactForm({
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        instagram: contactInfo.instagram || '',
        youtube: contactInfo.youtube || ''
      });
    }
    setEditingContact(false);
  };

  const handleAboutCancel = () => {
    if (aboutContent) {
      setAboutForm({
        title: aboutContent.title,
        paragraph1: aboutContent.paragraph1,
        paragraph2: aboutContent.paragraph2,
        image: aboutContent.image || ''
      });
    }
    setEditingAbout(false);
  };

  return (
    <div className="space-y-8">
      {/* Ana Sayfa Hero İçeriği */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Ana Sayfa Hero Bölümü</h3>
        
        {heroContent && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-[#1A1A1A] mb-2">Başlık:</h4>
              <p className="text-gray-700">{heroContent.title}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-[#1A1A1A] mb-2">Açıklama:</h4>
              <p className="text-gray-700">{heroContent.description}</p>
            </div>
            <button
              type="button"
              onClick={handleEditHero}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-edit-line mr-2"></i>
              Düzenle
            </button>
          </div>
        )}
      </div>

      {/* Ana Sayfa Hakkımda İçeriği */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Ana Sayfa Hakkımda Bölümü</h3>
        
        {aboutContent && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Mevcut Resim Önizleme */}
              {aboutContent.image && (
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={aboutContent.image}
                    alt="Hakkımda Resmi"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Başlık:</h4>
                  <p className="text-gray-700">{aboutContent.title}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Birinci Paragraf:</h4>
                  <p className="text-gray-700">{aboutContent.paragraph1}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">İkinci Paragraf:</h4>
                  <p className="text-gray-700">{aboutContent.paragraph2}</p>
                </div>
                <button
                  type="button"
                  onClick={handleEditAbout}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">İletişim Bilgileri</h3>
        
        {contactInfo && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">E-posta:</h4>
                <p className="text-gray-700">{contactInfo.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Telefon:</h4>
                <p className="text-gray-700">{contactInfo.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Adres:</h4>
                <p className="text-gray-700">{contactInfo.address}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Instagram:</h4>
                <p className="text-gray-700">{contactInfo.instagram || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">YouTube:</h4>
                <p className="text-gray-700">{contactInfo.youtube || 'Belirtilmemiş'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEditContact}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-edit-line mr-2"></i>
              Düzenle
            </button>
          </div>
        )}
      </div>

      {/* Sertifikalar */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#1A1A1A]">Sertifikalar & Eğitimler</h3>
          <button
            type="button"
            onClick={handleAddCert}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line"></i>
            Yeni Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-[#1A1A1A] mb-2">{cert.title}</h4>
              <p className="text-[#D4AF37] text-sm mb-1">{cert.organization}</p>
              <p className="text-gray-600 text-sm mb-3">{cert.year}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditCert(cert)}
                  className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCert(cert.id)}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-delete-bin-line mr-1"></i>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profil Resimleri */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">Profil Resimleri</h3>
        
        <div className="space-y-4">
          {profileImages.map((image) => (
            <div key={image.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">{image.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Konum: {
                      image.location === 'about-hero' ? 'Hakkımda Sayfası' : 
                      image.location === 'home-about' ? 'Ana Sayfa - Hakkımda Bölümü' : 
                      'Diğer'
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => handleEditImage(image)}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Resmi Değiştir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sertifika Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              {editingCert ? 'Sertifika Düzenle' : 'Yeni Sertifika Ekle'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sertifika Adı
                </label>
                <input
                  type="text"
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="ICF Sertifikalı Yaşam Koçu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kurum
                </label>
                <input
                  type="text"
                  value={certForm.organization}
                  onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="International Coach Federation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yıl
                </label>
                <input
                  type="text"
                  value={certForm.year}
                  onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveCert}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resim Düzenleme Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Resmi Değiştir
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {editingImage.name}
                </label>
                
                {/* Yükleme Yöntemi Seçimi */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      uploadMethod === 'url'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-link mr-2"></i>
                    URL ile
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      uploadMethod === 'file'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-upload-2-line mr-2"></i>
                    Dosya Yükle
                  </button>
                </div>

                {/* URL Girişi */}
                {uploadMethod === 'url' && (
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Resim URL'si girin"
                  />
                )}

                {/* Dosya Yükleme */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <>
                          <i className="ri-loader-4-line text-4xl text-[#D4AF37] mb-2 animate-spin"></i>
                          <p className="text-sm text-gray-600">Yükleniyor...</p>
                        </>
                      ) : (
                        <>
                          <i className="ri-image-add-line text-4xl text-gray-400 mb-2"></i>
                          <p className="text-sm text-gray-600">
                            Resim seçmek için tıklayın
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Maksimum 5MB, JPG, PNG veya GIF
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Önizleme */}
              {imageUrl && (
                <div className="border border-gray-200 rounded-lg p-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Önizleme:</p>
                  <img
                    src={imageUrl}
                    alt="Önizleme"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Geçersiz+Resim';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingImage(null);
                  setImageUrl('');
                  setUploadMethod('url');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSaveImage}
                disabled={!imageUrl}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero İçerik Düzenleme Modal */}
      {editingHero && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Hero Bölümünü Düzenle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Hayatınızı Yeniden Keşfedin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık Boyutu
                </label>
                <select
                  value={heroForm.titleSize}
                  onChange={(e) => setHeroForm({ ...heroForm, titleSize: e.target.value })}
                  className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="text-3xl md:text-4xl">Küçük</option>
                  <option value="text-4xl md:text-5xl">Orta</option>
                  <option value="text-5xl md:text-6xl">Büyük</option>
                  <option value="text-6xl md:text-7xl">Çok Büyük</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={heroForm.description}
                  onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="Profesyonel yaşam koçluğu ve danışmanlık hizmetleri..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama Boyutu
                </label>
                <select
                  value={heroForm.descriptionSize}
                  onChange={(e) => setHeroForm({ ...heroForm, descriptionSize: e.target.value })}
                  className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="text-base">Küçük</option>
                  <option value="text-lg">Orta</option>
                  <option value="text-xl">Büyük</option>
                  <option value="text-2xl">Çok Büyük</option>
                </select>
              </div>

              {/* Hero Resim Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Görseli (Opsiyonel)
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setHeroImageUploadMethod('url')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                      heroImageUploadMethod === 'url'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-link mr-1"></i> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroImageUploadMethod('file')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                      heroImageUploadMethod === 'file'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-upload-2-line mr-1"></i> Dosya
                  </button>
                </div>
                
                {heroImageUploadMethod === 'url' ? (
                  <input
                    type="text"
                    value={heroForm.image}
                    onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Resim URL'si girin"
                  />
                ) : (
                  <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Dosya 5MB\'dan küçük olmalı');
                          return;
                        }
                        setUploadingHeroImage(true);
                        try {
                          const url = await storageApi.uploadFile('profile-images', file);
                          setHeroForm({ ...heroForm, image: url });
                          toast.success('Görsel yüklendi');
                        } catch (error) {
                          toast.error('Görsel yüklenemedi');
                        } finally {
                          setUploadingHeroImage(false);
                        }
                      }}
                      className="hidden"
                      disabled={uploadingHeroImage}
                    />
                    {uploadingHeroImage ? (
                      <i className="ri-loader-4-line text-3xl text-[#D4AF37] animate-spin"></i>
                    ) : (
                      <>
                        <i className="ri-image-add-line text-3xl text-gray-400"></i>
                        <p className="text-sm text-gray-600 mt-1">Resim seçin (max 5MB)</p>
                      </>
                    )}
                  </label>
                )}
                
                {heroForm.image && (
                  <div className="mt-3 relative">
                    <img
                      src={heroForm.image}
                      alt="Hero önizleme"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Geçersiz+Resim';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setHeroForm({ ...heroForm, image: '' })}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleHeroCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleHeroSave}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hakkımda İçerik Düzenleme Modal */}
      {editingAbout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Hakkımda Bölümünü Düzenle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={aboutForm.title}
                  onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Şafak Özkan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birinci Paragraf
                </label>
                <textarea
                  value={aboutForm.paragraph1}
                  onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="15 yılı aşkın deneyimimle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkinci Paragraf
                </label>
                <textarea
                  value={aboutForm.paragraph2}
                  onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="Amacım, sizin içsel gücünüzü..."
                />
              </div>

              {/* About Resim Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profil Görseli
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAboutImageUploadMethod('url')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                      aboutImageUploadMethod === 'url'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-link mr-1"></i> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setAboutImageUploadMethod('file')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm cursor-pointer ${
                      aboutImageUploadMethod === 'file'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="ri-upload-2-line mr-1"></i> Dosya
                  </button>
                </div>
                
                {aboutImageUploadMethod === 'url' ? (
                  <input
                    type="text"
                    value={aboutForm.image}
                    onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Resim URL'si girin"
                  />
                ) : (
                  <label className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <input
                      ref={aboutImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Dosya 5MB\'dan küçük olmalı');
                          return;
                        }
                        setUploadingAboutImage(true);
                        try {
                          const url = await storageApi.uploadFile('profile-images', file);
                          setAboutForm({ ...aboutForm, image: url });
                          toast.success('Görsel yüklendi');
                        } catch (error) {
                          toast.error('Görsel yüklenemedi');
                        } finally {
                          setUploadingAboutImage(false);
                        }
                      }}
                      className="hidden"
                      disabled={uploadingAboutImage}
                    />
                    {uploadingAboutImage ? (
                      <i className="ri-loader-4-line text-3xl text-[#D4AF37] animate-spin"></i>
                    ) : (
                      <>
                        <i className="ri-image-add-line text-3xl text-gray-400"></i>
                        <p className="text-sm text-gray-600 mt-1">Resim seçin (max 5MB)</p>
                      </>
                    )}
                  </label>
                )}
                
                {aboutForm.image && (
                  <div className="mt-3 relative">
                    <img
                      src={aboutForm.image}
                      alt="Profil önizleme"
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Geçersiz+Resim';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAboutForm({ ...aboutForm, image: '' })}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAboutCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleAboutSave}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İletişim Bilgileri Düzenleme Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              İletişim Bilgilerini Düzenle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="info@re-set.com.tr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="+90 532 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input
                  type="text"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Nişantaşı, İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={contactForm.instagram}
                  onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="https://instagram.com/kullaniciadi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube
                </label>
                <input
                  type="text"
                  value={contactForm.youtube}
                  onChange={(e) => setContactForm({ ...contactForm, youtube: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="https://youtube.com/@kullaniciadi"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleContactCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleContactSave}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KVKK Düzenleme Bölümü */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#1A1A1A]">KVKK Aydınlatma Metni</h3>
            <p className="text-sm text-gray-500 mt-1">KVKK sayfasında görünecek içerik</p>
          </div>
          {!editingKvkk && (
            <button
              onClick={() => setEditingKvkk(true)}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors cursor-pointer"
            >
              <i className="ri-pencil-line mr-2"></i>
              Düzenle
            </button>
          )}
        </div>

        {editingKvkk ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KVKK Metni (HTML destekli)
              </label>
              <textarea
                value={kvkkContent}
                onChange={(e) => setKvkkContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-mono text-sm"
                placeholder="<h2>1. Veri Sorumlusu</h2>&#10;<p>6698 sayılı KVKK uyarınca...</p>"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingKvkk(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSaveKvkk}
                disabled={savingKvkk}
                className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingKvkk ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {kvkkContent ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: kvkkContent }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                Henüz KVKK metni eklenmemiş. "Düzenle" butonuna tıklayarak ekleyebilirsiniz.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Çerez Politikası Düzenleme Bölümü */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[#1A1A1A]">Çerez Politikası</h3>
            <p className="text-sm text-gray-500 mt-1">Çerez politikası sayfasında görünecek içerik</p>
          </div>
          {!editingCookies && (
            <button
              onClick={() => setEditingCookies(true)}
              className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors cursor-pointer"
            >
              <i className="ri-pencil-line mr-2"></i>
              Düzenle
            </button>
          )}
        </div>

        {editingCookies ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çerez Politikası Metni (HTML destekli)
              </label>
              <textarea
                value={cookiesContent}
                onChange={(e) => setCookiesContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-mono text-sm"
                placeholder="<h2>1. Çerez Nedir?</h2>&#10;<p>Çerezler, web siteleri tarafından...</p>"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingCookies(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSaveCookies}
                disabled={savingCookies}
                className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingCookies ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            {cookiesContent ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: cookiesContent }}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                Henüz çerez politikası metni eklenmemiş. "Düzenle" butonuna tıklayarak ekleyebilirsiniz.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
