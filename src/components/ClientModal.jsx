import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { addClient } from '../lib/storage';

export default function ClientModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        creditLimit: ''
    });
    const [errors, setErrors] = useState({});

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
        if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
        if (!formData.creditLimit || isNaN(parseFloat(formData.creditLimit))) newErrors.creditLimit = 'Límite de crédito debe ser numérico';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const client = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            creditLimit: parseFloat(formData.creditLimit)
        };
        addClient(client);
        if (onSave) onSave(client);
        onClose();
        // Reset form
        setFormData({ name: '', phone: '', address: '', creditLimit: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Agregar Nuevo Cliente</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                placeholder="Ej: Juan Pérez"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                placeholder="Ej: 555-1234"
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.address ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                placeholder="Ej: Av. Central 123"
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Crédito *</label>
                            <input
                                type="number"
                                name="creditLimit"
                                value={formData.creditLimit}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.creditLimit ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                placeholder="Ej: 5000"
                            />
                            {errors.creditLimit && <p className="text-red-500 text-sm mt-1">{errors.creditLimit}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
