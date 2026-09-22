import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Banknote } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { StoreProfile, StorePaymentConfig } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface PaymentMethodsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentsUpdated?: (updated: StoreProfile) => void;
}

export const PaymentMethodsConfigModal: React.FC<PaymentMethodsConfigModalProps> = ({
  isOpen,
  onClose,
  onPaymentsUpdated
}) => {
  const currentProfile = storageService.getStoreProfile();
  const [payments, setPayments] = useState<StorePaymentConfig>(currentProfile.payments);
  const [countryTab, setCountryTab] = useState<'colombia' | 'venezuela' | 'cash'>('colombia');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Recargar siempre la configuración más fresca al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fresh = storageService.getStoreProfile();
      setPayments(fresh.payments);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = storageService.saveStoreProfile({
      payments
    });

    soundService.playSuccessChime();
    setSavedSuccess(true);

    if (onPaymentsUpdated) {
      onPaymentsUpdated(updated);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <TactileCard className="border-4 border-slate-950 shadow-tactile-lg max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Header */}
          <div className="p-4 border-b-2 border-slate-900 bg-bogad-lime flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center text-xl shrink-0">
                <CreditCard className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-slate-900 rounded">
                  Pasarela Multi-País
                </span>
                <h3 className="text-lg font-black text-slate-950 tracking-tight leading-none mt-0.5">
                  Métodos de Pago
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:translate-y-0.5 shadow-tactile-sm transition-all"
            >
              <X className="w-5 h-5 text-slate-900 stroke-[2.5]" />
            </button>
          </div>

          {/* Selector de País / Región */}
          <div className="flex border-b-2 border-slate-900 bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            <button
              type="button"
              onClick={() => setCountryTab('colombia')}
              className={`flex-1 py-2 px-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                countryTab === 'colombia'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 shadow-tactile-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <span>🇨🇴</span>
              <span>Colombia</span>
            </button>

            <button
              type="button"
              onClick={() => setCountryTab('venezuela')}
              className={`flex-1 py-2 px-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                countryTab === 'venezuela'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 shadow-tactile-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <span>🇻🇪</span>
              <span>Venezuela</span>
            </button>

            <button
              type="button"
              onClick={() => setCountryTab('cash')}
              className={`flex-1 py-2 px-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                countryTab === 'cash'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-900 shadow-tactile-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <span>💵</span>
              <span>Efectivo</span>
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(92vh-170px)]">
            
            {savedSuccess && (
              <div className="p-3 bg-bogad-lime/30 border-2 border-slate-900 rounded-xl flex items-center gap-2 text-slate-950 font-black text-xs shadow-tactile-sm animate-bounce">
                <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
                <span>¡Métodos de pago guardados! Se actualizaron en el catálogo del cliente.</span>
              </div>
            )}

            {/* SECCIÓN 1: COLOMBIA */}
            {countryTab === 'colombia' && (
              <div className="space-y-4">
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-400 rounded-xl text-xs text-sky-900 dark:text-sky-200 font-bold">
                  Configura tus cuentas de <strong>Nequi</strong> y <strong>Bancolombia</strong>. Tus clientes verán los datos con botón de copiar al ordenar.
                </div>

                {/* NEQUI */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs border border-slate-900 shadow-tactile-sm">
                        N
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-950 dark:text-white">
                          Nequi Colombia
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Transferencias instantáneas por celular
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payments.colombia.nequi.enabled}
                        onChange={(e) => {
                          setPayments({
                            ...payments,
                            colombia: {
                              ...payments.colombia,
                              nequi: { ...payments.colombia.nequi, enabled: e.target.checked }
                            }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700 border-2 border-slate-900"></div>
                    </label>
                  </div>

                  {payments.colombia.nequi.enabled && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Celular Nequi (10 dígitos)
                        </label>
                        <input
                          type="tel"
                          value={payments.colombia.nequi.phone}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              colombia: {
                                ...payments.colombia,
                                nequi: { ...payments.colombia.nequi, phone: e.target.value }
                              }
                            });
                          }}
                          placeholder="3001234567"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Titular de la Cuenta
                        </label>
                        <input
                          type="text"
                          value={payments.colombia.nequi.holderName}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              colombia: {
                                ...payments.colombia,
                                nequi: { ...payments.colombia.nequi, holderName: e.target.value }
                              }
                            });
                          }}
                          placeholder="Nombre y Apellido"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BANCOLOMBIA */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs border border-slate-900 shadow-tactile-sm">
                        B
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-950 dark:text-white">
                          Bancolombia
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Transferencia o código QR a cuenta
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payments.colombia.bancolombia.enabled}
                        onChange={(e) => {
                          setPayments({
                            ...payments,
                            colombia: {
                              ...payments.colombia,
                              bancolombia: { ...payments.colombia.bancolombia, enabled: e.target.checked }
                            }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 border-2 border-slate-900"></div>
                    </label>
                  </div>

                  {payments.colombia.bancolombia.enabled && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                            Número de Cuenta
                          </label>
                          <input
                            type="text"
                            value={payments.colombia.bancolombia.accountNumber}
                            onChange={(e) => {
                              setPayments({
                                ...payments,
                                colombia: {
                                  ...payments.colombia,
                                  bancolombia: { ...payments.colombia.bancolombia, accountNumber: e.target.value }
                                }
                              });
                            }}
                            placeholder="123-456789-01"
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                            Tipo de Cuenta
                          </label>
                          <select
                            value={payments.colombia.bancolombia.accountType}
                            onChange={(e) => {
                              setPayments({
                                ...payments,
                                colombia: {
                                  ...payments.colombia,
                                  bancolombia: { ...payments.colombia.bancolombia, accountType: e.target.value as 'ahorros' | 'corriente' }
                                }
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                          >
                            <option value="ahorros">Ahorros</option>
                            <option value="corriente">Corriente</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Titular de la Cuenta
                        </label>
                        <input
                          type="text"
                          value={payments.colombia.bancolombia.holderName}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              colombia: {
                                ...payments.colombia,
                                bancolombia: { ...payments.colombia.bancolombia, holderName: e.target.value }
                              }
                            });
                          }}
                          placeholder="Nombre completo o Razón Social"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: VENEZUELA */}
            {countryTab === 'venezuela' && (
              <div className="space-y-4">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 rounded-xl text-xs text-rose-900 dark:text-rose-200 font-bold">
                  Configura tus datos para <strong>Pago Móvil</strong> en <strong>Banco de Venezuela</strong>, <strong>Banesco</strong> y <strong>BNC</strong>. Los clientes podrán copiar tu cédula, celular y banco en 1 clic.
                </div>

                {/* BANCO DE VENEZUELA (0102) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-[10px] border border-slate-900 shadow-tactile-sm">
                        BDV
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-950 dark:text-white">
                          Banco de Venezuela (0102)
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Pago Móvil BDV en línea
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payments.venezuela.bdv.enabled}
                        onChange={(e) => {
                          setPayments({
                            ...payments,
                            venezuela: {
                              ...payments.venezuela,
                              bdv: { ...payments.venezuela.bdv, enabled: e.target.checked }
                            }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700 border-2 border-slate-900"></div>
                    </label>
                  </div>

                  {payments.venezuela.bdv.enabled && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={payments.venezuela.bdv.phone}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bdv: { ...payments.venezuela.bdv, phone: e.target.value }
                              }
                            });
                          }}
                          placeholder="04121234567"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Cédula / RIF
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.bdv.idNumber}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bdv: { ...payments.venezuela.bdv, idNumber: e.target.value }
                              }
                            });
                          }}
                          placeholder="V-12345678"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Titular
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.bdv.holderName}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bdv: { ...payments.venezuela.bdv, holderName: e.target.value }
                              }
                            });
                          }}
                          placeholder="Titular"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BANESCO (0134) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-[10px] border border-slate-900 shadow-tactile-sm">
                        BAN
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-950 dark:text-white">
                          Banesco (0134)
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Pago Móvil Banesco
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payments.venezuela.banesco.enabled}
                        onChange={(e) => {
                          setPayments({
                            ...payments,
                            venezuela: {
                              ...payments.venezuela,
                              banesco: { ...payments.venezuela.banesco, enabled: e.target.checked }
                            }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700 border-2 border-slate-900"></div>
                    </label>
                  </div>

                  {payments.venezuela.banesco.enabled && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={payments.venezuela.banesco.phone}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                banesco: { ...payments.venezuela.banesco, phone: e.target.value }
                              }
                            });
                          }}
                          placeholder="04141234567"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Cédula / RIF
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.banesco.idNumber}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                banesco: { ...payments.venezuela.banesco, idNumber: e.target.value }
                              }
                            });
                          }}
                          placeholder="V-12345678"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Titular
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.banesco.holderName}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                banesco: { ...payments.venezuela.banesco, holderName: e.target.value }
                              }
                            });
                          }}
                          placeholder="Titular"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BNC (0191) */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-800 text-white flex items-center justify-center font-black text-[10px] border border-slate-900 shadow-tactile-sm">
                        BNC
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-950 dark:text-white">
                          Banco Nacional de Crédito (0191)
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500">
                          Pago Móvil BNC
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payments.venezuela.bnc.enabled}
                        onChange={(e) => {
                          setPayments({
                            ...payments,
                            venezuela: {
                              ...payments.venezuela,
                              bnc: { ...payments.venezuela.bnc, enabled: e.target.checked }
                            }
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800 border-2 border-slate-900"></div>
                    </label>
                  </div>

                  {payments.venezuela.bnc.enabled && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={payments.venezuela.bnc.phone}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bnc: { ...payments.venezuela.bnc, phone: e.target.value }
                              }
                            });
                          }}
                          placeholder="04241234567"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Cédula / RIF
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.bnc.idNumber}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bnc: { ...payments.venezuela.bnc, idNumber: e.target.value }
                              }
                            });
                          }}
                          placeholder="V-12345678"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                          Titular
                        </label>
                        <input
                          type="text"
                          value={payments.venezuela.bnc.holderName}
                          onChange={(e) => {
                            setPayments({
                              ...payments,
                              venezuela: {
                                ...payments.venezuela,
                                bnc: { ...payments.venezuela.bnc, holderName: e.target.value }
                              }
                            });
                          }}
                          placeholder="Titular"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN 3: EFECTIVO */}
            {countryTab === 'cash' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 rounded-2xl space-y-3 shadow-tactile-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-bogad-lime text-slate-950 flex items-center justify-center font-black border-2 border-slate-900 shadow-tactile-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-950 dark:text-white">
                        Pago en Efectivo (Contra entrega)
                      </h4>
                      <p className="text-xs font-semibold text-slate-500">
                        El cliente paga al recibir su pedido en el domicilio
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payments.cash.enabled}
                      onChange={(e) => {
                        setPayments({
                          ...payments,
                          cash: { enabled: e.target.checked }
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bogad-lime border-2 border-slate-900"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="pt-2 flex gap-2 border-t-2 border-slate-200 dark:border-slate-800">
              <TactileButton
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </TactileButton>

              <TactileButton
                type="submit"
                variant="primary"
                size="md"
                className="flex-[1.5] flex items-center justify-center gap-1.5 bg-bogad-lime hover:bg-bogad-lime/90 text-slate-950 font-black shadow-tactile-sm"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Métodos de Pago</span>
              </TactileButton>
            </div>

          </form>

        </TactileCard>
      </div>
    </div>
  );
};
