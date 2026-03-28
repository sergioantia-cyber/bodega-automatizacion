import type { Producto } from '../types'
import { Plus, Check, ChevronLeft, ChevronRight, Heart, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface ProductCardProps {
  product: Producto
  onAddToCart: (product: Producto & { selectedImageIndex?: number, referenceCode?: string }, size: string) => void
  onToggleWishlist: () => void
  isWishlisted: boolean
  isAdminMode: boolean
  onRefresh?: () => void
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, isAdminMode, onRefresh }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdded, setIsAdded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // PRO EDITION STATE
  const [editedPrice, setEditedPrice] = useState(product.precio_venta)
  const [editedSizes, setEditedSizes] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const defaultList = product.categoria === 'Calzado' 
      ? ['36', '37', '38', '39', '40', '41', '42', '43', '44']
      : ['Única']
    const list = product.talla ? product.talla.split(',').map(s => s.trim()).filter(s => s !== '') : defaultList
    setEditedSizes(list)
    setEditedPrice(product.precio_venta)
    setHasChanges(false)
  }, [product, isAdminMode])

  const handlePriceChange = (val: number) => {
    setEditedPrice(val)
    setHasChanges(true)
  }

  const removeSize = (size: string) => {
    setEditedSizes(prev => prev.filter(s => s !== size))
    setHasChanges(true)
  }

  const addSize = () => {
    const newSize = prompt('Ingrese la nueva talla (ej: 45 o XL):')
    if (newSize && newSize.trim() !== '' && !editedSizes.includes(newSize.trim())) {
      setEditedSizes(prev => [...prev, newSize.trim()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })))
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await supabase
      .from('productos')
      .update({ 
        precio_venta: editedPrice,
        talla: editedSizes.join(', ')
      })
      .eq('id', product.id)
    
    if (!error) {
      setHasChanges(false)
      onRefresh?.()
    } else {
      alert('Error guardando cambios')
    }
    setIsSaving(false)
  }

  const baseRef = product.referencia || product.descripcion?.match(/REF:\s*([^|]+)/i)?.[1].trim() || 'SN'
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
    onAddToCart({ ...product, referenceCode: currentRef }, selectedSize)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="minimal-card p-4 group">
      <div className="relative aspect-square overflow-hidden bg-bg-color rounded-lg">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
              alt={product.nombre}
            />
            
            {/* Action Bar Floating over image */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
               <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist() }}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${isWishlisted ? "bg-black text-white" : "bg-white/80 text-black hover:bg-black hover:text-white"}`}
               >
                 <Heart size={18} fill={isWishlisted ? "white" : "none"} />
               </button>
            </div>

            {/* Reference Badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-md text-[9px] font-black text-black tracking-widest border border-black/5 shadow-sm">
              REF: {currentRef}
            </div>

            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length) }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % images.length) }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={16} /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-5 bg-black' : 'w-1.5 bg-black/10'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px] font-black uppercase">Sin imagen</div>}
      </div>

      <div className="pt-6 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight truncate leading-tight">{product.nombre}</h3>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
            {product.categoria} {product.linea_diseno && <span className="opacity-30 tracking-[0.4em] ml-1">• {product.linea_diseno}</span>}
          </p>
        </div>
        
        <div className="flex justify-between items-end">
          {isAdminMode ? (
            <div className="flex-1 space-y-1">
              <label className="text-[8px] font-black uppercase text-orange-500 tracking-widest">Precio Pro</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black">$</span>
                <input 
                  type="number" 
                  className="w-full bg-white border border-orange-200 rounded-lg h-10 px-3 font-black text-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                  value={editedPrice}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          ) : (
            <p className="text-lg font-black text-black tracking-tighter">${new Intl.NumberFormat('es-CO').format(product.precio_venta)}</p>
          )}

          {isAdminMode && hasChanges && (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="ml-4 h-10 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl shadow-lg animate-in zoom-in-50 duration-300"
            >
              {isSaving ? <Save size={16} className="animate-spin" /> : <Save size={20} />}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 h-auto min-h-16 py-2 overflow-y-auto custom-scrollbar">
          {(isAdminMode ? editedSizes : sizes).map((size) => (
            <div key={size} className="relative group/size">
              <button 
                onClick={() => setSelectedSize(size)} 
                className={`h-8 px-2.5 rounded-md text-[9px] font-black border transition-all ${selectedSize === size ? 'bg-black border-black text-white' : 'bg-bg-color border-transparent text-text-muted hover:border-black/10'}`}
              >
                {size}
              </button>
              {isAdminMode && (
                <button 
                  onClick={() => removeSize(size)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/size:opacity-100 transition-all shadow-sm"
                >
                  <X size={10} strokeWidth={4} />
                </button>
              )}
            </div>
          ))}
          {isAdminMode && (
            <button 
              onClick={addSize}
              className="h-8 w-8 rounded-md bg-orange-50 text-orange-500 border border-dashed border-orange-300 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        <button onClick={handleAdd} disabled={!selectedSize} className={`btn-primary w-full h-12 uppercase text-[10px] tracking-[0.2em] shadow-sm disabled:opacity-20 ${isAdded ? 'bg-green-600' : ''}`}>
          {isAdded ? <Check size={16} /> : <Plus size={16} />} 
          <span>{isAdded ? 'Agregado' : 'Subir al Carrito'}</span>
        </button>
      </div>
    </div>
  )
}
