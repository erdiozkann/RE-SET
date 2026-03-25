import { supabase } from '../supabase';
import type {
    Invoice,
    Payment,
    ClientBalance,
    Transaction,
    UnpaidInvoice,
    MonthlyRevenue
} from './types';

export const financeService = {
    // CLIENT BALANCES
    async getClientBalances(): Promise<ClientBalance[]> {
        // Try view first
        try {
            const { data, error } = await supabase
                .from('client_balances')
                .select('*')
                .order('balance', { ascending: false });

            if (!error && data) return data;
        } catch (e) {
            console.log('client_balances view not found, using clients table');
        }

        // Fallback: Calculate from clients table
        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (clients || []).map(c => ({
            client_id: c.id,
            client_name: c.full_name || c.name || c.email,
            total_debt: c.total_debt || 0,
            total_paid: c.total_paid || 0,
            balance: (c.total_debt || 0) - (c.total_paid || 0),
            last_payment_date: c.updated_at // Approximate
        }));
    },

    async getClientBalance(clientId: string): Promise<ClientBalance | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('id, full_name, name, email, total_debt, total_paid')
            .eq('id', clientId)
            .single();

        if (error) return null;

        return {
            client_id: data.id,
            client_name: data.full_name || data.name || data.email,
            total_debt: data.total_debt || 0,
            total_paid: data.total_paid || 0,
            balance: (data.total_debt || 0) - (data.total_paid || 0)
        };
    },

    // INVOICES
    async getInvoices(clientId?: string): Promise<Invoice[]> {
        let query = supabase
            .from('invoices')
            .select('*, clients(name, full_name)')
            .order('invoice_date', { ascending: false });

        if (clientId) {
            query = query.eq('client_id', clientId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(inv => ({
            ...inv,
            client_name: inv.clients?.full_name || inv.clients?.name || 'İsimsiz'
        }));
    },

    async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'is_paid' | 'paid_amount' | 'invoice_no' | 'status' | 'invoice_date'>): Promise<Invoice> {
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                ...invoice,
                currency: 'TRY',
                status: 'unpaid',
                paid_amount: 0,
                invoice_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        await this.updateClientTotals(invoice.client_id);
        return data;
    },

    // PAYMENTS
    async getPayments(clientId?: string): Promise<Payment[]> {
        let query = supabase
            .from('payments')
            .select(`
        *,
        clients(name, full_name),
        invoices(invoice_no)
      `)
            .order('payment_date', { ascending: false });

        if (clientId) {
            query = query.eq('client_id', clientId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data || []).map(pmt => ({
            ...pmt,
            client_name: pmt.clients?.full_name || pmt.clients?.name || 'İsimsiz',
            invoice_no: pmt.invoices?.invoice_no
        }));
    },

    async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                ...payment,
                currency: 'TRY'
            })
            .select()
            .single();

        if (error) throw error;

        if (payment.invoice_id) {
            await this.updateInvoiceStatus(payment.invoice_id);
        }
        await this.updateClientTotals(payment.client_id);
        return data;
    },

    // INTERNAL HELPERS
    async updateClientTotals(clientId: string): Promise<void> {
        const { data: invoices } = await supabase
            .from('invoices')
            .select('amount')
            .eq('client_id', clientId)
            .neq('status', 'cancelled');

        const totalDebt = (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);

        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('client_id', clientId);

        const totalPaid = (payments || []).reduce((sum, pmt) => sum + (pmt.amount || 0), 0);

        await supabase
            .from('clients')
            .update({
                total_debt: totalDebt,
                total_paid: totalPaid,
                updated_at: new Date().toISOString()
            })
            .eq('id', clientId);
    },

    async updateInvoiceStatus(invoiceId: string): Promise<void> {
        const { data: invoice } = await supabase
            .from('invoices')
            .select('amount')
            .eq('id', invoiceId)
            .single();

        if (!invoice) return;

        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('invoice_id', invoiceId);

        const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        let newStatus = 'unpaid';
        if (totalPaid >= invoice.amount) newStatus = 'paid';
        else if (totalPaid > 0) newStatus = 'partial';

        await supabase
            .from('invoices')
            .update({
                paid_amount: totalPaid,
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', invoiceId);
    },

    // REPORTS & SUMMARIES
    async getUnpaidInvoices(): Promise<UnpaidInvoice[]> {
        try {
            const { data, error } = await supabase
                .from('unpaid_invoices')
                .select('*');

            if (!error && data) return data as any;
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
            is_paid: false,
            created_at: inv.created_at,
            due_status: !inv.due_date ? 'upcoming' :
                inv.due_date < today ? 'overdue' :
                    inv.due_date === today ? 'due_today' : 'upcoming',
            days_overdue: !inv.due_date || inv.due_date >= today ? 0 :
                Math.floor((new Date(today).getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
        }));
    },

    async getMonthlyRevenue(year?: number): Promise<MonthlyRevenue[]> {
        // Fallback: payments tablosundan hesapla
        const query = supabase
            .from('payments')
            .select('*')
            .order('payment_date', { ascending: false });

        // If year filtering is needed in future, add it here

        const { data: payments, error: paymentsError } = await query;

        if (paymentsError || !payments) return [];

        // Aylara göre grupla
        const monthlyData: { [key: string]: MonthlyRevenue } = {};

        payments.forEach(pmt => {
            const month = pmt.payment_date.substring(0, 7) + '-01'; // YYYY-MM-01 formatı
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    revenue: 0,
                    invoice_count: 0
                };
            }
            monthlyData[month].revenue += pmt.amount;
            monthlyData[month].invoice_count += 1;
        });

        // Array'e çevir ve sırala
        return Object.values(monthlyData).sort((a, b) =>
            new Date(b.month).getTime() - new Date(a.month).getTime()
        );
    },

    async getSummary(): Promise<{
        totalClients: number;
        totalDebt: number;
        totalPaid: number;
        totalBalance: number;
        unpaidInvoiceCount: number;
        overdueInvoiceCount: number;
        thisMonthRevenue: number;
    }> {
        const { data: clientsData } = await supabase
            .from('clients')
            .select('total_debt, total_paid')
            .eq('is_active', true);

        const totalClients = clientsData?.length || 0;
        const totalDebt = clientsData?.reduce((sum, c) => sum + (c.total_debt || 0), 0) || 0;
        const totalPaid = clientsData?.reduce((sum, c) => sum + (c.total_paid || 0), 0) || 0;

        const { count: unpaidCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .in('status', ['unpaid', 'partial']);

        const { count: overdueCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .in('status', ['unpaid', 'partial'])
            .lt('due_date', new Date().toISOString().split('T')[0]);

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0];
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            .toISOString().split('T')[0];

        const { data: monthPayments } = await supabase
            .from('payments')
            .select('amount')
            .gte('payment_date', firstDayOfMonth)
            .lte('payment_date', lastDayOfMonth);

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
