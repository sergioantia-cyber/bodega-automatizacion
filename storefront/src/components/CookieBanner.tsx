import { useState, useEffect } from 'react'
import { ShieldAlert, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[200] flex justify-center lg:justify-end animate-in slide-in-from-bottom-20 duration-500 ease-out">
      <div className="w-full max-w-lg bg-white p-8 rounded-[32px] border border-surface-container shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl space-y-8 flex flex-col group">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-4 pt-1">
            <h3 className="text-sm font-black uppercase tracking-widest leading-none">Aviso de Privacidad</h3>
            <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-widest group-hover:text-black transition-colors">
              Utilizamos cookies para mejorar tu experiencia en Bodega Ureña y cumplir con la Ley 1581. Al continuar navegando, aceptas nuestra <Link to="/politica-de-privacidad" className="text-black underline underline-offset-4 decoration-black/20 hover:decoration-black transition-all">política de datos</Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
           <button 
             onClick={acceptCookies}
             className="flex-1 bg-black text-white py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-black/10"
           >
             <span>Aceptar</span>
             <ChevronRight size={14} />
           </button>
           <button 
             onClick={() => setIsVisible(false)}
             className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-black border border-surface-container transition-all"
           >
             Cerrar
           </button>
        </div>
      </div>
    </div>
  )
}
