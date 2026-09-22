import React, { useState } from 'react';
import { Truck, MapPin, Phone, CheckCircle2, ExternalLink, PackageCheck, Send, Printer, Store, Eye, X } from 'lucide-react';
import { CustomerOrder, OrderStatus } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';
import { ThermalTicketModal } from './ThermalTicketModal';
import { storageService } from '../services/storageService';
import { orderDispatchService } from '../services/orderDispatchService';

interface OwnerOrdersViewProps {
  orders: CustomerOrder[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OwnerOrdersView: React.FC<OwnerOrdersViewProps> = ({
  orders,
  onUpdateStatus
}) => {
  const [selectedOrderForPrinting, setSelectedOrderForPrinting] = useState<CustomerOrder | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ orderNumber: string; receiptUrl: string } | null>(null);

  const currentStore = storageService.getStoreProfile();
  const currency = currentStore.currencySymbol || '$';

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  const handleStatus = (id: string, status: OrderStatus) => {
    soundService.playSuccessChime();
    onUpdateStatus(id, status);
  };

  const handleCallPedigochos = (order: CustomerOrder) => {
    soundService.playPop();
    const waUrl = orderDispatchService.generatePedigochosWhatsAppLink(order);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-3 pb-12 animate-in fade-in duration-200">
      {/* Resumen de Despacho */}
      <TactileCard variant="yellow" className="p-4 space-y-2 shadow-tactile">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
            Despacho y Entregas
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black px-2 py-0.5 rounded-lg border border-slate-900 bg-white text-slate-950 flex items-center gap-1 shadow-tactile-sm">
              <span className="text-xs">🛵</span>
              <span>Pedigochos: +57 322 794 9751</span>
            </span>
            <Truck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-950 leading-tight">
          Bandeja de Pedidos
        </h2>

        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <p>
            {pendingOrders.length === 0
              ? 'No hay entregas pendientes por despachar'
              : `${pendingOrders.length} pedidos activos`}
          </p>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="inline-flex items-center gap-1 font-black px-1.5 py-0.5 rounded bg-blue-600 text-white border border-slate-900">
              🛵 Delivery
            </span>
            <span className="inline-flex items-center gap-1 font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 border border-slate-900">
              🏪 En Local
            </span>
          </div>
        </div>
      </TactileCard>

      {/* Lista de Pedidos */}
      {orders.length === 0 ? (
        <TactileCard className="text-center py-12 px-6">
          <Truck className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Sin pedidos aún
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Cuando un cliente envíe un pedido por Delivery o para Retiro en Tienda, aparecerá aquí con todos sus detalles.
          </p>
        </TactileCard>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isFinished = order.status === 'delivered';
            const isLocal = order.deliveryType === 'local';
            const isDelivery = !isLocal;
            const subtotal = order.subtotal ?? order.total;
            const deliveryFee = order.deliveryFee ?? 0;

            return (
              <TactileCard
                key={order.id}
                className={`p-4 space-y-3 border-2 shadow-tactile ${
                  isDelivery
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                } ${
                  order.status === 'pending'
                    ? (isDelivery ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-emerald-50/50 dark:bg-emerald-950/20')
                    : isFinished
                    ? 'opacity-80 bg-slate-50 dark:bg-slate-900'
                    : 'bg-white dark:bg-slate-800'
                }`}
              >
                {/* Cabecera del pedido con indicador de color según medio */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-slate-950 dark:text-white">
                        {order.orderNumber}
                      </span>

                      {/* DISTINCIÓN DE MEDIO CON DIFERENTE COLOR */}
                      {isDelivery ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-600 text-white rounded-md border border-slate-900 shadow-tactile-sm flex items-center gap-1">
                          <span>🛵</span>
                          <span>Delivery</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-md border border-slate-900 shadow-tactile-sm flex items-center gap-1">
                          <span>🏪</span>
                          <span>En Local</span>
                        </span>
                      )}

                      {/* Estado del Pedido */}
                      {order.status === 'pending' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-bogad-coral text-white rounded-md border border-slate-900 shadow-tactile-sm animate-pulse">
                          Nuevo
                        </span>
                      )}
                      {order.status === 'accepted' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-bogad-cyan text-slate-950 rounded-md border border-slate-900 shadow-tactile-sm">
                          Empacando
                        </span>
                      )}
                      {order.status === 'delivering' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-500 text-white rounded-md border border-slate-900 shadow-tactile-sm">
                          En Camino 🛵
                        </span>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-bogad-lime text-slate-950 rounded-md border border-slate-900 shadow-tactile-sm">
                          Completado ✅
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      👤 {order.customerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-950 dark:text-white">
                      {currency}{order.total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                </div>

                {/* MODALIDAD DELIVERY: DIRECCIÓN + GPS */}
                {isDelivery ? (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-900 shadow-tactile-sm space-y-2">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-bogad-coral shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-black text-slate-950 dark:text-white">
                          {order.address}
                        </p>
                        {order.referenceNotes && (
                          <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
                            Ref: "{order.referenceNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {order.gpsLocation && order.gpsLocation.mapsUrl && (
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500">
                          GPS: {order.gpsLocation.lat}, {order.gpsLocation.lng} (±{order.gpsLocation.accuracy || 10}m)
                        </span>

                        <a
                          href={order.gpsLocation.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bogad-cyan text-slate-950 font-black text-xs rounded-lg border border-slate-900 shadow-tactile-sm active:translate-y-0.5 hover:bg-cyan-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Abrir Google Maps</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODALIDAD EN LOCAL / RETIRO EN TIENDA */
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-600 shadow-tactile-sm flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-black">Retiro en Mostrador / Tienda</p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        {order.referenceNotes ? `Nota del cliente: "${order.referenceNotes}"` : 'El cliente vendrá a recoger su compra.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contacto directo con cliente */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{order.customerPhone}</span>
                  </span>

                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-extrabold text-emerald-600 underline flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Escribir al Cliente</span>
                  </a>
                </div>

                {/* DESGLOSE DE PRODUCTOS Y PRECIOS */}
                <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-900 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 block">
                    Productos a entregar:
                  </span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {currency}{(item.quantity * item.product.price).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-1.5 border-t border-slate-300 dark:border-slate-700 space-y-0.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
                      <span>Precio solo productos:</span>
                      <span className="font-mono">{currency}{subtotal.toFixed(2)}</span>
                    </div>

                    {isDelivery && (
                      <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
                        <span>Costo Delivery:</span>
                        <span className="font-mono">+{currency}{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-1 border-t border-slate-300 dark:border-slate-700 flex justify-between font-black text-slate-950 dark:text-white text-sm">
                      <span>Precio Total:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400">{currency}{order.total.toFixed(2)}</span>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                      Método de Pago: <strong className="uppercase">{order.paymentMethod}</strong>
                    </div>
                  </div>
                </div>

                {/* COMPROBANTE DE PAGO ADJUNTADO */}
                {order.paymentReceipt ? (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-xl flex items-center justify-between gap-2 shadow-tactile-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={order.paymentReceipt}
                        alt="Comprobante"
                        className="w-12 h-12 object-cover rounded-lg border-2 border-slate-900 shrink-0 cursor-pointer shadow-tactile-xs hover:opacity-90 active:scale-95 transition-transform"
                        onClick={() => setViewingReceipt({ orderNumber: order.orderNumber, receiptUrl: order.paymentReceipt! })}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-black text-amber-950 dark:text-amber-200 block truncate">
                          🧾 Comprobante de Pago
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                          ✓ Adjuntado por el cliente
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingReceipt({ orderNumber: order.orderNumber, receiptUrl: order.paymentReceipt! })}
                      className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg border-2 border-slate-900 shadow-tactile-sm flex items-center gap-1.5 active:translate-y-0.5 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ver Foto</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>🧾 Comprobante:</span>
                    <span>Sin imagen adjunta (Efectivo)</span>
                  </div>
                )}

                {/* BOTÓN EXCLUSIVO PARA PEDIDOS DELIVERY: LLAMAR A DOMICILIO CON MOTO 🛵 */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  {isDelivery && (
                    <TactileButton
                      variant="coral"
                      size="sm"
                      fullWidth
                      onClick={() => handleCallPedigochos(order)}
                      className="bg-bogad-coral hover:bg-orange-600 text-white flex items-center justify-center gap-2 py-2 px-3 text-xs font-black shadow-tactile-sm border-2 border-slate-900"
                      title="Enviar todos los detalles del pedido a Pedigochos o repartidor"
                    >
                      <span className="text-base">🛵</span>
                      <span>Llamar a Domicilio (Pedigochos)</span>
                    </TactileButton>
                  )}

                  <TactileButton
                    variant="secondary"
                    size="sm"
                    fullWidth={!isDelivery}
                    onClick={() => setSelectedOrderForPrinting(order)}
                    className="bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black shadow-tactile-sm border-2 border-slate-900"
                    title="Imprimir comanda física para el despacho"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Comanda 🖨️</span>
                  </TactileButton>
                </div>

                {/* Acciones de Estado de Despacho para el Dueño */}
                {!isFinished && (
                  <div className="pt-1 flex gap-2">
                    {order.status === 'pending' && (
                      <TactileButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleStatus(order.id, 'accepted')}
                        className="bg-bogad-yellow text-slate-950 font-black flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Aceptar y Preparar</span>
                      </TactileButton>
                    )}

                    {order.status === 'accepted' && (
                      <TactileButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleStatus(order.id, 'delivering')}
                        className="bg-blue-500 text-white font-black flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{isDelivery ? 'Enviar con Repartidor 🛵' : 'Listo para Retiro 🏪'}</span>
                      </TactileButton>
                    )}

                    {order.status === 'delivering' && (
                      <TactileButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleStatus(order.id, 'delivered')}
                        className="bg-bogad-lime text-slate-950 font-black flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Entrega y Cobro ✅</span>
                      </TactileButton>
                    )}
                  </div>
                )}
              </TactileCard>
            );
          })}
        </div>
      )}

      {/* Modal de Impresión Térmica de Comanda (Bluetooth / ESC-POS) */}
      {selectedOrderForPrinting && (
        <ThermalTicketModal
          isOpen={Boolean(selectedOrderForPrinting)}
          order={selectedOrderForPrinting}
          onClose={() => setSelectedOrderForPrinting(null)}
        />
      )}

      {/* Modal Visor de Comprobante de Pago */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-4 shadow-tactile-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>🧾 Comprobante:</span>
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
