import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, User, Shield, UserPlus } from 'lucide-react';
import { getUsers, addUser, deleteUser } from '../lib/storage';

export default function Usuarios() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'vendedor' // admin o vendedor
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setUsers(getUsers());
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            addUser(formData);
            alert('Usuario creado exitosamente');
            setShowModal(false);
            setFormData({ name: '', username: '', password: '', role: 'vendedor' });
            loadUsers();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = (id, username) => {
        if (username === 'admin') {
            alert('No puedes eliminar al administrador principal');
            return;
        }
        if (window.confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) {
            deleteUser(id);
            loadUsers();
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Usuarios</h2>
                    <p className="text-slate-500 mt-1">Gestión de personal y accesos</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${user.role === 'admin'
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                                    }`}>
                                    {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                                    <p className="text-sm text-slate-500">@{user.username}</p>
                                </div>
                            </div>
                            {user.username !== 'admin' && (
                                <button
                                    onClick={() => handleDelete(user.id, user.username)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                            </span>
                            <span className="text-xs text-slate-400">
                                ID: {user.id.slice(-4)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Nuevo Usuario */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Usuario</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Ej: juanp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium"
                                >
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
