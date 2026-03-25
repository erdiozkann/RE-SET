import { useState, useEffect, useCallback } from 'react';
import type { AdAccount, AdCampaign, AdMetrics, AdConversion, AdROISummary } from '../../../types';
import { adAccountsApi, adCampaignsApi, adMetricsApi, adConversionsApi, adROISummaryApi } from '../../../lib/api';

type AdsSubTab = 'accounts' | 'campaigns' | 'metrics' | 'conversions' | 'roi';

export default function AdsTab() {
  const [activeSubTab, setActiveSubTab] = useState<AdsSubTab>('accounts');
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [metrics, setMetrics] = useState<AdMetrics[]>([]);
  const [conversions, setConversions] = useState<AdConversion[]>([]);
  const [roiData, setRoiData] = useState<AdROISummary[]>([]);

  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('google_ads');

  // Form states for adding new account
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'google_ads' as 'google_ads' | 'meta_ads' | 'tiktok_ads',
    accountName: '',
    accountId: '',
    apiKey: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsRes, campaignsRes, metricsRes, conversionsRes, roiRes] = await Promise.allSettled([
        adAccountsApi.getAll(),
        adCampaignsApi.getAll(),
        adMetricsApi.getAll(),
        adConversionsApi.getAll(),
        adROISummaryApi.getAll()
      ]);

      if (accountsRes.status === 'fulfilled') setAccounts(accountsRes.value);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value);
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      if (conversionsRes.status === 'fulfilled') setConversions(conversionsRes.value);
      if (roiRes.status === 'fulfilled') setRoiData(roiRes.value);
    } catch {
      console.error('Error loading ads data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 📊 Accounts Tab
  const renderAccountsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#D4AF37]">Reklam Hesapları</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"
        >
          {showAddForm ? '✕ Kapat' : '+ Hesap Ekle'}
        </button>
      </div>

      {showAddForm && (
        <div className="border border-[#D4AF37] rounded p-4 bg-yellow-50 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">Yeni Reklam Hesabı</h4>
          <form onSubmit={handleAddAccount} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'google_ads' | 'meta_ads' | 'tiktok_ads' })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="google_ads">Google Ads</option>
                  <option value="meta_ads">Meta (Facebook/Instagram)</option>
                  <option value="tiktok_ads">TikTok Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hesap Adı</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="örn: Google Ads - Ana Hesap"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hesap ID</label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="örn: 123456789"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">API Anahtarı</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="API anahtarını girin"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Hesabı aktif yap
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Kaydediliyor...' : '✓ Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    platform: 'google_ads',
                    accountName: '',
                    accountId: '',
                    apiKey: '',
                    isActive: true
                  });
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 transition"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(account => (
          <div key={account.id} className="border border-[#D4AF37] rounded p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
                <p className="text-sm text-gray-600">{getPlatformLabel(account.platform)}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {account.isActive ? '✓ Aktif' : 'İnaktif'}
              </span>
            </div>
            {account.accountId && (
              <p className="text-xs text-gray-600 break-all mb-2">
                <span className="font-semibold">Hesap ID:</span> {account.accountId}
              </p>
            )}
            <button
              onClick={() => handleDeleteAccount(account.id)}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 mt-2"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
      {accounts.length === 0 && !showAddForm && (
        <p className="text-gray-500 text-center py-8">Henüz reklam hesabı eklenmemiş</p>
      )}
    </div>
  );

  // 📈 Campaigns Tab
  const renderCampaignsTab = () => {
    const platformCampaigns = campaigns.filter(c => c.platform === selectedPlatform);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {['google_ads', 'meta_ads', 'tiktok_ads'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1 rounded text-sm ${selectedPlatform === platform
                ? 'bg-[#D4AF37] text-black font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {getPlatformLabel(platform)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#D4AF37] text-black">
                <th className="border border-gray-300 px-3 py-2 text-left">Kampanya</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Durum</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Bütçe</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Harcanan</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Tarih Aralığı</th>
              </tr>
            </thead>
            <tbody>
              {platformCampaigns.map(campaign => (
                <tr key={campaign.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{campaign.campaignName}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {campaign.budget ? `₺${campaign.budget.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                    ₺{campaign.spent.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-xs">
                    {campaign.startDate && campaign.endDate
                      ? `${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {platformCampaigns.length === 0 && (
          <p className="text-gray-500 text-center py-8">Bu platform için kampanya bulunmuyor</p>
        )}
      </div>
    );
  };

  // 📊 Metrics Tab
  const renderMetricsTab = () => {
    const campaignOptions = campaigns.map(c => ({ id: c.id, name: c.campaignName }));
    const campaignMetrics = selectedCampaign
      ? metrics.filter(m => m.campaignId === selectedCampaign)
      : metrics.slice(0, 10);

    const totalImpressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalConversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
    const totalCost = campaignMetrics.reduce((sum, m) => sum + m.cost, 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const avgCPC = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <select
            value={selectedCampaign || ''}
            onChange={(e) => setSelectedCampaign(e.target.value || null)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Tüm Kampanyalar</option>
            {campaignOptions.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Gösterim</p>
            <p className="text-xl font-bold text-blue-700">{totalImpressions.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Tıklamalar</p>
            <p className="text-xl font-bold text-cyan-700">{totalClicks.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Dönüşümler</p>
            <p className="text-xl font-bold text-green-700">{totalConversions.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Harcanan</p>
            <p className="text-xl font-bold text-orange-700">₺{totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 border border-gray-300 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Ortalama CTR</p>
            <p className="text-lg font-bold text-gray-800">{avgCTR}%</p>
          </div>
          <div className="bg-gray-50 border border-gray-300 rounded p-3">
            <p className="text-xs text-gray-600 mb-1">Ort. Tıklama Maliyeti</p>
            <p className="text-lg font-bold text-gray-800">₺{avgCPC}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#D4AF37] text-black">
                <th className="border border-gray-300 px-3 py-2 text-left">Tarih</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Gösterim</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Tıklamalar</th>
                <th className="border border-gray-300 px-3 py-2 text-right">CTR</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Dönüşümler</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Maliyet</th>
                <th className="border border-gray-300 px-3 py-2 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {campaignMetrics.map(metric => (
                <tr key={metric.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{formatDate(metric.dateRecorded)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{metric.impressions.toLocaleString('tr-TR')}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{metric.clicks.toLocaleString('tr-TR')}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{metric.ctr?.toFixed(2) || '0.00'}%</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{metric.conversions}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-semibold">₺{metric.cost.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">₺{metric.cpc?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {campaignMetrics.length === 0 && (
          <p className="text-gray-500 text-center py-8">Metrik verisi bulunmuyor</p>
        )}
      </div>
    );
  };

  // 💰 Conversions Tab
  const renderConversionsTab = () => {
    const platformConversions = conversions.filter(c => c.platform === selectedPlatform);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {['google_ads', 'meta_ads', 'tiktok_ads'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1 rounded text-sm ${selectedPlatform === platform
                ? 'bg-[#D4AF37] text-black font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {getPlatformLabel(platform)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#D4AF37] text-black">
                <th className="border border-gray-300 px-3 py-2 text-left">Kampanya</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Dönüşüm Tipi</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Sayı</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Değer</th>
                <th className="border border-gray-300 px-3 py-2 text-right">CPA</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {platformConversions.map(conversion => {
                const campaign = campaigns.find(c => c.id === conversion.campaignId);
                return (
                  <tr key={conversion.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-2">{campaign?.campaignName || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{conversion.conversionName || conversion.conversionType || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">{conversion.conversionCount}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {conversion.conversionValue ? `₺${conversion.conversionValue.toFixed(2)}` : '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {conversion.costPerAcquisition ? `₺${conversion.costPerAcquisition.toFixed(2)}` : '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">{formatDate(conversion.dateRecorded)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {platformConversions.length === 0 && (
          <p className="text-gray-500 text-center py-8">Bu platform için dönüşüm verisi bulunmuyor</p>
        )}
      </div>
    );
  };

  // 📊 ROI Tab
  const renderROITab = () => {
    const platformROI = roiData.filter(r => r.platform === selectedPlatform);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {['google_ads', 'meta_ads', 'tiktok_ads'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1 rounded text-sm ${selectedPlatform === platform
                ? 'bg-[#D4AF37] text-black font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {getPlatformLabel(platform)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#D4AF37] text-black">
                <th className="border border-gray-300 px-3 py-2 text-left">Ay</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Toplam Harcama</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Toplam Gelir</th>
                <th className="border border-gray-300 px-3 py-2 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody>
              {platformROI.map(roi => (
                <tr key={roi.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{roi.month}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">₺{roi.totalSpend.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {roi.totalRevenue ? `₺${roi.totalRevenue.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    <span className={`font-bold ${roi.roiPercentage && roi.roiPercentage >= 0
                      ? 'text-green-700'
                      : 'text-red-700'
                      }`}>
                      {roi.roiPercentage ? `${roi.roiPercentage.toFixed(2)}%` : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {platformROI.length === 0 && (
          <p className="text-gray-500 text-center py-8">Bu platform için ROI verisi bulunmuyor</p>
        )}
      </div>
    );
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName.trim()) {
      alert('Lütfen hesap adını girin');
      return;
    }

    setIsSubmitting(true);
    try {
      let apiPlatform: 'GOOGLE' | 'FACEBOOK' | 'TIKTOK';
      switch (formData.platform) {
        case 'google_ads':
          apiPlatform = 'GOOGLE';
          break;
        case 'meta_ads':
          apiPlatform = 'FACEBOOK';
          break;
        case 'tiktok_ads':
          apiPlatform = 'TIKTOK';
          break;
        default:
          apiPlatform = 'GOOGLE';
      }

      const newAccount = await adAccountsApi.create({
        platform: apiPlatform,
        name: formData.accountName,
        account_id: formData.accountId,
        status: formData.isActive ? 'ACTIVE' : 'DISABLED'
      });
      setAccounts([newAccount, ...accounts]);

      // Reset form
      setFormData({
        platform: 'google_ads',
        accountName: '',
        accountId: '',
        apiKey: '',
        isActive: true
      });
      setShowAddForm(false);
      console.log('Account added successfully');
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Hesap eklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Bu hesabı silmek istediğinizden emin misiniz?')) return;

    try {
      await adAccountsApi.delete(id);
      setAccounts(accounts.filter(a => a.id !== id));
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading && accounts.length === 0) {
    return <div className="text-center py-8 text-gray-600">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-300 mb-4 overflow-x-auto">
        {[
          { id: 'accounts', label: '📱 Hesaplar' },
          { id: 'campaigns', label: '📈 Kampanyalar' },
          { id: 'metrics', label: '📊 Metrikler' },
          { id: 'conversions', label: '💰 Dönüşümler' },
          { id: 'roi', label: '💹 ROI' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as AdsSubTab)}
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeSubTab === tab.id
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white rounded border border-gray-300">
        {activeSubTab === 'accounts' && renderAccountsTab()}
        {activeSubTab === 'campaigns' && renderCampaignsTab()}
        {activeSubTab === 'metrics' && renderMetricsTab()}
        {activeSubTab === 'conversions' && renderConversionsTab()}
        {activeSubTab === 'roi' && renderROITab()}
      </div>
    </div>
  );
}

// Helper Functions
function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    'google_ads': 'Google Ads',
    'meta_ads': 'Meta (Facebook/Instagram)',
    'tiktok_ads': 'TikTok Ads'
  };
  return labels[platform] || platform;
}

function getStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    'active': '🟢 Aktif',
    'paused': '🟡 Duraklatıldı',
    'ended': '🔴 Bitti'
  };
  return labels[status || ''] || status || '-';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}
