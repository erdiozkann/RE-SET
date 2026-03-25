
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { servicesApi, appointmentsApi } from '../../lib/api';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import { useToast } from '../../components/ToastContainer';
import { supabase } from '../../lib/supabase';
import type { ServiceType, WorkingConfig } from '../../types';
import SEO from '../../components/SEO';

const BookingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [config, setConfig] = useState<WorkingConfig | null>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAccountCheck, setShowAccountCheck] = useState(false);

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setShowAccountCheck(true);
      return;
    }

    if (user.role !== 'CLIENT') {
      toast.warning('Bu sayfaya erişmek için danışan hesabıyla giriş yapmalısınız');
      navigate('/login', { replace: true });
      return;
    }

    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    }));

    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('working_config')
          .select('*')
          .single();

        if (data) {
          return {
            startHour: data.start_hour,
            endHour: data.end_hour,
            slotDuration: data.slot_duration,
            offDays: data.off_days || []
          };
        }
        return null;
      } catch (error) {
        console.error('Config yükleme hatası:', error);
        return null;
      }
    };

    const fetchData = async () => {
      try {
        const [servicesData, configData] = await Promise.all([
          servicesApi.getAll(),
          fetchConfig()
        ]);
        setServices(servicesData || []);
        setConfig(configData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    fetchData();
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (!config) return;

    const dates: string[] = [];
    const today = new Date();
    const now = new Date();
    let daysAdded = 0;
    const currentDate = new Date(today);

    // Bugünün saati geçmiş çalışma saatinden sonraysa, bugünü atla
    const [endH] = config.endHour.split(':').map(Number);
    if (now.getHours() >= endH) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (daysAdded < 7) {
      const dayOfWeek = currentDate.getDay();
      if (!config.offDays.includes(dayOfWeek)) {
        dates.push(currentDate.toISOString().split('T')[0]);
        daysAdded++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDates(dates);
  }, [config]);

  useEffect(() => {
    if (!config || !selectedDate) return;

    const slots: string[] = [];
    const [startH, startM] = config.startHour.split(':').map(Number);
    const [endH, endM] = config.endHour.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Bugün için geçmiş saatleri filtrele
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = selectedDate === today;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Bugünse ve saat geçmişse, bu slotu ekleme
      // En az 1 saat sonrasını göster (hazırlık süresi için)
      if (!isToday || currentMinutes > currentTimeMinutes + 60) {
        slots.push(timeString);
      }

      currentMinutes += config.slotDuration;
    }

    setTimeSlots(slots);
  }, [selectedDate, config]);



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    return `${date.getDate()} ${months[date.getMonth()]} ${days[date.getDay()]}`;
  };

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime || !user) return;

    try {
      await appointmentsApi.create({
        clientId: user.id || '',
        clientEmail: formData.email,
        clientName: formData.name,
        clientPhone: formData.phone,
        date: selectedDate,
        time: selectedTime,
        serviceType: selectedService.id,
        serviceTitle: selectedService.title,
        notes: formData.notes,
        status: 'PENDING'
      });

      toast.success('Randevunuz başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/client-panel', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Randevu oluşturma hatası:', error);
      console.error('Hata detayı:', error.message, error.details, error.hint);
      const message = getUserFriendlyErrorMessage(error);
      toast.error(message || 'Randevu oluşturulurken bir hata oluştu');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Çıkış yapıldı');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  if (showAccountCheck) {
    return (
      <>
        <SEO
          title="Randevu Oluştur - Reset Danışmanlık"
          description="Reset Danışmanlık üzerinden online randevu oluşturun."
        />
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-teal-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-calendar-check-line text-4xl text-white"></i>
            </div>
            <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Randevu Almak İsterseniz</h2>
            <p className="text-gray-600 mb-8">Randevu alabilmek için giriş yapmanız gerekmektedir. Hesabınız var mı?</p>

            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full px-8 py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-full font-semibold hover:bg-[#C19B2E] transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Evet, Giriş Yap
              </Link>
              <Link
                to="/register"
                className="block w-full px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full font-semibold hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-all text-lg"
              >
                Hayır, Hesap Oluştur
              </Link>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Hesap oluşturarak randevu alabilir, randevularınızı takip edebilirsiniz.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-4xl text-white"></i>
          </div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Randevunuz Alındı</h2>
          <p className="text-gray-600 mb-2">Randevu talebiniz başarıyla oluşturuldu.</p>
          <p className="text-sm text-gray-500">En kısa sürede onay maili alacaksınız.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Randevu Oluştur - Reset Danışmanlık"
        description="Reset Danışmanlık üzerinden online randevu oluşturun."
      />
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-4">Randevu Oluştur</h1>
              <p className="text-gray-600">Hoş geldiniz, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#D4AF37] transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-logout-box-line"></i>
              Çıkış
            </button>
          </div>

          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= num
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-white'
                    : 'bg-gray-200 text-gray-500'
                    }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all ${step > num ? 'bg-[#D4AF37]' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-serif text-[#1A1A1A] mb-6">Hizmet Seçin</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-[#D4AF37] transition-all hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <i className="ri-time-line mr-1"></i>
                              {service.duration} dakika
                            </span>
                            {service.price && (
                              <span className="flex items-center font-semibold text-[#D4AF37]">
                                <i className="ri-money-dollar-circle-line mr-1"></i>
                                {service.price} ₺
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-[#D4AF37] flex items-center justify-center ml-4">
                          <i className="ri-arrow-right-line text-gray-400 group-hover:text-[#D4AF37]"></i>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-gray-600 hover:text-[#D4AF37] mb-6 transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Geri
                </button>

                <h2 className="text-2xl font-serif text-[#1A1A1A] mb-2">Tarih ve Saat Seçin</h2>
                <p className="text-gray-600 mb-6">{selectedService?.title}</p>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Tarih</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-4 rounded-xl border-2 transition-all whitespace-nowrap cursor-pointer ${selectedDate === date
                          ? 'border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-[#F4D03F]/10 shadow-lg'
                          : 'border-gray-200 hover:border-[#D4AF37]/50'
                          }`}
                      >
                        <div className="text-sm text-gray-500 mb-1">
                          {formatDate(date).split(' ')[2]}
                        </div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {formatDate(date).split(' ').slice(0, 2).join(' ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Saat</h3>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-xl border-2 transition-all font-semibold whitespace-nowrap cursor-pointer ${selectedTime === time
                              ? 'border-[#D4AF37] bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-white shadow-lg'
                              : 'border-gray-200 hover:border-[#D4AF37]/50 text-[#1A1A1A]'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <i className="ri-time-line text-2xl text-amber-500 mb-2"></i>
                        <p className="text-amber-700">
                          Bu tarih için uygun saat kalmadı. Lütfen başka bir tarih seçin.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <button
                    onClick={handleDateTimeSelect}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white py-4 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                  >
                    Devam Et
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center text-gray-600 hover:text-[#D4AF37] mb-6 transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Geri
                </button>

                <h2 className="text-2xl font-serif text-[#1A1A1A] mb-6">Bilgileriniz</h2>

                <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#F4D03F]/10 rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold text-[#1A1A1A] mb-3">Randevu Özeti</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <i className="ri-service-line mr-2 text-[#D4AF37]"></i>
                      {selectedService?.title}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <i className="ri-calendar-line mr-2 text-[#D4AF37]"></i>
                      {formatDate(selectedDate)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <i className="ri-time-line mr-2 text-[#D4AF37]"></i>
                      {selectedTime} ({selectedService?.duration} dakika)
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="0532 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Notlar (Opsiyonel)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                      placeholder="Belirtmek istediğiniz özel notlar..."
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.notes.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white py-4 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
                  >
                    Randevuyu Onayla
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
