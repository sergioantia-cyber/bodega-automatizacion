import { ShieldCheck, ArrowLeft, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-color selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-black transition-all mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a la tienda
        </Link>

        <div className="space-y-6">
          <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl mb-8">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
            Políticas <br/><span className="text-text-muted/20">de Privacidad</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Ley 1581 de Protección de Datos Personales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-surface-container pt-16">
          <div className="lg:col-span-8 prose prose-slate">
            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">Tratamiento de Datos</h2>
              <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                En cumplimiento de la Ley 1581 de 2012, informamos que Bodega Ureña recolecta, almacena y utiliza tus datos personales para la gestión de envíos, procesamiento de pagos y envío de comunicaciones comerciales previa autorización.
              </p>
            </section>

            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">Finalidades de la Recolección</h2>
              <ul className="space-y-4 text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest list-disc pl-4">
                <li>Gestión de la relación contractual de compra y entrega.</li>
                <li>Atención al cliente y servicio postventa.</li>
                <li>Envío de promociones y boletines informativos (Newsletter).</li>
                <li>Facturacion y cumplimiento de obligaciones legales.</li>
              </ul>
            </section>

            <section className="space-y-6 mb-16">
               <h2 className="text-2xl font-black uppercase tracking-tight">Tus Derechos (Habeas Data)</h2>
               <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                  Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales registrados en nuestras bases de datos en cualquier momento. Puedes contactarnos a traves de nuestros canales oficiales para ejercer estos derechos.
               </p>
            </section>

            <div className="p-8 bg-white border border-surface-container rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <Send className="text-black" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest">Contacto Directo</h3>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-relaxed">
                   Si tienes dudas sobre el tratamiento de tus datos, puedes enviarnos un mensaje via WhatsApp o correo electronico, y te daremos respuesta en un plazo maximo de 5 dias habiles.
                </p>
            </div>
          </div>
        </div>
        
        <div className="py-20 flex justify-center items-center opacity-30 select-none">
          <div className="h-px w-12 bg-black"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-text-muted px-8">
            Bodega Ureña 2026
          </span>
          <div className="h-px w-12 bg-black"></div>
        </div>
      </div>
    </div>
  )
}
