import { useState, useEffect } from 'react';
import { clientsApi, appointmentsApi, progressApi } from '../../../lib/api';
import { invoicesApi, paymentsApi, type Invoice, type Payment } from '../../../lib/accounting';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Client, Appointment, ProgressRecord } from '../../../types';

type BalanceFilter = 'all' | 'debt' | 'paid' | 'balanced';

export default function ClientsTab() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Selected client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [clientProgress, setClientProgress] = useState<ProgressRecord[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [detailTab, setDetailTab] = useState<'info' | 'appointments' | 'account'>('info');
  
  // Invoice/Payment modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    description: '',
    amount: '',
    due_date: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    invoice_id: '',
    payment_method: 'cash' as 'cash' | 'credit_card' | 'bank_transfer' | 'other',
    description: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Danışanlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (client: Client) => {
    try {
      // Load appointments for this client
      const allAppointments = await appointmentsApi.getAll();
      const clientAppts = allAppointments.filter(a => a.clientEmail === client.email);
      setClientAppointments(clientAppts);
      
      // Load progress records
      try {
        const progress = await progressApi.getByClient(client.id);
        setClientProgress(progress);
      } catch {
        setClientProgress([]);
      }

      // Load invoices
      try {
        const invoices = await invoicesApi.getByClient(client.id);
        setClientInvoices(invoices);
      } catch {
        setClientInvoices([]);
      }

      // Load payments
      try {
        const payments = await paymentsApi.getByClient(client.id);
        setClientPayments(payments);
      } catch {
        setClientPayments([]);
      }
    } catch (error) {
      console.error('Error loading client details:', error);
    }
  };

  const handleAddClient = () => {
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      notes: client.notes || ''
    });
    setShowEditModal(true);
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    setDetailTab('info');
    await loadClientDetails(client);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteConfirm(true);
  };

  // Fatura ekleme
  const handleAddInvoice = async () => {
    if (!selectedClient || !invoiceForm.description || !invoiceForm.amount) {
      toast.error('Açıklama ve tutar alanları zorunludur');
      return;
    }

    setSaving(true);
    try {
      await invoicesApi.create({
        client_id: selectedClient.id,
        description: invoiceForm.description,
        amount: parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date || undefined
      });
      toast.success('Fatura başarıyla eklendi');
      setShowInvoiceModal(false);
      setInvoiceForm({ description: '', amount: '', due_date: '' });
      await loadClientDetails(selectedClient);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Fatura eklenemedi: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Ödeme ekleme
  const handleAddPayment = async () => {
    if (!selectedClient || !paymentForm.amount) {
      toast.error('Tutar alanı zorunludur');
      return;
    }

    setSaving(true);
    try {
      await paymentsApi.create({
        client_id: selectedClient.id,
        amount: parseFloat(paymentForm.amount),
        invoice_id: paymentForm.invoice_id || undefined,
        payment_method: paymentForm.payment_method,
        description: paymentForm.description || undefined
      });
      toast.success('Ödeme başarıyla kaydedildi');
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', invoice_id: '', payment_method: 'cash', description: '' });
      await loadClientDetails(selectedClient);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Ödeme kaydedilemedi: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Hesap bakiyesi hesaplama
  const calculateBalance = () => {
    const totalDebt = clientInvoices
      .filter(inv => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = clientPayments.reduce((sum, pmt) => sum + pmt.amount, 0);
    return { totalDebt, totalPaid, balance: totalDebt - totalPaid };
  };

  const handleSaveClient = async (isEdit: boolean) => {
    if (!formData.name || !formData.email) {
      toast.error('İsim ve e-posta alanları zorunludur');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && selectedClient) {
        await clientsApi.update(selectedClient.id, formData);
        toast.success('Danışan başarıyla güncellendi');
      } else {
        await clientsApi.create(formData);
        toast.success('Danışan başarıyla eklendi');
      }
      // Başarılı olunca modalları kapat ve formu sıfırla
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      await loadClients();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`İşlem başarısız: ${message}`);
      // Hata durumunda da modalı kapat
      setShowAddModal(false);
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    setSaving(true);
    try {
      await clientsApi.delete(selectedClient.id);
      toast.success('Danışan başarıyla silindi');
      setShowDeleteConfirm(false);
      setSelectedClient(null);
      await loadClients();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme işlemi başarısız: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Bakiye formatla
  const formatBalance = (balance: number) => {
    if (balance > 0) return { text: `${balance.toLocaleString('tr-TR')} ₺ Borç`, color: 'text-red-600', bg: 'bg-red-50' };
    if (balance < 0) return { text: `${Math.abs(balance).toLocaleString('tr-TR')} ₺ Alacak`, color: 'text-green-600', bg: 'bg-green-50' };
    return { text: 'Dengeli', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  // Danışan istatistikleri
  const stats = {
    total: clients.length,
    debtors: clients.filter(c => (c.balance || 0) > 0).length,
    balanced: clients.filter(c => (c.balance || 0) === 0).length,
    creditors: clients.filter(c => (c.balance || 0) < 0).length,
    totalDebt: clients.reduce((sum, c) => sum + ((c.balance || 0) > 0 ? (c.balance || 0) : 0), 0),
    totalCredit: clients.reduce((sum, c) => sum + ((c.balance || 0) < 0 ? Math.abs(c.balance || 0) : 0), 0)
  };

  const filteredClients = clients.filter(client => {
    // İsim, email, telefon filtresi
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm));
    
    // Bakiye filtresi
    const balance = client.balance || 0;
    const matchesBalance = 
      balanceFilter === 'all' ||
      (balanceFilter === 'debt' && balance > 0) ||
      (balanceFilter === 'paid' && balance < 0) ||
      (balanceFilter === 'balanced' && balance === 0);
    
    return matchesSearch && matchesBalance;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-[#D4AF37] animate-spin mb-4"></i>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Danışanlar</h2>
          <p className="text-gray-600 mt-1">Toplam {clients.length} danışan</p>
        </div>
        <button
          onClick={handleAddClient}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-200"
        >
          <i className="ri-user-add-line text-lg"></i>
          Yeni Danışan Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-xl text-[#D4AF37]"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam Danışan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-xl text-red-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.debtors}</p>
              <p className="text-xs text-gray-500">Borçlu ({stats.totalDebt.toLocaleString('tr-TR')} ₺)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-circle-line text-xl text-green-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.creditors}</p>
              <p className="text-xs text-gray-500">Alacaklı ({stats.totalCredit.toLocaleString('tr-TR')} ₺)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-xl text-gray-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.balanced}</p>
              <p className="text-xs text-gray-500">Dengeli</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBalanceFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                balanceFilter === 'all' 
                  ? 'bg-[#D4AF37] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setBalanceFilter('debt')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                balanceFilter === 'debt' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <i className="ri-arrow-down-line mr-1"></i>Borçlu
            </button>
            <button
              onClick={() => setBalanceFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                balanceFilter === 'paid' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <i className="ri-arrow-up-line mr-1"></i>Alacaklı
            </button>
            <button
              onClick={() => setBalanceFilter('balanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                balanceFilter === 'balanced' 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Dengeli
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz danışan yok</h3>
          <p className="text-gray-600 mb-6">İlk danışanınızı ekleyerek başlayın</p>
          <button
            onClick={handleAddClient}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] transition-colors"
          >
            <i className="ri-user-add-line"></i>
            Danışan Ekle
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <i className="ri-search-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-600">"{searchTerm}" için sonuç bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danışan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bakiye</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const balanceInfo = formatBalance(client.balance || 0);
                  return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C4A030] flex items-center justify-center text-white font-semibold">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {client.notes && (
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{client.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{client.email}</p>
                      <p className="text-sm text-gray-500">{client.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${balanceInfo.bg} ${balanceInfo.color}`}>
                        {(client.balance || 0) > 0 && <i className="ri-arrow-down-s-fill mr-1"></i>}
                        {(client.balance || 0) < 0 && <i className="ri-arrow-up-s-fill mr-1"></i>}
                        {balanceInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">
                        {new Date(client.createdAt || '').toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewClient(client)}
                          className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <i className="ri-eye-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(client)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredClients.map((client) => {
              const balanceInfo = formatBalance(client.balance || 0);
              return (
              <div key={client.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C4A030] flex items-center justify-center text-white font-semibold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.email}</p>
                      {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${balanceInfo.bg} ${balanceInfo.color}`}>
                    {balanceInfo.text}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewClient(client)}
                    className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-[#D4AF37] bg-gray-50 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                  >
                    <i className="ri-eye-line mr-1"></i> Detay
                  </button>
                  <button
                    onClick={() => handleEditClient(client)}
                    className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <i className="ri-edit-line mr-1"></i> Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(client)}
                    className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <i className="ri-delete-bin-line mr-1"></i> Sil
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {showEditModal ? 'Danışan Düzenle' : 'Yeni Danışan Ekle'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  İsim Soyisim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="0532 123 45 67"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all resize-none"
                  placeholder="Danışan hakkında notlar..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => handleSaveClient(showEditModal)}
                disabled={saving}
                className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    {showEditModal ? 'Güncelle' : 'Ekle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C4A030] flex items-center justify-center text-white font-bold text-xl">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6 flex-shrink-0">
              <button
                onClick={() => setDetailTab('info')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  detailTab === 'info' 
                    ? 'border-[#D4AF37] text-[#D4AF37]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-user-line mr-2"></i>Bilgiler
              </button>
              <button
                onClick={() => setDetailTab('appointments')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  detailTab === 'appointments' 
                    ? 'border-[#D4AF37] text-[#D4AF37]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-calendar-line mr-2"></i>Randevular ({clientAppointments.length})
              </button>
              <button
                onClick={() => setDetailTab('account')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  detailTab === 'account' 
                    ? 'border-[#D4AF37] text-[#D4AF37]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-wallet-3-line mr-2"></i>Hesap/Cari
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Info Tab */}
              {detailTab === 'info' && (
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <i className="ri-calendar-line"></i>
                        <span className="text-sm font-medium">Randevular</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{clientAppointments.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <i className="ri-line-chart-line"></i>
                        <span className="text-sm font-medium">İlerleme</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{clientProgress.length}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${calculateBalance().balance > 0 ? 'bg-red-50' : calculateBalance().balance < 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${calculateBalance().balance > 0 ? 'text-red-600' : calculateBalance().balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        <i className="ri-wallet-3-line"></i>
                        <span className="text-sm font-medium">Bakiye</span>
                      </div>
                      <p className={`text-2xl font-bold ${calculateBalance().balance > 0 ? 'text-red-700' : calculateBalance().balance < 0 ? 'text-green-700' : 'text-gray-700'}`}>
                        {calculateBalance().balance > 0 ? `${calculateBalance().balance.toLocaleString('tr-TR')} ₺ Borç` : 
                         calculateBalance().balance < 0 ? `${Math.abs(calculateBalance().balance).toLocaleString('tr-TR')} ₺ Alacak` : 
                         'Dengeli'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">İletişim Bilgileri</h5>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="flex items-center gap-2 text-gray-700">
                        <i className="ri-mail-line text-gray-400"></i>
                        {selectedClient.email}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <i className="ri-phone-line text-gray-400"></i>
                        {selectedClient.phone || 'Belirtilmemiş'}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <i className="ri-calendar-check-line text-gray-400"></i>
                        Kayıt: {new Date(selectedClient.createdAt || '').toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedClient.notes && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notlar</h5>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700">{selectedClient.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Appointments Tab */}
              {detailTab === 'appointments' && (
                <div>
                  {clientAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="ri-calendar-line text-5xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Henüz randevu yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientAppointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                          <div>
                            <p className="font-medium text-gray-900">{appt.serviceTitle}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(appt.date).toLocaleDateString('tr-TR')} - {appt.time}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {appt.status === 'CONFIRMED' ? 'Onaylı' :
                             appt.status === 'PENDING' ? 'Bekliyor' :
                             appt.status === 'CANCELLED' ? 'İptal' : appt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Account Tab */}
              {detailTab === 'account' && (
                <div className="space-y-6">
                  {/* Balance Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-red-600 mb-1">Toplam Borç</p>
                      <p className="text-xl font-bold text-red-700">{calculateBalance().totalDebt.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-green-600 mb-1">Toplam Ödeme</p>
                      <p className="text-xl font-bold text-green-700">{calculateBalance().totalPaid.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center ${calculateBalance().balance > 0 ? 'bg-orange-50' : 'bg-blue-50'}`}>
                      <p className={`text-sm mb-1 ${calculateBalance().balance > 0 ? 'text-orange-600' : 'text-blue-600'}`}>Bakiye</p>
                      <p className={`text-xl font-bold ${calculateBalance().balance > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                        {calculateBalance().balance.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                    >
                      <i className="ri-file-add-line"></i>
                      Fatura/Borç Ekle
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                    >
                      <i className="ri-money-dollar-circle-line"></i>
                      Ödeme Al
                    </button>
                  </div>

                  {/* Invoices */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Faturalar ({clientInvoices.length})</h5>
                    {clientInvoices.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
                        <i className="ri-file-list-line text-3xl mb-2 block"></i>
                        Henüz fatura yok
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientInvoices.map((invoice) => (
                          <div key={invoice.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{invoice.description}</p>
                                <p className="text-sm text-gray-500">
                                  {invoice.invoice_no} • {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{invoice.amount.toLocaleString('tr-TR')} ₺</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                  invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {invoice.status === 'paid' ? 'Ödendi' :
                                   invoice.status === 'partial' ? 'Kısmi' :
                                   invoice.status === 'cancelled' ? 'İptal' : 'Ödenmedi'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payments */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ödemeler ({clientPayments.length})</h5>
                    {clientPayments.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
                        <i className="ri-money-dollar-circle-line text-3xl mb-2 block"></i>
                        Henüz ödeme yok
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientPayments.map((payment) => (
                          <div key={payment.id} className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{payment.description || 'Ödeme'}</p>
                                <p className="text-sm text-gray-500">
                                  {payment.receipt_no} • {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                                  {payment.invoice_no && ` • Fatura: ${payment.invoice_no}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-700">+{payment.amount.toLocaleString('tr-TR')} ₺</p>
                                <span className="text-xs text-gray-500">
                                  {payment.payment_method === 'cash' ? 'Nakit' :
                                   payment.payment_method === 'credit_card' ? 'Kredi Kartı' :
                                   payment.payment_method === 'bank_transfer' ? 'Havale/EFT' : 'Diğer'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditClient(selectedClient);
                }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <i className="ri-edit-line"></i>
                Düzenle
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Fatura/Borç Ekle</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  placeholder="Örn: Bireysel Seans - Aralık 2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tutar (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vade Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleAddInvoice}
                disabled={saving}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-add-line"></i>}
                Borç Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Ödeme Al</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tutar (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ödeme Yöntemi
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as 'cash' | 'credit_card' | 'bank_transfer' | 'other' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                >
                  <option value="cash">Nakit</option>
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="bank_transfer">Havale/EFT</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              {clientInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Faturaya Bağla (Opsiyonel)
                  </label>
                  <select
                    value={paymentForm.invoice_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  >
                    <option value="">Seçiniz...</option>
                    {clientInvoices
                      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                      .map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_no} - {inv.description} ({(inv.amount - inv.paid_amount).toLocaleString('tr-TR')} ₺ kalan)
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Açıklama (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none"
                  placeholder="Örn: Aralık ayı ödemesi"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleAddPayment}
                disabled={saving}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
                Ödeme Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl my-auto">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Danışanı Sil</h3>
              <p className="text-gray-600">
                <strong>{selectedClient.name}</strong> isimli danışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedClient(null); }}
                className="flex-1 px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={saving}
                className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line"></i>
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
