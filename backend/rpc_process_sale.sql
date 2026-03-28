-- Función RPC para registrar una venta atómica
CREATE OR REPLACE FUNCTION process_sale_atomic(
  p_client_id UUID,
  p_subtotal DECIMAL,
  p_tax DECIMAL,
  p_total DECIMAL,
  p_payment_method TEXT,
  p_notes TEXT,
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Insertar la Venta y obtener el ID
  INSERT INTO ventas (id_cliente, subtotal, impuesto, total, metodo_pago, notas, estado)
  VALUES (p_client_id, p_subtotal, p_tax, p_total, p_payment_method, p_notes, 'completada')
  RETURNING id INTO v_sale_id;

  -- 2. Procesar cada item del JSON
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Insertar item de venta
    INSERT INTO ventas_items (id_venta, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
    VALUES (
      v_sale_id, 
      (v_item->>'productId')::UUID, 
      v_item->>'productName', 
      (v_item->>'quantity')::INT, 
      (v_item->>'unitPrice')::DECIMAL, 
      (v_item->>'subtotal')::DECIMAL
    );

    -- Actualizar stock del producto
    UPDATE productos 
    SET stock_actual = stock_actual - (v_item->>'quantity')::INT
    WHERE id = (v_item->>'productId')::UUID;
  END LOOP;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
