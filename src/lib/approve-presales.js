import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function approvePresales() {
  console.log('--- APPROVING PENDING PRESALES ---');
  const { data, error } = await supabase
    .from('presales')
    .update({ status: 'live' })
    .in('status', ['pending', 'pending_review', 'draft'])
    .select();
    
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Successfully approved ${data?.length || 0} presales.`);
    data?.forEach(p => console.log(`- ${p.project_name} (${p.id}) is now LIVE`));
  }
}
approvePresales();
