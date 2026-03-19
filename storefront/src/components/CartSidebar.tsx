import { ShoppingBag, X, Trash2, ArrowRight, Hash } from 'lucide-react'
import type { CartItem } from '../types'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cart: (CartItem & { referenceCode?: string })[]
  onRemove: (id: string, size: string) => void
  onCheckout: () => void
}

export function CartSidebar({ isOpen, onClose, cart, onRemove, onCheckout }: CartSidebarProps) {
  const total = cart.reduce((acc, item) => acc + item.precio_venta * item.quantity, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0D0D0D] h-full shadow-2xl flex flex-col border-l border-[#1A1A1A]">
        <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-neonCyan" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Tu Carrito</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center text-[#333]">
                <ShoppingBag size={40} />
              </div>
              <p className="text-[#555] font-black uppercase tracking-widest text-[10px]">El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => {
              let preview = ''
              try {
                preview = item.imagen_url?.startsWith('[') ? JSON.parse(item.imagen_url)[0] : item.imagen_url
              } catch {
                preview = item.imagen_url
              }

              return (
                <div key={`${item.id}-${item.selectedSize}-${item.referenceCode}`} className="flex gap-4 group">
                  <div className="w-24 h-24 rounded-xl bg-[#050505] overflow-hidden flex-shrink-0 border border-[#1A1A1A]">
                    <img src={preview} alt={item.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="px-1.5 py-0.5 rounded bg-neonCyan/10 border border-neonCyan/20 text-[8px] font-black text-neonCyan flex items-center gap-0.5 uppercase tracking-tighter">
                        <Hash size={8} /> {item.referenceCode || 'SN'}
                      </div>
                    </div>
                    <h3 className="font-black uppercase text-sm truncate tracking-tight">{item.nombre}</h3>
                    <p className="text-[#444] text-[10px] font-bold uppercase mt-1">Talla: <span className="text-[#888]">{item.selectedSize}</span></p>
                    <p className="text-neonLime font-black text-sm mt-1">
                      ${new Intl.NumberFormat('es-CO').format(item.precio_venta)}
                    </p>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id, item.selectedSize)}
                    className="p-2 text-[#2A2A2A] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all h-fit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        <div className="p-8 bg-[#070707] border-t border-[#1A1A1A] space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-[#444] tracking-widest">Total Estimado</span>
            <span className="text-3xl font-black text-white tracking-tighter">
              ${new Intl.NumberFormat('es-CO').format(total)}
            </span>
          </div>
          
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full h-16 bg-neonCyan text-black font-black uppercase tracking-tighter rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(0,229,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100"
          >
            Enviar Pedido por WhatsApp
            <ArrowRight size={20} className="stroke-[3]" />
          </button>
          
          <p className="text-[8px] text-center text-[#333] font-bold uppercase tracking-[0.2em]">
            Atención Inmediata vía Calzado Ureña
          </p>
        </div>
      </div>
    </div>
  )
}
