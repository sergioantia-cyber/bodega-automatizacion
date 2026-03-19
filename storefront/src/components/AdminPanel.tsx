import { useState, useRef, useEffect } from 'react'
import { X, Plus, ShieldCheck, Link, Loader2, Trash2, Ruler, Hash } from 'lucide-react'
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
  const [isPinError, setIsPinError] = useState(false)
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
    referencia: ''
  })

  const [tempUrlInput, setTempUrlInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'manage') fetchExisting()
      if (activeTab === 'config') fetchConfig()
    }
  }, [isAuthenticated, activeTab])

  if (!isOpen) return null

  async function fetchConfig() {
    const { data } = await supabase.from('productos').select('*').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').single()
    if (data) setSizeChartUrl(data.imagen_url || '')
  }

  async function saveConfig() {
    setIsSavingConfig(true)
    const { data: existing } = await supabase.from('productos').select('id').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').single()
    const payload = { nombre: 'Tabla de Tallas', categoria: 'Sistema', imagen_url: sizeChartUrl, activo: false }
    if (existing) await supabase.from('productos').update(payload).eq('id', existing.id)
    else await supabase.from('productos').insert([payload])
    alert('Guía de tallas actualizada')
    setIsSavingConfig(false)
  }

  async function fetchExisting() {
    setIsLoadingList(true)
    const { data, error } = await supabase.from('productos').select('*').eq('categoria', 'Calzado').order('created_at', { ascending: false })
    if (!error) setExistingProducts(data || [])
    setIsLoadingList(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Deseas eliminar permanentemente esta publicación?')) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) { setExistingProducts(prev => prev.filter(p => p.id !== id)); onRefresh(); }
  }

  const performPinCheck = (e?: React.FormEvent, manualPin?: string) => {
    e?.preventDefault()
    const pinToVerify = manualPin !== undefined ? manualPin : pin
    if (pinToVerify === '0424') { setIsAuthenticated(true); setIsPinError(false); } 
    else { setIsPinError(true); setPin(''); setTimeout(() => setIsPinError(false), 2000); }
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

  async function handleSave() {
    if (!product.nombre || product.precio_venta <= 0 || product.imagenes.length === 0 || !product.referencia) {
      alert('Debes completar los campos marcados y añadir fotos')
      return
    }

    setIsSaving(true)
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
       const { genero, ...rest } = payload
       await supabase.from('productos').insert([rest])
    }
    
    alert('Publicado con éxito')
    setProduct({ nombre: '', descripcion: '', precio_venta: 0, costo_compra: 0, stock_actual: 0, imagenes: [], talla: '', color: '', categoria: 'Calzado', genero: 'Unisex', referencia: '' })
    setIsSaving(false); onRefresh(); setActiveTab('manage')
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={onClose} />
        <div className="relative bg-[#0A0A0A] border border-[#1A1A1A] w-full max-w-sm rounded-[32px] overflow-hidden">
          <div className="p-10 flex flex-col items-center gap-8 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isPinError ? 'bg-red-500/10 text-red-500' : 'bg-neonCyan/10 text-neonCyan'}`}><ShieldCheck size={40} /></div>
            <h3 className="text-xl font-black uppercase text-white">Seguridad Ureña</h3>
            <form onSubmit={performPinCheck} className="w-full">
              <input type="password" maxLength={4} autoFocus placeholder="••••" className={`w-full h-16 bg-[#050505] border rounded-2xl text-center text-4xl font-black tracking-[0.4em] outline-none ${isPinError ? 'border-red-500 text-red-500' : 'border-[#1A1A1A] text-white focus:border-neonCyan'}`} value={pin} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPin(val)
                if (val.length === 4) performPinCheck(undefined, val) 
              }} />
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-[#0D0D0D] border-t sm:border border-[#222] w-full max-w-2xl h-[90vh] sm:h-auto sm:rounded-3xl overflow-y-auto">
        <div className="p-8 border-b border-[#222] flex items-center justify-between sticky top-0 bg-[#0D0D0D] z-20">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('create')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'create' ? 'text-neonLime underline underline-offset-8 decoration-neonLime' : 'text-[#444]'}`}>Publicar</button>
            <button onClick={() => setActiveTab('manage')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'manage' ? 'text-neonCyan underline underline-offset-8 decoration-neonCyan' : 'text-[#444]'}`}>Inventario</button>
            <button onClick={() => setActiveTab('config')} className={`text-sm font-black uppercase tracking-widest ${activeTab === 'config' ? 'text-white underline underline-offset-8' : 'text-[#444]'}`}>Guía Tallas</button>
          </div>
          <button onClick={onClose} className="text-[#333] hover:text-white"><X size={24} /></button>
        </div>

        {activeTab === 'create' ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-neonCyan tracking-widest">Código Referencia</label>
                <div className="relative">
                  <input type="text" placeholder="Ej: 501" className="w-full h-12 bg-[#050505] border border-neonCyan/20 rounded-xl px-10 font-bold text-white outline-none focus:border-neonCyan" value={product.referencia} onChange={(e) => setProduct({ ...product, referencia: e.target.value })} />
                  <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neonCyan" />
                </div>
              </div>

              <label className="text-[10px] uppercase font-black text-[#555] tracking-widest">Fotos (Máx 5)</label>
              <div className="grid grid-cols-3 gap-2">
                {product.imagenes.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-white/5">
                    <img src={img} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-black">{i === 0 ? product.referencia : `${product.referencia}.${i}`}</div>
                    <button onClick={() => setProduct(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Trash2 size={16} /></button>
                  </div>
                ))}
                {product.imagenes.length < 5 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border border-dashed border-[#222] flex flex-col items-center justify-center text-[#333] hover:text-neonLime"><Plus size={16} /><span className="text-[8px] font-black uppercase">Subir</span></button>
                )}
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="Pega link..." className="flex-1 h-10 bg-[#050505] border border-white/5 rounded-xl px-4 text-[10px] font-bold text-white" value={tempUrlInput} onChange={(e) => setTempUrlInput(e.target.value)} />
                <button onClick={() => { if (tempUrlInput && product.imagenes.length < 5) { setProduct(prev => ({ ...prev, imagenes: [...prev.imagenes, tempUrlInput] })); setTempUrlInput(''); } }} className="w-10 h-10 bg-neonCyan/10 border border-neonCyan/20 rounded-xl flex items-center justify-center text-neonCyan hover:bg-neonCyan hover:text-black"><Link size={16} /></button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <input type="text" placeholder="Nombre Modelo" className="h-12 bg-[#050505] border border-white/5 rounded-xl px-4 font-bold text-white outline-none" value={product.nombre} onChange={(e) => setProduct({ ...product, nombre: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio $" className="h-12 bg-[#050505] border border-white/5 rounded-xl px-4 font-bold text-neonLime outline-none" value={product.precio_venta || ''} onChange={(e) => setProduct({ ...product, precio_venta: parseFloat(e.target.value) })} />
                <input type="text" placeholder="36,37..." className="h-12 bg-[#050505] border border-white/5 rounded-xl px-4 font-bold text-white outline-none" value={product.talla} onChange={(e) => setProduct({ ...product, talla: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Dama', 'Caballero', 'Niño/a', 'Unisex'].map(g => (
                  <button key={g} type="button" onClick={() => setProduct({ ...product, genero: g })} className={`h-10 rounded-lg text-[10px] font-black uppercase border transition-all ${product.genero === g ? 'bg-neonLime border-neonLime text-black font-black' : 'bg-[#111] border-white/5 text-[#555]'}`}>{g}</button>
                ))}
              </div>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="mt-auto h-16 w-full bg-neonLime text-black font-black uppercase rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(204,255,0,0.2)]"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                Publicar Ahora
              </button>
            </div>
          </div>
        ) : activeTab === 'manage' ? (
          <div className="p-8 flex flex-col gap-3 pb-32">
            {isLoadingList ? <Loader2 className="animate-spin mx-auto text-neonCyan" /> : existingProducts.length === 0 ? <p className="text-center py-20 text-[#333] font-bold uppercase tracking-widest text-xs">Inventario Vacío</p> : existingProducts.map(p => (
              <div key={p.id} className="bg-[#0D0D0D] p-4 rounded-xl flex items-center gap-4 border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/5"><img src={p.imagen_url?.startsWith('[') ? JSON.parse(p.imagen_url)[0] : p.imagen_url} className="w-full h-full object-cover" /></div>
                <div className="flex-1 font-black uppercase text-xs truncate">{p.nombre}</div>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center gap-6">
            <h4 className="text-xl font-black uppercase text-white">Guía Global de Tallas</h4>
            <div className="w-full max-w-sm aspect-[4/3] rounded-3xl border border-dashed border-[#222] bg-[#070707] flex items-center justify-center overflow-hidden">
              {sizeChartUrl ? <img src={sizeChartUrl} className="w-full h-full object-contain" /> : <button onClick={() => configFileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-[#333] font-black uppercase text-xs"><Ruler size={32}/><br/>Subir Imagen</button>}
            </div>
            <button onClick={saveConfig} disabled={isSavingConfig || !sizeChartUrl} className="w-full h-14 bg-white text-black font-black uppercase rounded-xl flex items-center justify-center gap-2">
              {isSavingConfig ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
            </button>
            <input type="file" ref={configFileInputRef} hidden onChange={(e) => handleFileUpload(e, true)} />
          </div>
        )}
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
      </div>
    </div>
  )
}
