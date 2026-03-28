import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('Listing products...')
  const { data: products, error: pError } = await supabase.from('productos').select('nombre, genero, categoria, referencia').limit(20)
  if (pError) {
    console.error('Error fetching products:', pError)
  } else {
    console.log('Products:', JSON.stringify(products, null, 2))
  }

  console.log('\nListing files in bucket "productos/catalogo"...')
  const { data: files, error: fError } = await supabase.storage.from('productos').list('catalogo')
  if (fError) {
    console.error('Error listing files:', fError)
  } else {
    console.log('Files:', JSON.stringify(files, null, 2))
  }
}

check()
