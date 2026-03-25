import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFriendlyErrorMessage } from '../../lib/errors';
import { useToast } from '../../components/ToastContainer';
import SEO from '../../components/SEO';
import type { Appointment, ProgressRecord, ClientResource } from '../../types';

type TabType = 'panel' | 'progress';

export default function ClientPanelPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('panel');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [resources, setResources] = useState<ClientResource[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  const clampProgressPercentage = (value: number | null): number => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value as number)));
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }

    if (user.role !== 'CLIENT') {
      navigate('/login', { replace: true });
      return;
    }

    const loadClientData = async (email: string) => {
      try {
        setLoading(true);

        // Kullanıcının client kaydını bul
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (clientError) {
          console.error('Client sorgu hatası:', clientError);
          setLoading(false);
          return;
        }

        // Client kaydı yoksa boş veri ile devam et
        if (!clients) {
          console.log('Client kaydı bulunamadı, boş veri ile devam ediliyor');
          setLoading(false);
          return;
        }

        // Randevuları yükle
        const { data: appts } = await supabase
          .from('appointments')
          .select('*')
          .eq('client_id', clients.id)
          .order('date', { ascending: false });

        if (appts) {
          setAppointments(appts.map((a: any) => ({
            id: a.id,
            clientId: a.client_id,
            clientName: a.client_name,
            clientEmail: a.client_email,
            clientPhone: a.client_phone,
            date: a.date,
            time: a.time,
            serviceType: a.service_type,
            serviceTitle: a.service_title,
            status: ((a.status || 'PENDING') as string).toUpperCase() as Appointment['status'],
            notes: a.notes,
            createdAt: a.created_at
          })));
        }

        // Gelişim kayıtlarını yükle
        const { data: progress } = await supabase
          .from('progress_records')
          .select('*')
          .eq('client_id', clients.id)
          .order('session_date', { ascending: true });

        if (progress) {
          setProgressRecords(progress.map((p: any) => ({
            id: p.id,
            clientId: p.client_id,
            sessionDate: p.session_date,
            metrics: p.metrics || {},
            emotionalClarity: clampProgressPercentage(p.emotional_clarity),
            mentalClarity: clampProgressPercentage(p.mental_clarity),
            centeredness: clampProgressPercentage(p.centeredness),
            summary: p.summary || p.notes || ''
          })));
        }

        // Kaynakları yükle
        const { data: res } = await supabase
          .from('client_resources')
          .select('*')
          .eq('client_id', clients.id)
          .order('date', { ascending: false });

        if (res) {
          setResources(res.map((r: any) => ({
            id: r.id,
            clientId: r.client_id,
            type: r.type,
            title: r.title,
            description: r.description,
            url: r.url,
            date: r.date
          })));
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error(getUserFriendlyErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadClientData(user.email);
  }, [user, authLoading, navigate, toast]);



  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      alert('Lütfen yorum yazın');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          name: user?.name || user?.email || 'Anonim',
          rating,
          text: reviewText.trim(),
          approved: false,
          date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      setShowReviewForm(false);
      setRating(5);
      setReviewText('');
      alert('Yorumunuz başarıyla gönderildi! Onaylandıktan sonra sitede görüntülenecektir.');
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderilirken bir hata oluştu');
    }
  };

  // Grafik için veri hazırlama
  const chartData = progressRecords.length > 0 ? progressRecords : [];
  const maxValue = 100;
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  const getYPosition = (value: number) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
  };

  const getXPosition = (index: number, total: number) => {
    const availableWidth = chartWidth - 2 * padding;
    return padding + (index / Math.max(total - 1, 1)) * availableWidth;
  };

  const createPath = (data: number[]) => {
    if (data.length === 0) return '';
    return data.map((value, index) => {
      const x = getXPosition(index, data.length);
      const y = getYPosition(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  if (!user || loading) {
    return (
      <>
        <SEO
          title="Danışan Paneli - Reset Danışmanlık"
          description="Reset Danışmanlık danışan paneli"
          noindex
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Danışan Paneli - Reset Danışmanlık"
        description="Reset Danışmanlık danışan paneli"
        noindex
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Hoş Geldiniz
                </h1>
                <p className="text-gray-600">{user.name || user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line mr-2"></i>
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('panel')}
                className={`flex-1 px-6 py-4 font-medium transition-colors cursor-pointer ${activeTab === 'panel'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-dashboard-line mr-2"></i>
                Panelim
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 px-6 py-4 font-medium transition-colors cursor-pointer ${activeTab === 'progress'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-line-chart-line mr-2"></i>
                Gelişimim
              </button>
            </div>
          </div>

          {/* Panel Tab */}
          {activeTab === 'panel' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/booking')}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left cursor-pointer"
                >
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-calendar-line text-2xl text-teal-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Randevu Al</h3>
                  <p className="text-sm text-gray-600">Yeni randevu oluştur</p>
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-mail-line text-2xl text-blue-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">İletişim</h3>
                  <p className="text-sm text-gray-600">Mesaj gönder</p>
                </button>

                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left cursor-pointer"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-star-line text-2xl text-green-600"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Değerlendirme</h3>
                  <p className="text-sm text-gray-600">Yorum yaz</p>
                </button>
              </div>

              {/* Review Form Modal */}
              {showReviewForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Değerlendirme Yap</h3>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-2xl"></i>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puanınız
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="text-3xl transition-colors cursor-pointer"
                            >
                              <i
                                className={`${star <= rating ? 'ri-star-fill text-teal-600' : 'ri-star-line text-gray-300'
                                  }`}
                              ></i>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yorumunuz
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          placeholder="Deneyiminizi paylaşın..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{reviewText.length}/500 karakter</p>
                      </div>

                      <button
                        onClick={handleSubmitReview}
                        className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Randevularım</h3>
                  {appointments.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {appointments.length} kayıt
                    </span>
                  )}
                </div>
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="ri-calendar-event-line text-4xl text-gray-300 mb-2"></i>
                    <p>Henüz randevu kaydı bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map(appointment => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.serviceTitle || 'Randevu'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}{' '}
                            • {appointment.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {appointment.serviceType}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {appointment.status === 'CONFIRMED'
                              ? 'Onaylandı'
                              : appointment.status === 'PENDING'
                                ? 'Bekliyor'
                                : 'İptal'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kaynaklarım ve Ödevlerim</h3>
                {resources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="ri-folder-line text-4xl text-gray-300 mb-2"></i>
                    <p>Henüz kaynak bulunmuyor</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map(resource => (
                      <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <i className={`text-2xl ${resource.type === 'PDF' ? 'ri-file-pdf-line text-red-500' :
                              resource.type === 'NOTE' ? 'ri-file-text-line text-blue-500' :
                                resource.type === 'AUDIO' ? 'ri-music-line text-cyan-500' :
                                  'ri-link text-green-500'
                              }`}></i>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${resource.type === 'PDF' ? 'bg-red-100 text-red-700' :
                              resource.type === 'NOTE' ? 'bg-blue-100 text-blue-700' :
                                resource.type === 'AUDIO' ? 'bg-cyan-100 text-cyan-700' :
                                  'bg-green-100 text-green-700'
                              }`}>
                              {resource.type}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(resource.date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            download={resource.type === 'PDF' ? `${resource.title}.txt` : undefined}
                            target={resource.type === 'LINK' ? '_blank' : undefined}
                            rel={resource.type === 'LINK' ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-download-line"></i>
                            {resource.type === 'PDF' ? 'İndir' : 'Görüntüle'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Gelişim Grafiği */}
              <div className="bg-white rounded-lg shadow-sm p-[6px]">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelişim Grafiğim</h3>
                {chartData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <i className="ri-line-chart-line text-6xl text-gray-300 mb-4"></i>
                    <p>Henüz seans kaydı bulunmuyor</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <svg width={chartWidth} height={chartHeight} className="mx-auto">
                      {/* Grid lines */}
                      {[1, 2, 3, 4, 5].map(value => (
                        <g key={value}>
                          <line
                            x1={padding}
                            y1={getYPosition(value)}
                            x2={chartWidth - padding}
                            y2={getYPosition(value)}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          <text
                            x={padding - 10}
                            y={getYPosition(value) + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#6b7280"
                          >
                            {value}
                          </text>
                        </g>
                      ))}

                      {/* Duygusal Netlik */}
                      <path
                        d={createPath(chartData.map(d => d.emotionalClarity ?? 0))}
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2"
                      />
                      {chartData.map((d, i) => (
                        <circle
                          key={`ec-${i}`}
                          cx={getXPosition(i, chartData.length)}
                          cy={getYPosition(d.emotionalClarity ?? 0)}
                          r="4"
                          fill="#0d9488"
                        />
                      ))}

                      {/* Zihinsel Netlik */}
                      <path
                        d={createPath(chartData.map(d => d.mentalClarity ?? 0))}
                        fill="none"
                        stroke="#1A1A1A"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      {chartData.map((d, i) => (
                        <circle
                          key={`mc-${i}`}
                          cx={getXPosition(i, chartData.length)}
                          cy={getYPosition(d.mentalClarity ?? 0)}
                          r="4"
                          fill="#1A1A1A"
                        />
                      ))}

                      {/* Merkezlenme */}
                      <path
                        d={createPath(chartData.map(d => d.centeredness ?? 0))}
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeDasharray="2,3"
                      />
                      {chartData.map((d, i) => (
                        <circle
                          key={`c-${i}`}
                          cx={getXPosition(i, chartData.length)}
                          cy={getYPosition(d.centeredness ?? 0)}
                          r="4"
                          fill="#64748b"
                        />
                      ))}

                      {/* X-axis labels */}
                      {chartData.map((d, i) => (
                        <text
                          key={`label-${i}`}
                          x={getXPosition(i, chartData.length)}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {new Date(d.sessionDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                        </text>
                      ))}
                    </svg>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-teal-600"></div>
                        <span className="text-sm text-gray-600">Duygusal Netlik</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#1A1A1A] border-dashed border-t-2 border-[#1A1A1A]"></div>
                        <span className="text-sm text-gray-600">Zihinsel Netlik</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-slate-500 border-dotted border-t-2 border-slate-500"></div>
                        <span className="text-sm text-gray-600">Merkezlenme</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Seans Geçmişi */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seans Geçmişim</h3>
                {progressRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="ri-calendar-line text-4xl text-gray-300 mb-2"></i>
                    <p>Henüz seans kaydı bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progressRecords.map(record => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(record.sessionDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <div className="flex gap-4 text-xs">
                            <span className="text-teal-600">DN: {record.emotionalClarity ?? 0}/100</span>
                            <span className="text-[#1A1A1A]">ZN: {record.mentalClarity ?? 0}/100</span>
                            <span className="text-slate-500">M: {record.centeredness ?? 0}/100</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Koç Notları:</h4>
                          <p className="text-sm text-gray-600">{record.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
