// Sistema de almacenamiento local usando localStorage
// En el futuro se puede migrar a una base de datos más robusta

const STORAGE_KEYS = {
    PRODUCTS: 'farmacia_products',
    SALES: 'farmacia_sales',
    SETTINGS: 'farmacia_settings',
    CLIENTS: 'farmacia_clients',
};

// ---------- Productos ----------
export const getProducts = () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
};

export const saveProducts = (products) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const addProduct = (product) => {
    const products = getProducts();
    const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
};

export const updateProduct = (id, updatedData) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedData, updatedAt: new Date().toISOString() };
        saveProducts(products);
        return products[index];
    }
    return null;
};

export const deleteProduct = (id) => {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    return filtered;
};

// ---------- Ventas ----------
export const getSales = () => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
};

export const saveSales = (sales) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

/**
 * addSale
 *  - Guarda la venta en el historial
 *  - Reduce el stock de los productos vendidos
 */
export const addSale = (sale) => {
    const sales = getSales();
    const newSale = {
        ...sale,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    sales.push(newSale);
    saveSales(sales);

    // ---- Descontar stock ----
    const products = getProducts();
    newSale.items.forEach(item => {
        const prod = products.find(p => p.name === item.name);
        if (prod) {
            prod.stock = Math.max(0, (prod.stock || 0) - item.quantity);
        }
    });
    saveProducts(products);

    return newSale;
};

// ---------- Inicialización de datos ----------
export const initializeSampleData = () => {
    const products = getProducts();
    if (products.length === 0) {
        const sampleProducts = [
            {
                id: '1',
                name: 'Paracetamol 500mg',
                sku: 'MED-001',
                category: 'Analgésicos',
                price: 12.50,
                stock: 150,
                minStock: 20,
                expiryDate: '2025-12-31',
                supplier: 'Farmacéutica Nacional',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Ibuprofeno 400mg',
                sku: 'MED-002',
                category: 'Antiinflamatorios',
                price: 18.75,
                stock: 85,
                minStock: 15,
                expiryDate: '2025-10-15',
                supplier: 'Farmacéutica Nacional',
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                name: 'Amoxicilina 500mg',
                sku: 'MED-003',
                category: 'Antibióticos',
                price: 45.00,
                stock: 60,
                minStock: 10,
                expiryDate: '2025-08-20',
                supplier: 'Laboratorios del Centro',
                createdAt: new Date().toISOString(),
            },
            {
                id: '4',
                name: 'Loratadina 10mg',
                sku: 'MED-004',
                category: 'Antihistamínicos',
                price: 8.25,
                stock: 200,
                minStock: 30,
                expiryDate: '2026-03-10',
                supplier: 'Farmacéutica Nacional',
                createdAt: new Date().toISOString(),
            },
            {
                id: '5',
                name: 'Omeprazol 20mg',
                sku: 'MED-005',
                category: 'Antiácidos',
                price: 22.00,
                stock: 5,
                minStock: 15,
                expiryDate: '2025-11-30',
                supplier: 'Laboratorios del Centro',
                createdAt: new Date().toISOString(),
            },
        ];
        saveProducts(sampleProducts);
    }
};

export const initializeSampleSales = () => {
    const sales = getSales();
    if (sales.length === 0) {
        const now = new Date();
        const sampleSales = [
            {
                id: '1',
                items: [
                    { name: 'Paracetamol 500mg', quantity: 2, price: 12.50 },
                    { name: 'Ibuprofeno 400mg', quantity: 1, price: 18.75 }
                ],
                total: 43.75,
                createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '2',
                items: [
                    { name: 'Amoxicilina 500mg', quantity: 1, price: 45.00 },
                ],
                total: 45.00,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '3',
                items: [
                    { name: 'Loratadina 10mg', quantity: 3, price: 8.25 },
                    { name: 'Omeprazol 20mg', quantity: 2, price: 22.00 }
                ],
                total: 68.75,
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            },
        ];
        saveSales(sampleSales);
    }
};

// ---------- Caja Diaria ----------
export const getCashRegister = () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = data ? JSON.parse(data) : {};
    return settings.cashRegister || { initialBalance: 1200.00, expenses: [] };
};

export const saveCashRegister = (cashRegister) => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = data ? JSON.parse(data) : {};
    settings.cashRegister = cashRegister;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const setInitialBalance = (amount) => {
    const cashRegister = getCashRegister();
    cashRegister.initialBalance = amount;
    saveCashRegister(cashRegister);
};

export const addExpense = (expense) => {
    const cashRegister = getCashRegister();
    const newExpense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    cashRegister.expenses.push(newExpense);
    saveCashRegister(cashRegister);
    return newExpense;
};

export const getExpenses = () => {
    const cashRegister = getCashRegister();
    return cashRegister.expenses || [];
};

export const deleteExpense = (id) => {
    const cashRegister = getCashRegister();
    cashRegister.expenses = cashRegister.expenses.filter(e => e.id !== id);
    saveCashRegister(cashRegister);
};

// ---------- Clientes ----------
export const getClients = () => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
};

export const saveClients = (clients) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const addClient = (client) => {
    const clients = getClients();
    const newClient = {
        ...client,
        id: Date.now().toString(),
        balance: 0,
        payments: [],
        createdAt: new Date().toISOString(),
    };
    clients.push(newClient);
    saveClients(clients);
    return newClient;
};

export const updateClient = (id, updatedData) => {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
        clients[index] = { ...clients[index], ...updatedData, updatedAt: new Date().toISOString() };
        saveClients(clients);
        return clients[index];
    }
    return null;
};

export const deleteClient = (id) => {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== id);
    saveClients(filtered);
    return filtered;
};

export const addPayment = (clientId, payment) => {
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
        if (!client.payments) client.payments = [];
        const newPayment = {
            ...payment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        client.payments.push(newPayment);
        client.balance = (client.balance || 0) - payment.amount;
        saveClients(clients);
        return newPayment;
    }
    return null;
};

export const addCreditSale = (clientId, saleAmount) => {
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
        client.balance = (client.balance || 0) + saleAmount;
        saveClients(clients);
        return client;
    }
    return null;
};

// ---------- Alertas de vencimiento ----------
/**
 * getExpiringProducts
 * @param {number} days - número de días a partir de hoy
 * @returns {Array} lista de productos que vencen dentro del rango
 */
export const getExpiringProducts = (days = 30) => {
    const products = getProducts();
    const now = new Date();
    const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return products.filter(p => {
        const exp = new Date(p.expiryDate);
        return exp >= now && exp <= limit;
    });
};

// ---------- Usuarios y Autenticación ----------
export const getUsers = () => {
    const data = localStorage.getItem('farmacia_users');
    return data ? JSON.parse(data) : [];
};

export const saveUsers = (users) => {
    localStorage.setItem('farmacia_users', JSON.stringify(users));
};

export const initializeUsers = () => {
    const users = getUsers();
    if (users.length === 0) {
        const defaultAdmin = {
            id: '1',
            username: 'admin',
            password: '123', // En producción idealmente se usaría hash
            name: 'Administrador',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        saveUsers([defaultAdmin]);
    }
};

export const validateLogin = (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
};

export const addUser = (user) => {
    const users = getUsers();
    // Validar que el username no exista
    if (users.some(u => u.username === user.username)) {
        throw new Error('El nombre de usuario ya existe');
    }
    const newUser = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
};

export const deleteUser = (id) => {
    const users = getUsers();
    // Evitar borrar al último admin o al usuario actual (esto se maneja mejor en UI, pero aquí protegemos al admin principal si es necesario)
    const filtered = users.filter(u => u.id !== id);
    saveUsers(filtered);
    return filtered;
};

// ---------- Respaldo y Restauración ----------
export const createBackup = () => {
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            products: getProducts(),
            sales: getSales(),
            settings: getCashRegister(), // Ajustado para guardar settings completos si fuera necesario
            clients: getClients(),
            users: getUsers(),
        }
    };
    return JSON.stringify(backup, null, 2);
};

export const restoreBackup = (jsonString) => {
    try {
        const backup = JSON.parse(jsonString);
        if (!backup.data) throw new Error('Formato de archivo inválido');

        // Restaurar datos
        if (backup.data.products) saveProducts(backup.data.products);
        if (backup.data.sales) saveSales(backup.data.sales);

        // Restaurar settings/caja
        if (backup.data.settings) {
            const settings = { cashRegister: backup.data.settings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        }

        if (backup.data.clients) saveClients(backup.data.clients);
        if (backup.data.users) saveUsers(backup.data.users);

        return true;
    } catch (error) {
        console.error('Error al restaurar:', error);
        throw new Error('No se pudo restaurar el archivo. Asegúrate de que sea un respaldo válido.');
    }
};

// ---------- Inicialización general ----------
export const initializeApp = () => {
    initializeSampleData();
    initializeSampleSales();
    initializeUsers();
};
