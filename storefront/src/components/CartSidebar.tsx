import { ShoppingBag, X, Trash2, ArrowRight, Hash, ShieldCheck } from 'lucide-react'
import type { CartItem } from '../types'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cart: (CartItem & { referenceCode?: string })[]
  onRemove: (id: string, size: string) => void
  onCheckout: (bank?: any) => void
  paymentMethods: any[]
}

import { useState } from 'react'
export function CartSidebar({ isOpen, onClose, cart, onRemove, onCheckout, paymentMethods }: CartSidebarProps) {
  const [selectedMethod, setSelectedMethod] = useState<any>(null)
  const [isMercadoPago, setIsMercadoPago] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)
  const [selectedCity, setSelectedCity] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const COLOMBIA_CITIES = [
    { name: 'Bogotá D.C.', cost: 12000 },
    { name: 'Medellín', cost: 14000 },
    { name: 'Cali', cost: 15000 },
    { name: 'Barranquilla', cost: 18000 },
    { name: 'Bucaramanga', cost: 14500 },
    { name: 'Pereira', cost: 14000 },
    { name: 'Cúcuta', cost: 16000 },
    { name: 'Cartagena', cost: 19000 },
    { name: 'Otras ciudades', cost: 25000 }
  ]

  const total = cart.reduce((acc, item) => acc + item.precio_venta * item.quantity, 0)
  const protectionFee = isMercadoPago ? (total + shippingCost) * 0.05 : 0
  const finalTotal = total + protectionFee + shippingCost

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-surface-container animate-in slide-in-from-right duration-500 ease-in-out">
        <div className="p-10 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-black" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter">Bolsa <span className="text-text-muted opacity-30">/ Pedido</span></h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-bg-color rounded-full transition-all group">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-40 flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-bg-color flex items-center justify-center text-text-muted">
                <ShoppingBag size={48} />
              </div>
              <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Tu bolsa está vacía</p>
            </div>
          ) : (
            <>
              <div className="space-y-10">
                {cart.map((item) => {
                  let preview = ''
                  try {
                    preview = item.imagen_url?.startsWith('[') ? JSON.parse(item.imagen_url)[0] : item.imagen_url
                  } catch {
                    preview = item.imagen_url
                  }

                  return (
                    <div key={`${item.id}-${item.selectedSize}-${item.referenceCode}`} className="flex gap-6 group relative">
                      <div className="w-20 h-24 rounded-lg bg-bg-color overflow-hidden flex-shrink-0 border border-surface-container shadow-sm">
                        <img src={preview} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2 py-0.5 rounded bg-black/5 border border-black/5 text-[8px] font-black text-black flex items-center gap-1 uppercase tracking-widest">
                            <Hash size={10} /> {item.referenceCode || 'SN'}
                          </div>
                        </div>
                        <h3 className="font-black uppercase text-xs truncate tracking-widest">{item.nombre}</h3>
                        <div className="flex gap-4 mt-2">
                          <p className="text-text-muted text-[10px] font-bold uppercase">Talla: <span className="text-black">{item.selectedSize}</span></p>
                          <p className="text-text-muted text-[10px] font-bold uppercase">Cant: <span className="text-black">{item.quantity}</span></p>
                        </div>
                        <p className="text-black font-black text-sm mt-3 tracking-tighter">
                          ${new Intl.NumberFormat('es-CO').format(item.precio_venta)}
                        </p>
                      </div>
                      <button 
                        onClick={() => onRemove(item.id, item.selectedSize)}
                        className="p-3 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-all h-fit"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Shipping Calculator */}
              <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-orange-800 tracking-widest flex items-center gap-2">
                    <img src="https://media.licdn.com/dms/image/v2/C4E0BAQHsk6Y_J4aVmw/company-logo_200_200/company-logo_200_200/0/1630651817551/interrapidisimo_oficial_logo?e=2147483647&v=beta&t=4G0fO977b3Z9f_hR-Q9D_O8H6e9Zp-zZkX0v_fFp5E8" className="w-5 h-5 rounded shadow-sm" />
                    Cotizador Nacional
                  </span>
                  {shippingCost > 0 && <span className="text-xs font-black text-orange-900 animate-in zoom-in-50">+ ${new Intl.NumberFormat('es-CO').format(shippingCost)}</span>}
                </div>
                <div className="relative">
                  <select 
                    value={selectedCity}
                    onChange={(e) => {
                      const city = COLOMBIA_CITIES.find(c => c.name === e.target.value)
                      setSelectedCity(e.target.value)
                      setShippingCost(city?.cost || 0)
                    }}
                    className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-orange-200 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona tu ubicación...</option>
                    {COLOMBIA_CITIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400">
                    <ArrowRight size={14} className="rotate-90" />
                  </div>
                </div>
                <p className="text-[8px] text-orange-800/60 font-medium uppercase tracking-[0.15em] leading-relaxed">
                  Envío gestionado por *Interrapidisimo*. Precios sujetos a variaciones de peso/volumen.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-10 bg-white border-t border-surface-container space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Método de Pago</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => { setSelectedMethod(null); setIsMercadoPago(false) }}
                className={`flex-shrink-0 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedMethod && !isMercadoPago ? 'bg-black text-white shadow-lg' : 'bg-bg-color text-text-muted hover:text-black'}`}
              >
                WhatsApp
              </button>
              
              <button 
                onClick={() => { setSelectedMethod(null); setIsMercadoPago(true) }}
                className={`flex-shrink-0 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${isMercadoPago ? 'bg-primary-dark/5 border-primary-dark text-primary-dark shadow-lg shadow-primary-dark/10' : 'bg-bg-color border-transparent text-text-muted hover:text-primary-dark'}`}
              >
                <div className="flex gap-1">
                  <span className="w-1 h-3 bg-sky-500 rounded-full animate-pulse"></span>
                  <span className="w-1 h-3 bg-blue-600 rounded-full animate-pulse delay-75"></span>
                </div>
                Mercado Pago (PSE/Nequi)
              </button>

              {paymentMethods.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { setSelectedMethod(m); setIsMercadoPago(false) }}
                  className={`flex-shrink-0 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedMethod?.id === m.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-color text-text-muted hover:text-black'}`}
                >
                  {m.banco}
                </button>
              ))}
            </div>

            {isMercadoPago && (
              <div className="bg-primary-dark/5 p-4 rounded-2xl border border-primary-dark/10 space-y-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-primary-dark">
                  <ShieldCheck size={14} className="animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Protección Activa (+5%)</span>
                </div>
                <p className="text-[8px] text-text-muted leading-relaxed font-bold uppercase tracking-widest opacity-60">
                  Tu dinero está seguro. Se liberará solo cuando confirmes la entrega.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Total <span className="opacity-30">/ Final</span></span>
              <p className={`text-3xl font-black tracking-tighter mt-1 transition-all ${isMercadoPago ? 'text-primary-dark scale-105' : 'text-black'}`}>
                ${new Intl.NumberFormat('es-CO').format(finalTotal)}
              </p>
            </div>
            <div className="text-right space-y-1">
              {shippingCost > 0 && <p className="text-[8px] font-black uppercase text-orange-600 tracking-widest">Envío: +${new Intl.NumberFormat('es-CO').format(shippingCost)}</p>}
              {isMercadoPago && <p className="text-[8px] font-black uppercase text-primary-dark tracking-widest animate-pulse">Protección: +${new Intl.NumberFormat('es-CO').format(protectionFee)}</p>}
              <p className="text-[8px] font-black uppercase text-text-muted tracking-widest italic">Iva incluido</p>
            </div>
          </div>

          {/* Mandatory Checkbox for Checkout */}
          <div className="pt-2 group">
            <label className="flex gap-3 cursor-pointer select-none">
              <div className="relative flex items-center h-4">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer h-4 w-4 bg-bg-color border-2 border-surface-container rounded checked:bg-black checked:border-black transition-all appearance-none cursor-pointer"
                />
                <svg className="absolute w-2.5 h-2.5 text-white left-0.5 pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[8px] font-bold text-text-muted leading-relaxed uppercase tracking-widest group-hover:text-black transition-all">
                Acepto los <span className="text-black underline underline-offset-2">Términos</span> y <span className="text-black underline underline-offset-2">Políticas</span> de acuerdo con la Ley 1581.
              </p>
            </label>
          </div>
          
          <button
            onClick={() => onCheckout(isMercadoPago ? { method: 'MercadoPago', total: finalTotal } : selectedMethod)}
            disabled={cart.length === 0 || !acceptedTerms}
            className={`w-full h-16 uppercase text-[10px] tracking-[0.2em] shadow-xl disabled:opacity-20 flex items-center justify-center gap-4 group rounded-2xl transition-all ${isMercadoPago ? 'bg-primary-dark text-white ring-4 ring-primary-dark/10' : (selectedMethod ? 'bg-emerald-600 text-white' : 'bg-black text-white')}`}
          >
            <span>{isMercadoPago ? 'Pagar con Protección' : 'Finalizar Pedido'}</span>
            {isMercadoPago ? <ShieldCheck size={18} /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <div className="flex items-center justify-center gap-2 opacity-10 pb-4">
             <div className="h-px w-8 bg-black"></div>
             <p className="text-[8px] text-center font-bold uppercase tracking-[0.2em]">Bodega Ureña 2026</p>
             <div className="h-px w-8 bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
