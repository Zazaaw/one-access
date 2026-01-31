const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const publicClient = createClient(supabaseUrl, supabaseKey);
const adminClient = createClient(supabaseUrl, serviceKey);

async function testFetch() {
    console.log("1. Testing Admin Fetch (Bypassing RLS)...");
    const { data: adminData, error: adminError } = await adminClient
        .from('subjects')
        .select('*')
        .limit(1);

    if (adminError) console.error("Admin Fetch Error:", adminError);
    else console.log("Admin Fetch Success. Count:", adminData.length);

    console.log("2. Testing Public Fetch (Checking RLS)...");
    // Public fetch on 'subjects' usually requires authentication or public policy.
    // Let's try without auth first (should likely fail or return 0 if no public access).

    const { data: publicData, error: publicError } = await publicClient
        .from('subjects')
        .select('*')
        .limit(1);

    if (publicError) console.error("Public Fetch Error:", publicError);
    else console.log("Public Fetch Result (No Auth):", publicData.length);

    // Note: We can't easily test "Authenticated Fetch" in a script without signing in a user.
    // But if Public Fetch implies "Loading..." on the client forever, it might be weird.
    // Usually RLS returns error fast.
}

testFetch();
