import { ShoppingBag, User, Heart, SlidersHorizontal } from 'lucide-react'
import type { CartItem } from '../types'

interface NavbarProps {
  cart: CartItem[]
  wishlistCount: number
  onOpenCart: () => void
  onOpenAdmin: () => void
  onToggleWishlistFilter: () => void
  onToggleFilter: () => void
  isWishlistFilterActive: boolean
  isAdmin: boolean
}

export function Navbar({ cart, wishlistCount, onOpenCart, onOpenAdmin, onToggleWishlistFilter, onToggleFilter, isWishlistFilterActive }: NavbarProps) {
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-surface-container z-[100] px-6 lg:px-12 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
          <span className="font-black text-xl italic drop-shadow-sm">U</span>
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-black uppercase tracking-tighter leading-none text-black">Urena Store</h1>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1 opacity-70">Moda & Tecnología • 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-8">
        <button onClick={onToggleFilter} className="p-3 hover:bg-bg-color rounded-full transition-all text-text-muted hover:text-black">
          <SlidersHorizontal size={22} />
        </button>



        <button onClick={onOpenAdmin} className="p-3 hover:bg-bg-color rounded-full transition-all text-text-muted hover:text-black">
          <User size={22} />
        </button>
        
        <button onClick={onToggleWishlistFilter} className={`p-3 rounded-full transition-all relative flex items-center justify-center ${isWishlistFilterActive ? 'bg-black text-white' : 'hover:bg-bg-color text-text-muted hover:text-black'}`}>
          <Heart size={22} fill={isWishlistFilterActive ? 'white' : 'transparent'} />
          {wishlistCount > 0 && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white ${isWishlistFilterActive ? 'bg-white text-black' : 'bg-black text-white'}`}>
              {wishlistCount}
            </span>
          )}
        </button>

        <button onClick={onOpenCart} className="p-3 hover:bg-bg-color rounded-full transition-all text-text-muted hover:text-black relative">
          <ShoppingBag size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
