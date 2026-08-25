require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// We can query pg_policies if we have the postgres connection string, but we only have anon key.
// We can use the supabase cli or psql if we had the db password, but we probably don't.
// Let's just create an RPC to fetch policies.

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function testRLS() {
    // try to insert a message with sender_id = '00000000...'
    const { data, error } = await supabase.from('messages').insert({
        conversation_id: '4e7145de-c750-4ad0-80dc-1dcc32ca2ada',
        sender_id: '00000000-0000-0000-0000-000000000000',
        receiver_id: '00000000-0000-0000-0000-000000000000',
        content: 'Test'
    });
    console.log("Insert 0000 error:", error);
}

testRLS();
