import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, product = null }) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        minStock: '',
        expiryDate: '',
        supplier: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (product) {
            // Modo edición - cargar datos del producto
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                category: product.category || '',
                price: product.price || '',
                stock: product.stock || '',
                minStock: product.minStock || '',
                expiryDate: product.expiryDate || '',
                supplier: product.supplier || '',
            });
        } else {
            // Modo crear - limpiar formulario
            setFormData({
                name: '',
                sku: '',
                category: '',
                price: '',
                stock: '',
                minStock: '',
                expiryDate: '',
                supplier: '',
            });
        }
        setErrors({});
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.sku.trim()) newErrors.sku = 'El SKU es requerido';
        if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'El precio debe ser mayor a 0';
        if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'El stock debe ser 0 o mayor';
        if (!formData.minStock || parseInt(formData.minStock) < 0) newErrors.minStock = 'El stock mínimo debe ser 0 o mayor';
        if (!formData.expiryDate) newErrors.expiryDate = 'La fecha de vencimiento es requerida';
        if (!formData.supplier.trim()) newErrors.supplier = 'El proveedor es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            minStock: parseInt(formData.minStock),
        };

        onSave(productData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Ej: Paracetamol 500mg"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                SKU *
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.sku ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Ej: MED-001"
                            />
                            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Categoría *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                <option value="">Seleccionar categoría</option>
                                <option value="Analgésicos">Analgésicos</option>
                                <option value="Antibióticos">Antibióticos</option>
                                <option value="Antiinflamatorios">Antiinflamatorios</option>
                                <option value="Antihistamínicos">Antihistamínicos</option>
                                <option value="Antiácidos">Antiácidos</option>
                                <option value="Vitaminas">Vitaminas</option>
                                <option value="Otros">Otros</option>
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Precio (C$) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.price ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Stock Actual *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.stock ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="0"
                            />
                            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                        </div>

                        {/* Stock Mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Stock Mínimo *
                            </label>
                            <input
                                type="number"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                                min="0"
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.minStock ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="0"
                            />
                            {errors.minStock && <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>}
                        </div>

                        {/* Fecha de Vencimiento */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Fecha de Vencimiento *
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.expiryDate ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>

                        {/* Proveedor */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Proveedor *
                            </label>
                            <input
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 bg-white text-slate-900 rounded-lg border ${errors.supplier ? 'border-red-500' : 'border-slate-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Ej: Farmacéutica Nacional"
                            />
                            {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                        >
                            {product ? 'Guardar Cambios' : 'Agregar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
