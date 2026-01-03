import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listPresales() {
  const { data, error } = await supabase.from('presales').select('id, project_name, status, chain, created_at');
  if (error) {
    console.error('Error:', error.message);
  } else {
    data.forEach(row => {
        console.log(`ID: ${row.id} | Name: ${row.project_name} | Status: ${row.status} | Chain: ${row.chain}`);
    });
  }
}
listPresales();
