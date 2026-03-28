
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('Checking schema for table "productos"...')
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error fetching data:', error)
  } else if (data && data.length > 0) {
    console.log('Columns found in first record:', Object.keys(data[0]))
  } else {
    // If no records exist, we might need another way to check schema.
    console.log('No data found in "productos" table to infer schema.')
  }
}

checkSchema()
