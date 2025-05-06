import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de rutas
const getDatabasePaths = () => {
  const isDev = process.env.NODE_ENV === "development";
  return {
    mongoPath: isDev
      ? path.join(__dirname, "../../mongodb-bin/mongod.exe")
      : path.join(process.resourcesPath, "mongodb-bin", "mongod.exe"),
    dataPath: isDev
      ? path.join(__dirname, "../../data")
      : path.join(process.resourcesPath, "data"),
  };
};
const { mongoPath, dataPath } = getDatabasePaths();
const DB_PORT = 27017;
const DB_NAME = "registro-contratos";

let mongoServer;
let mongoProcess;

/**
 * Verifica la existencia del binario MongoDB
 */
const verifyMongoBinary = async () => {
  const fs = await import("fs");
  if (!fs.existsSync(mongoPath)) {
    throw new Error(`Binario MongoDB no encontrado en: ${mongoPath}`);
  }
};

/**
 * Inicia el servidor MongoDB embebido
 */
export const startDB = async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      // Crear carpeta data si no existe
      const fs = await import("fs");
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: DB_PORT,
          dbName: DB_NAME,
          dbPath: dataPath, // <--- Aquí especificamos donde guardar los datos
          storageEngine: "wiredTiger",
        },
        binary: {
          version: "7.0.9",
          systemBinary: mongoPath,
          downloadDir: path.dirname(mongoPath),
        },
        autoStart: true,
        silent: true,
      });
      await mongoose.connect(mongoServer.getUri(), {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("✅ MongoDB en memoria listo");
      return;
    }

    // Verificación para producción
    await verifyMongoBinary();
    const fs = await import("fs");

    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    mongoProcess = spawn(mongoPath, [
      "--dbpath",
      dataPath,
      "--port",
      DB_PORT.toString(),
      "--storageEngine",
      "wiredTiger",
      "--quiet",
    ]);

    // Manejo de errores del proceso
    mongoProcess.on("error", (err) => {
      throw new Error(`Error al iniciar MongoDB: ${err.message}`);
    });

    await mongoose.connect(`mongodb://localhost:${DB_PORT}/${DB_NAME}`, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(
      `✅ MongoDB embebido listo en mongodb://localhost:${DB_PORT}/${DB_NAME}`
    );
  } catch (error) {
    throw new Error(`Error al iniciar localMongoPathMongoDB: ${error.message}`);
  }
};

/**
 * Detiene el servidor MongoDB
 */
export const stopDB = async () => {
  try {
    await mongoose.disconnect();

    if (process.env.NODE_ENV === "development") {
      if (mongoServer) await mongoServer.stop();
    } else {
      if (mongoProcess) {
        mongoProcess.kill("SIGINT");
        // Esperar a que el proceso termine completamente
        await new Promise((resolve) => mongoProcess.on("close", resolve));
      }
    }
  } catch (error) {
    throw new Error(`Error al detener MongoDB: ${error.message}`);
  }
};

// Manejo de cierre limpio
const cleanup = async () => {
  await stopDB();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
