# Bodega Ureña - Sistema POS Móvil

Sistema Móvil de Punto de Venta (POS) y Gestión de Inventario para Minimarket, desarrollado con Flutter y Supabase.

## 🚀 Compilación del APK (Android)

Para generar una nueva versión del APK, sigue estos pasos:

1. **Incrementar la versión** en `pubspec.yaml` (ej. `version: 1.0.3+4`).
2. **Abrir la terminal** en la raíz del proyecto.
3. **Ejecutar el comando de limpieza** (opcional pero recomendado):
   ```sh
   flutter clean
   flutter pub get
   ```
4. **Construir el APK**:
   ```sh
   flutter build apk --release
   ```

El archivo resultante estará en:
`build/app/outputs/flutter-apk/app-release.apk`

---

## 🛠️ Tecnologías Principales
- **Flutter**: Interfaz de usuario multiplataforma.
- **Supabase**: Base de datos en tiempo real y autenticación.
- **Mobile Scanner**: Escaneo de códigos de barras.
- **Provider**: Gestión de estados.
