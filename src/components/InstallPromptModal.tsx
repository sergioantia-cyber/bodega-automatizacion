import React from 'react';
import { Download, Share, PlusSquare, X, Sparkles } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';

interface InstallPromptModalProps {
  isInstallable: boolean;
  isIOS: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isInstallable,
  isIOS,
  onInstall,
  onDismiss
}) => {
  if (!isInstallable && !isIOS) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-30 px-4 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
      <TactileCard variant="yellow" className="relative shadow-tactile-lg border-2 border-slate-950">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-900 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-bold active:translate-y-0.5 active:shadow-none hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-black text-slate-950 tracking-tight leading-tight">
              Instala Bogad en tu inicio
            </h3>
            <p className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
              Accede al instante como una app nativa, funciona offline y ahorra datos.
            </p>

            {isIOS ? (
              <div className="mt-3 p-2.5 bg-white/90 rounded-xl border-2 border-slate-950 text-xs font-bold text-slate-900 flex flex-col gap-1.5 shadow-tactile-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-bogad-lime border border-slate-950 flex items-center justify-center text-[11px] font-black">1</span>
                  <span>Toca el botón <Share className="inline w-3.5 h-3.5 text-blue-600 mb-0.5" /> <strong>Compartir</strong> en Safari</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-bogad-lime border border-slate-950 flex items-center justify-center text-[11px] font-black">2</span>
                  <span>Selecciona <PlusSquare className="inline w-3.5 h-3.5 mb-0.5" /> <strong>"Agregar a Inicio"</strong></span>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <TactileButton
                  variant="dark"
                  size="sm"
                  onClick={onInstall}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Instalar Aplicación</span>
                </TactileButton>
              </div>
            )}
          </div>
        </div>
      </TactileCard>
    </div>
  );
};
