import cron from 'node-cron';
import { cambiarEstado,eliminarNotificacionesArchivadas } from '../controllers/registrosContratosController.js';
const dailyTask = {
    name: 'Actualizar Estados y Eliminar Notificaciones Archivadas',
    schedule: '*/30 * * * *', // Ejecuta cada 30 minutos
    task: async () => {
      try {
        await cambiarEstado();
        await eliminarNotificacionesArchivadas();
  
      } catch (error) {
        console.error('Error en la tarea diaria:', error);
      }
    }
  };
  export default dailyTask;