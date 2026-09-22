import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign } from 'lucide-react';
import { Customer } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';

interface PaymentModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (customerId: string, amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirmPayment
}) => {
  const [amount, setAmount] = useState<string>(
    customer.debt > 0 ? customer.debt.toFixed(2) : ''
  );

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const remainingDebt = Math.round((customer.debt - numAmount) * 100) / 100;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    soundService.playSuccessChime();
    onConfirmPayment(customer.id, numAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal de abono"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5 active:shadow-none hover:bg-slate-100"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 leading-tight">
                Registrar Abono
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Cliente: <span className="font-extrabold">{customer.name}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleConfirm} className="space-y-3 bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm">
            {/* Estado actual */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-600 pb-2 border-b border-slate-200">
              <span>Deuda actual:</span>
              <span className={`font-black text-sm ${customer.debt > 0 ? 'text-bogad-coral' : 'text-emerald-600'}`}>
                ${customer.debt.toFixed(2)}
              </span>
            </div>

            {/* Input de abono */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Monto que entrega ($)
              </label>
              <input
                type="number"
                step="0.50"
                min="0.10"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-lg font-black bg-slate-50 border-2 border-slate-900 rounded-xl shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-lime text-slate-900"
              />
            </div>

            {/* Botones rápidos */}
            <div className="flex gap-1.5 flex-wrap">
              {customer.debt > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(customer.debt.toFixed(2))}
                  className="px-2 py-1 rounded-lg bg-bogad-lime text-slate-950 border border-slate-900 text-[11px] font-black shadow-tactile-sm active:translate-y-0.5"
                >
                  Pagar Todo (${customer.debt.toFixed(2)})
                </button>
              )}
              {[5, 10, 20, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v.toFixed(2))}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-900 border border-slate-900 text-[11px] font-bold shadow-tactile-sm active:translate-y-0.5"
                >
                  ${v}
                </button>
              ))}
            </div>

            {/* Previsualización del saldo en tiempo real */}
            <div className="p-2.5 bg-slate-50 rounded-lg border-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Nuevo estado de cuenta:</span>
                {remainingDebt > 0 ? (
                  <span className="font-black text-bogad-coral text-sm">
                    Deberá: ${remainingDebt.toFixed(2)}
                  </span>
                ) : remainingDebt === 0 ? (
                  <span className="font-black text-emerald-600 text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ¡Al día! ($0.00)
                  </span>
                ) : (
                  <span className="font-black text-blue-600 text-sm">
                    Saldo a favor: +${Math.abs(remainingDebt).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <TactileButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="w-1/3"
              >
                Cancelar
              </TactileButton>

              <TactileButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={numAmount <= 0}
                className="w-2/3 bg-bogad-lime hover:bg-lime-300 font-black text-slate-950 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar Abono</span>
              </TactileButton>
            </div>
          </form>
        </TactileCard>
      </div>
    </div>
  );
};
