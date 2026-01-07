import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Search,
    DollarSign,
    Barcode,
    Users,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, addSale, getClients, addCreditSale, addClient } from '../lib/storage';
import { formatCurrency } from '../lib/utils';
import ClientModal from '../components/ClientModal';

export default function Ventas() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [clients, setClients] = useState([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [isCredit, setIsCredit] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);

    const searchInputRef = useRef(null);

    // Focus search on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Load products and clients on mount
    useEffect(() => {
        loadProducts();
        loadClients();
    }, []);

    const loadProducts = () => {
        setProducts(getProducts());
    };

    const loadClients = () => {
        const loadedClients = getClients();
        console.log('Clientes cargados:', loadedClients);
        setClients(loadedClients);
    };

    // Listener para lector de código de barras
    useEffect(() => {
        let timeout;
        const handleKeyPress = (e) => {
            if (e.target.tagName === 'INPUT') return;
            setBarcodeBuffer(prev => prev + e.key);
            clearTimeout(timeout);
            timeout = setTimeout(() => setBarcodeBuffer(''), 100);
            if (e.key === 'Enter' && barcodeBuffer) {
                const product = products.find(p => p.sku === barcodeBuffer);
                if (product) {
                    addToCart(product);
                    setBarcodeBuffer('');
                    toast.success(`Producto agregado: ${product.name}`);
                } else {
                    toast.error(`Producto con SKU "${barcodeBuffer}" no encontrado`);
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

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
                toast.success('Cantidad actualizada');
            } else {
                toast.error('No hay suficiente stock disponible');
            }
        } else {
            if (product.stock > 0) {
                setCart([...cart, { ...product, quantity: 1 }]);
                toast.success('Producto agregado al carrito');
            } else {
                toast.error('Producto sin stock');
            }
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const product = products.find(p => p.id === productId);
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        } else {
            toast.error('No hay suficiente stock disponible');
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
        toast.info('Producto eliminado del carrito');
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleAddClient = (clientData) => {
        const newClient = addClient(clientData);
        loadClients();
        setClientSearchTerm(newClient.name);
        setSelectedClient(newClient.id);
        setShowClientModal(false);
        toast.success('Cliente registrado exitosamente');
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }

        const total = calculateTotal();

        // Validar límite de crédito
        if (isCredit && selectedClient) {
            const client = clients.find(c => c.id === selectedClient);
            if (client) {
                const currentBalance = client.balance || 0;
                const creditLimit = client.creditLimit || 0;
                const newBalance = currentBalance + total;

                if (newBalance > creditLimit) {
                    toast.error(`⛔ Límite de crédito excedido. Saldo proyectado: ${formatCurrency(newBalance)}`);
                    return;
                }
            }
        }

        const sale = {
            items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            total,
        };
        // Registrar venta normal
        addSale(sale);
        // Si es crédito, registrar en cliente
        if (isCredit && selectedClient) {
            addCreditSale(selectedClient, total);
        }
        setCart([]);
        setIsCredit(false);
        setSelectedClient('');
        setClientSearchTerm('');
        toast.success('¡Venta registrada exitosamente!');
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Punto de Venta</h2>
                    <p className="text-slate-500 mt-1">Registra ventas y gestiona el carrito</p>
                </div>
                {/* Cliente y Crédito */}
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/60 shadow-xl z-20 relative">
                    <div className="flex items-center gap-2 relative">
                        <Users className="w-5 h-5 text-slate-600" />
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={clientSearchTerm}
                                onChange={e => {
                                    setClientSearchTerm(e.target.value);
                                    setShowClientSuggestions(true);
                                    if (e.target.value === '') setSelectedClient('');
                                }}
                                onFocus={() => setShowClientSuggestions(true)}
                                className="bg-white text-black border rounded-l-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {showClientSuggestions && clientSearchTerm && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-b-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                    {Array.isArray(filteredClients) && filteredClients.length > 0 ? (
                                        filteredClients.map(client => (
                                            <div
                                                key={client.id}
                                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-800 border-b border-slate-100 last:border-0"
                                                onClick={() => {
                                                    setSelectedClient(client.id);
                                                    setClientSearchTerm(client.name);
                                                    setShowClientSuggestions(false);
                                                }}
                                            >
                                                <div className="font-medium">{client.name}</div>
                                                <div className="text-xs text-slate-500">Saldo: {formatCurrency(client.balance || 0)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-slate-500 text-sm">No se encontraron clientes</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowClientModal(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition flex items-center gap-1"
                            title="Agregar Nuevo Cliente"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-300 mx-2"></div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={isCredit}
                                onChange={e => setIsCredit(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <span className="text-slate-700 font-medium">Venta a crédito</span>
                    </label>
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
                                ref={searchInputRef}
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
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
                                {filteredProducts.map(product => (
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock <= product.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>
                                            <button
                                                onClick={e => { e.stopPropagation(); addToCart(product); }}
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
                            <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-semibold text-white">{cart.length}</span>
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
                                    {cart.map(item => (
                                        <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                                                    <p className="text-xs text-slate-500">{formatCurrency(item.price)} c/u</p>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
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
            <ClientModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} onSave={handleAddClient} />
        </div>
    );
}
