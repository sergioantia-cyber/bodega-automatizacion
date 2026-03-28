-- 1. Añadir la columna negocio
ALTER TABLE productos ADD COLUMN negocio TEXT DEFAULT 'MINIMARKET';

-- 2. Actualizar productos existentes según categorías
-- Calzado, Ropa, Teléfonos son del Storefront
UPDATE productos 
SET negocio = 'STOREFRONT' 
WHERE categoria IN ('Calzado', 'Ropa', 'Teléfonos', 'Accesorios', 'Sistema');

-- 3. Los demás se quedan como MINIMARKET (Bodega)
-- Nota: Puedes ajustar esto manualmente en Supabase si hay excepciones.
