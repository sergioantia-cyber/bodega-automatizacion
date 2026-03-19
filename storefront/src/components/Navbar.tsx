import { ShoppingBag, Zap } from 'lucide-react'
import type { CartItem } from '../types'

interface NavbarProps {
  cart: CartItem[]
  onOpenCart: () => void
}

export function Navbar({ cart, onOpenCart }: NavbarProps) {
  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A] z-40 flex items-center justify-between px-6 lg:px-12">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="w-10 h-10 bg-neonCyan/10 border border-neonCyan/30 rounded-xl flex items-center justify-center group-hover:bg-neonCyan group-hover:text-black transition-all">
          <Zap size={24} className="text-neonCyan group-hover:text-black" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black uppercase tracking-tighter leading-none group-hover:tracking-normal transition-all">
            Calzado <span className="text-neonCyan">Ureña</span>
          </span>
          <span className="text-[10px] text-[#5A5A5A] font-bold uppercase tracking-widest leading-none mt-1">
            Minimarket & Moda
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCart}
          className="relative w-12 h-12 bg-[#121212] border border-[#2A2A2A] rounded-xl flex items-center justify-center text-[#8A8A8A] hover:bg-neonCyan/10 hover:border-neonCyan hover:text-neonCyan transition-all group"
        >
          <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-neonMagenta text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(255,0,255,0.4)]">
              {itemsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
