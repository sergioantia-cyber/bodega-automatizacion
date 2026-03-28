import { X, ShieldCheck, Mail } from 'lucide-react'
import { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-sm w-full bg-white rounded-[48px] p-10 overflow-hidden shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 text-center">
        <button onClick={onClose} className="absolute top-6 right-8 p-2 hover:bg-bg-color rounded-full transition-all">
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-black text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl">
          <ShieldCheck size={40} />
        </div>

        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Bienvenido</h2>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2 px-10">
            Únete para gestionar tus pedidos y recibir beneficios exclusivos
          </p>
        </div>

        <div className="space-y-4">
          <button 
            disabled={!acceptedTerms}
            onClick={() => {
              alert('Funcionalidad de Google Login se conectará próximamente.')
              onSuccess({ name: 'Usuario Prueba' })
            }}
            className="w-full py-6 bg-white border border-surface-container text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center justify-center gap-3 hover:bg-bg-color transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
            Continuar con Google
          </button>
          
          <button 
            disabled={!acceptedTerms}
            className="w-full py-4 text-text-muted hover:text-black font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 disabled:opacity-20"
          >
            <Mail size={12} />
            Entrar con Email
          </button>
        </div>

        {/* Mandatory Checkbox */}
        <div className="pt-6 border-t border-surface-container text-left group">
          <label className="flex gap-4 cursor-pointer select-none">
            <div className="relative flex items-center h-5">
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="peer h-5 w-5 bg-bg-color border-2 border-surface-container rounded-md checked:bg-black checked:border-black transition-all appearance-none cursor-pointer"
              />
              <svg className="absolute w-3 h-3 text-white left-1 pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tighter group-hover:text-black transition-all">
              Acepto los <span className="text-black underline underline-offset-2">Términos y Condiciones</span> y la <span className="text-black underline underline-offset-2">Política de Tratamiento de Datos Personales</span> de acuerdo con la Ley 1581.
            </p>
          </label>
        </div>
      </div>
    </div>
  )
}
