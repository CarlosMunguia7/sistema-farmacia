import React from 'react';
import { Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

const stats = [
    {
        name: 'Total Productos',
        value: '248',
        change: '+12%',
        changeType: 'positive',
        icon: Package,
        color: 'blue',
    },
    {
        name: 'Ventas del Mes',
        value: 'C$ 45,231.00',
        change: '+23%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'green',
    },
    {
        name: 'Stock Bajo',
        value: '12',
        change: '-3',
        changeType: 'negative',
        icon: AlertCircle,
        color: 'red',
    },
    {
        name: 'Tendencia',
        value: '+18%',
        change: 'vs mes anterior',
        changeType: 'neutral',
        icon: TrendingUp,
        color: 'violet',
    },
];

const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
};

export default function Dashboard({ onNavigate }) {
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
                    return (
                        <div
                            key={stat.name}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
                    {[
                        { id: 1, product: 'Paracetamol 500mg', time: 'Hace 5 minutos', amount: 12.50 },
                        { id: 2, product: 'Ibuprofeno 400mg', time: 'Hace 15 minutos', amount: 18.75 },
                        { id: 3, product: 'Amoxicilina 500mg', time: 'Hace 30 minutos', amount: 45.00 },
                        { id: 4, product: 'Loratadina 10mg', time: 'Hace 1 hora', amount: 8.25 },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">Venta registrada - {item.product}</p>
                                <p className="text-xs text-slate-500">{item.time}</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">+C$ {item.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
