import React, { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    FileDown,
    FileSpreadsheet,

    const loadCashRegister = () => {
        const cash = getCashRegister();
        setCashRegister(cash);
        setTempBalance(cash.initialBalance.toString());
    };

const handleSaveBalance = () => {
    const newBalance = parseFloat(tempBalance);
    if (isNaN(newBalance) || newBalance < 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    setInitialBalance(newBalance);
    loadCashRegister();
    setEditingBalance(false);
};

const handleCancelEdit = () => {
    setTempBalance(cashRegister.initialBalance.toString());
    setEditingBalance(false);
};

const allSales = getSales();

const filteredSales = allSales.filter(sale => {
    if (!startDate && !endDate) return true;
    const saleDate = new Date(sale.createdAt);
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    return saleDate >= start && saleDate <= end;
});

const totalVentas = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
const numeroTransacciones = filteredSales.length;
const promedioVenta = numeroTransacciones > 0 ? totalVentas / numeroTransacciones : 0;

const ingresos = totalVentas;
const egresos = cashRegister.expenses.reduce((sum, e) => sum + e.amount, 0);
const utilidad = ingresos - egresos;
const saldoFinal = cashRegister.initialBalance + totalVentas - egresos;

const handleExportPDF = () => {
    const start = startDate || 'Inicio';
    const end = endDate || 'Hoy';
    exportSalesToPDF(filteredSales, start, end);
};

const handleExportExcel = () => {
    exportSalesToExcel(filteredSales);
};

return (
    <div className="space-y-6">
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
                        className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600">Utilidad</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(utilidad)}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Análisis Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingresos vs Egresos */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Ingresos vs Egresos</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Ingresos</p>
                                <p className="text-xl font-bold text-green-700">{formatCurrency(ingresos)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Egresos</p>
                                <p className="text-xl font-bold text-red-700">{formatCurrency(egresos)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-600">Utilidad Neta</p>
                                <p className="text-xl font-bold text-blue-700">{formatCurrency(utilidad)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Caja Diaria */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Caja Diaria</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Saldo Inicial</span>
                        {editingBalance ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempBalance}
                                    onChange={(e) => setTempBalance(e.target.value)}
                                    step="0.01"
                                    className="w-32 px-2 py-1 bg-white text-slate-900 rounded border border-slate-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    onClick={handleSaveBalance}
                                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">{formatCurrency(cashRegister.initialBalance)}</span>
                                <button
                                    onClick={() => setEditingBalance(true)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">+ Ingresos del Día</span>
                        <span className="text-sm font-bold text-green-700">{formatCurrency(totalVentas)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">- Egresos del Día</span>
                        <span className="text-sm font-bold text-red-700">{formatCurrency(egresos)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <span className="text-sm font-medium text-white">Saldo Final</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(saldoFinal)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Historial de Ventas */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Historial de Ventas</h3>
            </div>
            <div className="overflow-x-auto">
                {filteredSales.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hora</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Productos</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cantidad</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {new Date(sale.createdAt).toLocaleDateString('es-NI')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(sale.createdAt).toLocaleTimeString('es-NI')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        {sale.items.map(i => i.name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                        {formatCurrency(sale.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-medium">No hay ventas registradas</p>
                        <p className="text-slate-400 text-sm mt-2">Las ventas aparecerán aquí cuando se registren</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}
