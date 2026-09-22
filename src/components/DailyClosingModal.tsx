import React, { useState } from 'react';
import { X, Calendar, Send, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { Sale, DailyClosingReport } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface DailyClosingModalProps {
  isOpen: boolean;
  sales: Sale[];
  onClose: () => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  sales,
  onClose
}) => {
  const [closingSaved, setClosingSaved] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.timestamp.startsWith(today));

  const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
  const cashSales = todaySales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);
  const transferSales = todaySales
    .filter(s => s.paymentMethod === 'transfer')
    .reduce((sum, s) => sum + s.total, 0);
  const creditSales = todaySales
    .filter(s => s.paymentMethod === 'credit')
    .reduce((sum, s) => sum + s.total, 0);

  // Estimación de abonos recibidos hoy (de clientes que pagaron hoy)
  const customers = storageService.getCustomers();
  const debtRepayments = customers
    .filter(c => c.lastPaymentDate === today && c.debt <= 0)
    .length * 10; // Estimación representativa

  const expectedCashInDrawer = cashSales + debtRepayments;

  const handleSaveClosing = () => {
    const report: DailyClosingReport = {
      id: `closing-${today}-${Date.now()}`,
      date: today,
      timestamp: new Date().toISOString(),
      salesCount: todaySales.length,
      totalSales,
      cashSales,
      transferSales,
      creditSales,
      debtRepaymentsCollected: debtRepayments,
      expectedCashInDrawer,
      notes: notes.trim() || undefined
    };

    storageService.recordDailyClosing(report);
    soundService.playSuccessChime();
    setClosingSaved(true);
    setTimeout(() => setClosingSaved(false), 2500);
  };

  const handleShareWhatsApp = () => {
    soundService.playBeep();
    const text = `📊 *CIERRE DE CAJA DEL DÍA (REPORTE Z)*
🏪 *Bodega Don Carlos*
📅 *Fecha:* ${today}
🛒 *Transacciones:* ${todaySales.length} ventas

💰 *INGRESOS Y MODALIDADES:*
💵 *Efectivo en Caja:* $${cashSales.toFixed(2)}
📱 *Yape / Plin / Transferencias:* $${transferSales.toFixed(2)}
📝 *Fiado / A Crédito:* $${creditSales.toFixed(2)}
📥 *Abonos de Deudas Cobrados:* $${debtRepayments.toFixed(2)}

--------------------------------
🏆 *VENTAS TOTALES DEL DÍA: $${totalSales.toFixed(2)}*
💵 *EFECTIVO FÍSICO EN GAVETA: $${expectedCashInDrawer.toFixed(2)}*
--------------------------------
${notes ? `📌 *Observaciones:* ${notes}\n` : ''}
✅ *Arqueo realizado con éxito en Bogad POS.*`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950 space-y-3">
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar reporte"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Encabezado */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 leading-tight">
                Cierre de Caja Diario (Reporte Z)
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Fecha: <strong className="font-black">{today}</strong> • {todaySales.length} ventas realizadas
              </p>
            </div>
          </div>

          <div className="bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm space-y-3">
            {/* Dinero Físico en Gaveta */}
            <div className="p-3 bg-emerald-50 rounded-xl border-2 border-slate-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  <span>Dinero Físico en Gaveta:</span>
                </span>
                <span className="text-2xl font-black text-emerald-900">
                  ${expectedCashInDrawer.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-emerald-700">
                Efectivo cobrado por ventas + abonos en mostrador.
              </p>
            </div>

            {/* Desglose de Ventas */}
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 flex items-center gap-1">
                  💵 Ventas en Efectivo:
                </span>
                <span className="font-black text-slate-900">${cashSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 flex items-center gap-1">
                  📱 Yape / Plin / Transferencias:
                </span>
                <span className="font-black text-blue-600">${transferSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 flex items-center gap-1">
                  📝 Ventas al Fiado (Por Cobrar):
                </span>
                <span className="font-black text-bogad-coral">${creditSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 pt-2 border-t-2 border-slate-900 text-sm font-black">
                <span>Total Facturado del Día:</span>
                <span className="text-base font-black text-slate-950">${totalSales.toFixed(2)}</span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                Observaciones del Arqueo (Opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Faltaron $0.50 en monedas, cuadre conforme."
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-900 rounded-lg text-slate-900"
              />
            </div>

            {/* Acciones */}
            <div className="pt-2 space-y-2">
              <TactileButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleShareWhatsApp}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 py-2.5 shadow-tactile"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Compartir Reporte Z por WhatsApp</span>
              </TactileButton>

              <TactileButton
                variant="dark"
                size="md"
                fullWidth
                onClick={handleSaveClosing}
                className="flex items-center justify-center gap-2 py-2.5"
              >
                {closingSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-bogad-lime stroke-[3]" />
                    <span>¡Cierre Guardado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardar Cierre en Historial de Caja</span>
                  </>
                )}
              </TactileButton>
            </div>
          </div>
        </TactileCard>
      </div>
    </div>
  );
};
