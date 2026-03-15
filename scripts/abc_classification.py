import os
import datetime
from supabase import create_client, Client

# Configurar Supabase CLI o Env Vars
SUPABASE_URL = os.environ.get("SUPABASE_URL", "TU_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "TU_SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def calcular_clasificacion_abc():
    """
    Clasifica los productos en A (80%), B (15%), C (5%) según ingresos.
    """
    print("Iniciando clasificación ABC...")
    
    # Obtener todas las ventas y sus items
    # En un entorno real, filtramos a los últimos 30 días
    response = supabase.table("ventas_items").select("id_producto, cantidad, precio_unitario").execute()
    items = response.data
    
    ingresos_por_producto = {}
    total_ingresos = 0.0
    
    for item in items:
        pid = item['id_producto']
        ingreso = item['cantidad'] * item['precio_unitario']
        ingresos_por_producto[pid] = ingresos_por_producto.get(pid, 0.0) + ingreso
        total_ingresos += ingreso
        
    if total_ingresos == 0:
        print("No hay ventas para clasificar.")
        return

    # Ordenar productos de mayor a menor ingreso
    productos_ordenados = sorted(ingresos_por_producto.items(), key=lambda x: x[1], reverse=True)
    
    acumulado = 0.0
    actualizaciones = []
    
    for pid, ingreso in productos_ordenados:
        acumulado += ingreso
        porcentaje = acumulado / total_ingresos
        
        if porcentaje <= 0.80:
            categoria = 'A'
        elif porcentaje <= 0.95:
            categoria = 'B'
        else:
            categoria = 'C'
            
        actualizaciones.append({'id': pid, 'categoria_abc': categoria})
        
    # Actualizar en batch en Supabase
    for batch in [actualizaciones[i:i+50] for i in range(0, len(actualizaciones), 50)]:
        # Upsert o updates individuales
        for prod in batch:
            supabase.table("productos").update({"categoria_abc": prod['categoria_abc']}).eq("id", prod['id']).execute()

    print(f"Clasificación ABC finalizada para {len(actualizaciones)} productos.")

if __name__ == "__main__":
    calcular_clasificacion_abc()
