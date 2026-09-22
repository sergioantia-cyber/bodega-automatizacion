# 🏪 Bogad - Tu Bodega Digital (PWA Ultraligera)

PWA ultraligera, táctil y de alto rendimiento desarrollada con **Vite + React + TypeScript + Tailwind CSS**, siguiendo los principios del **Neo-brutalismo suave táctil 3D**. Cero librerías 3D pesadas (WebGL/Three.js) para preservar la batería y maximizar la fluidez móvil en dispositivos iOS y Android.

---

## ✨ Características Principales

- **Estilo Neo-brutalismo Suave Táctil 3D**:
  - Bordes negros limpios (`border-2 border-slate-900`)
  - Sombras sólidas táctiles (`shadow-[4px_4px_0px_#0F172A]`)
  - Micro-interacción de presión háptica al tacto (`active:translate-y-1 active:shadow-none transition-all duration-75`)
- **PWA Lista para Producción**:
  - Service Worker con auto-actualización y caché offline mediante Workbox.
  - Web App Manifest configurado (`standalone`, categoría de compras, iconos SVG escalables).
  - Compatible al 100% con **iOS Safari** (`apple-mobile-web-app-capable`, `apple-touch-icon`, `viewport-fit=cover`) y **Android Chrome** (evento `beforeinstallprompt`).
  - Modal interactivo de instalación nativa con guía visual para iPhone.
- **Mobile-First Real**:
  - Respeto de Safe Area Insets (`env(safe-area-inset-bottom)`).
  - Supresión de zoom accidental (`user-scalable=no`, `touch-action: manipulation`).
  - Navegación inferior ergonómica al alcance del pulgar.
- **Modo Claro / Oscuro Táctil**:
  - Paleta con fondo neutro limpio y botones con acentos vibrantes (*Electric Lime*, *Vibrant Yellow*, *Punchy Coral*).
- **Persistencia y Carrito Offline**:
  - Carrito local sincronizado en `localStorage`.
  - Envío de pedido directo a **WhatsApp** formateado.

---

## 📁 Estructura del Proyecto

```text
app bodega/
├── public/
│   ├── favicon.svg          # Favicon vectorial táctil
│   ├── pwa-192x192.svg      # Icono PWA para dispositivos móviles
│   └── pwa-512x512.svg      # Icono PWA de alta resolución y maskable
├── src/
│   ├── components/          # Componentes modulares
│   │   ├── ui/
│   │   │   ├── Badge.tsx         # Insignias táctiles
│   │   │   ├── Header.tsx        # Encabezado con estado offline y toggles
│   │   │   ├── TactileButton.tsx # Botón 3D táctil con compresión
│   │   │   └── TactileCard.tsx   # Tarjeta neo-brutalista elevada
│   │   ├── BottomNavigation.tsx  # Barra de navegación inferior mobile-first
│   │   ├── CartModal.tsx         # Drawer táctil de compras y checkout
│   │   ├── InstallPromptModal.tsx# Banner/Modal de instalación PWA (iOS/Android)
│   │   └── ProductCard.tsx       # Tarjeta de producto con adición rápida
│   ├── hooks/               # Custom Hooks
│   │   ├── useCart.ts            # Lógica reactiva y persistencia del carrito
│   │   └── usePWA.ts             # Detección de instalación, offline y prompt
│   ├── services/            # Servicios y lógica desacoplada
│   │   ├── pwaService.ts         # Integración con el navegador y Service Worker
│   │   ├── storageService.ts     # Almacenamiento seguro en LocalStorage
│   │   └── productData.ts        # Catálogo demo de productos y categorías
│   ├── types/               # Definiciones de TypeScript
│   │   └── index.ts              # Interfaces Product, Category, CartItem, etc.
│   ├── App.tsx              # Vista principal de Bogad
│   ├── index.css            # Setup de Tailwind y resets táctiles
│   ├── main.tsx             # Montaje y registro del Service Worker PWA
│   └── vite-env.d.ts        # Tipos de Vite y PWA
├── index.html               # Shell HTML con meta tags para iOS/Android
├── package.json             # Dependencias y scripts
├── tailwind.config.js       # Tokens de diseño neo-brutalista y sombras sólidas
├── tsconfig.json            # Configuración estricta de TypeScript
└── vite.config.ts           # Configuración de Vite con vite-plugin-pwa
```

---

## 🚀 Comandos Rápidos

### Desarrollo
```bash
npm run dev
```
Inicia el servidor local de desarrollo en `http://localhost:5173`.

### Construcción para Producción
```bash
npm run build
```
Compila TypeScript, empaqueta los assets optimizados en `/dist` y genera el Service Worker (`sw.js`) y `manifest.webmanifest`.

### Previsualización de Producción
```bash
npm run preview
```
Permite probar la PWA con Service Worker activo y modo offline idéntico a producción.
