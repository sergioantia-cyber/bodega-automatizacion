import React, { useState } from 'react';
import { X, Store, Phone, MapPin, Clock, Check, ExternalLink, AlertCircle, Globe } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { storageService } from '../services/storageService';
import { storeService } from '../services/storeService';
import { soundService } from '../services/soundService';
import { StoreProfile } from '../types';

interface EditStoreProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: StoreProfile) => void;
}

export const EditStoreProfileModal: React.FC<EditStoreProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const currentProfile = storageService.getStoreProfile();

  const [name, setName] = useState(currentProfile.name);
  const [whatsappNumber, setWhatsappNumber] = useState(currentProfile.whatsappNumber);
  const [phoneDisplay, setPhoneDisplay] = useState(currentProfile.phoneDisplay);
  const [address, setAddress] = useState(currentProfile.address);
  const [schedule, setSchedule] = useState(currentProfile.schedule);
  const [catalogUrl, setCatalogUrl] = useState(currentProfile.catalogUrl || `https://${currentProfile.slug || 'don-carlos'}.onrender.com`);
  const [deliveryFee, setDeliveryFee] = useState(String(currentProfile.deliveryFee ?? 2.00));
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSlug = storeService.cleanSlug(name || 'tienda');

  // Al cambiar el nombre de la tienda, sincronizar dinámicamente el dominio de Render si aplica
  const handleNameChange = (newName: string) => {
    setName(newName);
    const newSlug = storeService.cleanSlug(newName || 'tienda');
    // Si la URL actual es vacía o pertenece a un dominio de Render, sincronizar automáticamente
    if (!catalogUrl || catalogUrl.includes('.onrender.com')) {
      setCatalogUrl(`https://${newSlug}.onrender.com`);
    }
  };

  // Limpiar sólo dígitos
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim() || 'Mi Bodega';
    const cleanSlug = storeService.cleanSlug(cleanName);

    // Al guardar, el dominio de render siempre refleja el nuevo nombre de la tienda
    let finalCatalogUrl = catalogUrl.trim();
    if (!finalCatalogUrl || finalCatalogUrl.includes('.onrender.com')) {
      finalCatalogUrl = `https://${cleanSlug}.onrender.com`;
    }

    const updated = storageService.saveStoreProfile({
      name: cleanName,
      slug: cleanSlug,
      whatsappNumber: cleanPhone || '51987654321',
      phoneDisplay: phoneDisplay.trim() || whatsappNumber,
      address: address.trim() || 'Dirección no configurada',
      schedule: schedule.trim() || 'Lunes a Domingo: 7:00 AM - 11:00 PM',
      catalogUrl: finalCatalogUrl,
      deliveryFee: Math.max(0, parseFloat(deliveryFee) || 0),
      pedigochosPhone: '573227949751' // Fijo e inmodificable
    });

    soundService.playSuccessChime();
    setSavedSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleTestWhatsApp = () => {
    if (!cleanPhone) return;
    const testUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('👋 ¡Hola! Probando la conexión de pedidos de WhatsApp de Bogad.')}`;
    window.open(testUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <TactileCard className="border-4 border-slate-950 shadow-tactile-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900">
          
          {/* Header */}
          <div className="p-4 border-b-2 border-slate-900 bg-bogad-yellow flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center">
                <Store className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 tracking-tight">
                  Configurar Datos y WhatsApp
                </h3>
                <p className="text-[11px] font-bold text-slate-800">
                  Número receptor de pedidos con GPS del Carrito
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 active:translate-y-0.5 transition-all"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
            
            {/* Mensaje de éxito */}
            {savedSuccess && (
              <div className="p-3 bg-bogad-lime/20 border-2 border-slate-900 rounded-xl flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                <span>¡Datos de la bodega guardados correctamente!</span>
              </div>
            )}

            {/* Aviso informativo de WhatsApp */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>¿Cómo funciona el número de WhatsApp?</span>
              </div>
              <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                Cuando los clientes arman su carrito y envían su pedido, se abrirá WhatsApp con destino a este número, incluyendo el detalle de productos, total, y su <strong>ubicación GPS en Google Maps</strong>.
              </p>
            </div>

            {/* Campo: Nombre de la Bodega */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Nombre de la Bodega / Tienda
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Bodega Don Carlos"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
                />
              </div>

              {/* Indicador en tiempo real del Dominio de Render vinculado al Nombre */}
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 rounded-xl flex items-center justify-between text-xs shadow-tactile-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] truncate">
                    Dominio en Render:
                  </span>
                </div>
                <code className="font-mono font-black text-blue-700 dark:text-blue-300 text-[11px] truncate ml-1">
                  https://{currentSlug}.onrender.com
                </code>
              </div>
            </div>

            {/* Campo: Número de WhatsApp para Pedidos */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-1">
                  <span>Número de WhatsApp (Receptor)</span>
                  <span className="text-bogad-coral text-[10px] font-black">*OBLIGATORIO</span>
                </label>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="51987654321 (Código país + Celular)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-lime"
                />
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                💡 Incluye el código de país sin '+'. Ejemplos: <strong className="text-slate-900 dark:text-white">51</strong>987654321 (Perú), <strong className="text-slate-900 dark:text-white">52</strong>1XXXXXXXXXX (México), <strong className="text-slate-900 dark:text-white">57</strong>3XXXXXXXXX (Colombia).
              </p>
            </div>

            {/* Botón de Prueba Rápida de WhatsApp */}
            {cleanPhone.length >= 8 && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Probar si este número abre mi WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Campo: Formato Visual de Teléfono */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Teléfono visible para clientes (Formato con espacios)
              </label>
              <input
                type="text"
                value={phoneDisplay}
                onChange={(e) => setPhoneDisplay(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
              />
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Este formato es solo decorativo para que los clientes lo lean fácilmente en la app.
              </p>
            </div>

            {/* Campo: Dirección física */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Dirección del Local / Bodega
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Los Laureles 342, Esquina Central"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
                />
              </div>
            </div>

            {/* Campo: Horario de atención */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase">
                Horario de Atención
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Lunes a Domingo: 7:00 AM - 11:00 PM"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
                />
              </div>
            </div>

            {/* Campo: Enlace Web del Catálogo (Para compartir y QR de clientes) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span>Enlace Web del Catálogo (Render / Dominio)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const synced = `https://${currentSlug}.onrender.com`;
                    setCatalogUrl(synced);
                    soundService.playPop();
                  }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 underline flex items-center gap-1 active:translate-y-0.5"
                  title="Sincronizar automáticamente con el nombre de la tienda"
                >
                  <span>Sincronizar con el nombre</span>
                </button>
              </div>
              <input
                type="url"
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                placeholder={`https://${currentSlug}.onrender.com`}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
              />
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Al cambiar el nombre de la tienda, este dominio de Render se actualiza automáticamente con su nombre para tus clientes y el código QR.
              </p>
            </div>

            {/* Configuración de Delivery y Pedigochos */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border-2 border-slate-900 space-y-3">
              <span className="text-[11px] font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🛵</span>
                <span>Configuración de Domicilios y Pedigochos</span>
              </span>

              {/* Tarifa de Delivery */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tarifa base de envío (Delivery):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">
                    {currentProfile.currencySymbol || '$'}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="2.00"
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Este monto se sumará al total cuando el cliente elija entrega a domicilio.
                </p>
              </div>

              {/* Central Pedigochos (Fijo Oficial) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>Central Oficial Pedigochos (Fijo e Inmodificable):</span>
                </label>
                <div className="px-3 py-2 bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span>+57 322 794 9751</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-bogad-lime text-slate-950 font-black rounded border border-slate-900 shadow-tactile-sm">
                    Fijo 🔒
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500">
                  El botón 🛵 Llamar a Domicilio del panel despacha exclusivamente a esta central.
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex gap-2">
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
                className="flex-1 flex items-center justify-center gap-1.5 bg-bogad-lime hover:bg-bogad-lime/90 text-slate-950 font-black shadow-tactile-sm"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Cambios</span>
              </TactileButton>
            </div>
          </form>

        </TactileCard>
      </div>
    </div>
  );
};
