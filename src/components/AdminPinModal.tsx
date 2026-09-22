import React, { useState } from 'react';
import { X, ShieldAlert, Delete, Lock } from 'lucide-react';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { soundService } from '../services/soundService';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Código de seguridad confidencial en base64 ('0424')
const AUTH_HASH = 'MDQyNA==';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      // Verificar código
      if (btoa(newPin) === AUTH_HASH) {
        soundService.playSuccessChime();
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 150);
      } else {
        soundService.playWarning();
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <TactileCard
        variant="default"
        className="w-full max-w-xs relative border-3 border-slate-900 shadow-tactile-lg p-5"
      >
        {/* Botón cerrar */}
        <button
          onClick={() => {
            handleClear();
            onClose();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center font-bold text-slate-800 dark:text-white active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-bogad-yellow border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center">
            <Lock className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
            Acceso de Seguridad
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
            Introduce el código para continuar
          </p>
        </div>

        {/* Indicadores de dígitos */}
        <div className="flex justify-center gap-3 my-3">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 border-slate-900 transition-all duration-200 ${
                  error
                    ? 'bg-bogad-coral scale-110'
                    : hasDigit
                    ? 'bg-slate-950 dark:bg-bogad-yellow scale-110'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-center text-xs font-black text-bogad-coral flex items-center justify-center gap-1 my-2 animate-bounce">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Código incorrecto</span>
          </div>
        )}

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-900 font-black text-lg text-slate-950 dark:text-white shadow-tactile-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Botón borrar todo */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-900 font-bold text-xs text-slate-600 dark:text-slate-300 shadow-tactile-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
          >
            C
          </button>

          {/* Cero */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-900 font-black text-lg text-slate-950 dark:text-white shadow-tactile-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
          >
            0
          </button>

          {/* Borrar un dígito */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-900 font-bold text-slate-700 dark:text-slate-300 shadow-tactile-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <TactileButton
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => {
              handleClear();
              onClose();
            }}
          >
            Cancelar
          </TactileButton>
        </div>
      </TactileCard>
    </div>
  );
};
