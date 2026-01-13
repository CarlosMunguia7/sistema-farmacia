import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    FileDown,
    FileSpreadsheet,
    Edit,
    Trash2,
    AlertTriangle,
    Package,
    Upload,
    Clock,
    Filter,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getProducts, deleteProduct, initializeSampleData, addProduct, updateProduct, saveProducts } from '../lib/storage';
import { exportInventoryToPDF, exportInventoryToExcel } from '../lib/export';
import { formatCurrency } from '../lib/utils';
import ProductModal from '../components/ProductModal';
import HistoryModal from '../components/HistoryModal';

export default function Inventario() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const fileInputRef = useRef(null);

    // New State for Filters and History
    const [filterType, setFilterType] = useState('all'); // 'all', 'low', 'expiring'
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyProduct, setHistoryProduct] = useState(null);

    useEffect(() => {
        initializeSampleData();
        loadProducts();
    }, []);

    const loadProducts = () => {
        setProducts(getProducts());
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Read as array of arrays to find the header row
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                let headerRowIndex = -1;
                let foundHeaders = [];

                // Scan first 20 rows to find the header
                for (let i = 0; i < Math.min(20, rawData.length); i++) {
                    const row = rawData[i];
                    // Check if this row looks like a header (contains "Insumo" or "Lote" or "Producto")
                    // Convert row to string for easy checking or check individual cells
                    const rowString = row.map(cell => String(cell).toLowerCase()).join(' ');

                    if (rowString.includes('insumo') || rowString.includes('producto') || rowString.includes('lote') || rowString.includes('cantidad')) {
                        headerRowIndex = i;
                        foundHeaders = row;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    toast.error("No se encontró la fila de encabezados", {
                        description: "Asegúrate de que el Excel tenga columnas como 'Insumo', 'Lote' o 'Cantidad'."
                    });
                    return;
                }

                // Extract data starting from the header row
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                range.s.r = headerRowIndex;
                const options = { range: range };
                const jsonData = XLSX.utils.sheet_to_json(worksheet, options);

                processImportedData(jsonData);
            } catch (error) {
                console.error("Error al importar:", error);
                toast.error("Error al leer el archivo Excel", {
                    description: "Asegúrate de que sea un archivo válido."
                });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = ''; // Reset input
    };

    const processImportedData = (data) => {
        let addedCount = 0;
        let updatedCount = 0;
        const currentProducts = getProducts();

        // Helper to parse Spanish date "may-27" -> ISO String
        const parseSpanishDate = (dateStr) => {
            if (!dateStr) return '';
            if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
            if (typeof dateStr === 'number') {
                const date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
                return date.toISOString().split('T')[0];
            }
            if (typeof dateStr !== 'string') return '';

            const months = {
                'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
                'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12',
                'jan': '01', 'apr': '04', 'aug': '08', 'dec': '12'
            };

            const parts = dateStr.trim().toLowerCase().split('-');
            if (parts.length === 2) {
                const month = months[parts[0].substring(0, 3)];
                let year = parts[1];
                if (year.length === 2 && !isNaN(year)) year = '20' + year;
                if (month && year) {
                    return `${year}-${month}-01`;
                }
            }
            return dateStr;
        };

        // Normalize keys: trim and lowercase
        const normalizedData = data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
                newRow[key.trim().toLowerCase()] = row[key];
            });
            return newRow;
        });

        normalizedData.forEach((row, index) => {
            // Flexible column mapping (using normalized keys)
            const productName = row['insumo'] || row['producto'] || row['nombre'] || row['name'] || row['descripcion'] || row['descripción'];

            if (!productName) return;

            const lote = row['lote'] || '';
            const rawExpiry = row['fecha de vencimiento'] || row['vencimiento'] || row['expiry'] || row['caducidad'] || '';
            const expiryDate = parseSpanishDate(rawExpiry);

            const newProduct = {
                sku: row['sku'] || row['código'] || row['codigo'] || row['id'] || (lote ? `${String(productName).substring(0, 3).toUpperCase()}-${lote}` : `GEN-${String(productName).substring(0, 3).toUpperCase()}-${String(index).padStart(4, '0')}`),
                name: String(productName),
                category: row['categoría'] || row['categoria'] || row['category'] || 'General',
                stock: Number(row['cantidad'] || row['stock'] || row['cant'] || 0),
                minStock: Number(row['stock mínimo'] || row['minimo'] || row['min_stock'] || 5),
                price: Number(row['precio'] || row['precio unitario'] || row['price'] || 0),
                expiryDate: expiryDate,
                supplier: row['distribuidora'] || row['proveedor'] || row['supplier'] || '',
                batchNumber: lote,
                manufacturer: row['laboratorio'] || row['lab'] || '',
            };

            let existingIndex = -1;
            if (newProduct.sku && !newProduct.sku.startsWith('GEN-')) {
                existingIndex = currentProducts.findIndex(p => p.sku === newProduct.sku);
            }
            if (existingIndex === -1 && lote) {
                existingIndex = currentProducts.findIndex(p => p.name.toLowerCase() === newProduct.name.toLowerCase() && p.batchNumber === lote);
            }
            if (existingIndex === -1 && !lote) {
                existingIndex = currentProducts.findIndex(p => p.name.toLowerCase() === newProduct.name.toLowerCase());
            }

            if (existingIndex >= 0) {
                currentProducts[existingIndex] = {
                    ...currentProducts[existingIndex],
                    ...newProduct,
                    updatedAt: new Date().toISOString()
                };
                updatedCount++;
            } else {
                const productWithId = {
                    ...newProduct,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + index,
                    createdAt: new Date().toISOString()
                };
                currentProducts.push(productWithId);
                addedCount++;
            }
        });

        saveProducts(currentProducts);
        loadProducts();

        if (addedCount === 0 && updatedCount === 0) {
            toast.error("No se importaron productos", {
                description: "Verifique el formato del archivo y que contenga encabezados válidos.",
                duration: 5000
            });
        } else {
            toast.success(`Importación completada`, {
                description: `${addedCount} nuevos, ${updatedCount} actualizados.`,
                duration: 4000
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
            loadProducts();
            toast.success('Producto eliminado correctamente');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleHistory = (product) => {
        setHistoryProduct(product);
        setShowHistoryModal(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleSave = (productData) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
            toast.success('Producto actualizado correctamente');
        } else {
            addProduct(productData);
            toast.success('Producto agregado con éxito');
        }
        loadProducts();
        setShowModal(false);
        setEditingProduct(null);
    };

    // --- Filter Logic ---
    const getFilteredProducts = () => {
        let result = products;

        // 1. Text Search
        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.batchNumber && product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Category Buttons Filter
        if (filterType === 'low') {
            result = result.filter(p => p.stock <= p.minStock);
        } else if (filterType === 'expiring') {
            const today = new Date();
            const warningDate = new Date();
            warningDate.setDate(today.getDate() + 60); // 60 days lookahead

            result = result.filter(p => {
                if (!p.expiryDate) return false;
                const exp = new Date(p.expiryDate);
                return exp <= warningDate; // Past or near future
            });
        }

        return result;
    };

    const filteredProducts = getFilteredProducts();
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    // Calculate expiring count for badge
    const expiringCount = products.filter(p => {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        const warning = new Date();
        warning.setDate(warning.getDate() + 60);
        return exp <= warning;
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Inventario</h2>
                    <p className="text-slate-500 mt-1">Gestión de productos y medicamentos</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Producto
                </button>
            </div>

            {/* Quick Filters / Stats Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilterType('all')}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${filterType === 'all'
                        ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                >
                    <Package className={`w-6 h-6 ${filterType === 'all' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                        <span className={`block text-2xl font-bold ${filterType === 'all' ? 'text-blue-700' : 'text-slate-700'}`}>
                            {products.length}
                        </span>
                        <span className="text-xs text-slate-500">Total Productos</span>
                    </div>
                </button>

                <button
                    onClick={() => setFilterType('low')}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${filterType === 'low'
                        ? 'bg-red-50 border-red-500 shadow-md transform scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-red-300'
                        }`}
                >
                    <AlertTriangle className={`w-6 h-6 ${filterType === 'low' ? 'text-red-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                        <span className={`block text-2xl font-bold ${filterType === 'low' ? 'text-red-700' : 'text-slate-700'}`}>
                            {lowStockCount}
                        </span>
                        <span className="text-xs text-slate-500">Stock Bajo</span>
                    </div>
                </button>

                <button
                    onClick={() => setFilterType('expiring')}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${filterType === 'expiring'
                        ? 'bg-amber-50 border-amber-500 shadow-md transform scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                >
                    <Calendar className={`w-6 h-6 ${filterType === 'expiring' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div className="text-center">
                        <span className={`block text-2xl font-bold ${filterType === 'expiring' ? 'text-amber-700' : 'text-slate-700'}`}>
                            {expiringCount}
                        </span>
                        <span className="text-xs text-slate-500">Por Vencer (60 días)</span>
                    </div>
                </button>

                <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <div className="text-center">
                        <span className="block text-xl font-bold text-slate-700">{formatCurrency(totalValue)}</span>
                        <span className="text-xs text-slate-500">Valor Inventario</span>
                    </div>
                </div>
            </div>

            {/* Search and Export */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, SKU o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            Importar
                        </button>
                        <button
                            onClick={() => exportInventoryToPDF(filteredProducts)}
                            className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                        >
                            <FileDown className="w-5 h-5" />
                            PDF
                        </button>
                        <button
                            onClick={() => exportInventoryToExcel(filteredProducts)}
                            className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lote</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Laboratorio</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Vencimiento</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.map((product) => {
                                // Check expiry for row highlight
                                const isExpiring = product.expiryDate && new Date(product.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 60));
                                const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date();

                                return (
                                    <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${isExpired ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <div>{product.name}</div>
                                            <div className="text-xs text-slate-500">{product.category !== 'General' ? product.category : product.supplier}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.batchNumber || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.manufacturer || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock <= product.minStock
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`${isExpired ? 'text-red-600 font-bold' : isExpiring ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                                                {product.expiryDate}
                                                {isExpired && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Vencido</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleHistory(product)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Ver Historial (Kardex)"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <ProductModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                }}
                onSave={handleSave}
                product={editingProduct}
            />

            <HistoryModal
                isOpen={showHistoryModal}
                onClose={() => {
                    setShowHistoryModal(false);
                    setHistoryProduct(null);
                }}
                product={historyProduct}
            />
        </div>
    );
}
