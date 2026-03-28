import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TermsPage() {
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
            Términos <br/><span className="text-text-muted/20">y Condiciones</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Última actualización: Marzo 2026</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-surface-container pt-16">
          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-12">
            <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-black pl-4">Índice</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <li className="hover:text-black cursor-pointer transition-colors">1. Generalidades</li>
              <li className="hover:text-black cursor-pointer transition-colors">2. Uso del Sitio</li>
              <li className="hover:text-black cursor-pointer transition-colors">3. Envíos y Entregas</li>
              <li className="hover:text-black cursor-pointer transition-colors">4. Cambios y devoluciones</li>
              <li className="hover:text-black cursor-pointer transition-colors">5. Propiedad Intelectual</li>
            </ul>
          </div>

          <div className="lg:col-span-8 prose prose-slate">
            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">1. Generalidades</h2>
              <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                Bienvenido a Bodega Ureña. Al acceder y utilizar este sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Estos términos regulan la relación entre usted y Bodega Ureña en lo que respecta a sus pedidos y uso del sitio.
              </p>
            </section>

            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">2. Uso del Sitio</h2>
              <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                El contenido de las páginas de este sitio web es para su información general y uso exclusivo. Está sujeto a cambios sin previo aviso. Ni nosotros ni terceros ofrecemos ninguna garantía en cuanto a la exactitud, puntualidad o integridad de la información y los materiales encontrados en este sitio.
              </p>
            </section>

            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">3. Envíos y Entregas</h2>
              <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                Los envíos son gestionados por transportadoras aliadas (Principalmente Interrapidisimo). Los tiempos de entrega son estimados y pueden variar según la ubicación y condiciones externas. El riesgo de pérdida o daño se transfiere al cliente en el momento de la entrega.
              </p>
            </section>

            <section className="space-y-6 mb-16">
              <h2 className="text-2xl font-black uppercase tracking-tight">4. Cambios y devoluciones</h2>
              <p className="text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                Debido a la naturaleza de bodega de nuestros productos y precios competitivos, los cambios se realizan únicamente por defectos de fábrica reportados dentro de las primeras 48 horas de recibida la mercancía. Los costos de envío para cambios corren por cuenta del cliente.
              </p>
            </section>
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
