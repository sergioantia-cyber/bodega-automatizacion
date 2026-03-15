# Sistema POS y Gestión de Inventario Móvil (Ureña)

Este es el repositorio del proyecto diseñado para el minimarket en Ureña, estructurado en base al plan aprobado.

## Estructura del Proyecto

*   `/backend`: Contiene el esquema SQL `schema.sql` para Inicializar en Supabase.
*   `/scripts`: Contiene el script `abc_classification.py` para la lógica automatizada (Regla 80/20 de inventario).
*   `/frontend`: Código base de la aplicación móvil (Flutter).

## Requisitos Previos

Para ejecutar la aplicación móvil y el backend:

1.  **Supabase:** Crea una cuenta en [supabase.com](https://supabase.com).
2.  **Flutter SDK:** Es necesario instalar Flutter en Windows. Descárgalo desde [flutter.dev](https://flutter.dev/docs/get-started/install/windows).
3.  **Python 3.x:** (Ya deberías tenerlo).
    *   Instala la librería de Supabase para Python: `pip install supabase`

## Pasos para Inicializar (Fase 1)

1.  **Configurar Base de Datos:** Ve a tu proyecto de Supabase -> **SQL Editor** y pega todo el contenido de `backend/schema.sql`.
2.  **Configurar App Móvil:**
    *   Abre una terminal en la carpeta `/frontend`.
    *   Ejecuta `flutter pub get` (una vez que Flutter esté instalado).
    *   Configura las variables de entorno `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el archivo principal de Flutter.
    *   Conecta un teléfono Android por USB (modo depuración activado) y ejecuta: `flutter run`.
3.  **Configurar Script ABC:**
    *   Configura las variables de entorno `SUPABASE_URL` y `SUPABASE_KEY` (usar service_role key) en tu entorno o en el script `scripts/abc_classification.py`.
    *   Puedes ejecutar este script manualmente (`python abc_classification.py`) o configurar una tarea programada en tu servidor.

## Arquitectura Elegida

*   **Flutter (UI/App Móvil):** Alto rendimiento, escalable y excelente manejo de hardware (escáner USB/Cámara).
*   **Supabase (BaaS):** Control offline y real-time robusto, base de datos PostgreSQL, sin costos iniciales altos.
*   **Python:** Mantenimiento de algoritmos backend como la rotación de inventarios y posterior integración de SENIAT.
