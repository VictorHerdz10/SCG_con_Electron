import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import registrosContratosRoutes from "./routes/registrosContratosRoutes.js";
import facturasRoutes from "./routes/facturasRoutes.js";
import entidadRoutes from "./routes/entidadRoutes.js";
import direccionRoutes from "./routes/direccionRoutes.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import cron from "node-cron";
import dailyTask from "./config/config-con.js";
import backupRoutes from "./routes/backupRoutes.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import trazaRoutes from "./routes/trazasRoutes.js";
import tipoContratoRoutes from "./routes/tipoContratoRoutes.js";
import { loadEnv } from "./helpers/loadEnv.js";


// Configuración inicial - Carga de variables con manejo estricto
try {
  await loadEnv();
  console.log('🟢 Configuración de entorno verificada correctamente');
} catch (error) {
  console.error('🔴 ERROR CRÍTICO:', error.message);
  console.error('La aplicación no puede iniciar sin la configuración adecuada');
  
}

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet({ frameguard: { action: "sameorigin" } }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// Rutas
app.use("/api/usuario", usuarioRoutes);
app.use("/api/contratos", registrosContratosRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/entidad", entidadRoutes);
app.use("/api/direccion", direccionRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/tipo-contrato", tipoContratoRoutes);
app.use("/api/trazas", trazaRoutes);

// Ruta de prueba
app.use("/api/test", (req, res) => {
  res.json({ message: "Conexión exitosa al backend" });
});

// Tarea CRON
cron.schedule(dailyTask.schedule, dailyTask.task);
console.log("⏰ Tarea CRON iniciada correctamente");

/**
 * Inicia el servidor Express
 * @returns {Promise<import('http').Server>} Instancia del servidor
 */
export const startServer = async () => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar conexión a MongoDB
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB no está conectado');
      }

      const PORT = process.env.PORT || 5000;
      const server = app.listen(PORT, () => {
        console.log(`🌐 Servidor backend corriendo en http://localhost:${PORT}`);
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('❌ Error en el servidor:', error);
        reject(error);
      });

    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error);
      reject(error);
    }
  });
};

// Solo iniciar directamente si no es importado por Electron
if (process.env.STANDALONE_SERVER) {
  startServer().catch(error => {
    console.error('Fallo al iniciar servidor standalone:', error);
    process.exit(1);
  });
}

export default app;