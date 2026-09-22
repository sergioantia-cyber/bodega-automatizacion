import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Send, Copy, Check, ExternalLink, Printer, Globe, QrCode, Edit3 } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { StoreProfile } from '../types';
import { storeService } from '../services/storeService';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';

interface StoreShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  onProfileUpdated?: (updated: StoreProfile) => void;
}

export const StoreShareModal: React.FC<StoreShareModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  onProfileUpdated
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>(storeProfile.catalogUrl || '');

  const shareUrl = storeService.getStoreShareUrl(storeProfile.slug, storeProfile.catalogUrl);

  // Generar imagen de código QR real
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      soundService.playPop();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    soundService.playPop();
    const message = `👋 ¡Hola! Te invito a ver nuestro catálogo oficial en línea de *${storeProfile.name}* 🏪.\n\nPuedes ver productos, precios y pedir a domicilio al instante desde tu celular:\n👉 ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleOpenBrowser = () => {
    soundService.playPop();
    window.open(shareUrl, '_blank');
  };

  const handleSaveCustomUrl = () => {
    let trimmed = customUrlInput.trim();
    if (!trimmed || trimmed.includes('.onrender.com')) {
      trimmed = `https://${storeService.cleanSlug(storeProfile.name || storeProfile.slug)}.onrender.com`;
    }
    const updated = storageService.saveStoreProfile({
      catalogUrl: trimmed
    });
    soundService.playSuccessChime();
    setIsEditingUrl(false);
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }
  };

  const handlePrint = () => {
    soundService.playPop();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes para imprimir el cartel.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cartel QR - ${storeProfile.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              color: #0F172A;
            }
            .poster {
              max-width: 480px;
              margin: 0 auto;
              border: 4px solid #0F172A;
              border-radius: 24px;
              padding: 36px 24px;
              box-shadow: 8px 8px 0px #0F172A;
            }
            .emoji { font-size: 50px; margin-bottom: 8px; }
            h1 { font-size: 28px; font-weight: 900; margin: 0 0 4px 0; }
            p { font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 24px 0; }
            .qr-box {
              background: #FFF;
              border: 3px solid #0F172A;
              border-radius: 16px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .qr-box img { width: 240px; height: 240px; display: block; }
            .badge {
              display: inline-block;
              background: #FFE600;
              color: #0F172A;
              font-weight: 900;
              font-size: 13px;
              padding: 6px 14px;
              border: 2px solid #0F172A;
              border-radius: 12px;
              margin-bottom: 12px;
            }
            .url {
              font-family: monospace;
              font-weight: 800;
              font-size: 12px;
              word-break: break-all;
              color: #0F172A;
              background: #F1F5F9;
              padding: 8px 12px;
              border-radius: 8px;
            }
            @media print {
              body { padding: 0; }
              .poster { box-shadow: none; border-width: 3px; }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="emoji">${storeProfile.iconEmoji || '🏪'}</div>
            <h1>${storeProfile.name}</h1>
            <p>${storeProfile.slogan || '¡Pide en línea desde tu celular!'}</p>
            <div class="badge">📸 ESCANEA CON TU CÁMARA</div>
            <div class="qr-box">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="url">${shareUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <TactileCard
        variant="yellow"
        className="w-full max-w-sm relative border-3 border-slate-900 shadow-tactile-lg p-5 my-auto"
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center font-black text-slate-950 shadow-tactile-sm active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="text-center pt-1 pb-3">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center">
            <QrCode className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-slate-950 tracking-tight">
            Cartel QR & Enlace del Catálogo
          </h3>
          <p className="text-xs font-bold text-slate-800 mt-0.5">
            Tus clientes escanean este código con su celular para ver productos y hacer pedidos
          </p>
        </div>

        {/* Código QR Real y Escaneable */}
        <div className="bg-white rounded-2xl border-3 border-slate-950 p-4 shadow-tactile text-center mx-auto mb-3 max-w-[240px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Código QR del Catálogo"
              className="w-48 h-48 mx-auto rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-bold text-xs">
              Generando código QR...
            </div>
          )}
          <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-wider text-slate-900 bg-bogad-lime px-2 py-0.5 rounded border border-slate-900">
            Escaneo instantáneo con cámara 📸
          </span>
        </div>

        {/* Enlace Compartible */}
        <div className="bg-white/95 rounded-xl border-2 border-slate-900 p-2.5 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-700 uppercase flex items-center gap-1">
              <Globe className="w-3 h-3" /> Enlace Oficial para Clientes:
            </span>
            <button
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-[10px] font-bold text-slate-900 underline flex items-center gap-0.5"
            >
              <Edit3 className="w-2.5 h-2.5" />
              {isEditingUrl ? 'Cerrar' : 'Configurar Dominio'}
            </button>
          </div>

          {isEditingUrl ? (
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
              <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                Ingresa la dirección web pública donde publicaste la app (ej. Render o Vercel):
              </p>
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder={`https://${storeService.cleanSlug(storeProfile.name || storeProfile.slug)}.onrender.com`}
                className="w-full text-xs font-mono p-2 rounded-lg border-2 border-slate-900 bg-white text-slate-950 focus:outline-none"
              />
              <div className="flex gap-2">
                <TactileButton
                  variant="dark"
                  size="sm"
                  fullWidth
                  onClick={handleSaveCustomUrl}
                  className="text-xs"
                >
                  Guardar Enlace
                </TactileButton>
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingUrl(false)}
                  className="text-xs"
                >
                  Cancelar
                </TactileButton>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono font-black text-slate-950 select-all break-all bg-slate-100 p-1.5 rounded-lg border border-slate-300">
              {shareUrl}
            </p>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2">
          {/* Botón WhatsApp */}
          <TactileButton
            variant="dark"
            size="md"
            fullWidth
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-slate-950 border-2 border-slate-900 hover:bg-[#20bd5a]"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span className="font-black">Enviar Catálogo por WhatsApp</span>
          </TactileButton>

          {/* Fila de Copiar enlace y Abrir */}
          <div className="grid grid-cols-2 gap-2">
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                  <span className="text-green-600 font-black">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </TactileButton>

            <TactileButton
              variant="secondary"
              size="sm"
              onClick={handleOpenBrowser}
              className="flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en Web</span>
            </TactileButton>
          </div>

          {/* Botón Imprimir Cartel de Mostrador */}
          <TactileButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 text-xs font-black mt-1"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Imprimir Cartel QR para el Mostrador</span>
          </TactileButton>
        </div>
      </TactileCard>
    </div>
  );
};
