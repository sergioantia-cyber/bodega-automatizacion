import { LocalNotifications } from '@capacitor/local-notifications';
import { CustomerOrder } from '../types';
import { soundService } from './soundService';

export const notificationService = {
  async init() {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      // Crear canal de notificación para Android
      await LocalNotifications.createChannel({
        id: 'orders_channel',
        name: 'Pedidos de Bodega',
        description: 'Alertas de nuevos pedidos con GPS',
        importance: 5, // High
        visibility: 1, // Public
        sound: 'res_custom_notification',
        vibration: true
      });
    } catch {
      // Entorno navegador web o permisos no soportados
    }
  },

  async notifyNewOrder(order: CustomerOrder) {
    // 1. Alerta auditiva continua
    soundService.playSuccessChime();

    // 2. Vibración física en dispositivo
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 500]);
      } catch {
        // Ignorar si el navegador bloquea vibración
      }
    }

    // 3. Notificación nativa en la barra de Android
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `🛵 ¡Nuevo Pedido de ${order.customerName}!`,
            body: `Total: $${order.total.toFixed(2)} - Toca para ver ubicación GPS`,
            id: Date.now() % 100000,
            channelId: 'orders_channel',
            schedule: { at: new Date(Date.now() + 100) },
            extra: { orderId: order.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Local notifications fallback:', err);
    }
  }
};
