import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CustomerOrder, OrderStatus, StoreProfile, Product } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Verificar si las credenciales son válidas y no un placeholder
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('tu-proyecto')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (isSupabaseConfigured) {
  console.log('✅ Supabase conectado en tiempo real:', supabaseUrl);
} else {
  console.info('ℹ️ Modo Local Offline activo: Supabase no configurado o credenciales pendientes.');
}

/**
 * Servicio de sincronización en la nube para pedidos
 */
export const cloudOrderService = {
  async pushOrder(order: CustomerOrder): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('orders').upsert({
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        address: order.address,
        gps_location: order.gpsLocation,
        reference_notes: order.referenceNotes || null,
        items: order.items,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        created_at: order.createdAt
      });

      if (error) {
        console.warn('Error al enviar pedido a Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Excepción al sincronizar pedido en Supabase:', err);
      return false;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.warn('Error al actualizar estado en Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Excepción al actualizar estado en Supabase:', err);
      return false;
    }
  },

  async fetchRecentOrders(): Promise<CustomerOrder[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        address: row.address,
        gpsLocation: row.gps_location,
        referenceNotes: row.reference_notes || undefined,
        items: row.items,
        total: Number(row.total),
        paymentMethod: row.payment_method,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (err) {
      console.warn('Excepción al consultar pedidos de Supabase:', err);
      return null;
    }
  },

  subscribeToOrders(onNewOrUpdatedOrder: (order: CustomerOrder) => void): (() => void) | null {
    if (!supabase) return null;

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const row = payload.new as any;
          if (row && row.id) {
            const formatted: CustomerOrder = {
              id: row.id,
              orderNumber: row.order_number,
              customerName: row.customer_name,
              customerPhone: row.customer_phone,
              address: row.address,
              gpsLocation: row.gps_location,
              referenceNotes: row.reference_notes || undefined,
              items: row.items,
              total: Number(row.total),
              paymentMethod: row.payment_method,
              status: row.status,
              createdAt: row.created_at
            };
            onNewOrUpdatedOrder(formatted);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

/**
 * Servicio de sincronización en tiempo real para perfil y métodos de pago de la tienda
 */
export const cloudStoreService = {
  async pushStoreProfile(profile: StoreProfile): Promise<boolean> {
    if (!supabase) return false;
    try {
      // 1. Guardar en la base de datos de Supabase
      await supabase.from('store_profiles').upsert({
        id: profile.slug || 'default',
        name: profile.name,
        slogan: profile.slogan,
        icon_emoji: profile.iconEmoji,
        currency_symbol: profile.currencySymbol,
        whatsapp_number: profile.whatsappNumber,
        phone_display: profile.phoneDisplay,
        address: profile.address,
        schedule: profile.schedule,
        delivery_fee: profile.deliveryFee,
        catalog_url: profile.catalogUrl,
        pedigochos_phone: profile.pedigochosPhone,
        theme: profile.theme,
        payments: profile.payments,
        updated_at: new Date().toISOString()
      });

      // 2. Difusión inmediata a todos los celulares conectados
      const channel = supabase.channel('store_profile_sync');
      channel.send({
        type: 'broadcast',
        event: 'STORE_PROFILE_UPDATED',
        payload: profile
      });
      return true;
    } catch (err) {
      console.warn('Error al sincronizar perfil en la nube:', err);
      return false;
    }
  },

  async fetchStoreProfile(slug?: string): Promise<StoreProfile | null> {
    if (!supabase) return null;
    try {
      const targetId = slug || 'default';
      const { data, error } = await supabase
        .from('store_profiles')
        .select('*')
        .or(`id.eq.${targetId},id.eq.default`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        slug: data.id,
        name: data.name,
        slogan: data.slogan,
        iconEmoji: data.icon_emoji,
        currencySymbol: data.currency_symbol,
        whatsappNumber: data.whatsapp_number,
        phoneDisplay: data.phone_display,
        address: data.address,
        schedule: data.schedule,
        deliveryFee: Number(data.delivery_fee) || 2.00,
        catalogUrl: data.catalog_url,
        pedigochosPhone: data.pedigochos_phone || '573227949751',
        theme: data.theme,
        payments: data.payments
      };
    } catch {
      return null;
    }
  },

  subscribeToStoreProfile(onProfileUpdated: (profile: StoreProfile) => void): (() => void) | null {
    if (!supabase) return null;

    const channel = supabase
      .channel('store_profile_sync')
      .on('broadcast', { event: 'STORE_PROFILE_UPDATED' }, ({ payload }) => {
        if (payload && payload.payments) {
          onProfileUpdated(payload as StoreProfile);
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_profiles' },
        (payload) => {
          const row = payload.new as any;
          if (row && row.payments) {
            onProfileUpdated({
              slug: row.id,
              name: row.name,
              slogan: row.slogan,
              iconEmoji: row.icon_emoji,
              currencySymbol: row.currency_symbol,
              whatsappNumber: row.whatsapp_number,
              phoneDisplay: row.phone_display,
              address: row.address,
              schedule: row.schedule,
              deliveryFee: Number(row.delivery_fee) || 2.00,
              catalogUrl: row.catalog_url,
              pedigochosPhone: row.pedigochos_phone || '573227949751',
              theme: row.theme,
              payments: row.payments
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

/**
 * Servicio de sincronización en tiempo real para catálogo de productos e inventario
 */
export const cloudProductService = {
  async pushProducts(products: Product[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      // 1. Guardar en base de datos
      const rows = products.map(p => ({
        id: p.id,
        barcode: p.barcode || null,
        name: p.name,
        category: p.category,
        price: p.price,
        original_price: p.originalPrice || null,
        unit: p.unit || 'Unidad',
        image: p.image || null,
        tag: p.tag || null,
        in_stock: p.inStock,
        stock: p.stock,
        min_stock: p.minStock || 3
      }));
      await supabase.from('products').upsert(rows);

      // 2. Difusión inmediata a todos los clientes conectados
      const channel = supabase.channel('products_sync');
      channel.send({
        type: 'broadcast',
        event: 'PRODUCTS_UPDATED',
        payload: products
      });
      return true;
    } catch (err) {
      console.warn('Error al subir productos a la nube:', err);
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.warn('Error al eliminar producto en Supabase:', error.message);
        return false;
      }
      const channel = supabase.channel('products_sync');
      channel.send({
        type: 'broadcast',
        event: 'PRODUCTS_UPDATED',
        payload: await this.fetchProducts() || []
      });
      return true;
    } catch (err) {
      console.warn('Excepción al eliminar producto en Supabase:', err);
      return false;
    }
  },

  async fetchProducts(): Promise<Product[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((r: any) => ({
        id: r.id,
        barcode: r.barcode || undefined,
        name: r.name,
        category: r.category,
        price: Number(r.price),
        originalPrice: r.original_price ? Number(r.original_price) : undefined,
        unit: r.unit || 'Unidad',
        image: r.image || undefined,
        tag: r.tag || undefined,
        inStock: r.in_stock,
        stock: Number(r.stock) || 0,
        minStock: Number(r.min_stock) || 3
      }));
    } catch {
      return null;
    }
  },

  subscribeToProducts(onProductsUpdated: (products: Product[]) => void): (() => void) | null {
    if (!supabase) return null;

    const channel = supabase
      .channel('products_sync')
      .on('broadcast', { event: 'PRODUCTS_UPDATED' }, ({ payload }) => {
        if (payload && Array.isArray(payload)) {
          onProductsUpdated(payload as Product[]);
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const fresh = await cloudProductService.fetchProducts();
          if (fresh) onProductsUpdated(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};


