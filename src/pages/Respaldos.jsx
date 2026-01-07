import React from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { createBackup, restoreBackup } from '../lib/storage';

export default function Respaldos() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Respaldo y Restauración</h2>
                <p className="text-slate-500 mt-1">Gestión de copias de seguridad de la base de datos</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    Gestión de Datos y Respaldos
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Guarda copias de seguridad periódicamente en una memoria USB o disco externo para evitar pérdida de información.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            const data = createBackup();
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `respaldo_farmacia_${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-0.5 font-medium"
                    >
                        <Download className="w-5 h-5" />
                        Descargar Copia de Seguridad
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (window.confirm('ADVERTENCIA: Al restaurar un respaldo, se reemplazarán TODOS los datos actuales con los del archivo. ¿Estás seguro de continuar?')) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        try {
                                            restoreBackup(event.target.result);
                                            alert('¡Sistema restaurado exitosamente! La aplicación se reiniciará.');
                                            window.location.reload();
                                        } catch (error) {
                                            alert(error.message);
                                        }
                                    };
                                    reader.readAsText(file);
                                } else {
                                    e.target.value = ''; // Reset input
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button className="w-full h-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                            <Upload className="w-5 h-5" />
                            Restaurar desde Archivo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
