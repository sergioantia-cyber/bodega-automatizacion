import { JSDOM } from 'jsdom';
import * as fs from 'fs';

const html = fs.readFileSync('temu_test_shoes.html', 'utf-8');
const doc = new JSDOM(html).window.document;

const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
const metaPrice = doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content')
const ldJsonList = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
  .map(s => { try { return JSON.parse(s.textContent || '{}') } catch { return {} } })

const ldJson = ldJsonList.find(j => j.name || j.offers)

let nombre = ogTitle || ldJson?.name || doc.querySelector('h1')?.textContent || "Producto Temu"
nombre = nombre.replace(/ \| Temu.*/, '').replace(/Temu.*/, '').trim()
if (nombre.length > 70) nombre = nombre.substring(0, 70)

let costoExtraido = 0;
let validOffers = Array.isArray(ldJson?.offers) ? ldJson.offers : (ldJson?.offers ? [ldJson.offers] : [])
let offerPrices = validOffers.map((o: any) => parseFloat(o.price || '0')).filter((p: number) => !isNaN(p) && p > 0)

if (offerPrices.length > 0) {
  costoExtraido = Math.max(...offerPrices);
  if (costoExtraido > 0 && costoExtraido < 2000) {
     costoExtraido = costoExtraido * 1000;
  }
} else {
  if (metaPrice) {
     costoExtraido = parseFloat(metaPrice);
     if (costoExtraido > 0 && costoExtraido < 2000) costoExtraido *= 1000;
  } else {
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
       costoExtraido = Math.max(...allPrices);
     }
  }
}

let imagenes: string[] = []
if (ldJson?.image) {
   const fromJson = Array.isArray(ldJson.image) ? ldJson.image : [ldJson.image]
   imagenes = fromJson.filter((img: any) => typeof img === 'string')
}

doc.querySelectorAll('img').forEach(img => {
   let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || ''
   if (src) {
     src = src.replace(/\\u002F/g, '/').replace(/\\/g, '')
     if (src.startsWith('//')) src = 'https:' + src
     if (src.includes('kwcdn.com') && !src.includes('50x50') && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon') && !src.includes('banner') && !imagenes.includes(src)) {
       imagenes.push(src)
     }
   }
})
imagenes = imagenes.slice(0, 8);

const sizePattern = /"propValueName":"([^"]+)"/g
let match;
const foundSizes: string[] = []
while ((match = sizePattern.exec(html)) !== null) {
  const val = match[1]
  if (val.length < 8 && (/\d/.test(val) || val.toUpperCase() === val)) {
    if (!foundSizes.includes(val)) foundSizes.push(val)
  }
}

const fullTextToScan = (nombre + " " + doc.body.textContent).toLowerCase()
const breadcrumbs = Array.from(doc.querySelectorAll('a, span, nav')).map(el => el.textContent?.toLowerCase() || '').join(' ')
const scanArea = (fullTextToScan + " " + breadcrumbs)

let inferredGen = ""
if (scanArea.includes("women's") || scanArea.includes("dama") || scanArea.includes("mujer") || scanArea.includes("female")) inferredGen = "Dama"
else if (scanArea.includes("men's") || scanArea.includes("caballero") || scanArea.includes("hombre") || scanArea.includes("male")) inferredGen = "Caballero"
else if (scanArea.includes("niño") || scanArea.includes("niña") || scanArea.includes("kids") || scanArea.includes("baby")) inferredGen = "Niño/a"
else if (scanArea.includes("unisex")) inferredGen = "Unisex"

let inferredCat = "Calzado"
if (scanArea.includes('telef') || scanArea.includes('celular') || scanArea.includes('iphone') || scanArea.includes('phone') || scanArea.includes('xiaomi')) inferredCat = "Teléfonos"
else if (scanArea.includes('jean') || scanArea.includes('camis') || scanArea.includes('ropa') || scanArea.includes('chaqueta') || scanArea.includes('clothing') || scanArea.includes('vestido')) inferredCat = "Ropa"
else if (scanArea.includes('bolso') || scanArea.includes('reloj') || scanArea.includes('collar') || scanArea.includes('accessories')) inferredCat = "Accesorios"

if (scanArea.includes('zapat') || scanArea.includes('tenis') || scanArea.includes('sneaker') || scanArea.includes('shoe') || scanArea.includes('bota') || scanArea.includes('calzado')) {
  inferredCat = "Calzado"
}

let inferredLine = ""
if (scanArea.includes('deport') || scanArea.includes('run') || scanArea.includes('sport') || scanArea.includes('gym')) inferredLine = "Deportivo"
else if (scanArea.includes('formal') || scanArea.includes('elegante') || scanArea.includes('business') || scanArea.includes('vestir')) inferredLine = "Formal"
else if (scanArea.includes('casual') || scanArea.includes('urbano') || scanArea.includes('street') || scanArea.includes('skate')) inferredLine = "Casual"

const importMargin = 40;
const product = {
  nombre: `Zapatos ${inferredLine ? inferredLine : inferredCat} ${inferredGen || 'Unisex'}`.replace(/\s+/g, ' ').trim(),
  descripcion: `Importado Automáticamente. Garantía de Calidad Ureña. | Link: test`,
  precio_venta: Math.round(costoExtraido * (1 + importMargin/100)),
  costo_compra: costoExtraido,
  imagenes: imagenes.length > 0 ? imagenes : ["https://placehold.co/800x800?text=No+Image"],
  talla: inferredCat === "Calzado" ? (foundSizes.length > 2 ? foundSizes.filter(s => /\d/.test(s)).join(', ') : "35, 36, 37, 38, 39, 40, 41, 42") : (foundSizes.join(', ') || "S, M, L, XL"),
  color: "Según Foto",
  categoria: inferredCat,
  genero: inferredGen,
  linea_diseno: inferredLine,
}
console.log(JSON.stringify(product, null, 2))
