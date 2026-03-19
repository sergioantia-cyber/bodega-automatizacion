import { useState, useRef, useEffect } from 'react'
import { X, Plus, Package, Check, ShieldCheck, Upload, Link, Loader2, Trash2, Settings, List, Ruler, Hash } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Producto } from '../types'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function AdminPanel({ isOpen, onClose, onRefresh }: AdminPanelProps) {
  const [pin, setPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'config'>('create')
  const [existingProducts, setExistingProducts] = useState<Producto[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  
  const [sizeChartUrl, setSizeChartUrl] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const configFileInputRef = useRef<HTMLInputElement>(null)

  const [product, setProduct] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    costo_compra: 0,
    stock_actual: 0,
    imagenes: [] as string[],
    talla: '',
    color: '',
    categoria: 'Calzado',
    genero: 'Unisex',
    referencia: '' // NEW: Reference/Serial Number
  })

  const [tempUrl, setTempUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'manage') fetchExisting()
      if (activeTab === 'config') fetchConfig()
    }
  }, [isAuthenticated, activeTab])

  if (!isOpen) return null

  const fetchConfig = async () => {
    const { data } = await supabase.from('productos').select('*').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').single()
    if (data) setSizeChartUrl(data.imagen_url || '')
  }

  const saveConfig = async () => {
    setIsSavingConfig(true)
    const { data: existing } = await supabase.from('productos').select('id').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').single()
    const payload = { nombre: 'Tabla de Tallas', categoria: 'Sistema', imagen_url: sizeChartUrl, activo: false }
    if (existing) await supabase.from('productos').update(payload).eq('id', existing.id)
    else await supabase.from('productos').insert([payload])
    alert('Actualizado')
    setIsSavingConfig(false)
  }

  const fetchExisting = async () => {
    setIsLoadingList(true)
    const { data, error } = await supabase.from('productos').select('*').eq('categoria', 'Calzado').order('created_at', { ascending: false })
    if (!error) setExistingProducts(data || [])
    setIsLoadingList(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar?')) return
    await supabase.from('productos').delete().eq('id', id)
    setExistingProducts(prev => prev.filter(p => p.id !== id))
    onRefresh()
  }

  const handlePinSubmit = (e?: React.FormEvent, manualPin?: string) => {
    e?.preventDefault()
    const pinToVerify = manualPin !== undefined ? manualPin : pin
    if (pinToVerify === '0424') { setIsAuthenticated(true); setError(false); } 
    else { setError(true); setPin(''); setTimeout(() => setError(false), 2000); }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isConfig = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isConfig) setSizeChartUrl(reader.result as string)
        else setProduct(prev => ({ ...prev, imagenes: [...prev.imagenes, reader.result as string].slice(0, 5) }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!product.nombre || product.precio_venta <= 0 || product.imagenes.length === 0 || !product.referencia) {
      alert('Debes incluir Nombre, Precio, Referencia y al menos una foto')
      return
    }

    setIsSaving(true)
    // We add the reference to the description and as a field if supported
    const payload = {
      nombre: product.nombre,
      descripcion: `REF: ${product.referencia} | ${product.descripcion} | Tallas: ${product.talla} | Color: ${product.color} | Género: ${product.genero}`,
      precio_venta: product.precio_venta,
      costo_compra: product.costo_compra,
      stock_actual: product.stock_actual,
      categoria: 'Calzado',
      genero: product.genero,
      imagen_url: JSON.stringify(product.imagenes)
    }

    const { error } = await supabase.from('productos').insert([payload])
    if (error) {
       // Retry with minimal columns
       const { genero, ...rest } = payload
       await supabase.from('productos').insert([rest])
    }
    
    alert('Publicado con Referencia: ' + product.referencia)
    setProduct({ nombre: '', descripcion: '', precio_venta: 0, costo_compra: 0, stock_actual: 0, imagenes: [], talla: '', color: '', categoria: 'Calzado', genero: 'Unisex', referencia: '' })
    setIsSaving(false); onRefresh(); setActiveTab('manage')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-[#0A0A0A] border-t sm:border border-[#1A1A1A] w-full max-w-2xl h-[90vh] sm:h-auto sm:rounded-3xl overflow-y-auto">
        <div className="p-8 border-b border-[#1A1A1A] flex items-center justify-between sticky top-0 bg-[#0A0A0A] z-20">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('create')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'create' ? 'text-neonLime' : 'text-[#333]'}`}>Publicar</button>
            <button onClick={() => setActiveTab('manage')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'manage' ? 'text-neonCyan' : 'text-[#333]'}`}>Gestionar</button>
            <button onClick={() => setActiveTab('config')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'config' ? 'text-white underline decoration-neonCyan underline-offset-8' : 'text-[#333]'}`}>Tabla Tallas</button>
          </div>
          <button onClick={onClose} className="text-[#3A3A3A] hover:text-white"><X size={24} /></button>
        </div>

        {activeTab === 'create' ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-neonCyan tracking-widest pl-1">Código de Referencia / Serie</label>
                <div className="relative">
                  <input type="text" placeholder="Ej: 100" className="w-full h-12 bg-[#050505] border border-neonCyan/30 rounded-xl px-10 font-bold text-white outline-none focus:border-neonCyan" value={product.referencia} onChange={(e) => setProduct({ ...product, referencia: e.target.value })} />
                  <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neonCyan" />
                </div>
                <p className="text-[8px] text-[#444] font-bold uppercase mt-1">Variantes se guardarán como: {product.referencia || 'X'}, {product.referencia || 'X'}.1, {product.referencia || 'X'}.2...</p>
              </div>

              <label className="text-[10px] uppercase font-black text-[#555] tracking-widest">Fotos (Máx 5)</label>
              <div className="grid grid-cols-3 gap-2">
                {product.imagenes.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-[#1A1A1A]">
                    <img src={img} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-black text-white">{i === 0 ? product.referencia : `${product.referencia}.${i}`}</div>
                    <button onClick={() => setProduct(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={16} /></button>
                  </div>
                ))}
                {product.imagenes.length < 5 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border border-dashed border-[#222] flex flex-col items-center justify-center gap-1 text-[#333] hover:text-neonLime"><Plus size={16} /><span className="text-[8px] font-black uppercase">Subir</span></button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <input type="text" placeholder="Nombre Modelo" className="h-12 bg-[#050505] border border-[#1A1A1A] rounded-xl px-4 font-bold text-white outline-none" value={product.nombre} onChange={(e) => setProduct({ ...product, nombre: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio $" className="h-12 bg-[#050505] border border-[#1A1A1A] rounded-xl px-4 font-bold text-neonLime outline-none" value={product.precio_venta || ''} onChange={(e) => setProduct({ ...product, precio_venta: parseFloat(e.target.value) })} />
                <input type="text" placeholder="Tallas (36,37...)" className="h-12 bg-[#050505] border border-[#1A1A1A] rounded-xl px-4 font-bold text-white outline-none" value={product.talla} onChange={(e) => setProduct({ ...product, talla: e.target.value })} />
              </div>
              <button onClick={handleSave} className="h-16 bg-neonLime text-black font-black uppercase rounded-2xl shadow-xl">{isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Publicar con Serie'}</button>
            </div>
          </div>
        ) : activeTab === 'manage' ? (
          <div className="p-8 flex flex-col gap-3 pb-32">
            {isLoadingList ? <Loader2 className="animate-spin mx-auto" /> : existingProducts.map(p => (
              <div key={p.id} className="bg-[#0D0D0D] p-4 rounded-xl flex items-center gap-4 border border-[#1A1A1A]">
                <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/5"><img src={p.imagen_url?.startsWith('[') ? JSON.parse(p.imagen_url)[0] : p.imagen_url} className="w-full h-full object-cover" /></div>
                <div className="flex-1 font-black uppercase text-xs">{p.nombre}</div>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center gap-6">
            <h4 className="text-xl font-black uppercase text-white">Configuración</h4>
            <div className="w-full max-w-sm aspect-[4/3] rounded-3xl border border-[#1A1A1A] bg-[#070707] flex items-center justify-center overflow-hidden">
              {sizeChartUrl ? <img src={sizeChartUrl} className="w-full h-full object-contain" /> : <button onClick={() => configFileInputRef.current?.click()} className="flex flex-col items-center gap-2"><Ruler size={32}/><span className="text-[10px] uppercase font-black">Subir Tabla</span></button>}
            </div>
            <button onClick={saveConfig} className="w-full h-12 bg-white text-black font-black uppercase rounded-xl">Guardar</button>
            <input type="file" ref={configFileInputRef} hidden onChange={(e) => handleFileUpload(e, true)} />
          </div>
        )}
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
      </div>
    </div>
  )
}
