import { useState, useRef, useEffect } from 'react'
import { X, Plus, ShieldCheck, Loader2, Trash2, Edit3, Search, Clock, Bot, Sparkles, SlidersHorizontal, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Producto } from '../types'
import { compressImage } from '../lib/utils'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
  onAuthSuccess?: () => void
  isEditMode: boolean
  onToggleEditMode: () => void
}

export function AdminPanel({ isOpen, onClose, onRefresh, onAuthSuccess, isEditMode, onToggleEditMode }: AdminPanelProps) {
  const [pin, setPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPinError, setIsPinError] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'orders' | 'config' | 'import' | 'payments'>('create')
  const [existingProducts, setExistingProducts] = useState<Producto[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [inventorySearch, setInventorySearch] = useState('')
  const [sizeChartUrl, setSizeChartUrl] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  
  // Filtros de Inventario
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterGender, setFilterGender] = useState<string>('all')
  const [filterLine, setFilterLine] = useState<string>('all')

  const categoryPrefixes: Record<string, string> = {
    'Calzado': 'CA',
    'Ropa': 'RO',
    'Teléfonos': 'TE',
    'Accesorios': 'AC'
  }

  const genderPrefixes: Record<string, string> = {
    'Dama': 'F',
    'Caballero': 'M',
    'Niño/a': 'N',
    'Unisex': 'U'
  }

  const subCategories: Record<string, string[]> = {
    'Calzado': ['Deportivo', 'Casual', 'Formal'],
    'Teléfonos': ['Gama Baja', 'Gama Media', 'Gama Alta'],
    'Ropa': ['Camisas', 'Pantalones', 'Faldas', 'Shorts', 'Medias', 'Ropa Interior'],
    'Accesorios': []
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
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
    linea_diseno: '',
    referencia: ''
  })
  const [productFiles, setProductFiles] = useState<File[]>([])
  const [isGeneratingRef, setIsGeneratingRef] = useState(false)

  // ACTUALIZACIÓN DE REFERENCIAS EN VIVO
  useEffect(() => {
    if (!editingId && isOpen) {
      const generateRef = () => {
        setIsGeneratingRef(true)
        const catPre = categoryPrefixes[product.categoria] || (product.categoria || 'UN').slice(0, 2).toUpperCase()
        const genPre = genderPrefixes[product.genero] || 'U'
        
        const existingRandom = product.referencia.split('-').pop();
        const random = (existingRandom && existingRandom.length === 4 && !isNaN(parseInt(existingRandom)))
          ? existingRandom
          : Math.floor(1000 + Math.random() * 9000);

        const ref = `${catPre}-${genPre}-${random}`
        setProduct(prev => ({ ...prev, referencia: ref }))
        setTimeout(() => setIsGeneratingRef(false), 200)
      }
      generateRef()
    }
  }, [product.categoria, product.genero, editingId, isOpen])

  const [isSaving, setIsSaving] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importMargin, setImportMargin] = useState(40)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
      if (!isAuthenticated) return
      if (activeTab === 'manage') fetchExisting()
      if (activeTab === 'orders') fetchOrders()
      if (activeTab === 'config') fetchConfig()
      if (activeTab === 'payments') fetchPaymentMethods()
  }, [isAuthenticated, activeTab, isOpen])

  if (!isOpen) return null

  async function fetchConfig() {
    const { data } = await supabase.from('productos').select('*').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').maybeSingle()
    if (data) setSizeChartUrl(data.imagen_url || '')
  }

  async function saveConfig() {
    setIsSavingConfig(true)
    const { data: existing } = await supabase.from('productos').select('id').eq('categoria', 'Sistema').eq('nombre', 'Tabla de Tallas').maybeSingle()
    const payload = { nombre: 'Tabla de Tallas', categoria: 'Sistema', imagen_url: sizeChartUrl, activo: false }
    if (existing) await supabase.from('productos').update(payload).eq('id', existing.id)
    else await supabase.from('productos').insert([payload])
    alert('Guía de tallas actualizada')
    setIsSavingConfig(false)
  }

  async function fetchOrders() {
    setIsLoadingList(true)
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setIsLoadingList(false)
  }

  async function fetchExisting() {
    setIsLoadingList(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .neq('categoria', 'Sistema')
      .eq('activo', true)
      .eq('negocio', 'STOREFRONT')
      .order('created_at', { ascending: false })
    if (!error) setExistingProducts(data || [])
    setIsLoadingList(false)
  }

  async function fetchPaymentMethods() {
    const { data } = await supabase.from('metodos_pago').select('*').order('created_at', { ascending: true })
    if (data) setPaymentMethods(data)
  }

  async function deletePaymentMethod(id: string) {
    await supabase.from('metodos_pago').delete().eq('id', id)
    fetchPaymentMethods()
  }

  async function addPaymentMethod(banco: string, titular: string, qr_url: string) {
    if (!banco || !titular || !qr_url) return alert('Completa los campos')
    await supabase.from('metodos_pago').insert([{ banco, titular, qr_url }])
    fetchPaymentMethods()
  }

  function startEditing(p: Producto) {
    let pureDesc = p.descripcion || ''
    let tallaMatch = null
    let colorMatch = null

    if (p.descripcion) {
      const descParts = p.descripcion.split(' | ')
      pureDesc = descParts[0] || ''
      tallaMatch = p.descripcion.match(/Tallas: (.*?) \|/)
      colorMatch = p.descripcion.match(/Color: (.*)/)
    }

    setProduct({
      nombre: p.nombre,
      descripcion: pureDesc,
      precio_venta: p.precio_venta,
      costo_compra: p.costo_compra || 0,
      stock_actual: p.stock_actual || 0,
      imagenes: p.imagen_url ? (p.imagen_url.startsWith('[') ? JSON.parse(p.imagen_url) : [p.imagen_url]) : [],
      talla: tallaMatch?.[1] || p.talla || '',
      color: colorMatch?.[1] || p.color || '',
      categoria: p.categoria,
      genero: p.genero || 'Unisex',
      linea_diseno: p.linea_diseno || '',
      referencia: p.referencia
    })
    setEditingId(p.id)
    setProductFiles([])
    setActiveTab('create')
  }

  async function uploadImagesToStorage(files: File[], reference: string): Promise<string[]> {
    const publicUrls = []
    for (const file of files) {
      const compressed = await compressImage(file).catch(() => file)
      const fileName = `${reference}_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const { data, error } = await supabase.storage.from('productos').upload(`catalogo/${fileName}`, compressed)
      if (error) { 
        console.error('Upload Error:', error)
        continue 
      }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(data.path)
      if (urlData) publicUrls.push(urlData.publicUrl)
    }
    return publicUrls
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    const { error } = await supabase.from('pedidos').update({ estado: newStatus }).eq('id', id)
    if (!error) fetchOrders()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        const { error: updateError } = await supabase.from('productos').update({ activo: false }).eq('id', id)
        if (!updateError) {
          setExistingProducts(prev => prev.filter(p => p.id !== id))
          onRefresh()
          alert('Producto ocultado correctamente.')
        }
      } else {
        alert('Error al eliminar: ' + error.message)
      }
    } else {
      setExistingProducts(prev => prev.filter(p => p.id !== id))
      onRefresh()
      alert('Producto eliminado.')
    }
  }

  const performPinCheck = (e?: React.FormEvent, manualPin?: string) => {
    e?.preventDefault()
    const pinToVerify = manualPin !== undefined ? manualPin : pin
    if (pinToVerify === '0424') { 
      setIsAuthenticated(true)
      setIsPinError(false)
      onAuthSuccess?.()
    } 
    else { setIsPinError(true); setPin(''); setTimeout(() => setIsPinError(false), 2000); }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isConfig = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isConfig) setSizeChartUrl(reader.result as string)
        else {
          setProduct(prev => ({ ...prev, imagenes: [...prev.imagenes, reader.result as string].slice(0, 5) }))
          setProductFiles(prev => [...prev, file].slice(0, 5))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSave() {
    if (!product.nombre || product.precio_venta <= 0 || (product.imagenes.length === 0 && productFiles.length === 0) || !product.referencia) {
      alert('Completa los campos y añade fotos')
      return
    }

    setIsSaving(true)
    try {
      let finalImageUrls = product.imagenes.filter(url => url.startsWith('http'))
      if (productFiles.length > 0) {
        const uploaded = await uploadImagesToStorage(productFiles, product.referencia)
        finalImageUrls = [...finalImageUrls, ...uploaded]
      }

      const payload = {
        nombre: product.nombre,
        referencia: product.referencia,
        descripcion: `${product.descripcion} | Tallas: ${product.talla} | Color: ${product.color} | Segmento: ${product.genero}`,
        precio_venta: product.precio_venta,
        costo_compra: product.costo_compra,
        stock_actual: product.stock_actual,
        categoria: product.categoria,
        genero: product.genero,
        linea_diseno: product.linea_diseno,
        imagen_url: JSON.stringify(finalImageUrls),
        activo: true,
        negocio: 'STOREFRONT'
      }

      const { error } = editingId 
        ? await supabase.from('productos').update(payload).eq('id', editingId)
        : await supabase.from('productos').insert([payload])
      
      if (error) throw error

      alert(editingId ? 'Actualizado' : 'Publicado')
      
      setProduct({ 
        nombre: '', descripcion: '', precio_venta: 0, costo_compra: 0, stock_actual: 0, 
        imagenes: [], talla: '', color: '', categoria: 'Calzado', genero: 'Unisex', linea_diseno: '', referencia: '' 
      })
      setProductFiles([])
      setEditingId(null)
      onRefresh()
      setActiveTab('manage')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleImport() {
    if (!importUrl) return
    setIsImporting(true)
    try {
      const encodedUrl = encodeURIComponent(importUrl)
      const zenUrl = `/api/zenrows/v1/?apikey=9d2ee5c0d1887abd64980c00ff92c1cd87fce72d&url=${encodedUrl}&js_render=true&antibot=true&premium_proxy=true&proxy_country=co&wait=5000`
      const res = await fetch(zenUrl)
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      
      // 1. EXTRACCIÓN ROBUSTA DE METADATOS
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      const metaPrice = doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content')
      const ldJsonList = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .map(s => { try { return JSON.parse(s.textContent || '{}') } catch { return {} } })
      
      const ldJson = ldJsonList.find(j => j.name || j.offers)

      let nombre = ogTitle || ldJson?.name || doc.querySelector('h1')?.textContent || "Producto Temu"
      nombre = nombre.replace(/ \| Temu.*/, '').replace(/Temu.*/, '').trim()
      if (nombre.length > 70) nombre = nombre.substring(0, 70)

      // 2. PRECIO CON MARGEN
      let costoExtraido = 0;
      
      // Intentar JSON-LD primero, que contiene los precios REALES de cada variante (talla)
      let validOffers = Array.isArray(ldJson?.offers) ? ldJson.offers : (ldJson?.offers ? [ldJson.offers] : [])
      let offerPrices = validOffers.map((o: any) => parseFloat(o.price || '0')).filter((p: number) => !isNaN(p) && p > 0)
      
      if (offerPrices.length > 0) {
        costoExtraido = Math.max(...offerPrices); // Escoger el MAYOR precio de todas las tallas
        if (costoExtraido > 0 && costoExtraido < 2000) {
           costoExtraido = costoExtraido * 1000;
        }
      } else {
        // Fallback robusto
        if (metaPrice) {
           costoExtraido = parseFloat(metaPrice);
           if (costoExtraido > 0 && costoExtraido < 2000) costoExtraido *= 1000;
        } else {
           // Escaneo profundo limitando picos de valores tachados exhorbitantes
           const plainText = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' '); 
           const priceRegex = /(?:\$|COP|Est\.)\s*(\d{1,3}(?:[.,]\d{3})+)/gi;
           const allPrices: number[] = [];
           let pMatch;
           while ((pMatch = priceRegex.exec(plainText)) !== null) {
             const pStr = pMatch[1].replace(/[.,]/g, ''); 
             const pNum = parseInt(pStr, 10);
             if (pNum > 5000 && pNum < 300000) allPrices.push(pNum);
           }
           if (allPrices.length > 0) {
             costoExtraido = Math.max(...allPrices); // Escoger el mayor detectado de las tallas válidas
           }
        }
      }

      // 3. EXTRACCIÓN DE TODAS LAS IMÁGENES (Búsqueda Profunda)
      let imagenes: string[] = []
      
      if (ldJson?.image) {
         const fromJson = Array.isArray(ldJson.image) ? ldJson.image : [ldJson.image]
         imagenes = fromJson.filter((img: any) => typeof img === 'string')
      }

      // Búsqueda en etiquetas IMG del DOM (mucho más preciso)
      doc.querySelectorAll('img').forEach(img => {
         let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || ''
         if (src) {
           src = src.replace(/\\u002F/g, '/').replace(/\\/g, '')
           if (src.startsWith('//')) src = 'https:' + src
           // Evitar iconos y logos, retener fotos de productos estéticos
           if (src.includes('kwcdn.com') && !src.includes('50x50') && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon') && !src.includes('banner') && !imagenes.includes(src)) {
             imagenes.push(src)
           }
         }
      })

      // Limitar a máximo 8 imágenes
      imagenes = imagenes.slice(0, 8);

      // 4. EXTRACCIÓN DE TALLAS
      const sizePattern = /"propValueName":"([^"]+)"/g
      let match;
      const foundSizes: string[] = []
      while ((match = sizePattern.exec(html)) !== null) {
        const val = match[1]
        if (val.length < 8 && (/\d/.test(val) || val.toUpperCase() === val)) {
          if (!foundSizes.includes(val)) foundSizes.push(val)
        }
      }

      // 5. INTELIGENCIA DE GÉNERO (Breadcrumbs, Título y Tags)
      const fullTextToScan = (nombre + " " + doc.body.innerText).toLowerCase()
      const breadcrumbs = Array.from(doc.querySelectorAll('a, span, nav')).map(el => el.textContent?.toLowerCase() || '').join(' ')
      const scanArea = (fullTextToScan + " " + breadcrumbs)

      let inferredGen = ""
      if (scanArea.includes("women's") || scanArea.includes("dama") || scanArea.includes("mujer") || scanArea.includes("female")) inferredGen = "Dama"
      else if (scanArea.includes("men's") || scanArea.includes("caballero") || scanArea.includes("hombre") || scanArea.includes("male")) inferredGen = "Caballero"
      else if (scanArea.includes("niño") || scanArea.includes("niña") || scanArea.includes("kids") || scanArea.includes("baby")) inferredGen = "Niño/a"
      else if (scanArea.includes("unisex")) inferredGen = "Unisex"

      // 6. CATEGORÍA Y LÍNEA
      let inferredCat = "Calzado"
      if (scanArea.includes('telef') || scanArea.includes('celular') || scanArea.includes('iphone') || scanArea.includes('phone') || scanArea.includes('xiaomi')) inferredCat = "Teléfonos"
      else if (scanArea.includes('jean') || scanArea.includes('camis') || scanArea.includes('ropa') || scanArea.includes('chaqueta') || scanArea.includes('clothing') || scanArea.includes('vestido')) inferredCat = "Ropa"
      else if (scanArea.includes('bolso') || scanArea.includes('reloj') || scanArea.includes('collar') || scanArea.includes('accessories')) inferredCat = "Accesorios"
      
      // PRIORIDAD CALZADO: Si detecta palabras clave de zapatos, forzar Calzado
      if (scanArea.includes('zapat') || scanArea.includes('tenis') || scanArea.includes('sneaker') || scanArea.includes('shoe') || scanArea.includes('bota') || scanArea.includes('calzado')) {
        inferredCat = "Calzado"
      }

      let inferredLine = ""
      if (scanArea.includes('deport') || scanArea.includes('run') || scanArea.includes('sport') || scanArea.includes('gym')) inferredLine = "Deportivo"
      else if (scanArea.includes('formal') || scanArea.includes('elegante') || scanArea.includes('business') || scanArea.includes('vestir')) inferredLine = "Formal"
      else if (scanArea.includes('casual') || scanArea.includes('urbano') || scanArea.includes('street') || scanArea.includes('skate')) inferredLine = "Casual"

      // 7. ASIGNACIÓN FINAL
      setProduct({
        nombre: `Zapatos ${inferredLine ? inferredLine : inferredCat} ${inferredGen || 'Unisex'}`.replace(/\s+/g, ' ').trim(),
        descripcion: `Importado Automáticamente. Garantía de Calidad Ureña. | Link: ${importUrl}`,
        precio_venta: Math.round(costoExtraido * (1 + importMargin/100)),
        costo_compra: costoExtraido,
        stock_actual: 15,
        imagenes: imagenes.length > 0 ? imagenes : ["https://placehold.co/800x800?text=No+Image"],
        talla: inferredCat === "Calzado" ? (foundSizes.length > 2 ? foundSizes.filter(s => /\d/.test(s)).join(', ') : "35, 36, 37, 38, 39, 40, 41, 42") : (foundSizes.join(', ') || "S, M, L, XL"),
        color: "Según Foto",
        categoria: inferredCat,
        genero: inferredGen as any || 'Unisex',
        linea_diseno: inferredLine,
        referencia: "TMP-" + Math.floor(10000 + Math.random() * 90000)
      })

      setIsImporting(false)
      setActiveTab('create')
      alert("¡Importación Exitosa! Se detectó: " + (inferredGen || "Género por confirmar"))
    } catch (e: any) {
      alert("Error en el escaneo profundo: " + e.message)
      setIsImporting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/95 backdrop-blur-xl animate-in fade-in duration-500">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative bg-white border border-surface-container w-full max-w-sm rounded-[40px] shadow-2xl p-12 text-center space-y-10 animate-in zoom-in-95">
          <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center transition-all ${isPinError ? 'bg-red-50 text-red-600' : 'bg-bg-color text-black'}`}>
            <ShieldCheck size={48} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Administración</h3>
          <form onSubmit={performPinCheck}>
            <input 
              type="password" maxLength={4} autoFocus placeholder="••••" 
              className="w-full h-20 bg-bg-color rounded-2xl text-center text-5xl font-black outline-none focus:ring-2 focus:ring-black/5" 
              value={pin} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPin(val)
                if (val.length === 4) performPinCheck(undefined, val)
              }} 
            />
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-10">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full sm:h-[85vh] sm:rounded-[48px] shadow-2xl flex flex-col overflow-hidden">
        
        <div className="px-12 py-10 border-b border-surface-container/50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div className="flex gap-8 sm:gap-12 overflow-x-auto no-scrollbar">
            {[
              { id: 'create', label: editingId ? 'Editar' : 'Publicar' },
              { id: 'import', label: 'IA Bot' },
              { id: 'manage', label: 'Inventario' },
              { id: 'orders', label: 'Ventas' },
              { id: 'payments', label: 'Pagos QR' },
              { id: 'config', label: 'Ajustes' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'create') setEditingId(null) }} 
                className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative py-3 ${activeTab === tab.id ? 'text-black' : 'text-text-muted/40 hover:text-black'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full" />}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-bg-color rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'import' ? (
            <div className="p-12 space-y-12 max-w-4xl mx-auto pb-40">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center"><Bot size={40} /></div>
                <h2 className="text-4xl font-black tracking-tighter uppercase underline decoration-indigo-500/30">Extractor Inteligente</h2>
              </div>
              <div className="bg-bg-color/50 p-12 rounded-[48px] border border-surface-container space-y-8">
                <div className="flex items-center justify-between p-6 bg-white border border-surface-container rounded-3xl">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Modo Edición Profesional</p>
                      <p className="text-[9px] text-text-muted">Habilita edición directa de precio y tallas en la tienda</p>
                   </div>
                   <button 
                    onClick={onToggleEditMode} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] ${isEditMode ? 'bg-black text-white' : 'bg-bg-color text-text-muted hover:bg-black/5 hover:text-black'}`}
                  >
                    <Zap size={14} fill={isEditMode ? 'white' : 'none'} className="mr-1" />
                    {isEditMode ? 'Activado' : 'Desactivado'}
                  </button>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-4">Margen de Ganancia (%)</label>
                   <input type="number" value={importMargin} onChange={e => setImportMargin(parseInt(e.target.value))} className="w-full h-16 bg-white border border-surface-container rounded-2xl px-8" />
                </div>
                <input type="text" placeholder="Pega el link de Temu aqui..." className="w-full h-20 bg-white border border-surface-container rounded-3xl px-8" value={importUrl} onChange={e => setImportUrl(e.target.value)} />
                <button onClick={handleImport} disabled={isImporting} className="w-full h-20 bg-black text-white rounded-3xl font-black uppercase tracking-widest">{isImporting ? <Loader2 className="animate-spin mx-auto" /> : 'Sincronizar Producto'}</button>
              </div>
            </div>
          ) : activeTab === 'create' ? (
            <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-20 pb-40">
              <div className="space-y-12">
                <div className="bg-bg-color/30 p-10 rounded-[40px] relative">
                  {isGeneratingRef && <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 rounded-[40px] flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                  <p className="text-[10px] uppercase font-black text-text-muted/40 tracking-[0.4em] mb-2">Referencia de Pieza</p>
                  <p className="text-5xl font-black tracking-tighter">{product.referencia || '...'}</p>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Categoría</label>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(categoryPrefixes).map(cat => (
                      <button key={cat} onClick={() => setProduct({ ...product, categoria: cat })} className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${product.categoria === cat ? 'bg-black text-white' : 'bg-bg-color text-text-muted'}`}>{cat}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">Galería de Imágenes</label>
                   <div className="grid grid-cols-3 gap-4">
                     {product.imagenes.map((img, i) => (
                       <div key={i} className="aspect-[4/5] rounded-[24px] overflow-hidden relative group">
                         <img src={img} className="w-full h-full object-cover" />
                         <button onClick={() => setProduct(prev => ({ ...prev, imagenes: prev.imagenes.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><Trash2 /></button>
                       </div>
                     ))}
                     {product.imagenes.length < 5 && (
                       <button onClick={() => fileInputRef.current?.click()} className="aspect-[4/5] rounded-[24px] border-2 border-dashed border-surface-container flex flex-col items-center justify-center text-text-muted/20 hover:text-black hover:border-black transition-all">
                         <Plus size={32} />
                         <span className="text-[8px] font-black uppercase mt-2">Añadir</span>
                       </button>
                     )}
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-text-muted/40 ml-4">Nombre del Modelo</label>
                  <input type="text" className="w-full h-16 bg-bg-color/50 rounded-2xl px-6 font-bold" value={product.nombre} onChange={e => setProduct({ ...product, nombre: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2 relative">
                       <label className="text-[10px] font-black uppercase text-text-muted/40 ml-4 flex items-center justify-between">
                         PRECIO VENTA SUGERIDO
                         {product.costo_compra > 0 && <span className="text-[8px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full">+{importMargin}% MÁRGEN</span>}
                       </label>
                     <input type="number" className="w-full h-16 bg-bg-color/50 rounded-2xl px-6 font-bold" value={product.precio_venta || ''} onChange={e => setProduct({ ...product, precio_venta: parseFloat(e.target.value) })} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-text-muted/40 ml-4">Tallas</label>
                     <input type="text" className="w-full h-16 bg-bg-color/50 rounded-2xl px-6 font-bold" value={product.talla} onChange={e => setProduct({ ...product, talla: e.target.value })} />
                   </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-text-muted/40 ml-4">Segmento (Sexo)</label>
                  <div className="flex gap-2">
                    {['Dama', 'Caballero', 'Niño/a', 'Unisex'].map(g => (
                      <button key={g} onClick={() => setProduct({ ...product, genero: g })} className={`flex-1 h-12 rounded-xl text-[9px] font-black uppercase border-none ${product.genero === g ? 'bg-black text-white' : 'bg-bg-color text-text-muted'}`}>{g}</button>
                    ))}
                  </div>
                </div>

                {product.categoria && subCategories[product.categoria] && subCategories[product.categoria].length > 0 && (
                  <div className="space-y-4 animate-in slide-in-from-left-4">
                    <label className="text-[10px] font-black uppercase text-text-muted/40 ml-4">Línea de Diseño</label>
                    <div className="flex flex-wrap gap-2">
                      {subCategories[product.categoria].map(sc => (
                        <button key={sc} onClick={() => setProduct({ ...product, linea_diseno: sc })} className={`px-4 h-10 rounded-xl text-[8px] font-black uppercase ${product.linea_diseno === sc ? 'bg-black text-white' : 'bg-bg-color text-text-muted'}`}>{sc}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-10 sticky bottom-10 bg-white/80 backdrop-blur-md p-6 border border-surface-container rounded-[40px] shadow-2xl">
                  {editingId && <button onClick={() => { setEditingId(null); setProduct({ nombre: '', descripcion: '', precio_venta: 0, costo_compra: 0, stock_actual: 0, imagenes: [], talla: '', color: '', categoria: 'Calzado', genero: 'Unisex', linea_diseno: '', referencia: '' }) }} className="px-8 h-16 border rounded-2xl text-[9px] font-black uppercase">Cancelar</button>}
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px]">{isSaving ? <Loader2 className="animate-spin mx-auto" /> : (editingId ? 'Actualizar' : 'Confirmar Publicación')}</button>
                </div>
              </div>
            </div>
          ) : activeTab === 'manage' ? (
            <div className="p-12 space-y-12 pb-40">
              {isLoadingList && <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}
              <div className="relative sticky top-0 z-10 bg-white/90 backdrop-blur-md pb-4">
                <Search className="absolute left-6 top-5 opacity-20" size={18} />
                <input type="text" placeholder="Filtrar por nombre o referencia..." className="w-full h-14 bg-bg-color rounded-2xl pl-16 pr-6 font-bold" value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                 <SlidersHorizontal size={14} className="opacity-30 mr-2" />
                 <button onClick={() => {setFilterCategory('all'); setFilterLine('all')}} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterCategory === 'all' ? 'bg-black text-white' : 'bg-bg-color'}`}>Todos</button>
                 {Object.keys(categoryPrefixes).map(c => (
                   <button key={c} onClick={() => {setFilterCategory(c); setFilterLine('all')}} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterCategory === c ? 'bg-black text-white' : 'bg-bg-color'}`}>{c}</button>
                 ))}
                 <div className="w-[1px] h-6 bg-surface-container mx-2" />
                 <button onClick={() => setFilterGender('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterGender === 'all' ? 'bg-black text-white' : 'bg-bg-color'}`}>Sexos</button>
                 {['Dama', 'Caballero', 'Niño/a'].map(g => (
                   <button key={g} onClick={() => setFilterGender(g)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterGender === g ? 'bg-black text-white' : 'bg-bg-color'}`}>{g}</button>
                 ))}
              </div>
              
              {filterCategory !== 'all' && subCategories[filterCategory] && subCategories[filterCategory].length > 0 && (
                <div className="flex flex-wrap gap-2 items-center py-2 animate-in fade-in">
                  <Sparkles size={14} className="opacity-30 mr-2" />
                  <button onClick={() => setFilterLine('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterLine === 'all' ? 'bg-black text-white' : 'bg-bg-color'}`}>Todas las Líneas</button>
                  {subCategories[filterCategory].map(l => (
                    <button key={l} onClick={() => setFilterLine(l)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${filterLine === l ? 'bg-black text-white' : 'bg-bg-color'}`}>{l}</button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {existingProducts.filter(p => {
                  const mSearch = p.nombre.toLowerCase().includes(inventorySearch.toLowerCase()) || p.referencia.toLowerCase().includes(inventorySearch.toLowerCase())
                  const mCat = filterCategory === 'all' || p.categoria === filterCategory
                  const mGen = filterGender === 'all' || p.genero === filterGender
                  const mLine = filterLine === 'all' || p.linea_diseno === filterLine
                  return mSearch && mCat && mGen && mLine
                }).map(p => (
                  <div key={p.id} className="bg-white border rounded-[32px] p-6 flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-bg-color overflow-hidden">
                      <img src={p.imagen_url?.startsWith('[') ? JSON.parse(p.imagen_url)[0] : p.imagen_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase">{p.referencia}</span>
                        {p.linea_diseno && <span className="text-[8px] font-black text-black/30 uppercase">• {p.linea_diseno}</span>}
                      </div>
                      <p className="font-black text-base uppercase truncate">{p.nombre}</p>
                      <p className="text-[10px] text-text-muted/50 font-bold uppercase">Stock: {p.stock_actual} • {p.genero}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(p)} className="w-12 h-12 flex items-center justify-center bg-bg-color rounded-xl hover:bg-black hover:text-white transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
             <div className="p-12 space-y-6 pb-40">
               {isLoadingList && <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}
               {orders.length === 0 ? <p className="text-center py-20 opacity-20 font-black uppercase text-[10px] tracking-widest">Sin Ventas</p> : orders.map(o => (
                 <div key={o.id} className="bg-white border rounded-[32px] p-8 space-y-6">
                    <div className="flex justify-between font-black uppercase text-[10px] tracking-widest">
                       <span className="flex items-center gap-2"><Clock size={12} className="opacity-30" /> Ref: {o.id.slice(0,5)}</span>
                       <span className={o.estado === 'Completado' ? 'text-green-600' : 'text-yellow-600'}>{o.estado}</span>
                    </div>
                    <div className="space-y-2">
                       {o.items.map((it:any, i:number) => (
                         <div key={i} className="flex justify-between text-xs font-bold uppercase">{it.nombre} x{it.quantity} <span>COP {new Intl.NumberFormat('es-CO').format(it.precio_venta)}</span></div>
                       ))}
                    </div>
                    <div className="flex border-t pt-4 justify-between items-center">
                       <p className="text-2xl font-black">COP {new Intl.NumberFormat('es-CO').format(o.total)}</p>
                       <button onClick={() => updateOrderStatus(o.id, 'Completado')} className="px-6 h-10 bg-black text-white rounded-xl text-[9px] font-black uppercase">Completado</button>
                    </div>
                 </div>
               ))}
             </div>
          ) : activeTab === 'payments' ? (
            <div className="p-16 space-y-16 max-w-5xl mx-auto pb-40">
               <div className="space-y-4 text-center">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg"><ShieldCheck size={32} /></div>
                 <h2 className="text-4xl font-black tracking-tighter uppercase">Pagos QR</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-bg-color/50 p-8 rounded-[40px] space-y-6">
                     <input id="bank" type="text" placeholder="Banco" className="w-full h-14 bg-white rounded-xl px-6" />
                     <input id="holder" type="text" placeholder="Titular" className="w-full h-14 bg-white rounded-xl px-6" />
                     <button onClick={() => {
                       const i = document.createElement('input'); i.type='file'; i.onchange=(e:any)=>{
                         const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload=()=>(document.getElementById('savePay') as any).dataset.qr = r.result; r.readAsDataURL(f); }
                       }; i.click();
                     }} className="w-full h-14 border border-dashed border-emerald-500 rounded-xl text-[10px] font-black uppercase">Cargar QR</button>
                     <button id="savePay" onClick={() => {
                        const b=(document.getElementById('bank') as any).value;
                        const t=(document.getElementById('holder') as any).value;
                        const q=(document.getElementById('savePay') as any).dataset.qr;
                        addPaymentMethod(b, t, q);
                     }} className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black uppercase">Guardar</button>
                  </div>
                  <div className="space-y-4">
                    {paymentMethods.map(m => (
                      <div key={m.id} className="bg-white border p-4 rounded-2xl flex items-center gap-4">
                         <img src={m.qr_url} className="w-12 h-12 rounded-lg object-cover" />
                         <div className="flex-1">
                            <p className="font-black text-[10px] uppercase text-emerald-600">{m.banco}</p>
                            <p className="font-black text-sm uppercase">{m.titular}</p>
                         </div>
                         <button onClick={() => deletePaymentMethod(m.id)} className="text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-16 space-y-12 pb-40">
               <div className="flex justify-between items-center">
                 <div className="space-y-2">
                   <h2 className="text-4xl font-black uppercase">Ajustes</h2>
                   <p className="text-xs opacity-50">Configura los globales del sistema</p>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => {
                      const i = document.createElement('input'); i.type='file'; i.onchange=(e:any)=>{
                        const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload=()=>setSizeChartUrl(r.result as string); r.readAsDataURL(f); }
                      }; i.click();
                    }} className="h-12 px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase">Cargar Guía Tallas</button>
                    {sizeChartUrl && <button onClick={saveConfig} disabled={isSavingConfig} className="h-12 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">{isSavingConfig ? 'Sincronizando...' : 'Confirmar Guía'}</button>}
                 </div>
               </div>
               {sizeChartUrl && (
                 <div className="relative group rounded-[40px] overflow-hidden border bg-white p-8">
                   <img src={sizeChartUrl} className="w-full h-auto rounded-2xl shadow-inner" />
                 </div>
               )}
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => handleFileUpload(e, false)} />
      </div>
    </div>
  )
}
