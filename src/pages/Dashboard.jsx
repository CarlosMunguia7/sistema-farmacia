import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { getProducts, getSales } from '../lib/storage';
import { formatCurrency } from '../lib/utils';

export default function Dashboard({ onNavigate }) {
    const [stats, setStats] = useState([
        { name: 'Total Productos', value: '0', change: '0', changeType: 'neutral', icon: Package, color: 'blue' },
        { name: 'Ventas del Mes', value: 'C$ 0.00', change: '0', changeType: 'neutral', icon: DollarSign, color: 'green' },
        { name: 'Stock Bajo', value: '0', change: '0', changeType: 'neutral', icon: AlertCircle, color: 'red' },
        { name: 'Tendencia', value: '+0%', change: 'vs mes anterior', changeType: 'neutral', icon: TrendingUp, color: 'violet' },
    ]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const loadDashboardData = () => {
            const products = getProducts();
            const sales = getSales();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Total Productos
            const totalProducts = products.length;

            // Ventas del Mes
            const thisMonthSales = sales.filter(sale => {
                const d = new Date(sale.createdAt);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const totalSalesValue = thisMonthSales.reduce((sum, sale) => sum + sale.total, 0);

            // Stock Bajo
            const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

            // Calcular tendencia (comparado con mes anterior) - Simplificado por ahora
            // Idealmente filtrar ventas del mes pasado
            // Por ahora dejaremos un valor estático o calculado simple si tuvieramos historial real antiguo

            setStats([
                {
                    name: 'Total Productos',
                    value: totalProducts.toString(),
                    change: 'Actualizado',
                    changeType: 'neutral',
                    icon: Package,
                    color: 'blue',
                },
                {
                    name: 'Ventas del Mes',
                    value: formatCurrency(totalSalesValue),
                    change: `${thisMonthSales.length} ventas`,
                    changeType: 'positive',
                    icon: DollarSign,
                    color: 'green',
                },
                {
                    name: 'Stock Bajo',
                    value: lowStockCount.toString(),
                    change: lowStockCount > 0 ? 'Requiere atención' : 'Todo en orden',
                    changeType: lowStockCount > 0 ? 'negative' : 'positive',
                    icon: AlertCircle,
                    color: 'red',
                },
                {
                    name: 'Tendencia',
                    value: '+100%', // Placeholder hasta tener más historia
                    change: 'vs mes anterior',
                    changeType: 'positive',
                    icon: TrendingUp,
                    color: 'violet',
                },
            ]);

            // Actividad Reciente (Últimas 5 ventas)
            const recent = [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
            setRecentActivity(recent);
        };

        loadDashboardData();
    }, []);

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
        green: 'from-green-500 to-green-600 shadow-green-500/30',
        red: 'from-red-500 to-red-600 shadow-red-500/30',
        violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-500 mt-1">Resumen general del sistema</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const getTargetPage = (name) => {
                        switch (name) {
                            case 'Total Productos': return 'inventario';
                            case 'Ventas del Mes': return 'reportes';
                            case 'Stock Bajo': return 'inventario';
                            case 'Tendencia': return 'reportes';
                            default: return 'dashboard';
                        }
                    };

                    return (
                        <div
                            key={stat.name}
                            onClick={() => onNavigate(getTargetPage(stat.name))}
                            className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                    <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                                    <p className={`text-sm mt-2 ${stat.changeType === 'positive' ? 'text-green-600' :
                                        stat.changeType === 'negative' ? 'text-red-600' :
                                            'text-slate-500'
                                        }`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => onNavigate('ventas')}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Nueva Venta
                    </button>
                    <button
                        onClick={() => onNavigate('inventario')}
                        className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Agregar Producto
                    </button>
                    <button
                        onClick={() => onNavigate('reportes')}
                        className="p-4 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Ver Reportes
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <p className="text-slate-500 text-sm">No hay actividad reciente.</p>
                    ) : (
                        recentActivity.map((sale) => (
                            <div key={sale.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                        Venta registrada - {sale.items.length} productos
                                        ({sale.items.map(i => i.name).slice(0, 2).join(', ')}{sale.items.length > 2 ? '...' : ''})
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">+{formatCurrency(sale.total)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
