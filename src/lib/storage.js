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

    // Log initial entry
    if (newProduct.stock > 0) {
        logInventoryMovement({
            productId: newProduct.id,
            productName: newProduct.name,
            sku: newProduct.sku,
            type: 'ENTRADA',
            quantity: newProduct.stock,
            previousStock: 0,
            newStock: newProduct.stock,
            reason: 'Creación de producto',
        });
    }

    return newProduct;
};

export const updateProduct = (id, updatedData) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        const oldProduct = products[index];
        const newStock = updatedData.stock !== undefined ? parseInt(updatedData.stock) : oldProduct.stock;

        // Calculate diff
        const stockDiff = newStock - oldProduct.stock;

        if (stockDiff !== 0) {
            logInventoryMovement({
                productId: oldProduct.id,
                productName: oldProduct.name,
                sku: oldProduct.sku,
                type: stockDiff > 0 ? 'AJUSTE (+)' : 'AJUSTE (-)',
                quantity: Math.abs(stockDiff),
                previousStock: oldProduct.stock,
                newStock: newStock,
                reason: 'Actualización manual / Edición',
            });
        }

        products[index] = { ...products[index], ...updatedData, updatedAt: new Date().toISOString() };
        saveProducts(products);
        return products[index];
    }
    return null;
};

export const deleteProduct = (id) => {
    const products = getProducts();
    const productToDelete = products.find(p => p.id === id);
    if (productToDelete) {
        logInventoryMovement({
            productId: id,
            productName: productToDelete.name,
            sku: productToDelete.sku,
            type: 'SALIDA',
            quantity: productToDelete.stock,
            previousStock: productToDelete.stock,
            newStock: 0,
            reason: 'Eliminación de producto',
        });
    }
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

    // ---- Descontar stock y registrar movimiento ----
    const products = getProducts();
    newSale.items.forEach(item => {
        const prod = products.find(p => p.sku === item.sku || p.name === item.name); // Try looser match
        if (prod) {
            const previousStock = prod.stock || 0;
            prod.stock = Math.max(0, previousStock - item.quantity);

            // Log movement
            logInventoryMovement({
                productId: prod.id,
                productName: prod.name,
                sku: prod.sku,
                type: 'SALIDA',
                quantity: item.quantity,
                previousStock: previousStock,
                newStock: prod.stock,
                reason: `Venta #${newSale.id.slice(-6)}`,
                referenceId: newSale.id
            });
        }
    });
    saveProducts(products);

    return newSale;
};

// ---------- Historial de Movimientos (Kardex) ----------
export const getMovements = () => {
    const data = localStorage.getItem('farmacia_movements');
    return data ? JSON.parse(data) : [];
};

export const saveMovements = (movements) => {
    localStorage.setItem('farmacia_movements', JSON.stringify(movements));
};

export const logInventoryMovement = ({ productId, productName, sku, type, quantity, previousStock, newStock, reason, referenceId }) => {
    const movements = getMovements();
    const newMovement = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        productId,
        productName,
        sku,
        type, // 'ENTRADA', 'SALIDA', 'AJUSTE'
        quantity,
        previousStock,
        newStock,
        reason,
        referenceId,
        date: new Date().toISOString()
    };
    movements.unshift(newMovement); // Add to beginning
    // Optional: Keep only last 1000 movements to save space if needed, but for localstorage 5MB is plenty for text.
    saveMovements(movements);
    return newMovement;
};

export const getProductMovements = (productId) => {
    const movements = getMovements();
    return movements.filter(m => m.productId === productId);
};

// ---------- Inicialización de datos ----------
export const initializeSampleData = () => {
    // Ya no generamos datos de prueba automáticamente
};

export const initializeSampleSales = () => {
    // Ya no generamos ventas de prueba automáticamente
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
    // Verificar si existe el usuario administrador correcto
    const adminExists = users.some(u => u.username === 'Lic. Yoseling Moreno');

    if (!adminExists) {
        // Si no existe, reiniciamos los usuarios (limpieza solicitada) para asegurar el acceso
        const defaultAdmin = {
            id: '1',
            username: 'Lic. Yoseling Moreno',
            password: '2306',
            name: 'Lic. Yoseling Moreno',
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
    // Realizar limpieza única para dejar el sistema en blanco (solo la primera vez o tras actualización)
    // Cambiamos la key para forzar un reset en esta nueva versión "empaquetada"
    const hasReset = localStorage.getItem('SYSTEM_INITIALIZED_V1');

    if (!hasReset) {
        // Limpiar todas las claves principales
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.SALES);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.CLIENTS);
        localStorage.removeItem('farmacia_users');
        localStorage.removeItem('farmacia_movements'); // Limpiar historial también

        localStorage.setItem('SYSTEM_INITIALIZED_V1', 'true');
    }

    // Asegurar que exista el usuario admin
    initializeUsers();
};
