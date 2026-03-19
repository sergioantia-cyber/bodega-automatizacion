export interface Producto {
  id: string
  nombre: string
  descripcion: string
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
}

export interface CartItem extends Producto {
  quantity: number
  selectedSize: string
}

export interface OrderDetails {
  customerName: string
  address: string
  phone: string
  notes?: string
}
