import React from 'react';
import { X, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { getProductMovements } from '../lib/storage';

export default function HistoryModal({ isOpen, onClose, product }) {
    if (!isOpen || !product) return null;

    const movements = getProductMovements(product.id);

    // Sort by date desc
    movements.sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Historial de Movimientos
                        </h2>
                        <p className="text-white/80 text-sm mt-1">{product.name} (SKU: {product.sku})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {movements.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay movimientos registrados para este producto aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {movements.map((move) => (
                                <div key={move.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${move.type === 'ENTRADA' || move.type.includes('(+)') ? 'bg-green-100 text-green-600' :
                                            move.type === 'SALIDA' || move.type.includes('(-)') ? 'bg-red-100 text-red-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {move.type === 'ENTRADA' || move.type.includes('(+)') ? <ArrowRight className="w-4 h-4 rotate-90" /> :
                                            move.type === 'SALIDA' || move.type.includes('(-)') ? <ArrowLeft className="w-4 h-4 -rotate-90" /> :
                                                <Clock className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{move.type}</h4>
                                                <p className="text-sm text-slate-500">{new Date(move.date).toLocaleString('es-NI')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${move.type.includes('SALIDA') || move.type.includes('(-)') ? 'text-red-500' : 'text-green-600'
                                                    }`}>
                                                    {move.type.includes('SALIDA') || move.type.includes('(-)') ? '-' : '+'}{move.quantity}
                                                </p>
                                                <p className="text-xs text-slate-400">Stock: {move.previousStock} → {move.newStock}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">
                                            {move.reason}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cerrar Historial
                    </button>
                </div>
            </div>
        </div>
    );
}
