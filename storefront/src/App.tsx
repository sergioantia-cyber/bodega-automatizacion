import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Producto, CartItem } from './types'
import { Navbar } from './components/Navbar'
import { ProductCard } from './components/ProductCard'
import { CartSidebar } from './components/CartSidebar'
import { AdminPanel } from './components/AdminPanel'
import { Loader2, Sparkles, ShieldAlert, X, Ruler } from 'lucide-react'

// Extend CartItem locally for reference propagation
interface ExtendedCartItem extends CartItem {
  referenceCode?: string
}

function App() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<ExtendedCartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [sizeChartUrl, setSizeChartUrl] = useState('')
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])

  const styles = ['Urbano', 'Deportivo', 'Casual', 'Elegante']
  const genders = ['Dama', 'Caballero', 'Niño/a', 'Unisex']

  useEffect(() => {
    fetchProducts(); fetchSizeChart()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  async function fetchSizeChart() {
    const { data } = await supabase.from('productos').select('imagen_url').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').single()
    if (data) setSizeChartUrl(data.imagen_url || '')
  }

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('productos').select('*').eq('activo', true).eq('categoria', 'Calzado').order('nombre')
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const addToCart = (product: Producto & { referenceCode?: string }, size: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.selectedSize === size && item.referenceCode === product.referenceCode)
      if (existingItem) {
        return prevCart.map((item) => item.id === product.id && item.selectedSize === size && item.referenceCode === product.referenceCode ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prevCart, { ...product, quantity: 1, selectedSize: size, referenceCode: product.referenceCode }]
    })
    setIsCartOpen(true)
  }

  const filteredProducts = products.filter(product => {
    if (selectedStyles.length === 0 && selectedGenders.length === 0) return true
    const styleMatch = selectedStyles.length === 0 || selectedStyles.some(s => product.nombre?.toLowerCase().includes(s.toLowerCase()) || product.descripcion?.toLowerCase().includes(s.toLowerCase()))
    const genderMatch = selectedGenders.length === 0 || selectedGenders.some(g => product.nombre?.toLowerCase().includes(g.toLowerCase()) || (product.genero && product.genero.toLowerCase() === g.toLowerCase()) || product.descripcion?.toLowerCase().includes(g.toLowerCase()))
    return styleMatch && genderMatch
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-neonCyan/30 selection:text-neonCyan">
      <Navbar cart={cart} onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="pt-24 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <section className="py-20 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan text-[10px] font-black uppercase tracking-widest animate-pulse"><Sparkles size={12} /> COLECCIÓN OFICIAL 2026</div>
          <h1 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-none max-w-5xl">CALZADO <span className="text-neonCyan">UREÑA</span></h1>
          {sizeChartUrl && (
            <button onClick={() => setIsSizeChartOpen(true)} className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#111] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#AAA] hover:text-white hover:border-neonCyan transition-all shadow-xl"><Ruler size={16} className="text-neonCyan" /> Guía de Tallas (CM)</button>
          )}
        </section>

        <section className="py-8 border-y border-[#1A1A1A] mb-12 flex flex-col gap-6">
          <div className="flex flex-wrap gap-12">
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black text-[#444] tracking-widest mb-4">Filtrar por Estilo</p>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => (
                  <button key={s} onClick={() => setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedStyles.includes(s) ? 'bg-neonCyan border-neonCyan text-black' : 'bg-[#111] border-[#222] text-[#666]'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black text-[#444] tracking-widest mb-4">Género</p>
              <div className="flex flex-wrap gap-2">
                {genders.map(g => (
                  <button key={g} onClick={() => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedGenders.includes(g) ? 'bg-neonLime border-neonLime text-black' : 'bg-[#111] border-[#222] text-[#666]'}`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          {loading ? <Loader2 size={40} className="animate-spin text-neonCyan mx-auto" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p) => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-[#050505] border-t border-[#111] py-20 px-6 opacity-30 group hover:opacity-100 transition-opacity">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <p className="text-[10px] font-black uppercase text-[#444]">CALZADO UREÑA 2026</p>
          <button onClick={() => setIsAdminOpen(true)} className="text-[10px] font-black uppercase text-[#222] hover:text-neonLime transition-all flex items-center gap-2"><ShieldAlert size={14} /> Panel Administrador</button>
        </div>
      </footer>

      {/* Cart Sidebar with proper references */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={(id, size) => setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)))} onCheckout={() => {
        const total = cart.reduce((acc, item) => acc + item.precio_venta * item.quantity, 0)
        const message = `🛒 *NUEVO PEDIDO UREÑA*\n\n` + 
          cart.map(i => `✅ *REF #${i.referenceCode}* | ${i.nombre}\n📏 Talla: ${i.selectedSize}\n📦 Cant: ${i.quantity}\n`).join('\n') + 
          `\n💰 *TOTAL A PAGAR: $${new Intl.NumberFormat('es-CO').format(total)}*`
        window.open(`https://wa.me/584243181871?text=${encodeURIComponent(message)}`, '_blank')
      }} />

      {isSizeChartOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setIsSizeChartOpen(false)} />
          <div className="relative bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-2xl rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#1A1A1A] flex items-center justify-between"><h3 className="text-sm font-black text-neonCyan uppercase tracking-widest">Guía de Tallas (CM)</h3><button onClick={() => setIsSizeChartOpen(false)}><X size={20}/></button></div>
            <div className="p-8 flex items-center justify-center bg-white"><img src={sizeChartUrl} className="max-w-full h-auto" /></div>
          </div>
        </div>
      )}

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} onRefresh={() => { fetchProducts(); fetchSizeChart(); }} />
    </div>
  )
}

export default App
