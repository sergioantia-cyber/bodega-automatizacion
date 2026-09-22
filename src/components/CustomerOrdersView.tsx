import React, { useState } from 'react';
import { ShoppingBag, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp, Repeat, ExternalLink, PackageCheck, Truck, Eye, X } from 'lucide-react';
import { CustomerOrder, CartItem } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';
import { DeliveryTrackingCard } from './DeliveryTrackingCard';

interface CustomerOrdersViewProps {
  orders: CustomerOrder[];
  onRepeatOrder: (items: CartItem[]) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  onRepeatOrder
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [viewingReceipt, setViewingReceipt] = useState<{ orderNumber: string; receiptUrl: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-900 bg-bogad-yellow text-slate-950 text-[10px] font-black uppercase shadow-tactile-sm">
            <Clock className="w-3 h-3" />
            <span>Recibido</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-900 bg-bogad-cyan text-slate-950 text-[10px] font-black uppercase shadow-tactile-sm">
            <PackageCheck className="w-3 h-3" />
            <span>En Preparación</span>
          </span>
        );
      case 'delivering':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-900 bg-blue-500 text-white text-[10px] font-black uppercase shadow-tactile-sm animate-pulse">
            <Truck className="w-3 h-3" />
            <span>En Camino 🛵</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-900 bg-bogad-lime text-slate-950 text-[10px] font-black uppercase shadow-tactile-sm">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            <span>Entregado</span>
          </span>
        );
      default:
        return null;
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || (orders.length > 0 ? orders[0] : null);

  return (
    <div className="space-y-3 pb-12 animate-in fade-in duration-200">
      {/* Seguimiento del Delivery en Vivo (Tracking de Estado) */}
      {activeOrder && (
        <DeliveryTrackingCard order={activeOrder} />
      )}

      {/* Banner Resumen */}
      <TactileCard variant="yellow" className="p-4 space-y-1.5 shadow-tactile">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
            Historial de Compras
          </span>
          <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-black text-slate-950 leading-tight">
          Mis Pedidos Anteriores
        </h2>
        <div className="flex items-center gap-3 pt-1 text-xs font-bold text-slate-800">
          <span>{orders.length} pedidos realizados</span>
          <span>•</span>
          <span>Total consumido: <strong>${totalSpent.toFixed(2)}</strong></span>
        </div>
      </TactileCard>

      {/* Lista de Pedidos */}
      {orders.length === 0 ? (
        <TactileCard className="text-center py-12 px-6">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Aún no tienes pedidos registrados
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Revisa el catálogo y arma tu primera canasta para pedir por delivery.
          </p>
        </TactileCard>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <TactileCard key={order.id} className="p-3.5 space-y-3 shadow-tactile border-2 border-slate-900">
                {/* Cabecera del pedido */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-slate-950 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {order.deliveryType === 'local' ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-md border border-slate-900 shadow-tactile-sm">
                          🏪 En Local
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-600 text-white rounded-md border border-slate-900 shadow-tactile-sm">
                          🛵 Delivery
                        </span>
                      )}
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-950 dark:text-white">
                      ${order.total.toFixed(2)}
                    </span>
                    <button className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-900 flex items-center justify-center">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* DETALLE COMPLETO DEL PEDIDO (PRODUCTOS, GPS, PAGO) */}
                {isExpanded && (
                  <div className="pt-2 border-t-2 border-slate-900/10 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                    {/* Lista de productos desglosada */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-900">
                      <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 block">
                        Productos ({order.items.reduce((s, i) => s + i.quantity, 0)} unidades):
                      </span>

                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700 last:border-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-900 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-black text-slate-900 dark:text-white truncate">
                                {item.product.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-500">
                                {item.quantity} x ${item.product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-slate-950 dark:text-white shrink-0 ml-2">
                            ${(item.quantity * item.product.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Datos de GPS y Entrega */}
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-900 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-bogad-coral shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-950 dark:text-white font-black">{order.address}</p>
                          {order.referenceNotes && (
                            <p className="text-[11px] text-slate-500 italic">Ref: {order.referenceNotes}</p>
                          )}
                        </div>
                      </div>

                      {order.gpsLocation && (
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500">
                            GPS: {order.gpsLocation.lat}, {order.gpsLocation.lng}
                          </span>
                          <a
                            href={order.gpsLocation.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 font-extrabold underline flex items-center gap-0.5"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div className="pt-1.5 flex flex-col gap-1 text-[11px] border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span>Precio solo productos:</span>
                          <span className="font-mono">${(order.subtotal ?? order.total).toFixed(2)}</span>
                        </div>
                        {order.deliveryType !== 'local' && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Costo de envío:</span>
                            <span className="font-mono">+${(order.deliveryFee ?? 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between font-black text-slate-900 dark:text-white pt-0.5 border-t border-slate-200 dark:border-slate-800">
                          <span>Total Pagado:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">${order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-200 dark:border-slate-800">
                        <span>Método de Pago:</span>
                        <span className="uppercase font-black text-slate-900 dark:text-white">
                          {order.paymentMethod}
                        </span>
                      </div>

                      {order.paymentReceipt && (
                        <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-slate-200 dark:border-slate-800">
                          <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                            <span>🧾 Comprobante:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Adjuntado ✓</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewingReceipt({ orderNumber: order.orderNumber, receiptUrl: order.paymentReceipt! })}
                            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] rounded-lg border border-slate-900 shadow-tactile-sm flex items-center gap-1 active:translate-y-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver Comprobante</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botón Repetir Pedido */}
                    <TactileButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        soundService.playBeep();
                        onRepeatOrder(order.items);
                      }}
                      className="bg-bogad-lime hover:bg-lime-300 text-slate-950 font-black flex items-center justify-center gap-2 py-2"
                    >
                      <Repeat className="w-4 h-4 stroke-[2.5]" />
                      <span>Volver a Pedir estos Productos</span>
                    </TactileButton>
                  </div>
                )}
              </TactileCard>
            );
          })}
        </div>
      )}

      {/* Modal Visor de Comprobante de Pago para el Cliente */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-4 shadow-tactile-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>🧾 Mi Comprobante de Pago:</span>
                <span className="font-mono text-bogad-coral">{viewingReceipt.orderNumber}</span>
              </h3>
              <button
                onClick={() => setViewingReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-900 flex items-center justify-center font-black active:translate-y-0.5"
                title="Cerrar"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto rounded-xl border-2 border-slate-900 bg-slate-950/5 dark:bg-black/30 flex items-center justify-center p-2">
              <img
                src={viewingReceipt.receiptUrl}
                alt={`Comprobante ${viewingReceipt.orderNumber}`}
                className="max-w-full h-auto max-h-[64vh] object-contain rounded-lg shadow-tactile-sm"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-slate-900 text-white font-black text-xs rounded-xl shadow-tactile-sm hover:bg-slate-800 active:translate-y-0.5"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
