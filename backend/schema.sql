-- ============================================
-- POS UREÑA - Schema Completo de Base de Datos
-- Supabase Project: unilnrmadkjhxweulbfw
-- ============================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PRODUCTOS
-- ============================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_barras TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT DEFAULT 'General',
    precio_venta DECIMAL(12,2) NOT NULL,
    costo_compra DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_actual INT DEFAULT 0,
    stock_maximo INT DEFAULT 100,
    alerta_minima INT DEFAULT 5,
    categoria_abc CHAR(1) DEFAULT 'C',
    imagen_url TEXT,
    talla TEXT,      -- Campo sugerido para zapatos
    color TEXT,      -- Campo sugerido para zapatos
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CLIENTES
-- ============================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    cedula TEXT UNIQUE,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    deuda DECIMAL(12,2) DEFAULT 0,
    puntos INT DEFAULT 0,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PROVEEDORES
-- ============================================
CREATE TABLE proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    categoria TEXT,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. SESIONES DE CAJA
-- ============================================
CREATE TABLE sesiones_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cierre TIMESTAMP WITH TIME ZONE,
    monto_inicial DECIMAL(12,2) DEFAULT 0,
    monto_final DECIMAL(12,2),
    monto_esperado DECIMAL(12,2),
    diferencia DECIMAL(12,2),
    estado TEXT DEFAULT 'abierta',
    terminal TEXT DEFAULT 'T01',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. VENTAS
-- ============================================
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_venta SERIAL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    metodo_pago TEXT,
    estado TEXT DEFAULT 'completada',
    id_cliente UUID REFERENCES clientes(id),
    id_sesion_caja UUID REFERENCES sesiones_caja(id),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ITEMS DE VENTA (detalle)
-- ============================================
CREATE TABLE ventas_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_venta UUID REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto UUID REFERENCES productos(id),
    nombre_producto TEXT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. GASTOS
-- ============================================
CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL,
    descripcion TEXT,
    monto DECIMAL(12,2) NOT NULL,
    metodo_pago TEXT DEFAULT 'Efectivo',
    id_sesion_caja UUID REFERENCES sesiones_caja(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. MOVIMIENTOS DE CAJA
-- ============================================
CREATE TABLE movimientos_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_sesion_caja UUID REFERENCES sesiones_caja(id),
    tipo TEXT NOT NULL,
    concepto TEXT,
    monto DECIMAL(12,2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- Permitir lectura/escritura pública por ahora
-- (se restringirá cuando se implemente auth)
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Políticas temporales: acceso completo con anon key
CREATE POLICY "Acceso público productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público proveedores" ON proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público sesiones_caja" ON sesiones_caja FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público ventas_items" ON ventas_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público gastos" ON gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público movimientos_caja" ON movimientos_caja FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS DE PRUEBA - Productos iniciales
-- ============================================
INSERT INTO productos (nombre, codigo_barras, categoria, precio_venta, costo_compra, stock_actual, stock_maximo, alerta_minima) VALUES
('Harina PAN 1kg', '7591014100013', 'Alimentos', 1.20, 0.80, 45, 100, 10),
('Refresco Cola 2L', '7702004001023', 'Bebidas', 2.50, 1.60, 30, 60, 8),
('Jabón Azul', '7591010110014', 'Limpieza', 0.80, 0.45, 55, 80, 15),
('Arroz Premium 1kg', '7591014200010', 'Alimentos', 1.50, 0.95, 38, 80, 10),
('Aceite Vegetal 1L', '7592311001018', 'Alimentos', 3.20, 2.10, 22, 50, 8),
('Pasta Larga 500g', '7591014300017', 'Alimentos', 0.90, 0.55, 60, 100, 15),
('Leche Entera 1L', '7702001001012', 'Lácteos', 1.80, 1.20, 25, 40, 5),
('Café Molido 250g', '7591010220011', 'Bebidas', 4.50, 2.80, 18, 30, 5),
('Azúcar 1kg', '7591014400014', 'Alimentos', 1.10, 0.70, 40, 80, 10),
('Margarina 500g', '7702004002012', 'Lácteos', 2.20, 1.40, 15, 30, 5);

-- Datos de prueba - Clientes
INSERT INTO clientes (nombre, cedula, telefono, deuda, puntos) VALUES
('Juan Pérez', 'V-12345678', '0414-1234567', 45500, 120),
('María García', 'V-98765432', '0412-9876543', 0, 340),
('Carlos Ureña', 'V-11223344', '0416-1122334', 12000, 85);

-- Datos de prueba - Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, categoria) VALUES
('Alpina S.A.', 'Sr. Rodríguez', '310 123 4567', 'Lácteos'),
('Distribuidora Ureña', 'Jenny López', '320 987 6543', 'General'),
('Cervecería Polar', 'Dpto. Ventas', '300 111 2233', 'Bebidas');
