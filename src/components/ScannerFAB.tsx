import React from 'react';
import { ScanBarcode } from 'lucide-react';

interface ScannerFABProps {
  onClick: () => void;
}

export const ScannerFAB: React.FC<ScannerFABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Escanear código de barras"
      className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-2xl bg-bogad-yellow text-slate-950 border-2 border-slate-950 shadow-tactile-lg flex items-center justify-center select-none touch-manipulation cursor-pointer transition-all duration-75 active:translate-y-1.5 active:translate-x-1 active:shadow-none hover:bg-yellow-300 group"
    >
      <div className="relative flex items-center justify-center">
        <ScanBarcode className="w-7 h-7 stroke-[2.5] text-slate-950 group-hover:scale-110 transition-transform" />
      </div>
      <span className="sr-only">Escanear código de barras</span>
    </button>
  );
};
