import type { Producto } from '../types'
import { Plus, Check, ChevronLeft, ChevronRight, Hash } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: Producto
  onAddToCart: (product: Producto & { selectedImageIndex?: number, referenceCode?: string }, size: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdded, setIsAdded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Extract reference from description (Format: REF: 100 | ...)
  const refMatch = product.descripcion?.match(/REF:\s*([^|]+)/i)
  const baseRef = refMatch ? refMatch[1].trim() : 'SN'
  const currentRef = currentImageIndex === 0 ? baseRef : `${baseRef}.${currentImageIndex}`

  let images: string[] = []
  try {
    if (product.imagen_url && product.imagen_url.startsWith('[')) {
      images = JSON.parse(product.imagen_url)
    } else if (product.imagen_url) {
      images = [product.imagen_url]
    }
  } catch (e) {
    images = [product.imagen_url || '']
  }

  const sizes = product.talla 
    ? product.talla.split(',').map(s => s.trim())
    : ['36', '37', '38', '39', '40', '41', '42', '43', '44']

  const handleAdd = () => {
    if (!selectedSize) {
      alert('Selecciona una talla')
      return
    }
    // Pass the specific reference code for the selected variant
    onAddToCart({ ...product, referenceCode: currentRef }, selectedSize)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-neonCyan transition-all group">
      <div className="relative aspect-square overflow-hidden bg-[#0A0A0A]">
        {images.length > 0 ? (
          <>
            <img src={images[currentImageIndex]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            
            {/* Reference Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-neonCyan/40 text-xs font-black text-neonCyan shadow-2xl">
              <Hash size={12} className="text-neonCyan" />
              <span>SERIE: {currentRef}</span>
            </div>

            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length) }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % images.length) }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16} /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-4 bg-neonCyan' : 'w-1.5 bg-white/20'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : <div className="w-full h-full flex items-center justify-center text-[#3A3A3A]">Sin imagen</div>}
      </div>

      <div className="p-5 flex flex-col gap-4">
        <h3 className="text-lg font-black uppercase tracking-tighter truncate">{product.nombre}</h3>
        <p className="text-xl font-black text-neonLime">${new Intl.NumberFormat('es-CO').format(product.precio_venta)}</p>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button key={size} onClick={() => setSelectedSize(size)} className={`h-9 px-3 rounded-lg text-xs font-black border transition-all ${selectedSize === size ? 'bg-neonCyan border-neonCyan text-black' : 'bg-[#121212] border-[#2A2A2A] text-[#8A8A8A]'}`}>{size}</button>
          ))}
        </div>

        <button onClick={handleAdd} disabled={!selectedSize} className={`w-full h-12 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all ${isAdded ? 'bg-green-500 text-black' : !selectedSize ? 'bg-[#2A2A2A] text-[#5A5A5A] opacity-40' : 'border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black'}`}>
          {isAdded ? <Check size={20} /> : <Plus size={20} />} {isAdded ? 'Añadido' : 'Subir al Carrito'}
        </button>
      </div>
    </div>
  )
}
