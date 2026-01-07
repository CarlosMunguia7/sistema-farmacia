import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Edit2,
    Save,
    X,
    TrendingUp,
    TrendingDown,
    Plus,
    Trash2
} from 'lucide-react';
import {
    getCashRegister,
    setInitialBalance,
    addExpense,
    deleteExpense,
    getSales
} from '../lib/storage';
import { formatCurrency } from '../lib/utils';

export default function Caja() {
    const [cashRegister, setCashRegister] = useState({ initialBalance: 1200.00, expenses: [] });
    const [editingBalance, setEditingBalance] = useState(false);
    const [tempBalance, setTempBalance] = useState('1200.00');
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseData, setExpenseData] = useState({ description: '', amount: '' });

    useEffect(() => {
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

    // Calculate totals for today
    const allSales = getSales();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSales = allSales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= today && saleDate < tomorrow;
    });

    const ingresos = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const egresos = (cashRegister.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const saldoFinal = cashRegister.initialBalance + ingresos - egresos;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Caja Diaria</h2>
                <p className="text-slate-500 mt-1">Control de apertura, cierre y gastos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resumen de Caja */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-slate-600" />
                        Balance del Día
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
                                    type="text"
                                    value={tempBalance}
                                    onChange={(e) => {
                                        // Permitir solo números y un punto decimal
                                        const val = e.target.value;
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            setTempBalance(val);
                                        }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    autoFocus
                                    placeholder="0.00"
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
                                <span className="font-medium text-slate-700">Ingresos (Ventas de Hoy)</span>
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
        </div>
    );
}
