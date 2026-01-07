import React from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Pill
} from 'lucide-react';
import { cn } from '../lib/utils';
import logo from '../assets/logo.jpg';

const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Inventario', icon: Package, href: '/inventario' },
    { name: 'Ventas', icon: ShoppingCart, href: '/ventas' },
    { name: 'Reportes', icon: BarChart3, href: '/reportes' },
    { name: 'Configuración', icon: Settings, href: '/configuracion' },
];

export default function Layout({ children }) {
    const [currentPath, setCurrentPath] = React.useState('/');

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">FarmaControl</h1>
                            <p className="text-xs text-slate-500">Sistema de Inventario</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href;

                        return (
                            <button
                                key={item.name}
                                onClick={() => setCurrentPath(item.href)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            CM
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">Carlos Munguia</p>
                            <p className="text-xs text-slate-500">Administrador</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
