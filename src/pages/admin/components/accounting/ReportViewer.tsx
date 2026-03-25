import { useState } from 'react';
import type { MonthlyRevenue } from '../../../../lib/finance/types';
import { useToast } from '../../../../components/ToastContainer';

interface ReportViewerProps {
    monthlyRevenue: MonthlyRevenue[];
    summary: any;
}

export default function ReportViewer({ monthlyRevenue, summary }: ReportViewerProps) {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-pie-chart-line text-[#D4AF37]"></i>
                    Finansal Özet
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Summary Cards */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Toplam Borç</p>
                        <p className="text-xl font-bold text-blue-700">{formatCurrency(summary?.totalDebt || 0)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Toplam Tahsilat</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(summary?.totalPaid || 0)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Bekleyen Alacak</p>
                        <p className="text-xl font-bold text-yellow-700">{formatCurrency(summary?.totalBalance || 0)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">Bu Ay Gelir</p>
                        <p className="text-xl font-bold text-purple-700">{formatCurrency(summary?.thisMonthRevenue || 0)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Aylık Gelir Tablosu</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ay</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fatura Adedi</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam Gelir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {monthlyRevenue.map((rev, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{rev.month}</td>
                                    <td className="px-4 py-2">{rev.invoice_count}</td>
                                    <td className="px-4 py-2 font-medium text-green-600">{formatCurrency(rev.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
