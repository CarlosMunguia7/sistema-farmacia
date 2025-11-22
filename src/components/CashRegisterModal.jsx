import React, { useState } from 'react';
import { X, DollarSign, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function CashRegisterModal({ isOpen, onClose, onSave, initialBalance, expenses }) {
    const [balance, setBalance] = useState(initialBalance);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseData, setExpenseData] = useState({
        description: '',
        amount: ''
    });

    const handleSaveBalance = () => {
        onSave({ type: 'balance', amount: parseFloat(balance) });
        onClose();
    };

    const handleAddExpense = () => {
        if (!expenseData.description || !expenseData.amount) {
            alert('Por favor completa todos los campos');
            return;
        }

        onSave({
            type: 'expense',
            expense: {
                description: expenseData.description,
                amount: parseFloat(expenseData.amount)
            }
        });

        setExpenseData({ description: '', amount: '' });
        setShowExpenseForm(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Gestión de Caja</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Saldo Inicial */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Saldo Inicial de Caja
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="number"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                step="0.01"
                                min="0"
                                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleSaveBalance}
                            className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                            Actualizar Saldo Inicial
                        </button>
                    </div>

                    {/* Egresos */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-700">Registrar Egreso</h3>
                            {!showExpenseForm && (
                                <button
                                    onClick={() => setShowExpenseForm(true)}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                    Nuevo Egreso
                                </button>
                            )}
                        </div>

                        {showExpenseForm && (
                            <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        value={expenseData.description}
                                        onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        placeholder="Ej: Compra de insumos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Monto (C$)
                                    </label>
                                    <input
                                        type="number"
                                        value={expenseData.amount}
                                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddExpense}
                                        className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                    >
                                        Registrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowExpenseForm(false);
                                            setExpenseData({ description: '', amount: '' });
                                        }}
                                        className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Lista de Egresos */}
                        {expenses.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-medium text-slate-600">Egresos del día:</p>
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                                        <span className="text-slate-700">{expense.description}</span>
                                        <span className="font-semibold text-red-600">{formatCurrency(expense.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
