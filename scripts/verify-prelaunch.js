import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  console.log('🔍 Starting Pre-Launch Verification...');
  let errors = 0;

  // 1. Check Tables
  const requiredTables = ['presales', 'user_commitments', 'kyc_documents', 'admin_actions'];
  console.log('\n📊 Checking Tables...');
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ Table '${table}' missing or inaccessible: ${error.message}`);
      errors++;
    } else {
      console.log(`✅ Table '${table}' exists.`);
    }
  }

  // 2. Check "Noble Test" Project
  console.log('\n🧪 Checking "Noble Test" Configuration...');
  const { data: nobleTest, error: nobleError } = await supabase
    .from('presales')
    .select('*')
    .ilike('project_name', '%Noble Test%')
    .single();

  if (nobleError) {
    console.warn(`⚠️  Could not find 'Noble Test' project: ${nobleError.message} (This is okay if testing on a clean DB)`);
  } else {
    console.log(`ℹ️  Found Project: ${nobleTest.project_name} (${nobleTest.id})`);
    
    // Check Chain ID
    if (nobleTest.chain_id === 31337) {
      console.log('✅ Chain ID is correctly set to 31337 (Localhost).');
    } else {
      console.warn(`⚠️  Chain ID is ${nobleTest.chain_id}. Frontend override will handle this, but DB update recommended.`);
    }

    // Check Contract Address
    if (!nobleTest.contract_address) {
       console.error('❌ "Noble Test" missing contract address!');
       errors++;
    } else if (nobleTest.contract_address.trim() !== nobleTest.contract_address) {
       console.error('❌ "Noble Test" contract address has whitespace!');
       errors++;
    } else {
       console.log('✅ Contract address is clean.');
    }
  }

  console.log('\n' + '='.repeat(30));
  if (errors === 0) {
    console.log('🎉 VERIFICATION PASSED: Database looks healthy.');
  } else {
    console.log(`⚠️  VERIFICATION COMPLETED WITH ${errors} ERRORS.`);
  }
}

verify();
