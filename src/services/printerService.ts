import { CustomerOrder, Sale } from '../types';

// Comandos ESC/POS estándar
const ESC = 0x1B;
const GS = 0x1D;

export interface PrinterDevice {
  name?: string;
  id?: string;
}

export const printerService = {
  /**
   * Genera el texto formateado a 32 columnas (58mm estándar) para comanda de delivery
   */
  formatOrderComanda(order: CustomerOrder, bodegaName: string = 'BODEGA DON CARLOS'): string {
    const divider = '--------------------------------\n';
    const dblDivider = '================================\n';
    const dateStr = new Date(order.createdAt).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isLocal = order.deliveryType === 'local';
    const subtotal = order.subtotal ?? order.total;
    const deliveryFee = order.deliveryFee ?? 0;

    let text = '';
    text += '\n';
    text += centerText(bodegaName, 32) + '\n';
    text += centerText(isLocal ? '*** RETIRO EN TIENDA ***' : '*** COMANDA DE DELIVERY ***', 32) + '\n';
    text += dblDivider;
    text += `ORDEN: ${order.orderNumber}\n`;
    text += `FECHA: ${dateStr}\n`;
    text += `MODALIDAD: ${isLocal ? 'RETIRO EN LOCAL' : 'DELIVERY'}\n`;
    text += `ESTADO: ${order.status.toUpperCase()}\n`;
    text += divider;
    text += `CLIENTE: ${order.customerName}\n`;
    text += `TEL: ${order.customerPhone}\n`;
    if (!isLocal) {
      text += `DIR: ${order.address}\n`;
      if (order.referenceNotes) {
        text += `REF: ${order.referenceNotes}\n`;
      }
      if (order.gpsLocation && order.gpsLocation.lat) {
        text += `GPS: ${order.gpsLocation.lat.toFixed(5)}, ${order.gpsLocation.lng.toFixed(5)}\n`;
      }
    } else {
      text += `ENTREGA: Mostrador de la tienda\n`;
      if (order.referenceNotes) {
        text += `NOTA: ${order.referenceNotes}\n`;
      }
    }
    text += dblDivider;
    text += 'CANT PRODUCTO              TOTAL\n';
    text += divider;

    order.items.forEach(item => {
      const qtyStr = `${item.quantity}x `.padEnd(4, ' ');
      const subtotalStr = `$${(item.product.price * item.quantity).toFixed(2)}`;
      const maxNameLen = 32 - qtyStr.length - subtotalStr.length - 1;
      const prodName = item.product.name.slice(0, maxNameLen).padEnd(maxNameLen, ' ');
      text += `${qtyStr}${prodName} ${subtotalStr}\n`;
    });

    text += divider;
    text += alignRight(`SUBTOTAL: $${subtotal.toFixed(2)}`, 32) + '\n';
    if (!isLocal && deliveryFee > 0) {
      text += alignRight(`DELIVERY: $${deliveryFee.toFixed(2)}`, 32) + '\n';
    }
    text += alignRight(`TOTAL A COBRAR: $${order.total.toFixed(2)}`, 32) + '\n';
    text += alignRight(`METODO: ${order.paymentMethod.toUpperCase()}`, 32) + '\n';
    text += dblDivider;
    text += centerText(isLocal ? '¡Tener listo en mostrador!' : '¡Entregar rapido y con cuidado!', 32) + '\n';
    text += '\n\n\n';

    return text;
  },

  /**
   * Genera el texto formateado a 32 columnas (58mm) para ticket de venta en mostrador (POS)
   */
  formatSaleTicket(sale: Sale, bodegaName: string = 'BODEGA DON CARLOS'): string {
    const divider = '--------------------------------\n';
    const dblDivider = '================================\n';
    const dateStr = new Date(sale.timestamp).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let text = '';
    text += '\n';
    text += centerText(bodegaName, 32) + '\n';
    text += centerText('RUC: 10458923011', 32) + '\n';
    text += centerText('Av. Los Laureles 342 - Central', 32) + '\n';
    text += centerText('TICKET DE VENTA', 32) + '\n';
    text += dblDivider;
    text += `TICKET: ${sale.id.slice(-6).toUpperCase()}\n`;
    text += `FECHA:  ${dateStr}\n`;
    if (sale.customerName) {
      text += `CLIENTE: ${sale.customerName}\n`;
    }
    text += divider;
    text += 'CANT DESCRIPCION           TOTAL\n';
    text += divider;

    sale.items.forEach(item => {
      const qtyStr = `${item.quantity}x `.padEnd(4, ' ');
      const subtotalStr = `$${(item.product.price * item.quantity).toFixed(2)}`;
      const maxNameLen = 32 - qtyStr.length - subtotalStr.length - 1;
      const prodName = item.product.name.slice(0, maxNameLen).padEnd(maxNameLen, ' ');
      text += `${qtyStr}${prodName} ${subtotalStr}\n`;
    });

    text += divider;
    text += alignRight(`TOTAL: $${sale.total.toFixed(2)}`, 32) + '\n';
    text += alignRight(`PAGO: ${sale.paymentMethod.toUpperCase()}`, 32) + '\n';

    if (sale.paymentMethod === 'cash') {
      if (sale.receivedAmount) {
        text += alignRight(`RECIBIDO: $${sale.receivedAmount.toFixed(2)}`, 32) + '\n';
      }
      if (sale.changeAmount !== undefined) {
        text += alignRight(`VUELTO: $${sale.changeAmount.toFixed(2)}`, 32) + '\n';
      }
    }

    text += dblDivider;
    text += centerText('¡Gracias por su compra!', 32) + '\n';
    text += centerText('Conserve su comprobante', 32) + '\n';
    text += '\n\n\n';

    return text;
  },

  /**
   * Convierte texto a binario ESC/POS estándar con comandos de corte de papel y codificación
   */
  encodeEscPos(text: string): Uint8Array {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);

    // Inicializar [ESC @] + Salto y Corte [ESC d 4] + [GS V 66 0]
    const initCmd = new Uint8Array([ESC, 0x40]);
    const cutCmd = new Uint8Array([ESC, 0x64, 0x04, GS, 0x56, 0x42, 0x00]);

    const combined = new Uint8Array(initCmd.length + encodedText.length + cutCmd.length);
    combined.set(initCmd, 0);
    combined.set(encodedText, initCmd.length);
    combined.set(cutCmd, initCmd.length + encodedText.length);

    return combined;
  },

  /**
   * Conecta e imprime directamente a cualquier comandera Bluetooth portátil (PT-210, MPT-II, etc.)
   * usando la Web Bluetooth API nativa soportada en Android WebView y Chrome.
   */
  async printViaBluetooth(text: string): Promise<{ success: boolean; message: string }> {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      return {
        success: false,
        message: 'Web Bluetooth no está habilitado en este navegador. Utiliza la opción de impresión del sistema.'
      };
    }

    try {
      const bluetooth = (navigator as any).bluetooth;

      // Solicitar dispositivo Bluetooth
      const device = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ]
      });

      if (!device || !device.gatt) {
        return { success: false, message: 'No se pudo vincular con la impresora seleccionada.' };
      }

      const server = await device.gatt.connect();

      // Buscar servicios primarios disponibles
      const services = await server.getPrimaryServices();
      if (services.length === 0) {
        throw new Error('No se encontraron servicios de impresión en el dispositivo.');
      }

      let writeChar: any = null;

      for (const service of services) {
        const chars = await service.getCharacteristics();
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            writeChar = char;
            break;
          }
        }
        if (writeChar) break;
      }

      if (!writeChar) {
        throw new Error('No se encontró canal de escritura en la comandera.');
      }

      const buffer = this.encodeEscPos(text);
      // Escribir en fragmentos de 256 bytes para evitar saturar el buffer BLE
      const chunkSize = 256;
      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        if (writeChar.writeValueWithoutResponse) {
          await writeChar.writeValueWithoutResponse(chunk);
        } else {
          await writeChar.writeValue(chunk);
        }
      }

      // Desconectar prolijamente
      setTimeout(() => {
        try {
          device.gatt.disconnect();
        } catch {
          // Ignorar
        }
      }, 500);

      return { success: true, message: '¡Ticket enviado a la comandera Bluetooth con éxito!' };
    } catch (error: any) {
      console.warn('Bluetooth print error:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con la impresora Bluetooth.'
      };
    }
  },

  /**
   * Abre la ventana de impresión nativa formateada para impresoras térmicas de 58mm / 80mm
   * (Compatible con Android Print Spooler, impresoras de red WiFi y RawBT).
   */
  printViaSystem(text: string, title: string = 'Ticket'): void {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 58mm;
              margin: 0;
              padding: 6px;
              font-size: 11px;
              line-height: 1.25;
              color: black;
              background: white;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              word-break: break-all;
              font-family: inherit;
            }
          </style>
        </head>
        <body>
          <pre>${text}</pre>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

// Utilidades de alineación para 58mm (32 columnas)
function centerText(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  const left = Math.floor((width - str.length) / 2);
  return ' '.repeat(left) + str;
}

function alignRight(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  return ' '.repeat(width - str.length) + str;
}
