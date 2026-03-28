import { useState, useEffect } from 'react'
import { ShieldCheck, ChevronRight } from 'lucide-react'

export function TermsConsentModal() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('terms-consent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('terms-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[48px] p-10 lg:p-12 shadow-2xl space-y-10 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-black text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg">
          <ShieldCheck size={32} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Bienvenido a <br/>Bodega Ureña</h2>
          <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-[0.2em]">
            Para continuar navegando y realizar compras, debes aceptar nuestros términos de servicio y políticas de datos personales de acuerdo con la Ley 1581.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            onClick={handleAccept}
            className="w-full h-16 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <span>Aceptar y Continuar</span>
            <ChevronRight size={16} />
          </button>
          
          <div className="flex flex-col gap-2">
            <a href="/terminos-y-condiciones" target="_blank" className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 hover:text-black hover:underline underline-offset-4 transition-all">Leer Términos y Condiciones</a>
            <a href="/politica-de-privacidad" target="_blank" className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 hover:text-black hover:underline underline-offset-4 transition-all">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </div>
  )
}
