// Importaciones de Electron y Node.js
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startDB, stopDB } from './backend/config/db.js';
import { startServer } from './backend/index.js';

// Configuración para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al icono de la aplicación
const appIcon = path.join(__dirname, 'build', 'icon.ico');

// Variables globales
let mainWindow;
let expressServer;

/**
 * Crea la ventana principal de la aplicación
 */
async function createWindow() {
  // Configuración de la ventana principal
  mainWindow = new BrowserWindow({
    width: 1200,                         // Ancho inicial
    height: 800,                         // Alto inicial
    minWidth: 800,                       // Ancho mínimo
    minHeight: 600,                      // Alto mínimo
    icon: appIcon,                       // Icono de la aplicación
    title: 'SGC',                        // Título de la ventana
    webPreferences: {
      nodeIntegration: true,             // Permite usar Node.js en el renderer
      contextIsolation: false,           // Compatibilidad con algunas librerías
      webSecurity: true,                 // Seguridad web habilitada
      sandbox: true                      // Sandbox para mayor seguridad
    },
    frame: true,                         // Mostrar barra de título y bordes
    resizable: true,                     // Permitir redimensionamiento
    maximizable: true,                   // Permitir maximizar
    fullscreenable: true                 // Permitir pantalla completa
  });

  // Cargar el contenido de la aplicación
  if (process.env.NODE_ENV === 'development') {
    // Modo desarrollo: Cargar desde el servidor de Vite
    await mainWindow.loadURL('http://localhost:3000');
    
    // Abrir herramientas de desarrollo en modo desarrollo
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Modo producción: Cargar archivos construidos
    await mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }

  // Manejar enlaces externos (abrir en navegador predeterminado)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Evento cuando la ventana se cierra
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Configuración de la aplicación Electron
 */
app.whenReady().then(async () => {
  try {
    console.log('🚀 Iniciando aplicación...');
    
    // 1. Iniciar base de datos
    console.log('🔄 Iniciando MongoDB...');
    await startDB();
    
    // 2. Iniciar servidor Express backend
    console.log('🌐 Iniciando servidor backend...');
    expressServer = await startServer();
    
    // 3. Crear ventana Electron (frontend)
    console.log('💻 Iniciando interfaz gráfica...');
    await createWindow();
    
    console.log('✅ Aplicación iniciada correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    try {
      // Cerrar servidor Express si existe
      if (expressServer) {
        console.log('🛑 Cerrando servidor backend...');
        expressServer.close();
      }
      
      // Detener base de datos
      console.log('🛑 Deteniendo MongoDB...');
      await stopDB();
    } catch (error) {
      console.error('❌ Error durante el cierre:', error);
    } finally {
      app.quit();
    }
  }
});

// macOS: recrear ventana si se hace click en el dock
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('⚠️ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Rejection no manejado en:', promise, 'razón:', reason);
});