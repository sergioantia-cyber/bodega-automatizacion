import React, { useState, useMemo } from 'react';
import { Users, Search, UserPlus, Phone, Calendar, ArrowUpRight, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Customer } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { PaymentModal } from './PaymentModal';
import { DebtReminderModal } from './DebtReminderModal';

interface CustomersViewProps {
  customers: Customer[];
  onUpdateDebt: (customerId: string, amountPaid: number) => void;
  onAddCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onUpdateDebt,
  onAddCustomer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [selectedCustomerForReminder, setSelectedCustomerForReminder] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Formulario nuevo cliente
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerDebt, setNewCustomerDebt] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');

  // Métricas de fiados
  const totalDebt = useMemo(() => {
    return customers
      .filter((c) => c.debt > 0)
      .reduce((sum, c) => sum + c.debt, 0);
  }, [customers]);

  const debtorsCount = useMemo(() => {
    return customers.filter((c) => c.debt > 0).length;
  }, [customers]);

  // Filtrado de clientes
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, searchQuery]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || 'Sin teléfono',
      debt: parseFloat(newCustomerDebt) || 0,
      notes: newCustomerNotes.trim() || undefined,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    onAddCustomer(newCustomer);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerDebt('');
    setNewCustomerNotes('');
    setIsAddCustomerOpen(false);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Resumen Métrico de Fiados */}
      <div className="grid grid-cols-2 gap-3">
        <TactileCard variant="yellow" className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Total por Cobrar
            </span>
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-2xl font-black text-slate-950 tracking-tight">
            ${totalDebt.toFixed(2)}
          </p>
          <span className="text-[10px] font-bold text-slate-700 block">
            {debtorsCount} clientes con fiados
          </span>
        </TactileCard>

        <TactileCard variant="lime" className="p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Cartera Total
            </span>
            <Users className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-2xl font-black text-slate-950 tracking-tight">
            {customers.length}
          </p>
          <span className="text-[10px] font-bold text-slate-700 block">
            {customers.length - debtorsCount} clientes al día
          </span>
        </TactileCard>
      </div>

      {/* Barra de Búsqueda y Botón Nuevo Cliente */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente o celular..."
            className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
          />
        </div>

        <TactileButton
          variant="primary"
          size="sm"
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-1.5 shrink-0 px-3 shadow-tactile-sm"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo</span>
        </TactileButton>
      </div>

      {/* Listado de Clientes con Badges Rojo y Verde */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Libreta de Clientes ({filteredCustomers.length})
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <TactileCard className="text-center py-8">
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              No se encontraron clientes
            </p>
          </TactileCard>
        ) : (
          filteredCustomers.map((customer) => {
            const hasDebt = customer.debt > 0;
            const hasCredit = customer.debt < 0;

            return (
              <TactileCard key={customer.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center font-black text-sm text-slate-900 dark:text-white">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-950 dark:text-white leading-tight">
                        {customer.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                        {customer.lastPaymentDate && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {customer.lastPaymentDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BADGES ROJO (TIENE DEUDA) Y VERDE (AL DÍA / SALDO A FAVOR) */}
                  <div>
                    {hasDebt ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-slate-950 bg-bogad-coral text-white text-xs font-black shadow-tactile-sm animate-pulse">
                        <span>Debe ${customer.debt.toFixed(2)}</span>
                      </span>
                    ) : hasCredit ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-slate-950 bg-bogad-lime text-slate-950 text-xs font-black shadow-tactile-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        <span>A favor +${Math.abs(customer.debt).toFixed(2)}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-slate-950 bg-bogad-lime text-slate-950 text-xs font-black shadow-tactile-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Al día ($0.00)</span>
                      </span>
                    )}
                  </div>
                </div>

                {customer.notes && (
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    "{customer.notes}"
                  </p>
                )}

                {/* BOTÓN DIRECTO "ABONAR" Y "RECORDATORIO WHATSAPP" */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {hasDebt ? 'Cuenta con saldo pendiente' : 'Cuenta al corriente'}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasDebt && (
                      <TactileButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedCustomerForReminder(customer)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-700 text-xs font-black shadow-tactile-sm"
                        title="Enviar recordatorio de cobro por WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.5] text-emerald-800" />
                        <span>Cobrar WhatsApp</span>
                      </TactileButton>
                    )}

                    <TactileButton
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedCustomerForPayment(customer)}
                      className="flex items-center gap-1 px-3 py-1 bg-bogad-lime hover:bg-lime-300 text-slate-950"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Abonar</span>
                    </TactileButton>
                  </div>
                </div>
              </TactileCard>
            );
          })
        )}
      </div>

      {/* MODAL DE RECORDATORIO DE COBRANZA WHATSAPP */}
      {selectedCustomerForReminder && (
        <DebtReminderModal
          customer={selectedCustomerForReminder}
          isOpen={Boolean(selectedCustomerForReminder)}
          onClose={() => setSelectedCustomerForReminder(null)}
        />
      )}

      {/* MODAL DE ABONO EN TIEMPO REAL */}
      {selectedCustomerForPayment && (
        <PaymentModal
          customer={selectedCustomerForPayment}
          isOpen={Boolean(selectedCustomerForPayment)}
          onClose={() => setSelectedCustomerForPayment(null)}
          onConfirmPayment={(customerId, amount) => {
            onUpdateDebt(customerId, -amount);
            setSelectedCustomerForPayment(null);
          }}
        />
      )}

      {/* MODAL PARA AGREGAR NUEVO CLIENTE */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm">
            <TactileCard variant="yellow" className="p-5 relative shadow-tactile-lg border-2 border-slate-950">
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <h3 className="text-base font-black text-slate-950">
                  Registrar Nuevo Cliente
                </h3>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-3 bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ej. Vecina Teresa"
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="999-888-777"
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                    Deuda Inicial ($ opcional)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={newCustomerDebt}
                    onChange={(e) => setNewCustomerDebt(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                    Notas o Dirección
                  </label>
                  <input
                    type="text"
                    value={newCustomerNotes}
                    onChange={(e) => setNewCustomerNotes(e.target.value)}
                    placeholder="Casa verde al frente de la bodega"
                    className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <TactileButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddCustomerOpen(false)}
                    className="w-1/3"
                  >
                    Cancelar
                  </TactileButton>

                  <TactileButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-2/3 bg-bogad-lime hover:bg-lime-300 font-black text-slate-950"
                  >
                    Guardar Cliente
                  </TactileButton>
                </div>
              </form>
            </TactileCard>
          </div>
        </div>
      )}
    </div>
  );
};
