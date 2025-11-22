import React, { useState, useEffect } from 'react';
import {
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Search,
    DollarSign,
    Barcode
} from 'lucide-react';
import { getProducts, addSale } from '../lib/storage';
import { formatCurrency } from '../lib/utils';

export default function Ventas() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    // Listener para lector de código de barras
    useEffect(() => {
        let timeout;

        const handleKeyPress = (e) => {
            // Ignorar si el usuario está escribiendo en el campo de búsqueda
            if (e.target.tagName === 'INPUT') return;

            // Acumular caracteres del código de barras
            setBarcodeBuffer(prev => prev + e.key);

            // Limpiar buffer después de 100ms de inactividad
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setBarcodeBuffer('');
            }, 100);

            // Si presiona Enter, buscar el producto por SKU
            if (e.key === 'Enter' && barcodeBuffer) {
                const product = products.find(p => p.sku === barcodeBuffer);
                if (product) {
                    addToCart(product);
                    setBarcodeBuffer('');
                } else {
                    alert(`Producto con SKU "${barcodeBuffer}" no encontrado`);
                    setBarcodeBuffer('');
                }
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            clearTimeout(timeout);
        };
    }, [barcodeBuffer, products]);

    const loadProducts = () => {
        setProducts(getProducts());
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                alert('No hay suficiente stock disponible');
            }
        } else {
            if (product.stock > 0) {
                setCart([...cart, { ...product, quantity: 1 }]);
            } else {
                alert('Producto sin stock');
            }
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p.id === productId);

        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            alert('No hay suficiente stock disponible');
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        const sale = {
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: calculateTotal()
        };

        addSale(sale);
        setCart([]);
        alert('Venta registrada exitosamente');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Punto de Venta</h2>
                    <p className="text-slate-500 mt-1">Registra ventas y gestiona el carrito</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                    <Barcode className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Lector de barras activo</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Productos Disponibles */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Búsqueda */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/60 shadow-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Lista de Productos */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">Productos Disponibles</h3>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-800">{product.name}</h4>
                                                <p className="text-xs text-slate-500">{product.sku}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock <= product.minStock
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carrito de Compras */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden sticky top-6">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-3">
                            <ShoppingCart className="w-6 h-6 text-white" />
                            <h3 className="text-lg font-bold text-white">Carrito</h3>
                            <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-semibold text-white">
                                {cart.length}
                            </span>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Carrito vacío</p>
                                    <p className="text-slate-400 text-sm mt-1">Agrega productos para vender</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                                                    <p className="text-xs text-slate-500">{formatCurrency(item.price)} c/u</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-slate-800">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 border-t border-slate-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-semibold text-slate-800">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-bold text-slate-800">Total:</span>
                                        <span className="font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <DollarSign className="w-5 h-5" />
                                        Completar Venta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
