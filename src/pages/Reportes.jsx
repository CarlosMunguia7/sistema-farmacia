import React, { useState, useEffect } from 'react';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    FileDown,
    FileSpreadsheet,
    ShoppingCart,
    Wallet,
    Edit2,
    Save,
    X,
    Plus,
    Trash2,
    Database,
    Download,
    Upload
} from 'lucide-react';
import {
    getSales,
    initializeSampleSales,
    getCashRegister,
    setInitialBalance,
    addExpense,
    deleteExpense,
    createBackup,
    restoreBackup
} from '../lib/storage';
import { exportSalesToPDF, exportSalesToExcel } from '../lib/export';
import { formatCurrency } from '../lib/utils';

export default function Reportes() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('ventas');
    const [cashRegister, setCashRegister] = useState({ initialBalance: 1200.00, expenses: [] });
    const [editingBalance, setEditingBalance] = useState(false);
    const [tempBalance, setTempBalance] = useState('1200.00');
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseData, setExpenseData] = useState({ description: '', amount: '' });

    useEffect(() => {
        initializeSampleSales();
        loadCashRegister();
    }, []);

    const loadCashRegister = () => {
        const cash = getCashRegister();
        // Asegurar que expenses sea un array
        if (!cash.expenses) cash.expenses = [];
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

    const handleAddExpense = () => {
        console.log('Intentando registrar egreso:', expenseData);
        if (!expenseData.description || !expenseData.amount) {
            alert('Por favor completa todos los campos');
            return;
        }

        const amount = parseFloat(expenseData.amount);
        if (isNaN(amount) || amount <= 0) {
            alert('Ingresa un monto válido');
            return;
        }

        try {
            addExpense({
                description: expenseData.description,
                amount: amount
            });
            alert('Egreso registrado correctamente');
            setExpenseData({ description: '', amount: '' });
            setShowExpenseForm(false);
            loadCashRegister();
        } catch (error) {
            console.error('Error al registrar egreso:', error);
            alert('Error al guardar el egreso');
        }
    };

    const handleDeleteExpense = (id) => {
        if (confirm('¿Eliminar este egreso?')) {
            deleteExpense(id);
            loadCashRegister();
        }
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
    const egresos = (cashRegister.expenses || []).reduce((sum, e) => sum + e.amount, 0);
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Utilidad Neta</p>
                            <p className="text-2xl font-bold text-slate-800">{formatCurrency(utilidad)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Caja Diaria */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resumen de Caja */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-slate-600" />
                        Caja Diaria
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-slate-500">Saldo Inicial</p>
                                {!editingBalance ? (
                                    <button
                                        onClick={() => setEditingBalance(true)}
                                        className="text-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveBalance} className="text-green-500 hover:text-green-600">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {editingBalance ? (
                                <input
                                    type="number"
                                    value={tempBalance}
                                    onChange={(e) => setTempBalance(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-lg font-bold text-slate-800"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-2xl font-bold text-slate-800">{formatCurrency(cashRegister.initialBalance)}</p>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-sm text-slate-500 mb-2">Saldo Final en Caja</p>
                            <p className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(saldoFinal)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-700">Ingresos (Ventas)</span>
                            </div>
                            <span className="font-bold text-green-600">+{formatCurrency(ingresos)}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-700">Egresos (Gastos)</span>
                            </div>
                            <span className="font-bold text-red-600">-{formatCurrency(egresos)}</span>
                        </div>
                    </div>
                </div>

                {/* Registro de Egresos */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Egresos</h3>
                        <button
                            onClick={() => setShowExpenseForm(!showExpenseForm)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {showExpenseForm && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Descripción del gasto"
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Monto"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowExpenseForm(false)}
                                        className="flex-1 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddExpense}
                                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                    >
                                        Registrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2">
                        {(cashRegister.expenses || []).length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8">No hay egresos registrados hoy</p>
                        ) : (
                            (cashRegister.expenses || []).map((expense) => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">{expense.description}</p>
                                        <p className="text-xs text-slate-500">{new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-red-600 text-sm">-{formatCurrency(expense.amount)}</span>
                                        <button
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Data Management Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    Gestión de Datos y Respaldos
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Guarda copias de seguridad periódicamente en una memoria USB o disco externo para evitar pérdida de información.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            const data = createBackup();
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `respaldo_farmacia_${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-0.5 font-medium"
                    >
                        <Download className="w-5 h-5" />
                        Descargar Copia de Seguridad
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (window.confirm('ADVERTENCIA: Al restaurar un respaldo, se reemplazarán TODOS los datos actuales con los del archivo. ¿Estás seguro de continuar?')) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        try {
                                            restoreBackup(event.target.result);
                                            alert('¡Sistema restaurado exitosamente! La aplicación se reiniciará.');
                                            window.location.reload();
                                        } catch (error) {
                                            alert(error.message);
                                        }
                                    };
                                    reader.readAsText(file);
                                } else {
                                    e.target.value = ''; // Reset input
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button className="w-full h-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                            <Upload className="w-5 h-5" />
                            Restaurar desde Archivo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
