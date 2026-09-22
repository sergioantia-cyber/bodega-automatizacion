import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, SwitchCamera, Zap, AlertCircle, CheckCircle2, Keyboard } from 'lucide-react';
import { Product } from '../types';
import { soundService } from '../services/soundService';
import { TactileButton } from './ui/TactileButton';
import { QuickProductModal } from './QuickProductModal';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onProductScanned: (product: Product) => void;
  onProductRegistered: (newProduct: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  products,
  onClose,
  onProductScanned,
  onProductRegistered
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scannedProductFeedback, setScannedProductFeedback] = useState<Product | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  
  // Modal de registro rápido
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null);

  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const cooldownRef = useRef<boolean>(false);

  // Procesa el código leído
  const handleBarcodeDecoded = useCallback((barcode: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 1800); // 1.8s cooldown

    setLastScannedCode(barcode);

    // Intentar vibrar
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Buscar si el producto existe
    const foundProduct = products.find(
      (p) => p.barcode === barcode || p.id === barcode
    );

    if (foundProduct) {
      soundService.playBeep();
      setScannedProductFeedback(foundProduct);
      onProductScanned(foundProduct);
      setTimeout(() => setScannedProductFeedback(null), 1600);
    } else {
      // No existe -> Tono de advertencia y abrir modal rápido
      soundService.playWarning();
      setUnknownBarcode(barcode);
    }
  }, [products, onProductScanned]);

  // Inicializar o cambiar cámara
  useEffect(() => {
    if (!isOpen) return;

    setCameraError(null);
    const scannerId = 'reader-canvas';

    const startScanner = async () => {
      try {
        if (!qrCodeScannerRef.current) {
          qrCodeScannerRef.current = new Html5Qrcode(scannerId, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE
            ],
            verbose: false
          });
        }

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.0
        };

        await qrCodeScannerRef.current.start(
          { facingMode },
          config,
          (decodedText) => {
            handleBarcodeDecoded(decodedText.trim());
          },
          () => {
            // Ignorar errores por frame sin código
          }
        );

        // Chequear capacidades de linterna
        try {
          const stream = qrCodeScannerRef.current.getRunningTrackCapabilities();
          if (stream && 'torch' in stream) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err: unknown) {
        console.warn('Cámara no accesible:', err);
        setCameraError(
          'No se pudo acceder a la cámara. Puedes usar el simulador o ingresar el código manualmente.'
        );
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      clearTimeout(timer);
      if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning && !isStoppingRef.current) {
        isStoppingRef.current = true;
        qrCodeScannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            isStoppingRef.current = false;
            qrCodeScannerRef.current?.clear();
          });
      }
    };
  }, [isOpen, facingMode, handleBarcodeDecoded]);

  // Alternar cámara
  const toggleCamera = () => {
    if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning) {
      qrCodeScannerRef.current.stop().then(() => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
      }).catch(() => {});
    } else {
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    }
  };

  // Alternar linterna
  const toggleTorch = async () => {
    if (!qrCodeScannerRef.current || !hasTorch) return;
    try {
      await qrCodeScannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet]
      });
      setTorchOn(!torchOn);
    } catch {
      // Ignorar si falla
    }
  };

  // Simulación manual desde input o presets
  const handleManualSubmit = (codeToUse?: string) => {
    const code = (codeToUse || manualCodeInput).trim();
    if (!code) return;
    handleBarcodeDecoded(code);
    setManualCodeInput('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-in fade-in duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b-2 border-slate-800 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bogad-yellow border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center">
              <Camera className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">Escáner de Bodega</h2>
              <p className="text-[10px] font-bold text-slate-400">Apunta al código de barras</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                aria-label="Alternar linterna"
                className={`w-9 h-9 rounded-xl border-2 border-slate-700 flex items-center justify-center transition-all ${
                  torchOn ? 'bg-bogad-yellow text-slate-950 shadow-tactile-sm' : 'bg-slate-800 text-white'
                }`}
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <button
              onClick={toggleCamera}
              aria-label="Cambiar cámara"
              className="w-9 h-9 rounded-xl bg-slate-800 text-white border-2 border-slate-700 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5"
            >
              <SwitchCamera className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={onClose}
              aria-label="Cerrar escáner"
              className="w-9 h-9 rounded-xl bg-bogad-coral text-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Code Container */}
          <div id="reader-canvas" className="w-full h-full max-w-md max-h-[60vh] object-cover" />

          {/* Aiming Reticle (Láser y bordes táctiles) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-72 h-44 rounded-2xl border-4 border-bogad-yellow relative shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br" />

              {/* Red laser scanning beam */}
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-bogad-coral shadow-[0_0_12px_#FF5C38] animate-pulse" />
            </div>
          </div>

          {/* Feedback Toast upon scan */}
          {scannedProductFeedback && (
            <div className="absolute top-6 inset-x-4 max-w-sm mx-auto z-30 animate-in slide-in-from-top duration-200">
              <div className="p-3 bg-bogad-lime border-2 border-slate-950 rounded-2xl shadow-tactile-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-bogad-lime stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                    ¡Agregado al carrito!
                  </p>
                  <h4 className="text-xs font-black text-slate-950 truncate">
                    {scannedProductFeedback.name}
                  </h4>
                </div>
                <span className="text-sm font-black text-slate-950">
                  ${scannedProductFeedback.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-x-6 top-1/3 bg-slate-900/90 border-2 border-bogad-coral p-4 rounded-2xl text-center space-y-2 max-w-sm mx-auto z-20">
              <AlertCircle className="w-8 h-8 text-bogad-coral mx-auto stroke-[2.5]" />
              <p className="text-xs font-bold text-slate-200">{cameraError}</p>
              <p className="text-[11px] font-semibold text-slate-400">
                Usa el simulador inferior para probar el escáner al instante.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar: Manual Input & Preset Barcode Tester */}
        <div className="p-4 bg-slate-900 border-t-2 border-slate-800 z-20 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Quick preset buttons for instant desktop testing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Códigos de Prueba Rápidos:
              </span>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs font-bold text-bogad-yellow flex items-center gap-1 active:underline"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{showManualInput ? 'Ocultar teclado' : 'Escribir código'}</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => handleManualSubmit('7751234567890')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border-2 border-slate-700 text-slate-200 text-xs font-bold active:translate-y-0.5 active:bg-slate-700 shrink-0"
              >
                🥤 Cola (Existe)
              </button>
              <button
                onClick={() => handleManualSubmit('7759876543210')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border-2 border-slate-700 text-slate-200 text-xs font-bold active:translate-y-0.5 active:bg-slate-700 shrink-0"
              >
                🍿 Papas (Existe)
              </button>
              <button
                onClick={() => handleManualSubmit('7750000999999')}
                className="px-2.5 py-1.5 rounded-lg bg-bogad-yellow text-slate-950 border-2 border-slate-950 text-xs font-black active:translate-y-0.5 shrink-0 shadow-tactile-sm"
              >
                ✨ No registrado (Alta 3D)
              </button>
            </div>
          </div>

          {/* Manual Input Form */}
          {showManualInput && (
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder="Ingresar código EAN..."
                className="flex-1 px-3 py-2 text-xs font-bold bg-slate-800 border-2 border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-bogad-yellow"
              />
              <TactileButton
                variant="primary"
                size="sm"
                onClick={() => handleManualSubmit()}
                className="px-4 text-xs font-black"
              >
                Escanear
              </TactileButton>
            </div>
          )}

          {lastScannedCode && (
            <p className="text-center text-[10px] font-mono text-slate-400">
              Último leído: <span className="text-white">{lastScannedCode}</span>
            </p>
          )}
        </div>
      </div>

      {/* Modal de Registro Rápido al Vuelo */}
      {unknownBarcode && (
        <QuickProductModal
          barcode={unknownBarcode}
          isOpen={Boolean(unknownBarcode)}
          onClose={() => setUnknownBarcode(null)}
          onSave={(newProd) => {
            onProductRegistered(newProd);
            onProductScanned(newProd);
            setUnknownBarcode(null);
          }}
        />
      )}
    </>
  );
};
