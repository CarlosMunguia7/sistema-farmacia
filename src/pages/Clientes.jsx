import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, DollarSign, CreditCard, Search } from 'lucide-react';
import { getClients, addClient, updateClient, deleteClient, addPayment } from '../lib/storage';
import { formatCurrency } from '../lib/utils';

export default function Clientes() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        creditLimit: ''
    });
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = () => {
        setClients(getClients());
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    const handleSave = () => {
        if (!formData.name || !formData.phone) {
            alert('Por favor completa nombre y teléfono');
            return;
        }

        const clientData = {
            ...formData,
            creditLimit: parseFloat(formData.creditLimit) || 0
        };

        if (selectedClient) {
            updateClient(selectedClient.id, clientData);
        } else {
            addClient(clientData);
        }

        loadClients();
        handleCloseModal();
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
            address: client.address || '',
            creditLimit: client.creditLimit || ''
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este cliente?')) {
            deleteClient(id);
            loadClients();
        }
    };

    const handleOpenPayment = (client) => {
        setSelectedClient(client);
        setPaymentAmount('');
        setShowPaymentModal(true);
    };

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Ingresa un monto válido');
            return;
        }

        if (amount > selectedClient.balance) {
            alert('El pago no puede ser mayor al saldo');
            return;
        }

        addPayment(selectedClient.id, { amount, description: 'Pago' });
        loadClients();
        setShowPaymentModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedClient(null);
        setFormData({ name: '', phone: '', address: '', creditLimit: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Clientes</h2>
                    <p className="text-slate-500 mt-1">Gestión de clientes y créditos</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Cliente
                </button>
            </div>

            {/* Búsqueda */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/60 shadow-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Lista de Clientes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Teléfono</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Saldo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Límite</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-slate-800">{client.name}</p>
                                            {client.address && <p className="text-xs text-slate-500">{client.address}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{client.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(client.balance)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(client.creditLimit || 0)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {client.balance > 0 && (
                                                <button
                                                    onClick={() => handleOpenPayment(client)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Registrar pago"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Agregar/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">
                                {selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Límite de Crédito (C$)</label>
                                <input
                                    type="number"
                                    value={formData.creditLimit}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pago */}
            {showPaymentModal && selectedClient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">Registrar Pago</h3>
                            <p className="text-sm text-white/90 mt-1">{selectedClient.name}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-slate-600">Saldo pendiente:</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedClient.balance)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Monto del Pago (C$)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddPayment}
                                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                >
                                    Registrar Pago
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
