import React from 'react';
import type { Client, Invoice, Payment, Appointment } from '../../../../types';

interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    invoices: Invoice[];
    payments: Payment[];
    appointments: Appointment[];
    onAddInvoice: () => void;
    onAddPayment: () => void;
    onEditClient: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
    isOpen,
    onClose,
    client,
    invoices,
    payments,
    appointments,
    onAddInvoice,
    onAddPayment,
    onEditClient
}) => {
    const [detailTab, setDetailTab] = React.useState<'info' | 'appointments' | 'account'>('account');

    if (!isOpen || !client) return null;

    const calculateBalance = () => {
        const totalDebt = invoices
            .filter(inv => inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + inv.amount, 0);

        const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);

        return {
            totalDebt,
            totalPaid,
            balance: totalDebt - totalPaid
        };
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-auto animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center text-xl font-bold">
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                            <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className="ri-close-line text-xl text-gray-500"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6">
                    <button
                        onClick={() => setDetailTab('info')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${detailTab === 'info'
                            ? 'border-[#D4AF37] text-[#D4AF37]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                    >
                        Genel Bilgiler
                    </button>
                    <button
                        onClick={() => setDetailTab('appointments')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${detailTab === 'appointments'
                            ? 'border-[#D4AF37] text-[#D4AF37]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                    >
                        Randevular
                        <span className="bg-gray-100 text-gray-600 px-2 pl-2 py-0.5 rounded-full text-xs">
                            {appointments.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setDetailTab('account')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${detailTab === 'account'
                            ? 'border-[#D4AF37] text-[#D4AF37]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                            }`}
                    >
                        Hesap & Bakiye
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Info Tab */}
                    {detailTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">İletişim Bilgileri</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <i className="ri-phone-line text-gray-400"></i>
                                            <span className="text-gray-900">{client.phone || 'Girilmemiş'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <i className="ri-mail-line text-gray-400"></i>
                                            <span className="text-gray-900">{client.email || 'Girilmemiş'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Kayıt Bilgileri</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Kayıt Tarihi</span>
                                            <span className="font-medium text-gray-900">
                                                {client.created_at ? new Date(client.created_at).toLocaleDateString('tr-TR') : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {client.notes && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Özel Notlar</h4>
                                    <div className="bg-yellow-50 rounded-xl p-4">
                                        <p className="text-gray-800 whitespace-pre-wrap">{client.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {detailTab === 'appointments' && (
                        <div>
                            {appointments.length === 0 ? (
                                <div className="text-center py-12">
                                    <i className="ri-calendar-line text-5xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">Henüz randevu yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.map((appt) => (
                                        <div key={appt.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                            <div>
                                                <p className="font-medium text-gray-900">{appt.serviceTitle}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(appt.date).toLocaleDateString('tr-TR')} - {appt.time}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
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
                                    onClick={onAddInvoice}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                                >
                                    <i className="ri-file-add-line"></i>
                                    Fatura/Borç Ekle
                                </button>
                                <button
                                    onClick={onAddPayment}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
                                >
                                    <i className="ri-money-dollar-circle-line"></i>
                                    Ödeme Al
                                </button>
                            </div>

                            {/* Invoices */}
                            <div>
                                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Faturalar ({invoices.length})</h5>
                                {invoices.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 border border-dashed border-gray-200">
                                        <i className="ri-file-list-line text-3xl mb-2 block"></i>
                                        Henüz fatura yok
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {invoices.map((invoice) => (
                                            <div key={invoice.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{invoice.description}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {invoice.invoice_no} • {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">{invoice.amount.toLocaleString('tr-TR')} ₺</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
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
                                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ödemeler ({payments.length})</h5>
                                {payments.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 border border-dashed border-gray-200">
                                        <i className="ri-money-dollar-circle-line text-3xl mb-2 block"></i>
                                        Henüz ödeme yok
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {payments.map((payment) => (
                                            <div key={payment.id} className="bg-green-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
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

                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
                    <button
                        onClick={() => {
                            onClose();
                            onEditClient(client);
                        }}
                        className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <i className="ri-edit-line"></i>
                        Düzenle
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] shadow-md shadow-[#D4AF37]/20 transition-all"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};
