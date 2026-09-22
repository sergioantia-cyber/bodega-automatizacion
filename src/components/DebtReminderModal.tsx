import React, { useState } from 'react';
import { X, Send, MessageSquare, Sparkles, Save, Check } from 'lucide-react';
import { Customer } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface DebtReminderModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATE_PRESETS = [
  {
    label: '🌸 Amable y Cercano',
    text: `👋 Hola {nombre}, te saluda {bodega}.\nEsperamos que te encuentres muy bien. Te escribimos con mucho aprecio para recordarte tu saldo pendiente de *${'{deuda}'}*.\nPuedes cancelarlo en efectivo o por Yape/Plin al *{celular}*.\n¡Muchas gracias por tu preferencia y un gran saludo a la familia! 🏪✨`
  },
  {
    label: '📅 Recordatorio Quincenal',
    text: `🗓️ Estimado/a {nombre}, le saludamos de {bodega}.\nLe compartimos su estado de cuenta para este cierre de quincena por un total de *${'{deuda}'}*.\nAgradecemos su puntualidad como siempre. Aceptamos Yape, Plin o efectivo en mostrador.\n¡Que tenga un bendecido día!`
  },
  {
    label: '⚠️ Aviso Amistoso',
    text: `Hola {nombre}, un saludo de parte de {bodega}.\nQueríamos consultar si podrías pasar a regularizar tu cuenta pendiente de *${'{deuda}'}* cuando tengas un tiempito.\nNos ayuda mucho para reponer la mercadería del barrio. ¡Te esperamos pronto! 🤝`
  }
];

export const DebtReminderModal: React.FC<DebtReminderModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const [template, setTemplate] = useState<string>(() => storageService.getDebtTemplate());
  const storeProfile = storageService.getStoreProfile();
  const bodegaName = storeProfile.name;
  const bodegaPhone = storeProfile.phoneDisplay || storeProfile.whatsappNumber;
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Reemplazar variables dinámicas
  const renderMessage = (textTemplate: string): string => {
    return textTemplate
      .replace(/{nombre}/g, customer.name)
      .replace(/{deuda}/g, `$${customer.debt.toFixed(2)}`)
      .replace(/{bodega}/g, bodegaName)
      .replace(/{celular}/g, bodegaPhone);
  };

  const finalMessage = renderMessage(template);

  const handleSaveAsDefault = () => {
    storageService.saveDebtTemplate(template);
    soundService.playBeep();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSendWhatsApp = () => {
    soundService.playSuccessChime();
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950 space-y-3">
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Encabezado */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 leading-tight">
                Cobranza Amable por WhatsApp
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Cliente: <strong className="font-black">{customer.name}</strong> • Deuda: <strong className="text-bogad-coral">${customer.debt.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm space-y-3">
            {/* Presets de tono */}
            <div>
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                Elegir Tono de Mensaje:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {TEMPLATE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTemplate(preset.text)}
                    className="px-2 py-1 bg-slate-100 border border-slate-900 rounded-lg text-[10px] font-black text-slate-800 shadow-tactile-sm active:translate-y-0.5"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de Plantilla */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase text-slate-700">
                  Editar Plantilla del Mensaje:
                </label>
                <span className="text-[9px] font-bold text-slate-500">
                  Usa {'{nombre}'}, {'{deuda}'}, {'{bodega}'}
                </span>
              </div>
              <textarea
                rows={4}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-2.5 text-xs font-medium bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900 shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow font-mono leading-relaxed"
              />
            </div>

            {/* Vista Previa Final */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800">
                <Sparkles className="w-3 h-3" />
                <span>Vista Previa que se enviará a WhatsApp:</span>
              </div>
              <p className="text-xs text-emerald-950 whitespace-pre-wrap leading-snug font-sans">
                {finalMessage}
              </p>
            </div>

            {/* Guardar plantilla predeterminada */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveAsDefault}
                className="text-[11px] font-bold text-slate-700 flex items-center gap-1 hover:underline"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700 font-black">¡Guardada como predeterminada!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar cambios de plantilla</span>
                  </>
                )}
              </button>
            </div>

            {/* Botón de Envío Directo */}
            <TactileButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSendWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 py-3 shadow-tactile-lg"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Enviar por WhatsApp a {customer.name.split(' ')[0]}</span>
            </TactileButton>
          </div>
        </TactileCard>
      </div>
    </div>
  );
};
