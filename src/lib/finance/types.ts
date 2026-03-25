export interface Invoice {
    id: string;
    client_id: string;
    client_name?: string;
    invoice_no: string;
    amount: number;
    currency?: string;
    description: string;
    invoice_date: string;
    due_date: string;
    status: 'paid' | 'unpaid' | 'partial' | 'cancelled' | 'overdue';
    is_paid: boolean;
    paid_amount: number;
    created_at: string;
}

export interface Payment {
    id: string;
    client_id: string;
    client_name?: string;
    invoice_id?: string;
    invoice_no?: string;
    amount: number;
    currency?: string;
    payment_date: string;
    payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'other';
    description?: string;
    receipt_no?: string;
    created_at: string;
}

export interface ClientBalance {
    client_id: string;
    client_name: string;
    total_debt: number;
    total_paid: number;
    balance: number;
    last_payment_date?: string;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'invoice' | 'payment';
    description: string;
    amount: number;
    balance_after: number;
}

export interface UnpaidInvoice extends Invoice {
    days_overdue: number;
    remaining_amount?: number;
    due_status?: 'upcoming' | 'due_today' | 'overdue';
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    invoice_count: number;
}
