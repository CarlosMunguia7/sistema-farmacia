// bootstrap.js - El truco de magia para cargar Electron
const path = require('path');

// Guardamos las rutas originales
const originalPaths = module.paths;

// Filtramos temporalmente las rutas que contienen node_modules
// Esto obliga a require('electron') a buscar el módulo interno en lugar del paquete npm
module.paths = module.paths.filter(p => !p.includes('node_modules'));

let electron;
try {
    electron = require('electron');
} catch (e) {
    // Si falla, restauramos y reintentamos (por si acaso)
    module.paths = originalPaths;
    electron = require('electron');
}

// Restauramos las rutas inmediatamente para que el resto de dependencias funcionen
module.paths = originalPaths;

// Verificamos si funcionó
if (typeof electron === 'string' || !electron.app) {
    console.error('FATAL: No se pudo cargar el módulo interno de Electron.');
    console.error('Electron cargado:', electron);
    // Intento desesperado: buscar en process.mainModule o similar si fuera necesario
    process.exit(1);
}

const { app, BrowserWindow, ipcMain } = electron;

// --- Aquí comienza el código original de main.js ---

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        backgroundColor: '#f8fafc',
        title: 'Sistema de Inventario Farmacia',
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('ping', () => 'pong');
