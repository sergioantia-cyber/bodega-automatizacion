import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDelete() {
  console.log("Fetching 'Test Image' or 'ULTIMO NOCHE'...")
  const { data, error } = await supabase.from('productos').select('*').in('nombre', ['Test Image', 'ULTIMO NOCHE']).limit(2)
  if (error) {
     console.error("Select error:", error);
     return;
  }
  if (data && data.length > 0) {
    for (const p of data) {
        console.log(`Intentando borrar el producto "${p.nombre}" (ID: ${p.id})`)
        const { data: d2, error: e2 } = await supabase.from('productos').delete().eq('id', p.id).select()
        console.log('Borrado Result:', { borrados: d2?.length, error: e2 })
    }
  } else {
    console.log("No se encontraron los productos.")
  }
}

testDelete()
