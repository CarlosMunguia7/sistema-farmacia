const { spawn } = require('child_process');
const electron = require('electron');

console.log('Starting Electron...');
console.log('Electron binary path:', electron);

// Clonamos el entorno actual
const env = { ...process.env };

// ELIMINAMOS la variable problemática
delete env.ELECTRON_RUN_AS_NODE;

// Lanzamos Electron con el entorno limpio
const child = spawn(electron, ['.'], {
    env,
    stdio: 'inherit',
    shell: false
});

child.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
});
