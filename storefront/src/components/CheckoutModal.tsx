import { useState } from 'react'
import { X, Send, CreditCard, Wallet, Banknote } from 'lucide-react'
import type { CartItem, OrderDetails } from '../types'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
}

export function CheckoutModal({ isOpen, onClose, cart }: CheckoutModalProps) {
  const [details, setDetails] = useState<OrderDetails>({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Efectivo',
  })

  if (!isOpen) return null

  const total = cart.reduce((acc, item) => acc + item.precio_venta * item.quantity, 0)
  const phone = '573000000000' // Placeholder, the user should provide their business WhatsApp number

  const handleSendOrder = () => {
    if (!details.customerName || !details.customerPhone) {
      alert('Por favor completa tus datos')
      return
    }

    const itemsText = cart
      .map((item) => `- ${item.nombre} (Talla: ${item.selectedSize}) x${item.quantity}: $${new Intl.NumberFormat('es-CO').format(item.precio_venta)}`)
      .join('%0A')

    const message = `🛍️ *NUEVO PEDIDO - CALZADO UREÑA*%0A%0A` +
      `👤 *Cliente:* ${details.customerName}%0A` +
      `📞 *Teléfono:* ${details.customerPhone}%0A%0A` +
      `🛒 *Productos:*%0A${itemsText}%0A%0A` +
      `💰 *Total:* $${new Intl.NumberFormat('es-CO').format(total)}%0A` +
      `💳 *Método de Pago:* ${details.paymentMethod}%0A%0A` +
      `_¡Hola! Me gustaría confirmar este pedido para entrega._`

    const whatsappUrl = `https://wa.me/${phone}?text=${message}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#121212] border border-[#2A2A2A] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-[#1A1A1A] flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tighter">Detalles de Entrega</h3>
          <button onClick={onClose} className="text-[#3A3A3A] hover:text-[#5A5A5A] transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#5A5A5A] tracking-widest pl-1">Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez"
              className="w-full h-14 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl px-6 font-bold text-[#EAEAEA] placeholder:text-[#2A2A2A] focus:border-neonCyan outline-none transition-all"
              value={details.customerName}
              onChange={(e) => setDetails({ ...details, customerName: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#5A5A5A] tracking-widest pl-1">Número de WhatsApp</label>
            <input 
              type="tel" 
              placeholder="Ej. 3123456789"
              className="w-full h-14 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl px-6 font-bold text-[#EAEAEA] placeholder:text-[#2A2A2A] focus:border-neonCyan outline-none transition-all"
              value={details.customerPhone}
              onChange={(e) => setDetails({ ...details, customerPhone: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-[#5A5A5A] tracking-widest pl-1">Método de Pago</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Nequi', icon: Wallet, color: 'text-purple-400' },
                { name: 'Bancolombia', icon: CreditCard, color: 'text-blue-400' },
                { name: 'Efectivo', icon: Banknote, color: 'text-green-400' },
              ].map((method) => (
                <button
                  key={method.name}
                  onClick={() => setDetails({ ...details, paymentMethod: method.name as any })}
                  className={`
                    flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all
                    ${details.paymentMethod === method.name 
                      ? 'bg-neonCyan/10 border-neonCyan text-white shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
                      : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#5A5A5A] hover:border-[#3A3A3A]'}
                  `}
                >
                  <method.icon size={20} className={details.paymentMethod === method.name ? 'text-neonCyan' : method.color} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 pt-0">
          <button 
            onClick={handleSendOrder}
            className="group w-full h-16 bg-neonCyan text-black font-black uppercase text-lg rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Enviar a WhatsApp 
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Send size={18} />
            </div>
          </button>
          <p className="text-[9px] text-center text-[#3A3A3A] font-bold uppercase tracking-widest mt-4">
            Esto abrirá WhatsApp para confirmar tu pedido
          </p>
        </div>
      </div>
    </div>
  )
}
