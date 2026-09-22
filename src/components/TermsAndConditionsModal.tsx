import { X, ShieldCheck, FileText, MapPin, CreditCard, Clock, Phone } from 'lucide-react';
import { TactileButton } from './ui/TactileButton';
import { StoreProfile } from '../types';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  storeProfile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-950 shadow-tactile-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-4 border-b-2 border-slate-950 bg-bogad-yellow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white border-2 border-slate-950 rounded-lg shadow-tactile-sm">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base leading-tight">
                Términos y Condiciones del Servicio
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                {storeProfile.name} • Catálogo Digital Oficial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border-2 border-slate-950 flex items-center justify-center text-slate-950 hover:bg-slate-100 shadow-tactile-sm active:translate-y-0.5"
            aria-label="Cerrar términos"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 rounded-xl space-y-1 shadow-tactile-sm">
            <p className="font-black text-slate-950 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-bogad-coral" />
              <span>Aviso Legal de Uso del Catálogo QR</span>
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Al acceder a este catálogo web mediante código QR o enlace directo y realizar un pedido, aceptas de forma libre y voluntaria las presentes condiciones de compra, despacho y tratamiento de datos para <strong>{storeProfile.name}</strong>.
            </p>
          </div>

          {/* 1. Uso del Catálogo y Pedidos */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <span>1. Catálogo Digital y Pedidos por WhatsApp</span>
            </h4>
            <p>
              El presente catálogo permite a los clientes seleccionar productos en tiempo real y enviar su solicitud directamente al WhatsApp oficial del comercio (<strong>+{storeProfile.whatsappNumber}</strong>). Todo pedido queda sujeto a la confirmación de disponibilidad física en la bodega antes del despacho final.
            </p>
          </div>

          {/* 2. Ubicación GPS y Entregas */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-bogad-coral" />
              <span>2. Georreferenciación GPS para Despacho</span>
            </h4>
            <p>
              Cuando el cliente opta por compartir su ubicación mediante el botón <strong>"Pedir con GPS"</strong>, las coordenadas de latitud y longitud se adjuntan en el mensaje de entrega exclusivamente para que el repartidor o despachador localice el punto exacto de llegada sin extravíos. Estos datos geográficos no se comercializan ni se comparten con terceros externos.
            </p>
          </div>

          {/* 3. Precios, Stock y Horarios */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Precios, Moneda y Horario de Atención</span>
            </h4>
            <p>
              Los precios se expresan en <strong>{storeProfile.currencySymbol || '$'}</strong> y se mantienen sincronizados con la base de datos de la bodega. El horario de atención comercial registrado es: <strong>{storeProfile.schedule || 'Lunes a Domingo'}</strong>. Pedidos fuera de este horario serán procesados al inicio de la siguiente jornada.
            </p>
          </div>

          {/* 4. Métodos de Pago y Validación */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>4. Métodos de Pago y Comprobantes</span>
            </h4>
            <p>
              Se aceptan pagos en efectivo a contraentrega, transferencias bancarias y Pago Móvil según las cuentas configuradas por el comercio. En compras pagadas digitalmente, el cliente debe adjuntar la captura del comprobante al WhatsApp oficial para validar la transacción antes de liberar los artículos.
            </p>
          </div>

          {/* 5. Privacidad de Datos */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>5. Privacidad y Protección de Datos</span>
            </h4>
            <p>
              El nombre del cliente, número de contacto, dirección y referencias facilitadas durante el proceso de compra se destinan única y estrictamente a la gestión logística y comunicación del pedido. El cliente puede solicitar la eliminación o actualización de sus datos contactando directamente al comercio.
            </p>
          </div>

          {/* 6. Dirección y Contacto del Comercio */}
          <div className="p-3 bg-lime-50 dark:bg-slate-800 border-2 border-slate-950 rounded-xl space-y-1">
            <p className="font-black text-slate-950 dark:text-white flex items-center gap-1.5 text-[11px] uppercase">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contacto y Reclamaciones</span>
            </p>
            <p className="text-[11px]">
              <strong>Establecimiento:</strong> {storeProfile.name}<br />
              <strong>Dirección:</strong> {storeProfile.address || 'Local Comercial'}<br />
              <strong>Atención al Cliente:</strong> +{storeProfile.whatsappNumber}
            </p>
          </div>

        </div>

        {/* Pie con botón de conformidad */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-950 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Versión vigente para clientes QR
          </span>
          <TactileButton
            variant="primary"
            size="sm"
            onClick={onClose}
            className="font-black text-xs px-5 shadow-tactile-sm"
          >
            Entendido y Acepto
          </TactileButton>
        </div>

      </div>
    </div>
  );
};
