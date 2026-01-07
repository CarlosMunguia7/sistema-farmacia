import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    FileDown,
    FileSpreadsheet,
    ShoppingCart,
    Wallet
} from 'lucide-react';
import {
    getSales,
    initializeSampleSales,
    getCashRegister // Needed for Net Income calculation (Expenses)
} from '../lib/storage';
import { exportSalesToPDF, exportSalesToExcel } from '../lib/export';
import { formatCurrency } from '../lib/utils';

export default function Reportes() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('ventas');
    // We still need expenses to calculate Net Income for the report, even if we don't manage them here.
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        initializeSampleSales();
        const cash = getCashRegister();
        setExpenses(cash.expenses || []);
    }, []);

    const allSales = getSales();

    const filteredSales = allSales.filter(sale => {
        if (!startDate && !endDate) return true;
        const saleDate = new Date(sale.createdAt);

        // Ajustar fechas para cubrir el día completo en zona horaria local
        let start = startDate ? new Date(startDate + 'T00:00:00') : new Date('2000-01-01');
        let end = endDate ? new Date(endDate + 'T23:59:59.999') : new Date('2100-12-31');

        return saleDate >= start && saleDate <= end;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalVentas = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const numeroTransacciones = filteredSales.length;
    const promedioVenta = numeroTransacciones > 0 ? totalVentas / numeroTransacciones : 0;

    // Filter expenses if they have createdAt to match the date range
    const filteredExpenses = expenses.filter(expense => {
        if (!startDate && !endDate) return true;

        // If expense doesn't have createdAt, include it? Or exclude? 
        // Existing expenses might not have it. Let's assume they do or fallback to include if unknown.
        // Actually earlier code added createdAt to expenses.
        if (!expense.createdAt) return true;

        const expenseDate = new Date(expense.createdAt);
        let start = startDate ? new Date(startDate + 'T00:00:00') : new Date('2000-01-01');
        let end = endDate ? new Date(endDate + 'T23:59:59.999') : new Date('2100-12-31');
        return expenseDate >= start && expenseDate <= end;
    });

    const totalEgresosFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const utilidadFiltered = totalVentas - totalEgresosFiltered;

    const handleExportPDF = () => {
        const start = startDate || 'Inicio';
        const end = endDate || 'Hoy';
        exportSalesToPDF(filteredSales, start, end);
    };

    const handleExportExcel = () => {
        exportSalesToExcel(filteredSales);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Reportes</h2>
                <p className="text-slate-500 mt-1">Análisis financiero y reportes del sistema</p>
            </div>

            {/* Filtros */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de Reporte
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ventas">Ventas</option>
                            <option value="financiero">Financiero</option>
                            <option value="productos">Productos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            onClick={(e) => e.target.showPicker()}
                            className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onClick={(e) => e.target.showPicker()}
                            className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Ventas</p>
                            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalVentas)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Transacciones</p>
                            <p className="text-2xl font-bold text-slate-800">{numeroTransacciones}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Promedio Venta</p>
                            <p className="text-2xl font-bold text-slate-800">{formatCurrency(promedioVenta)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Utilidad Neta</p>
                            <p className="text-2xl font-bold text-slate-800">{formatCurrency(utilidadFiltered)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado de Ventas Recientes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Historial de Ventas</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Productos</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron ventas en este período.
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800">
                                            <div className="bg-slate-100 rounded-lg p-2 inline-block max-w-md truncate">
                                                {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            {formatCurrency(sale.total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
