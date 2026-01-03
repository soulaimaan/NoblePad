import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  console.log('Fetching Noble Test...');
  const { data, error } = await supabase.from('presales').select('*').ilike('project_name', '%Noble Test%');
  
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('Project not found');
    return;
  }
  
  for (const item of data) {
    console.log(`Fixing ${item.project_name} (${item.id})...`);
    const { error: updateError } = await supabase.from('presales').update({
      chain_id: 31337
    }).eq('id', item.id);
    
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('✅ Successfully updated to Localhost (31337)');
    }
  }
}

fix();
