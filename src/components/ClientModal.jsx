import React, { useState, useEffect } from 'react';
import { X, Check, Save } from 'lucide-react';
import { addClient, updateClient } from '../lib/storage';

export default function ClientModal({ isOpen, onClose, onSave, client = null }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        creditLimit: ''
    });
    const [errors, setErrors] = useState({});

    // Cargar datos si estamos en modo edición
    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                phone: client.phone || '',
                address: client.address || '',
                creditLimit: client.creditLimit || ''
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                address: '',
                creditLimit: ''
            });
        }
    }, [client, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        // Address opcional
        if (formData.creditLimit && isNaN(parseFloat(formData.creditLimit))) {
            newErrors.creditLimit = 'Debe ser un número válido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const clientData = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0
        };

        if (client) {
            updateClient(client.id, clientData);
        } else {
            addClient(clientData);
        }

        if (onSave) onSave();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {client ? <Save className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        {client ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-all`}
                                placeholder="Ej: Juan Pérez"
                                autoFocus
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-all`}
                                placeholder="Ej: 8888-8888"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                placeholder="Dirección del domicilio..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Crédito (C$)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">C$</span>
                                <input
                                    type="number"
                                    name="creditLimit"
                                    value={formData.creditLimit}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.creditLimit && <p className="text-red-500 text-xs mt-1 ml-1">{errors.creditLimit}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
