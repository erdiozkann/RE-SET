import { useState, useEffect } from 'react';
import { accounting } from '../../../lib/accounting';
import type { 
  AccountingClient,
  Invoice, 
  Payment, 
  ClientBalance, 
  UnpaidInvoice, 
  MonthlyRevenue,
  Transaction 
} from '../../../lib/accounting';
import { useToast } from '../../../components/ToastContainer';

type SubTab = 'overview' | 'invoices' | 'payments' | 'clients' | 'reports';

export default function AccountingTab() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [clientBalances, setClientBalances] = useState<ClientBalance[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [clients, setClients] = useState<AccountingClient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientBalance | null>(null);
  
  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    description: '',
    amount: '',
    due_date: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    client_id: '',
    invoice_id: '',
    amount: '',
    payment_method: 'cash' as const,
    description: ''
  });
  
  const [saving, setSaving] = useState(false);
  
  // Date filter states for reports
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // İlk gün
    endDate: new Date().toISOString().split('T')[0] // Bugün
  });
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadData();
  }, []);
  
  // Filter data when date range changes
  useEffect(() => {
    if (invoices.length > 0 || payments.length > 0) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      
      setFilteredInvoices(invoices.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date >= start && date <= end;
      }));
      
      setFilteredPayments(payments.filter(pay => {
        const date = new Date(pay.payment_date);
        return date >= start && date <= end;
      }));
    }
  }, [dateRange, invoices, payments]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        summaryData,
        balancesData,
        unpaidData,
        revenueData,
        clientsData,
        invoicesData,
        paymentsData
      ] = await Promise.all([
        accounting.reports.getSummary(),
        accounting.clients.getBalances(),
        accounting.invoices.getUnpaid(),
        accounting.reports.getMonthlyRevenue(),
        accounting.clients.getAll(),
        accounting.invoices.getAll(),
        accounting.payments.getAll()
      ]);
      
      setSummary(summaryData);
      setClientBalances(balancesData);
      setUnpaidInvoices(unpaidData);
      setMonthlyRevenue(revenueData);
      setClients(clientsData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.client_id || !invoiceForm.description || !invoiceForm.amount) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }
    
    setSaving(true);
    try {
      await accounting.invoices.create({
        client_id: invoiceForm.client_id,
        description: invoiceForm.description,
        amount: parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date || undefined
      });
      toast.success('Fatura başarıyla oluşturuldu');
      setShowInvoiceModal(false);
      setInvoiceForm({ client_id: '', description: '', amount: '', due_date: '' });
      loadData();
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      toast.error('Fatura oluşturulamadı');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentForm.client_id || !paymentForm.amount) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }
    
    setSaving(true);
    try {
      await accounting.payments.create({
        client_id: paymentForm.client_id,
        invoice_id: paymentForm.invoice_id || undefined,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        description: paymentForm.description || undefined
      });
      toast.success('Ödeme başarıyla kaydedildi');
      setShowPaymentModal(false);
      setPaymentForm({ client_id: '', invoice_id: '', amount: '', payment_method: 'cash', description: '' });
      loadData();
    } catch (error) {
      console.error('Ödeme kaydetme hatası:', error);
      toast.error('Ödeme kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleViewTransactions = async (client: ClientBalance) => {
    setSelectedClient(client);
    try {
      const data = await accounting.reports.getClientTransactions(client.client_id);
      setTransactions(data);
      setShowTransactionsModal(true);
    } catch (error) {
      console.error('İşlem geçmişi yükleme hatası:', error);
      toast.error('İşlem geçmişi yüklenemedi');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: 'ri-pie-chart-line' },
    { id: 'invoices', label: 'Faturalar', icon: 'ri-file-list-3-line' },
    { id: 'payments', label: 'Ödemeler', icon: 'ri-money-dollar-circle-line' },
    { id: 'clients', label: 'Cari Hesaplar', icon: 'ri-wallet-3-line' },
    { id: 'reports', label: 'Raporlar', icon: 'ri-bar-chart-box-line' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Muhasebe & Cari</h2>
          <p className="text-gray-600 mt-1">Fatura, ödeme ve cari hesap yönetimi</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="ri-file-add-line"></i>
            Fatura Oluştur
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="ri-money-dollar-circle-line"></i>
            Ödeme Al
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as SubTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#D4AF37] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeSubTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Danışan</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalClients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <i className="ri-funds-line text-2xl text-red-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Alacak</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalBalance)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <i className="ri-file-warning-line text-2xl text-yellow-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ödenmemiş Fatura</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.unpaidInvoiceCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="ri-calendar-check-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bu Ay Gelir</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.thisMonthRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Invoices */}
          {unpaidInvoices.filter(inv => inv.due_status === 'overdue').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <i className="ri-alarm-warning-line"></i>
                Vadesi Geçmiş Faturalar ({unpaidInvoices.filter(inv => inv.due_status === 'overdue').length})
              </h3>
              <div className="space-y-2">
                {unpaidInvoices.filter(inv => inv.due_status === 'overdue').slice(0, 5).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{inv.client_name}</p>
                      <p className="text-sm text-gray-600">{inv.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(inv.remaining_amount)}</p>
                      <p className="text-xs text-red-500">{inv.days_overdue} gün gecikmiş</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Son Ödemeler</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz ödeme kaydı yok</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-green-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.client_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(payment.payment_date)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">+{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Tüm Faturalar</h3>
          </div>
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="ri-file-list-3-line text-4xl mb-2"></i>
              <p>Henüz fatura yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danışan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödenen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{invoice.invoice_no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.client_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{invoice.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(invoice.paid_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status === 'paid' ? 'Ödendi' :
                           invoice.status === 'partial' ? 'Kısmi' :
                           invoice.status === 'cancelled' ? 'İptal' : 'Ödenmedi'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.invoice_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Tüm Ödemeler</h3>
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="ri-money-dollar-circle-line text-4xl mb-2"></i>
              <p>Henüz ödeme yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Makbuz No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danışan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yöntem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{payment.receipt_no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.client_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">+{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.payment_method === 'cash' ? 'Nakit' :
                         payment.payment_method === 'credit_card' ? 'Kredi Kartı' :
                         payment.payment_method === 'bank_transfer' ? 'Havale/EFT' : 'Diğer'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{payment.invoice_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clients Tab (Cari Hesaplar) */}
      {activeSubTab === 'clients' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Cari Hesaplar</h3>
          </div>
          {clientBalances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="ri-wallet-3-line text-4xl mb-2"></i>
              <p>Henüz danışan yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danışan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Borç</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Ödeme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bakiye</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödenmemiş</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientBalances.map(client => (
                    <tr key={client.client_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.full_name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(client.total_debt)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(client.total_paid)}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        <span className={client.balance > 0 ? 'text-red-600' : client.balance < 0 ? 'text-green-600' : 'text-gray-600'}>
                          {formatCurrency(client.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          client.balance_status === 'Borçlu' ? 'bg-red-100 text-red-700' :
                          client.balance_status === 'Alacaklı' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {client.balance_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">{client.unpaid_invoice_count} fatura</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewTransactions(client)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <i className="ri-file-list-line mr-1"></i>
                          Ekstre
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-calendar-line text-[#D4AF37]"></i>
              Tarih Aralığı Seçin
            </h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    setDateRange({
                      startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Bu Ay
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    setDateRange({
                      startDate: lastMonth.toISOString().split('T')[0],
                      endDate: lastMonthEnd.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Geçen Ay
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    setDateRange({
                      startDate: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Bu Yıl
                </button>
                <button
                  onClick={() => {
                    setDateRange({
                      startDate: '2020-01-01',
                      endDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] text-sm"
                >
                  Tümü
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i className="ri-file-list-3-line text-2xl text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kesilen Fatura</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-box-line text-2xl text-red-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Fatura Tutarı</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="ri-wallet-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alınan Ödeme</p>
                  <p className="text-2xl font-bold text-green-600">{filteredPayments.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="ri-funds-box-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(filteredPayments.reduce((sum, pay) => sum + pay.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown for Date Range */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ödeme Yöntemi Dağılımı (Seçilen Tarih Aralığı)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <i className="ri-money-dollar-box-line text-2xl text-green-600 mb-2"></i>
                <p className="text-sm text-gray-600">Nakit</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(filteredPayments.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.payment_method === 'cash').length} işlem
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <i className="ri-bank-card-line text-2xl text-blue-600 mb-2"></i>
                <p className="text-sm text-gray-600">Kredi Kartı</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(filteredPayments.filter(p => p.payment_method === 'credit_card').reduce((sum, p) => sum + p.amount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.payment_method === 'credit_card').length} işlem
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <i className="ri-exchange-line text-2xl text-purple-600 mb-2"></i>
                <p className="text-sm text-gray-600">Havale/EFT</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(filteredPayments.filter(p => p.payment_method === 'bank_transfer').reduce((sum, p) => sum + p.amount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.payment_method === 'bank_transfer').length} işlem
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <i className="ri-more-line text-2xl text-gray-600 mb-2"></i>
                <p className="text-sm text-gray-600">Diğer</p>
                <p className="text-lg font-bold text-gray-600">
                  {formatCurrency(filteredPayments.filter(p => p.payment_method === 'other').reduce((sum, p) => sum + p.amount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPayments.filter(p => p.payment_method === 'other').length} işlem
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Report Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoices in Date Range */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Faturalar ({filteredInvoices.length})</h3>
                <span className="text-sm text-gray-500">
                  {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {filteredInvoices.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="ri-file-list-3-line text-3xl mb-2"></i>
                    <p>Bu tarih aralığında fatura yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredInvoices.map(inv => (
                      <div key={inv.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm text-gray-900">{inv.invoice_no}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inv.status === 'paid' ? 'Ödendi' : inv.status === 'partial' ? 'Kısmi' : 'Ödenmedi'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{inv.client_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatDate(inv.invoice_date)}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(inv.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payments in Date Range */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Ödemeler ({filteredPayments.length})</h3>
                <span className="text-sm text-green-600 font-medium">
                  +{formatCurrency(filteredPayments.reduce((sum, pay) => sum + pay.amount, 0))}
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {filteredPayments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="ri-money-dollar-circle-line text-3xl mb-2"></i>
                    <p>Bu tarih aralığında ödeme yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredPayments.map(pay => (
                      <div key={pay.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm text-gray-900">{pay.receipt_no}</span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {pay.payment_method === 'cash' ? 'Nakit' :
                             pay.payment_method === 'credit_card' ? 'Kart' :
                             pay.payment_method === 'bank_transfer' ? 'Havale' : 'Diğer'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{pay.client_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatDate(pay.payment_date)}</span>
                          <span className="font-medium text-green-600">+{formatCurrency(pay.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Aylık Gelir Raporu (Tüm Zamanlar)</h3>
            {monthlyRevenue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz veri yok</p>
            ) : (
              <div className="space-y-3">
                {monthlyRevenue.slice(0, 12).map(month => (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(month.month).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
                        style={{ width: `${Math.min((month.total_revenue / (monthlyRevenue[0]?.total_revenue || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="w-32 text-right font-medium text-gray-900">
                      {formatCurrency(month.total_revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Fatura Oluştur</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danışan *</label>
                <select
                  value={invoiceForm.client_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="">Danışan seçin</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Örn: 4 Seans Terapi Paketi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺) *</label>
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vade Tarihi</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Oluşturuluyor...' : 'Fatura Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Ödeme Al</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danışan *</label>
                <select
                  value={paymentForm.client_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, client_id: e.target.value, invoice_id: '' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="">Danışan seçin</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.full_name}</option>
                  ))}
                </select>
              </div>
              {paymentForm.client_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fatura (Opsiyonel)</label>
                  <select
                    value={paymentForm.invoice_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  >
                    <option value="">Genel ödeme</option>
                    {invoices.filter(inv => inv.client_id === paymentForm.client_id && inv.status !== 'paid').map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_no} - {inv.description} ({formatCurrency(inv.amount - inv.paid_amount)} kalan)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                >
                  <option value="cash">Nakit</option>
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="bank_transfer">Havale/EFT</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Opsiyonel not"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Ödeme Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal (Ekstre) */}
      {showTransactionsModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-auto max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Hesap Ekstresi</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient.full_name}</p>
                </div>
                <button onClick={() => setShowTransactionsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Balance Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600">Toplam Borç</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(selectedClient.total_debt)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600">Toplam Ödeme</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(selectedClient.total_paid)}</p>
                </div>
                <div className={`p-4 rounded-xl text-center ${selectedClient.balance > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                  <p className="text-sm text-gray-600">Bakiye</p>
                  <p className={`text-lg font-bold ${selectedClient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(selectedClient.balance)}
                  </p>
                </div>
              </div>

              {/* Transactions List */}
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz işlem yok</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      tx.transaction_type === 'payment' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.transaction_type === 'payment' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <i className={tx.transaction_type === 'payment' ? 'ri-add-line text-green-600' : 'ri-subtract-line text-red-600'}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">{tx.reference_no} • {formatDate(tx.transaction_date)}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${tx.transaction_type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.transaction_type === 'payment' ? '+' : '-'}{formatCurrency(tx.credit || tx.debit)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
