require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tecmgxmolzbehalzjyrf.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('No SUPABASE_ANON_KEY found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
  const { data, error } = await supabase.rpc('complete_job_and_review', {
    p_contract_id: '00000000-0000-0000-0000-000000000000',
    p_receiver_id: '00000000-0000-0000-0000-000000000000',
    p_rating: 5,
    p_comment: 'test',
    p_conversation_id: '00000000-0000-0000-0000-000000000000'
  });
  
  if (error) {
    console.error('RPC Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('RPC Success:', data);
  }
}

testRPC();
