import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugProducts() {
  const { data, error } = await supabase.from('productos').select('id, nombre, activo').order('created_at', { ascending: false }).limit(10)
  console.log("Top 10 productos:", data)
  
  if (data && data.length > 0) {
    const p = data[0];
    console.log(`Intentando borrar ${p.nombre} (${p.id}) vía delete()...`)
    const { data: dDelete, error: eDelete } = await supabase.from('productos').delete().eq('id', p.id).select()
    console.log("Delete result:", { deletedCount: dDelete?.length, error: eDelete })
  }
}

debugProducts()
