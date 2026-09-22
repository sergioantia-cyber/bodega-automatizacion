import React, { useState, useMemo } from 'react';
import { X, Printer, Bluetooth, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CustomerOrder, Sale } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { printerService } from '../services/printerService';
import { soundService } from '../services/soundService';

interface ThermalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: CustomerOrder;
  sale?: Sale;
  bodegaName?: string;
}

export const ThermalTicketModal: React.FC<ThermalTicketModalProps> = ({
  isOpen,
  onClose,
  order,
  sale,
  bodegaName = 'BODEGA DON CARLOS'
}) => {
  const [isPrintingBt, setIsPrintingBt] = useState(false);
  const [btStatus, setBtStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const formattedText = useMemo(() => {
    if (order) {
      return printerService.formatOrderComanda(order, bodegaName);
    }
    if (sale) {
      return printerService.formatSaleTicket(sale, bodegaName);
    }
    return '';
  }, [order, sale, bodegaName]);

  if (!isOpen || (!order && !sale)) return null;

  const handleBluetoothPrint = async () => {
    setIsPrintingBt(true);
    setBtStatus(null);
    try {
      const result = await printerService.printViaBluetooth(formattedText);
      if (result.success) {
        soundService.playSuccessChime();
        setBtStatus({ type: 'success', message: result.message });
      } else {
        soundService.playWarning();
        setBtStatus({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      soundService.playWarning();
      setBtStatus({ type: 'error', message: err.message || 'Error de conexión Bluetooth.' });
    } finally {
      setIsPrintingBt(false);
    }
  };

  const handleSystemPrint = () => {
    printerService.printViaSystem(formattedText, order ? `Comanda-${order.orderNumber}` : `Ticket-${sale?.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        <TactileCard variant="yellow" className="relative p-4 flex flex-col max-h-[90vh] shadow-tactile-lg border-2 border-slate-950">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar ticket"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5 z-10"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Encabezado del modal */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
              <Printer className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950 leading-tight">
                {order ? 'Comanda Térmica de Despacho' : 'Ticket de Venta Térmico'}
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                Formato ESC/POS estándar (58mm / 80mm)
              </p>
            </div>
          </div>

          {/* Mensaje de estado Bluetooth */}
          {btStatus && (
            <div className={`p-2 rounded-lg border-2 mb-2 text-xs font-bold flex items-center gap-2 ${
              btStatus.type === 'success'
                ? 'bg-emerald-100 border-emerald-700 text-emerald-950'
                : 'bg-amber-100 border-amber-700 text-amber-950'
            }`}>
              {btStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>{btStatus.message}</span>
            </div>
          )}

          {/* Vista previa del papel térmico con borde dentado */}
          <div className="flex-1 overflow-y-auto bg-amber-50/90 rounded-lg p-3 border-2 border-slate-900 shadow-inner font-mono text-[11px] leading-tight text-slate-900 select-all whitespace-pre-wrap max-h-72">
            {formattedText}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 space-y-2">
            <TactileButton
              variant="primary"
              size="sm"
              fullWidth
              disabled={isPrintingBt}
              onClick={handleBluetoothPrint}
              className="bg-bogad-lime hover:bg-lime-300 text-slate-950 flex items-center justify-center gap-2 py-2.5"
            >
              {isPrintingBt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  <span>Buscando Comandera...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 stroke-[2.5]" />
                  <span>Imprimir en Bluetooth (PT-210)</span>
                </>
              )}
            </TactileButton>

            <div className="flex gap-2">
              <TactileButton
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleSystemPrint}
                className="bg-white hover:bg-slate-100 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Impresión Android / USB</span>
              </TactileButton>

              <TactileButton
                variant="dark"
                size="sm"
                onClick={onClose}
                className="px-4"
              >
                Cerrar
              </TactileButton>
            </div>
          </div>
        </TactileCard>
      </div>
    </div>
  );
};
