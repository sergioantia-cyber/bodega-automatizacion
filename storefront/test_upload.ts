import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpload() {
  const fileContent = 'test'
  const fileName = `test_${Date.now()}.txt`
  
  console.log(`Trying to upload ${fileName} to bucket "productos"...`)
  
  const { data, error } = await supabase.storage.from('productos').upload(`catalogo/${fileName}`, fileContent)
  
  if (error) {
    console.error('Upload Failed:', JSON.stringify(error, null, 2))
  } else {
    console.log('Upload Succeeded:', data)
    const { data: urlData } = supabase.storage.from('productos').getPublicUrl(data.path)
    console.log('Public URL:', urlData.publicUrl)
  }
}

testUpload()
