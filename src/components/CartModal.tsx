import React from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { TactileButton } from './ui/TactileButton';
import { TactileCard } from './ui/TactileCard';

interface CartModalProps {
  isOpen: boolean;
  items: CartItem[];
  totalPrice: number;
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onClearCart: () => void;
  onOpenGPSCheckout?: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  items,
  totalPrice,
  onClose,
  onUpdateQuantity,
  onClearCart,
  onOpenGPSCheckout
}) => {
  if (!isOpen) return null;

  const handleProceed = () => {
    if (items.length === 0) return;
    if (onOpenGPSCheckout) {
      onOpenGPSCheckout();
    } else {
      const summary = items
        .map((i) => `• ${i.quantity}x ${i.product.name} ($${(i.product.price * i.quantity).toFixed(2)})`)
        .join('\n');
      const message = `👋 ¡Hola Bogad! Quiero realizar este pedido desde la app:\n\n${summary}\n\n*Total estimado: $${totalPrice.toFixed(2)}*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t-2 border-x-2 border-slate-950 rounded-t-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-bogad-lime border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Tu Canasta ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar canasta"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5 active:shadow-none"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-bogad-yellow/30 border-2 border-slate-900 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-slate-900 dark:text-white stroke-2 opacity-70" />
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-base">
                Tu canasta está vacía
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Agrega bebidas, snacks o productos de despensa para tu pedido.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <TactileCard key={item.product.id} className="p-3 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-1 border-2 border-slate-900 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    ${item.product.price.toFixed(2)} c/u
                  </p>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    aria-label="Restar uno"
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5 active:shadow-none text-slate-900 dark:text-white"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <span className="w-6 text-center text-sm font-black text-slate-950 dark:text-white">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    aria-label="Sumar uno"
                    className="w-7 h-7 rounded-lg bg-bogad-yellow border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5 active:shadow-none text-slate-950"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </TactileCard>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="pt-3 border-t-2 border-slate-900/10 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Total a pagar:
              </span>
              <span className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <TactileButton
                variant="secondary"
                size="md"
                onClick={onClearCart}
                aria-label="Vaciar carrito"
                className="px-3"
              >
                <Trash2 className="w-4 h-4 text-bogad-coral stroke-[2.5]" />
              </TactileButton>

              <TactileButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleProceed}
                className="flex items-center gap-2 bg-bogad-lime hover:bg-lime-300 font-black text-slate-950"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Pedir con Ubicación GPS 📍</span>
              </TactileButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
