require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    console.log('Inspecting iam_applications table...');
    const { data, error } = await supabase
        .from('iam_applications')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching iam_applications:', error);
    } else {
        console.log('Sample row:', data);
    }
}

inspect();
