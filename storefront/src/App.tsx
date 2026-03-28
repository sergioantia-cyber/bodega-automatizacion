import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Producto, CartItem } from './types'
import { Routes, Route, Link } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProductCard } from './components/ProductCard'
import { CartSidebar } from './components/CartSidebar'
import { AdminPanel } from './components/AdminPanel'
import { AuthModal } from './components/AuthModal'
import { CookieBanner } from './components/CookieBanner'
import { TermsConsentModal } from './components/TermsConsentModal'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { Loader2, SlidersHorizontal, ChevronRight, X, Ruler, Search, ShieldCheck, Zap, Instagram, Facebook, MessageCircle } from 'lucide-react'
import './index.css'

interface ExtendedCartItem extends CartItem {
  referenceCode?: string
}

function App() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<ExtendedCartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>(JSON.parse(localStorage.getItem('wishlist') || '[]'))
  const [showWishlistOnly, setShowWishlistOnly] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(window.innerWidth > 1024)
  const [sizeChartUrl, setSizeChartUrl] = useState('')
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedQR, setSelectedQR] = useState<{url: string, banco: string, titular: string} | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activePayment, setActivePayment] = useState<{method: string, total: number} | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'))


  const styles = ['Urbano', 'Deportivo', 'Casual', 'Elegante', 'Formal']
  const genders = ['Dama', 'Caballero', 'Niño/a', 'Unisex']
  const categories = ['Calzado', 'Ropa', 'Teléfonos', 'Accesorios']

  useEffect(() => {
    fetchProducts(); fetchSizeChart(); fetchPaymentMethods()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)) }, [wishlist])

  async function fetchSizeChart() {
    const { data } = await supabase.from('productos').select('imagen_url').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').maybeSingle()
    if (data) setSizeChartUrl(data.imagen_url || '')
  }

  async function fetchPaymentMethods() {
    const { data } = await supabase.from('metodos_pago').select('*').eq('activo', true)
    if (data) setPaymentMethods(data)
  }

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .eq('negocio', 'STOREFRONT')
      .order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const addToCart = (product: Producto & { referenceCode?: string }, size: string) => {
    if (!user) {
      setIsAuthOpen(true)
      return
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.selectedSize === size && item.referenceCode === product.referenceCode)
      if (existingItem) {
        return prevCart.map((item) => item.id === product.id && item.selectedSize === size && item.referenceCode === product.referenceCode ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prevCart, { ...product, quantity: 1, selectedSize: size, referenceCode: product.referenceCode }]
    })
    setIsCartOpen(true)
  }

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filteredProducts = products.filter(product => {
    if (showWishlistOnly && !wishlist.includes(product.id)) return false

    const searchMatch = !searchTerm || product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || product.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) || product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    if (!searchMatch) return false

    if (selectedStyles.length === 0 && selectedGenders.length === 0 && selectedCategories.length === 0) return true
    
    const styleMatch = selectedStyles.length === 0 || selectedStyles.some(s => product.nombre?.toLowerCase().includes(s.toLowerCase()) || product.descripcion?.toLowerCase().includes(s.toLowerCase()))
    const genderMatch = selectedGenders.length === 0 || selectedGenders.some(g => product.nombre?.toLowerCase().includes(g.toLowerCase()) || (product.genero && product.genero.toLowerCase() === g.toLowerCase()) || product.descripcion?.toLowerCase().includes(g.toLowerCase()) || (product.descripcion && product.descripcion.includes(`Segmento: ${g}`)))
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(c => product.categoria?.toLowerCase() === c.toLowerCase())
    
    return styleMatch && genderMatch && categoryMatch
  })

  return (
    <Routes>
      <Route path="/terminos-y-condiciones" element={<TermsPage />} />
      <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
      <Route path="/" element={
        <div className="min-h-screen bg-bg-color text-text-main font-sans">
          <TermsConsentModal />
          <CookieBanner />
          <Navbar 
            cart={cart} 
            wishlistCount={wishlist.length} 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenAdmin={() => setIsAdminOpen(true)} 
            onToggleWishlistFilter={() => setShowWishlistOnly(!showWishlistOnly)} 
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)} 
            isWishlistFilterActive={showWishlistOnly}
            isAdmin={isAdminAuthenticated}
          />
          
          <div className="flex pt-20 h-[calc(100vh-80px)] overflow-hidden relative">
        {/* Mobile Filter Overlay */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-y-0 left-0 bg-white border-r border-surface-container transition-all duration-500 overflow-y-auto
          lg:static lg:h-full lg:translate-x-0
          ${isFilterOpen ? 'translate-x-0 z-[200] w-80 shadow-2xl lg:shadow-none' : '-translate-x-full z-[-1] w-0'}
          ${!isFilterOpen ? 'lg:w-0 lg:invisible lg:opacity-0' : 'lg:w-80 lg:visible lg:opacity-100'}
        `}>
          <div className="p-8 space-y-12 w-80">
            <div className="flex justify-between items-center lg:hidden -mt-2">
               <h2 className="text-xl font-black uppercase tracking-tighter">Filtros</h2>
               <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-full bg-bg-color flex items-center justify-center">
                 <X size={20} />
               </button>
            </div>
            <div>
              <h3 className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-6">Búsqueda</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar producto..." 
                  className="w-full bg-bg-color border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-black text-text-muted tracking-widest mb-6">Categorías</h3>
              <div className="space-y-2">
                {categories.map(c => (
                  <button key={c} onClick={() => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center group ${selectedCategories.includes(c) ? 'bg-black text-white px-6' : 'hover:bg-bg-color text-text-muted'}`}>
                    {c}
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${selectedCategories.includes(c) ? 'opacity-100' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-black text-text-muted tracking-widest mb-6">Estilo</h3>
              <div className="space-y-2">
                {styles.map(s => (
                  <button key={s} onClick={() => setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center group ${selectedStyles.includes(s) ? 'bg-black text-white px-6' : 'hover:bg-bg-color text-text-muted'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-black text-text-muted tracking-widest mb-6">Género</h3>
              <div className="space-y-2">
                {genders.map(g => (
                  <button key={g} onClick={() => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center group ${selectedGenders.includes(g) ? 'bg-black text-white px-6' : 'hover:bg-bg-color text-text-muted'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button 
                onClick={() => { setSelectedCategories([]); setSelectedGenders([]); setSelectedStyles([]); setSearchTerm(''); setShowWishlistOnly(false); }}
                className="w-full text-center py-3 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Limpiar Filtros
              </button>
            </div>

            {sizeChartUrl && (
              <button onClick={() => setIsSizeChartOpen(true)} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-bg-color border border-surface-container rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-black hover:border-black transition-all">
                <Ruler size={16} /> Guía de Tallas (CM)
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Grid */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-12 bg-bg-color">
          <div className="flex justify-between items-center mb-12">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-black transition-all">
              <SlidersHorizontal size={14} /> {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">{filteredProducts.length} Productos</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 size={40} className="animate-spin text-black" />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cargando Galería</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={addToCart} 
                  onToggleWishlist={() => toggleWishlist(p.id)}
                  isWishlisted={wishlist.includes(p.id)}
                  isAdminMode={isAdminAuthenticated && isEditMode}
                  onRefresh={fetchProducts}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Overlays */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={(id, size) => setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)))} onCheckout={async (bank: any) => {
        const total = cart.reduce((acc, item) => acc + item.precio_venta * item.quantity, 0)
        
        if (bank?.method === 'MercadoPago') {
          setActivePayment(bank)
          setIsCartOpen(false)
          return
        }

        // 1. Guardar en Base de Datos (Supabase)
        try {
          await supabase.from('pedidos').insert([{
            items: cart,
            total: total,
            estado: 'Pendiente',
            metodo_pago: bank?.banco || 'WhatsApp'
          }])
        } catch (e) { console.error('Error guardando pedido:', e) }

        // 2. Mostrar QR si se seleccionó uno
        if (bank) {
          setSelectedQR({ url: bank.qr_url, banco: bank.banco, titular: bank.titular })
        }

        // 3. Notificar por WhatsApp
        let message = `🛒 *NUEVO PEDIDO - BODEGA UREÑA*\n\n`
        cart.forEach((item, index) => {
          message += `${index + 1}. *${item.nombre}* (Talla: ${item.selectedSize})\n   Cant: ${item.quantity} | Subtotal: COP ${new Intl.NumberFormat('es-CO').format(item.precio_venta * item.quantity)}\n\n`
        })
        message += `💰 *TOTAL A PAGAR: COP ${new Intl.NumberFormat('es-CO').format(total)}*` +
          (bank ? `\n💳 *Metodo: ${bank.banco}*` : '')
        window.open(`https://wa.me/584243181871?text=${encodeURIComponent(message)}`, '_blank')
      }} paymentMethods={paymentMethods} />

      {activePayment && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="relative max-w-sm w-full bg-white rounded-[48px] p-10 overflow-hidden shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 text-center">
              <div className="w-24 h-24 bg-primary-dark/5 text-primary-dark rounded-full mx-auto flex items-center justify-center relative">
                 <ShieldCheck size={48} className="animate-pulse" />
                 <div className="absolute -top-1 -right-1 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center border-4 border-white">
                    <Zap size={14} fill="white" />
                 </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-dark">Compra Protegida</h3>
                <p className="text-2xl font-black tracking-tighter uppercase leading-tight">Mercado Pago Colombia</p>
                <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest leading-relaxed">
                  PSE • Nequi • Daviplata • Tarjetas
                </p>
              </div>

              <div className="p-6 bg-bg-color rounded-3xl border border-surface-container space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                    <span>Subtotal</span>
                    <span>${new Intl.NumberFormat('es-CO').format(activePayment.total / 1.05)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-dark">
                    <span>Seguro Escrow (5%)</span>
                    <span>${new Intl.NumberFormat('es-CO').format(activePayment.total - (activePayment.total / 1.05))}</span>
                 </div>
                 <div className="pt-4 border-t border-surface-container flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black">${new Intl.NumberFormat('es-CO').format(activePayment.total)}</span>
                 </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => alert('¡Listo! Mañana conectaremos tu Access Token para procesar el pago real.')}
                  className="w-full py-6 bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-dark/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Zap size={14} fill="white" />
                  Ir a Pagar Seguro
                </button>
                <button 
                  onClick={() => setActivePayment(null)}
                  className="w-full py-4 text-text-muted hover:text-black font-black uppercase tracking-widest text-[9px] transition-all"
                >
                  Cancelar y volver
                </button>
              </div>
              
              <div className="pt-4 flex justify-center gap-4 opacity-30 grayscale items-center">
                 <img src="https://logodownload.org/wp-content/uploads/2019/02/pse-logo-0.png" className="h-4 w-auto object-contain" />
                 <img src="https://seeklogo.com/images/N/nequi-logo-019680327E-seeklogo.com.png" className="h-4 w-auto object-contain" />
                 <img src="https://seeklogo.com/images/D/daviplata-logo-B3E0C6A5A1-seeklogo.com.png" className="h-4 w-auto object-contain" />
              </div>
           </div>
        </div>
      )}

      {selectedQR && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedQR(null)}>
           <div className="relative max-w-sm w-full bg-white rounded-[48px] p-10 overflow-hidden shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
                 <ShieldCheck size={40} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-2">{selectedQR.banco}</h3>
                <p className="text-2xl font-black tracking-tighter uppercase">{selectedQR.titular}</p>
                <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest mt-2">Escanea para pagar</p>
              </div>
              <div className="aspect-square bg-bg-color rounded-3xl overflow-hidden border-8 border-bg-color shadow-inner">
                 <img src={selectedQR.url} className="w-full h-full object-contain" />
              </div>
              <button onClick={() => setSelectedQR(null)} className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Cerrar y Finalizar</button>
           </div>
        </div>
      )}

      {isSizeChartOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md" onClick={() => setIsSizeChartOpen(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-4 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSizeChartOpen(false)} className="absolute top-4 right-4 p-3 bg-black/5 hover:bg-black/10 rounded-full transition-all z-10"><X size={20} /></button>
            <img src={sizeChartUrl} className="w-full h-auto rounded-2xl" alt="Guía de tallas" />
          </div>
        </div>
      )}


      <div className="py-20 flex justify-center items-center opacity-30 select-none">
        <span 
          onDoubleClick={() => setIsAdminOpen(true)}
          className="text-[9px] font-black uppercase tracking-[0.6em] text-text-muted/40 cursor-default"
        >
           v1.1 • urena store
        </span>
      </div>

      {isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={(userData) => {
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            setIsAuthOpen(false)
          }}
        />
      )}

      {isAdminOpen && (
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          onRefresh={fetchProducts} 
          onAuthSuccess={() => setIsAdminAuthenticated(true)}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
        />
      )}

      {/* Footer Section */}
      <footer className="bg-white px-6 lg:px-24 py-24 border-t border-surface-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Bodega Ureña</h2>
            <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-widest opacity-60">
              Moda urbana y deportiva con los mejores precios del mercado nacional. Calidad de bodega directamente a tu puerta.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-bg-color flex items-center justify-center hover:bg-black hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-bg-color flex items-center justify-center hover:bg-black hover:text-white transition-all"><Facebook size={18} /></a>
              <a href="https://wa.me/584243181871" className="w-10 h-10 rounded-xl bg-bg-color flex items-center justify-center hover:bg-black hover:text-white transition-all"><MessageCircle size={18} /></a>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em]">Compañía</h3>
            <ul className="space-y-4">
              <li><Link to="/terminos-y-condiciones" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Política de Privacidad</Link></li>
              <li><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Nosotros</a></li>
              <li><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em]">Soporte</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Métodos de Envío</a></li>
              <li><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-colors">Estado de Pedido</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em]">Ubicación</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-relaxed">
              Bodega Central<br/>
              Colombia / Venezuela<br/>
              Distribución Nacional
            </p>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-surface-container flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-20 hover:opacity-100 hover:grayscale-0 transition-all duration-700">
             <img src="https://logodownload.org/wp-content/uploads/2019/02/pse-logo-0.png" className="h-6 w-auto" />
             <img src="https://seeklogo.com/images/N/nequi-logo-019680327E-seeklogo.com.png" className="h-6 w-auto" />
             <img src="https://media.licdn.com/dms/image/v2/C4E0BAQHsk6Y_J4aVmw/company-logo_200_200/company-logo_200_200/0/1630651817551/interrapidisimo_oficial_logo?e=2147483647&v=beta&t=4G0fO977b3Z9f_hR-Q9D_O8H6e9Zp-zZkX0v_fFp5E8" className="h-6 w-auto rounded" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-text-muted/40">
            © 2026 Bodega Ureña • Calidad Premium
          </p>
        </div>
      </footer>
    </div>
    } />
    </Routes>
  )
}

export default App
