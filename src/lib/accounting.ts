/**
 * 💰 Danışan Muhasebe Sistemi API
 * Supabase ile entegre cari hesap yönetimi
 */

import { supabase } from './supabase';
import type { 
  Invoice, 
  Payment, 
  ClientBalance, 
  Transaction, 
  UnpaidInvoice, 
  MonthlyRevenue 
} from '../types';

// Re-export types for convenience
export type { Invoice, Payment, ClientBalance, Transaction, UnpaidInvoice, MonthlyRevenue };

// Accounting Client type (extended from base Client)
export interface AccountingClient {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  register_date: string;
  notes?: string;
  total_debt: number;
  total_paid: number;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// 👤 DANIŞAN (CLIENT) API
// ============================================

export const accountingClientsApi = {
  /**
   * Tüm danışanları getir
   */
  async getAll(activeOnly = true): Promise<AccountingClient[]> {
    let query = supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // name ve full_name uyumluluğu
    return (data || []).map(client => ({
      ...client,
      full_name: client.full_name || client.name || 'İsimsiz',
      name: client.name || client.full_name || 'İsimsiz'
    }));
  },

  /**
   * Tek danışan getir
   */
  async getById(id: string): Promise<AccountingClient | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      full_name: data.full_name || data.name || 'İsimsiz',
      name: data.name || data.full_name || 'İsimsiz'
    };
  },

  /**
   * Yeni danışan oluştur
   */
  async create(client: Omit<AccountingClient, 'id' | 'total_debt' | 'total_paid' | 'balance' | 'created_at' | 'updated_at'>): Promise<AccountingClient> {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Danışan güncelle
   */
  async update(id: string, updates: Partial<AccountingClient>): Promise<AccountingClient> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Danışanı pasif yap (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Danışan bakiyelerini getir
   */
  async getBalances(): Promise<ClientBalance[]> {
    // Önce view'dan dene, yoksa clients tablosundan hesapla
    try {
      const { data, error } = await supabase
        .from('client_balances')
        .select('*')
        .order('balance', { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.log('client_balances view not found, using clients table');
    }
    
    // Fallback: clients tablosundan hesapla
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (clientsError) throw clientsError;
    
    return (clients || []).map(c => ({
      client_id: c.id,
      full_name: c.full_name || c.name || c.email,
      email: c.email,
      phone: c.phone,
      total_debt: c.total_debt || 0,
      total_paid: c.total_paid || 0,
      balance: (c.total_debt || 0) - (c.total_paid || 0),
      balance_status: (c.total_debt || 0) - (c.total_paid || 0) > 0 ? 'Borçlu' : 
                      (c.total_debt || 0) - (c.total_paid || 0) < 0 ? 'Alacaklı' : 'Dengeli',
      unpaid_invoice_count: 0,
      is_active: c.is_active
    }));
  },

  /**
   * Borçlu danışanları getir
   */
  async getDebtors(): Promise<ClientBalance[]> {
    const balances = await this.getBalances();
    return balances.filter(b => b.balance > 0);
  }
};

// ============================================
// 🧾 FATURA (INVOICE) API
// ============================================

export const invoicesApi = {
  /**
   * Tüm faturaları getir
   */
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients(name, full_name)
      `)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(inv => ({
      ...inv,
      client_name: inv.clients?.full_name || inv.clients?.name || 'İsimsiz'
    }));
  },

  /**
   * Danışanın faturalarını getir
   */
  async getByClient(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('invoice_date', { ascending: false });

    if (error) {
      console.error('Fatura yükleme hatası:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Tek fatura getir
   */
  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients(name, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? { ...data, client_name: data.clients?.full_name || data.clients?.name || 'İsimsiz' } : null;
  },

  /**
   * Yeni fatura oluştur (danışana borç yaz)
   */
  async create(invoice: {
    client_id: string;
    description: string;
    amount: number;
    currency?: 'TRY' | 'USD' | 'EUR';
    invoice_date?: string;
    due_date?: string;
  }): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        currency: invoice.currency || 'TRY',
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fatura güncelle
   */
  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fatura iptal et
   */
  async cancel(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Ödenmemiş faturaları getir
   */
  async getUnpaid(): Promise<UnpaidInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('unpaid_invoices')
        .select('*');

      if (!error && data) return data;
    } catch (e) {
      console.log('unpaid_invoices view not found, using invoices table');
    }
    
    // Fallback: invoices tablosundan hesapla
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`*, clients(full_name, name, email)`)
      .in('status', ['unpaid', 'partial'])
      .order('due_date', { ascending: true });
    
    if (invoicesError) {
      console.error('Ödenmemiş fatura yükleme hatası:', invoicesError);
      return [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    return (invoices || []).map(inv => ({
      id: inv.id,
      client_id: inv.client_id,
      client_name: inv.clients?.full_name || inv.clients?.name || inv.clients?.email || 'Bilinmeyen',
      invoice_no: inv.invoice_no,
      description: inv.description,
      amount: inv.amount,
      paid_amount: inv.paid_amount || 0,
      remaining_amount: inv.amount - (inv.paid_amount || 0),
      status: inv.status,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      due_status: !inv.due_date ? 'upcoming' : 
                  inv.due_date < today ? 'overdue' : 
                  inv.due_date === today ? 'due_today' : 'upcoming',
      days_overdue: !inv.due_date || inv.due_date >= today ? 0 : 
                    Math.floor((new Date(today).getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
    }));
  },

  /**
   * Vadesi geçmiş faturaları getir
   */
  async getOverdue(): Promise<UnpaidInvoice[]> {
    const unpaid = await this.getUnpaid();
    return unpaid.filter(inv => inv.due_status === 'overdue');
  }
};

// ============================================
// 💳 ÖDEME (PAYMENT) API
// ============================================

export const paymentsApi = {
  /**
   * Tüm ödemeleri getir
   */
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        clients(name, full_name),
        invoices(invoice_no)
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(pmt => ({
      ...pmt,
      client_name: pmt.clients?.full_name || pmt.clients?.name || 'İsimsiz',
      invoice_no: pmt.invoices?.invoice_no
    }));
  },

  /**
   * Danışanın ödemelerini getir
   */
  async getByClient(clientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoices(invoice_no)
      `)
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Ödeme yükleme hatası:', error);
      return [];
    }
    return (data || []).map(pmt => ({
      ...pmt,
      invoice_no: pmt.invoices?.invoice_no
    }));
  },

  /**
   * Ödeme al (danışandan tahsilat)
   */
  async create(payment: {
    client_id: string;
    amount: number;
    invoice_id?: string;
    currency?: 'TRY' | 'USD' | 'EUR';
    payment_method?: 'cash' | 'credit_card' | 'bank_transfer' | 'other';
    description?: string;
    payment_date?: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payment,
        currency: payment.currency || 'TRY',
        payment_method: payment.payment_method || 'cash',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Ödeme sil
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Tarih aralığında ödemeleri getir
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        clients(name, full_name)
      `)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(pmt => ({
      ...pmt,
      client_name: pmt.clients?.full_name || pmt.clients?.name || 'İsimsiz'
    }));
  }
};

// ============================================
// 📈 RAPORLAR API
// ============================================

export const reportsApi = {
  /**
   * Danışanın hareket dökümü (tarih filtreli)
   */
  async getClientTransactions(
    clientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Transaction[]> {
    // Önce view'dan dene
    try {
      let query = supabase
        .from('client_transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('transaction_date', { ascending: false });

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.log('client_transactions view not found, using fallback');
    }
    
    // Fallback: invoices ve payments'tan birleştir
    const transactions: Transaction[] = [];
    
    // Faturaları getir
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .neq('status', 'cancelled')
      .order('invoice_date', { ascending: false });
    
    (invoices || []).forEach(inv => {
      transactions.push({
        id: inv.id,
        client_id: inv.client_id,
        client_name: '', // View'da doldurulur
        transaction_type: 'invoice',
        reference_no: inv.invoice_no || '',
        description: inv.description,
        debit: inv.amount,
        credit: 0,
        status: inv.status,
        transaction_date: inv.invoice_date,
        created_at: inv.created_at
      });
    });
    
    // Ödemeleri getir
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });
    
    (payments || []).forEach(pmt => {
      transactions.push({
        id: pmt.id,
        client_id: pmt.client_id,
        client_name: '', // View'da doldurulur
        transaction_type: 'payment',
        reference_no: pmt.receipt_no || '',
        description: pmt.description || 'Ödeme',
        debit: 0,
        credit: pmt.amount,
        status: 'completed',
        transaction_date: pmt.payment_date,
        created_at: pmt.created_at
      });
    });
    
    // Tarihe göre sırala
    transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    
    return transactions;
  },

  /**
   * Danışanın kalan borcunu hesapla
   */
  async getClientBalance(clientId: string): Promise<{
    total_debt: number;
    total_paid: number;
    balance: number;
  }> {
    const { data, error } = await supabase
      .from('clients')
      .select('total_debt, total_paid')
      .eq('id', clientId)
      .single();

    if (error) throw error;
    return {
      total_debt: data?.total_debt || 0,
      total_paid: data?.total_paid || 0,
      balance: (data?.total_debt || 0) - (data?.total_paid || 0)
    };
  },

  /**
   * Aylık gelir raporu
   */
  async getMonthlyRevenue(year?: number): Promise<MonthlyRevenue[]> {
    // Önce view'dan dene
    try {
      let query = supabase
        .from('monthly_revenue')
        .select('*')
        .order('month', { ascending: false });

      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        query = query.gte('month', startDate).lte('month', endDate);
      }

      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.log('monthly_revenue view not found, using fallback');
    }
    
    // Fallback: payments tablosundan hesapla
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    
    if (paymentsError || !payments) return [];
    
    // Aylara göre grupla
    const monthlyData: { [key: string]: MonthlyRevenue } = {};
    
    payments.forEach(pmt => {
      const month = pmt.payment_date.substring(0, 7) + '-01'; // YYYY-MM-01 formatı
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          total_revenue: 0,
          cash_revenue: 0,
          card_revenue: 0,
          transfer_revenue: 0,
          payment_count: 0
        };
      }
      monthlyData[month].total_revenue += pmt.amount;
      monthlyData[month].payment_count += 1;
      
      if (pmt.payment_method === 'cash') {
        monthlyData[month].cash_revenue += pmt.amount;
      } else if (pmt.payment_method === 'credit_card') {
        monthlyData[month].card_revenue += pmt.amount;
      } else if (pmt.payment_method === 'bank_transfer') {
        monthlyData[month].transfer_revenue += pmt.amount;
      }
    });
    
    // Array'e çevir ve sırala
    return Object.values(monthlyData).sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  },

  /**
   * Genel özet istatistikler
   */
  async getSummary(): Promise<{
    totalClients: number;
    totalDebt: number;
    totalPaid: number;
    totalBalance: number;
    unpaidInvoiceCount: number;
    overdueInvoiceCount: number;
    thisMonthRevenue: number;
  }> {
    // Danışan sayısı ve toplam borç/ödeme
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('total_debt, total_paid')
      .eq('is_active', true);

    if (clientsError) throw clientsError;

    const totalClients = clientsData?.length || 0;
    const totalDebt = clientsData?.reduce((sum, c) => sum + (c.total_debt || 0), 0) || 0;
    const totalPaid = clientsData?.reduce((sum, c) => sum + (c.total_paid || 0), 0) || 0;

    // Ödenmemiş fatura sayısı
    const { count: unpaidCount, error: unpaidError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['unpaid', 'partial']);

    if (unpaidError) throw unpaidError;

    // Vadesi geçmiş fatura sayısı
    const { count: overdueCount, error: overdueError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['unpaid', 'partial'])
      .lt('due_date', new Date().toISOString().split('T')[0]);

    if (overdueError) throw overdueError;

    // Bu ayki gelir
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const { data: monthPayments, error: monthError } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', firstDayOfMonth)
      .lte('payment_date', lastDayOfMonth);

    if (monthError) throw monthError;

    const thisMonthRevenue = monthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      totalClients,
      totalDebt,
      totalPaid,
      totalBalance: totalDebt - totalPaid,
      unpaidInvoiceCount: unpaidCount || 0,
      overdueInvoiceCount: overdueCount || 0,
      thisMonthRevenue
    };
  }
};

// ============================================
// 🎯 HIZLI ERİŞİM - TEK FONKSİYON
// ============================================

export const accounting = {
  clients: accountingClientsApi,
  invoices: invoicesApi,
  payments: paymentsApi,
  reports: reportsApi
};

export default accounting;
