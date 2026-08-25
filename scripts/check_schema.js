require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error querying worker_profiles:', error);
  } else if (data.length > 0) {
    console.log('Columns in worker_profiles:', Object.keys(data[0]));
  } else {
    console.log('No rows in worker_profiles');
  }
}

checkSchema();
