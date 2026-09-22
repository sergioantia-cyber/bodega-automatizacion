import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Banknote, Smartphone, UserCheck, ArrowRight, CheckCircle2, ScanBarcode, Store, FileSpreadsheet, QrCode, Printer, Lock } from 'lucide-react';
import { CartItem, Customer, PaymentMethod, Sale } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';
import { DailyClosingModal } from './DailyClosingModal';
import { storageService } from '../services/storageService';
import { PaymentQRModal } from './PaymentQRModal';
import { ThermalTicketModal } from './ThermalTicketModal';

interface SalePOSViewProps {
  items: CartItem[];
  customers: Customer[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (sale: Sale, updatedDebtCustomer?: { customerId: string; amountAdded: number }) => void;
  onOpenScanner: () => void;
  onSwitchToCustomer?: () => void;
}

export const SalePOSView: React.FC<SalePOSViewProps> = ({
  items,
  customers,
  totalPrice,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteSale,
  onOpenScanner,
  onSwitchToCustomer
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  // Contado
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Transferencia
  const [transferType, setTransferType] = useState<'yape' | 'plin' | 'banco'>('yape');
  
  // Fiado
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  
  // Venta completada
  const [lastSaleReceipt, setLastSaleReceipt] = useState<Sale | null>(null);

  // Clientes filtrados para fiado
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Cálculos de vuelto
  const numericReceived = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, numericReceived - totalPrice);
  const isCashEnough = numericReceived >= totalPrice;

  const handleOpenCheckout = () => {
    if (items.length === 0) return;
    setCashReceived(totalPrice.toFixed(2));
    setIsCheckoutOpen(true);
  };

  const handleConfirmSale = () => {
    if (items.length === 0) return;

    let saleCustomer: Customer | undefined;
    let amountAddedToDebt = 0;

    if (paymentMethod === 'credit') {
      saleCustomer = selectedCustomer;
      if (!saleCustomer) return;
      amountAddedToDebt = totalPrice;
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: [...items],
      total: totalPrice,
      paymentMethod,
      receivedAmount: paymentMethod === 'cash' ? numericReceived : totalPrice,
      changeAmount: paymentMethod === 'cash' ? changeDue : 0,
      customerId: saleCustomer?.id,
      customerName: saleCustomer?.name
    };

    soundService.playSuccessChime();
    onCompleteSale(
      newSale,
      paymentMethod === 'credit' && saleCustomer
        ? { customerId: saleCustomer.id, amountAdded: amountAddedToDebt }
        : undefined
    );

    setIsCheckoutOpen(false);
    setLastSaleReceipt(newSale);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Banner de Estado del POS */}
      <TactileCard variant="yellow" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
            <Store className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-950 leading-tight">
              Punto de Venta (POS)
            </h2>
            <p className="text-xs font-bold text-slate-800">
              {totalItems === 0 ? 'Canasta lista para escanear' : `${totalItems} productos en caja`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {onSwitchToCustomer && (
            <TactileButton
              variant="coral"
              size="sm"
              onClick={onSwitchToCustomer}
              className="flex items-center gap-1 shadow-tactile-sm text-xs font-black"
              title="Volver al Modo Catálogo de Clientes"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Clientes</span>
            </TactileButton>
          )}

          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => setIsClosingOpen(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-950 shadow-tactile-sm text-xs font-black"
            title="Reporte Z y Cierre de Caja Diario"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5] text-slate-900" />
            <span>Cierre</span>
          </TactileButton>

          <TactileButton
            variant="lime"
            size="sm"
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 shadow-tactile-sm"
          >
            <ScanBarcode className="w-4 h-4 stroke-[2.5]" />
            <span>Escanear</span>
          </TactileButton>
        </div>
      </TactileCard>

      {/* Lista de productos de la venta activa */}
      {items.length === 0 ? (
        <TactileCard className="text-center py-12 px-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-bogad-yellow/30 border-2 border-slate-900 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-slate-900 dark:text-white stroke-2 opacity-70" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            No hay productos cargados en caja
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Usa el botón flotante <strong className="text-slate-900 dark:text-white">Escanear</strong> o agrega desde la pestaña Catálogo.
          </p>

          <div className="mt-5 flex justify-center">
            <TactileButton
              variant="primary"
              size="md"
              onClick={onOpenScanner}
              className="flex items-center gap-2"
            >
              <ScanBarcode className="w-4 h-4 stroke-[2.5]" />
              <span>Abrir Escáner de Código</span>
            </TactileButton>
          </div>
        </TactileCard>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Detalle de Venta
            </span>
            <button
              onClick={onClearCart}
              className="text-xs font-bold text-bogad-coral hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Caja</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-slate-950 dark:text-slate-200">
                      ${item.product.price.toFixed(2)}
                    </span>
                    {item.product.barcode && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                        {item.product.barcode.slice(-5)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controles táctiles de cantidad */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        onRemoveItem(item.product.id);
                      } else {
                        onUpdateQuantity(item.product.id, -1);
                      }
                    }}
                    aria-label="Restar uno"
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5 active:shadow-none text-slate-900 dark:text-white"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-bogad-coral stroke-[2.5]" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    )}
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
            ))}
          </div>

          {/* Resumen Total y Botón Grande 3D Cobrar */}
          <TactileCard variant="yellow" className="p-4 space-y-3 mt-4 shadow-tactile-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-800">
                  Total de Venta
                </span>
                <p className="text-[11px] font-bold text-slate-700">
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
              <span className="text-3xl font-black text-slate-950 tracking-tight">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* BOTÓN GRANDE 3D COBRAR */}
            <TactileButton
              variant="dark"
              size="lg"
              fullWidth
              onClick={handleOpenCheckout}
              className="py-4 text-base flex items-center justify-center gap-2 bg-slate-950 text-white hover:bg-slate-900 shadow-tactile-lg"
            >
              <Banknote className="w-5 h-5 text-bogad-lime stroke-[2.5]" />
              <span>COBRAR (${totalPrice.toFixed(2)})</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5] ml-1" />
            </TactileButton>
          </TactileCard>
        </div>
      )}

      {/* MODAL 3D DE COBRO CON OPCIONES: CONTADO, TRANSFERENCIA, FIADO */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-t-2 border-x-2 border-slate-950 rounded-t-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto">
            {/* Header Cobro */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/10 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Finalizar Venta
                </span>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Monto a Cobrar: ${totalPrice.toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Selector de Método de Pago 3D */}
            <div className="pt-3 space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Selecciona la Modalidad:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Contado */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border-2 border-slate-950 flex flex-col items-center gap-1.5 transition-all duration-75 select-none touch-manipulation ${
                    paymentMethod === 'cash'
                      ? 'bg-bogad-lime shadow-tactile font-black text-slate-950 -translate-y-0.5'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-tactile-sm active:translate-y-0.5'
                  }`}
                >
                  <Banknote className="w-5 h-5 stroke-[2.5]" />
                  <span className="text-xs font-bold leading-none">Contado</span>
                </button>

                {/* 2. Transferencia */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-2.5 rounded-xl border-2 border-slate-950 flex flex-col items-center gap-1.5 transition-all duration-75 select-none touch-manipulation ${
                    paymentMethod === 'transfer'
                      ? 'bg-bogad-cyan shadow-tactile font-black text-slate-950 -translate-y-0.5'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-tactile-sm active:translate-y-0.5'
                  }`}
                >
                  <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  <span className="text-xs font-bold leading-none">Transferencia</span>
                </button>

                {/* 3. Fiado */}
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-xl border-2 border-slate-950 flex flex-col items-center gap-1.5 transition-all duration-75 select-none touch-manipulation ${
                    paymentMethod === 'credit'
                      ? 'bg-bogad-yellow shadow-tactile font-black text-slate-950 -translate-y-0.5'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-tactile-sm active:translate-y-0.5'
                  }`}
                >
                  <UserCheck className="w-5 h-5 stroke-[2.5]" />
                  <span className="text-xs font-bold leading-none">Fiado</span>
                </button>
              </div>

              {/* CONTENIDO SEGÚN MÉTODO */}
              {/* CASO 1: CONTADO */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-slate-900 shadow-tactile-sm">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Dinero Recibido ($)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full px-3 py-2.5 text-lg font-black bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl shadow-tactile-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-lime"
                    />
                  </div>

                  {/* Botones de billetes rápidos */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[totalPrice, 5, 10, 20, 50].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(amount.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border-2 border-slate-900 text-xs font-black shadow-tactile-sm active:translate-y-0.5 text-slate-900 dark:text-white"
                      >
                        ${amount.toFixed(2)}
                      </button>
                    ))}
                  </div>

                  {/* Vuelto en tiempo real */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-900 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                      Vuelto a entregar:
                    </span>
                    <span
                      className={`text-xl font-black ${
                        isCashEnough ? 'text-emerald-600 dark:text-bogad-lime' : 'text-bogad-coral'
                      }`}
                    >
                      ${changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* CASO 2: TRANSFERENCIA */}
              {paymentMethod === 'transfer' && (
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-slate-900 shadow-tactile-sm">
                  <div className="flex gap-2">
                    {(['yape', 'plin', 'banco'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTransferType(t)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-slate-900 text-xs font-black uppercase ${
                          transferType === t
                            ? 'bg-bogad-cyan text-slate-950 shadow-tactile-sm'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-900 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Transferir a celular de Bodega:
                    </p>
                    <p className="text-base font-mono font-black text-slate-950 dark:text-white">
                      {storageService.getStoreProfile().phoneDisplay || storageService.getStoreProfile().whatsappNumber}
                    </p>
                    <p className="text-xs font-black text-bogad-coral">
                      Monto exacto: ${totalPrice.toFixed(2)}
                    </p>

                    <TactileButton
                      type="button"
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => setIsQRModalOpen(true)}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 font-black mt-2 shadow-tactile-sm"
                    >
                      <QrCode className="w-4 h-4 stroke-[2.5]" />
                      <span>Mostrar QR / Datos de Pago (Nequi, Bancolombia, Pago Móvil)</span>
                    </TactileButton>
                  </div>
                </div>
              )}

              {/* CASO 3: FIADO / A CRÉDITO */}
              {paymentMethod === 'credit' && (
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-slate-900 shadow-tactile-sm">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Asociar Cliente a Cuenta:
                    </label>
                    <input
                      type="search"
                      placeholder="Buscar por nombre o teléfono..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-lg text-slate-900 dark:text-white mb-2"
                    />

                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl shadow-tactile-sm text-slate-900 dark:text-white"
                    >
                      {filteredCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.debt > 0 ? `Debe $${c.debt.toFixed(2)}` : 'Al día'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCustomer && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-900 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Deuda previa:</span>
                        <span className={selectedCustomer.debt > 0 ? 'text-bogad-coral font-black' : 'text-emerald-500'}>
                          ${selectedCustomer.debt.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Venta actual a sumar:</span>
                        <span className="font-black text-slate-900 dark:text-white">+${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-300 dark:border-slate-700 flex justify-between text-sm font-black">
                        <span className="text-slate-900 dark:text-white">Nueva deuda estimada:</span>
                        <span className="text-bogad-coral">
                          ${(selectedCustomer.debt + totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de Confirmación Final */}
              <div className="pt-2">
                <TactileButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={paymentMethod === 'cash' && !isCashEnough}
                  onClick={handleConfirmSale}
                  className="bg-bogad-lime hover:bg-lime-300 flex items-center justify-center gap-2 text-slate-950 font-black"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {paymentMethod === 'credit'
                      ? `Anotar Fiado a ${selectedCustomer?.name || 'Cliente'}`
                      : `Confirmar Cobro ($${totalPrice.toFixed(2)})`}
                  </span>
                </TactileButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TICKET DE CONFIRMACIÓN TRAS VENTA */}
      {lastSaleReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <TactileCard variant="yellow" className="w-full max-w-sm p-5 space-y-3 relative shadow-tactile-lg">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 stroke-[3]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-950">
                ¡Venta Registrada!
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Modalidad: <span className="uppercase font-black">{lastSaleReceipt.paymentMethod}</span>
              </p>
              {lastSaleReceipt.customerName && (
                <p className="text-xs font-black text-slate-900">
                  Fiado anotado a: {lastSaleReceipt.customerName}
                </p>
              )}
            </div>

            <div className="p-3 bg-white/90 rounded-xl border-2 border-slate-950 space-y-1 text-xs font-bold">
              <div className="flex justify-between">
                <span>Total Cobrado:</span>
                <span className="font-black">${lastSaleReceipt.total.toFixed(2)}</span>
              </div>
              {lastSaleReceipt.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Recibido:</span>
                    <span>${lastSaleReceipt.receivedAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-black">
                    <span>Vuelto:</span>
                    <span>${lastSaleReceipt.changeAmount?.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <TactileButton
                variant="secondary"
                size="md"
                fullWidth
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center gap-2 font-black border-2 border-slate-900 shadow-tactile-sm"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>Imprimir Ticket Térmico 58mm</span>
              </TactileButton>

              <TactileButton
                variant="dark"
                size="md"
                fullWidth
                onClick={() => setLastSaleReceipt(null)}
              >
                Iniciar Siguiente Venta
              </TactileButton>
            </div>
          </TactileCard>
        </div>
      )}

      {/* MODAL PASARELA DE PAGO QR (YAPE / PLIN) */}
      {isQRModalOpen && (
        <PaymentQRModal
          isOpen={isQRModalOpen}
          total={totalPrice}
          onClose={() => setIsQRModalOpen(false)}
          onPaymentConfirmed={() => {
            setIsQRModalOpen(false);
            handleConfirmSale();
          }}
        />
      )}

      {/* MODAL DE IMPRESIÓN DE TICKET TÉRMICO */}
      {isTicketModalOpen && lastSaleReceipt && (
        <ThermalTicketModal
          isOpen={isTicketModalOpen}
          sale={lastSaleReceipt}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}

      {/* MODAL DE CIERRE DE CAJA DIARIO (REPORTE Z) */}
      {isClosingOpen && (
        <DailyClosingModal
          isOpen={isClosingOpen}
          sales={storageService.getSales()}
          onClose={() => setIsClosingOpen(false)}
        />
      )}
    </div>
  );
};
