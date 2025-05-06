import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carga las variables de entorno con manejo robusto de errores
 * @throws {Error} Si hay errores críticos en la carga de variables
 */
export const loadEnv = async () => {
  console.log(`🔍 Cargando variables en modo ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // 1. Intento cargar desde .env en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const envResult = dotenv.config({ path: path.join(__dirname, '../.env') });
      if (envResult.error) {
        throw new Error(`No se pudo cargar .env: ${envResult.error.message}`);
      }
      console.log('✅ Variables cargadas desde .env');
    } 
    // 2. Intento cargar desde app.env en producción
    else {
      const envPath = path.join(process.resourcesPath,'app.env');
      console.log(`Buscando variables en: ${envPath}`);
      
      if (!readFileSync(envPath, { encoding: 'utf-8', flag: 'r' })) {
        throw new Error(`Archivo app.env no encontrado en: ${envPath}`);
      }

      const envFile = readFileSync(envPath, 'utf-8');
      envFile.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
      console.log('✅ Variables cargadas desde app.env');
    }

    // 3. Verificación de variables críticas
    const requiredVars = ['PORT', 'SESSION_SECRET', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`🚨 Variables faltantes: ${missingVars.join(', ')}`);
    }

    console.log('🔐 Todas las variables requeridas están presentes');
    return true;
    
  } catch (error) {
    console.error('❌ Error crítico en loadEnv:', error.message);
    throw error; // Re-lanzamos el error para manejarlo en index.js
  }
};