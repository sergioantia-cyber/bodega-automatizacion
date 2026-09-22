import React from 'react';
import { Clock, PackageCheck, Truck, CheckCircle2 } from 'lucide-react';
import { CustomerOrder } from '../types';
import { TactileCard } from './ui/TactileCard';

interface DeliveryTrackingCardProps {
  order: CustomerOrder;
}

export const DeliveryTrackingCard: React.FC<DeliveryTrackingCardProps> = ({ order }) => {
  const steps = [
    { key: 'pending', label: 'Recibido', icon: Clock, desc: 'En cola' },
    { key: 'accepted', label: 'Preparando', icon: PackageCheck, desc: 'Empacando' },
    { key: 'delivering', label: 'En Camino', icon: Truck, desc: '🛵 10-15 min' },
    { key: 'delivered', label: 'Entregado', icon: CheckCircle2, desc: 'En puerta' },
  ];

  const getStepIndex = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'delivering': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <TactileCard variant="yellow" className="p-4 space-y-3 border-2 border-slate-950 shadow-tactile-lg">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-slate-900 rounded shadow-tactile-sm">
            Tracking en Vivo 🔴
          </span>
          <h3 className="text-base font-black text-slate-950 mt-1">
            Pedido {order.orderNumber}
          </h3>
        </div>

        <span className="text-sm font-black text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-slate-900 shadow-tactile-sm">
          ${order.total.toFixed(2)}
        </span>
      </div>

      {/* Stepper visual interactivo */}
      <div className="pt-2">
        <div className="flex items-center justify-between relative">
          {/* Línea conectora de fondo */}
          <div className="absolute top-4 left-4 right-4 h-1.5 bg-slate-900/20 -z-0 rounded" />
          
          {/* Línea conectora activa */}
          <div
            className="absolute top-4 left-4 h-1.5 bg-slate-950 -z-0 rounded transition-all duration-300"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-bogad-lime text-slate-950 shadow-tactile scale-110 animate-bounce'
                      : isPassed
                      ? 'bg-slate-950 text-white shadow-tactile-sm'
                      : 'bg-white text-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isPassed ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] font-black mt-1.5 text-center ${
                  isCurrent ? 'text-slate-950 underline' : isPassed ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
                <span className="text-[9px] font-bold text-slate-700">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensaje de estado en vivo */}
      <div className="p-2.5 bg-white/90 rounded-xl border border-slate-900 flex items-center justify-between text-xs font-bold text-slate-800">
        <span>Destino GPS: {order.address.slice(0, 24)}...</span>
        {order.status === 'delivering' && (
          <span className="text-emerald-700 font-black animate-pulse flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Repartidor cerca</span>
          </span>
        )}
      </div>
    </TactileCard>
  );
};
