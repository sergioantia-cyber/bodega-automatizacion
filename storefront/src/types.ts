export interface Producto {
  id: string
  nombre: string
  descripcion: string
  referencia: string
  precio_venta: number
  costo_compra: number
  stock_actual: number
  imagen_url: string
  categoria: string
  activo: boolean
  created_at?: string
  genero?: string
  talla?: string
  color?: string
  linea_diseno?: string
}

export interface CartItem extends Producto {
  quantity: number
  selectedSize: string
  referenceCode?: string
}

export interface OrderDetails {
  customerName: string
  customerPhone?: string
  address?: string
  phone?: string
  paymentMethod?: string
  notes?: string
}
