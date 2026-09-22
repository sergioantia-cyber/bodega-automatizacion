import { BrandPreset, StoreBrandTheme } from '../types';

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'yellow',
    name: 'Bodega Pop',
    tagline: 'Amarillo Clásico & Lima Neo-Brutal',
    primaryColor: '#FFE600',
    secondaryColor: '#D2FF00',
    accentColor: '#FF5C38',
    cyanColor: '#00F0FF'
  },
  {
    id: 'emerald',
    name: 'Minimarket Fresco',
    tagline: 'Verde Esmeralda & Menta Fresh',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    accentColor: '#F59E0B',
    cyanColor: '#06B6D4'
  },
  {
    id: 'blue',
    name: 'Supermercado Moderno',
    tagline: 'Azul Real & Celeste Neón',
    primaryColor: '#2563EB',
    secondaryColor: '#38BDF8',
    accentColor: '#EF4444',
    cyanColor: '#06B6D4'
  },
  {
    id: 'red',
    name: 'Express & Carnicería',
    tagline: 'Rojo Rubí & Naranja Fuego',
    primaryColor: '#E11D48',
    secondaryColor: '#FB923C',
    accentColor: '#84CC16',
    cyanColor: '#38BDF8'
  },
  {
    id: 'purple',
    name: 'Gourmet & Deli',
    tagline: 'Púrpura Real & Lavanda Chic',
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    accentColor: '#F43F5E',
    cyanColor: '#2DD4BF'
  },
  {
    id: 'orange',
    name: 'Abarrotes & Mercado',
    tagline: 'Naranja Cálido & Mostaza',
    primaryColor: '#EA580C',
    secondaryColor: '#FACC15',
    accentColor: '#22C55E',
    cyanColor: '#06B6D4'
  }
];

export const themeService = {
  getPresets(): BrandPreset[] {
    return BRAND_PRESETS;
  },

  getPresetById(id: string): BrandPreset | undefined {
    return BRAND_PRESETS.find(p => p.id === id);
  },

  applyTheme(theme: StoreBrandTheme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--color-bogad-yellow', theme.primaryColor);
    root.style.setProperty('--color-bogad-lime', theme.secondaryColor);
    root.style.setProperty('--color-bogad-coral', theme.accentColor);
    root.style.setProperty('--color-bogad-cyan', theme.cyanColor);

    // Actualizar meta theme-color para navegadores móviles y Android Status Bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primaryColor);
    }
  },

  init(defaultTheme?: StoreBrandTheme): void {
    if (defaultTheme) {
      this.applyTheme(defaultTheme);
      return;
    }

    try {
      const profileData = localStorage.getItem('bogad_store_profile');
      if (profileData) {
        const parsed = JSON.parse(profileData);
        if (parsed.theme) {
          this.applyTheme(parsed.theme);
          return;
        }
      }
    } catch {
      // Usar tema inicial
    }

    // Default: Bodega Pop
    this.applyTheme({
      presetId: 'yellow',
      primaryColor: '#FFE600',
      secondaryColor: '#D2FF00',
      accentColor: '#FF5C38',
      cyanColor: '#00F0FF'
    });
  }
};
