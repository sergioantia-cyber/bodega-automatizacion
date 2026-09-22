import { CartItem, Product, Customer, Sale, DailyClosingReport, StoreProfile, UserRole } from '../types';
import { INITIAL_PRODUCTS } from './productData';
import { INITIAL_CUSTOMERS } from './customerData';
import { BODEGA_CONFIG } from '../config/bodegaConfig';
import { storeService } from './storeService';
import { cloudStoreService, cloudProductService } from './supabaseClient';

const CART_STORAGE_KEY = 'bogad_cart_data';
const THEME_STORAGE_KEY = 'bogad_theme';
const PRODUCTS_STORAGE_KEY = 'bogad_products_data';
const CUSTOMERS_STORAGE_KEY = 'bogad_customers_data';
const SALES_STORAGE_KEY = 'bogad_sales_data';
const FAVORITES_STORAGE_KEY = 'bogad_favorite_products';
const CLOSINGS_STORAGE_KEY = 'bogad_daily_closings';
const DEBT_TEMPLATE_STORAGE_KEY = 'bogad_debt_template';

const DEFAULT_DEBT_TEMPLATE = `👋 Hola {nombre}, te saluda cordialmente {bodega}.
Te escribimos con aprecio para recordarte tu saldo pendiente de *${'{deuda}'}*.
Puedes cancelarlo con efectivo o mediante Yape/Plin al *{celular}*.
¡Muchas gracias por tu preferencia y que tengas un excelente día! 🏪✨`;

export const storageService = {
  // --- CARRITO ---
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage error
    }
  },

  // --- PRODUCTOS Y CONTROL DE STOCK ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      this.saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));

      // 1. Notificar en la misma ventana (catálogo del cliente)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bogad_products_updated', { detail: products }));

        // 2. Notificar a otras pestañas/ventanas con BroadcastChannel
        if ('BroadcastChannel' in window) {
          try {
            const prodChannel = new BroadcastChannel('bogad_products_channel');
            prodChannel.postMessage({ type: 'PRODUCTS_UPDATED', products });
            prodChannel.close();
          } catch {
            // Ignorar
          }
        }
      }

      // 3. Sincronizar en la nube con Supabase si está disponible
      cloudProductService.pushProducts(products).catch(() => {});
    } catch {
      // Storage error
    }
  },

  addProduct(product: Product): Product[] {
    const current = this.getProducts();
    const updated = [product, ...current];
    this.saveProducts(updated);
    return updated;
  },

  updateProduct(updatedProduct: Product): Product[] {
    const current = this.getProducts();
    const updated = current.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(productId: string): Product[] {
    const current = this.getProducts();
    const updated = current.filter(p => p.id !== productId);
    this.saveProducts(updated);
    cloudProductService.deleteProduct(productId).catch(() => {});
    return updated;
  },

  // Descontar stock tras una venta
  decrementStock(items: CartItem[]): Product[] {
    const products = this.getProducts();
    const updated = products.map((p) => {
      const soldItem = items.find((i) => i.product.id === p.id);
      if (soldItem) {
        const newStock = Math.max(0, p.stock - soldItem.quantity);
        return {
          ...p,
          stock: newStock,
          inStock: newStock > 0
        };
      }
      return p;
    });
    this.saveProducts(updated);
    return updated;
  },

  // --- PRODUCTOS FAVORITOS DEL CLIENTE ---
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(productId: string): string[] {
    const current = this.getFavorites();
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  },

  isFavorite(productId: string): boolean {
    return this.getFavorites().includes(productId);
  },

  // --- CLIENTES Y FIADOS ---
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      this.saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  saveCustomers(customers: Customer[]): void {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch {
      // Storage error
    }
  },

  updateCustomerDebt(customerId: string, amountChange: number): Customer[] {
    const customers = this.getCustomers();
    const today = new Date().toISOString().split('T')[0];
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          debt: Math.round((c.debt + amountChange) * 100) / 100,
          lastPaymentDate: today
        };
      }
      return c;
    });
    this.saveCustomers(updated);
    return updated;
  },

  addCustomer(customer: Customer): Customer[] {
    const current = this.getCustomers();
    const updated = [customer, ...current];
    this.saveCustomers(updated);
    return updated;
  },

  // --- PLANTILLA DE COBRANZA AMABLE ---
  getDebtTemplate(): string {
    try {
      return localStorage.getItem(DEBT_TEMPLATE_STORAGE_KEY) || DEFAULT_DEBT_TEMPLATE;
    } catch {
      return DEFAULT_DEBT_TEMPLATE;
    }
  },

  saveDebtTemplate(template: string): void {
    try {
      localStorage.setItem(DEBT_TEMPLATE_STORAGE_KEY, template);
    } catch {
      // Ignore
    }
  },

  // --- HISTORIAL DE VENTAS ---
  getSales(): Sale[] {
    try {
      const data = localStorage.getItem(SALES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordSale(sale: Sale): void {
    try {
      const sales = this.getSales();
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify([sale, ...sales.slice(0, 99)]));
    } catch {
      // Storage error
    }
  },

  // --- CIERRES DE CAJA DIARIOS (REPORTE Z) ---
  getDailyClosings(): DailyClosingReport[] {
    try {
      const data = localStorage.getItem(CLOSINGS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordDailyClosing(closing: DailyClosingReport): void {
    try {
      const closings = this.getDailyClosings();
      localStorage.setItem(CLOSINGS_STORAGE_KEY, JSON.stringify([closing, ...closings.slice(0, 29)]));
    } catch {
      // Storage error
    }
  },

  // --- TEMA ---
  getTheme(): 'light' | 'dark' {
    try {
      const theme = localStorage.getItem(THEME_STORAGE_KEY);
      if (theme === 'dark' || theme === 'light') return theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  },

  // --- PERFIL Y TELÉFONO DE LA BODEGA (MARCA BLANCA / MULTI-TENANT) ---
  getStoreProfile(): StoreProfile {
    try {
      const urlSlug = storeService.getStoreSlugFromUrl();
      const data = localStorage.getItem('bogad_store_profile');
      if (data) {
        const parsed = JSON.parse(data);
        const name = parsed.name || BODEGA_CONFIG.name;
        const resolvedSlug = urlSlug || storeService.cleanSlug(parsed.slug || name || BODEGA_CONFIG.slug || 'bodega-jl');
        
        let resolvedCatalogUrl = parsed.catalogUrl;
        if (!resolvedCatalogUrl || resolvedCatalogUrl.includes('.onrender.com')) {
          resolvedCatalogUrl = `https://${resolvedSlug}.onrender.com`;
        }

        return {
          ...BODEGA_CONFIG,
          ...parsed,
          name,
          slug: resolvedSlug,
          catalogUrl: resolvedCatalogUrl,
          pedigochosPhone: parsed.pedigochosPhone?.trim() || BODEGA_CONFIG.pedigochosPhone || '573227949751',
          theme: { ...BODEGA_CONFIG.theme, ...(parsed.theme || {}) },
          payments: {
            ...BODEGA_CONFIG.payments,
            ...(parsed.payments || {}),
            colombia: {
              ...BODEGA_CONFIG.payments.colombia,
              ...(parsed.payments?.colombia || {})
            },
            venezuela: {
              ...BODEGA_CONFIG.payments.venezuela,
              ...(parsed.payments?.venezuela || {})
            }
          }
        };
      }
      const defaultSlug = urlSlug || storeService.cleanSlug(BODEGA_CONFIG.name || BODEGA_CONFIG.slug || 'bodega-jl');
      return {
        ...BODEGA_CONFIG,
        slug: defaultSlug,
        catalogUrl: `https://${defaultSlug}.onrender.com`
      };
    } catch {
      return BODEGA_CONFIG;
    }
  },

  saveStoreProfile(profile: Partial<StoreProfile>): StoreProfile {
    try {
      const current = this.getStoreProfile();

      // Recalcular slug a partir del nombre de la tienda
      let newSlug = current.slug;
      if (profile.name && profile.name.trim()) {
        newSlug = storeService.cleanSlug(profile.name.trim());
      } else if (profile.slug && profile.slug.trim()) {
        newSlug = storeService.cleanSlug(profile.slug.trim());
      }

      // Si la URL del catálogo está vacía o es un dominio de render, actualizar automáticamente con el nuevo nombre
      let finalCatalogUrl = profile.catalogUrl !== undefined ? profile.catalogUrl.trim() : current.catalogUrl;
      if (!finalCatalogUrl || finalCatalogUrl.includes('.onrender.com')) {
        finalCatalogUrl = `https://${newSlug}.onrender.com`;
      }

      const updated: StoreProfile = {
        ...current,
        ...profile,
        slug: newSlug,
        catalogUrl: finalCatalogUrl,
        theme: profile.theme ? { ...current.theme, ...profile.theme } : current.theme,
        payments: profile.payments ? {
          ...current.payments,
          ...profile.payments,
          colombia: {
            ...current.payments.colombia,
            ...(profile.payments.colombia || {})
          },
          venezuela: {
            ...current.payments.venezuela,
            ...(profile.payments.venezuela || {})
          }
        } : current.payments
      };
      localStorage.setItem('bogad_store_profile', JSON.stringify(updated));

      // 1. Notificar en la misma ventana/pestaña
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bogad_store_profile_updated', { detail: updated }));
      }

      // 2. Notificar a otras pestañas/ventanas abiertas mediante BroadcastChannel
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const profileChannel = new BroadcastChannel('bogad_store_channel');
          profileChannel.postMessage({ type: 'STORE_PROFILE_UPDATED', profile: updated });
          profileChannel.close();
        } catch {
          // Ignorar
        }
      }

      // 3. Sincronizar en la nube con Supabase Realtime para clientes remotos
      cloudStoreService.pushStoreProfile(updated).catch(() => {});

      return updated;
    } catch {
      return BODEGA_CONFIG;
    }
  },

  // --- ROL DE USUARIO (DUEÑO / CLIENTE) ---
  getUserRole(): UserRole {
    return 'customer';
  },

  saveUserRole(_role: UserRole): void {
    // Modo seguro: Cada apertura de la app inicia siempre en catálogo oficial
  }
};
