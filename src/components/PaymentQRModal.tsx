import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderNumber?: string;
  onPaymentConfirmed?: () => void;
  bodegaName?: string;
  bodegaPhone?: string;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  total,
  orderNumber,
  onPaymentConfirmed,
  bodegaName: customBodegaName,
  bodegaPhone: customBodegaPhone
}) => {
  const [storeProfile, setStoreProfile] = useState(() => storageService.getStoreProfile());

  useEffect(() => {
    if (isOpen) {
      setStoreProfile(storageService.getStoreProfile());
    }
    const handleProfileUpdate = () => {
      setStoreProfile(storageService.getStoreProfile());
    };
    window.addEventListener('bogad_store_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('bogad_store_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [isOpen]);

  const bodegaName = customBodegaName || storeProfile.name;
  const payments = storeProfile.payments;
  const currencySymbol = storeProfile.currencySymbol || '$';

  // Opciones de billetera / banco activas
  type WalletOption = 'nequi' | 'bancolombia' | 'bdv' | 'banesco' | 'bnc';
  
  const availableWallets = React.useMemo(() => {
    const list: WalletOption[] = [];
    if (payments?.colombia?.nequi?.enabled) list.push('nequi');
    if (payments?.colombia?.bancolombia?.enabled) list.push('bancolombia');
    if (payments?.venezuela?.bdv?.enabled) list.push('bdv');
    if (payments?.venezuela?.banesco?.enabled) list.push('banesco');
    if (payments?.venezuela?.bnc?.enabled) list.push('bnc');
    return list;
  }, [payments]);

  const [walletType, setWalletType] = useState<WalletOption>(availableWallets[0] || 'nequi');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Auto-switch wallet si el seleccionado se deshabilita
  useEffect(() => {
    if (availableWallets.length > 0 && !availableWallets.includes(walletType)) {
      setWalletType(availableWallets[0]);
    }
  }, [availableWallets, walletType]);

  // Generar QR dinámico según el método
  useEffect(() => {
    if (!isOpen || availableWallets.length === 0 || !availableWallets.includes(walletType)) {
      setQrDataUrl('');
      return;
    }

    let payload = '';
    let qrColor = '#0F172A';

    if (walletType === 'nequi') {
      const phone = payments?.colombia?.nequi?.phone || customBodegaPhone || '3001234567';
      payload = `nequi://transfer?phone=${phone}&amount=${total.toFixed(2)}&note=${encodeURIComponent(orderNumber || bodegaName)}`;
      qrColor = '#5A189A';
    } else if (walletType === 'bancolombia') {
      const acc = payments?.colombia?.bancolombia?.accountNumber || '123456789';
      payload = `bancolombia://transfer?account=${acc}&amount=${total.toFixed(2)}`;
      qrColor = '#D97706';
    } else if (walletType === 'bdv') {
      const bdv = payments?.venezuela?.bdv;
      payload = `pagomovil://0102?phone=${bdv?.phone || ''}&id=${bdv?.idNumber || ''}&amount=${total.toFixed(2)}`;
      qrColor = '#B91C1C';
    } else if (walletType === 'banesco') {
      const banesco = payments?.venezuela?.banesco;
      payload = `pagomovil://0134?phone=${banesco?.phone || ''}&id=${banesco?.idNumber || ''}&amount=${total.toFixed(2)}`;
      qrColor = '#047857';
    } else {
      const bnc = payments?.venezuela?.bnc;
      payload = `pagomovil://0191?phone=${bnc?.phone || ''}&id=${bnc?.idNumber || ''}&amount=${total.toFixed(2)}`;
      qrColor = '#1D4ED8';
    }

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: qrColor,
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generando QR de pago:', err));
  }, [isOpen, walletType, total, orderNumber, bodegaName, payments, customBodegaPhone, availableWallets]);

  if (!isOpen) return null;

  // Obtener texto a copiar según la billetera activa
  const getCopyText = (): string => {
    if (walletType === 'nequi' && payments?.colombia?.nequi?.enabled) {
      return payments?.colombia?.nequi?.phone || '';
    } else if (walletType === 'bancolombia' && payments?.colombia?.bancolombia?.enabled) {
      return payments?.colombia?.bancolombia?.accountNumber || '';
    } else if (walletType === 'bdv' && payments?.venezuela?.bdv?.enabled) {
      const bdv = payments?.venezuela?.bdv;
      return `${bdv?.phone || ''} ${bdv?.idNumber || ''} 0102`;
    } else if (walletType === 'banesco' && payments?.venezuela?.banesco?.enabled) {
      const ban = payments?.venezuela?.banesco;
      return `${ban?.phone || ''} ${ban?.idNumber || ''} 0134`;
    } else if (walletType === 'bnc' && payments?.venezuela?.bnc?.enabled) {
      const bnc = payments?.venezuela?.bnc;
      return `${bnc?.phone || ''} ${bnc?.idNumber || ''} 0191`;
    }
    return '';
  };

  const handleCopyData = () => {
    const text = getCopyText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundService.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    soundService.playSuccessChime();
    if (onPaymentConfirmed) {
      onPaymentConfirmed();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950 text-center">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal de pago"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Encabezado */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-slate-950 rounded-lg text-[10px] font-black uppercase shadow-tactile-sm text-slate-950 mb-2">
            <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pasarela de Pago Electrónico</span>
          </div>

          <h3 className="text-lg font-black text-slate-950 leading-tight">
            Escanea y Transfiere
          </h3>
          <p className="text-xs font-bold text-slate-800 mt-0.5">
            {bodegaName} • {orderNumber ? `Orden ${orderNumber}` : 'Pago al Instante'}
          </p>

          {/* Selector de Billetera / Banco */}
          {availableWallets.length === 0 ? (
            <div className="p-4 my-4 bg-red-100 dark:bg-red-950/40 border-2 border-red-500 rounded-xl text-center text-xs font-black text-red-700 dark:text-red-300 shadow-tactile-sm">
              ⚠️ No hay métodos de pago electrónicos habilitados por la tienda en este momento.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5 my-3 justify-center">
                {payments?.colombia?.nequi?.enabled && (
                  <button
                    type="button"
                    onClick={() => setWalletType('nequi')}
                    className={`py-1 px-2.5 rounded-xl border-2 font-black text-xs transition-all shadow-tactile-sm ${
                      walletType === 'nequi'
                        ? 'bg-purple-700 text-white border-slate-950 -translate-y-0.5'
                        : 'bg-white text-purple-950 border-slate-900'
                    }`}
                  >
                    🟣 Nequi
                  </button>
                )}

                {payments?.colombia?.bancolombia?.enabled && (
                  <button
                    type="button"
                    onClick={() => setWalletType('bancolombia')}
                    className={`py-1 px-2.5 rounded-xl border-2 font-black text-xs transition-all shadow-tactile-sm ${
                      walletType === 'bancolombia'
                        ? 'bg-amber-400 text-slate-950 border-slate-950 -translate-y-0.5'
                        : 'bg-white text-amber-950 border-slate-900'
                    }`}
                  >
                    🟡 Bancolombia
                  </button>
                )}

                {payments?.venezuela?.bdv?.enabled && (
                  <button
                    type="button"
                    onClick={() => setWalletType('bdv')}
                    className={`py-1 px-2.5 rounded-xl border-2 font-black text-xs transition-all shadow-tactile-sm ${
                      walletType === 'bdv'
                        ? 'bg-red-700 text-white border-slate-950 -translate-y-0.5'
                        : 'bg-white text-red-950 border-slate-900'
                    }`}
                  >
                    🔴 BDV
                  </button>
                )}

                {payments?.venezuela?.banesco?.enabled && (
                  <button
                    type="button"
                    onClick={() => setWalletType('banesco')}
                    className={`py-1 px-2.5 rounded-xl border-2 font-black text-xs transition-all shadow-tactile-sm ${
                      walletType === 'banesco'
                        ? 'bg-emerald-700 text-white border-slate-950 -translate-y-0.5'
                        : 'bg-white text-emerald-950 border-slate-900'
                    }`}
                  >
                    🟢 Banesco
                  </button>
                )}

                {payments?.venezuela?.bnc?.enabled && (
                  <button
                    type="button"
                    onClick={() => setWalletType('bnc')}
                    className={`py-1 px-2.5 rounded-xl border-2 font-black text-xs transition-all shadow-tactile-sm ${
                      walletType === 'bnc'
                        ? 'bg-blue-800 text-white border-slate-950 -translate-y-0.5'
                        : 'bg-white text-blue-950 border-slate-900'
                    }`}
                  >
                    🔵 BNC
                  </button>
                )}
              </div>

              {/* Código QR Renderizado */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-950 shadow-tactile inline-block mx-auto">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Código QR de Pago"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs font-bold text-slate-400">
                    Generando QR...
                  </div>
                )}
              </div>

              {/* Monto exacto */}
              <div className="mt-3 bg-white/90 p-2.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Monto Exacto a Transferir
                </span>
                <span className="text-2xl font-black text-slate-950">
                  {currencySymbol}{total.toFixed(2)}
                </span>
              </div>

              {/* Datos y botón de copiar */}
              <div className="mt-2.5 flex items-center justify-between bg-white p-2 rounded-xl border border-slate-900 text-xs font-bold">
                <div className="text-left font-mono truncate mr-2">
                  <span className="text-[9px] text-slate-500 block uppercase">
                    {walletType === 'nequi'
                      ? 'Celular Nequi'
                      : walletType === 'bancolombia'
                      ? 'Cuenta Bancolombia'
                      : 'Pago Móvil (Teléfono / Cédula / Banco)'}
                  </span>
                  <span className="text-slate-900 text-xs font-black truncate block">
                    {getCopyText()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyData}
                  className="flex items-center gap-1 px-2.5 py-1 bg-bogad-lime hover:bg-lime-300 text-slate-950 rounded-lg border border-slate-900 font-black text-[11px] active:translate-y-0.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 stroke-[2.5]" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Confirmar pago */}
          <div className="mt-3 flex gap-2">
            <TactileButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Volver
            </TactileButton>

            <TactileButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
            >
              <Check className="w-4 h-4 stroke-[3] mr-1" />
              <span>Confirmar</span>
            </TactileButton>
          </div>

        </TactileCard>
      </div>
    </div>
  );
};
