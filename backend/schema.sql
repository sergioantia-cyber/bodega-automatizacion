-- Tabla de Productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_barras TEXT UNIQUE NOT NULL, -- EAN-13 / EAN-8
    nombre TEXT NOT NULL,
    precio_venta DECIMAL(12,2) NOT NULL,
    costo_compra DECIMAL(12,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    alerta_minima INT DEFAULT 5,
    categoria_abc CHAR(1) DEFAULT 'C', -- A, B o C
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total DECIMAL(12,2) NOT NULL,
    metodo_pago TEXT, -- Efectivo, Transferencia, Pago Móvil
    estado_sincronizacion TEXT DEFAULT 'pendiente', -- Para modo offline
    id_sesion_caja UUID
);

-- Detalle de Ventas
CREATE TABLE ventas_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_venta UUID REFERENCES ventas(id),
    id_producto UUID REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL
);

-- Control de Caja
CREATE TABLE sesiones_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cierre TIMESTAMP WITH TIME ZONE,
    monto_inicial DECIMAL(12,2),
    monto_final DECIMAL(12,2)
);

-- Foreign Keys Update
ALTER TABLE ventas ADD CONSTRAINT fk_sesion_caja FOREIGN KEY (id_sesion_caja) REFERENCES sesiones_caja(id);
